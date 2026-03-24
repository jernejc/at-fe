import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDiscoveryCompanies } from './useDiscoveryCompanies';
import type { CandidateFitSummary, ProductCandidatesResponse } from '@/lib/schemas/fit';
import type { CompanySummary } from '@/lib/schemas/company';

const mockReplace = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({ replace: mockReplace }),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockGetCompanies = vi.fn();
const mockGetProducts = vi.fn();
const mockGetProductCandidates = vi.fn();
const mockExportProductXlsx = vi.fn();
const mockSearchCompanies = vi.fn();

vi.mock('@/lib/api/companies', () => ({
  getCompanies: (...args: any[]) => mockGetCompanies(...args),
}));

vi.mock('@/lib/api/products', () => ({
  getProducts: (...args: any[]) => mockGetProducts(...args),
  getProductCandidates: (...args: any[]) => mockGetProductCandidates(...args),
  exportProductXlsx: (...args: any[]) => mockExportProductXlsx(...args),
}));

vi.mock('@/lib/api/search', () => ({
  searchCompanies: (...args: any[]) => mockSearchCompanies(...args),
}));

function makeCompanySummary(overrides: Partial<CompanySummary> = {}): CompanySummary {
  return {
    id: 1,
    domain: 'acme.com',
    name: 'Acme Corp',
    industry: 'Tech',
    employee_count: 500,
    hq_city: 'SF',
    hq_country: 'US',
    linkedin_id: null,
    rating_overall: null,
    logo_url: null,
    logo_base64: null,
    data_sources: [],
    top_contact: null,
    updated_at: '2025-01-01T00:00:00Z',
    ...overrides,
  };
}

function makeCandidate(overrides: Partial<CandidateFitSummary> = {}): CandidateFitSummary {
  return {
    company_id: 1,
    company_domain: 'acme.com',
    company_name: 'Acme Corp',
    likelihood_score: 0.8,
    urgency_score: 0.5,
    combined_score: 0.75,
    top_drivers: ['Revenue growth'],
    calculated_at: '2025-01-01T00:00:00Z',
    ...overrides,
  };
}

function makeCandidatesResponse(candidates: CandidateFitSummary[] = [makeCandidate()]): ProductCandidatesResponse {
  return {
    product_id: 10,
    product_name: 'Widget Pro',
    candidates,
    total: candidates.length,
    page: 1,
    page_size: 50,
    total_pages: 1,
    has_next: false,
    has_previous: false,
    cache_info: { oldest_calculation: '', newest_calculation: '', total_cached: 0, cache_coverage: 0 },
  };
}

const defaultProducts = [{ id: 10, name: 'Widget Pro' }];

function mockSuccessfulFetch(
  companies: CompanySummary[] = [makeCompanySummary()],
  products = defaultProducts,
) {
  mockGetCompanies.mockResolvedValue({
    items: companies,
    total: companies.length,
    page: 1,
    page_size: 50,
    total_pages: 1,
    has_next: false,
    has_previous: false,
  });
  mockGetProducts.mockResolvedValue({ items: products });
  mockGetProductCandidates.mockResolvedValue(makeCandidatesResponse());
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  mockSuccessfulFetch();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useDiscoveryCompanies — initial state', () => {
  it('starts in loading state', () => {
    const { result } = renderHook(() => useDiscoveryCompanies());
    expect(result.current.loading).toBe(true);
  });

  it('fetches companies and products on mount', async () => {
    const { result } = renderHook(() => useDiscoveryCompanies());

    await act(async () => {});

    expect(mockGetCompanies).toHaveBeenCalledOnce();
    expect(mockGetProducts).toHaveBeenCalledWith(1, 100);
    expect(result.current.loading).toBe(false);
    expect(result.current.companies).toHaveLength(1);
  });
});

