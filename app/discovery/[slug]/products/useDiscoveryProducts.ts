'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDiscoveryDetail } from '@/components/providers/DiscoveryDetailProvider';
import { getCompanyExplainability, getFitBreakdown } from '@/lib/api';
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

/** Fetches product fit scores and manages product selection with breakdown fetching. */
export function useDiscoveryProducts(): UseDiscoveryProductsReturn {
  const { domain } = useDiscoveryDetail();

  const [products, setProducts] = useState<FitSummaryFit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [breakdown, setBreakdown] = useState<FitScore | null>(null);
  const [breakdownLoading, setBreakdownLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetch() {
      setLoading(true);
      setError(null);
      try {
        const res = await getCompanyExplainability(domain);
        if (cancelled) return;
        setProducts(res.fits_summary);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetch();
    return () => { cancelled = true; };
  }, [domain]);

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
    products, loading, error,
    selectedProductId, breakdown, breakdownLoading,
    selectProduct, clearSelection,
  };
}
