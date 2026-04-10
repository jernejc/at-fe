import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { MergedSignalsList } from './MergedSignalsList';
import type { TaggedSignal } from '@/app/discovery/[slug]/products/useProductsAndSignals';

function makeSignal(overrides: Partial<TaggedSignal> = {}): TaggedSignal {
  return {
    id: 1,
    category: 'cloud_computing',
    display_name: 'Cloud Computing',
    strength: 8,
    confidence: 0.9,
    source_type: 'employee',
    source_types: ['employee'],
    source_ids: [1],
    component_count: 3,
    components: [],
    contributor_count: 2,
    weight_sum: 5,
    signalType: 'interest',
    ...overrides,
  } as TaggedSignal;
}

const defaultProps = {
  signals: [
    makeSignal({ id: 1, display_name: 'Cloud Computing', signalType: 'interest' }),
    makeSignal({ id: 2, display_name: 'Funding Round', signalType: 'event', strength: 6 }),
  ],
  loading: false,
  error: null as string | null,
  selectedSignalId: null as number | null,
  onSignalClick: vi.fn(),
};

describe('MergedSignalsList', () => {
  it('renders skeleton when loading', () => {
    const { container } = render(<MergedSignalsList {...defaultProps} loading />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('renders error message when error is set', () => {
    render(<MergedSignalsList {...defaultProps} signals={[]} error="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders empty state when no signals', () => {
    render(<MergedSignalsList {...defaultProps} signals={[]} />);
    expect(screen.getByText('No signals found.')).toBeInTheDocument();
  });

  it('renders signal rows', () => {
    render(<MergedSignalsList {...defaultProps} />);
    expect(screen.getByText('Cloud Computing')).toBeInTheDocument();
    expect(screen.getByText('Funding Round')).toBeInTheDocument();
  });

  it('calls onSignalClick when a signal row is clicked', async () => {
    const onSignalClick = vi.fn();
    const user = userEvent.setup();
    render(<MergedSignalsList {...defaultProps} onSignalClick={onSignalClick} />);

    await user.click(screen.getByText('Cloud Computing'));
    expect(onSignalClick).toHaveBeenCalledWith(1);
  });

  it('highlights the active signal row', () => {
    const { container } = render(
      <MergedSignalsList {...defaultProps} selectedSignalId={1} />,
    );
    // Active row has a specific class applied via SignalRow isActive prop
    const activeRow = container.querySelector('.bg-card');
    expect(activeRow).toBeInTheDocument();
  });
});
