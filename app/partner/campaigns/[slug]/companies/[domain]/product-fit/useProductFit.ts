'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useCampaignDetail } from '@/components/providers/CampaignDetailProvider';
import { useSignalSelection } from '@/hooks/useSignalSelection';
import { getFitBreakdown } from '@/lib/api/fit-scores';
import { getCompanyExplainability } from '@/lib/api/companies';
import type {
  FitScore,
  SignalInterest,
  SignalEvent,
  CompanyExplainabilityResponse,
} from '@/lib/schemas';

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

/** Fetches product fit breakdown and signal data for the campaign's target product. */
export function useProductFit() {
  const { domain: rawDomain } = useParams<{ domain: string }>();
  const domain = decodeURIComponent(rawDomain);
  const { campaign, loading: campaignLoading } = useCampaignDetail();

  const [breakdown, setBreakdown] = useState<FitScore | null>(null);
  const [explainability, setExplainability] = useState<CompanyExplainabilityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const signalSelection = useSignalSelection(domain);
  const productId = campaign?.target_product_id;

  useEffect(() => {
    if (campaignLoading) return;

    if (!productId) {
      setLoading(false);
      setError('No target product configured for this campaign.');
      return;
    }

    let cancelled = false;

    async function fetch() {
      setLoading(true);
      setError(null);

      const [breakdownResult, explainabilityResult] = await Promise.allSettled([
        getFitBreakdown(domain, productId!),
        getCompanyExplainability(domain),
      ]);

      if (cancelled) return;

      if (breakdownResult.status === 'fulfilled') {
        setBreakdown(breakdownResult.value);
      }

      if (explainabilityResult.status === 'fulfilled') {
        setExplainability(explainabilityResult.value);
      }

      if (breakdownResult.status === 'rejected' && explainabilityResult.status === 'rejected') {
        setError('Failed to load product fit data.');
      }

      setLoading(false);
    }

    fetch();
    return () => { cancelled = true; };
  }, [domain, productId, campaignLoading]);

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
