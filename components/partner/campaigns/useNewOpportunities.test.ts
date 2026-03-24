import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { PartnerCompanyItem, PaginatedResponse } from '@/lib/schemas';
import { useNewOpportunities, mapAssignmentToCompanyRow } from './useNewOpportunities';
import type { NewOpportunityItem } from './useNewOpportunities';

// ── Mocks ──────────────────────────────────────────────────────────

const mockGetPartnerCompanies = vi.fn();

vi.mock('@/lib/api', () => ({
  getPartnerCompanies: (...args: unknown[]) => mockGetPartnerCompanies(...args),
}));

// ── Factories ──────────────────────────────────────────────────────

function makeCompanyItem(overrides: Partial<PartnerCompanyItem> = {}): PartnerCompanyItem {
  return {
    company: {
      id: 1,
      domain: 'acme.com',
      name: 'Acme Corp',
      industry: 'Tech',
      employee_count: 100,
      hq_city: 'San Francisco',
      hq_country: 'US',
      linkedin_id: null,
      rating_overall: null,
      logo_url: 'https://logo.clearbit.com/acme.com',
      logo_base64: null,
      data_sources: [],
      top_contact: null,
      updated_at: '2026-03-20T00:00:00Z',
      data_depth: 'detailed',
      revenue: null,
      enriched_summary: null,
    },
    campaign_id: 10,
    campaign_name: 'Q1 Outreach',
    campaign_slug: 'q1-outreach',
    campaign_icon: '🚀',
    assigned_at: new Date().toISOString(),
    assigned_by: 'admin',
    assignment_status: 'active',
    notes: null,
    ...overrides,
  };
}

function makePaginatedResponse(
  items: PartnerCompanyItem[] = [],
  overrides: Partial<PaginatedResponse<PartnerCompanyItem>> = {},
): PaginatedResponse<PartnerCompanyItem> {
  return {
    items,
    total: items.length,
    page: 1,
    page_size: 100,
    total_pages: 1,
    has_next: false,
    has_previous: false,
    ...overrides,
  };
}

