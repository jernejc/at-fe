import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DiscoveryView } from './DiscoveryView';
import type { CompanyRowData } from '@/lib/schemas';

vi.mock('@/components/campaigns/CompanyRow', () => ({
  CompanyRow: ({ company, onClick }: any) => (
    <div data-testid="company-row" onClick={() => onClick?.(company)}>
      {company.name}
    </div>
  ),
  CompanyRowSkeleton: () => <div className="animate-pulse" data-testid="company-row-skeleton" />,
}));

vi.mock('./DiscoveryToolbar', () => ({
  DiscoveryToolbar: (props: any) => (
    <div data-testid="discovery-toolbar" data-editing={props.isEditing} />
  ),
}));

vi.mock('@/components/ui/separator', () => ({
  Separator: () => <hr />,
}));

vi.mock('@/components/ui/select-toggle', () => ({
  SelectToggle: (props: any) => <input type="checkbox" data-testid="select-all" onChange={props.onChange} />,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

vi.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}));

vi.mock('@base-ui/react/popover', () => ({
  Popover: {
    Root: ({ children }: any) => <div>{children}</div>,
    Trigger: ({ render }: any) => <div>{render}</div>,
    Portal: ({ children }: any) => <div>{children}</div>,
    Positioner: ({ children }: any) => <div>{children}</div>,
    Popup: ({ children }: any) => <div>{children}</div>,
  },
}));

vi.mock('lucide-react', () => ({
  Building2: () => <span data-testid="icon-building" />,
  Download: () => <span data-testid="icon-download" />,
  Loader2: () => <span data-testid="icon-loader" />,
}));

function makeCompanyRow(overrides: Partial<CompanyRowData> = {}): CompanyRowData {
  return {
    id: 1,
    name: 'Acme Corp',
    domain: 'acme.com',
    logo_url: null,
    logo_base64: null,
    status: 'default',
    fit_score: 0.85,
    hq_country: 'US',
    employee_count: 500,
    ...overrides,
  };
}

