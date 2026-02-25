import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCampaignsList, FILTER_DEFINITIONS, SORT_OPTIONS } from './useCampaignsList';
import type { CampaignSummary } from '@/lib/schemas';
import type { ActiveFilter } from '@/lib/schemas/filter';

const mockPush = vi.fn();
const mockGetCampaigns = vi.fn();
const mockGetProducts = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { role: 'pdm' } } }),
}));

vi.mock('@/lib/api', () => ({
  getCampaigns: (...args: any[]) => mockGetCampaigns(...args),
  getProducts: (...args: any[]) => mockGetProducts(...args),
}));

function makeCampaign(overrides: Partial<CampaignSummary> = {}): CampaignSummary {
  return {
    id: 1,
    name: 'Test Campaign',
    slug: 'test-campaign',
    status: 'active',
    company_count: 100,
    processed_count: 40,
    avg_fit_score: 0.72,
    target_product_id: 10,
    owner: null,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    ...overrides,
  };
}

const defaultCampaigns = [
  makeCampaign({ id: 1, name: 'Alpha', slug: 'alpha' }),
  makeCampaign({ id: 2, name: 'Beta', slug: 'beta', target_product_id: 20 }),
  makeCampaign({ id: 3, name: 'Gamma', slug: 'gamma' }),
];

const defaultProducts = [
  { id: 10, name: 'Widget Pro' },
  { id: 20, name: 'Gadget Plus' },
];

function mockSuccessfulFetch(campaigns = defaultCampaigns, products = defaultProducts) {
  mockGetCampaigns.mockResolvedValue({ items: campaigns, total: campaigns.length });
  mockGetProducts.mockResolvedValue({ items: products });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockSuccessfulFetch();
});

describe('useCampaignsList', () => {
  it('initializes in loading state', () => {
    const { result } = renderHook(() => useCampaignsList());
    expect(result.current.loading).toBe(true);
  });

  it('fetches campaigns and products on mount', async () => {
    const { result } = renderHook(() => useCampaignsList());

    await act(async () => {});

    expect(mockGetCampaigns).toHaveBeenCalledOnce();
    expect(mockGetProducts).toHaveBeenCalledWith(1, 100);
    expect(result.current.loading).toBe(false);
    expect(result.current.paginatedRows).toHaveLength(3);
  });

  it('enriches rows with product names', async () => {
    const { result } = renderHook(() => useCampaignsList());

    await act(async () => {});

    const alpha = result.current.paginatedRows.find((r) => r.name === 'Alpha');
    const beta = result.current.paginatedRows.find((r) => r.name === 'Beta');
    expect(alpha?.product_name).toBe('Widget Pro');
    expect(beta?.product_name).toBe('Gadget Plus');
  });

  it('sets product_name to null when no matching product', async () => {
    mockSuccessfulFetch(
      [makeCampaign({ id: 1, name: 'Orphan', target_product_id: 999 })],
      defaultProducts,
    );

    const { result } = renderHook(() => useCampaignsList());
    await act(async () => {});

    expect(result.current.paginatedRows[0].product_name).toBeNull();
  });

  it('sets error on fetch failure', async () => {
    mockGetCampaigns.mockRejectedValue(new Error('Server error'));

    const { result } = renderHook(() => useCampaignsList());
    await act(async () => {});

    expect(result.current.error).toBe('Server error');
    expect(result.current.loading).toBe(false);
  });

  it('sets generic error for non-Error throws', async () => {
    mockGetCampaigns.mockRejectedValue('unknown');

    const { result } = renderHook(() => useCampaignsList());
    await act(async () => {});

    expect(result.current.error).toBe('Failed to load data');
  });
});

