'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDiscoveryDetail } from '@/components/providers/DiscoveryDetailProvider';
import { getProducts, getCompanyPlaybooks, getCompanyPlaybook } from '@/lib/api';
import { usePlaybookGeneration } from '@/hooks/usePlaybookGeneration';
import type { ProductSummary, PlaybookRead, PlaybookSummary } from '@/lib/schemas';

export interface UseDiscoveryPlaybookReturn {
  /** All available products. */
  products: ProductSummary[];
  /** Whether the products list is still loading. */
  productsLoading: boolean;
  /** Error from the products fetch. */
  productsError: string | null;
  /** Currently selected product ID. */
  selectedProductId: number | null;
  /** Switch the selected product. */
  selectProduct: (productId: number) => void;
  /** Display name of the selected product. */
  selectedProductName: string | null;
  /** Full playbook for the selected product, or null if none exists. */
  playbook: PlaybookRead | null;
  /** Whether the playbook detail is loading. */
  playbookLoading: boolean;
  /** Whether a playbook generation is in progress. */
  isGenerating: boolean;
  /** Error from the last generation attempt. */
  generationError: string | null;
  /** Trigger playbook generation for the selected product. */
  generatePlaybook: () => Promise<void>;
  /** Set of product IDs that have an existing playbook for this company. */
  productIdsWithPlaybook: Set<number>;
}

/** Loads products, matches playbooks, and handles generation in the discovery context. */
export function useDiscoveryPlaybook(): UseDiscoveryPlaybookReturn {
  const { domain } = useDiscoveryDetail();

  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  const [summaries, setSummaries] = useState<PlaybookSummary[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const [playbook, setPlaybook] = useState<PlaybookRead | null>(null);
  const [playbookLoading, setPlaybookLoading] = useState(false);

  // Fetch products and playbook summaries in parallel on mount
  useEffect(() => {
    let cancelled = false;

    async function fetchInitialData() {
      setProductsLoading(true);
      setProductsError(null);

      try {
        const [productsRes, playbooksRes] = await Promise.all([
          getProducts(1, 100),
          getCompanyPlaybooks(domain),
        ]);

        if (cancelled) return;

        const items = productsRes.items;
        const playbooks = playbooksRes.playbooks;
        setProducts(items);
        setSummaries(playbooks);

        // Auto-select: prefer a product that already has a playbook
        if (items.length > 0) {
          const playbookProductIds = new Set(playbooks.map((p) => p.product_id));
          const withPlaybook = items.find((p) => playbookProductIds.has(p.id));
          setSelectedProductId(withPlaybook?.id ?? items[0].id);
        }
      } catch (err) {
        if (cancelled) return;
        setProductsError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        if (!cancelled) setProductsLoading(false);
      }
    }

    fetchInitialData();
    return () => { cancelled = true; };
  }, [domain]);

  // Fetch playbook detail when selected product changes
  useEffect(() => {
    if (selectedProductId === null || productsLoading) return;

    const summary = summaries.find((s) => s.product_id === selectedProductId);
    if (!summary) {
      setPlaybook(null);
      return;
    }

    let cancelled = false;
    setPlaybookLoading(true);

    getCompanyPlaybook(domain, summary.id)
      .then((detail) => {
        if (!cancelled) setPlaybook(detail);
      })
      .catch((err) => {
        console.error('Failed to fetch playbook detail:', err);
        if (!cancelled) setPlaybook(null);
      })
      .finally(() => {
        if (!cancelled) setPlaybookLoading(false);
      });

    return () => { cancelled = true; };
  }, [selectedProductId, summaries, domain, productsLoading]);

  const selectProduct = useCallback((productId: number) => {
    setSelectedProductId(productId);
    setPlaybook(null);
  }, []);

  const selectedProductName =
    products.find((p) => p.id === selectedProductId)?.name ?? null;

  const productIdsWithPlaybook = useMemo(
    () => new Set(summaries.map((s) => s.product_id)),
    [summaries],
  );

  const handleGenerationComplete = useCallback(async () => {
    if (!selectedProductId) return;

    const { playbooks } = await getCompanyPlaybooks(domain);
    setSummaries(playbooks);

    const target = playbooks.find((p) => p.product_id === selectedProductId);
    if (target) {
      const detail = await getCompanyPlaybook(domain, target.id);
      setPlaybook(detail);
    }
  }, [domain, selectedProductId]);

  const { isGenerating, generationError, startGeneration } = usePlaybookGeneration({
    domain,
    productId: selectedProductId,
    onComplete: handleGenerationComplete,
  });

  return {
    products,
    productsLoading,
    productsError,
    selectedProductId,
    selectProduct,
    selectedProductName,
    playbook,
    playbookLoading,
    isGenerating,
    generationError,
    generatePlaybook: startGeneration,
    productIdsWithPlaybook,
  };
}
