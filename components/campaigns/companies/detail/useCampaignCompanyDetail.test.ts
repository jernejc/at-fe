import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCampaignCompanyDetail } from './useCampaignCompanyDetail';
import type { CompanyRead, CompanyExplainabilityResponse, FitScore } from '@/lib/schemas';

const mockGetCompany = vi.fn();
const mockGetCompanyExplainability = vi.fn();
const mockGetFitBreakdown = vi.fn();
const mockGetCompanyPlaybooks = vi.fn();
const mockGetCompanyPlaybook = vi.fn();
const mockAssignCompanyToPartner = vi.fn();
const mockUnassignCompanyFromPartner = vi.fn();
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();

vi.mock('@/lib/api/companies', () => ({
  getCompany: (...args: any[]) => mockGetCompany(...args),
  getCompanyExplainability: (...args: any[]) => mockGetCompanyExplainability(...args),
}));

vi.mock('@/lib/api/fit-scores', () => ({
  getFitBreakdown: (...args: any[]) => mockGetFitBreakdown(...args),
}));

vi.mock('@/lib/api/playbooks', () => ({
  getCompanyPlaybooks: (...args: any[]) => mockGetCompanyPlaybooks(...args),
  getCompanyPlaybook: (...args: any[]) => mockGetCompanyPlaybook(...args),
}));

vi.mock('@/lib/api/partners', () => ({
  assignCompanyToPartner: (...args: any[]) => mockAssignCompanyToPartner(...args),
  unassignCompanyFromPartner: (...args: any[]) => mockUnassignCompanyFromPartner(...args),
}));

vi.mock('sonner', () => ({
  toast: {
    success: (...args: any[]) => mockToastSuccess(...args),
    error: (...args: any[]) => mockToastError(...args),
  },
}));

function makeCompanyRead(overrides: Partial<CompanyRead> = {}): CompanyRead {
  return {
    id: 1,
    domain: 'acme.com',
    name: 'Acme Corp',
    linkedin_id: null,
    description: 'A test company',
    industry: 'Tech',
    category: null,
    specialties: [],
    technologies: [],
    keywords: [],
    employee_count: 500,
    employee_count_range: '201-500',
    company_type: 'Private',
    founded_year: '2010',
    hq_address: null,
    hq_city: 'San Francisco',
    hq_state: 'CA',
    hq_country: 'US',
    hq_country_code: 'US',
    locations: [],
    website_url: 'https://acme.com',
    emails: [],
    phones: [],
    social_profiles: [],
    ticker: null,
    stock_exchange: null,
    revenue: null,
    funding_rounds: [],
    rating_overall: null,
    rating_culture: null,
    rating_compensation: null,
    rating_work_life: null,
    rating_career: null,
    rating_management: null,
    reviews_count: null,
    reviews_url: null,
    has_pricing_page: null,
    has_free_trial: null,
    has_demo: null,
    has_api_docs: null,
    has_mobile_app: null,
    logo_url: null,
    logo_base64: null,
    meta_title: null,
    meta_description: null,
    followers_count: null,
    updates: [],
    coresignal_id: null,
    linkedin_source_id: null,
    data_sources: [],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    ...overrides,
  };
}

function makeFitScore(overrides: Partial<FitScore> = {}): FitScore {
  return {
    company_id: 1,
    company_domain: 'acme.com',
    company_name: 'Acme Corp',
    product_id: 10,
    product_name: 'Product A',
    likelihood_score: 0.75,
    urgency_score: 0.6,
    combined_score: 0.8,
    interest_matches: [],
    event_matches: [],
    top_drivers: ['hiring_growth'],
    missing_signals: [],
    signals_used: 5,
    calculated_at: '2025-01-01T00:00:00Z',
    ...overrides,
  };
}

function makeExplainability(overrides: Partial<CompanyExplainabilityResponse> = {}): CompanyExplainabilityResponse {
  return {
    company_id: 1,
    company_domain: 'acme.com',
    company_name: 'Acme Corp',
    signals_summary: {
      company_id: 1,
      company_domain: 'acme.com',
      company_name: 'Acme Corp',
      interests: [],
      events: [],
      aggregation: {},
      contributor_details: {},
      data_freshness: {},
    },
    signal_narrative: null,
    interest_narrative: null,
    event_narrative: null,
    fits_summary: [],
    playbooks_count: 0,
    data_coverage: null,
    freshness: null,
    links: {},
    ...overrides,
  };
}

