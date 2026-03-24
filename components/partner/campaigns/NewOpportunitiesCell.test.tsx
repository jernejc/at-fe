import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NewOpportunitiesCell } from './NewOpportunitiesCell';
import type { NewOpportunityItem } from './useNewOpportunities';
import type { PartnerCompanyItem } from '@/lib/schemas';

// ── Mocks ──────────────────────────────────────────────────────────

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
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
      logo_url: null,
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
    assigned_by: null,
    assignment_status: 'active',
    notes: null,
    ...overrides,
  };
}

function makeOpportunity(overrides: Partial<PartnerCompanyItem> = {}): NewOpportunityItem {
  const item = makeCompanyItem(overrides);
  return { item, campaignSlug: item.campaign_slug, campaignName: item.campaign_name };
}

function defaultProps(overrides: Partial<React.ComponentProps<typeof NewOpportunitiesCell>> = {}) {
  return {
    items: [] as NewOpportunityItem[],
    loading: false,
    totalCount: 0,
    hasMore: false,
    loadMore: vi.fn(),
    loadingMore: false,
    ...overrides,
  };
}

// ── Tests ──────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

describe('NewOpportunitiesCell', () => {
  it('shows skeleton loaders when loading', () => {
    const { container } = render(<NewOpportunitiesCell {...defaultProps({ loading: true })} />);
    const pulses = container.querySelectorAll('.animate-pulse');
    expect(pulses.length).toBeGreaterThan(0);
  });

  it('shows empty state message when items is empty and not loading', () => {
    render(<NewOpportunitiesCell {...defaultProps()} />);
    expect(screen.getByText('No new opportunities this week')).toBeInTheDocument();
  });

  it('renders company rows when items are provided', () => {
    const items = [
      makeOpportunity({ company: { ...makeCompanyItem().company, id: 1, name: 'Alpha Inc' } }),
      makeOpportunity({ campaign_id: 20, company: { ...makeCompanyItem().company, id: 2, name: 'Beta Corp' } }),
    ];
    render(<NewOpportunitiesCell {...defaultProps({ items, totalCount: 2 })} />);
    expect(screen.getByText('Alpha Inc')).toBeInTheDocument();
    expect(screen.getByText('Beta Corp')).toBeInTheDocument();
  });

  it('shows total count badge when totalCount > 0 and not loading', () => {
    const items = [makeOpportunity()];
    render(<NewOpportunitiesCell {...defaultProps({ items, totalCount: 5 })} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('does not show count badge when loading', () => {
    render(<NewOpportunitiesCell {...defaultProps({ loading: true, totalCount: 5 })} />);
    expect(screen.queryByText('5')).not.toBeInTheDocument();
  });

  it('shows Load more button when hasMore is true', () => {
    const items = [makeOpportunity()];
    render(<NewOpportunitiesCell {...defaultProps({ items, totalCount: 1, hasMore: true })} />);
    expect(screen.getByRole('button', { name: 'Load more' })).toBeInTheDocument();
  });

  it('does not show Load more button when hasMore is false', () => {
    const items = [makeOpportunity()];
    render(<NewOpportunitiesCell {...defaultProps({ items, totalCount: 1, hasMore: false })} />);
    expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument();
  });

  it('calls loadMore when Load more button is clicked', () => {
    const loadMore = vi.fn();
    const items = [makeOpportunity()];
    render(<NewOpportunitiesCell {...defaultProps({ items, totalCount: 1, hasMore: true, loadMore })} />);
    fireEvent.click(screen.getByRole('button', { name: 'Load more' }));
    expect(loadMore).toHaveBeenCalledOnce();
  });

  it('shows loading text when loadingMore is true', () => {
    const items = [makeOpportunity()];
    render(<NewOpportunitiesCell {...defaultProps({ items, totalCount: 1, hasMore: true, loadingMore: true })} />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('disables Load more button when loadingMore is true', () => {
    const items = [makeOpportunity()];
    render(<NewOpportunitiesCell {...defaultProps({ items, totalCount: 1, hasMore: true, loadingMore: true })} />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('navigates to campaign companies page on row click', () => {
    const items = [makeOpportunity({ campaign_slug: 'my-campaign' })];
    render(<NewOpportunitiesCell {...defaultProps({ items, totalCount: 1 })} />);
    fireEvent.click(screen.getByText('Acme Corp'));
    expect(mockPush).toHaveBeenCalledWith('/partner/campaigns/my-campaign/companies');
  });
});
