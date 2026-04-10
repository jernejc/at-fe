import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SignalToolbar } from './SignalToolbar';
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
    calculated_at: '2025-01-01T00:00:00Z',
    ...overrides,
  };
}

const defaultProps = {
  products: [makeProduct()],
  filters: [],
  onFiltersChange: vi.fn(),
  sort: { field: 'strength', direction: 'desc' as const },
  onSortChange: vi.fn(),
};

describe('SignalToolbar', () => {
  it('renders Filter and Sort triggers', () => {
    render(<SignalToolbar {...defaultProps} />);
    expect(screen.getByText('Filter')).toBeInTheDocument();
    expect(screen.getByText('Sort')).toBeInTheDocument();
  });

  it('renders sort badge when sort is active', () => {
    render(<SignalToolbar {...defaultProps} sort={{ field: 'strength', direction: 'desc' }} />);
    expect(screen.getByText('Strength')).toBeInTheDocument();
  });

  it('renders without crashing when products is empty', () => {
    render(<SignalToolbar {...defaultProps} products={[]} />);
    expect(screen.getByText('Filter')).toBeInTheDocument();
  });

  it('renders without crashing when sort is null', () => {
    render(<SignalToolbar {...defaultProps} sort={null} />);
    expect(screen.getByText('Sort')).toBeInTheDocument();
  });
});
