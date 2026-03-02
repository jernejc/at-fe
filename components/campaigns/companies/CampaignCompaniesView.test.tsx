import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { CampaignCompaniesView } from './CampaignCompaniesView';
import type { UseCampaignCompaniesReturn } from './useCampaignCompanies';
import type { CompanyRowData } from '@/lib/schemas/company';
import type { PartnerAssignmentSummary } from '@/lib/schemas/partner';

vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: any) => <>{children}</>,
  TooltipTrigger: ({ children, className, style, ...props }: any) => (
    <span className={className} style={style} {...props}>{children}</span>
  ),
  TooltipContent: ({ children }: any) => <span>{children}</span>,
  TooltipProvider: ({ children }: any) => <>{children}</>,
}));

vi.mock('@/hooks/useCampaignExport', () => ({
  useCampaignExport: () => ({ isExporting: false, handleExport: vi.fn() }),
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

const defaultEditProps = {
  campaignSlug: 'test-slug',
  isEditing: false,
  selectedIds: new Set<number>(),
  selectedCount: 0,
  onToggleSelect: vi.fn(),
  onToggleSelectAll: vi.fn(),
  isAllSelected: false,
  isPartiallySelected: false,
  onStartEditing: vi.fn(),
  onCancelEditing: vi.fn(),
  onRemove: vi.fn(),
  onReassign: vi.fn(),
  isRemoving: false,
  isReassigning: false,
  editPartners: [] as PartnerAssignmentSummary[],
};

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
    refetch: vi.fn(),
    partners: [],
    ...overrides,
  };
}

function renderView(
  companiesOverrides: Partial<UseCampaignCompaniesReturn> = {},
  editOverrides: Partial<typeof defaultEditProps> = {},
) {
  return render(
    <CampaignCompaniesView
      {...makeDefaultProps(companiesOverrides)}
      {...defaultEditProps}
      {...editOverrides}
    />,
  );
}

describe('CampaignCompaniesView — company list', () => {
  it('renders company names in the list', () => {
    renderView();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Beta Inc')).toBeInTheDocument();
  });

  it('renders table header columns', () => {
    renderView();
    expect(screen.getByText('Company')).toBeInTheDocument();
    expect(screen.getByText('Fit')).toBeInTheDocument();
    expect(screen.getByText('Location')).toBeInTheDocument();
    expect(screen.getByText('Size')).toBeInTheDocument();
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('Partner')).toBeInTheDocument();
  });
});

describe('CampaignCompaniesView — loading state', () => {
  it('renders skeleton placeholders when loading', () => {
    const { container } = renderView({ loading: true });
    const pulses = container.querySelectorAll('.animate-pulse');
    expect(pulses.length).toBeGreaterThan(0);
  });

  it('does not render company names when loading', () => {
    renderView({ loading: true });
    expect(screen.queryByText('Acme Corp')).not.toBeInTheDocument();
  });

  it('still renders table headers during loading', () => {
    renderView({ loading: true });
    expect(screen.getByText('Company')).toBeInTheDocument();
  });
});

describe('CampaignCompaniesView — error state', () => {
  it('displays error message', () => {
    renderView({ error: 'Server error', companies: [] });
    expect(screen.getByText('Server error')).toBeInTheDocument();
  });
});

