'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAgenticSearch } from '@/hooks/useAgenticSearch';
import type { ProductSummary } from '@/lib/schemas';
import { useResultsFilters } from './hooks/useResultsFilters';
import { usePartnerSelection } from './hooks/usePartnerSelection';
import { useCampaignCreation } from './hooks/useCampaignCreation';
import type { WizardStep, SlideDirection } from './useNewCampaignFlow.types';

interface UseNewCampaignFlowOptions {
  products: ProductSummary[];
  preselectedProductId: number | null;
}

/** Orchestrates the entire new-campaign wizard, composing domain-specific sub-hooks. */
export function useNewCampaignFlow({ products, preselectedProductId }: UseNewCampaignFlowOptions) {
  const router = useRouter();

  // Step state
  const [step, setStep] = useState<WizardStep>('search');
  const [direction, setDirection] = useState<SlideDirection>(1);

  // Product selection
  const initialProduct = useMemo(() => {
    if (preselectedProductId) {
      return products.find((p) => p.id === preselectedProductId) ?? null;
    }
    return null;
  }, [products, preselectedProductId]);

  const [selectedProduct, setSelectedProduct] = useState<ProductSummary | null>(initialProduct);

  // Company detail selection (results step sub-state)
  const [selectedCompanyDomain, setSelectedCompanyDomain] = useState<string | null>(null);

  // Search history for multi-turn query chaining
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Track latest single query for quick reference
  const lastQueryRef = useRef<string | null>(null);

  // Key to force-remount CampaignInput, clearing its internal messages
  const [inputResetKey, setInputResetKey] = useState(0);

  // Ref for programmatic submission into CampaignInput (e.g. suggested queries)
  const externalSubmitRef = useRef<((query: string) => void) | null>(null);

  // Ref for prefilling CampaignInput without submitting (e.g. search step suggestions)
  const externalPrefillRef = useRef<((query: string) => void) | null>(null);

  // Agentic search
  const {
    state: agenticState,
    search,
    reset: resetSearch,
    isSearching,
  } = useAgenticSearch({});

  // Sub-hooks
  const resultsFilters = useResultsFilters(agenticState.companies);
  const partnerSelection = usePartnerSelection(
    agenticState.partnerSuggestions,
    step === 'partners',
  );
  const creation = useCampaignCreation();

  // Navigation helpers
  const goTo = useCallback((target: WizardStep) => {
    setStep((prev) => {
      const order: WizardStep[] = ['search', 'results', 'partners', 'create'];
      const d = order.indexOf(target) > order.indexOf(prev) ? 1 : -1;
      setDirection(d as SlideDirection);
      return target;
    });
  }, []);

  /** Combines search history into a single query string for multi-turn refinement. */
  const buildCombinedQuery = useCallback((history: string[]) => {
    return history.length > 1
      ? history.join('\n\n---\n\n**Update:**\n')
      : history[0];
  }, []);

  // Handlers
  const handleSubmit = useCallback(
    (query: string) => {
      const newHistory = [...searchHistory, query];
      setSearchHistory(newHistory);
      lastQueryRef.current = query;

      const combinedQuery = buildCombinedQuery(newHistory);
      goTo('results');
      search(combinedQuery, {
        product_id: selectedProduct?.id ?? undefined,
        include_partner_suggestions: true,
        entity_types: ['companies', 'partners'],
        limit: 100,
      });
    },
    [search, selectedProduct, goTo, searchHistory, buildCombinedQuery],
  );

  const handleProductSelect = useCallback(
    (product: ProductSummary) => {
      // Same product already selected — skip re-search
      if (selectedProduct?.id === product.id) return;

      setSelectedProduct(product);

      // Re-trigger search with the new product if we have a previous query
      if (searchHistory.length > 0) {
        const combinedQuery = buildCombinedQuery(searchHistory);
        resetSearch();
        search(combinedQuery, {
          product_id: product.id,
          include_partner_suggestions: true,
          entity_types: ['companies', 'partners'],
          limit: 100,
        });
      }
    },
    [search, resetSearch, searchHistory, buildCombinedQuery, selectedProduct],
  );

  const handleClose = useCallback(() => {
    router.push('/campaigns');
  }, [router]);

  const handleRestart = useCallback(() => {
    resetSearch();
    resultsFilters.resetFilters();
    partnerSelection.reset();
    setSelectedCompanyDomain(null);
    setSelectedProduct(null);
    setSearchHistory([]);
    lastQueryRef.current = null;
    setInputResetKey((k) => k + 1);
    setStep('search');
    setDirection(-1);
  }, [resetSearch, resultsFilters, partnerSelection]);

  const handleSelectPartners = useCallback(() => goTo('partners'), [goTo]);
  const handleBack = useCallback(() => {
    if (step === 'partners') goTo('results');
    else if (step === 'create') goTo('partners');
  }, [step, goTo]);
  const handleContinue = useCallback(() => {
    if (step === 'partners') goTo('create');
  }, [step, goTo]);

  const handleSuggestedQuery = useCallback((query: string) => {
    // Suggested queries start a fresh search — clear history so handleSubmit doesn't chain
    setSearchHistory([]);
    externalSubmitRef.current?.(query);
  }, []);

  /** Prefill the input with a query without submitting (search step suggestions). */
  const handlePrefillQuery = useCallback((query: string) => {
    externalPrefillRef.current?.(query);
  }, []);

  const handleSelectCompany = useCallback((domain: string) => {
    setSelectedCompanyDomain((prev) => (prev === domain ? null : domain));
  }, []);

  const handleCreate = useCallback(() => {
    if (!selectedProduct) return;
    creation.create({
      productId: selectedProduct.id,
      companies: resultsFilters.filteredCompanies,
      selectedPartnerSlugs: partnerSelection.selectedPartnerSlugs,
      partnerSuggestions: agenticState.partnerSuggestions,
      allPartners: partnerSelection.partners,
    });
  }, [selectedProduct, creation, resultsFilters.filteredCompanies, partnerSelection, agenticState.partnerSuggestions]);

  return {
    // Step
    step,
    direction,
    // Product
    products,
    selectedProduct,
    handleProductSelect,
    inputResetKey,
    externalSubmitRef,
    externalPrefillRef,
    // Search
    agenticState,
    isSearching,
    handleSubmit,
    handleSuggestedQuery,
    handlePrefillQuery,
    // Results filters
    resultsFilters,
    filteredCompanies: resultsFilters.filteredCompanies,
    // Company detail
    selectedCompanyDomain,
    handleSelectCompany,
    // Partners
    partnerSelection,
    // Creation
    creation,
    // Navigation
    handleClose,
    handleRestart,
    handleSelectPartners,
    handleBack,
    handleContinue,
    handleCreate,
  };
}
