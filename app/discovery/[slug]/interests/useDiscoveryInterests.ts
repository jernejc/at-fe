'use client';

import { useEffect } from 'react';
import { useDiscoveryDetail } from '@/components/providers/DiscoveryDetailProvider';
import { useSignalSelection } from '@/hooks/useSignalSelection';

/** Provides interest signals and narrative from cached explainability data. */
export function useDiscoveryInterests() {
  const { domain, explainability, explainabilityLoading, explainabilityError, ensureExplainability, getCachedSignalProvenance } =
    useDiscoveryDetail();

  const signalSelection = useSignalSelection(domain, getCachedSignalProvenance);

  useEffect(() => {
    ensureExplainability();
  }, [ensureExplainability]);

  const interests = explainability?.signals_summary.interests ?? [];
  const narrative = explainability?.interest_narrative ?? null;

  return {
    interests,
    narrative,
    loading: explainabilityLoading,
    error: explainabilityError,
    ...signalSelection,
  };
}
