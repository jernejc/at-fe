import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCampaignCompanies } from './useCampaignCompanies';
import type { MembershipRead } from '@/lib/schemas/campaign';
import type { PartnerAssignmentSummary } from '@/lib/schemas/partner';
import type { ActiveFilter } from '@/lib/schemas/filter';

const mockGetCampaignCompanies = vi.fn();
const mockGetCampaignPartners = vi.fn();

vi.mock('@/lib/api/campaigns', () => ({
  getCampaignCompanies: (...args: any[]) => mockGetCampaignCompanies(...args),
}));

vi.mock('@/lib/api/partners', () => ({
  getCampaignPartners: (...args: any[]) => mockGetCampaignPartners(...args),
}));

function makeMembership(overrides: Partial<MembershipRead> = {}): MembershipRead {
  return {
    id: 1,
    company_id: 100,
    domain: 'acme.com',
    company_name: 'Acme Corp',
    industry: 'Tech',
    employee_count: 500,
    hq_country: 'US',
    segment: null,
    cached_fit_score: 0.85,
    cached_likelihood_score: null,
    cached_urgency_score: null,
    is_processed: true,
    notes: null,
    priority: 0,
    logo_base64: null,
    logo_url: null,
    created_at: '2025-01-01T00:00:00Z',
    partner_id: null,
    partner_name: null,
    ...overrides,
  };
}

function makePartner(overrides: Partial<PartnerAssignmentSummary> = {}): PartnerAssignmentSummary {
  return {
    id: 1,
    partner_id: 10,
    partner_name: 'Brio Tech',
    partner_slug: 'brio-tech',
    partner_description: null,
    partner_website: null,
    partner_type: 'technology',
    partner_logo_url: null,
    partner_capacity: null,
    partner_industries: [],
    partner_status: 'active',
    assigned_count: 5,
    role_in_campaign: null,
    assigned_at: '2025-01-01T00:00:00Z',
    ...overrides,
  };
}

const defaultMemberships = [
  makeMembership({ id: 1, domain: 'acme.com', company_name: 'Acme Corp' }),
  makeMembership({ id: 2, domain: 'beta.io', company_name: 'Beta Inc', is_processed: false }),
  makeMembership({ id: 3, domain: 'gamma.dev', company_name: 'Gamma Ltd', partner_id: '10', partner_name: 'Brio Tech' }),
];

const defaultPartners = [makePartner()];

function mockSuccessfulFetch(memberships = defaultMemberships, partners = defaultPartners) {
  mockGetCampaignCompanies.mockResolvedValue({
    items: memberships,
    total: memberships.length,
    page: 1,
    page_size: 50,
    total_pages: 1,
    has_next: false,
    has_previous: false,
  });
  mockGetCampaignPartners.mockResolvedValue(partners);
}

beforeEach(() => {
  vi.clearAllMocks();
  mockSuccessfulFetch();
});

describe('useCampaignCompanies — initialization', () => {
  it('starts in loading state', () => {
    const { result } = renderHook(() => useCampaignCompanies({ slug: 'test' }));
    expect(result.current.loading).toBe(true);
  });

  it('fetches companies and partners on mount', async () => {
    const { result } = renderHook(() => useCampaignCompanies({ slug: 'test' }));
    await act(async () => {});

    expect(mockGetCampaignCompanies).toHaveBeenCalledOnce();
    expect(mockGetCampaignPartners).toHaveBeenCalledOnce();
    expect(result.current.loading).toBe(false);
    expect(result.current.companies).toHaveLength(3);
  });

  it('does not fetch when enabled is false', async () => {
    renderHook(() => useCampaignCompanies({ slug: 'test', enabled: false }));
    await act(async () => {});

    expect(mockGetCampaignCompanies).not.toHaveBeenCalled();
    expect(mockGetCampaignPartners).not.toHaveBeenCalled();
  });

  it('does not fetch when slug is empty', async () => {
    renderHook(() => useCampaignCompanies({ slug: '' }));
    await act(async () => {});

    expect(mockGetCampaignCompanies).not.toHaveBeenCalled();
  });
});

describe('useCampaignCompanies — data mapping', () => {
  it('maps MembershipRead to CompanyRowData correctly', async () => {
    const { result } = renderHook(() => useCampaignCompanies({ slug: 'test' }));
    await act(async () => {});

    const acme = result.current.companies.find((c) => c.domain === 'acme.com');
    expect(acme).toMatchObject({
      id: 1,
      name: 'Acme Corp',
      domain: 'acme.com',
      fit_score: 0.85,
      hq_country: 'US',
      employee_count: 500,
    });
  });

  it('uses domain as name when company_name is null', async () => {
    mockSuccessfulFetch([makeMembership({ company_name: null, domain: 'unknown.com' })]);
    const { result } = renderHook(() => useCampaignCompanies({ slug: 'test' }));
    await act(async () => {});

    expect(result.current.companies[0].name).toBe('unknown.com');
  });

  it('derives status "new" for unprocessed memberships', async () => {
    const { result } = renderHook(() => useCampaignCompanies({ slug: 'test' }));
    await act(async () => {});

    const beta = result.current.companies.find((c) => c.domain === 'beta.io');
    expect(beta?.status).toBe('new');
  });

  it('derives status "in_progress" for processed memberships with partner', async () => {
    const { result } = renderHook(() => useCampaignCompanies({ slug: 'test' }));
    await act(async () => {});

    const gamma = result.current.companies.find((c) => c.domain === 'gamma.dev');
    expect(gamma?.status).toBe('in_progress');
  });

  it('derives status "default" for processed memberships without partner', async () => {
    const { result } = renderHook(() => useCampaignCompanies({ slug: 'test' }));
    await act(async () => {});

    const acme = result.current.companies.find((c) => c.domain === 'acme.com');
    expect(acme?.status).toBe('default');
  });
});

