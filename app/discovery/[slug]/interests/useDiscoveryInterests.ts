'use client';

import { useState, useEffect } from 'react';
import { useDiscoveryDetail } from '@/components/providers/DiscoveryDetailProvider';
import { useSignalSelection } from '@/hooks/useSignalSelection';
import { getCompanyExplainability } from '@/lib/api';
import type { SignalInterest } from '@/lib/schemas';

/** Fetches interest signals and narrative for the current discovery company. */
export function useDiscoveryInterests() {
  const { domain } = useDiscoveryDetail();

  const [interests, setInterests] = useState<SignalInterest[]>([]);
  const [narrative, setNarrative] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const signalSelection = useSignalSelection(domain);

  useEffect(() => {
    let cancelled = false;
    async function fetch() {
      setLoading(true);
      setError(null);
      try {
        const res = await getCompanyExplainability(domain);
        if (cancelled) return;
        setInterests(res.signals_summary.interests);
        setNarrative(res.interest_narrative ?? null);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load interests');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetch();
    return () => { cancelled = true; };
  }, [domain]);

  return { interests, narrative, loading, error, ...signalSelection };
}
