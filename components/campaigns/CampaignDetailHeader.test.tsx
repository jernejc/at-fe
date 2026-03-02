import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CampaignDetailHeader } from './CampaignDetailHeader';

vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: any) => <>{children}</>,
  TooltipTrigger: ({ children, className, style, ...props }: any) => (
    <span className={className} style={style} {...props}>{children}</span>
  ),
  TooltipContent: ({ children }: any) => <span>{children}</span>,
  TooltipProvider: ({ children }: any) => <>{children}</>,
}));

const defaultProps: React.ComponentProps<typeof CampaignDetailHeader> = {
  campaignName: 'Alpha Outreach',
  campaignIcon: 'gem',
  campaignStatus: 'draft',
  productName: 'Widget Pro',
  loading: false,
};

function renderHeader(overrides: Partial<typeof defaultProps> = {}) {
  return render(<CampaignDetailHeader {...defaultProps} {...overrides} />);
}

describe('CampaignDetailHeader — loading state', () => {
  it('renders skeleton placeholders when loading is true', () => {
    const { container } = renderHeader({ loading: true });
    const pulses = container.querySelectorAll('.animate-pulse');
    expect(pulses.length).toBeGreaterThan(0);
  });

  it('does not render campaign name when loading', () => {
    renderHeader({ loading: true });
    expect(screen.queryByText('Alpha Outreach')).not.toBeInTheDocument();
  });

  it('renders back button during loading', () => {
    renderHeader({ loading: true });
    expect(screen.getByLabelText('Back to campaigns')).toBeInTheDocument();
  });
});

describe('CampaignDetailHeader — loaded state', () => {
  it('renders the campaign name as an h1', () => {
    renderHeader();
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Alpha Outreach');
  });

  it('renders "Untitled Campaign" when campaignName is null', () => {
    renderHeader({ campaignName: null });
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Untitled Campaign');
  });

  it('renders the back button linking to /campaigns', () => {
    renderHeader();
    const backButton = screen.getByLabelText('Back to campaigns');
    const link = backButton.closest('a');
    expect(link).toHaveAttribute('href', '/campaigns');
  });

  it('renders the "Campaign" label', () => {
    renderHeader();
    expect(screen.getByText('Campaign')).toBeInTheDocument();
  });

  it('renders the product name when provided', () => {
    renderHeader();
    expect(screen.getByText('Widget Pro')).toBeInTheDocument();
  });

  it('does not render product name when productName is null', () => {
    renderHeader({ productName: null });
    expect(screen.queryByText('Widget Pro')).not.toBeInTheDocument();
  });

  it('renders the campaign icon', () => {
    const { container } = renderHeader();
    // CampaignIcon renders a Lucide SVG inside the icon container
    const svgs = container.querySelectorAll('svg');
    // At least 2 SVGs: the ChevronLeft in back button + the campaign icon
    expect(svgs.length).toBeGreaterThanOrEqual(2);
  });

  it('renders the status indicator', () => {
    const { container } = renderHeader({ campaignStatus: 'draft' });
    // StatusIndicator renders a dot (TooltipTrigger) with bg-gray-400 for 'draft'
    const dot = container.querySelector('.bg-gray-400');
    expect(dot).toBeInTheDocument();
  });
});
