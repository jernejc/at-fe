import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CampaignCompaniesView } from './CampaignCompaniesView';
import type { UseCampaignCompaniesReturn } from './useCampaignCompanies';
import type { CompanyRowData } from '@/lib/schemas/company';

vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: any) => <>{children}</>,
  TooltipTrigger: ({ children, className, style, ...props }: any) => (
    <span className={className} style={style} {...props}>{children}</span>
  ),
  TooltipContent: ({ children }: any) => <span>{children}</span>,
  TooltipProvider: ({ children }: any) => <>{children}</>,
}));

function makeCompany(overrides: Partial<CompanyRowData> = {}): CompanyRowData {
  return {
    id: 1,
    name: 'Acme Corp',
    domain: 'acme.com',
    status: 'default',
    ...overrides,
  };
}

function makeDefaultProps(overrides: Partial<UseCampaignCompaniesReturn> = {}): UseCampaignCompaniesReturn {
  return {
    companies: [
      makeCompany({ id: 1, name: 'Acme Corp', domain: 'acme.com' }),
      makeCompany({ id: 2, name: 'Beta Inc', domain: 'beta.io' }),
    ],
    totalCount: 2,
    loading: false,
    error: null,
    page: 1,
    pageSize: 50,
    setPage: vi.fn(),
    searchQuery: '',
    setSearchQuery: vi.fn(),
    filterDefinitions: [],
    activeFilters: [],
    setActiveFilters: vi.fn(),
    sortOptions: [],
    activeSort: null,
    setActiveSort: vi.fn(),
    ...overrides,
  };
}

describe('CampaignCompaniesView — company list', () => {
  it('renders company names in the list', () => {
    render(<CampaignCompaniesView {...makeDefaultProps()} />);
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Beta Inc')).toBeInTheDocument();
  });

  it('renders table header columns', () => {
    render(<CampaignCompaniesView {...makeDefaultProps()} />);
    expect(screen.getByText('Company')).toBeInTheDocument();
    expect(screen.getByText('Fit')).toBeInTheDocument();
    expect(screen.getByText('Location')).toBeInTheDocument();
    expect(screen.getByText('Size')).toBeInTheDocument();
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('Partner')).toBeInTheDocument();
  });

  it('displays the company count', () => {
    render(<CampaignCompaniesView {...makeDefaultProps()} />);
    expect(screen.getByText('2 companies')).toBeInTheDocument();
  });

  it('displays filtered count when visible differs from total', () => {
    render(<CampaignCompaniesView {...makeDefaultProps({
      companies: [makeCompany()],
      totalCount: 10,
    })} />);
    expect(screen.getByText('1 of 10 companies')).toBeInTheDocument();
  });
});

describe('CampaignCompaniesView — loading state', () => {
  it('renders skeleton placeholders when loading', () => {
    const { container } = render(<CampaignCompaniesView {...makeDefaultProps({ loading: true })} />);
    const pulses = container.querySelectorAll('.animate-pulse');
    expect(pulses.length).toBeGreaterThan(0);
  });

  it('does not render company names when loading', () => {
    render(<CampaignCompaniesView {...makeDefaultProps({ loading: true })} />);
    expect(screen.queryByText('Acme Corp')).not.toBeInTheDocument();
  });

  it('still renders table headers during loading', () => {
    render(<CampaignCompaniesView {...makeDefaultProps({ loading: true })} />);
    expect(screen.getByText('Company')).toBeInTheDocument();
  });
});

describe('CampaignCompaniesView — error state', () => {
  it('displays error message', () => {
    render(<CampaignCompaniesView {...makeDefaultProps({ error: 'Server error', companies: [] })} />);
    expect(screen.getByText('Server error')).toBeInTheDocument();
  });
});

describe('CampaignCompaniesView — empty state', () => {
  it('shows "No companies yet" when no companies and no filters', () => {
    render(<CampaignCompaniesView {...makeDefaultProps({ companies: [], totalCount: 0 })} />);
    expect(screen.getByText('No companies yet')).toBeInTheDocument();
    expect(screen.getByText('Add companies to this campaign to get started.')).toBeInTheDocument();
  });

  it('shows "No matching companies" when filters are active', () => {
    render(<CampaignCompaniesView {...makeDefaultProps({
      companies: [],
      totalCount: 0,
      activeFilters: [{
        key: 'status',
        operator: 'is',
        value: 'new',
        fieldLabel: 'Status',
        valueLabel: 'New',
      }],
    })} />);
    expect(screen.getByText('No matching companies')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search or filters.')).toBeInTheDocument();
  });

  it('shows "No matching companies" when search is active', () => {
    render(<CampaignCompaniesView {...makeDefaultProps({
      companies: [],
      totalCount: 0,
      searchQuery: 'nonexistent',
    })} />);
    expect(screen.getByText('No matching companies')).toBeInTheDocument();
  });
});
