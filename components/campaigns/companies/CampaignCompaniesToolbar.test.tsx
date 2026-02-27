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
  totalCount: 42,
  visibleCount: 42,
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

  it('displays total count when visible equals total', () => {
    renderToolbar({ totalCount: 25, visibleCount: 25 });
    expect(screen.getByText('25 companies')).toBeInTheDocument();
  });

  it('displays filtered count when visible differs from total', () => {
    renderToolbar({ totalCount: 100, visibleCount: 15 });
    expect(screen.getByText('15 of 100 companies')).toBeInTheDocument();
  });
});
