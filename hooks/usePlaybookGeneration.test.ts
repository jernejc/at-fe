import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePlaybookGeneration } from './usePlaybookGeneration';

// --- Mocks ---

const mockGenerateAsync = vi.fn();
vi.mock('@/lib/api', () => ({
  API_BASE: 'http://localhost:8000',
  generateCompanyPlaybookAsync: (...args: unknown[]) => mockGenerateAsync(...args),
}));

/** Captured EventSource instances for test control. */
let lastEventSource: MockEventSource;

class MockEventSource {
  url: string;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  close = vi.fn();

  constructor(url: string) {
    this.url = url;
    lastEventSource = this;
  }
}

vi.stubGlobal('EventSource', MockEventSource);

// --- Helpers ---

const DOMAIN = 'acme.com';
const PRODUCT_ID = 42;
const STREAM_URL = '/api/async/v1/tasks/abc-123/stream';
const STORAGE_KEY = `playbook-gen:${DOMAIN}:${PRODUCT_ID}`;

function makeApiResponse(overrides = {}) {
  return {
    task_id: 'abc-123',
    status: 'pending',
    poll_url: '/api/async/v1/tasks/abc-123/poll',
    stream_url: STREAM_URL,
    is_existing: false,
    ...overrides,
  };
}

function storePending() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ taskId: 'abc-123', streamUrl: STREAM_URL, domain: DOMAIN, productId: PRODUCT_ID }),
  );
}

/** Simulate an SSE message on the last created EventSource. */
function sendSSE(data: string | Record<string, unknown>) {
  const payload = typeof data === 'string' ? data : JSON.stringify(data);
  lastEventSource.onmessage?.({ data: payload });
}

// --- Tests ---

