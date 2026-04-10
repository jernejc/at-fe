import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ProductDashboard } from './ProductDashboard';
import type { FitSummaryFit } from '@/lib/schemas';

function makeProduct(overrides: Partial<FitSummaryFit> = {}): FitSummaryFit {
  return {
    company_id: 1,
    company_domain: 'test.com',
    company_name: 'Test Co',
    product_id: 100,
    product_name: 'Widget Pro',
    likelihood_score: 0.73,
    urgency_score: 0.5,
    combined_score: 0.8,
    top_drivers: [],
    fit_explanation: 'Strong product-market fit.',
    calculated_at: '2025-01-01T00:00:00Z',
    ...overrides,
  };
}

const defaultProps = {
  products: [makeProduct()],
  selectedProductId: null as number | null,
  selectedProduct: null as FitSummaryFit | null,
  onSelectProduct: vi.fn(),
  onClearProduct: vi.fn(),
  score: null as number | null,
  likelihood: null as number | null,
  narratives: { signal: null, interest: 'Interest analysis text', event: 'Event analysis text' },
  loading: false,
  error: null as string | null,
};

describe('ProductDashboard', () => {
  it('renders skeleton when loading', () => {
    const { container } = render(<ProductDashboard {...defaultProps} loading />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('returns null when error is set', () => {
    const { container } = render(<ProductDashboard {...defaultProps} error="Failed" />);
    expect(container.innerHTML).toBe('');
  });

  it('renders the None card and product cards', () => {
    render(<ProductDashboard {...defaultProps} />);
    expect(screen.getByText('None')).toBeInTheDocument();
    expect(screen.getByText('Widget Pro')).toBeInTheDocument();
  });

  it('renders Product title', () => {
    render(<ProductDashboard {...defaultProps} />);
    expect(screen.getByText('Product')).toBeInTheDocument();
  });

  it('calls onClearProduct when None is clicked', async () => {
    const onClearProduct = vi.fn();
    const user = userEvent.setup();
    render(<ProductDashboard {...defaultProps} onClearProduct={onClearProduct} />);

    await user.click(screen.getByText('None'));
    expect(onClearProduct).toHaveBeenCalledOnce();
  });

  it('calls onSelectProduct when a product card is clicked', async () => {
    const onSelectProduct = vi.fn();
    const user = userEvent.setup();
    render(<ProductDashboard {...defaultProps} onSelectProduct={onSelectProduct} />);

    await user.click(screen.getByText('Widget Pro'));
    expect(onSelectProduct).toHaveBeenCalledWith(100);
  });

  it('does not render detail cells when no product is selected', () => {
    render(<ProductDashboard {...defaultProps} />);
    expect(screen.queryByText('Product fit')).not.toBeInTheDocument();
    expect(screen.queryByText('Likelihood')).not.toBeInTheDocument();
    expect(screen.queryByText('Fit reasoning')).not.toBeInTheDocument();
  });

  it('renders detail cells when a product is selected', () => {
    const product = makeProduct();
    render(
      <ProductDashboard
        {...defaultProps}
        selectedProductId={100}
        selectedProduct={product}
        score={80}
        likelihood={73}
      />,
    );
    expect(screen.getByText('Product fit')).toBeInTheDocument();
    expect(screen.getByText('Likelihood')).toBeInTheDocument();
    expect(screen.getByText('Fit reasoning')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('73%')).toBeInTheDocument();
    expect(screen.getByText('Strong product-market fit.')).toBeInTheDocument();
  });

  it('renders narrative cells when narratives are present', () => {
    render(<ProductDashboard {...defaultProps} />);
    expect(screen.getByText('Interest analysis')).toBeInTheDocument();
    expect(screen.getByText('Interest analysis text')).toBeInTheDocument();
    expect(screen.getByText('Event analysis')).toBeInTheDocument();
    expect(screen.getByText('Event analysis text')).toBeInTheDocument();
  });

  it('hides narrative cells when narratives are null', () => {
    render(
      <ProductDashboard
        {...defaultProps}
        narratives={{ signal: null, interest: null, event: null }}
      />,
    );
    expect(screen.queryByText('Interest analysis')).not.toBeInTheDocument();
    expect(screen.queryByText('Event analysis')).not.toBeInTheDocument();
  });
});
