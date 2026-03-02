import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCampaignPartnerDetail } from './useCampaignPartnerDetail';
import type { PartnerCompanyAssignmentWithCompany } from '@/lib/schemas/partner';

const mockGetPartnerAssignedCompanies = vi.fn();
const mockBulkAssignCompaniesToPartner = vi.fn();
const mockUnassignCompanyFromPartner = vi.fn();
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();

vi.mock('@/lib/api/partners', () => ({
  getPartnerAssignedCompanies: (...args: any[]) => mockGetPartnerAssignedCompanies(...args),
  bulkAssignCompaniesToPartner: (...args: any[]) => mockBulkAssignCompaniesToPartner(...args),
  unassignCompanyFromPartner: (...args: any[]) => mockUnassignCompanyFromPartner(...args),
}));

vi.mock('sonner', () => ({
  toast: {
    success: (...args: any[]) => mockToastSuccess(...args),
    error: (...args: any[]) => mockToastError(...args),
  },
}));

function makeAssignment(overrides: Partial<PartnerCompanyAssignmentWithCompany> = {}): PartnerCompanyAssignmentWithCompany {
  return {
    id: 1,
    campaign_partner_id: 100,
    company_id: 200,
    status: null,
    notes: null,
    assigned_at: '2025-01-01T00:00:00Z',
    assigned_by: null,
    company: {
      id: 200,
      domain: 'acme.com',
      name: 'Acme Corp',
      industry: 'Tech',
      employee_count: 500,
      hq_city: 'San Francisco',
      hq_country: 'US',
      linkedin_id: null,
      rating_overall: 0.85,
      logo_url: 'https://example.com/logo.png',
      logo_base64: null,
      data_sources: [],
      top_contact: null,
      updated_at: '2025-01-01T00:00:00Z',
      data_depth: 'detailed' as const,
    },
    ...overrides,
  };
}

const defaultAssignments = [
  makeAssignment({ id: 1, company_id: 200 }),
  makeAssignment({
    id: 2,
    company_id: 201,
    company: {
      id: 201,
      domain: 'beta.io',
      name: 'Beta Inc',
      industry: 'Finance',
      employee_count: 100,
      hq_city: null,
      hq_country: 'UK',
      linkedin_id: null,
      rating_overall: 0.6,
      logo_url: null,
      logo_base64: null,
      data_sources: [],
      top_contact: null,
      updated_at: '2025-01-01T00:00:00Z',
      data_depth: 'initial' as const,
    },
  }),
];

beforeEach(() => {
  vi.clearAllMocks();
  mockGetPartnerAssignedCompanies.mockResolvedValue(defaultAssignments);
  mockBulkAssignCompaniesToPartner.mockResolvedValue({ assigned: 1, skipped: 0, errors: [] });
  mockUnassignCompanyFromPartner.mockResolvedValue(undefined);
});

describe('useCampaignPartnerDetail — fetching', () => {
  it('fetches companies on mount when isOpen, slug, and partnerId are provided', async () => {
    const { result } = renderHook(() =>
      useCampaignPartnerDetail({ slug: 'test-campaign', partnerId: 10, isOpen: true }),
    );
    await act(async () => {});

    expect(mockGetPartnerAssignedCompanies).toHaveBeenCalledWith('test-campaign', 10);
    expect(result.current.companies).toHaveLength(2);
    expect(result.current.loading).toBe(false);
  });

  it('clears companies when isOpen is false', async () => {
    const { result } = renderHook(() =>
      useCampaignPartnerDetail({ slug: 'test-campaign', partnerId: 10, isOpen: false }),
    );
    await act(async () => {});

    expect(mockGetPartnerAssignedCompanies).not.toHaveBeenCalled();
    expect(result.current.companies).toHaveLength(0);
  });

  it('maps PartnerCompanyAssignmentWithCompany to CompanyRowData', async () => {
    const { result } = renderHook(() =>
      useCampaignPartnerDetail({ slug: 'test-campaign', partnerId: 10, isOpen: true }),
    );
    await act(async () => {});

    const acme = result.current.companies.find((c) => c.domain === 'acme.com');
    expect(acme).toMatchObject({
      id: 200,
      name: 'Acme Corp',
      domain: 'acme.com',
      fit_score: 0.85,
      hq_country: 'US',
      employee_count: 500,
      logo_url: 'https://example.com/logo.png',
    });
  });

  it('sets companies to empty array on fetch error', async () => {
    mockGetPartnerAssignedCompanies.mockRejectedValue(new Error('fail'));

    const { result } = renderHook(() =>
      useCampaignPartnerDetail({ slug: 'test-campaign', partnerId: 10, isOpen: true }),
    );
    await act(async () => {});

    expect(result.current.companies).toHaveLength(0);
    expect(result.current.loading).toBe(false);
  });
});

