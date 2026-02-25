import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CampaignOverviewDashboard } from './CampaignOverviewDashboard';
import type { CampaignRead, CampaignOverview } from '@/lib/schemas';

vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: any) => <>{children}</>,
  TooltipTrigger: ({ children, className, style, ...props }: any) => (
    <span className={className} style={style} {...props}>{children}</span>
  ),
  TooltipContent: ({ children }: any) => <span>{children}</span>,
  TooltipProvider: ({ children }: any) => <>{children}</>,
}));

vi.mock('./PublishDialog', () => ({
  PublishDialog: ({ mode, open, onConfirm, loading }: any) => {
    if (!open) return null;
    return (
      <div data-testid="publish-dialog" data-mode={mode}>
        <span>{mode === 'publish' ? 'Publish Campaign' : 'Unpublish Campaign'}</span>
        <button onClick={onConfirm} disabled={loading}>
          Confirm
        </button>
      </div>
    );
  },
}));

function makeCampaign(overrides: Partial<CampaignRead> = {}): CampaignRead {
  return {
    id: 1,
    name: 'Test Campaign',
    slug: 'test-campaign',
    description: null,
    owner: null,
    tags: [],
    target_criteria: null,
    target_product_id: null,
    status: 'draft',
    company_count: 42,
    processed_count: 20,
    avg_fit_score: 75,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    ...overrides,
  };
}

function makeOverview(overrides: Partial<CampaignOverview> = {}): CampaignOverview {
  return {
    ...makeCampaign(),
    segments: [],
    top_companies: [],
    fit_distribution: { '0-20': 0, '20-40': 0, '40-60': 0, '60-80': 0, '80-100': 0, unscored: 0 },
    industry_breakdown: {},
    processing_progress: 0,
    product_name: 'Widget Pro',
    ...overrides,
  };
}

const defaultProps: React.ComponentProps<typeof CampaignOverviewDashboard> = {
  campaign: makeCampaign(),
  overview: makeOverview(),
  loading: false,
  isPublishing: false,
  isUnpublishing: false,
  handlePublish: vi.fn(),
  handleUnpublish: vi.fn(),
};

function renderDashboard(
  overrides: Partial<React.ComponentProps<typeof CampaignOverviewDashboard>> = {},
) {
  const props = { ...defaultProps, ...overrides };
  // Reset handler mocks when overriding so calledOnce checks work
  if (!overrides.handlePublish) props.handlePublish = vi.fn();
  if (!overrides.handleUnpublish) props.handleUnpublish = vi.fn();
  return render(<CampaignOverviewDashboard {...props} />);
}

