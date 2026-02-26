import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCampaignSettings } from './useCampaignSettings';
import type { CampaignRead } from '@/lib/schemas';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockUpdateCampaign = vi.fn();
const mockDeleteCampaign = vi.fn();
vi.mock('@/lib/api', () => ({
  updateCampaign: (...args: any[]) => mockUpdateCampaign(...args),
  deleteCampaign: (...args: any[]) => mockDeleteCampaign(...args),
}));

const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();
vi.mock('sonner', () => ({
  toast: {
    success: (...args: any[]) => mockToastSuccess(...args),
    error: (...args: any[]) => mockToastError(...args),
  },
}));

const mockSetCampaign = vi.fn();
const mockUseCampaignDetail = vi.fn();
vi.mock('@/components/providers/CampaignDetailProvider', () => ({
  useCampaignDetail: () => mockUseCampaignDetail(),
}));

function makeCampaign(overrides: Partial<CampaignRead> = {}): CampaignRead {
  return {
    id: 1,
    name: 'Test Campaign',
    slug: 'test-campaign',
    description: null,
    icon: 'gem',
    owner: null,
    tags: [],
    target_criteria: null,
    target_product_id: null,
    status: 'draft',
    company_count: 10,
    processed_count: 5,
    avg_fit_score: null,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    ...overrides,
  };
}

function mockContext(campaign: CampaignRead | null = makeCampaign(), loading = false) {
  mockUseCampaignDetail.mockReturnValue({
    campaign,
    loading,
    setCampaign: mockSetCampaign,
    isPublishing: false,
    isUnpublishing: false,
    handlePublish: vi.fn(),
    handleUnpublish: vi.fn(),
    refreshData: vi.fn(),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockContext();
});

describe('useCampaignSettings — initial state', () => {
  it('derives name, icon, status, and slug from campaign', () => {
    const { result } = renderHook(() => useCampaignSettings());

    expect(result.current.slug).toBe('test-campaign');
    expect(result.current.name).toBe('Test Campaign');
    expect(result.current.icon).toBe('gem');
    expect(result.current.status).toBe('draft');
  });

  it('returns loading from context', () => {
    mockContext(null, true);
    const { result } = renderHook(() => useCampaignSettings());

    expect(result.current.loading).toBe(true);
  });

  it('returns defaults when campaign is null', () => {
    mockContext(null);
    const { result } = renderHook(() => useCampaignSettings());

    expect(result.current.slug).toBeNull();
    expect(result.current.name).toBe('');
    expect(result.current.icon).toBeNull();
    expect(result.current.status).toBe('draft');
  });
});

describe('useCampaignSettings — handleNameSave', () => {
  it('calls updateCampaign with slug and name then sets campaign', async () => {
    const updated = makeCampaign({ name: 'New Name' });
    mockUpdateCampaign.mockResolvedValue(updated);

    const { result } = renderHook(() => useCampaignSettings());
    await act(async () => {
      await result.current.handleNameSave('New Name');
    });

    expect(mockUpdateCampaign).toHaveBeenCalledWith('test-campaign', { name: 'New Name' });
    expect(mockSetCampaign).toHaveBeenCalledWith(updated);
    expect(mockToastSuccess).toHaveBeenCalledWith('Campaign name updated');
  });

  it('shows error toast when update fails', async () => {
    mockUpdateCampaign.mockRejectedValue(new Error('Server error'));

    const { result } = renderHook(() => useCampaignSettings());
    await act(async () => {
      await result.current.handleNameSave('New Name');
    });

    expect(mockToastError).toHaveBeenCalledWith('Failed to update name', {
      description: 'Server error',
    });
    expect(mockSetCampaign).not.toHaveBeenCalled();
  });

  it('does nothing when slug is null', async () => {
    mockContext(null);
    const { result } = renderHook(() => useCampaignSettings());

    await act(async () => {
      await result.current.handleNameSave('New Name');
    });

    expect(mockUpdateCampaign).not.toHaveBeenCalled();
  });

  it('sets isSavingName to true during save and false after', async () => {
    let resolve: (v: CampaignRead) => void;
    mockUpdateCampaign.mockReturnValue(new Promise<CampaignRead>((r) => { resolve = r; }));

    const { result } = renderHook(() => useCampaignSettings());
    let promise: Promise<void>;
    act(() => {
      promise = result.current.handleNameSave('New Name');
    });

    expect(result.current.isSavingName).toBe(true);

    await act(async () => {
      resolve!(makeCampaign({ name: 'New Name' }));
      await promise!;
    });

    expect(result.current.isSavingName).toBe(false);
  });
});

describe('useCampaignSettings — handleIconSave', () => {
  it('calls updateCampaign with slug and icon then sets campaign', async () => {
    const updated = makeCampaign({ icon: 'cat' });
    mockUpdateCampaign.mockResolvedValue(updated);

    const { result } = renderHook(() => useCampaignSettings());
    await act(async () => {
      await result.current.handleIconSave('cat');
    });

    expect(mockUpdateCampaign).toHaveBeenCalledWith('test-campaign', { icon: 'cat' });
    expect(mockSetCampaign).toHaveBeenCalledWith(updated);
    expect(mockToastSuccess).toHaveBeenCalledWith('Campaign icon updated');
  });

  it('shows error toast when icon update fails', async () => {
    mockUpdateCampaign.mockRejectedValue(new Error('Forbidden'));

    const { result } = renderHook(() => useCampaignSettings());
    await act(async () => {
      await result.current.handleIconSave('cat');
    });

    expect(mockToastError).toHaveBeenCalledWith('Failed to update icon', {
      description: 'Forbidden',
    });
  });
});

describe('useCampaignSettings — handleDelete', () => {
  it('calls deleteCampaign, toasts, and navigates to /campaigns', async () => {
    mockDeleteCampaign.mockResolvedValue(undefined);

    const { result } = renderHook(() => useCampaignSettings());
    await act(async () => {
      await result.current.handleDelete();
    });

    expect(mockDeleteCampaign).toHaveBeenCalledWith('test-campaign');
    expect(mockToastSuccess).toHaveBeenCalledWith('Campaign deleted');
    expect(mockPush).toHaveBeenCalledWith('/campaigns');
  });

  it('shows error toast and resets isDeleting when delete fails', async () => {
    mockDeleteCampaign.mockRejectedValue(new Error('Not found'));

    const { result } = renderHook(() => useCampaignSettings());
    await act(async () => {
      await result.current.handleDelete();
    });

    expect(mockToastError).toHaveBeenCalledWith('Failed to delete campaign', {
      description: 'Not found',
    });
    expect(result.current.isDeleting).toBe(false);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('does nothing when slug is null', async () => {
    mockContext(null);
    const { result } = renderHook(() => useCampaignSettings());

    await act(async () => {
      await result.current.handleDelete();
    });

    expect(mockDeleteCampaign).not.toHaveBeenCalled();
  });
});
