'use client';

import { useState, useEffect, useRef } from 'react';
import { getPartner } from '@/lib/api/partners';
import type { PartnerRead } from '@/lib/schemas';

interface UsePartnerDetailOptions {
  partnerId: number;
  isOpen: boolean;
}

export interface UsePartnerDetailReturn {
  /** Full partner details including campaigns, products, contact info. */
  partnerDetails: PartnerRead | null;
  loading: boolean;
  error: string | null;
}

/**
 * Fetches full partner details from GET /api/v1/partners/{id}.
 * The response includes campaigns, products, contact info, and interest weights.
 */
export function usePartnerDetail({ partnerId, isOpen }: UsePartnerDetailOptions): UsePartnerDetailReturn {
  const [partnerDetails, setPartnerDetails] = useState<PartnerRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen || !partnerId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting state on close is intentional
      setPartnerDetails(null);
      fetchingRef.current = null;
      return;
    }

    // Prevent duplicate fetches for the same partner (e.g. React Strict Mode)
    if (fetchingRef.current === partnerId) return;
    fetchingRef.current = partnerId;

    setLoading(true);
    setError(null);

    getPartner(partnerId)
      .then((data) => {
        if (fetchingRef.current === partnerId) setPartnerDetails(data);
      })
      .catch((err) => {
        if (fetchingRef.current === partnerId) {
          setError(err instanceof Error ? err.message : 'Failed to load partner details');
        }
      })
      .finally(() => {
        if (fetchingRef.current === partnerId) setLoading(false);
      });
  }, [partnerId, isOpen]);

  return { partnerDetails, loading, error };
}