describe('useCampaignCompanies — error handling', () => {
  it('sets error on fetch failure', async () => {
    mockGetCampaignCompanies.mockRejectedValue(new Error('Server error'));

    const { result } = renderHook(() => useCampaignCompanies({ slug: 'test' }));
    await act(async () => {});

    expect(result.current.error).toBe('Server error');
    expect(result.current.loading).toBe(false);
  });

  it('sets generic error for non-Error throws', async () => {
    mockGetCampaignCompanies.mockRejectedValue('unknown');

    const { result } = renderHook(() => useCampaignCompanies({ slug: 'test' }));
    await act(async () => {});

    expect(result.current.error).toBe('Failed to load companies');
  });

  it('gracefully handles partner fetch failure', async () => {
    mockGetCampaignPartners.mockRejectedValue(new Error('fail'));

    const { result } = renderHook(() => useCampaignCompanies({ slug: 'test' }));
    await act(async () => {});

    // Companies still load, partner filter shows only "Unassigned"
    expect(result.current.companies).toHaveLength(3);
    const partnerDef = result.current.filterDefinitions.find((d) => d.key === 'partner');
    expect(partnerDef?.options).toHaveLength(1);
    expect(partnerDef?.options[0].value).toBe('unassigned');
  });
});

describe('useCampaignCompanies — sort', () => {
  it('defaults to fit_score desc sort', async () => {
    renderHook(() => useCampaignCompanies({ slug: 'test' }));
    await act(async () => {});

    const lastCall = mockGetCampaignCompanies.mock.calls.at(-1);
    expect(lastCall?.[1]).toMatchObject({ sort_by: 'fit_score', sort_order: 'desc' });
  });

  it('passes sort params to API when changed', async () => {
    const { result } = renderHook(() => useCampaignCompanies({ slug: 'test' }));
    await act(async () => {});

    await act(async () => {
      result.current.setActiveSort({ field: 'name', direction: 'asc' });
    });
    await act(async () => {});

    const lastCall = mockGetCampaignCompanies.mock.calls.at(-1);
    expect(lastCall?.[1]).toMatchObject({ sort_by: 'name', sort_order: 'asc' });
  });

  it('resets page to 1 when sort changes', async () => {
    const { result } = renderHook(() => useCampaignCompanies({ slug: 'test' }));
    await act(async () => {});

    act(() => { result.current.setPage(3); });
    expect(result.current.page).toBe(3);

    await act(async () => {
      result.current.setActiveSort({ field: 'created_at', direction: 'desc' });
    });
    expect(result.current.page).toBe(1);
  });
});

describe('useCampaignCompanies — filters', () => {
  it('sends status filter to API', async () => {
    const { result } = renderHook(() => useCampaignCompanies({ slug: 'test' }));
    await act(async () => {});

    const statusFilter: ActiveFilter = {
      key: 'status',
      operator: 'is',
      value: 'new',
      fieldLabel: 'Status',
      valueLabel: 'New',
    };

    await act(async () => {
      result.current.setActiveFilters([statusFilter]);
    });
    await act(async () => {});

    const lastCall = mockGetCampaignCompanies.mock.calls.at(-1);
    expect(lastCall?.[1]).toMatchObject({ status: 'new' });
  });

  it('applies client-side status fallback filter', async () => {
    const { result } = renderHook(() => useCampaignCompanies({ slug: 'test' }));
    await act(async () => {});

    const statusFilter: ActiveFilter = {
      key: 'status',
      operator: 'is',
      value: 'new',
      fieldLabel: 'Status',
      valueLabel: 'New',
    };

    await act(async () => {
      result.current.setActiveFilters([statusFilter]);
    });
    await act(async () => {});

    // Only beta.io has is_processed=false → status 'new'
    expect(result.current.companies).toHaveLength(1);
    expect(result.current.companies[0].domain).toBe('beta.io');
  });

  it('applies client-side partner filter for "unassigned"', async () => {
    const { result } = renderHook(() => useCampaignCompanies({ slug: 'test' }));
    await act(async () => {});

    const partnerFilter: ActiveFilter = {
      key: 'partner',
      operator: 'is',
      value: 'unassigned',
      fieldLabel: 'Partner',
      valueLabel: 'Unassigned',
    };

    await act(async () => {
      result.current.setActiveFilters([partnerFilter]);
    });
    await act(async () => {});

    // acme and beta have no partner_id
    expect(result.current.companies).toHaveLength(2);
    expect(result.current.companies.every((c) => c.partner_name === undefined)).toBe(true);
  });

  it('applies client-side partner filter for specific partner', async () => {
    const { result } = renderHook(() => useCampaignCompanies({ slug: 'test' }));
    await act(async () => {});

    const partnerFilter: ActiveFilter = {
      key: 'partner',
      operator: 'is',
      value: '10',
      fieldLabel: 'Partner',
      valueLabel: 'Brio Tech',
    };

    await act(async () => {
      result.current.setActiveFilters([partnerFilter]);
    });
    await act(async () => {});

    expect(result.current.companies).toHaveLength(1);
    expect(result.current.companies[0].partner_name).toBe('Brio Tech');
  });

  it('resets page to 1 when filters change', async () => {
    const { result } = renderHook(() => useCampaignCompanies({ slug: 'test' }));
    await act(async () => {});

    act(() => { result.current.setPage(2); });
    expect(result.current.page).toBe(2);

    await act(async () => {
      result.current.setActiveFilters([
        { key: 'status', operator: 'is', value: 'new', fieldLabel: 'Status', valueLabel: 'New' },
      ]);
    });
    expect(result.current.page).toBe(1);
  });
});