describe('useCampaignsList — search', () => {
  it('filters campaigns by name (case-insensitive)', async () => {
    const { result } = renderHook(() => useCampaignsList());
    await act(async () => {});

    act(() => {
      result.current.handleSearchChange('alpha');
    });

    expect(result.current.paginatedRows).toHaveLength(1);
    expect(result.current.paginatedRows[0].name).toBe('Alpha');
    expect(result.current.totalFiltered).toBe(1);
  });

  it('returns all campaigns when search is empty', async () => {
    const { result } = renderHook(() => useCampaignsList());
    await act(async () => {});

    act(() => {
      result.current.handleSearchChange('alpha');
    });
    expect(result.current.totalFiltered).toBe(1);

    act(() => {
      result.current.handleSearchChange('');
    });
    expect(result.current.totalFiltered).toBe(3);
  });

  it('resets page to 1 when search changes', async () => {
    const { result } = renderHook(() => useCampaignsList());
    await act(async () => {});

    act(() => {
      result.current.handlePageChange(2);
    });
    expect(result.current.currentPage).toBe(2);

    act(() => {
      result.current.handleSearchChange('test');
    });
    expect(result.current.currentPage).toBe(1);
  });
});

describe('useCampaignsList — empty states', () => {
  it('sets hasNoCampaigns when no campaigns and no filters', async () => {
    mockSuccessfulFetch([], defaultProducts);

    const { result } = renderHook(() => useCampaignsList());
    await act(async () => {});

    expect(result.current.hasNoCampaigns).toBe(true);
    expect(result.current.hasNoResults).toBe(false);
  });

  it('sets hasNoResults when search yields nothing', async () => {
    const { result } = renderHook(() => useCampaignsList());
    await act(async () => {});

    act(() => {
      result.current.handleSearchChange('nonexistent');
    });

    expect(result.current.hasNoCampaigns).toBe(false);
    expect(result.current.hasNoResults).toBe(true);
  });

  it('sets hasNoResults when API filters return empty results', async () => {
    const { result } = renderHook(() => useCampaignsList());
    await act(async () => {});

    // Simulate applying a status filter that returns no results
    mockSuccessfulFetch([], defaultProducts);

    await act(async () => {
      result.current.handleFiltersChange([
        { key: 'status', operator: 'is', value: 'draft', fieldLabel: 'Status', valueLabel: 'Draft' },
      ]);
    });

    // Wait for refetch
    await act(async () => {});

    expect(result.current.hasNoCampaigns).toBe(false);
    expect(result.current.hasNoResults).toBe(true);
  });
});

describe('useCampaignsList — filters and API params', () => {
  it('passes status filter to getCampaigns', async () => {
    const { result } = renderHook(() => useCampaignsList());
    await act(async () => {});

    const statusFilter: ActiveFilter = {
      key: 'status',
      operator: 'is',
      value: 'published',
      fieldLabel: 'Status',
      valueLabel: 'Active',
    };

    await act(async () => {
      result.current.handleFiltersChange([statusFilter]);
    });
    await act(async () => {});

    const lastCall = mockGetCampaigns.mock.calls.at(-1)?.[0];
    expect(lastCall).toMatchObject({ status: 'published' });
  });

  it('passes own_only when owner filter is "mine"', async () => {
    const { result } = renderHook(() => useCampaignsList());
    await act(async () => {});

    const ownerFilter: ActiveFilter = {
      key: 'owner',
      operator: 'is',
      value: 'mine',
      fieldLabel: 'Owner',
      valueLabel: 'Me',
    };

    await act(async () => {
      result.current.handleFiltersChange([ownerFilter]);
    });
    await act(async () => {});

    const lastCall = mockGetCampaigns.mock.calls.at(-1)?.[0];
    expect(lastCall).toMatchObject({ own_only: true });
  });

  it('resets page to 1 when filters change', async () => {
    const { result } = renderHook(() => useCampaignsList());
    await act(async () => {});

    act(() => {
      result.current.handlePageChange(3);
    });
    expect(result.current.currentPage).toBe(3);

    await act(async () => {
      result.current.handleFiltersChange([
        { key: 'status', operator: 'is', value: 'draft', fieldLabel: 'Status', valueLabel: 'Draft' },
      ]);
    });
    expect(result.current.currentPage).toBe(1);
  });
});

