import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCampaignCompanyDetail } from './useCampaignCompanyDetail';
import type { CompanyRead, CompanyExplainabilityResponse, FitScore } from '@/lib/schemas';

const mockUseAccountDetail = vi.fn();
const mockGetFitBreakdown = vi.fn();
const mockAssignCompanyToPartner = vi.fn();
const mockUnassignCompanyFromPartner = vi.fn();
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();

vi.mock('@/hooks/useAccountDetail', () => ({
  useAccountDetail: (...args: any[]) => mockUseAccountDetail(...args),
}));

vi.mock('@/lib/api/fit-scores', () => ({
  getFitBreakdown: (...args: any[]) => mockGetFitBreakdown(...args),
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

function makeAccountReturn(overrides: Record<string, any> = {}) {
  return {
    data: { company: makeCompanyRead(), counts: {} },
    playbooks: [],
    explainability: makeExplainability(),
    decisionMakers: [],
    employees: [],
    employeesTotal: 0,
    jobs: [],
    jobsTotal: 0,
    news: [],
    newsTotal: 0,
    loading: false,
    loadMoreJobs: vi.fn(),
    loadMoreNews: vi.fn(),
    loadMoreEmployees: vi.fn(),
    loadingMoreJobs: false,
    loadingMoreNews: false,
    loadingMoreEmployees: false,
    refetch: vi.fn(),
    refetchExplainability: vi.fn(),
    refetchPlaybooks: vi.fn(),
    allProducts: [{ id: 10, name: 'Product A' }],
    ...overrides,
  };
}

const defaultOptions = {
  domain: 'acme.com',
  companyId: 1,
  partnerId: null as string | null,
  slug: 'test-campaign',
  targetProductId: 10 as number | null,
  isOpen: true,
  onReassigned: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockUseAccountDetail.mockReturnValue(makeAccountReturn());
  mockGetFitBreakdown.mockResolvedValue(makeFitScore());
  mockAssignCompanyToPartner.mockResolvedValue({});
  mockUnassignCompanyFromPartner.mockResolvedValue(undefined);
});

describe('useCampaignCompanyDetail — data passthrough', () => {
  it('passes loading state through from useAccountDetail', () => {
    mockUseAccountDetail.mockReturnValue(makeAccountReturn({ loading: true }));

    const { result } = renderHook(() => useCampaignCompanyDetail(defaultOptions));
    expect(result.current.loading).toBe(true);
  });

  it('returns company data from useAccountDetail', async () => {
    const company = makeCompanyRead({ name: 'Test Co' });
    mockUseAccountDetail.mockReturnValue(makeAccountReturn({ data: { company, counts: {} } }));

    const { result } = renderHook(() => useCampaignCompanyDetail(defaultOptions));
    await act(async () => {});

    expect(result.current.company?.name).toBe('Test Co');
  });

  it('returns null company when account data is null', async () => {
    mockUseAccountDetail.mockReturnValue(makeAccountReturn({ data: null }));

    const { result } = renderHook(() => useCampaignCompanyDetail(defaultOptions));
    await act(async () => {});

    expect(result.current.company).toBeNull();
  });

  it('returns explainability from useAccountDetail', async () => {
    const explainability = makeExplainability({ signal_narrative: 'Strong signals detected' });
    mockUseAccountDetail.mockReturnValue(makeAccountReturn({ explainability }));

    const { result } = renderHook(() => useCampaignCompanyDetail(defaultOptions));
    await act(async () => {});

    expect(result.current.explainability?.signal_narrative).toBe('Strong signals detected');
  });
});

describe('useCampaignCompanyDetail — fit breakdown', () => {
  it('fetches fit breakdown when domain and productId are available', async () => {
    const { result } = renderHook(() => useCampaignCompanyDetail(defaultOptions));
    await act(async () => {});

    expect(mockGetFitBreakdown).toHaveBeenCalledWith('acme.com', 10);
    expect(result.current.fitBreakdown).toMatchObject({ combined_score: 0.8 });
  });

  it('falls back to first product ID when no targetProductId', async () => {
    mockUseAccountDetail.mockReturnValue(
      makeAccountReturn({ allProducts: [{ id: 42, name: 'Fallback Product' }] }),
    );

    renderHook(() => useCampaignCompanyDetail({ ...defaultOptions, targetProductId: null }));
    await act(async () => {});

    expect(mockGetFitBreakdown).toHaveBeenCalledWith('acme.com', 42);
  });

  it('does not fetch fit breakdown when account is still loading', async () => {
    mockUseAccountDetail.mockReturnValue(makeAccountReturn({ loading: true }));

    renderHook(() => useCampaignCompanyDetail(defaultOptions));
    await act(async () => {});

    expect(mockGetFitBreakdown).not.toHaveBeenCalled();
  });

  it('resets fitBreakdown to null when domain changes', async () => {
    const { result, rerender } = renderHook(
      (props) => useCampaignCompanyDetail(props),
      { initialProps: defaultOptions },
    );
    await act(async () => {});
    expect(result.current.fitBreakdown).not.toBeNull();

    rerender({ ...defaultOptions, domain: 'other.com' });
    // fitBreakdown reset happens synchronously on domain change
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
    expect(onReassigned).toHaveBeenCalledOnce();
    expect(mockToastSuccess).toHaveBeenCalledWith('Company reassigned successfully');
  });

  it('unassigns current partner before assigning new one when partnerId exists', async () => {
    const { result } = renderHook(() =>
      useCampaignCompanyDetail({ ...defaultOptions, partnerId: '5' }),
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