describe('CampaignCompaniesView — empty state', () => {
  it('shows "No companies yet" when no companies and no filters', () => {
    renderView({ companies: [], totalCount: 0 });
    expect(screen.getByText('No companies yet')).toBeInTheDocument();
    expect(screen.getByText('Add companies to this campaign to get started.')).toBeInTheDocument();
  });

  it('shows "No matching companies" when filters are active', () => {
    renderView({
      companies: [],
      totalCount: 0,
      activeFilters: [{
        key: 'status',
        operator: 'is',
        value: 'new',
        fieldLabel: 'Status',
        valueLabel: 'New',
      }],
    });
    expect(screen.getByText('No matching companies')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search or filters.')).toBeInTheDocument();
  });

  it('shows "No matching companies" when search is active', () => {
    renderView({ companies: [], totalCount: 0, searchQuery: 'nonexistent' });
    expect(screen.getByText('No matching companies')).toBeInTheDocument();
  });
});

describe('CampaignCompaniesView — selection', () => {
  it('passes onClick to company rows when onCompanyClick is provided', async () => {
    const user = userEvent.setup();
    const onCompanyClick = vi.fn();
    renderView({}, { onCompanyClick } as any);

    await user.click(screen.getByText('Acme Corp'));
    expect(onCompanyClick).toHaveBeenCalledWith(expect.objectContaining({ id: 1, name: 'Acme Corp' }));
  });

  it('marks the selected company row as active', () => {
    renderView({}, { selectedCompanyId: 2, onCompanyClick: vi.fn() } as any);

    const betaRow = screen.getByText('Beta Inc').closest('.group') as HTMLElement;
    expect(betaRow.className).toContain('bg-card');

    const acmeRow = screen.getByText('Acme Corp').closest('.group') as HTMLElement;
    expect(acmeRow.className).not.toMatch(/(?<!\S)bg-card(?!\S)/);
  });

  it('calls getItemRef for each company', () => {
    const getItemRef = vi.fn(() => vi.fn());
    renderView({}, { getItemRef } as any);

    expect(getItemRef).toHaveBeenCalledWith(1);
    expect(getItemRef).toHaveBeenCalledWith(2);
  });

  it('works without optional selection props', () => {
    renderView();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Beta Inc')).toBeInTheDocument();
  });
});

describe('CampaignCompaniesView — edit mode', () => {
  it('shows select toggles on rows when editing', () => {
    renderView({}, { isEditing: true });
    const checkboxes = screen.getAllByRole('checkbox');
    // 1 in table header + 2 in rows = 3
    expect(checkboxes.length).toBe(3);
  });

  it('does not show select toggles when not editing', () => {
    renderView({}, { isEditing: false });
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('shows select-all toggle in header with indeterminate state', () => {
    renderView({}, { isEditing: true, isPartiallySelected: true, isAllSelected: false });
    const headerCheckbox = screen.getAllByRole('checkbox')[0];
    expect(headerCheckbox).toHaveAttribute('aria-checked', 'mixed');
  });

  it('shows select-all toggle as checked when all selected', () => {
    renderView({}, { isEditing: true, isAllSelected: true, isPartiallySelected: false });
    const headerCheckbox = screen.getAllByRole('checkbox')[0];
    expect(headerCheckbox).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onToggleSelectAll when header toggle is clicked', () => {
    const onToggleSelectAll = vi.fn();
    renderView({}, { isEditing: true, onToggleSelectAll });

    const headerCheckbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(headerCheckbox);
    expect(onToggleSelectAll).toHaveBeenCalledOnce();
  });

  it('calls onToggleSelect when a row is clicked in edit mode', () => {
    const onToggleSelect = vi.fn();
    renderView({}, { isEditing: true, onToggleSelect });

    fireEvent.click(screen.getByText('Acme Corp'));
    expect(onToggleSelect).toHaveBeenCalledWith(1, expect.any(Boolean), expect.any(Array));
  });

  it('does not call onCompanyClick when in edit mode', () => {
    const onCompanyClick = vi.fn();
    renderView({}, { isEditing: true, onCompanyClick } as any);

    fireEvent.click(screen.getByText('Acme Corp'));
    expect(onCompanyClick).not.toHaveBeenCalled();
  });

  it('marks selected rows with active styles', () => {
    renderView({}, { isEditing: true, selectedIds: new Set([2]) });

    const betaRow = screen.getByText('Beta Inc').closest('.group') as HTMLElement;
    expect(betaRow.className).toContain('bg-card');
  });
});

describe('CampaignCompaniesView — toolbar edit mode', () => {
  it('shows Edit button when not editing', () => {
    renderView({}, { isEditing: false });
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('shows Cancel button when editing', () => {
    renderView({}, { isEditing: true });
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('shows selected count when editing', () => {
    renderView({}, { isEditing: true, selectedCount: 3 });
    expect(screen.getByText('3 selected')).toBeInTheDocument();
  });

  it('shows Remove and Reassign buttons when editing', () => {
    renderView({}, { isEditing: true });
    expect(screen.getByText('Remove')).toBeInTheDocument();
    expect(screen.getByText('Reassign')).toBeInTheDocument();
  });

  it('hides Export button when editing', () => {
    renderView({}, { isEditing: true });
    expect(screen.queryByText('Export')).not.toBeInTheDocument();
  });

  it('calls onStartEditing when Edit button is clicked', async () => {
    const user = userEvent.setup();
    const onStartEditing = vi.fn();
    renderView({}, { isEditing: false, onStartEditing });

    await user.click(screen.getByText('Edit'));
    expect(onStartEditing).toHaveBeenCalledOnce();
  });

  it('calls onCancelEditing when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancelEditing = vi.fn();
    renderView({}, { isEditing: true, onCancelEditing });

    await user.click(screen.getByText('Cancel'));
    expect(onCancelEditing).toHaveBeenCalledOnce();
  });
});
