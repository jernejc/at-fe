import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

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

import { AnalysisCard } from './AnalysisCard';

const defaultProps = {
  signalNarrative: 'This company shows strong cloud adoption signals across multiple departments.',
};

describe('AnalysisCard', () => {
  it('renders Signal Analysis title', () => {
    render(<AnalysisCard {...defaultProps} />);
    expect(screen.getByText('Signal Analysis')).toBeInTheDocument();
  });

  it('renders signal narrative text', () => {
    render(<AnalysisCard {...defaultProps} />);
    expect(screen.getByText(defaultProps.signalNarrative)).toBeInTheDocument();
  });

  it('does not render expandable section when no additional narratives', () => {
    const { container } = render(<AnalysisCard {...defaultProps} />);
    expect(container.querySelector('[data-slot="expandable-card-footer"]')).not.toBeInTheDocument();
  });

  it('shows interest narrative in expanded state', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <AnalysisCard
        {...defaultProps}
        interestNarrative="Strong interest in cloud technologies."
      />,
    );

    const card = container.querySelector('[data-slot="expandable-card"]') as HTMLElement;
    await user.click(card);

    expect(await screen.findByText('Interest Analysis')).toBeInTheDocument();
    expect(screen.getByText('Strong interest in cloud technologies.')).toBeInTheDocument();
  });

  it('shows event narrative in expanded state', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <AnalysisCard
        {...defaultProps}
        eventNarrative="Recent product launch detected."
      />,
    );

    const card = container.querySelector('[data-slot="expandable-card"]') as HTMLElement;
    await user.click(card);

    expect(await screen.findByText('Event Analysis')).toBeInTheDocument();
    expect(screen.getByText('Recent product launch detected.')).toBeInTheDocument();
  });

  it('shows both interest and event narratives when expanded', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <AnalysisCard
        {...defaultProps}
        interestNarrative="Interest narrative here."
        eventNarrative="Event narrative here."
      />,
    );

    const card = container.querySelector('[data-slot="expandable-card"]') as HTMLElement;
    await user.click(card);

    expect(await screen.findByText('Interest Analysis')).toBeInTheDocument();
    expect(screen.getByText('Interest narrative here.')).toBeInTheDocument();
    expect(screen.getByText('Event Analysis')).toBeInTheDocument();
    expect(screen.getByText('Event narrative here.')).toBeInTheDocument();
  });
});
