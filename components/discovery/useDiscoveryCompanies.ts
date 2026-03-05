'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getCompanies } from '@/lib/api/companies';
import { getProducts, getProductCandidates } from '@/lib/api/products';
import { searchCompanies } from '@/lib/api/search';
import type { CompanyRowData } from '@/lib/schemas/company';
import type { CompanySummary, CompanySummaryWithFit } from '@/lib/schemas/company';
import type { ProductSummary } from '@/lib/schemas/product';
import type { CandidateFitSummary } from '@/lib/schemas/fit';
import type { FilterDefinition, ActiveFilter, SortOptionDefinition, SortState } from '@/lib/schemas/filter';

const PAGE_SIZE = 50;

const SORT_OPTIONS: SortOptionDefinition[] = [
  { value: 'fit_score', label: 'Fit Score' },
  { value: 'name', label: 'Name' },
  { value: 'employee_count', label: 'Employees' },
  { value: 'updated_at', label: 'Last Updated' },
];

const SCORE_FILTER: FilterDefinition = {
  key: 'score',
  label: 'Score',
  operators: ['is'],
  options: [
    { value: 'hot', label: 'Hot (80+)' },
    { value: 'warm', label: 'Warm (60-79)' },
    { value: 'cold', label: 'Cold (<60)' },
  ],
};

/** Build a product filter definition from the loaded product list. */
function buildProductFilter(products: ProductSummary[]): FilterDefinition {
  return {
    key: 'product',
    label: 'Product',
    operators: ['is'],
    options: products.map((p) => ({ value: String(p.id), label: p.name })),
  };
}

/** Map a company summary (all-companies mode) to CompanyRowData. */
function companySummaryToRow(c: CompanySummary | CompanySummaryWithFit): CompanyRowData {
  const withFit = c as CompanySummaryWithFit;
  return {
    id: c.id,
    name: c.name,
    domain: c.domain,
    logo_url: c.logo_url,
    logo_base64: c.logo_base64,
    status: 'default',
    fit_score: withFit.combined_score ?? withFit.likelihood_score ?? null,
    hq_country: c.hq_country,
    employee_count: c.employee_count,
  };
}

/** Map a product candidate to CompanyRowData. */
function candidateToRow(c: CandidateFitSummary): CompanyRowData {
  return {
    id: c.company_id,
    name: c.company_name,
    domain: c.company_domain,
    logo_url: c.logo_url,
    logo_base64: c.logo_base64,
    status: 'default',
    fit_score: c.combined_score,
    hq_country: c.hq_country ?? null,
    employee_count: c.employee_count ?? null,
  };
}

export interface UseDiscoveryCompaniesReturn {
  companies: CompanyRowData[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterDefinitions: FilterDefinition[];
  activeFilters: ActiveFilter[];
  setActiveFilters: (filters: ActiveFilter[]) => void;
  sortOptions: SortOptionDefinition[];
  activeSort: SortState | null;
  setActiveSort: (sort: SortState | null) => void;
  refetch: () => void;
}

/** Fetches and manages discovery companies with search, sort, and filter. */
export function useDiscoveryCompanies(): UseDiscoveryCompaniesReturn {
  const [rawCompanies, setRawCompanies] = useState<CompanyRowData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPageRaw] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFiltersRaw] = useState<ActiveFilter[]>([]);
  const [activeSort, setActiveSortRaw] = useState<SortState | null>({ field: 'updated_at', direction: 'desc' });

  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [fetchVersion, setFetchVersion] = useState(0);
  const refetch = useCallback(() => setFetchVersion((v) => v + 1), []);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, [searchQuery]);

  // Reset page on filter/sort/search change
  const setActiveFilters = useCallback((filters: ActiveFilter[]) => {
    setActiveFiltersRaw(filters);
    setPageRaw(1);
  }, []);

  const setActiveSort = useCallback((sort: SortState | null) => {
    setActiveSortRaw(sort);
    setPageRaw(1);
  }, []);

  const setPage = useCallback((p: number) => setPageRaw(p), []);

  // Fetch products once for filter options
  useEffect(() => {
    getProducts(1, 100).then((res) => setProducts(res.items)).catch(() => setProducts([]));
  }, []);

  // Derived filter values
  const productFilter = activeFilters.find((f) => f.key === 'product');
  const scoreFilter = activeFilters.find((f) => f.key === 'score');
  const productId = productFilter ? Number(productFilter.value) : null;

  // Fetch companies
  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        let rows: CompanyRowData[];
        let total: number;

        if (debouncedSearch.length >= 2) {
          // Search mode
          const result = await searchCompanies(debouncedSearch, PAGE_SIZE, productId ?? undefined);
          rows = result.companies.map(companySummaryToRow);
          total = result.total_results;
        } else if (productId) {
          // Product candidates mode
          const minFit = scoreFilter?.value === 'hot' ? 0.8 : scoreFilter?.value === 'warm' ? 0.6 : undefined;
          const result = await getProductCandidates(productId, {
            page,
            page_size: PAGE_SIZE,
            min_fit_score: minFit,
          });
          rows = result.candidates.map(candidateToRow);
          total = result.total;

          // Client-side score filtering for 'cold' (< 0.6)
          if (scoreFilter?.value === 'cold') {
            rows = rows.filter((r) => r.fit_score != null && r.fit_score < 0.6);
          }
          // Client-side warm upper-bound (< 0.8)
          if (scoreFilter?.value === 'warm') {
            rows = rows.filter((r) => r.fit_score != null && r.fit_score < 0.8);
          }
        } else {
          // All companies mode
          const result = await getCompanies({
            page,
            page_size: PAGE_SIZE,
            sort_by: (activeSort?.field as 'name' | 'employee_count' | 'updated_at' | 'fit_score') ?? undefined,
            sort_order: activeSort?.direction,
          });
          rows = result.items.map(companySummaryToRow);
          total = result.total;
        }

        if (!cancelled) {
          setRawCompanies(rows);
          setTotalCount(total);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load companies');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [page, activeSort, productId, scoreFilter?.value, debouncedSearch, fetchVersion]);

  // Client-side search filtering for results already loaded
  const companies = useMemo(() => {
    if (!debouncedSearch || debouncedSearch.length >= 2) return rawCompanies;
    return rawCompanies;
  }, [rawCompanies, debouncedSearch]);

  const filterDefinitions = useMemo<FilterDefinition[]>(
    () => [buildProductFilter(products), SCORE_FILTER],
    [products],
  );

  return {
    companies,
    totalCount,
    loading,
    error,
    page,
    pageSize: PAGE_SIZE,
    setPage,
    searchQuery,
    setSearchQuery,
    filterDefinitions,
    activeFilters,
    setActiveFilters,
    sortOptions: SORT_OPTIONS,
    activeSort,
    setActiveSort,
    refetch,
  };
}