const defaultProps: Parameters<typeof DiscoveryView>[0] = {
  companies: [],
  totalCount: 0,
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
  refetch: vi.fn(),
  isExporting: false,
  handleExport: vi.fn(),
  onCompanyClick: vi.fn(),
  isEditing: false,
  selectedIds: new Set<number>(),
  selectedCount: 0,
  onToggleSelect: vi.fn(),
  onToggleSelectAll: vi.fn(),
  isAllSelected: false,
  isPartiallySelected: false,
  onStartEditing: vi.fn(),
  onCancelEditing: vi.fn(),
  onNewCampaign: vi.fn(),
  onAddToExisting: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('DiscoveryView — title rendering', () => {
  it('shows "Companies" when loading', () => {
    render(<DiscoveryView {...defaultProps} loading={true} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Companies');
  });

  it('shows total count when not loading and totalCount > 0', () => {
    render(<DiscoveryView {...defaultProps} totalCount={42} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('42 companies');
  });

  it('shows "Companies" when totalCount is 0', () => {
    render(<DiscoveryView {...defaultProps} totalCount={0} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Companies');
  });

  it('formats large totalCount with locale separators', () => {
    render(<DiscoveryView {...defaultProps} totalCount={2780} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('2,780 companies');
  });
});

describe('DiscoveryView — loading state', () => {
  it('renders skeleton rows when loading', () => {
    render(<DiscoveryView {...defaultProps} loading={true} />);
    const skeletons = screen.getAllByTestId('company-row-skeleton');
    expect(skeletons).toHaveLength(8);
  });

  it('does not render company rows when loading', () => {
    const companies = [makeCompanyRow()];
    render(<DiscoveryView {...defaultProps} loading={true} companies={companies} totalCount={1} />);
    expect(screen.queryByTestId('company-row')).not.toBeInTheDocument();
  });
});

describe('DiscoveryView — error state', () => {
  it('displays the error message', () => {
    render(<DiscoveryView {...defaultProps} error="Network error" />);
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  it('does not render company rows on error', () => {
    render(<DiscoveryView {...defaultProps} error="Fail" companies={[makeCompanyRow()]} totalCount={1} />);
    expect(screen.queryByTestId('company-row')).not.toBeInTheDocument();
  });
});

describe('DiscoveryView — empty state without filters', () => {
  it('shows "No accounts found" when no companies and no filters', () => {
    render(<DiscoveryView {...defaultProps} />);
    expect(screen.getByText('No accounts found')).toBeInTheDocument();
    expect(screen.getByText('Accounts will appear here once data is available.')).toBeInTheDocument();
  });
});

describe('DiscoveryView — empty state with filters', () => {
  it('shows "No matching accounts" when filters are active', () => {
    const filters = [{ key: 'product', operator: 'is' as const, value: '1', fieldLabel: 'Product', valueLabel: 'Widget' }];
    render(<DiscoveryView {...defaultProps} activeFilters={filters} />);
    expect(screen.getByText('No matching accounts')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search or filters.')).toBeInTheDocument();
  });

  it('shows "No matching accounts" when search query is active', () => {
    render(<DiscoveryView {...defaultProps} searchQuery="zebra" />);
    expect(screen.getByText('No matching accounts')).toBeInTheDocument();
  });
});

describe('DiscoveryView — data state', () => {
  const companies = [
    makeCompanyRow({ id: 1, name: 'Alpha Inc' }),
    makeCompanyRow({ id: 2, name: 'Beta Corp' }),
  ];

  it('renders a row per company', () => {
    render(<DiscoveryView {...defaultProps} companies={companies} totalCount={2} />);
    expect(screen.getByText('Alpha Inc')).toBeInTheDocument();
    expect(screen.getByText('Beta Corp')).toBeInTheDocument();
    expect(screen.getAllByTestId('company-row')).toHaveLength(2);
  });

  it('shows the "Company" column header', () => {
    render(<DiscoveryView {...defaultProps} companies={companies} totalCount={2} />);
    expect(screen.getByText('Company')).toBeInTheDocument();
  });
});

describe('DiscoveryView — product filter affects UI', () => {
  const companies = [makeCompanyRow()];
  const productFilter = { key: 'product', operator: 'is' as const, value: '1', fieldLabel: 'Product', valueLabel: 'Widget' };

  it('shows "Fit" column header when product filter is active', () => {
    render(<DiscoveryView {...defaultProps} companies={companies} totalCount={1} activeFilters={[productFilter]} />);
    expect(screen.getByText('Fit')).toBeInTheDocument();
  });

  it('hides "Fit" column header when no product filter', () => {
    render(<DiscoveryView {...defaultProps} companies={companies} totalCount={1} />);
    expect(screen.queryByText('Fit')).not.toBeInTheDocument();
  });

  it('shows Export button when product filter is active', () => {
    render(<DiscoveryView {...defaultProps} companies={companies} totalCount={1} activeFilters={[productFilter]} />);
    expect(screen.getByText('Export')).toBeInTheDocument();
  });

  it('hides Export button when no product filter', () => {
    render(<DiscoveryView {...defaultProps} companies={companies} totalCount={1} />);
    expect(screen.queryByText('Export')).not.toBeInTheDocument();
  });
});

describe('DiscoveryView — interactions', () => {
  const companies = [makeCompanyRow({ id: 1, name: 'Alpha Inc' })];

  it('calls onCompanyClick when row is clicked', () => {
    const onClick = vi.fn();
    render(<DiscoveryView {...defaultProps} companies={companies} totalCount={1} onCompanyClick={onClick} />);
    fireEvent.click(screen.getByText('Alpha Inc'));
    expect(onClick).toHaveBeenCalledWith(companies[0]);
  });

  it('does not call onCompanyClick when in edit mode', () => {
    const onClick = vi.fn();
    render(<DiscoveryView {...defaultProps} companies={companies} totalCount={1} onCompanyClick={onClick} isEditing={true} />);
    fireEvent.click(screen.getByText('Alpha Inc'));
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('DiscoveryView — toolbar', () => {
  it('renders the toolbar', () => {
    render(<DiscoveryView {...defaultProps} />);
    expect(screen.getByTestId('discovery-toolbar')).toBeInTheDocument();
  });

  it('passes editing state to toolbar', () => {
    render(<DiscoveryView {...defaultProps} isEditing={true} />);
    expect(screen.getByTestId('discovery-toolbar')).toHaveAttribute('data-editing', 'true');
  });
});
