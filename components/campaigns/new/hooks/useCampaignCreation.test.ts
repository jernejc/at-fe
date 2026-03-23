import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCampaignCreation } from './useCampaignCreation';
import type { CampaignRead } from '@/lib/schemas/campaign';
import type { WSCompanyResult, WSPartnerSuggestion } from '@/lib/schemas/search';
import type { PartnerSummary } from '@/lib/schemas/partner';

// --- Mocks ---

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockCreateCampaign = vi.fn();
const mockUpdateCampaign = vi.fn();
const mockAddCompaniesBulk = vi.fn();
vi.mock('@/lib/api/campaigns', () => ({
  createCampaign: (...args: any[]) => mockCreateCampaign(...args),
  updateCampaign: (...args: any[]) => mockUpdateCampaign(...args),
  addCompaniesBulk: (...args: any[]) => mockAddCompaniesBulk(...args),
}));

const mockBulkAssignPartners = vi.fn();
const mockAssignAllCompaniesToPartners = vi.fn();
vi.mock('@/lib/api/partners', () => ({
  bulkAssignPartners: (...args: any[]) => mockBulkAssignPartners(...args),
  assignAllCompaniesToPartners: (...args: any[]) => mockAssignAllCompaniesToPartners(...args),
}));

const mockToastWarning = vi.fn();
vi.mock('sonner', () => ({
  toast: {
    warning: (...args: any[]) => mockToastWarning(...args),
  },
}));

vi.mock('@/lib/config/campaign-icons', () => ({
  CAMPAIGN_ICON_NAMES: ['gem', 'rocket', 'star'],
}));

// --- Test data factories ---

function makeCampaign(overrides: Partial<CampaignRead> = {}): CampaignRead {
  return {
    id: 1,
    name: 'Test Campaign',
    slug: 'test-campaign',
    description: null,
    icon: null,
    owner: null,
    tags: [],
    target_criteria: null,
    target_product_id: 10,
    status: 'draft',
    company_count: 0,
    processed_count: 0,
    avg_fit_score: null,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    ...overrides,
  };
}

function makeCompany(overrides: Partial<WSCompanyResult> = {}): WSCompanyResult {
  return {
    entity_type: 'company',
    company_id: 1,
    domain: 'acme.com',
    name: 'Acme Corp',
    description: null,
    match_score: 0.95,
    product_fit_score: 0.8,
    vector_score: 0.75,
    keyword_score: 0.85,
    match_reasons: [],
    top_interests: [],
    key_employees: [],
    ...overrides,
  };
}

function makePartnerSuggestion(overrides: Partial<WSPartnerSuggestion> = {}): WSPartnerSuggestion {
  return {
    partner_id: 1,
    slug: 'partner-a',
    name: 'Partner A',
    description: null,
    match_score: 0.9,
    interest_coverage: 0.8,
    matched_interests: [],
    ...overrides,
  };
}

function makePartnerSummary(overrides: Partial<PartnerSummary> = {}): PartnerSummary {
  return {
    id: 2,
    name: 'Partner B',
    slug: 'partner-b',
    description: null,
    status: 'active',
    logo_url: null,
    industries: [],
    type: null,
    capacity: 10,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    ...overrides,
  };
}

const defaultCreateParams = {
  productId: 10,
  companies: [makeCompany()],
  selectedPartnerSlugs: new Set<string>(),
  partnerSuggestions: [] as WSPartnerSuggestion[],
  allPartners: [] as PartnerSummary[],
};

// --- Tests ---

beforeEach(() => {
  vi.clearAllMocks();
  mockCreateCampaign.mockResolvedValue(makeCampaign());
  mockUpdateCampaign.mockResolvedValue(makeCampaign());
  mockAddCompaniesBulk.mockResolvedValue({});
  mockBulkAssignPartners.mockResolvedValue({});
  mockAssignAllCompaniesToPartners.mockResolvedValue({});
});