const defaultOptions = {
  domain: 'acme.com',
  companyId: 1,
  partnerId: null as number | null,
  slug: 'test-campaign',
  targetProductId: 10 as number | null,
  onReassigned: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockGetCompany.mockResolvedValue({ company: makeCompanyRead(), counts: {} });
  mockGetCompanyExplainability.mockResolvedValue(makeExplainability());
  mockGetFitBreakdown.mockResolvedValue(makeFitScore());
  mockGetCompanyPlaybooks.mockResolvedValue({ playbooks: [{ id: 100, product_id: 10, product_name: 'Product A' }] });
  mockGetCompanyPlaybook.mockResolvedValue({ id: 100, contacts: [{ id: 1, name: 'Jane Doe' }] });
  mockAssignCompanyToPartner.mockResolvedValue({});
  mockUnassignCompanyFromPartner.mockResolvedValue(undefined);
});

describe('useCampaignCompanyDetail — data fetching', () => {
  it('starts in loading state', () => {
    const { result } = renderHook(() => useCampaignCompanyDetail(defaultOptions));
    expect(result.current.loading).toBe(true);
  });

  it('returns company data after loading', async () => {
    const company = makeCompanyRead({ name: 'Test Co' });
    mockGetCompany.mockResolvedValue({ company, counts: {} });

    const { result } = renderHook(() => useCampaignCompanyDetail(defaultOptions));
    await act(async () => {});

    expect(result.current.company?.name).toBe('Test Co');
    expect(result.current.loading).toBe(false);
  });

  it('returns null company on fetch error', async () => {
    mockGetCompany.mockRejectedValue(new Error('Not found'));

    const { result } = renderHook(() => useCampaignCompanyDetail(defaultOptions));
    await act(async () => {});

    expect(result.current.company).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('returns explainability after loading', async () => {
    const explainability = makeExplainability({ signal_narrative: 'Strong signals detected' });
    mockGetCompanyExplainability.mockResolvedValue(explainability);

    const { result } = renderHook(() => useCampaignCompanyDetail(defaultOptions));
    await act(async () => {});

    expect(result.current.explainability?.signal_narrative).toBe('Strong signals detected');
  });

  it('fetches company and explainability in parallel', async () => {
    renderHook(() => useCampaignCompanyDetail(defaultOptions));
    await act(async () => {});

    expect(mockGetCompany).toHaveBeenCalledWith('acme.com');
    expect(mockGetCompanyExplainability).toHaveBeenCalledWith('acme.com');
  });
});

describe('useCampaignCompanyDetail — fit breakdown', () => {
  it('fetches fit breakdown when domain and targetProductId are available', async () => {
    const { result } = renderHook(() => useCampaignCompanyDetail(defaultOptions));
    await act(async () => {});

    expect(mockGetFitBreakdown).toHaveBeenCalledWith('acme.com', 10);
    expect(result.current.fitBreakdown).toMatchObject({ combined_score: 0.8 });
  });

  it('does not fetch fit breakdown when targetProductId is null', async () => {
    const { result } = renderHook(() =>
      useCampaignCompanyDetail({ ...defaultOptions, targetProductId: null }),
    );
    await act(async () => {});

    expect(mockGetFitBreakdown).not.toHaveBeenCalled();
    expect(result.current.fitBreakdown).toBeNull();
  });

  it('resets fitBreakdown to null when domain changes', async () => {
    const { result, rerender } = renderHook(
      (props) => useCampaignCompanyDetail(props),
      { initialProps: defaultOptions },
    );
    await act(async () => {});
    expect(result.current.fitBreakdown).not.toBeNull();

    rerender({ ...defaultOptions, domain: 'other.com' });
    // fitBreakdown resets in the effect before new fetch resolves
    expect(result.current.fitBreakdown).toBeNull();
  });

  it('sets fitBreakdown to null on fetch error', async () => {
    mockGetFitBreakdown.mockRejectedValue(new Error('Not found'));

    const { result } = renderHook(() => useCampaignCompanyDetail(defaultOptions));
    await act(async () => {});

    expect(result.current.fitBreakdown).toBeNull();
    expect(result.current.fitLoading).toBe(false);
  });
});

describe('useCampaignCompanyDetail — playbook', () => {
  it('fetches playbook when domain and targetProductId are available', async () => {
    const { result } = renderHook(() => useCampaignCompanyDetail(defaultOptions));
    await act(async () => {});

    expect(mockGetCompanyPlaybooks).toHaveBeenCalledWith('acme.com');
    expect(mockGetCompanyPlaybook).toHaveBeenCalledWith('acme.com', 100);
    expect(result.current.playbook).toMatchObject({ id: 100 });
    expect(result.current.playbookLoading).toBe(false);
  });

  it('does not fetch playbook when targetProductId is null', async () => {
    const { result } = renderHook(() =>
      useCampaignCompanyDetail({ ...defaultOptions, targetProductId: null }),
    );
    await act(async () => {});

    expect(mockGetCompanyPlaybooks).not.toHaveBeenCalled();
    expect(result.current.playbook).toBeNull();
    expect(result.current.playbookLoading).toBe(false);
  });

  it('sets playbook to null when no matching playbook is found', async () => {
    mockGetCompanyPlaybooks.mockResolvedValue({ playbooks: [{ id: 200, product_id: 999, product_name: 'Other' }] });

    const { result } = renderHook(() => useCampaignCompanyDetail(defaultOptions));
    await act(async () => {});

    expect(mockGetCompanyPlaybook).not.toHaveBeenCalled();
    expect(result.current.playbook).toBeNull();
    expect(result.current.playbookLoading).toBe(false);
  });

  it('sets playbook to null on fetch error', async () => {
    mockGetCompanyPlaybooks.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useCampaignCompanyDetail(defaultOptions));
    await act(async () => {});

    expect(result.current.playbook).toBeNull();
    expect(result.current.playbookLoading).toBe(false);
  });

  it('resets playbook when domain changes', async () => {
    const { result, rerender } = renderHook(
      (props) => useCampaignCompanyDetail(props),
      { initialProps: defaultOptions },
    );
    await act(async () => {});
    expect(result.current.playbook).not.toBeNull();

    rerender({ ...defaultOptions, domain: 'other.com' });
    expect(result.current.playbook).toBeNull();
  });
});

describe('useCampaignCompanyDetail — reassignment', () => {
  it('assigns company to new partner and fires onReassigned', async () => {
    const onReassigned = vi.fn();
    const { result } = renderHook(() =>
      useCampaignCompanyDetail({ ...defaultOptions, onReassigned }),
    );
    await act(async () => {});

    await act(async () => {
      await result.current.reassignToPartner(20);
    });

    expect(mockAssignCompanyToPartner).toHaveBeenCalledWith('test-campaign', 20, { company_id: 1 });
    expect(mockUnassignCompanyFromPartner).not.toHaveBeenCalled();
    expect(onReassigned).toHaveBeenCalledWith(20);
    expect(mockToastSuccess).toHaveBeenCalledWith('Company reassigned successfully');
  });

  it('unassigns current partner before assigning new one when partnerId exists', async () => {
    const { result } = renderHook(() =>
      useCampaignCompanyDetail({ ...defaultOptions, partnerId: 5 }),
    );
    await act(async () => {});

    await act(async () => {
      await result.current.reassignToPartner(20);
    });

    expect(mockUnassignCompanyFromPartner).toHaveBeenCalledWith('test-campaign', 5, 1);
    expect(mockAssignCompanyToPartner).toHaveBeenCalledWith('test-campaign', 20, { company_id: 1 });
  });

  it('shows error toast on failure', async () => {
    mockAssignCompanyToPartner.mockRejectedValue(new Error('API error'));

    const { result } = renderHook(() => useCampaignCompanyDetail(defaultOptions));
    await act(async () => {});

    await act(async () => {
      await result.current.reassignToPartner(20);
    });

    expect(mockToastError).toHaveBeenCalledWith('Failed to reassign company', {
      description: 'API error',
    });
    expect(defaultOptions.onReassigned).not.toHaveBeenCalled();
  });

  it('sets reassigning flag during operation', async () => {
    let resolveAssign: () => void;
    mockAssignCompanyToPartner.mockReturnValue(
      new Promise<void>((resolve) => { resolveAssign = resolve; }),
    );

    const { result } = renderHook(() => useCampaignCompanyDetail(defaultOptions));
    await act(async () => {});
    expect(result.current.reassigning).toBe(false);

    let promise: Promise<void>;
    act(() => {
      promise = result.current.reassignToPartner(20);
    });
    expect(result.current.reassigning).toBe(true);

    await act(async () => {
      resolveAssign!();
      await promise!;
    });
    expect(result.current.reassigning).toBe(false);
  });
});
