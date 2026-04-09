'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDiscoveryDetail } from '@/components/providers/DiscoveryDetailProvider';
import type { FitSummaryFit } from '@/lib/schemas';

export interface UseDiscoveryProductsReturn {
  products: FitSummaryFit[];
  loading: boolean;
  error: string | null;
  selectedProductId: number | null;
  selectProduct: (productId: number) => void;
  clearSelection: () => void;
}

/** Provides product fit scores from cached explainability data. */
export function useDiscoveryProducts(): UseDiscoveryProductsReturn {
  const { explainability, explainabilityLoading, explainabilityError, ensureExplainability } =
    useDiscoveryDetail();

  useEffect(() => {
    ensureExplainability();
  }, [ensureExplainability]);

  const products = explainability?.fits_summary ?? [];

  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const selectProduct = useCallback((productId: number) => {
    setSelectedProductId((prev) => (prev === productId ? null : productId));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedProductId(null);
  }, []);

  return {
    products, loading: explainabilityLoading, error: explainabilityError,
    selectedProductId, selectProduct, clearSelection,
  };
}
