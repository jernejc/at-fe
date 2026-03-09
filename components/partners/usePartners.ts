'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getPartners } from '@/lib/api/partners';
import { getProducts } from '@/lib/api/products';
import type { PartnerSummary, ProductSummary } from '@/lib/schemas';
import type { PartnerFilters } from '@/lib/schemas';
import type {
  SortOptionDefinition,
  SortState,
  FilterDefinition,
  ActiveFilter,
} from '@/lib/schemas/filter';
import type { PartnerRowData } from '@/components/campaigns/partners/PartnerRow';

const PAGE_SIZE = 50;

const PARTNER_SORT_FIELDS = ['name', 'created_at', 'updated_at'] as const satisfies readonly PartnerFilters['sort_by'][];

const SORT_OPTIONS: SortOptionDefinition[] = [
  { value: 'name', label: 'Name' },
  { value: 'created_at', label: 'Date Created' },
  { value: 'updated_at', label: 'Last Updated' },
];

const STATUS_FILTER: FilterDefinition = {
  key: 'status',
  label: 'Status',
  operators: ['is'],
  options: [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ],
};

/** Maps a PartnerSummary to PartnerRowData with defaults for campaign-specific fields. */
function toPartnerRowDataFromSummary(p: PartnerSummary): PartnerRowData {
  return {
    id: p.id,
    partnerId: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    logoUrl: p.logo_url,
    type: p.type ?? '',
    industries: p.industries ?? [],
    capacity: p.capacity ?? null,
    status: p.status,
    assignedCount: 0,
    inProgressCount: 0,
    completedCount: 0,
    taskCompletionPct: 0,
  };
}

export interface UsePartnersReturn {
  /** Filtered and sorted partners for display. */
  partners: PartnerRowData[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  sortOptions: SortOptionDefinition[];
  activeSort: SortState | null;
  setActiveSort: (sort: SortState | null) => void;
  filterDefinitions: FilterDefinition[];
  activeFilters: ActiveFilter[];
  setActiveFilters: (filters: ActiveFilter[]) => void;
  /** Current page (1-indexed). */
  page: number;
  /** Total number of partners (for pagination). */
  totalCount: number;
  /** Items per page. */
  pageSize: number;
  /** Change current page. */
  setPage: (page: number) => void;
  /** Re-fetch the partners list. */
  refetch: () => void;
}

/** Fetches partners with server-side pagination, sort, and filters. */
export function usePartners(): UsePartnersReturn {
  const [rawPartners, setRawPartners] = useState<PartnerSummary[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeSort, setActiveSort] = useState<SortState | null>({ field: 'name', direction: 'asc' });
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [fetchVersion, setFetchVersion] = useState(0);
  const refetch = useCallback(() => setFetchVersion((v) => v + 1), []);

  // Build filter definitions with products loaded dynamically
  const [products, setProducts] = useState<ProductSummary[]>([]);

  useEffect(() => {
    getProducts(1, 100).then((res) => setProducts(res.items)).catch((err) => console.error('Failed to load products for filters:', err));
  }, []);

  const filterDefinitions = useMemo<FilterDefinition[]>(() => {
    const defs: FilterDefinition[] = [STATUS_FILTER];
    if (products.length > 0) {
      defs.push({
        key: 'product_id',
        label: 'Product',
        operators: ['is'],
        options: products.map((p) => ({ value: String(p.id), label: p.name })),
      });
    }
    return defs;
  }, [products]);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, [searchQuery]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [activeFilters, activeSort]);

  // Extract filter values for the API call
  const statusFilter = activeFilters.find((f) => f.key === 'status')?.value;
  const productIdFilter = activeFilters.find((f) => f.key === 'product_id')?.value;

  // Fetch partners with pagination, sort, and filters
  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getPartners({
          page,
          page_size: PAGE_SIZE,
          status: statusFilter,
          product_id: productIdFilter ? Number(productIdFilter) : undefined,
          sort_by: PARTNER_SORT_FIELDS.find((f) => f === activeSort?.field),
          sort_order: activeSort?.direction,
        });
        if (!cancelled) {
          setRawPartners(data.items);
          setTotalCount(data.total);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load partners');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [page, fetchVersion, statusFilter, productIdFilter, activeSort]);

  // Client-side search only (sort + filter handled server-side)
  const partners = useMemo(() => {
    let mapped = rawPartners.map(toPartnerRowDataFromSummary);

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      mapped = mapped.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q),
      );
    }

    return mapped;
  }, [rawPartners, debouncedSearch]);

  return {
    partners,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    sortOptions: SORT_OPTIONS,
    activeSort,
    setActiveSort,
    filterDefinitions,
    activeFilters,
    setActiveFilters,
    page,
    totalCount,
    pageSize: PAGE_SIZE,
    setPage,
    refetch,
  };
}