describe('useDiscoveryCompanies — all companies mode', () => {
  it('calls getCompanies with page and page_size', async () => {
    renderHook(() => useDiscoveryCompanies());
    await act(async () => {});

    expect(mockGetCompanies).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, page_size: 50 }),
    );
  });

  it('passes sort_by and sort_order to getCompanies when sort is active', async () => {
    const { result } = renderHook(() => useDiscoveryCompanies());
    await act(async () => {});

    await act(async () => {
      result.current.setActiveSort({ field: 'name', direction: 'asc' });
    });
    await act(async () => {});

    const lastCall = mockGetCompanies.mock.calls.at(-1)?.[0];
    expect(lastCall).toMatchObject({ sort_by: 'name', sort_order: 'asc' });
  });

  it('omits sort params when sort is null', async () => {
    renderHook(() => useDiscoveryCompanies());
    await act(async () => {});

    const lastCall = mockGetCompanies.mock.calls.at(-1)?.[0];
    expect(lastCall.sort_by).toBeUndefined();
    expect(lastCall.sort_order).toBeUndefined();
  });
});

describe('useDiscoveryCompanies — product candidates mode', () => {
  const productFilter = {
    key: 'product',
    operator: 'is' as const,
    value: '10',
    fieldLabel: 'Product',
    valueLabel: 'Widget Pro',
  };

  it('calls getProductCandidates when product filter is active', async () => {
    const { result } = renderHook(() => useDiscoveryCompanies());
    await act(async () => {});

    await act(async () => {
      result.current.setActiveFilters([productFilter]);
    });
    await act(async () => {});

    expect(mockGetProductCandidates).toHaveBeenCalledWith(
      10,
      expect.objectContaining({ page: 1, page_size: 50 }),
    );
  });

  it('passes sort_by and sort_order to getProductCandidates', async () => {
    const { result } = renderHook(() => useDiscoveryCompanies());
    await act(async () => {});

    await act(async () => {
      result.current.setActiveFilters([productFilter]);
      result.current.setActiveSort({ field: 'fit_score', direction: 'desc' });
    });
    await act(async () => {});

    const lastCall = mockGetProductCandidates.mock.calls.at(-1);
    expect(lastCall?.[1]).toMatchObject({
      sort_by: 'fit_score',
      sort_order: 'desc',
    });
  });

  it('passes min_fit_score=0.8 for hot score filter', async () => {
    const { result } = renderHook(() => useDiscoveryCompanies());
    await act(async () => {});

    const scoreFilter = {
      key: 'score',
      operator: 'is' as const,
      value: 'hot',
      fieldLabel: 'Min Score',
      valueLabel: '80+',
    };

    await act(async () => {
      result.current.setActiveFilters([productFilter, scoreFilter]);
    });
    await act(async () => {});

    const lastCall = mockGetProductCandidates.mock.calls.at(-1);
    expect(lastCall?.[1]).toMatchObject({ min_fit_score: 0.8 });
  });

  it('passes min_fit_score=0.6 for warm score filter', async () => {
    const { result } = renderHook(() => useDiscoveryCompanies());
    await act(async () => {});

    const scoreFilter = {
      key: 'score',
      operator: 'is' as const,
      value: 'warm',
      fieldLabel: 'Min Score',
      valueLabel: '60+',
    };

    await act(async () => {
      result.current.setActiveFilters([productFilter, scoreFilter]);
    });
    await act(async () => {});

    const lastCall = mockGetProductCandidates.mock.calls.at(-1);
    expect(lastCall?.[1]).toMatchObject({ min_fit_score: 0.6 });
  });

  it('passes min_fit_score=0.4 for cold score filter', async () => {
    const { result } = renderHook(() => useDiscoveryCompanies());
    await act(async () => {});

    const scoreFilter = {
      key: 'score',
      operator: 'is' as const,
      value: 'cold',
      fieldLabel: 'Min Score',
      valueLabel: '40+',
    };

    await act(async () => {
      result.current.setActiveFilters([productFilter, scoreFilter]);
    });
    await act(async () => {});

    const lastCall = mockGetProductCandidates.mock.calls.at(-1);
    expect(lastCall?.[1]).toMatchObject({ min_fit_score: 0.4 });
  });

  it('does not pass min_fit_score when no score filter', async () => {
    const { result } = renderHook(() => useDiscoveryCompanies());
    await act(async () => {});

    await act(async () => {
      result.current.setActiveFilters([productFilter]);
    });
    await act(async () => {});

    const lastCall = mockGetProductCandidates.mock.calls.at(-1);
    expect(lastCall?.[1].min_fit_score).toBeUndefined();
  });

  it('maps candidates to CompanyRowData correctly', async () => {
    const candidate = makeCandidate({
      company_id: 99,
      company_name: 'Zelis',
      company_domain: 'zelis.com',
      combined_score: 0.92,
    });
    mockGetProductCandidates.mockResolvedValue(makeCandidatesResponse([candidate]));

    const { result } = renderHook(() => useDiscoveryCompanies());
    await act(async () => {});

    await act(async () => {
      result.current.setActiveFilters([productFilter]);
    });
    await act(async () => {});

    expect(result.current.companies[0]).toMatchObject({
      id: 99,
      name: 'Zelis',
      domain: 'zelis.com',
      fit_score: 0.92,
    });
  });

  it('sets totalCount from API response', async () => {
    const candidates = [makeCandidate(), makeCandidate({ company_id: 2 })];
    mockGetProductCandidates.mockResolvedValue({
      ...makeCandidatesResponse(candidates),
      total: 150,
    });

    const { result } = renderHook(() => useDiscoveryCompanies());
    await act(async () => {});

    await act(async () => {
      result.current.setActiveFilters([productFilter]);
    });
    await act(async () => {});

    expect(result.current.totalCount).toBe(150);
  });
});

