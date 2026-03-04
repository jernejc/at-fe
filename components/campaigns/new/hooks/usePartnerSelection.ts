'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { getPartners } from '@/lib/api/partners';
import type { PartnerSummary, WSPartnerSuggestion } from '@/lib/schemas';

export type PartnerListItem = PartnerSummary;

interface UsePartnerSelectionReturn {
  partners: PartnerListItem[];
  selectedPartnerSlugs: Set<string>;
  togglePartner: (slug: string) => void;
  loading: boolean;
  reset: () => void;
}

/** Fetches partner data and manages selection state with suggestion pre-selection. */
export function usePartnerSelection(
  suggestions: WSPartnerSuggestion[],
  shouldFetch: boolean,
): UsePartnerSelectionReturn {
  const [partners, setPartners] = useState<PartnerListItem[]>([]);
  const [selectedPartnerSlugs, setSelectedPartnerSlugs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const fetchedRef = useRef(false);
  const preSelectedRef = useRef(false);

  // Fetch partners when entering the partners step
  useEffect(() => {
    if (!shouldFetch || fetchedRef.current) return;
    fetchedRef.current = true;

    async function load() {
      setLoading(true);
      try {
        const { items } = await getPartners({ page_size: 50 });
        setPartners(items);
      } catch (err) {
        console.error('Failed to load partners:', err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [shouldFetch]);

  // Pre-select suggested partners (only once)
  useEffect(() => {
    if (preSelectedRef.current || partners.length === 0 || suggestions.length === 0) return;
    preSelectedRef.current = true;

    const suggestedSlugs = new Set(suggestions.map((s) => s.slug));
    const validSlugs = new Set(
      partners.filter((p) => suggestedSlugs.has(p.slug)).map((p) => p.slug),
    );
    setSelectedPartnerSlugs(validSlugs);
  }, [partners, suggestions]);

  const togglePartner = useCallback((slug: string) => {
    setSelectedPartnerSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }, []);

  /** Fully resets partner state so the next fetch/pre-selection starts fresh. */
  const reset = useCallback(() => {
    fetchedRef.current = false;
    preSelectedRef.current = false;
    setPartners([]);
    setSelectedPartnerSlugs(new Set());
  }, []);

  return { partners, selectedPartnerSlugs, togglePartner, loading, reset };
}