describe('usePlaybookGeneration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockGenerateAsync.mockResolvedValue(makeApiResponse());
  });

  // -- Initial state --

  it('returns idle state when no pending generation exists', () => {
    const { result } = renderHook(() =>
      usePlaybookGeneration({ domain: DOMAIN, productId: PRODUCT_ID, onComplete: vi.fn() }),
    );

    expect(result.current.isGenerating).toBe(false);
    expect(result.current.generationError).toBeNull();
  });

  it('does nothing when productId is null', () => {
    storePending();

    const { result } = renderHook(() =>
      usePlaybookGeneration({ domain: DOMAIN, productId: null, onComplete: vi.fn() }),
    );

    expect(result.current.isGenerating).toBe(false);
  });

  // -- Starting generation --

  it('calls async API and stores pending generation in localStorage', async () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      usePlaybookGeneration({ domain: DOMAIN, productId: PRODUCT_ID, onComplete }),
    );

    await act(async () => {
      await result.current.startGeneration();
    });

    expect(mockGenerateAsync).toHaveBeenCalledWith(DOMAIN, PRODUCT_ID);
    expect(result.current.isGenerating).toBe(true);

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored).toEqual({
      taskId: 'abc-123',
      streamUrl: STREAM_URL,
      domain: DOMAIN,
      productId: PRODUCT_ID,
    });
  });

  it('opens an EventSource connection with API_BASE prefix for relative URLs', async () => {
    const { result } = renderHook(() =>
      usePlaybookGeneration({ domain: DOMAIN, productId: PRODUCT_ID, onComplete: vi.fn() }),
    );

    await act(async () => {
      await result.current.startGeneration();
    });

    expect(lastEventSource.url).toBe(`http://localhost:8000${STREAM_URL}`);
  });

  it('uses full URL directly when stream_url is absolute', async () => {
    mockGenerateAsync.mockResolvedValue(
      makeApiResponse({ stream_url: 'https://api.example.com/stream/abc' }),
    );

    const { result } = renderHook(() =>
      usePlaybookGeneration({ domain: DOMAIN, productId: PRODUCT_ID, onComplete: vi.fn() }),
    );

    await act(async () => {
      await result.current.startGeneration();
    });

    expect(lastEventSource.url).toBe('https://api.example.com/stream/abc');
  });

  it('does not start if already generating', async () => {
    const { result } = renderHook(() =>
      usePlaybookGeneration({ domain: DOMAIN, productId: PRODUCT_ID, onComplete: vi.fn() }),
    );

    await act(async () => {
      await result.current.startGeneration();
    });

    mockGenerateAsync.mockClear();

    await act(async () => {
      await result.current.startGeneration();
    });

    expect(mockGenerateAsync).not.toHaveBeenCalled();
  });

  it('sets error and resets generating state when API call fails', async () => {
    mockGenerateAsync.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() =>
      usePlaybookGeneration({ domain: DOMAIN, productId: PRODUCT_ID, onComplete: vi.fn() }),
    );

    await act(async () => {
      await result.current.startGeneration();
    });

    expect(result.current.isGenerating).toBe(false);
    expect(result.current.generationError).toBe('Failed to generate playbook. Please try again.');
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  // -- SSE completion --

  it('clears localStorage and calls onComplete when SSE reports completion (JSON)', async () => {
    const onComplete = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      usePlaybookGeneration({ domain: DOMAIN, productId: PRODUCT_ID, onComplete }),
    );

    await act(async () => {
      await result.current.startGeneration();
    });

    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();

    await act(async () => {
      sendSSE({ type: 'complete', message: 'Done' });
    });

    expect(result.current.isGenerating).toBe(false);
    expect(onComplete).toHaveBeenCalledOnce();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(lastEventSource.close).toHaveBeenCalled();
  });

  it('handles status=completed JSON event', async () => {
    const onComplete = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      usePlaybookGeneration({ domain: DOMAIN, productId: PRODUCT_ID, onComplete }),
    );

    await act(async () => {
      await result.current.startGeneration();
    });

    await act(async () => {
      sendSSE({ status: 'completed' });
    });

    expect(onComplete).toHaveBeenCalledOnce();
    expect(result.current.isGenerating).toBe(false);
  });

  it('handles status=done JSON event', async () => {
    const onComplete = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      usePlaybookGeneration({ domain: DOMAIN, productId: PRODUCT_ID, onComplete }),
    );

    await act(async () => {
      await result.current.startGeneration();
    });

    await act(async () => {
      sendSSE({ status: 'done' });
    });

    expect(onComplete).toHaveBeenCalledOnce();
  });

  it('handles raw string "completed" message', async () => {
    const onComplete = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      usePlaybookGeneration({ domain: DOMAIN, productId: PRODUCT_ID, onComplete }),
    );

    await act(async () => {
      await result.current.startGeneration();
    });

    await act(async () => {
      sendSSE('completed');
    });

    expect(onComplete).toHaveBeenCalledOnce();
    expect(result.current.isGenerating).toBe(false);
  });

  // -- SSE error --

  it('sets error on SSE error event (JSON)', async () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      usePlaybookGeneration({ domain: DOMAIN, productId: PRODUCT_ID, onComplete }),
    );

    await act(async () => {
      await result.current.startGeneration();
    });

    await act(async () => {
      sendSSE({ type: 'error', error: 'Generation timed out' });
    });

    expect(result.current.isGenerating).toBe(false);
    expect(result.current.generationError).toBe('Generation timed out');
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('sets error on raw string containing "failed"', async () => {
    const { result } = renderHook(() =>
      usePlaybookGeneration({ domain: DOMAIN, productId: PRODUCT_ID, onComplete: vi.fn() }),
    );

    await act(async () => {
      await result.current.startGeneration();
    });

    await act(async () => {
      sendSSE('Processing failed unexpectedly');
    });

    expect(result.current.isGenerating).toBe(false);
    expect(result.current.generationError).toBe('Processing failed unexpectedly');
  });

  // -- Resuming from localStorage --

  it('resumes generation from localStorage on mount', () => {
    storePending();

    const { result } = renderHook(() =>
      usePlaybookGeneration({ domain: DOMAIN, productId: PRODUCT_ID, onComplete: vi.fn() }),
    );

    expect(result.current.isGenerating).toBe(true);
    expect(lastEventSource.url).toBe(`http://localhost:8000${STREAM_URL}`);
    // localStorage should still be present (not cleared until completion)
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
  });

  it('completes successfully after resuming from localStorage', async () => {
    storePending();
    const onComplete = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      usePlaybookGeneration({ domain: DOMAIN, productId: PRODUCT_ID, onComplete }),
    );

    expect(result.current.isGenerating).toBe(true);

    await act(async () => {
      sendSSE({ type: 'complete' });
    });

    expect(result.current.isGenerating).toBe(false);
    expect(onComplete).toHaveBeenCalledOnce();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  // -- Cleanup --

  it('closes EventSource on unmount but preserves localStorage', async () => {
    const { result, unmount } = renderHook(() =>
      usePlaybookGeneration({ domain: DOMAIN, productId: PRODUCT_ID, onComplete: vi.fn() }),
    );

    await act(async () => {
      await result.current.startGeneration();
    });

    const source = lastEventSource;
    unmount();

    expect(source.close).toHaveBeenCalled();
    // localStorage should persist so it can be resumed
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
  });

  // -- Progress messages (non-completion) --

  it('ignores progress messages that are not completion or error', async () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      usePlaybookGeneration({ domain: DOMAIN, productId: PRODUCT_ID, onComplete }),
    );

    await act(async () => {
      await result.current.startGeneration();
    });

    await act(async () => {
      sendSSE({ type: 'progress', status: 'running', message: 'Generating contacts...' });
    });

    expect(result.current.isGenerating).toBe(true);
    expect(onComplete).not.toHaveBeenCalled();
    expect(result.current.generationError).toBeNull();
  });
});
