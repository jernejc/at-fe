import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useProductsAndSignals } from './useProductsAndSignals';
import type { FitSummaryFit, SignalInterest, SignalEvent } from '@/lib/schemas';

// --- Mocks ---

const mockEnsureExplainability = vi.fn();
const mockGetCachedSignalProvenance = vi.fn();
const mockRawSelectSignal = vi.fn();
const mockRawClearSelection = vi.fn();

let mockExplainability: any = null;
let mockExplainabilityLoading = false;
let mockExplainabilityError: string | null = null;

vi.mock('@/components/providers/DiscoveryDetailProvider', () => ({
  useDiscoveryDetail: () => ({
    domain: 'test.com',
    explainability: mockExplainability,
    explainabilityLoading: mockExplainabilityLoading,
    explainabilityError: mockExplainabilityError,
    ensureExplainability: mockEnsureExplainability,
    getCachedSignalProvenance: mockGetCachedSignalProvenance,
  }),
}));

vi.mock('@/hooks/useSignalSelection', () => ({
  useSignalSelection: () => ({
    selectedSignalId: null,
    provenance: null,
    provenanceLoading: false,
    selectSignal: mockRawSelectSignal,
    clearSelection: mockRawClearSelection,
  }),
}));

const mockSearchParams = new URLSearchParams();
vi.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
}));

// --- Fixtures ---

function makeInterest(overrides: Partial<SignalInterest> = {}): SignalInterest {
  return {
    id: 1,
    category: 'cloud_computing',
    display_name: 'Cloud Computing',
    strength: 8,
    confidence: 0.9,
    source_type: 'employee',
    source_types: ['employee'],
    source_ids: [1],
    component_count: 3,
    components: [],
    contributor_count: 2,
    weight_sum: 5,
    ...overrides,
  };
}

function makeEvent(overrides: Partial<SignalEvent> = {}): SignalEvent {
  return {
    id: 10,
    category: 'funding_round',
    display_name: 'Funding Round',
    strength: 6,
    confidence: 0.7,
    source_type: 'news',
    source_types: ['news'],
    source_ids: [10],
    component_count: 1,
    components: [],
    contributor_count: 0,
    weight_sum: 2,
    ...overrides,
  };
}

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
    top_drivers: ['cloud'],
    fit_explanation: 'Good fit',
    calculated_at: '2025-01-01T00:00:00Z',
    interest_matches: [{ category: 'cloud_computing', signal_type: 'interest', signal_id: 1, strength: 8, weight: 2, contribution: 5 }],
    event_matches: [{ category: 'funding_round', signal_type: 'event', signal_id: 10, strength: 6, weight: 1, contribution: 3 }],
    ...overrides,
  };
}

function makeExplainability(overrides: any = {}) {
  return {
    company_id: 1,
    company_domain: 'test.com',
    company_name: 'Test Co',
    signals_summary: {
      interests: [makeInterest()],
      events: [makeEvent()],
    },
    interest_narrative: 'Interest narrative text',
    event_narrative: 'Event narrative text',
    signal_narrative: null,
    fits_summary: [makeProduct()],
    playbooks_count: 0,
    links: {},
    ...overrides,
  };
}

// --- Tests ---

beforeEach(() => {
  vi.clearAllMocks();
  mockExplainability = null;
  mockExplainabilityLoading = false;
  mockExplainabilityError = null;
  mockSearchParams.delete('product');
  mockSearchParams.delete('signal');
});