describe('useCampaignsList — sort', () => {
  it('passes sort params to getCampaigns', async () => {
    const { result } = renderHook(() => useCampaignsList());
    await act(async () => {});

    await act(async () => {
      result.current.handleSortChange({ field: 'name', direction: 'asc' });
    });
    await act(async () => {});

    const lastCall = mockGetCampaigns.mock.calls.at(-1)?.[0];
    expect(lastCall).toMatchObject({ sort_by: 'name', sort_order: 'asc' });
  });

  it('omits sort params when sort is null', async () => {
    const { result } = renderHook(() => useCampaignsList());
    await act(async () => {});

    await act(async () => {
      result.current.handleSortChange({ field: 'name', direction: 'asc' });
    });
    await act(async () => {});

    await act(async () => {
      result.current.handleSortChange(null);
    });
    await act(async () => {});

    const lastCall = mockGetCampaigns.mock.calls.at(-1)?.[0];
    expect(lastCall).not.toHaveProperty('sort_by');
    expect(lastCall).not.toHaveProperty('sort_order');
  });

  it('resets page to 1 when sort changes', async () => {
    const { result } = renderHook(() => useCampaignsList());
    await act(async () => {});

    act(() => {
      result.current.handlePageChange(2);
    });

    await act(async () => {
      result.current.handleSortChange({ field: 'created_at', direction: 'desc' });
    });
    expect(result.current.currentPage).toBe(1);
  });
});

describe('useCampaignsList — pagination', () => {
  it('paginates rows based on current page and page size', async () => {
    const manyCampaigns = Array.from({ length: 25 }, (_, i) =>
      makeCampaign({ id: i + 1, name: `Campaign ${i + 1}`, slug: `campaign-${i + 1}` }),
    );
    mockSuccessfulFetch(manyCampaigns, []);

    const { result } = renderHook(() => useCampaignsList());
    await act(async () => {});

    expect(result.current.paginatedRows).toHaveLength(20);
    expect(result.current.totalFiltered).toBe(25);

    act(() => {
      result.current.handlePageChange(2);
    });

    expect(result.current.paginatedRows).toHaveLength(5);
    expect(result.current.currentPage).toBe(2);
  });
});

describe('useCampaignsList — navigation', () => {
  it('navigates to /campaigns/start on handleNewCampaign', async () => {
    const { result } = renderHook(() => useCampaignsList());
    await act(async () => {});

    act(() => {
      result.current.handleNewCampaign();
    });

    expect(mockPush).toHaveBeenCalledWith('/campaigns/start');
  });

  it('navigates to campaign detail on handleRowClick', async () => {
    const { result } = renderHook(() => useCampaignsList());
    await act(async () => {});

    act(() => {
      result.current.handleRowClick(result.current.paginatedRows[0]);
    });

    expect(mockPush).toHaveBeenCalledWith('/campaigns/alpha');
  });
});

describe('FILTER_DEFINITIONS', () => {
  it('includes status and owner filters', () => {
    const keys = FILTER_DEFINITIONS.map((d) => d.key);
    expect(keys).toContain('status');
    expect(keys).toContain('owner');
  });

  it('status filter has expected options', () => {
    const statusDef = FILTER_DEFINITIONS.find((d) => d.key === 'status');
    const values = statusDef?.options.map((o) => o.value);
    expect(values).toEqual(['published', 'draft', 'completed', 'archived']);
  });
});

describe('SORT_OPTIONS', () => {
  it('includes all expected sort fields', () => {
    const values = SORT_OPTIONS.map((o) => o.value);
    expect(values).toEqual(['name', 'created_at', 'updated_at', 'company_count']);
  });
});
