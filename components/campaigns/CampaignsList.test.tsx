import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CampaignsList } from './CampaignsList';
import type { CampaignRowData } from '@/lib/schemas';

const mockUseCampaignsList = vi.fn();

vi.mock('./useCampaignsList', () => ({
  useCampaignsList: () => mockUseCampaignsList(),
  FILTER_DEFINITIONS: [
    { key: 'status', label: 'Status', operators: ['is'], options: [{ value: 'published', label: 'Active' }] },
    { key: 'owner', label: 'Owner', operators: ['is'], options: [{ value: 'mine', label: 'Me' }] },
  ],
  SORT_OPTIONS: [
    { value: 'name', label: 'Name' },
    { value: 'created_at', label: 'Date Created' },
  ],
}));

vi.mock('@/components/ui/pagination', () => ({
  Pagination: (props: any) => (
    <div data-testid="pagination" data-current-page={props.currentPage} data-total={props.totalCount} />
  ),
}));

vi.mock('@/components/ui/campaign-progress', () => ({
  CampaignProgress: () => <div data-testid="campaign-progress" />,
}));

vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: any) => <>{children}</>,
  TooltipTrigger: ({ children }: any) => <>{children}</>,
  TooltipContent: ({ children }: any) => <>{children}</>,
  TooltipProvider: ({ children }: any) => <>{children}</>,
}));

function makeCampaignRow(overrides: Partial<CampaignRowData> = {}): CampaignRowData {
  return {
    id: 1,
    name: 'Test Campaign',
    slug: 'test-campaign',
    status: 'active',
    company_count: 100,
    processed_count: 40,
    avg_fit_score: 0.72,
    target_product_id: null,
    owner: null,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    product_name: 'Widget Pro',
    ...overrides,
  };
}

const defaultHookValues = {
  paginatedRows: [] as CampaignRowData[],
  totalFiltered: 0,
  loading: false,
  error: null as string | null,
  hasNoCampaigns: false,
  hasNoResults: false,
  search: '',
  filters: [],
  sort: null,
  currentPage: 1,
  pageSize: 20,
  handleSearchChange: vi.fn(),
  handleFiltersChange: vi.fn(),
  handleSortChange: vi.fn(),
  handleNewCampaign: vi.fn(),
  handleRowClick: vi.fn(),
  handlePageChange: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockUseCampaignsList.mockReturnValue({ ...defaultHookValues });
});

describe('CampaignsList', () => {
  it('renders the page title and subtitle', () => {
    render(<CampaignsList />);

    expect(screen.getByText('Campaigns')).toBeInTheDocument();
    expect(screen.getByText('Manage your outreach campaigns and track performance')).toBeInTheDocument();
  });

  it('renders the New campaign button', () => {
    render(<CampaignsList />);
    expect(screen.getByText('New campaign')).toBeInTheDocument();
  });

  it('calls handleNewCampaign when the header button is clicked', async () => {
    const handleNewCampaign = vi.fn();
    mockUseCampaignsList.mockReturnValue({ ...defaultHookValues, handleNewCampaign });

    const user = userEvent.setup();
    render(<CampaignsList />);

    await user.click(screen.getByText('New campaign'));
    expect(handleNewCampaign).toHaveBeenCalledOnce();
  });

  it('renders the search field with placeholder', () => {
    render(<CampaignsList />);
    expect(screen.getByPlaceholderText('Search by name')).toBeInTheDocument();
  });

  it('renders the filter and sort toolbar buttons', () => {
    render(<CampaignsList />);
    expect(screen.getByText('Filter')).toBeInTheDocument();
    expect(screen.getByText('Sort')).toBeInTheDocument();
  });
});

describe('CampaignsList — loading state', () => {
  it('renders skeleton rows when loading', () => {
    mockUseCampaignsList.mockReturnValue({ ...defaultHookValues, loading: true });

    const { container } = render(<CampaignsList />);
    const pulses = container.querySelectorAll('.animate-pulse');
    expect(pulses.length).toBeGreaterThan(0);
  });

  it('renders table header during loading', () => {
    mockUseCampaignsList.mockReturnValue({ ...defaultHookValues, loading: true });

    render(<CampaignsList />);
    expect(screen.getByText('Campaign')).toBeInTheDocument();
  });
});