describe('useProductsAndSignals', () => {
  it('calls ensureExplainability on mount', () => {
    renderHook(() => useProductsAndSignals());
    expect(mockEnsureExplainability).toHaveBeenCalledOnce();
  });

  it('returns loading true when explainability is null', () => {
    mockExplainability = null;
    mockExplainabilityLoading = false;
    const { result } = renderHook(() => useProductsAndSignals());
    expect(result.current.loading).toBe(true);
  });

  it('returns loading true when explainabilityLoading is true', () => {
    mockExplainabilityLoading = true;
    const { result } = renderHook(() => useProductsAndSignals());
    expect(result.current.loading).toBe(true);
  });

  it('returns loading false when data is loaded', () => {
    mockExplainability = makeExplainability();
    const { result } = renderHook(() => useProductsAndSignals());
    expect(result.current.loading).toBe(false);
  });

  it('returns error from provider', () => {
    mockExplainabilityError = 'Failed to load';
    const { result } = renderHook(() => useProductsAndSignals());
    expect(result.current.error).toBe('Failed to load');
  });

  it('returns products from fits_summary', () => {
    mockExplainability = makeExplainability();
    const { result } = renderHook(() => useProductsAndSignals());
    expect(result.current.products).toHaveLength(1);
    expect(result.current.products[0].product_name).toBe('Widget Pro');
  });

  it('merges interests and events into allSignals with signalType tag', () => {
    mockExplainability = makeExplainability();
    const { result } = renderHook(() => useProductsAndSignals());
    expect(result.current.allSignals).toHaveLength(2);
    expect(result.current.allSignals[0].signalType).toBe('interest');
    expect(result.current.allSignals[1].signalType).toBe('event');
  });

  it('returns narratives from explainability', () => {
    mockExplainability = makeExplainability();
    const { result } = renderHook(() => useProductsAndSignals());
    expect(result.current.narratives.interest).toBe('Interest narrative text');
    expect(result.current.narratives.event).toBe('Event narrative text');
  });

  it('defaults sort to strength descending', () => {
    const { result } = renderHook(() => useProductsAndSignals());
    expect(result.current.sort).toEqual({ field: 'strength', direction: 'desc' });
  });

  it('sorts signals by strength desc by default', () => {
    mockExplainability = makeExplainability();
    const { result } = renderHook(() => useProductsAndSignals());
    const strengths = result.current.filteredSignals.map((s) => s.strength);
    expect(strengths).toEqual([8, 6]); // desc order
  });

  describe('product selection', () => {
    it('starts with no product selected', () => {
      mockExplainability = makeExplainability();
      const { result } = renderHook(() => useProductsAndSignals());
      expect(result.current.selectedProductId).toBeNull();
      expect(result.current.selectedProduct).toBeNull();
      expect(result.current.score).toBeNull();
    });

    it('reads initial product from URL search params', () => {
      mockSearchParams.set('product', '100');
      mockExplainability = makeExplainability();
      const { result } = renderHook(() => useProductsAndSignals());
      expect(result.current.selectedProductId).toBe(100);
    });

    it('selectProduct updates selectedProductId and syncs to URL', () => {
      mockExplainability = makeExplainability();
      const { result } = renderHook(() => useProductsAndSignals());

      act(() => { result.current.selectProduct(100); });

      expect(result.current.selectedProductId).toBe(100);
      expect(result.current.selectedProduct?.product_name).toBe('Widget Pro');
      expect(window.location.href).toContain('product=100');
    });

    it('clearProduct resets selection and URL', () => {
      mockSearchParams.set('product', '100');
      mockExplainability = makeExplainability();
      const { result } = renderHook(() => useProductsAndSignals());

      act(() => { result.current.clearProduct(); });

      expect(result.current.selectedProductId).toBeNull();
    });

    it('computes score and likelihood when product is selected', () => {
      mockExplainability = makeExplainability();
      const { result } = renderHook(() => useProductsAndSignals());

      act(() => { result.current.selectProduct(100); });

      expect(result.current.score).toBe(80); // normalizeScore(0.8) = 80
      expect(result.current.likelihood).toBe(73); // normalizeScore(0.73) = 73
    });
  });

  describe('filtering', () => {
    it('filters by signal type', () => {
      mockExplainability = makeExplainability();
      const { result } = renderHook(() => useProductsAndSignals());

      act(() => {
        result.current.setFilters([{
          key: 'signal_type', operator: 'is', value: 'interest',
          fieldLabel: 'Signal type', valueLabel: 'Interest',
        }]);
      });

      expect(result.current.filteredSignals).toHaveLength(1);
      expect(result.current.filteredSignals[0].signalType).toBe('interest');
    });

    it('filters by product to show only matched signals', () => {
      mockExplainability = makeExplainability({
        signals_summary: {
          interests: [makeInterest({ id: 1 }), makeInterest({ id: 2, category: 'unrelated' })],
          events: [makeEvent({ id: 10 })],
        },
      });
      const { result } = renderHook(() => useProductsAndSignals());

      // Select product (which has interest_matches with signal_id=1 and event_matches with signal_id=10)
      act(() => { result.current.selectProduct(100); });

      // Product filter is auto-synced from dashboard selection
      expect(result.current.filteredSignals).toHaveLength(2);
      expect(result.current.filteredSignals.map((s) => s.id).sort()).toEqual([1, 10]);
    });
  });

  describe('sorting', () => {
    it('sorts by name ascending', () => {
      mockExplainability = makeExplainability({
        signals_summary: {
          interests: [makeInterest({ id: 1, display_name: 'Zebra' })],
          events: [makeEvent({ id: 2, display_name: 'Alpha' })],
        },
      });
      const { result } = renderHook(() => useProductsAndSignals());

      act(() => { result.current.setSort({ field: 'name', direction: 'asc' }); });

      expect(result.current.filteredSignals[0].display_name).toBe('Alpha');
      expect(result.current.filteredSignals[1].display_name).toBe('Zebra');
    });

    it('sorts by confidence descending', () => {
      mockExplainability = makeExplainability({
        signals_summary: {
          interests: [makeInterest({ id: 1, confidence: 0.5 })],
          events: [makeEvent({ id: 2, confidence: 0.9 })],
        },
      });
      const { result } = renderHook(() => useProductsAndSignals());

      act(() => { result.current.setSort({ field: 'confidence', direction: 'desc' }); });

      expect(result.current.filteredSignals[0].confidence).toBe(0.9);
    });
  });

  describe('signal selection', () => {
    it('selectSignal calls rawSelectSignal and syncs URL', () => {
      const { result } = renderHook(() => useProductsAndSignals());

      act(() => { result.current.selectSignal(5); });

      expect(mockRawSelectSignal).toHaveBeenCalledWith(5);
      expect(window.location.href).toContain('signal=5');
    });

    it('clearSignalSelection calls rawClearSelection and clears URL', () => {
      const { result } = renderHook(() => useProductsAndSignals());

      act(() => { result.current.clearSignalSelection(); });

      expect(mockRawClearSelection).toHaveBeenCalledOnce();
    });
  });
});
