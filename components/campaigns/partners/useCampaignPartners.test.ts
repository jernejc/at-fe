import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCampaignPartners } from './useCampaignPartners';
import type { PartnerAssignmentSummary } from '@/lib/schemas/partner';

const mockGetCampaignPartners = vi.fn();

vi.mock('@/lib/api/partners', () => ({
  getCampaignPartners: (...args: any[]) => mockGetCampaignPartners(...args),
}));

function makePartner(overrides: Partial<PartnerAssignmentSummary> = {}): PartnerAssignmentSummary {
  return {
    id: 1,
    partner_id: 10,
    partner_name: 'Brio Tech',
    partner_slug: 'brio-tech',
    partner_description: 'A technology partner',
    partner_website: null,
    partner_type: 'technology',
    partner_logo_url: 'https://example.com/logo.png',
    partner_capacity: 20,
    partner_industries: ['SaaS', 'FinTech'],
    partner_status: 'active',
    assigned_company_count: 5,
    in_progress_count: 2,
    completed_count: 1,
    task_completion_pct: 40,
    role_in_campaign: null,
    assigned_at: '2025-01-01T00:00:00Z',
    ...overrides,
  };
}

const defaultPartners = [
  makePartner({ id: 1, partner_id: 10, partner_name: 'Brio Tech' }),
  makePartner({ id: 2, partner_id: 20, partner_name: 'Acme Partners', partner_type: 'consulting', partner_capacity: 10, assigned_company_count: 8, completed_count: 4 }),
  makePartner({ id: 3, partner_id: 30, partner_name: 'Zeta Agency', partner_type: 'agency', partner_capacity: 30, assigned_company_count: 10, completed_count: 0 }),
];

beforeEach(() => {
  vi.clearAllMocks();
  mockGetCampaignPartners.mockResolvedValue(defaultPartners);
});

describe('useCampaignPartners — initialisation', () => {
  it('starts in loading state', () => {
    const { result } = renderHook(() => useCampaignPartners({ slug: 'test' }));
    expect(result.current.loading).toBe(true);
  });

  it('fetches partners on mount', async () => {
    const { result } = renderHook(() => useCampaignPartners({ slug: 'test' }));
    await act(async () => {});

    expect(mockGetCampaignPartners).toHaveBeenCalledWith('test');
    expect(result.current.loading).toBe(false);
    expect(result.current.partners).toHaveLength(3);
  });

  it('does not fetch when enabled is false', async () => {
    renderHook(() => useCampaignPartners({ slug: 'test', enabled: false }));
    await act(async () => {});

    expect(mockGetCampaignPartners).not.toHaveBeenCalled();
  });

  it('does not fetch when slug is empty', async () => {
    renderHook(() => useCampaignPartners({ slug: '' }));
    await act(async () => {});

    expect(mockGetCampaignPartners).not.toHaveBeenCalled();
  });
});

describe('useCampaignPartners — data mapping', () => {
  it('maps PartnerAssignmentSummary to PartnerRowData correctly', async () => {
    const { result } = renderHook(() => useCampaignPartners({ slug: 'test' }));
    await act(async () => {});

    const brio = result.current.partners.find((p) => p.name === 'Brio Tech');
    expect(brio).toMatchObject({
      id: 1,
      partnerId: 10,
      name: 'Brio Tech',
      slug: 'brio-tech',
      description: 'A technology partner',
      logoUrl: 'https://example.com/logo.png',
      type: 'technology',
      industries: ['SaaS', 'FinTech'],
      capacity: 20,
      status: 'active',
      assignedCount: 5,
      inProgressCount: 2,
      completedCount: 1,
      taskCompletionPct: 40,
    });
  });

  it('exposes allPartners as raw API data', async () => {
    const { result } = renderHook(() => useCampaignPartners({ slug: 'test' }));
    await act(async () => {});

    expect(result.current.allPartners).toHaveLength(3);
    expect(result.current.allPartners[0].partner_name).toBe('Brio Tech');
  });
});

