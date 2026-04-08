import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CampaignCompaniesToolbar } from './CampaignCompaniesToolbar';
import type { FilterDefinition, SortOptionDefinition } from '@/lib/schemas/filter';

const defaultFilterDefs: FilterDefinition[] = [
  {
    key: 'status',
    label: 'Status',
    operators: ['is'],
    options: [
      { value: 'new', label: 'New' },
      { value: 'default', label: 'Default' },
    ],
  },
];

const defaultSortOptions: SortOptionDefinition[] = [
  { value: 'fit_score', label: 'Fit Score' },
  { value: 'name', label: 'Name' },
];

const defaultProps: React.ComponentProps<typeof CampaignCompaniesToolbar> = {
  searchQuery: '',
  onSearchChange: vi.fn(),
  filterDefinitions: defaultFilterDefs,
  activeFilters: [],
  onFiltersChange: vi.fn(),
  sortOptions: defaultSortOptions,
  activeSort: null,
  onSortChange: vi.fn(),
  isEditing: false,
  selectedCount: 0,
  onStartEditing: vi.fn(),
  onCancelEditing: vi.fn(),
  onRemove: vi.fn(),
  onReassign: vi.fn(),
  isRemoving: false,
  isReassigning: false,
  partners: [],
};

function renderToolbar(overrides: Partial<React.ComponentProps<typeof CampaignCompaniesToolbar>> = {}) {
  const props = { ...defaultProps, ...overrides };
  return render(<CampaignCompaniesToolbar {...props} />);
}

describe('CampaignCompaniesToolbar', () => {
  it('renders the search input with placeholder', () => {
    renderToolbar();
    expect(screen.getByPlaceholderText('Search companies…')).toBeInTheDocument();
  });

  it('displays search value', () => {
    renderToolbar({ searchQuery: 'acme' });
    expect(screen.getByDisplayValue('acme')).toBeInTheDocument();
  });

  it('calls onSearchChange when typing', () => {
    const onSearchChange = vi.fn();
    renderToolbar({ onSearchChange });

    fireEvent.change(screen.getByPlaceholderText('Search companies…'), {
      target: { value: 'test' },
    });

    expect(onSearchChange).toHaveBeenCalledWith('test');
  });

  it('renders Filter button', () => {
    renderToolbar();
    expect(screen.getByText('Filter')).toBeInTheDocument();
  });

  it('renders Sort button', () => {
    renderToolbar();
    expect(screen.getByText('Sort')).toBeInTheDocument();
  });

  it('renders Edit button in normal mode', () => {
    renderToolbar();
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('shows edit toolbar when isEditing is true', () => {
    renderToolbar({ isEditing: true, selectedCount: 3 });
    expect(screen.getByText('3 selected')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Remove')).toBeInTheDocument();
  });

  it('hides search and filter when in edit mode', () => {
    renderToolbar({ isEditing: true });
    expect(screen.queryByPlaceholderText('Search companies…')).not.toBeInTheDocument();
    expect(screen.queryByText('Filter')).not.toBeInTheDocument();
  });
});
