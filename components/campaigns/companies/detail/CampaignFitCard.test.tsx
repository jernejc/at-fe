import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import type { FitScore, FitSummaryFit, SignalContribution } from '@/lib/schemas';

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

function makeFitScore(overrides: Partial<FitScore> = {}): FitScore {
  return {
    company_id: 1,
    company_domain: 'acme.com',
    company_name: 'Acme Corp',
    product_id: 10,
    product_name: 'Product A',
    likelihood_score: 0.75,
    urgency_score: 0.6,
    combined_score: 0.8,
    interest_matches: [],
    event_matches: [],
    top_drivers: ['hiring_growth', 'tech_adoption'],
    missing_signals: [],
    signals_used: 5,
    calculated_at: '2025-01-01T00:00:00Z',
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
    likelihood_score: 0.65,
    urgency_score: 0.5,
    combined_score: 0.7,
    top_drivers: ['content_engagement'],
    calculated_at: '2025-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('CampaignFitCard', () => {
  it('returns null when no score and not loading', () => {
    const { container } = render(
      <CampaignFitCard fitBreakdown={null} fitsSummary={[]} loading={false} />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders fit score value from fitBreakdown', () => {
    render(
      <CampaignFitCard fitBreakdown={makeFitScore()} fitsSummary={[]} loading={false} />,
    );
    // combined_score 0.8 → normalizeScore → 80
    expect(screen.getByText('80')).toBeInTheDocument();
  });

  it('falls back to fitsSummary when fitBreakdown is null', () => {
    render(
      <CampaignFitCard fitBreakdown={null} fitsSummary={[makeFitSummary()]} loading={false} />,
    );
    // combined_score 0.7 → normalizeScore → 70
    expect(screen.getByText('70')).toBeInTheDocument();
  });

  it('renders likelihood progress bar', () => {
    const { container } = render(
      <CampaignFitCard fitBreakdown={makeFitScore()} fitsSummary={[]} loading={false} />,
    );
    // likelihood_score 0.75 → 75%
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(container.querySelector('[role="progressbar"]')).toBeInTheDocument();
  });

  it('renders explanation from top_drivers', () => {
    render(
      <CampaignFitCard fitBreakdown={makeFitScore()} fitsSummary={[]} loading={false} />,
    );
    expect(screen.getByText('hiring growth, tech adoption')).toBeInTheDocument();
  });

  it('renders "Campaign fit" heading', () => {
    render(
      <CampaignFitCard fitBreakdown={makeFitScore()} fitsSummary={[]} loading={false} />,
    );
    expect(screen.getByText('Campaign fit')).toBeInTheDocument();
  });

  it('shows interest matches in expanded details', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <CampaignFitCard
        fitBreakdown={makeFitScore({
          interest_matches: [makeContribution({ display_name: 'AI Adoption' })],
        })}
        fitsSummary={[]}
        loading={false}
      />,
    );

    const card = container.querySelector('[data-slot="expandable-card"]') as HTMLElement;
    await user.click(card);

    expect(await screen.findByText('Matched Interests')).toBeInTheDocument();
    expect(screen.getByText('AI Adoption')).toBeInTheDocument();
  });

  it('shows event matches in expanded details', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <CampaignFitCard
        fitBreakdown={makeFitScore({
          event_matches: [makeContribution({ display_name: 'Product Launch', signal_type: 'event' })],
        })}
        fitsSummary={[]}
        loading={false}
      />,
    );

    const card = container.querySelector('[data-slot="expandable-card"]') as HTMLElement;
    await user.click(card);

    expect(await screen.findByText('Matched Events')).toBeInTheDocument();
    expect(screen.getByText('Product Launch')).toBeInTheDocument();
  });

  it('displays contribution value for signal matches', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <CampaignFitCard
        fitBreakdown={makeFitScore({
          interest_matches: [makeContribution({ contribution: 0.42 })],
        })}
        fitsSummary={[]}
        loading={false}
      />,
    );

    const card = container.querySelector('[data-slot="expandable-card"]') as HTMLElement;
    await user.click(card);

    expect(await screen.findByText('+0.42')).toBeInTheDocument();
  });
});
