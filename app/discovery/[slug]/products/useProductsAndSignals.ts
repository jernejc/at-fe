'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDiscoveryDetail } from '@/components/providers/DiscoveryDetailProvider';
import { useSignalSelection } from '@/hooks/useSignalSelection';
import type { SignalInterest, SignalEvent } from '@/lib/schemas';
import type { ActiveFilter, SortState } from '@/lib/schemas/filter';
import { normalizeScore } from '@/lib/utils';

/** Signal with a discriminator tag for merged lists. */
export type TaggedSignal = (SignalInterest | SignalEvent) & {
  signalType: 'interest' | 'event';
  /** Difference between product-adjusted and original strength (only set when a product filter is active). */
  strengthDelta?: number;
};

/** Sync a key/value pair to the URL without creating history entries. */
function syncParam(key: string, value: string | null) {
  const url = new URL(window.location.href);
  if (value) url.searchParams.set(key, value);
  else url.searchParams.delete(key);
  window.history.replaceState(null, '', url.toString());
}

/** Unified hook for the "Products & signals" page. */
export function useProductsAndSignals() {
  const {
    domain, explainability, explainabilityLoading, explainabilityError,
    ensureExplainability, getCachedSignalProvenance,
  } = useDiscoveryDetail();

  const searchParams = useSearchParams();

  useEffect(() => { ensureExplainability(); }, [ensureExplainability]);

  const products = useMemo(() => explainability?.fits_summary ?? [], [explainability?.fits_summary]);

  // --- Product selection (URL-synced) ---
  const [selectedProductId, setSelectedProductId] = useState<number | null>(() => {
    const p = searchParams.get('product');
    return p ? Number(p) : null;
  });

  const selectedProduct = useMemo(
    () => products.find((p) => p.product_id === selectedProductId) ?? null,
    [products, selectedProductId],
  );

  const selectProduct = useCallback((id: number) => {
    setSelectedProductId(id);
    syncParam('product', String(id));
  }, []);

  const clearProduct = useCallback(() => {
    setSelectedProductId(null);
    syncParam('product', null);
  }, []);

  // --- Merged signals ---
  const allSignals: TaggedSignal[] = useMemo(() => {
    const interests = (explainability?.signals_summary.interests ?? []).map(
      (s) => ({ ...s, signalType: 'interest' as const }),
    );
    const events = (explainability?.signals_summary.events ?? []).map(
      (s) => ({ ...s, signalType: 'event' as const }),
    );
    return [...interests, ...events];
  }, [explainability]);

  const narratives = useMemo(() => ({
    signal: explainability?.signal_narrative ?? null,
    interest: explainability?.interest_narrative ?? null,
    event: explainability?.event_narrative ?? null,
  }), [explainability]);

  // --- Filter & Sort ---
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [sort, setSort] = useState<SortState | null>({ field: 'strength', direction: 'desc' });

  // Track whether filter change came from toolbar (not from dashboard sync effect)
  const filterChangeFromToolbar = useRef(false);
  const selectedProductIdRef = useRef(selectedProductId);
  selectedProductIdRef.current = selectedProductId;

  const handleFiltersChange = useCallback((next: ActiveFilter[]) => {
    filterChangeFromToolbar.current = true;
    setFilters(next);
  }, []);

  // When filters change from toolbar, sync product selection to match
  useEffect(() => {
    if (!filterChangeFromToolbar.current) return;
    filterChangeFromToolbar.current = false;
    const productFilter = filters.find((f) => f.key === 'product');
    if (productFilter) {
      const id = Number(productFilter.value);
      if (id !== selectedProductIdRef.current) {
        setSelectedProductId(id);
        syncParam('product', productFilter.value);
      }
    } else if (selectedProductIdRef.current != null) {
      setSelectedProductId(null);
      syncParam('product', null);
    }
  }, [filters]);

  // When dashboard product changes, sync to filter (bail out if already in sync)
  useEffect(() => {
    setFilters((prev) => {
      const existing = prev.find((f) => f.key === 'product');
      if (!selectedProductId) {
        return existing ? prev.filter((f) => f.key !== 'product') : prev;
      }
      if (existing?.value === String(selectedProductId)) return prev;
      const prod = products.find((p) => p.product_id === selectedProductId);
      if (!prod) return prev;
      return [...prev.filter((f) => f.key !== 'product'), {
        key: 'product',
        operator: 'is' as const,
        value: String(selectedProductId),
        fieldLabel: 'Product',
        valueLabel: prod.product_name,
      }];
    });
  }, [selectedProductId, products]);

  // --- Compute filtered + sorted signals ---
  const filteredSignals = useMemo(() => {
    let result = allSignals;

    for (const f of filters) {
      if (f.key === 'signal_type') {
        result = result.filter((s) => s.signalType === f.value);
      }
      if (f.key === 'product' && selectedProduct) {
        const allMatches = [
          ...(selectedProduct.interest_matches ?? []),
          ...(selectedProduct.event_matches ?? []),
        ];
        const matchedIds = new Set(allMatches.map((m) => m.signal_id));
        const strengthMap = new Map(
          allMatches
            .filter((m) => m.signal_id != null)
            .map((m) => [m.signal_id!, m.strength]),
        );
        result = result
          .filter((s) => matchedIds.has(s.id))
          .map((s) => {
            const adjusted = strengthMap.get(s.id);
            if (adjusted == null) return s;
            const delta = parseFloat((adjusted - s.strength).toFixed(1));
            return { ...s, strength: adjusted, strengthDelta: delta };
          });
      }
    }

    const sorted = [...result];
    if (sort) {
      sorted.sort((a, b) => {
        let cmp = 0;
        switch (sort.field) {
          case 'strength': cmp = a.strength - b.strength; break;
          case 'name': cmp = (a.display_name ?? a.category).localeCompare(b.display_name ?? b.category); break;
          case 'confidence': cmp = a.confidence - b.confidence; break;
          case 'component_count': cmp = (a.component_count ?? 0) - (b.component_count ?? 0); break;
        }
        return sort.direction === 'desc' ? -cmp : cmp;
      });
    }

    return sorted;
  }, [allSignals, filters, sort, selectedProduct]);

  // --- Signal selection (URL-synced) ---
  const {
    selectedSignalId, provenance, provenanceLoading,
    selectSignal: rawSelectSignal, clearSelection: rawClearSelection,
  } = useSignalSelection(domain, getCachedSignalProvenance);

  // Initialize signal from URL on mount
  useEffect(() => {
    const signalParam = searchParams.get('signal');
    if (signalParam && !selectedSignalId) {
      rawSelectSignal(Number(signalParam));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync signal selection to URL
  const selectSignal = useCallback((id: number) => {
    rawSelectSignal(id);
    syncParam('signal', String(id));
  }, [rawSelectSignal]);

  const clearSignalSelection = useCallback(() => {
    rawClearSelection();
    syncParam('signal', null);
  }, [rawClearSelection]);

  return {
    products,
    selectedProductId,
    selectedProduct,
    selectProduct,
    clearProduct,
    allSignals,
    filteredSignals,
    narratives,
    filters,
    setFilters: handleFiltersChange,
    sort,
    setSort,
    loading: explainabilityLoading || !explainability,
    error: explainabilityError,
    selectedSignalId,
    provenance,
    provenanceLoading,
    selectSignal,
    clearSignalSelection,
    score: selectedProduct ? Math.round(normalizeScore(selectedProduct.combined_score)) : null,
    likelihood: selectedProduct ? Math.round(normalizeScore(selectedProduct.likelihood_score)) : null,
  };
}
