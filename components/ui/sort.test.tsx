import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Sort } from './sort';
import type { SortOptionDefinition, SortState } from '@/lib/schemas/filter';

const options: SortOptionDefinition[] = [
  { value: 'created_at', label: 'Date Created' },
  { value: 'name', label: 'Name' },
  { value: 'score', label: 'Fit Score' },
];

const activeSort: SortState = { field: 'created_at', direction: 'desc' };

describe('Sort', () => {
  it('renders the sort trigger button', () => {
    render(<Sort options={options} value={null} onValueChange={() => {}} />);
    expect(screen.getByText('Sort')).toBeInTheDocument();
  });

  it('does not render a badge when value is null', () => {
    render(<Sort options={options} value={null} onValueChange={() => {}} />);
    expect(screen.queryByText('by')).not.toBeInTheDocument();
  });

  it('renders a sort badge when value is set', () => {
    render(<Sort options={options} value={activeSort} onValueChange={() => {}} />);
    expect(screen.getByText('by')).toBeInTheDocument();
    expect(screen.getByText('Date Created')).toBeInTheDocument();
  });

  it('opens the dropdown and shows all options on click', async () => {
    const user = userEvent.setup();
    render(<Sort options={options} value={null} onValueChange={() => {}} />);

    await user.click(screen.getByText('Sort'));
    // Wait for portal-rendered menu
    expect(await screen.findByRole('menu')).toBeInTheDocument();
    expect(screen.getByText('Date Created')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Fit Score')).toBeInTheDocument();
  });

  it('calls onValueChange with desc direction when selecting an option', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Sort options={options} value={null} onValueChange={onChange} />);

    await user.click(screen.getByText('Sort'));
    await screen.findByRole('menu');
    await user.click(screen.getByText('Name'));

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith({ field: 'name', direction: 'desc' });
  });

  it('toggles direction when the arrow button in the badge is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Sort options={options} value={activeSort} onValueChange={onChange} />);

    await user.click(screen.getByRole('button', { name: /sort ascending/i }));
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith({ field: 'created_at', direction: 'asc' });
  });

  it('toggles from asc to desc', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const ascSort: SortState = { field: 'created_at', direction: 'asc' };
    render(<Sort options={options} value={ascSort} onValueChange={onChange} />);

    await user.click(screen.getByRole('button', { name: /sort descending/i }));
    expect(onChange).toHaveBeenCalledWith({ field: 'created_at', direction: 'desc' });
  });

  it('calls onValueChange with null when the remove button is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Sort options={options} value={activeSort} onValueChange={onChange} />);

    await user.click(screen.getByRole('button', { name: /remove sort/i }));
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('applies additional className', () => {
    const { container } = render(
      <Sort options={options} value={null} onValueChange={() => {}} className="ml-4" />,
    );
    const root = container.querySelector('[data-slot="sort"]');
    expect(root?.className).toContain('ml-4');
  });
});
