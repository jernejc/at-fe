'use client';

import { useState, useEffect } from 'react';
import { useDiscoveryDetail } from '@/components/providers/DiscoveryDetailProvider';
import { useSignalSelection } from '@/hooks/useSignalSelection';
import { getCompanyExplainability } from '@/lib/api';
import type { SignalEvent } from '@/lib/schemas';

/** Fetches event signals and narrative for the current discovery company. */
export function useDiscoveryEvents() {
  const { domain } = useDiscoveryDetail();

  const [events, setEvents] = useState<SignalEvent[]>([]);
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
        setEvents(res.signals_summary.events);
        setNarrative(res.event_narrative ?? null);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load events');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetch();
    return () => { cancelled = true; };
  }, [domain]);

  return { events, narrative, loading, error, ...signalSelection };
}
