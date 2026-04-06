'use client';

import { useEffect } from 'react';
import { useDiscoveryDetail } from '@/components/providers/DiscoveryDetailProvider';
import { useSignalSelection } from '@/hooks/useSignalSelection';

/** Provides event signals and narrative from cached explainability data. */
export function useDiscoveryEvents() {
  const { domain, explainability, explainabilityLoading, explainabilityError, ensureExplainability, getCachedSignalProvenance } =
    useDiscoveryDetail();

  const signalSelection = useSignalSelection(domain, getCachedSignalProvenance);

  useEffect(() => {
    ensureExplainability();
  }, [ensureExplainability]);

  const events = explainability?.signals_summary.events ?? [];
  const narrative = explainability?.event_narrative ?? null;

  return {
    events,
    narrative,
    loading: explainabilityLoading,
    error: explainabilityError,
    ...signalSelection,
  };
}