describe('useCampaignCompanies — search', () => {
  it('filters companies by name (client-side, debounced)', async () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => useCampaignCompanies({ slug: 'test' }));
    await act(async () => {});
    expect(result.current.companies).toHaveLength(3);

    act(() => { result.current.setSearchQuery('acme'); });

    // Before debounce fires
    expect(result.current.companies).toHaveLength(3);

    // Advance past debounce
    act(() => { vi.advanceTimersByTime(350); });

    expect(result.current.companies).toHaveLength(1);
    expect(result.current.companies[0].name).toBe('Acme Corp');

    vi.useRealTimers();
  });

  it('filters companies by domain', async () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => useCampaignCompanies({ slug: 'test' }));
    await act(async () => {});

    act(() => { result.current.setSearchQuery('beta.io'); });
    act(() => { vi.advanceTimersByTime(350); });

    expect(result.current.companies).toHaveLength(1);
    expect(result.current.companies[0].domain).toBe('beta.io');

    vi.useRealTimers();
  });

  it('is case-insensitive', async () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => useCampaignCompanies({ slug: 'test' }));
    await act(async () => {});

    act(() => { result.current.setSearchQuery('GAMMA'); });
    act(() => { vi.advanceTimersByTime(350); });

    expect(result.current.companies).toHaveLength(1);
    expect(result.current.companies[0].name).toBe('Gamma Ltd');

    vi.useRealTimers();
  });

  it('returns all companies when search is cleared', async () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => useCampaignCompanies({ slug: 'test' }));
    await act(async () => {});

    act(() => { result.current.setSearchQuery('acme'); });
    act(() => { vi.advanceTimersByTime(350); });
    expect(result.current.companies).toHaveLength(1);

    act(() => { result.current.setSearchQuery(''); });
    act(() => { vi.advanceTimersByTime(350); });
    expect(result.current.companies).toHaveLength(3);

    vi.useRealTimers();
  });
});

describe('useCampaignCompanies — filter definitions', () => {
  it('includes status and partner filter definitions', async () => {
    const { result } = renderHook(() => useCampaignCompanies({ slug: 'test' }));
    await act(async () => {});

    const keys = result.current.filterDefinitions.map((d) => d.key);
    expect(keys).toContain('status');
    expect(keys).toContain('partner');
  });

  it('status filter has all status options', async () => {
    const { result } = renderHook(() => useCampaignCompanies({ slug: 'test' }));
    await act(async () => {});

    const statusDef = result.current.filterDefinitions.find((d) => d.key === 'status');
    const values = statusDef?.options.map((o) => o.value);
    expect(values).toEqual(['new', 'in_progress', 'closed_won', 'closed_lost', 'default']);
  });

  it('partner filter includes "Unassigned" plus fetched partners', async () => {
    const { result } = renderHook(() => useCampaignCompanies({ slug: 'test' }));
    await act(async () => {});

    const partnerDef = result.current.filterDefinitions.find((d) => d.key === 'partner');
    expect(partnerDef?.options).toHaveLength(2);
    expect(partnerDef?.options[0]).toMatchObject({ value: 'unassigned', label: 'Unassigned' });
    expect(partnerDef?.options[1]).toMatchObject({ value: '10', label: 'Brio Tech' });
  });

  it('exposes correct sort options', () => {
    const { result } = renderHook(() => useCampaignCompanies({ slug: 'test' }));
    const values = result.current.sortOptions.map((o) => o.value);
    expect(values).toEqual(['fit_score', 'name', 'created_at']);
  });
});