describe('useCampaignCreation', () => {
  describe('initial state', () => {
    it('starts with empty name, not creating, and no error', () => {
      const { result } = renderHook(() => useCampaignCreation());

      expect(result.current.campaignName).toBe('');
      expect(result.current.isCreating).toBe(false);
      expect(result.current.createError).toBeNull();
    });

    it('picks a random icon from available icons', () => {
      const { result } = renderHook(() => useCampaignCreation());

      expect(['gem', 'rocket', 'star']).toContain(result.current.campaignIcon);
    });
  });

  describe('validation', () => {
    it('does not call any API when campaign name is empty', async () => {
      const { result } = renderHook(() => useCampaignCreation());

      await act(async () => {
        await result.current.create(defaultCreateParams);
      });

      expect(mockCreateCampaign).not.toHaveBeenCalled();
    });

    it('does not call any API when campaign name is only whitespace', async () => {
      const { result } = renderHook(() => useCampaignCreation());

      act(() => result.current.setCampaignName('   '));

      await act(async () => {
        await result.current.create(defaultCreateParams);
      });

      expect(mockCreateCampaign).not.toHaveBeenCalled();
    });
  });

  describe('successful creation', () => {
    it('creates campaign with trimmed name and navigates to it', async () => {
      const { result } = renderHook(() => useCampaignCreation());

      act(() => result.current.setCampaignName('  My Campaign  '));

      await act(async () => {
        await result.current.create(defaultCreateParams);
      });

      expect(mockCreateCampaign).toHaveBeenCalledWith({
        name: 'My Campaign',
        target_product_id: 10,
      });
      expect(mockPush).toHaveBeenCalledWith('/campaigns/test-campaign');
    });

    it('updates the campaign icon', async () => {
      const { result } = renderHook(() => useCampaignCreation());

      act(() => result.current.setCampaignName('Test'));

      await act(async () => {
        await result.current.create(defaultCreateParams);
      });

      expect(mockUpdateCampaign).toHaveBeenCalledWith('test-campaign', {
        icon: result.current.campaignIcon,
      });
    });

    it('adds companies in bulk when companies are provided', async () => {
      const companies = [
        makeCompany({ domain: 'acme.com' }),
        makeCompany({ domain: 'foo.com', company_id: 2 }),
      ];
      const { result } = renderHook(() => useCampaignCreation());

      act(() => result.current.setCampaignName('Test'));

      await act(async () => {
        await result.current.create({ ...defaultCreateParams, companies });
      });

      expect(mockAddCompaniesBulk).toHaveBeenCalledWith('test-campaign', ['acme.com', 'foo.com']);
    });

    it('skips addCompaniesBulk when no companies are provided', async () => {
      const { result } = renderHook(() => useCampaignCreation());

      act(() => result.current.setCampaignName('Test'));

      await act(async () => {
        await result.current.create({ ...defaultCreateParams, companies: [] });
      });

      expect(mockAddCompaniesBulk).not.toHaveBeenCalled();
    });

    it('assigns partners from suggestions and distributes companies', async () => {
      const suggestion = makePartnerSuggestion({ partner_id: 5, slug: 'partner-a' });
      const { result } = renderHook(() => useCampaignCreation());

      act(() => result.current.setCampaignName('Test'));

      await act(async () => {
        await result.current.create({
          ...defaultCreateParams,
          selectedPartnerSlugs: new Set(['partner-a']),
          partnerSuggestions: [suggestion],
        });
      });

      expect(mockBulkAssignPartners).toHaveBeenCalledWith('test-campaign', [5]);
      expect(mockAssignAllCompaniesToPartners).toHaveBeenCalledWith('test-campaign');
    });

    it('resolves partner IDs from allPartners when not in suggestions', async () => {
      const partner = makePartnerSummary({ id: 7, slug: 'partner-b' });
      const { result } = renderHook(() => useCampaignCreation());

      act(() => result.current.setCampaignName('Test'));

      await act(async () => {
        await result.current.create({
          ...defaultCreateParams,
          selectedPartnerSlugs: new Set(['partner-b']),
          partnerSuggestions: [],
          allPartners: [partner],
        });
      });

      expect(mockBulkAssignPartners).toHaveBeenCalledWith('test-campaign', [7]);
    });

    it('skips partner assignment when no partners are selected', async () => {
      const { result } = renderHook(() => useCampaignCreation());

      act(() => result.current.setCampaignName('Test'));

      await act(async () => {
        await result.current.create(defaultCreateParams);
      });

      expect(mockBulkAssignPartners).not.toHaveBeenCalled();
      expect(mockAssignAllCompaniesToPartners).not.toHaveBeenCalled();
    });

    it('does not show any toast warning on full success', async () => {
      const { result } = renderHook(() => useCampaignCreation());

      act(() => result.current.setCampaignName('Test'));

      await act(async () => {
        await result.current.create(defaultCreateParams);
      });

      expect(mockToastWarning).not.toHaveBeenCalled();
    });

    it('resets isCreating after successful creation', async () => {
      const { result } = renderHook(() => useCampaignCreation());

      act(() => result.current.setCampaignName('Test'));

      await act(async () => {
        await result.current.create(defaultCreateParams);
      });

      expect(result.current.isCreating).toBe(false);
    });
  });

  describe('createCampaign failure', () => {
    it('sets createError and does not navigate when createCampaign fails', async () => {
      mockCreateCampaign.mockRejectedValue(new Error('Network error'));
      const { result } = renderHook(() => useCampaignCreation());

      act(() => result.current.setCampaignName('Test'));

      await act(async () => {
        await result.current.create(defaultCreateParams);
      });

      expect(result.current.createError).toBe('Network error');
      expect(mockPush).not.toHaveBeenCalled();
      expect(mockUpdateCampaign).not.toHaveBeenCalled();
    });

    it('uses fallback message for non-Error throws', async () => {
      mockCreateCampaign.mockRejectedValue('something broke');
      const { result } = renderHook(() => useCampaignCreation());

      act(() => result.current.setCampaignName('Test'));

      await act(async () => {
        await result.current.create(defaultCreateParams);
      });

      expect(result.current.createError).toBe('Failed to create campaign. Please try again.');
    });

    it('resets isCreating after failure', async () => {
      mockCreateCampaign.mockRejectedValue(new Error('fail'));
      const { result } = renderHook(() => useCampaignCreation());

      act(() => result.current.setCampaignName('Test'));

      await act(async () => {
        await result.current.create(defaultCreateParams);
      });

      expect(result.current.isCreating).toBe(false);
    });
  });

  describe('partial failure after campaign creation', () => {
    it('navigates and shows warning when icon update fails', async () => {
      mockUpdateCampaign.mockRejectedValue(new Error('icon fail'));
      const { result } = renderHook(() => useCampaignCreation());

      act(() => result.current.setCampaignName('Test'));

      await act(async () => {
        await result.current.create(defaultCreateParams);
      });

      expect(result.current.createError).toBeNull();
      expect(mockPush).toHaveBeenCalledWith('/campaigns/test-campaign');
      expect(mockToastWarning).toHaveBeenCalledWith(
        expect.stringContaining('set the campaign icon'),
      );
    });

    it('navigates and shows warning when addCompaniesBulk fails', async () => {
      mockAddCompaniesBulk.mockRejectedValue(new Error('bulk fail'));
      const { result } = renderHook(() => useCampaignCreation());

      act(() => result.current.setCampaignName('Test'));

      await act(async () => {
        await result.current.create({
          ...defaultCreateParams,
          companies: [makeCompany()],
        });
      });

      expect(mockPush).toHaveBeenCalledWith('/campaigns/test-campaign');
      expect(mockToastWarning).toHaveBeenCalledWith(
        expect.stringContaining('add companies'),
      );
    });

    it('navigates and shows warning when partner assignment fails', async () => {
      mockBulkAssignPartners.mockRejectedValue(new Error('partner fail'));
      const suggestion = makePartnerSuggestion({ partner_id: 5, slug: 'p' });
      const { result } = renderHook(() => useCampaignCreation());

      act(() => result.current.setCampaignName('Test'));

      await act(async () => {
        await result.current.create({
          ...defaultCreateParams,
          selectedPartnerSlugs: new Set(['p']),
          partnerSuggestions: [suggestion],
        });
      });

      expect(mockPush).toHaveBeenCalledWith('/campaigns/test-campaign');
      expect(mockToastWarning).toHaveBeenCalledWith(
        expect.stringContaining('assign partners'),
      );
    });

    it('navigates and shows warning when assignAllCompaniesToPartners fails', async () => {
      mockAssignAllCompaniesToPartners.mockRejectedValue(new Error('distribute fail'));
      const suggestion = makePartnerSuggestion({ partner_id: 5, slug: 'p' });
      const { result } = renderHook(() => useCampaignCreation());

      act(() => result.current.setCampaignName('Test'));

      await act(async () => {
        await result.current.create({
          ...defaultCreateParams,
          selectedPartnerSlugs: new Set(['p']),
          partnerSuggestions: [suggestion],
        });
      });

      expect(mockPush).toHaveBeenCalledWith('/campaigns/test-campaign');
      expect(mockToastWarning).toHaveBeenCalledWith(
        expect.stringContaining('assign partners'),
      );
    });

    it('combines multiple warnings into a single toast', async () => {
      mockUpdateCampaign.mockRejectedValue(new Error('icon fail'));
      mockAddCompaniesBulk.mockRejectedValue(new Error('bulk fail'));
      const { result } = renderHook(() => useCampaignCreation());

      act(() => result.current.setCampaignName('Test'));

      await act(async () => {
        await result.current.create({
          ...defaultCreateParams,
          companies: [makeCompany()],
        });
      });

      expect(mockToastWarning).toHaveBeenCalledWith(
        expect.stringContaining('set the campaign icon and add companies'),
      );
      expect(mockPush).toHaveBeenCalledWith('/campaigns/test-campaign');
    });

    it('resets isCreating after partial failure', async () => {
      mockAddCompaniesBulk.mockRejectedValue(new Error('fail'));
      const { result } = renderHook(() => useCampaignCreation());

      act(() => result.current.setCampaignName('Test'));

      await act(async () => {
        await result.current.create(defaultCreateParams);
      });

      expect(result.current.isCreating).toBe(false);
    });
  });
});
