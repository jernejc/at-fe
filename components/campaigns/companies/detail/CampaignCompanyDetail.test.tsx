import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { CompanyRowData, PartnerAssignmentSummary } from '@/lib/schemas';

// Mock framer-motion for ExpandableCard animations
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    motion: {
      ...actual.motion,
      div: ({ children, ...props }: React.ComponentProps<'div'>) => {
        const rest = Object.fromEntries(
          Object.entries(props).filter(([k]) => !['initial', 'animate', 'exit', 'transition'].includes(k)),
        );
        return <div {...rest}>{children}</div>;
      },
    },
  };
});

const mockUseCampaignCompanyDetail = vi.fn();

vi.mock('./useCampaignCompanyDetail', () => ({
  useCampaignCompanyDetail: (...args: any[]) => mockUseCampaignCompanyDetail(...args),
}));

import { CampaignCompanyDetail } from './CampaignCompanyDetail';

function makeCompanyRow(overrides: Partial<CompanyRowData> = {}): CompanyRowData {
  return {
    id: 1,
    name: 'Acme Corp',
    domain: 'acme.com',
    status: 'in_progress',
    partner_id: '10',
    partner_name: 'Brio Tech',
    partner_logo_url: null,
    ...overrides,
  };
}

function makeHookReturn(overrides: Record<string, any> = {}) {
  return {
    company: {
      id: 1,
      domain: 'acme.com',
      name: 'Acme Corp',
      description: 'Test company',
      industry: 'Tech',
      specialties: [],
      employee_count: 500,
      employee_count_range: '201-500',
      company_type: 'Private',
      founded_year: '2010',
      hq_city: 'San Francisco',
      hq_state: 'CA',
      hq_country: 'US',
    },
    explainability: {
      signal_narrative: null,
      interest_narrative: null,
      event_narrative: null,
      signals_summary: { interests: [], events: [] },
      fits_summary: [],
    },
    fitBreakdown: null,
    playbook: null,
    loading: false,
    fitLoading: false,
    playbookLoading: false,
    reassigning: false,
    reassignToPartner: vi.fn(),
    ...overrides,
  };
}

const defaultProps = {
  company: makeCompanyRow(),
  slug: 'test-campaign',
  targetProductId: 10 as number | null,
  partners: [] as PartnerAssignmentSummary[],
  onReassigned: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockUseCampaignCompanyDetail.mockReturnValue(makeHookReturn());
});

describe('CampaignCompanyDetail', () => {
  it('shows skeleton when loading', () => {
    mockUseCampaignCompanyDetail.mockReturnValue(makeHookReturn({ loading: true }));
    const { container } = render(<CampaignCompanyDetail {...defaultProps} />);
    // Skeleton renders skeleton elements, not the real cards
    expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0);
    expect(screen.queryByText('Assignment')).not.toBeInTheDocument();
  });

  it('renders AssignmentCard when loaded', () => {
    render(<CampaignCompanyDetail {...defaultProps} />);
    expect(screen.getByText('Assignment')).toBeInTheDocument();
  });

  it('renders CompanyInfoCard when company data is available', () => {
    render(<CampaignCompanyDetail {...defaultProps} />);
    expect(screen.getByText('Company info')).toBeInTheDocument();
  });

  it('does not render CompanyInfoCard when company is null', () => {
    mockUseCampaignCompanyDetail.mockReturnValue(makeHookReturn({ company: null }));
    render(<CampaignCompanyDetail {...defaultProps} />);
    expect(screen.queryByText('Company info')).not.toBeInTheDocument();
  });

  it('renders Signal Analysis card when signal_narrative exists', () => {
    mockUseCampaignCompanyDetail.mockReturnValue(
      makeHookReturn({
        explainability: {
          signal_narrative: 'Strong hiring signals detected',
          interest_narrative: null,
          event_narrative: null,
          signals_summary: { interests: [], events: [] },
          fits_summary: [],
        },
      }),
    );
    render(<CampaignCompanyDetail {...defaultProps} />);
    expect(screen.getByText('Signal Analysis')).toBeInTheDocument();
    expect(screen.getByText('Strong hiring signals detected')).toBeInTheDocument();
  });

  it('renders Interest Analysis card when interest_narrative exists', () => {
    mockUseCampaignCompanyDetail.mockReturnValue(
      makeHookReturn({
        explainability: {
          signal_narrative: null,
          interest_narrative: 'Cloud adoption is a key interest',
          event_narrative: null,
          signals_summary: { interests: [], events: [] },
          fits_summary: [],
        },
      }),
    );
    render(<CampaignCompanyDetail {...defaultProps} />);
    expect(screen.getByText('Interest Analysis')).toBeInTheDocument();
  });

  it('renders Event Analysis card when event_narrative exists', () => {
    mockUseCampaignCompanyDetail.mockReturnValue(
      makeHookReturn({
        explainability: {
          signal_narrative: null,
          interest_narrative: null,
          event_narrative: 'Recent product launch detected',
          signals_summary: { interests: [], events: [] },
          fits_summary: [],
        },
      }),
    );
    render(<CampaignCompanyDetail {...defaultProps} />);
    expect(screen.getByText('Event Analysis')).toBeInTheDocument();
  });

  it('renders ContactsCard when playbook has contacts', () => {
    mockUseCampaignCompanyDetail.mockReturnValue(
      makeHookReturn({
        playbook: {
          id: 1,
          contacts: [
            { id: 1, name: 'Jane Doe', title: 'VP Eng', priority_rank: 1, linkedin_url: null, outreach_templates: [] },
          ],
        },
      }),
    );
    render(<CampaignCompanyDetail {...defaultProps} />);
    expect(screen.getByText('Contacts')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  it('does not render ContactsCard when playbook is null', () => {
    render(<CampaignCompanyDetail {...defaultProps} />);
    expect(screen.queryByText('Contacts')).not.toBeInTheDocument();
  });

  it('does not render analysis cards when narratives are null', () => {
    render(<CampaignCompanyDetail {...defaultProps} />);
    expect(screen.queryByText('Signal Analysis')).not.toBeInTheDocument();
    expect(screen.queryByText('Interest Analysis')).not.toBeInTheDocument();
    expect(screen.queryByText('Event Analysis')).not.toBeInTheDocument();
  });

  it('passes correct props to the hook', () => {
    const company = makeCompanyRow({ domain: 'test.io', id: 42, partner_id: '5' });
    render(
      <CampaignCompanyDetail
        {...defaultProps}
        company={company}
        slug="my-campaign"
        targetProductId={99}
      />,
    );

    expect(mockUseCampaignCompanyDetail).toHaveBeenCalledWith(
      expect.objectContaining({
        domain: 'test.io',
        companyId: 42,
        partnerId: '5',
        slug: 'my-campaign',
        targetProductId: 99,
      }),
    );
  });
});