describe('useCampaignPartners — error handling', () => {
  it('sets error message on fetch failure', async () => {
    mockGetCampaignPartners.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useCampaignPartners({ slug: 'test' }));
    await act(async () => {});

    expect(result.current.error).toBe('Network error');
    expect(result.current.loading).toBe(false);
  });

  it('sets generic error for non-Error throws', async () => {
    mockGetCampaignPartners.mockRejectedValue('fail');

    const { result } = renderHook(() => useCampaignPartners({ slug: 'test' }));
    await act(async () => {});

    expect(result.current.error).toBe('Failed to load partners');
  });
});

describe('useCampaignPartners — search', () => {
  it('filters partners by name (debounced)', async () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => useCampaignPartners({ slug: 'test' }));
    await act(async () => {});
    expect(result.current.partners).toHaveLength(3);

    act(() => { result.current.setSearchQuery('brio'); });

    // Before debounce
    expect(result.current.partners).toHaveLength(3);

    // After debounce
    act(() => { vi.advanceTimersByTime(350); });
    expect(result.current.partners).toHaveLength(1);
    expect(result.current.partners[0].name).toBe('Brio Tech');

    vi.useRealTimers();
  });

  it('search is case-insensitive', async () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => useCampaignPartners({ slug: 'test' }));
    await act(async () => {});

    act(() => { result.current.setSearchQuery('ZETA'); });
    act(() => { vi.advanceTimersByTime(350); });

    expect(result.current.partners).toHaveLength(1);
    expect(result.current.partners[0].name).toBe('Zeta Agency');

    vi.useRealTimers();
  });

  it('returns all partners when search is cleared', async () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => useCampaignPartners({ slug: 'test' }));
    await act(async () => {});

    act(() => { result.current.setSearchQuery('brio'); });
    act(() => { vi.advanceTimersByTime(350); });
    expect(result.current.partners).toHaveLength(1);

    act(() => { result.current.setSearchQuery(''); });
    act(() => { vi.advanceTimersByTime(350); });
    expect(result.current.partners).toHaveLength(3);

    vi.useRealTimers();
  });
});

describe('useCampaignPartners — sort', () => {
  it('sorts by name ascending by default', async () => {
    const { result } = renderHook(() => useCampaignPartners({ slug: 'test' }));
    await act(async () => {});

    const names = result.current.partners.map((p) => p.name);
    expect(names).toEqual(['Acme Partners', 'Brio Tech', 'Zeta Agency']);
  });

  it('sorts by name descending', async () => {
    const { result } = renderHook(() => useCampaignPartners({ slug: 'test' }));
    await act(async () => {});

    act(() => { result.current.setActiveSort({ field: 'name', direction: 'desc' }); });

    const names = result.current.partners.map((p) => p.name);
    expect(names).toEqual(['Zeta Agency', 'Brio Tech', 'Acme Partners']);
  });

  it('sorts by capacity ascending', async () => {
    const { result } = renderHook(() => useCampaignPartners({ slug: 'test' }));
    await act(async () => {});

    act(() => { result.current.setActiveSort({ field: 'capacity', direction: 'asc' }); });

    const capacities = result.current.partners.map((p) => p.capacity);
    expect(capacities).toEqual([10, 20, 30]);
  });

  it('sorts by progress (completedCount / assignedCount)', async () => {
    const { result } = renderHook(() => useCampaignPartners({ slug: 'test' }));
    await act(async () => {});

    act(() => { result.current.setActiveSort({ field: 'progress', direction: 'desc' }); });

    // Acme: 4/8 = 0.5, Brio: 1/5 = 0.2, Zeta: 0/10 = 0
    const names = result.current.partners.map((p) => p.name);
    expect(names).toEqual(['Acme Partners', 'Brio Tech', 'Zeta Agency']);
  });

  it('exposes sort options', () => {
    const { result } = renderHook(() => useCampaignPartners({ slug: 'test' }));
    const values = result.current.sortOptions.map((o) => o.value);
    expect(values).toEqual(['name', 'type', 'capacity', 'progress']);
  });
});

describe('useCampaignPartners — refetch', () => {
  it('refetch triggers a new API call', async () => {
    const { result } = renderHook(() => useCampaignPartners({ slug: 'test' }));
    await act(async () => {});

    expect(mockGetCampaignPartners).toHaveBeenCalledTimes(1);

    await act(async () => { result.current.refetch(); });
    await act(async () => {});

    expect(mockGetCampaignPartners).toHaveBeenCalledTimes(2);
  });
});