// ── Tests ──────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useNewOpportunities', () => {
  it('starts in loading state', () => {
    mockGetPartnerCompanies.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useNewOpportunities(1));
    expect(result.current.newOpportunitiesLoading).toBe(true);
  });

  it('resets to empty state when partnerId is undefined', async () => {
    const { result } = renderHook(() => useNewOpportunities(undefined));
    await act(async () => {});
    expect(result.current.newOpportunities).toEqual([]);
    expect(result.current.newOpportunitiesLoading).toBe(false);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.hasMore).toBe(false);
    expect(mockGetPartnerCompanies).not.toHaveBeenCalled();
  });

  it('fetches page 1 with assigned_since and page_size on mount', async () => {
    mockGetPartnerCompanies.mockResolvedValue(makePaginatedResponse());
    renderHook(() => useNewOpportunities(42));
    await act(async () => {});

    expect(mockGetPartnerCompanies).toHaveBeenCalledOnce();
    const args = mockGetPartnerCompanies.mock.calls[0][0];
    expect(args.page).toBe(1);
    expect(args.page_size).toBe(100);
    expect(args.assigned_since).toBeDefined();
    // assigned_since should be roughly 7 days ago
    const since = new Date(args.assigned_since).getTime();
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    expect(Math.abs(since - sevenDaysAgo)).toBeLessThan(5000);
  });

  it('populates newOpportunities and totalCount from response', async () => {
    const items = [makeCompanyItem(), makeCompanyItem({ campaign_id: 20, company: { ...makeCompanyItem().company, id: 2 } })];
    mockGetPartnerCompanies.mockResolvedValue(makePaginatedResponse(items, { total: 2 }));

    const { result } = renderHook(() => useNewOpportunities(1));
    await act(async () => {});

    expect(result.current.newOpportunities).toHaveLength(2);
    expect(result.current.totalCount).toBe(2);
    expect(result.current.newOpportunitiesLoading).toBe(false);
  });

  it('sets hasMore true when response has_next is true', async () => {
    mockGetPartnerCompanies.mockResolvedValue(makePaginatedResponse([makeCompanyItem()], { has_next: true, total: 150 }));
    const { result } = renderHook(() => useNewOpportunities(1));
    await act(async () => {});
    expect(result.current.hasMore).toBe(true);
  });

  it('sets hasMore false when response has_next is false', async () => {
    mockGetPartnerCompanies.mockResolvedValue(makePaginatedResponse([makeCompanyItem()], { has_next: false }));
    const { result } = renderHook(() => useNewOpportunities(1));
    await act(async () => {});
    expect(result.current.hasMore).toBe(false);
  });

  it('loadMore fetches page 2 and appends items', async () => {
    const page1Item = makeCompanyItem();
    const page2Item = makeCompanyItem({ campaign_id: 20, company: { ...makeCompanyItem().company, id: 2, name: 'Beta Inc' } });

    mockGetPartnerCompanies
      .mockResolvedValueOnce(makePaginatedResponse([page1Item], { has_next: true, total: 2 }))
      .mockResolvedValueOnce(makePaginatedResponse([page2Item], { has_next: false, total: 2, page: 2 }));

    const { result } = renderHook(() => useNewOpportunities(1));
    await act(async () => {});

    expect(result.current.newOpportunities).toHaveLength(1);

    await act(async () => { result.current.loadMore(); });

    expect(mockGetPartnerCompanies).toHaveBeenCalledTimes(2);
    expect(mockGetPartnerCompanies.mock.calls[1][0].page).toBe(2);
    expect(result.current.newOpportunities).toHaveLength(2);
    expect(result.current.newOpportunities[1].item.company.name).toBe('Beta Inc');
    expect(result.current.hasMore).toBe(false);
  });

  it('loadMore is a no-op when hasMore is false', async () => {
    mockGetPartnerCompanies.mockResolvedValue(makePaginatedResponse([makeCompanyItem()], { has_next: false }));
    const { result } = renderHook(() => useNewOpportunities(1));
    await act(async () => {});

    await act(async () => { result.current.loadMore(); });

    expect(mockGetPartnerCompanies).toHaveBeenCalledOnce(); // only the initial fetch
  });

  it('sets loadingMore while load more request is in flight', async () => {
    let resolveLoadMore: (value: PaginatedResponse<PartnerCompanyItem>) => void;
    const loadMorePromise = new Promise<PaginatedResponse<PartnerCompanyItem>>((r) => { resolveLoadMore = r; });

    mockGetPartnerCompanies
      .mockResolvedValueOnce(makePaginatedResponse([makeCompanyItem()], { has_next: true, total: 2 }))
      .mockReturnValueOnce(loadMorePromise);

    const { result } = renderHook(() => useNewOpportunities(1));
    await act(async () => {});

    // Start loading more without resolving
    act(() => { result.current.loadMore(); });
    expect(result.current.loadingMore).toBe(true);

    // Resolve the promise
    await act(async () => { resolveLoadMore!(makePaginatedResponse([], { has_next: false })); });
    expect(result.current.loadingMore).toBe(false);
  });

  it('handles API error on initial fetch gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockGetPartnerCompanies.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useNewOpportunities(1));
    await act(async () => {});

    expect(result.current.newOpportunities).toEqual([]);
    expect(result.current.newOpportunitiesLoading).toBe(false);
    consoleSpy.mockRestore();
  });

  it('handles API error on load more gracefully and keeps existing items', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const item = makeCompanyItem();

    mockGetPartnerCompanies
      .mockResolvedValueOnce(makePaginatedResponse([item], { has_next: true, total: 2 }))
      .mockRejectedValueOnce(new Error('Server error'));

    const { result } = renderHook(() => useNewOpportunities(1));
    await act(async () => {});

    await act(async () => { result.current.loadMore(); });

    expect(result.current.newOpportunities).toHaveLength(1);
    expect(result.current.loadingMore).toBe(false);
    consoleSpy.mockRestore();
  });
});

describe('mapAssignmentToCompanyRow', () => {
  it('maps fields correctly and sets status to new', () => {
    const item = makeCompanyItem({
      assigned_at: '2026-03-20T10:00:00Z',
      company: {
        ...makeCompanyItem().company,
        id: 5,
        name: 'Mapped Corp',
        domain: 'mapped.com',
        hq_country: 'DE',
        employee_count: 250,
        logo_url: 'https://logo.clearbit.com/mapped.com',
        logo_base64: 'base64data',
      },
    });

    const opportunity: NewOpportunityItem = {
      item,
      campaignSlug: 'test-campaign',
      campaignName: 'Test Campaign',
    };

    const row = mapAssignmentToCompanyRow(opportunity);

    expect(row).toEqual({
      id: 5,
      name: 'Mapped Corp',
      domain: 'mapped.com',
      logo_url: 'https://logo.clearbit.com/mapped.com',
      logo_base64: 'base64data',
      status: 'new',
      hq_country: 'DE',
      employee_count: 250,
      assigned_at: '2026-03-20T10:00:00Z',
    });
  });
});
