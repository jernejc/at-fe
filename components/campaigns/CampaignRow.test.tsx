import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CampaignRow, CampaignRowSkeleton } from './CampaignRow';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { CampaignRowData } from '@/lib/schemas';

/** Minimal valid campaign fixture. */
function makeCampaign(overrides: Partial<CampaignRowData> = {}): CampaignRowData {
  return {
    id: 1,
    name: 'Test Campaign',
    slug: 'test-campaign',
    status: 'active',
    company_count: 100,
    processed_count: 40,
    avg_fit_score: 0.72,
    target_product_id: null,
    owner: null,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    ...overrides,
  };
}

function renderRow(props: Partial<React.ComponentProps<typeof CampaignRow>> = {}) {
  const campaign = props.campaign ?? makeCampaign();
  return render(
    <TooltipProvider>
      <CampaignRow campaign={campaign} {...props} />
    </TooltipProvider>,
  );
}

describe('CampaignRow', () => {
  it('renders the campaign name', () => {
    renderRow({ campaign: makeCampaign({ name: 'Alpha Outreach' }) });
    expect(screen.getByText('Alpha Outreach')).toBeInTheDocument();
  });

  it('shows product name when provided', () => {
    renderRow({ campaign: makeCampaign({ product_name: 'Widget Pro' }) });
    expect(screen.getByText('Widget Pro')).toBeInTheDocument();
  });

  it('shows "Unassigned" when product_name is null', () => {
    renderRow({ campaign: makeCampaign({ product_name: null }) });
    expect(screen.getByText('Unassigned')).toBeInTheDocument();
  });

  it('displays formatted company count', () => {
    renderRow({ campaign: makeCampaign({ company_count: 1500 }) });
    expect(screen.getByText('1.5K')).toBeInTheDocument();
  });

  it('displays average employee size when provided', () => {
    renderRow({ campaign: makeCampaign({ avg_employee_size: '100-200' }) });
    expect(screen.getByText('100-200')).toBeInTheDocument();
  });

  it('hides employee size when not provided', () => {
    renderRow({ campaign: makeCampaign({ avg_employee_size: undefined }) });
    expect(screen.queryByText('100-200')).not.toBeInTheDocument();
  });

  it('displays main location when provided', () => {
    renderRow({ campaign: makeCampaign({ main_location: 'United States' }) });
    expect(screen.getByText('United States')).toBeInTheDocument();
  });

  it('hides location when not provided', () => {
    renderRow({ campaign: makeCampaign({ main_location: undefined }) });
    expect(screen.queryByText('United States')).not.toBeInTheDocument();
  });

  it('shows progress percentage', () => {
    renderRow({ campaign: makeCampaign({ company_count: 200, processed_count: 100 }) });
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('shows 0% progress when company_count is 0', () => {
    renderRow({ campaign: makeCampaign({ company_count: 0, processed_count: 0 }) });
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('calls onClick with campaign data when clicked', () => {
    const handleClick = vi.fn();
    const campaign = makeCampaign({ name: 'Click Me' });
    renderRow({ campaign, onClick: handleClick });

    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledOnce();
    expect(handleClick).toHaveBeenCalledWith(campaign);
  });

  it('does not throw when clicked without onClick handler', () => {
    renderRow();
    expect(() => fireEvent.click(screen.getByText('Test Campaign'))).not.toThrow();
  });

  it('shows won amount when provided', () => {
    renderRow({ campaign: makeCampaign({ total_won_amount: 15000 }) });
    expect(screen.getByText('$15.0K')).toBeInTheDocument();
  });

  it('shows dash when won amount is null', () => {
    renderRow({ campaign: makeCampaign({ total_won_amount: null }) });
    // \u2013 is an en-dash
    expect(screen.getAllByText('\u2013').length).toBeGreaterThan(0);
  });

  it('shows conversion percentage when won count is provided', () => {
    renderRow({
      campaign: makeCampaign({ company_count: 100, completed_won_count: 25 }),
    });
    expect(screen.getByText('25%')).toBeInTheDocument();
  });
});

describe('CampaignRowSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<CampaignRowSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('contains animated pulse placeholders', () => {
    const { container } = render(<CampaignRowSkeleton />);
    const pulses = container.querySelectorAll('.animate-pulse');
    expect(pulses.length).toBeGreaterThan(0);
  });
});