describe('useCampaignPartnerDetail — reassignment', () => {
  it('unassigns from current partner and assigns to new partner', async () => {
    const { result } = renderHook(() =>
      useCampaignPartnerDetail({ slug: 'test-campaign', partnerId: 10, isOpen: true }),
    );
    await act(async () => {});

    await act(async () => {
      await result.current.reassignCompanies([200, 201], 20);
    });

    // Unassign each company from current partner (partnerId=10)
    expect(mockUnassignCompanyFromPartner).toHaveBeenCalledTimes(2);
    expect(mockUnassignCompanyFromPartner).toHaveBeenCalledWith('test-campaign', 10, 200);
    expect(mockUnassignCompanyFromPartner).toHaveBeenCalledWith('test-campaign', 10, 201);

    // Bulk assign to new partner
    expect(mockBulkAssignCompaniesToPartner).toHaveBeenCalledWith('test-campaign', 20, [200, 201]);
  });

  it('shows success toast on successful reassignment', async () => {
    const { result } = renderHook(() =>
      useCampaignPartnerDetail({ slug: 'test-campaign', partnerId: 10, isOpen: true }),
    );
    await act(async () => {});

    await act(async () => {
      await result.current.reassignCompanies([200], 20);
    });

    expect(mockToastSuccess).toHaveBeenCalledWith('Reassigned 1 company');
  });

  it('pluralises toast message for multiple companies', async () => {
    const { result } = renderHook(() =>
      useCampaignPartnerDetail({ slug: 'test-campaign', partnerId: 10, isOpen: true }),
    );
    await act(async () => {});

    await act(async () => {
      await result.current.reassignCompanies([200, 201], 20);
    });

    expect(mockToastSuccess).toHaveBeenCalledWith('Reassigned 2 companies');
  });

  it('shows error toast on failure', async () => {
    mockBulkAssignCompaniesToPartner.mockRejectedValue(new Error('Server error'));

    const { result } = renderHook(() =>
      useCampaignPartnerDetail({ slug: 'test-campaign', partnerId: 10, isOpen: true }),
    );
    await act(async () => {});

    await act(async () => {
      await result.current.reassignCompanies([200], 20);
    });

    expect(mockToastError).toHaveBeenCalledWith('Failed to reassign companies');
  });

  it('does nothing when companyIds is empty', async () => {
    const { result } = renderHook(() =>
      useCampaignPartnerDetail({ slug: 'test-campaign', partnerId: 10, isOpen: true }),
    );
    await act(async () => {});

    await act(async () => {
      await result.current.reassignCompanies([], 20);
    });

    expect(mockUnassignCompanyFromPartner).not.toHaveBeenCalled();
    expect(mockBulkAssignCompaniesToPartner).not.toHaveBeenCalled();
  });

  it('triggers refetch after successful reassignment', async () => {
    const { result } = renderHook(() =>
      useCampaignPartnerDetail({ slug: 'test-campaign', partnerId: 10, isOpen: true }),
    );
    await act(async () => {});

    expect(mockGetPartnerAssignedCompanies).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.reassignCompanies([200], 20);
    });
    await act(async () => {});

    // 1 initial + 1 refetch
    expect(mockGetPartnerAssignedCompanies).toHaveBeenCalledTimes(2);
  });
});

describe('useCampaignPartnerDetail — refetch', () => {
  it('refetch triggers a new fetch', async () => {
    const { result } = renderHook(() =>
      useCampaignPartnerDetail({ slug: 'test-campaign', partnerId: 10, isOpen: true }),
    );
    await act(async () => {});

    expect(mockGetPartnerAssignedCompanies).toHaveBeenCalledTimes(1);

    await act(async () => { result.current.refetch(); });
    await act(async () => {});

    expect(mockGetPartnerAssignedCompanies).toHaveBeenCalledTimes(2);
  });
});
