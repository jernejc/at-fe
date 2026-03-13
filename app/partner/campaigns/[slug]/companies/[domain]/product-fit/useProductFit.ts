'use client';

import { useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useCampaignCompanyDetail } from '@/components/providers/CampaignCompanyDetailProvider';
import { useSignalSelection } from '@/hooks/useSignalSelection';

/**
 * Filters explainability signals to only those whose category appears
 * in the breakdown's matched contributions.
 */
function filterMatchedSignals<T extends { category: string }>(
  signals: T[],
  matchedCategories: Set<string>,
): T[] {
  if (matchedCategories.size === 0) return [];
  return signals.filter((s) => matchedCategories.has(s.category));
}

/** Reads product fit data from the shared CampaignCompanyDetailProvider (lazy-loaded on first visit). */
export function useProductFit() {
  const { domain: rawDomain } = useParams<{ domain: string }>();
  const domain = decodeURIComponent(rawDomain);

  const {
    breakdown,
    explainability,
    productFitLoading: loading,
    productFitError: error,
    ensureProductFit,
  } = useCampaignCompanyDetail();

  const signalSelection = useSignalSelection(domain);

  // Trigger lazy fetch on first visit to the product-fit tab
  useEffect(() => {
    ensureProductFit();
  }, [ensureProductFit]);

  // Filter explainability signals to only those that matched in the breakdown
  const matchedInterestCategories = useMemo(
    () => new Set((breakdown?.interest_matches ?? []).map((m) => m.category)),
    [breakdown],
  );
  const matchedEventCategories = useMemo(
    () => new Set((breakdown?.event_matches ?? []).map((m) => m.category)),
    [breakdown],
  );

  const interests = useMemo(
    () => filterMatchedSignals(explainability?.signals_summary.interests ?? [], matchedInterestCategories),
    [explainability, matchedInterestCategories],
  );
  const events = useMemo(
    () => filterMatchedSignals(explainability?.signals_summary.events ?? [], matchedEventCategories),
    [explainability, matchedEventCategories],
  );

  const interestNarrative = explainability?.interest_narrative ?? null;
  const eventNarrative = explainability?.event_narrative ?? null;

  return {
    breakdown,
    interests,
    events,
    interestNarrative,
    eventNarrative,
    loading,
    error,
    domain,
    ...signalSelection,
  };
}
