'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDiscoveryDetail } from '@/components/providers/DiscoveryDetailProvider';
import { getCompanyPlaybooks, getCompanyPlaybook } from '@/lib/api';
import { usePlaybookGeneration } from '@/hooks/usePlaybookGeneration';
import type { ProductSummary, PlaybookRead } from '@/lib/schemas';

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

/** Loads products and playbook summaries from cached provider data, manages selection and generation. */
export function useDiscoveryPlaybook(): UseDiscoveryPlaybookReturn {
  const {
    domain,
    playbookProducts: products,
    playbookSummaries: summaries,
    playbooksLoading: productsLoading,
    playbooksError: productsError,
    ensurePlaybooks,
    setPlaybookSummaries: setSummaries,
  } = useDiscoveryDetail();

  useEffect(() => {
    ensurePlaybooks();
  }, [ensurePlaybooks]);

  // --- Local state: user-driven selection + detail ---
  const [userSelectedProductId, setUserSelectedProductId] = useState<number | null>(null);
  const [playbook, setPlaybook] = useState<PlaybookRead | null>(null);
  const [playbookLoading, setPlaybookLoading] = useState(false);

  // Auto-select: prefer product with existing playbook, fall back to first product
  const autoSelectedProductId = useMemo(() => {
    if (productsLoading || products.length === 0) return null;
    const playbookProductIds = new Set(summaries.map((p) => p.product_id));
    const withPlaybook = products.find((p) => playbookProductIds.has(p.id));
    return withPlaybook?.id ?? products[0].id;
  }, [products, summaries, productsLoading]);

  // User selection overrides auto-selection
  const selectedProductId = userSelectedProductId ?? autoSelectedProductId;

  // Fetch playbook detail when selection changes
  useEffect(() => {
    if (selectedProductId === null || productsLoading) return;

    const summary = summaries.find((s) => s.product_id === selectedProductId);
    if (!summary) return;

    let cancelled = false;

    async function fetchDetail() {
      setPlaybookLoading(true);
      try {
        const detail = await getCompanyPlaybook(domain, summary!.id);
        if (!cancelled) setPlaybook(detail);
      } catch (err) {
        console.error('Failed to fetch playbook detail:', err);
        if (!cancelled) setPlaybook(null);
      } finally {
        if (!cancelled) setPlaybookLoading(false);
      }
    }
    fetchDetail();

    return () => { cancelled = true; };
  }, [selectedProductId, summaries, domain, productsLoading]);

  const selectProduct = useCallback((productId: number) => {
    setUserSelectedProductId(productId);
    setPlaybook(null);
  }, []);

  const selectedProductName =
    products.find((p) => p.id === selectedProductId)?.name ?? null;

  const productIdsWithPlaybook = useMemo(
    () => new Set(summaries.map((s) => s.product_id)),
    [summaries],
  );

  // After generation completes, refresh summaries in provider cache and fetch new detail
  const handleGenerationComplete = useCallback(async () => {
    if (!selectedProductId) return;

    const { playbooks } = await getCompanyPlaybooks(domain);
    setSummaries(playbooks);

    const target = playbooks.find((p) => p.product_id === selectedProductId);
    if (target) {
      const detail = await getCompanyPlaybook(domain, target.id);
      setPlaybook(detail);
    }
  }, [domain, selectedProductId, setSummaries]);

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
