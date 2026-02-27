import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Brain } from 'lucide-react';
import type { SignalInterest, SignalEvent } from '@/lib/schemas';

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

function makeInterest(overrides: Partial<SignalInterest> = {}): SignalInterest {
  return {
    id: 1,
    category: 'cloud_adoption',
    display_name: 'Cloud Adoption',
    strength: 7.5,
    confidence: 0.8,
    urgency_impact: null,
    evidence_summary: 'Multiple cloud-related hiring signals',
    source_type: 'employee',
    source_types: ['employee', 'job'],
    source_ids: [1, 2],
    source_ids_by_type: {},
    component_signal_ids: [1],
    component_count: 2,
    components: [],
    aggregation_method: null,
    contributor_count: 3,
    weight_sum: 2.5,
    ...overrides,
  };
}

function makeEvent(overrides: Partial<SignalEvent> = {}): SignalEvent {
  return {
    id: 10,
    category: 'product_launch',
    display_name: 'Product Launch',
    strength: 6.0,
    confidence: 0.7,
    urgency_impact: null,
    evidence_summary: 'Recent product announcement detected',
    source_type: 'news',
    source_types: ['news'],
    source_ids: [5],
    source_ids_by_type: {},
    component_signal_ids: [5],
    component_count: 1,
    components: [],
    aggregation_method: null,
    contributor_count: 1,
    weight_sum: 1.0,
    ...overrides,
  };
}

const defaultProps = {
  title: 'Signal Analysis',
  icon: Brain,
  narrative: 'This company shows strong cloud adoption signals across multiple departments.',
  interests: [] as SignalInterest[],
  events: [] as SignalEvent[],
  accentColor: 'violet' as const,
};

describe('AnalysisCard', () => {
  it('renders title', () => {
    render(<AnalysisCard {...defaultProps} />);
    expect(screen.getByText('Signal Analysis')).toBeInTheDocument();
  });

  it('renders narrative text', () => {
    render(<AnalysisCard {...defaultProps} />);
    expect(screen.getByText(defaultProps.narrative)).toBeInTheDocument();
  });

  it('applies correct accent color classes for violet', () => {
    const { container } = render(<AnalysisCard {...defaultProps} />);
    const iconContainer = container.querySelector('.bg-violet-100');
    expect(iconContainer).toBeInTheDocument();
  });

  it('applies correct accent color classes for amber', () => {
    const { container } = render(<AnalysisCard {...defaultProps} accentColor="amber" />);
    const iconContainer = container.querySelector('.bg-amber-100');
    expect(iconContainer).toBeInTheDocument();
  });

  it('applies correct accent color classes for blue', () => {
    const { container } = render(<AnalysisCard {...defaultProps} accentColor="blue" />);
    const iconContainer = container.querySelector('.bg-blue-100');
    expect(iconContainer).toBeInTheDocument();
  });

  it('does not render expandable section when no signals', () => {
    const { container } = render(<AnalysisCard {...defaultProps} />);
    expect(container.querySelector('[data-slot="expandable-card-footer"]')).not.toBeInTheDocument();
  });

  it('shows interests section in expanded state', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <AnalysisCard {...defaultProps} interests={[makeInterest()]} />,
    );

    const card = container.querySelector('[data-slot="expandable-card"]') as HTMLElement;
    await user.click(card);

    expect(await screen.findByText('Related Interests')).toBeInTheDocument();
  });

  it('shows events section in expanded state', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <AnalysisCard {...defaultProps} events={[makeEvent()]} />,
    );

    const card = container.querySelector('[data-slot="expandable-card"]') as HTMLElement;
    await user.click(card);

    expect(await screen.findByText('Related Events')).toBeInTheDocument();
  });

  it('limits displayed signals to 6', async () => {
    const user = userEvent.setup();
    const interests = Array.from({ length: 8 }, (_, i) =>
      makeInterest({ id: i, display_name: `Interest ${i}` }),
    );
    const { container } = render(
      <AnalysisCard {...defaultProps} interests={interests} />,
    );

    const card = container.querySelector('[data-slot="expandable-card"]') as HTMLElement;
    await user.click(card);

    await screen.findByText('Related Interests');

    // Should render 6 out of 8
    expect(screen.getByText('Interest 0')).toBeInTheDocument();
    expect(screen.getByText('Interest 5')).toBeInTheDocument();
    expect(screen.queryByText('Interest 6')).not.toBeInTheDocument();
    expect(screen.queryByText('Interest 7')).not.toBeInTheDocument();
  });
});
