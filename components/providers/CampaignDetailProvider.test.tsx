import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CampaignDetailProvider, useCampaignDetail } from './CampaignDetailProvider';
import type { CampaignRead, CampaignOverview } from '@/lib/schemas';
import type { ReactNode } from 'react';

const mockGetCampaign = vi.fn();
const mockGetCampaignOverview = vi.fn();
const mockGetCampaignPartners = vi.fn();
const mockPublishCampaign = vi.fn();
const mockUnpublishCampaign = vi.fn();

vi.mock('@/lib/api', () => ({
  getCampaign: (...args: any[]) => mockGetCampaign(...args),
  getCampaignOverview: (...args: any[]) => mockGetCampaignOverview(...args),
  getCampaignPartners: (...args: any[]) => mockGetCampaignPartners(...args),
  publishCampaign: (...args: any[]) => mockPublishCampaign(...args),
  unpublishCampaign: (...args: any[]) => mockUnpublishCampaign(...args),
}));

const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();

vi.mock('sonner', () => ({
  toast: {
    success: (...args: any[]) => mockToastSuccess(...args),
    error: (...args: any[]) => mockToastError(...args),
  },
}));

function makeCampaign(overrides: Partial<CampaignRead> = {}): CampaignRead {
  return {
    id: 1,
    name: 'Test Campaign',
    slug: 'test-campaign',
    description: null,
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

function makeOverview(overrides: Partial<CampaignOverview> = {}): CampaignOverview {
  return {
    ...makeCampaign(),
    segments: [],
    top_companies: [],
    fit_distribution: { '0-20': 0, '20-40': 0, '40-60': 0, '60-80': 0, '80-100': 0, unscored: 0 },
    industry_breakdown: {},
    processing_progress: 0,
    product_name: 'Widget Pro',
    ...overrides,
  };
}

function mockSuccessfulFetch(campaign = makeCampaign(), overview = makeOverview()) {
  mockGetCampaign.mockResolvedValue(campaign);
  mockGetCampaignOverview.mockResolvedValue(overview);
  mockGetCampaignPartners.mockResolvedValue([]);
}

function makeWrapper(slug: string) {
  return ({ children }: { children: ReactNode }) => (
    <CampaignDetailProvider slug={slug}>{children}</CampaignDetailProvider>
  );
}

function renderWithProvider(slug = 'test-campaign') {
  return renderHook(() => useCampaignDetail(), { wrapper: makeWrapper(slug) });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockSuccessfulFetch();
});

describe('CampaignDetailProvider — data fetching', () => {
  it('initializes in loading state with null campaign and overview', () => {
    const { result } = renderWithProvider();
    expect(result.current.loading).toBe(true);
    expect(result.current.campaign).toBeNull();
    expect(result.current.overview).toBeNull();
    expect(result.current.partners).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('fetches campaign and overview in parallel on mount', async () => {
    renderWithProvider('my-campaign');
    await act(async () => {});

    expect(mockGetCampaign).toHaveBeenCalledOnce();
    expect(mockGetCampaign).toHaveBeenCalledWith('my-campaign');
    expect(mockGetCampaignOverview).toHaveBeenCalledOnce();
    expect(mockGetCampaignOverview).toHaveBeenCalledWith('my-campaign');
  });

  it('sets campaign and overview data after successful fetch', async () => {
    const campaign = makeCampaign({ name: 'Alpha Outreach' });
    const overview = makeOverview({ product_name: 'Gadget Plus' });
    mockSuccessfulFetch(campaign, overview);

    const { result } = renderWithProvider();
    await act(async () => {});

    expect(result.current.loading).toBe(false);
    expect(result.current.campaign).toEqual(campaign);
    expect(result.current.overview).toEqual(overview);
  });

  it('sets error message when fetch fails with Error', async () => {
    mockGetCampaign.mockRejectedValue(new Error('Network failure'));

    const { result } = renderWithProvider();
    await act(async () => {});

    expect(result.current.error).toBe('Network failure');
    expect(result.current.loading).toBe(false);
    expect(result.current.campaign).toBeNull();
  });

  it('sets generic error for non-Error throws', async () => {
    mockGetCampaign.mockRejectedValue('unknown');

    const { result } = renderWithProvider();
    await act(async () => {});

    expect(result.current.error).toBe('Failed to load campaign');
  });

  it('refetches data when slug changes', async () => {
    let slug = 'alpha';
    const wrapper = ({ children }: { children: ReactNode }) => (
      <CampaignDetailProvider slug={slug}>{children}</CampaignDetailProvider>
    );
    const { rerender } = renderHook(() => useCampaignDetail(), { wrapper });
    await act(async () => {});

    expect(mockGetCampaign).toHaveBeenCalledWith('alpha');

    slug = 'beta';
    rerender();
    await act(async () => {});

    expect(mockGetCampaign).toHaveBeenCalledWith('beta');
  });
});

describe('CampaignDetailProvider — handlePublish', () => {
  it('calls publishCampaign with the slug', async () => {
    const published = makeCampaign({ status: 'published' });
    mockPublishCampaign.mockResolvedValue(published);

    const { result } = renderWithProvider();
    await act(async () => {});

    await act(async () => {
      await result.current.handlePublish();
    });

    expect(mockPublishCampaign).toHaveBeenCalledWith('test-campaign');
  });

  it('updates campaign state with the returned data', async () => {
    const published = makeCampaign({ status: 'published' });
    mockPublishCampaign.mockResolvedValue(published);

    const { result } = renderWithProvider();
    await act(async () => {});

    await act(async () => {
      await result.current.handlePublish();
    });

    expect(result.current.campaign?.status).toBe('published');
  });

  it('shows success toast after publishing', async () => {
    mockPublishCampaign.mockResolvedValue(makeCampaign({ status: 'published' }));

    const { result } = renderWithProvider();
    await act(async () => {});

    await act(async () => {
      await result.current.handlePublish();
    });

    expect(mockToastSuccess).toHaveBeenCalledWith('Campaign published', {
      description: 'Notifications have been sent to partners.',
    });
  });

  it('sets isPublishing to true during publish and false after', async () => {
    let resolvePublish: (value: CampaignRead) => void;
    mockPublishCampaign.mockReturnValue(
      new Promise<CampaignRead>((resolve) => {
        resolvePublish = resolve;
      }),
    );

    const { result } = renderWithProvider();
    await act(async () => {});

    let publishPromise: Promise<void>;
    act(() => {
      publishPromise = result.current.handlePublish();
    });

    expect(result.current.isPublishing).toBe(true);

    await act(async () => {
      resolvePublish!(makeCampaign({ status: 'published' }));
      await publishPromise!;
    });

    expect(result.current.isPublishing).toBe(false);
  });

  it('shows error toast when publish fails', async () => {
    mockPublishCampaign.mockRejectedValue(new Error('Server down'));

    const { result } = renderWithProvider();
    await act(async () => {});

    await act(async () => {
      await result.current.handlePublish();
    });

    expect(mockToastError).toHaveBeenCalledWith('Failed to publish campaign', {
      description: 'Server down',
    });
  });

  it('shows generic error toast when publish fails with non-Error', async () => {
    mockPublishCampaign.mockRejectedValue('oops');

    const { result } = renderWithProvider();
    await act(async () => {});

    await act(async () => {
      await result.current.handlePublish();
    });

    expect(mockToastError).toHaveBeenCalledWith('Failed to publish campaign', {
      description: 'Please try again',
    });
  });
});

describe('CampaignDetailProvider — handleUnpublish', () => {
  it('calls unpublishCampaign with the slug', async () => {
    mockUnpublishCampaign.mockResolvedValue(makeCampaign({ status: 'draft' }));

    const { result } = renderWithProvider();
    await act(async () => {});

    await act(async () => {
      await result.current.handleUnpublish();
    });

    expect(mockUnpublishCampaign).toHaveBeenCalledWith('test-campaign');
  });

  it('updates campaign state after unpublishing', async () => {
    mockSuccessfulFetch(makeCampaign({ status: 'published' }));
    mockUnpublishCampaign.mockResolvedValue(makeCampaign({ status: 'draft' }));

    const { result } = renderWithProvider();
    await act(async () => {});

    expect(result.current.campaign?.status).toBe('published');

    await act(async () => {
      await result.current.handleUnpublish();
    });

    expect(result.current.campaign?.status).toBe('draft');
  });

  it('shows success toast after unpublishing', async () => {
    mockUnpublishCampaign.mockResolvedValue(makeCampaign({ status: 'draft' }));

    const { result } = renderWithProvider();
    await act(async () => {});

    await act(async () => {
      await result.current.handleUnpublish();
    });

    expect(mockToastSuccess).toHaveBeenCalledWith('Campaign unpublished', {
      description: 'Campaign is now in draft mode.',
    });
  });

  it('sets isUnpublishing to true during unpublish and false after', async () => {
    let resolveUnpublish: (value: CampaignRead) => void;
    mockUnpublishCampaign.mockReturnValue(
      new Promise<CampaignRead>((resolve) => {
        resolveUnpublish = resolve;
      }),
    );

    const { result } = renderWithProvider();
    await act(async () => {});

    let unpublishPromise: Promise<void>;
    act(() => {
      unpublishPromise = result.current.handleUnpublish();
    });

    expect(result.current.isUnpublishing).toBe(true);

    await act(async () => {
      resolveUnpublish!(makeCampaign({ status: 'draft' }));
      await unpublishPromise!;
    });

    expect(result.current.isUnpublishing).toBe(false);
  });

  it('shows error toast when unpublish fails', async () => {
    mockUnpublishCampaign.mockRejectedValue(new Error('Forbidden'));

    const { result } = renderWithProvider();
    await act(async () => {});

    await act(async () => {
      await result.current.handleUnpublish();
    });

    expect(mockToastError).toHaveBeenCalledWith('Failed to unpublish campaign', {
      description: 'Forbidden',
    });
  });
});

describe('CampaignDetailProvider — refreshData', () => {
  it('re-fetches campaign and overview when refreshData is called', async () => {
    const { result } = renderWithProvider();
    await act(async () => {});

    expect(mockGetCampaign).toHaveBeenCalledTimes(1);
    expect(mockGetCampaignOverview).toHaveBeenCalledTimes(1);

    const updated = makeCampaign({ name: 'Refreshed Campaign' });
    mockGetCampaign.mockResolvedValue(updated);

    await act(async () => {
      await result.current.refreshData();
    });

    expect(mockGetCampaign).toHaveBeenCalledTimes(2);
    expect(mockGetCampaignOverview).toHaveBeenCalledTimes(2);
    expect(result.current.campaign?.name).toBe('Refreshed Campaign');
  });
});

describe('useCampaignDetail', () => {
  it('throws when used outside CampaignDetailProvider', () => {
    // Suppress console.error from the expected React error boundary
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useCampaignDetail());
    }).toThrow('useCampaignDetail must be used within a CampaignDetailProvider');

    spy.mockRestore();
  });
});
