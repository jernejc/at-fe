'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getCampaignPartners } from '@/lib/api/partners';
import type { PartnerAssignmentSummary } from '@/lib/schemas';
import type { SortOptionDefinition, SortState } from '@/lib/schemas/filter';
import { toPartnerRowData, type PartnerRowData } from './PartnerRow';

const SORT_OPTIONS: SortOptionDefinition[] = [
  { value: 'name', label: 'Name' },
  { value: 'type', label: 'Type' },
  { value: 'capacity', label: 'Capacity' },
  { value: 'progress', label: 'Progress' },
];

/** Compare function for client-side sorting. */
function comparePartners(a: PartnerRowData, b: PartnerRowData, sort: SortState): number {
  let cmp = 0;

  switch (sort.field) {
    case 'name':
      cmp = a.name.localeCompare(b.name);
      break;
    case 'type':
      cmp = a.type.localeCompare(b.type);
      break;
    case 'capacity': {
      const capA = a.capacity ?? 0;
      const capB = b.capacity ?? 0;
      cmp = capA - capB;
      break;
    }
    case 'progress': {
      const progA = a.assignedCount > 0 ? a.completedCount / a.assignedCount : 0;
      const progB = b.assignedCount > 0 ? b.completedCount / b.assignedCount : 0;
      cmp = progA - progB;
      break;
    }
  }

  return sort.direction === 'desc' ? -cmp : cmp;
}

interface UseCampaignPartnersOptions {
  slug: string;
  enabled?: boolean;
  /** Pre-loaded partners from the provider (used as initial data, avoids duplicate fetch). */
  initialPartners?: PartnerAssignmentSummary[];
}

export interface UseCampaignPartnersReturn {
  /** Filtered and sorted partners for display. */
  partners: PartnerRowData[];
  /** All partners (unfiltered, for reassign dropdowns). */
  allPartners: PartnerAssignmentSummary[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  sortOptions: SortOptionDefinition[];
  activeSort: SortState | null;
  setActiveSort: (sort: SortState | null) => void;
  /** Re-fetch the partners list. */
  refetch: () => void;
}

/** Fetches and manages campaign partners with client-side search and sort. */
export function useCampaignPartners({ slug, enabled = true, initialPartners }: UseCampaignPartnersOptions): UseCampaignPartnersReturn {
  const hasInitial = initialPartners && initialPartners.length > 0;
  const [rawPartners, setRawPartners] = useState<PartnerAssignmentSummary[]>(initialPartners ?? []);
  const [loading, setLoading] = useState(!hasInitial);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeSort, setActiveSort] = useState<SortState | null>({ field: 'name', direction: 'asc' });
  const [fetchVersion, setFetchVersion] = useState(0);
  const refetch = useCallback(() => {
    setLoading(true);
    setFetchVersion((v) => v + 1);
  }, []);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, [searchQuery]);

  // Sync provider data when it arrives (initial load only)
  useEffect(() => {
    if (initialPartners && initialPartners.length > 0 && fetchVersion === 0) {
      setRawPartners(initialPartners);
      setLoading(false);
    }
  }, [initialPartners, fetchVersion]);

  // Fetch partners (skip initial when provider data is available)
  useEffect(() => {
    if (!enabled || !slug) return;
    if (fetchVersion === 0 && hasInitial) return;

    let cancelled = false;
    const fetchPartners = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getCampaignPartners(slug);
        if (!cancelled) setRawPartners(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load partners');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPartners();
    return () => { cancelled = true; };
  }, [slug, enabled, fetchVersion, hasInitial]);

  // Client-side search, sort, and mapping
  const partners = useMemo(() => {
    let mapped = rawPartners.map(toPartnerRowData);

    // Search by name
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      mapped = mapped.filter((p) => p.name.toLowerCase().includes(q));
    }

    // Sort
    if (activeSort) {
      mapped = [...mapped].sort((a, b) => comparePartners(a, b, activeSort));
    }

    return mapped;
  }, [rawPartners, debouncedSearch, activeSort]);

  return {
    partners,
    allPartners: rawPartners,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    sortOptions: SORT_OPTIONS,
    activeSort,
    setActiveSort,
    refetch,
  };
}
