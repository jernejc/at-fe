import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProductsAndSignalsPage from './page';

// --- Mocks ---

const mockHookValues = {
  products: [],
  selectedProductId: null,
  selectedProduct: null,
  selectProduct: vi.fn(),
  clearProduct: vi.fn(),
  allSignals: [],
  filteredSignals: [],
  narratives: { signal: null, interest: null, event: null },
  filters: [],
  setFilters: vi.fn(),
  sort: { field: 'strength', direction: 'desc' as const },
  setSort: vi.fn(),
  loading: false,
  error: null,
  selectedSignalId: null,
  provenance: null,
  provenanceLoading: false,
  selectSignal: vi.fn(),
  clearSignalSelection: vi.fn(),
  score: null,
  likelihood: null,
};

const mockUseProductsAndSignals = vi.fn();

vi.mock('./useProductsAndSignals', () => ({
  useProductsAndSignals: () => mockUseProductsAndSignals(),
}));

vi.mock('@/components/discovery/ProductDashboard', () => ({
  ProductDashboard: (props: any) => (
    <div data-testid="product-dashboard" data-loading={props.loading} data-error={props.error} />
  ),
}));

vi.mock('@/components/discovery/SignalToolbar', () => ({
  SignalToolbar: () => <div data-testid="signal-toolbar" />,
}));

vi.mock('@/components/discovery/MergedSignalsList', () => ({
  MergedSignalsList: (props: any) => (
    <div data-testid="merged-signals-list" data-loading={props.loading} data-error={props.error} />
  ),
}));

vi.mock('@/components/ui/detail-side-panel/DetailSidePanel', () => ({
  DetailSidePanel: ({ children }: any) => <div data-testid="detail-side-panel">{children}</div>,
}));

vi.mock('@/components/signals/SignalProvenanceDetail', () => ({
  SignalProvenanceDetail: () => <div data-testid="signal-provenance-detail" />,
}));

vi.mock('@/hooks/useListKeyboardNav', () => ({
  useListKeyboardNav: () => ({ getItemRef: vi.fn() }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockUseProductsAndSignals.mockReturnValue({ ...mockHookValues });
});

describe('ProductsAndSignalsPage', () => {
  it('renders all three main sections', () => {
    render(<ProductsAndSignalsPage />);
    expect(screen.getByTestId('product-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('signal-toolbar')).toBeInTheDocument();
    expect(screen.getByTestId('merged-signals-list')).toBeInTheDocument();
  });

  it('wraps content in DetailSidePanel', () => {
    render(<ProductsAndSignalsPage />);
    expect(screen.getByTestId('detail-side-panel')).toBeInTheDocument();
  });

  it('passes loading state to dashboard and list', () => {
    mockUseProductsAndSignals.mockReturnValue({ ...mockHookValues, loading: true });
    render(<ProductsAndSignalsPage />);

    expect(screen.getByTestId('product-dashboard').dataset.loading).toBe('true');
    expect(screen.getByTestId('merged-signals-list').dataset.loading).toBe('true');
  });

  it('passes error state to dashboard and list', () => {
    mockUseProductsAndSignals.mockReturnValue({ ...mockHookValues, error: 'Failed' });
    render(<ProductsAndSignalsPage />);

    expect(screen.getByTestId('product-dashboard').dataset.error).toBe('Failed');
    expect(screen.getByTestId('merged-signals-list').dataset.error).toBe('Failed');
  });
});
