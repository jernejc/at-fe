'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getCampaigns, getProducts } from '@/lib/api';
import type { CampaignSummary, CampaignRowData } from '@/lib/schemas';
import type { ProductSummary } from '@/lib/schemas/product';
import type {
  FilterDefinition,
  ActiveFilter,
  SortOptionDefinition,
  SortState,
} from '@/lib/schemas/filter';

const PAGE_SIZE = 20;

const STATUS_FILTER: FilterDefinition = {
  key: 'status',
  label: 'Status',
  operators: ['is'],
  options: [
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
    { value: 'completed', label: 'Completed' },
    { value: 'archived', label: 'Archived' },
  ],
};

const OWNER_FILTER: FilterDefinition = {
  key: 'owner',
  label: 'Owner',
  operators: ['is'],
  options: [{ value: 'mine', label: 'Me' }],
};

export const FILTER_DEFINITIONS: FilterDefinition[] = [STATUS_FILTER, OWNER_FILTER];

export const SORT_OPTIONS: SortOptionDefinition[] = [
  { value: 'name', label: 'Name' },
  { value: 'created_at', label: 'Date Created' },
  { value: 'updated_at', label: 'Last Updated' },
  { value: 'company_count', label: 'Companies' },
];

/** Hook encapsulating all state and logic for the campaigns list page. */
export function useCampaignsList() {
  const router = useRouter();
  const { data: session } = useSession();

  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [sort, setSort] = useState<SortState | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Build API params from current filter/sort state
  const apiParams = useMemo(() => {
    const statusFilter = filters.find((f) => f.key === 'status');
    const ownerFilter = filters.find((f) => f.key === 'owner');

    return {
      page: 1,
      page_size: 100,
      ...(statusFilter && { status: statusFilter.value }),
      ...(ownerFilter?.value === 'mine' && { own_only: true as const }),
      ...(sort && {
        sort_by: sort.field as 'name' | 'created_at' | 'updated_at' | 'company_count',
        sort_order: sort.direction,
      }),
    };
  }, [filters, sort]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [productsData, campaignsData] = await Promise.all([
        getProducts(1, 100),
        getCampaigns(apiParams),
      ]);

      setProducts(productsData.items);
      const items = Array.isArray(campaignsData) ? campaignsData : campaignsData.items || [];
      setCampaigns(items);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error fetching campaigns:', err);
    } finally {
      setLoading(false);
    }
  }, [apiParams]);

  // Track initial fetch to prevent refetching on session object changes
  const hasFetchedRef = useRef(false);
  const prevParamsRef = useRef(apiParams);

  useEffect(() => {
    const paramsChanged = prevParamsRef.current !== apiParams;
    prevParamsRef.current = apiParams;

    if (session && (!hasFetchedRef.current || paramsChanged)) {
      hasFetchedRef.current = true;
      fetchData();
    }
  }, [fetchData, session, apiParams]);

  // Client-side search filter + enrichment
  const filteredRows = useMemo(() => {
    const needle = search.toLowerCase().trim();
    const filtered = needle
      ? campaigns.filter((c) => c.name.toLowerCase().includes(needle))
      : campaigns;

    return filtered.map<CampaignRowData>((c) => ({
      ...c,
      product_name: products.find((p) => p.id === c.target_product_id)?.name ?? null,
    }));
  }, [campaigns, products, search]);

  // Pagination
  const { paginatedRows, totalFiltered } = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return {
      paginatedRows: filteredRows.slice(start, start + PAGE_SIZE),
      totalFiltered: filteredRows.length,
    };
  }, [filteredRows, currentPage]);

  // Dashboard metrics aggregated from filtered campaigns
  const metrics = useMemo(() => {
    const campaignCount = filteredRows.length;
    const opportunitiesWon = filteredRows.reduce((sum, c) => sum + (c.completed_won_count ?? 0), 0);
    const totalWon = filteredRows.reduce((sum, c) => sum + (c.total_won_amount ?? 0), 0);

    const withConversion = filteredRows.filter((c) => c.company_count > 0 && c.completed_won_count != null);
    const avgConversion = withConversion.length > 0
      ? withConversion.reduce((sum, c) => sum + ((c.completed_won_count ?? 0) / c.company_count) * 100, 0) / withConversion.length
      : 0;

    return { campaignCount, opportunitiesWon, avgConversion, totalWon };
  }, [filteredRows]);

  const hasActiveFilters = filters.length > 0 || search.trim().length > 0;
  const hasNoCampaigns = !loading && !error && campaigns.length === 0 && !hasActiveFilters;
  const hasNoResults = !loading && !error && totalFiltered === 0 && !hasNoCampaigns;

  // Reset page when search or filters change
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleFiltersChange = (value: ActiveFilter[]) => {
    setFilters(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: SortState | null) => {
    setSort(value);
    setCurrentPage(1);
  };

  const handleNewCampaign = () => {
    router.push('/campaigns/start');
  };

  const handleRowClick = (campaign: CampaignRowData) => {
    router.push(`/campaigns/${campaign.slug}`);
  };

  return {
    // Data
    paginatedRows,
    totalFiltered,
    metrics,
    loading,
    error,
    hasNoCampaigns,
    hasNoResults,
    // Controls
    search,
    filters,
    sort,
    currentPage,
    pageSize: PAGE_SIZE,
    // Handlers
    handleSearchChange,
    handleFiltersChange,
    handleSortChange,
    handleNewCampaign,
    handleRowClick,
    handlePageChange: setCurrentPage,
  };
}
