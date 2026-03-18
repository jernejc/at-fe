'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDiscoveryDetail } from '@/components/providers/DiscoveryDetailProvider';
import { getFitBreakdown } from '@/lib/api';
import type { FitSummaryFit, FitScore } from '@/lib/schemas';

export interface UseDiscoveryProductsReturn {
  products: FitSummaryFit[];
  loading: boolean;
  error: string | null;
  selectedProductId: number | null;
  breakdown: FitScore | null;
  breakdownLoading: boolean;
  selectProduct: (productId: number) => void;
  clearSelection: () => void;
}

/** Provides product fit scores from cached explainability data and manages on-demand breakdown fetching. */
export function useDiscoveryProducts(): UseDiscoveryProductsReturn {
  const { domain, explainability, explainabilityLoading, explainabilityError, ensureExplainability } =
    useDiscoveryDetail();

  useEffect(() => {
    ensureExplainability();
  }, [ensureExplainability]);

  const products = explainability?.fits_summary ?? [];

  // Local UI state: product selection + on-demand breakdown
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [breakdown, setBreakdown] = useState<FitScore | null>(null);
  const [breakdownLoading, setBreakdownLoading] = useState(false);

  const selectProduct = useCallback((productId: number) => {
    if (productId === selectedProductId) {
      setSelectedProductId(null);
      setBreakdown(null);
      return;
    }

    setSelectedProductId(productId);
    setBreakdownLoading(true);
    setBreakdown(null);

    getFitBreakdown(domain, productId)
      .then((res) => setBreakdown(res))
      .catch((err) => console.error('Failed to fetch fit breakdown', err))
      .finally(() => setBreakdownLoading(false));
  }, [domain, selectedProductId]);

  const clearSelection = useCallback(() => {
    setSelectedProductId(null);
    setBreakdown(null);
  }, []);

  return {
    products, loading: explainabilityLoading, error: explainabilityError,
    selectedProductId, breakdown, breakdownLoading,
    selectProduct, clearSelection,
  };
}