describe('CampaignsList — error state', () => {
  it('displays the error message', () => {
    mockUseCampaignsList.mockReturnValue({ ...defaultHookValues, error: 'Network error' });

    render(<CampaignsList />);
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  it('renders a retry button', () => {
    mockUseCampaignsList.mockReturnValue({ ...defaultHookValues, error: 'Failed' });

    render(<CampaignsList />);
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });
});

describe('CampaignsList — empty state (no campaigns)', () => {
  it('shows the no campaigns message and create button', () => {
    mockUseCampaignsList.mockReturnValue({ ...defaultHookValues, hasNoCampaigns: true });

    render(<CampaignsList />);
    expect(screen.getByText('No campaigns found')).toBeInTheDocument();
    expect(screen.getByText('Get started by creating your first campaign')).toBeInTheDocument();
    expect(screen.getByText('Create Campaign')).toBeInTheDocument();
  });

  it('calls handleNewCampaign when Create Campaign is clicked', async () => {
    const handleNewCampaign = vi.fn();
    mockUseCampaignsList.mockReturnValue({ ...defaultHookValues, hasNoCampaigns: true, handleNewCampaign });

    const user = userEvent.setup();
    render(<CampaignsList />);

    await user.click(screen.getByText('Create Campaign'));
    expect(handleNewCampaign).toHaveBeenCalledOnce();
  });
});

describe('CampaignsList — no results state (search/filter yields nothing)', () => {
  it('shows the no matches message', () => {
    mockUseCampaignsList.mockReturnValue({ ...defaultHookValues, hasNoResults: true });

    render(<CampaignsList />);
    expect(screen.getByText('No matches')).toBeInTheDocument();
    expect(screen.getByText('No campaigns match your search or filters')).toBeInTheDocument();
  });

  it('does not show the Create Campaign button', () => {
    mockUseCampaignsList.mockReturnValue({ ...defaultHookValues, hasNoResults: true });

    render(<CampaignsList />);
    expect(screen.queryByText('Create Campaign')).not.toBeInTheDocument();
  });
});

describe('CampaignsList — data state', () => {
  const rows = [
    makeCampaignRow({ id: 1, name: 'Alpha Campaign', slug: 'alpha' }),
    makeCampaignRow({ id: 2, name: 'Beta Campaign', slug: 'beta', product_name: 'Other Product' }),
  ];

  it('renders campaign rows', () => {
    mockUseCampaignsList.mockReturnValue({
      ...defaultHookValues,
      paginatedRows: rows,
      totalFiltered: 2,
    });

    render(<CampaignsList />);
    expect(screen.getByText('Alpha Campaign')).toBeInTheDocument();
    expect(screen.getByText('Beta Campaign')).toBeInTheDocument();
  });

  it('renders table column headers', () => {
    mockUseCampaignsList.mockReturnValue({
      ...defaultHookValues,
      paginatedRows: rows,
      totalFiltered: 2,
    });

    render(<CampaignsList />);
    expect(screen.getByText('Campaign')).toBeInTheDocument();
    expect(screen.getByText('Avg. fit')).toBeInTheDocument();
    expect(screen.getByText('Progress')).toBeInTheDocument();
    expect(screen.getByText('Conversion')).toBeInTheDocument();
    expect(screen.getByText('Total won')).toBeInTheDocument();
  });

  it('renders the pagination component', () => {
    mockUseCampaignsList.mockReturnValue({
      ...defaultHookValues,
      paginatedRows: rows,
      totalFiltered: 50,
      currentPage: 1,
      pageSize: 20,
    });

    render(<CampaignsList />);
    const pagination = screen.getByTestId('pagination');
    expect(pagination).toBeInTheDocument();
    expect(pagination).toHaveAttribute('data-total', '50');
  });

  it('calls handleRowClick when a campaign row is clicked', () => {
    const handleRowClick = vi.fn();
    mockUseCampaignsList.mockReturnValue({
      ...defaultHookValues,
      paginatedRows: [rows[0]],
      totalFiltered: 1,
      handleRowClick,
    });

    render(<CampaignsList />);
    fireEvent.click(screen.getByText('Alpha Campaign'));
    expect(handleRowClick).toHaveBeenCalledOnce();
  });
});
