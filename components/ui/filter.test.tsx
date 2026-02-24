import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Filter } from './filter';
import { FilterBadge } from './filter-badge';
import { FilterMenu } from './filter-menu';
import type { ActiveFilter, FilterDefinition } from '@/lib/schemas/filter';

const definitions: FilterDefinition[] = [
  {
    key: 'status',
    label: 'Status',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'draft', label: 'Draft' },
    ],
  },
  {
    key: 'industry',
    label: 'Industry',
    operators: ['is', 'is_not'],
    options: [
      { value: 'tech', label: 'Technology' },
      { value: 'health', label: 'Healthcare' },
    ],
  },
];

const activeFilter: ActiveFilter = {
  key: 'status',
  operator: 'is',
  value: 'active',
  fieldLabel: 'Status',
  valueLabel: 'Active',
};

// ---------- FilterBadge ----------

describe('FilterBadge', () => {
  it('renders field, operator, and value segments', () => {
    render(<FilterBadge filter={activeFilter} onRemove={() => {}} />);
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('is')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders the correct operator label for is_not', () => {
    const filter: ActiveFilter = { ...activeFilter, operator: 'is_not' };
    render(<FilterBadge filter={filter} onRemove={() => {}} />);
    expect(screen.getByText('is not')).toBeInTheDocument();
  });

  it('calls onRemove when the close button is clicked', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(<FilterBadge filter={activeFilter} onRemove={onRemove} />);

    await user.click(screen.getByRole('button', { name: /remove status filter/i }));
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it('applies additional className', () => {
    render(<FilterBadge filter={activeFilter} onRemove={() => {}} className="ml-4" />);
    const badge = screen.getByText('Status').closest('[data-slot="filter-badge"]');
    expect(badge?.className).toContain('ml-4');
  });
});

// ---------- FilterMenu ----------

describe('FilterMenu', () => {
  it('renders trigger with filter icon and label', () => {
    render(
      <FilterMenu definitions={definitions} activeFilters={[]} onFilterSelect={() => {}} />,
    );
    expect(screen.getByText('Filter')).toBeInTheDocument();
  });

  it('opens and shows all filter categories', async () => {
    const user = userEvent.setup();
    render(
      <FilterMenu definitions={definitions} activeFilters={[]} onFilterSelect={() => {}} />,
    );

    await user.click(screen.getByText('Filter'));
    expect(await screen.findByRole('menu')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Industry')).toBeInTheDocument();
  });

  it('calls onFilterSelect when a submenu option is clicked', async () => {
    const user = userEvent.setup();
    const onFilterSelect = vi.fn();
    render(
      <FilterMenu
        definitions={definitions}
        activeFilters={[]}
        onFilterSelect={onFilterSelect}
      />,
    );

    await user.click(screen.getByText('Filter'));
    await screen.findByRole('menu');
    // Click submenu trigger to open it
    await user.click(screen.getByText('Status'));
    // Use fireEvent for nested portal menu items (base-ui pointer events don't fire via userEvent in jsdom)
    const activeItem = await screen.findByText('Active');
    fireEvent.click(activeItem);

    expect(onFilterSelect).toHaveBeenCalledOnce();
    expect(onFilterSelect).toHaveBeenCalledWith('status', 'is', 'active');
  });

  it('uses the first operator from a multi-operator definition', async () => {
    const user = userEvent.setup();
    const onFilterSelect = vi.fn();
    render(
      <FilterMenu
        definitions={definitions}
        activeFilters={[]}
        onFilterSelect={onFilterSelect}
      />,
    );

    await user.click(screen.getByText('Filter'));
    await screen.findByRole('menu');
    await user.click(screen.getByText('Industry'));
    const techItem = await screen.findByText('Technology');
    fireEvent.click(techItem);

    expect(onFilterSelect).toHaveBeenCalledWith('industry', 'is', 'tech');
  });
});

// ---------- Filter (integrated) ----------

describe('Filter', () => {
  it('renders the filter trigger button', () => {
    render(<Filter definitions={definitions} value={[]} onValueChange={() => {}} />);
    expect(screen.getByText('Filter')).toBeInTheDocument();
  });

  it('renders active filter badges', () => {
    render(
      <Filter definitions={definitions} value={[activeFilter]} onValueChange={() => {}} />,
    );
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('is')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders multiple filter badges', () => {
    const filters: ActiveFilter[] = [
      activeFilter,
      { key: 'industry', operator: 'is', value: 'tech', fieldLabel: 'Industry', valueLabel: 'Technology' },
    ];
    render(<Filter definitions={definitions} value={filters} onValueChange={() => {}} />);
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Industry')).toBeInTheDocument();
  });

  it('calls onValueChange to remove a filter when badge X is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const filters: ActiveFilter[] = [
      activeFilter,
      { key: 'industry', operator: 'is', value: 'tech', fieldLabel: 'Industry', valueLabel: 'Technology' },
    ];
    render(<Filter definitions={definitions} value={filters} onValueChange={onChange} />);

    await user.click(screen.getByRole('button', { name: /remove status filter/i }));
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith([filters[1]]);
  });

  it('adds a new filter via submenu selection', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Filter definitions={definitions} value={[]} onValueChange={onChange} />);

    await user.click(screen.getByText('Filter'));
    await screen.findByRole('menu');
    await user.click(screen.getByText('Status'));
    fireEvent.click(await screen.findByText('Active'));

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith([
      {
        key: 'status',
        operator: 'is',
        value: 'active',
        fieldLabel: 'Status',
        valueLabel: 'Active',
      },
    ]);
  });

  it('replaces an existing filter for the same key', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Filter definitions={definitions} value={[activeFilter]} onValueChange={onChange} />,
    );

    await user.click(screen.getByRole('button', { name: 'Filter' }));
    await screen.findByRole('menu');
    // "Status" appears in both the badge and the menu; click the menu item
    const statusItems = screen.getAllByText('Status');
    await user.click(statusItems[statusItems.length - 1]);
    fireEvent.click(await screen.findByText('Draft'));

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith([
      {
        key: 'status',
        operator: 'is',
        value: 'draft',
        fieldLabel: 'Status',
        valueLabel: 'Draft',
      },
    ]);
  });
});
