import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import type { FitSummaryFit, SignalContribution } from '@/lib/schemas';

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

import { CampaignFitCard } from './CampaignFitCard';

function makeContribution(overrides: Partial<SignalContribution> = {}): SignalContribution {
  return {
    category: 'hiring_growth',
    display_name: 'Hiring Growth',
    signal_type: 'interest',
    strength: 80,
    weight: 1.5,
    contribution: 0.35,
    ...overrides,
  };
}

function makeFitSummary(overrides: Partial<FitSummaryFit> = {}): FitSummaryFit {
  return {
    company_id: 1,
    company_domain: 'acme.com',
    company_name: 'Acme Corp',
    product_id: 10,
    product_name: 'Product A',
    likelihood_score: 0.75,
    urgency_score: 0.6,
    combined_score: 0.8,
    top_drivers: ['hiring_growth', 'tech_adoption'],
    calculated_at: '2025-01-01T00:00:00Z',
    ...overrides,
  };
}

const defaultProps = {
  fitsSummary: [] as FitSummaryFit[],
  targetProductId: 10,
  domain: 'acme.com',
  loading: false,
};

describe('CampaignFitCard', () => {
  it('returns null when no matching product and not loading', () => {
    const { container } = render(<CampaignFitCard {...defaultProps} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders fit score from matching fitsSummary entry', () => {
    render(<CampaignFitCard {...defaultProps} fitsSummary={[makeFitSummary()]} />);
    // combined_score 0.8 → normalizeScore → 80
    expect(screen.getByText('80%')).toBeInTheDocument();
  });

  it('does not match wrong product in fitsSummary', () => {
    const { container } = render(
      <CampaignFitCard
        {...defaultProps}
        fitsSummary={[makeFitSummary({ product_id: 99, combined_score: 0.5 })]}
      />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders likelihood progress bar', () => {
    const { container } = render(
      <CampaignFitCard {...defaultProps} fitsSummary={[makeFitSummary()]} />,
    );
    // likelihood_score 0.75 → 75%
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(container.querySelector('[aria-label="Progress: 75%"]')).toBeInTheDocument();
  });

  it('renders explanation from fit_explanation', () => {
    render(
      <CampaignFitCard
        {...defaultProps}
        fitsSummary={[makeFitSummary({ fit_explanation: 'Strong hiring growth and tech adoption signals.' })]}
      />,
    );
    expect(screen.getByText('Strong hiring growth and tech adoption signals.')).toBeInTheDocument();
  });

  it('renders "Product fit" heading', () => {
    render(<CampaignFitCard {...defaultProps} fitsSummary={[makeFitSummary()]} />);
    expect(screen.getByText('Product fit')).toBeInTheDocument();
  });

  it('renders product name as subtitle', () => {
    render(<CampaignFitCard {...defaultProps} fitsSummary={[makeFitSummary({ product_name: 'Enterprise Suite' })]} />);
    expect(screen.getByText('Enterprise Suite')).toBeInTheDocument();
  });

  it('shows interest matches using SignalRow in expanded details', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <CampaignFitCard
        {...defaultProps}
        fitsSummary={[makeFitSummary({
          interest_matches: [makeContribution({ display_name: 'AI Adoption' })],
        })]}
      />,
    );

    const card = container.querySelector('[data-slot="expandable-card"]') as HTMLElement;
    await user.click(card);

    expect(await screen.findByText('Matched Interests')).toBeInTheDocument();
    expect(screen.getByText('AI Adoption')).toBeInTheDocument();
  });

  it('shows event matches using SignalRow in expanded details', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <CampaignFitCard
        {...defaultProps}
        fitsSummary={[makeFitSummary({
          event_matches: [makeContribution({ display_name: 'Product Launch', signal_type: 'event' })],
        })]}
      />,
    );

    const card = container.querySelector('[data-slot="expandable-card"]') as HTMLElement;
    await user.click(card);

    expect(await screen.findByText('Matched Events')).toBeInTheDocument();
    expect(screen.getByText('Product Launch')).toBeInTheDocument();
  });

  it('renders discovery links for signals with signal_id', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <CampaignFitCard
        {...defaultProps}
        fitsSummary={[makeFitSummary({
          interest_matches: [makeContribution({ signal_id: 42, display_name: 'AI Adoption' })],
        })]}
      />,
    );

    const card = container.querySelector('[data-slot="expandable-card"]') as HTMLElement;
    await user.click(card);

    await screen.findByText('AI Adoption');
    const link = container.querySelector('a[target="_blank"]');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/discovery/acme.com/products?product=10&signal=42');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('does not render link when signal_id is missing', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <CampaignFitCard
        {...defaultProps}
        fitsSummary={[makeFitSummary({
          interest_matches: [makeContribution({ signal_id: undefined, display_name: 'No Link Signal' })],
        })]}
      />,
    );

    const card = container.querySelector('[data-slot="expandable-card"]') as HTMLElement;
    await user.click(card);

    await screen.findByText('No Link Signal');
    expect(container.querySelector('a')).not.toBeInTheDocument();
  });
});