describe('useDiscoveryCompanies — sort options', () => {
  const productFilter = {
    key: 'product',
    operator: 'is' as const,
    value: '10',
    fieldLabel: 'Product',
    valueLabel: 'Widget Pro',
  };

  it('includes fit_score sort when product filter is active', async () => {
    const { result } = renderHook(() => useDiscoveryCompanies());
    await act(async () => {});

    await act(async () => {
      result.current.setActiveFilters([productFilter]);
    });

    const sortValues = result.current.sortOptions.map((o) => o.value);
    expect(sortValues).toContain('fit_score');
  });

  it('excludes fit_score sort when no product filter', async () => {
    const { result } = renderHook(() => useDiscoveryCompanies());
    await act(async () => {});

    const sortValues = result.current.sortOptions.map((o) => o.value);
    expect(sortValues).not.toContain('fit_score');
    expect(sortValues).toContain('name');
    expect(sortValues).toContain('employee_count');
    expect(sortValues).toContain('updated_at');
  });

  it('clears fit_score sort when product filter is removed', async () => {
    const { result } = renderHook(() => useDiscoveryCompanies());
    await act(async () => {});

    await act(async () => {
      result.current.setActiveFilters([productFilter]);
      result.current.setActiveSort({ field: 'fit_score', direction: 'desc' });
    });

    expect(result.current.activeSort?.field).toBe('fit_score');

    await act(async () => {
      result.current.setActiveFilters([]);
    });

    expect(result.current.activeSort).toBeNull();
  });
});

describe('useDiscoveryCompanies — pagination', () => {
  it('resets page to 1 when filters change', async () => {
    const { result } = renderHook(() => useDiscoveryCompanies());
    await act(async () => {});

    act(() => {
      result.current.setPage(3);
    });
    expect(result.current.page).toBe(3);

    act(() => {
      result.current.setActiveFilters([
        { key: 'product', operator: 'is', value: '10', fieldLabel: 'Product', valueLabel: 'Widget Pro' },
      ]);
    });
    expect(result.current.page).toBe(1);
  });

  it('resets page to 1 when sort changes', async () => {
    const { result } = renderHook(() => useDiscoveryCompanies());
    await act(async () => {});

    act(() => {
      result.current.setPage(2);
    });
    expect(result.current.page).toBe(2);

    act(() => {
      result.current.setActiveSort({ field: 'name', direction: 'asc' });
    });
    expect(result.current.page).toBe(1);
  });

  it('exposes pageSize as 50', async () => {
    const { result } = renderHook(() => useDiscoveryCompanies());
    expect(result.current.pageSize).toBe(50);
  });
});

describe('useDiscoveryCompanies — error handling', () => {
  it('sets error message on fetch failure', async () => {
    mockGetCompanies.mockRejectedValue(new Error('Server error'));

    const { result } = renderHook(() => useDiscoveryCompanies());
    await act(async () => {});

    expect(result.current.error).toBe('Server error');
    expect(result.current.loading).toBe(false);
  });

  it('sets generic error for non-Error throws', async () => {
    mockGetCompanies.mockRejectedValue('unknown');

    const { result } = renderHook(() => useDiscoveryCompanies());
    await act(async () => {});

    expect(result.current.error).toBe('Failed to load companies');
  });
});
