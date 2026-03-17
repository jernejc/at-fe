'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { getPartners } from '@/lib/api/partners';
import type { PartnerRead, WSPartnerSuggestion } from '@/lib/schemas';

export type PartnerListItem = PartnerRead;

interface UsePartnerSelectionReturn {
  partners: PartnerListItem[];
  selectedPartnerSlugs: Set<string>;
  selectedCapacity: number;
  togglePartner: (slug: string) => void;
  loading: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  loadMore: () => Promise<void>;
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
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const pageRef = useRef(1);
  const fetchedRef = useRef(false);
  const preSelectedRef = useRef(false);

  // Fetch partners when entering the partners step
  useEffect(() => {
    if (!shouldFetch || fetchedRef.current) return;
    fetchedRef.current = true;

    async function load() {
      setLoading(true);
      try {
        const res = await getPartners({ page_size: 50 });
        setPartners(res.items as PartnerListItem[]);
        setHasMore(res.has_next);
        pageRef.current = 1;
      } catch (err) {
        console.error('Failed to load partners:', err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [shouldFetch]);

  /** Load the next page of partners and append to the list. */
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = pageRef.current + 1;
      const res = await getPartners({ page_size: 50, page: nextPage });
      setPartners((prev) => [...prev, ...(res.items as PartnerListItem[])]);
      setHasMore(res.has_next);
      pageRef.current = nextPage;
    } catch (err) {
      console.error('Failed to load more partners:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore]);

  // Pre-select and sort suggested partners to top (only once)
  useEffect(() => {
    if (preSelectedRef.current || partners.length === 0 || suggestions.length === 0) return;
    preSelectedRef.current = true;

    const suggestedSlugs = new Set(suggestions.map((s) => s.slug));
    const validSlugs = new Set(
      partners.filter((p) => suggestedSlugs.has(p.slug)).map((p) => p.slug),
    );
    setSelectedPartnerSlugs(validSlugs);

    // Sort suggested partners to the top
    setPartners((prev) => {
      const suggested = prev.filter((p) => suggestedSlugs.has(p.slug));
      const rest = prev.filter((p) => !suggestedSlugs.has(p.slug));
      return [...suggested, ...rest];
    });
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
    pageRef.current = 1;
    setPartners([]);
    setSelectedPartnerSlugs(new Set());
    setHasMore(false);
  }, []);

  const selectedCapacity = useMemo(
    () => partners.filter((p) => selectedPartnerSlugs.has(p.slug)).reduce((sum, p) => sum + (p.capacity ?? 0), 0),
    [partners, selectedPartnerSlugs],
  );

  return { partners, selectedPartnerSlugs, selectedCapacity, togglePartner, loading, hasMore, loadingMore, loadMore, reset };
}