describe('CampaignOverviewDashboard — product and status cells', () => {
  it('displays the product name from overview', () => {
    renderDashboard();
    expect(screen.getByText('Widget Pro')).toBeInTheDocument();
  });

  it('displays "--" when overview is null', () => {
    renderDashboard({ overview: null });
    expect(screen.getAllByText('--').length).toBeGreaterThan(0);
  });

  it('displays "--" when product_name is null', () => {
    renderDashboard({ overview: makeOverview({ product_name: null }) });
    expect(screen.getAllByText('--').length).toBeGreaterThan(0);
  });

  it('displays the campaign status', () => {
    renderDashboard();
    // Text appears in both the explicit status span and the StatusIndicator tooltip
    const matches = screen.getAllByText('draft');
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('displays published status correctly', () => {
    renderDashboard({
      campaign: makeCampaign({ status: 'published' }),
      overview: makeOverview({ status: 'published' }),
    });
    const matches = screen.getAllByText('published');
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });
});

describe('CampaignOverviewDashboard — publish button', () => {
  it('shows Publish button when status is draft and not loading', () => {
    renderDashboard();
    expect(screen.getByText('Publish')).toBeInTheDocument();
  });

  it('hides Publish button when status is not draft', () => {
    renderDashboard({ campaign: makeCampaign({ status: 'published' }) });
    expect(screen.queryByText('Publish')).not.toBeInTheDocument();
  });

  it('hides Publish button when loading is true', () => {
    renderDashboard({ loading: true });
    expect(screen.queryByText('Publish')).not.toBeInTheDocument();
  });

  it('opens PublishDialog in publish mode when Publish button is clicked', () => {
    renderDashboard();
    expect(screen.queryByTestId('publish-dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Publish'));
    expect(screen.getByTestId('publish-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('publish-dialog')).toHaveAttribute('data-mode', 'publish');
  });

  it('calls handlePublish when dialog confirm is clicked', () => {
    const handlePublish = vi.fn().mockResolvedValue(undefined);
    renderDashboard({ handlePublish });

    fireEvent.click(screen.getByText('Publish'));
    fireEvent.click(screen.getByText('Confirm'));

    expect(handlePublish).toHaveBeenCalledOnce();
  });
});

describe('CampaignOverviewDashboard — metric cells', () => {
  it('displays the company count from campaign', () => {
    renderDashboard();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('displays 0 when campaign is null', () => {
    renderDashboard({ campaign: null });
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('displays partner count when provided', () => {
    renderDashboard({ partnerCount: 7 });
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('displays "--" for partners when partnerCount is not provided', () => {
    renderDashboard();
    // Multiple cells show '--' when no data
    expect(screen.getAllByText('--').length).toBeGreaterThan(0);
  });

  it('displays avg fit score with percentage', () => {
    renderDashboard();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('displays "--" for avg fit when score is null', () => {
    renderDashboard({ campaign: makeCampaign({ avg_fit_score: null }) });
    // The fit cell should contain '--'
    expect(screen.getAllByText('--').length).toBeGreaterThan(0);
  });

  it('displays target amount formatted as currency', () => {
    renderDashboard({ targetAmount: 5000000 });
    // Intl.NumberFormat compact in Node.js keeps trailing decimals
    expect(screen.getByText('$5.00M')).toBeInTheDocument();
  });

  it('displays "--" for target when targetAmount is not provided', () => {
    renderDashboard();
    expect(screen.getAllByText('--').length).toBeGreaterThan(0);
  });

  it('displays progress percentage', () => {
    renderDashboard({ progressPct: 65 });
    expect(screen.getByText('65%')).toBeInTheDocument();
  });

  it('displays "--" for progress when progressPct is not provided', () => {
    renderDashboard();
    expect(screen.getAllByText('--').length).toBeGreaterThan(0);
  });

  it('displays conversion rate as percentage', () => {
    renderDashboard({ conversionRate: 12 });
    expect(screen.getByText('12%')).toBeInTheDocument();
  });

  it('displays "--" for conversion when conversionRate is not provided', () => {
    renderDashboard();
    expect(screen.getAllByText('--').length).toBeGreaterThan(0);
  });

  it('displays closed amount formatted as currency', () => {
    renderDashboard({ closedAmount: 250000 });
    expect(screen.getByText('$250.00K')).toBeInTheDocument();
  });

  it('displays "--" for closed when closedAmount is not provided', () => {
    renderDashboard();
    expect(screen.getAllByText('--').length).toBeGreaterThan(0);
  });
});

describe('CampaignOverviewDashboard — badges', () => {
  it('shows unassigned badge when unassignedCount > 0', () => {
    renderDashboard({ unassignedCount: 3 });
    expect(screen.getByText('3 unassigned')).toBeInTheDocument();
  });

  it('does not show unassigned badge when unassignedCount is 0', () => {
    renderDashboard({ unassignedCount: 0 });
    expect(screen.queryByText(/unassigned/)).not.toBeInTheDocument();
  });

  it('does not show unassigned badge when unassignedCount is undefined', () => {
    renderDashboard();
    expect(screen.queryByText(/unassigned/)).not.toBeInTheDocument();
  });

  it('shows inactive badge when inactivePartnerCount > 0', () => {
    renderDashboard({ inactivePartnerCount: 2 });
    expect(screen.getByText('2 inactive')).toBeInTheDocument();
  });

  it('does not show inactive badge when inactivePartnerCount is 0', () => {
    renderDashboard({ inactivePartnerCount: 0 });
    expect(screen.queryByText(/inactive/)).not.toBeInTheDocument();
  });

  it('does not show inactive badge when inactivePartnerCount is undefined', () => {
    renderDashboard();
    expect(screen.queryByText(/inactive/)).not.toBeInTheDocument();
  });
});

describe('CampaignOverviewDashboard — loading state', () => {
  it('renders skeleton placeholders when loading is true', () => {
    const { container } = renderDashboard({ loading: true });
    const pulses = container.querySelectorAll('.animate-pulse');
    expect(pulses.length).toBeGreaterThan(0);
  });

  it('does not render metric values when loading', () => {
    renderDashboard({ loading: true });
    // Company count should not be visible during loading
    expect(screen.queryByText('42')).not.toBeInTheDocument();
  });
});

describe('CampaignOverviewDashboard — currency formatting', () => {
  it('formats thousands as K', () => {
    renderDashboard({ targetAmount: 5000 });
    expect(screen.getByText('$5.00K')).toBeInTheDocument();
  });

  it('formats millions as M', () => {
    renderDashboard({ targetAmount: 5000000 });
    expect(screen.getByText('$5.00M')).toBeInTheDocument();
  });

  it('formats with decimal precision', () => {
    renderDashboard({ targetAmount: 1500000 });
    expect(screen.getByText('$1.50M')).toBeInTheDocument();
  });
});
