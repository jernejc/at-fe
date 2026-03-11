'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getCompanies } from '@/lib/api/companies';
import { getProducts, getProductCandidates, exportProductXlsx } from '@/lib/api/products';
import { searchCompanies } from '@/lib/api/search';
import { toast } from 'sonner';
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
  isExporting: boolean;
  handleExport: () => Promise<void>;
}

const VALID_SORT_FIELDS = new Set(SORT_OPTIONS.map((o) => o.value));
const VALID_SCORE_VALUES = new Set(SCORE_FILTER.options.map((o) => o.value));

/** Parse a SortState from URL search params. */
function parseSortFromParams(params: URLSearchParams): SortState | null {
  const field = params.get('sort');
  const dir = params.get('dir');
  if (!field || !VALID_SORT_FIELDS.has(field)) return null;
  return { field, direction: dir === 'asc' ? 'asc' : 'desc' };
}

/** Fetches and manages discovery companies with search, sort, and filter. */
export function useDiscoveryCompanies(): UseDiscoveryCompaniesReturn {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [rawCompanies, setRawCompanies] = useState<CompanyRowData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPageRaw] = useState(() => Number(searchParams.get('page')) || 1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFiltersRaw] = useState<ActiveFilter[]>([]);
  const [activeSort, setActiveSortRaw] = useState<SortState | null>(() => parseSortFromParams(searchParams));

  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [fetchVersion, setFetchVersion] = useState(0);
  const refetch = useCallback(() => setFetchVersion((v) => v + 1), []);
  const [isExporting, setIsExporting] = useState(false);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, [searchQuery]);

  // Reset page on filter/sort/search change; clear fit sort when product filter is removed
  const setActiveFilters = useCallback((filters: ActiveFilter[]) => {
    const hadProduct = activeFilters.some((f) => f.key === 'product');
    const hasProduct = filters.some((f) => f.key === 'product');
    if (hadProduct && !hasProduct && activeSort?.field === 'fit_score') {
      setActiveSortRaw(null);
    }
    setActiveFiltersRaw(filters);
    setPageRaw(1);
  }, [activeFilters, activeSort]);

  const setActiveSort = useCallback((sort: SortState | null) => {
    setActiveSortRaw(sort);
    setPageRaw(1);
  }, []);

  const setPage = useCallback((p: number) => setPageRaw(p), []);

  // Fetch products once for filter options
  useEffect(() => {
    getProducts(1, 100).then((res) => setProducts(res.items)).catch(() => setProducts([]));
  }, []);

  // Reconstruct filters from URL once products are loaded
  const filtersInitialized = useRef(false);
  useEffect(() => {
    if (products.length === 0 || filtersInitialized.current) return;
    filtersInitialized.current = true;

    const filters: ActiveFilter[] = [];
    const urlProduct = searchParams.get('product');
    if (urlProduct) {
      const product = products.find((p) => String(p.id) === urlProduct);
      if (product) {
        filters.push({ key: 'product', operator: 'is', value: urlProduct, fieldLabel: 'Product', valueLabel: product.name });
      }
    }
    const urlScore = searchParams.get('score');
    if (urlScore && VALID_SCORE_VALUES.has(urlScore)) {
      const scoreOption = SCORE_FILTER.options.find((o) => o.value === urlScore);
      if (scoreOption) {
        filters.push({ key: 'score', operator: 'is', value: urlScore, fieldLabel: 'Score', valueLabel: scoreOption.label });
      }
    }
    if (filters.length > 0) setActiveFiltersRaw(filters);
  }, [products, searchParams]);

  // Sync state → URL (skip during initial filter reconstruction)
  const isFirstSync = useRef(true);
  useEffect(() => {
    if (!filtersInitialized.current && products.length === 0) {
      // Products haven't loaded yet; skip to avoid clearing URL filter params
      return;
    }
    if (isFirstSync.current) {
      isFirstSync.current = false;
      return;
    }
    const params = new URLSearchParams();
    if (page > 1) params.set('page', String(page));
    const pf = activeFilters.find((f) => f.key === 'product');
    if (pf) params.set('product', pf.value);
    const sf = activeFilters.find((f) => f.key === 'score');
    if (sf) params.set('score', sf.value);
    if (activeSort) {
      params.set('sort', activeSort.field);
      params.set('dir', activeSort.direction);
    }
    const qs = params.toString();
    router.replace(qs ? `/discovery?${qs}` : '/discovery', { scroll: false });
  }, [page, activeFilters, activeSort, products, router]);

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

  // Only show fit score sort when a product filter is active
  const sortOptions = useMemo<SortOptionDefinition[]>(
    () => (productId ? SORT_OPTIONS : SORT_OPTIONS.filter((o) => o.value !== 'fit_score')),
    [productId],
  );

  const handleExport = useCallback(async () => {
    if (!productId) return;
    try {
      setIsExporting(true);
      const blob = await exportProductXlsx(productId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const productName = productFilter?.valueLabel?.toLowerCase().replace(/\s+/g, '_') ?? String(productId);
      a.download = `${productName}_export.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Export downloaded successfully');
    } catch (err) {
      console.error('Product export failed:', err);
      toast.error('Failed to export companies');
    } finally {
      setIsExporting(false);
    }
  }, [productId, productFilter?.valueLabel]);

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
    sortOptions,
    activeSort,
    setActiveSort,
    refetch,
    isExporting,
    handleExport,
  };
}
