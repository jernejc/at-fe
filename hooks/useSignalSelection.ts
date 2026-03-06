'use client';

import { useState, useCallback } from 'react';
import { getSignalProvenance } from '@/lib/api';
import type { SignalProvenanceResponse } from '@/lib/schemas/provenance';

export interface UseSignalSelectionReturn {
  selectedSignalId: number | null;
  provenance: SignalProvenanceResponse | null;
  provenanceLoading: boolean;
  selectSignal: (signalId: number) => void;
  clearSelection: () => void;
}

/** Manages signal selection and provenance fetching for detail panels. */
export function useSignalSelection(domain: string): UseSignalSelectionReturn {
  const [selectedSignalId, setSelectedSignalId] = useState<number | null>(null);
  const [provenance, setProvenance] = useState<SignalProvenanceResponse | null>(null);
  const [provenanceLoading, setProvenanceLoading] = useState(false);

  const selectSignal = useCallback((signalId: number) => {
    // Toggle off if same signal clicked
    if (signalId === selectedSignalId) {
      setSelectedSignalId(null);
      setProvenance(null);
      return;
    }

    setSelectedSignalId(signalId);
    setProvenanceLoading(true);
    setProvenance(null);

    getSignalProvenance(domain, signalId)
      .then((res) => {
        setProvenance(res);
      })
      .catch((err) => {
        console.error('Failed to fetch signal provenance', err);
      })
      .finally(() => {
        setProvenanceLoading(false);
      });
  }, [domain, selectedSignalId]);

  const clearSelection = useCallback(() => {
    setSelectedSignalId(null);
    setProvenance(null);
  }, []);

  return { selectedSignalId, provenance, provenanceLoading, selectSignal, clearSelection };
}
