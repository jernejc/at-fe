'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getCampaigns, getProducts, getNotifications } from '@/lib/api';
import type { CampaignSummary, CampaignRowData, Notification } from '@/lib/schemas';
import type { ProductSummary } from '@/lib/schemas/product';
import type {
  FilterDefinition,
  ActiveFilter,
  SortOptionDefinition,
  SortState,
} from '@/lib/schemas/filter';

const PAGE_SIZE = 20;
const NEW_THRESHOLD_MS = 24 * 60 * 60 * 1000;

const STATUS_FILTER: FilterDefinition = {
  key: 'status',
  label: 'Status',
  operators: ['is'],
  options: [
    { value: 'published', label: 'Published' },
    { value: 'completed', label: 'Completed' },
    { value: 'archived', label: 'Archived' },
  ],
};

export const FILTER_DEFINITIONS: FilterDefinition[] = [STATUS_FILTER];

export const SORT_OPTIONS: SortOptionDefinition[] = [
  { value: 'name', label: 'Name' },
  { value: 'created_at', label: 'Date Created' },
  { value: 'updated_at', label: 'Last Updated' },
  { value: 'company_count', label: 'Companies' },
];

/** Hook encapsulating all state and logic for the partner campaigns list page. */
export function usePartnerCampaignsList() {
  const router = useRouter();
  const { data: session } = useSession();

  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [sort, setSort] = useState<SortState | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const apiParams = useMemo(() => {
    const statusFilter = filters.find((f) => f.key === 'status');
    return {
      page: 1,
      page_size: 100,
      ...(statusFilter && { status: statusFilter.value }),
      ...(sort && {
        sort_by: sort.field as 'name' | 'created_at' | 'updated_at' | 'company_count',
        sort_order: sort.direction,
      }),
    };
  }, [filters, sort]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [productsData, campaignsData, notificationsData] = await Promise.all([
        getProducts(1, 100),
        getCampaigns(apiParams),
        getNotifications(100),
      ]);

      setProducts(productsData.items);
      const items = Array.isArray(campaignsData) ? campaignsData : campaignsData.items || [];
      setCampaigns(items);
      setNotifications(notificationsData.items);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error fetching partner campaigns:', err);
    } finally {
      setLoading(false);
    }
  }, [apiParams]);

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

  /** Filter and aggregate "new" opportunity notifications. */
  const { newOpportunitiesTotal, campaignNewOpportunityMap } = useMemo(() => {
    const now = Date.now();
    const newNotifs = notifications.filter((n) => {
      if (n.type !== 'new_opportunities') return false;
      const isNew = !n.read || now - new Date(n.created_at).getTime() < NEW_THRESHOLD_MS;
      return isNew;
    });

    let total = 0;
    const map = new Map<number, number>();
    for (const n of newNotifs) {
      const count = n.data.opportunity_count ?? 0;
      total += count;
      const cid = n.campaign_id;
      if (cid != null) {
        map.set(cid, (map.get(cid) ?? 0) + count);
      }
    }

    return { newOpportunitiesTotal: total, campaignNewOpportunityMap: map };
  }, [notifications]);

  // Client-side search filter + enrichment
  const filteredRows = useMemo(() => {
    const needle = search.toLowerCase().trim();
    const filtered = needle
      ? campaigns.filter((c) => c.name.toLowerCase().includes(needle))
      : campaigns;

    return filtered.map<CampaignRowData>((c) => ({
      ...c,
      product_name: products.find((p) => p.id === c.target_product_id)?.name ?? null,
      engaged_count: 0,
      assigned_count: 0,
      newOpportunityCount: campaignNewOpportunityMap.get(c.id) ?? 0,
    }));
  }, [campaigns, products, search, campaignNewOpportunityMap]);

  const { paginatedRows, totalFiltered } = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return {
      paginatedRows: filteredRows.slice(start, start + PAGE_SIZE),
      totalFiltered: filteredRows.length,
    };
  }, [filteredRows, currentPage]);

  /** Dashboard metrics aggregated from filtered campaigns. */
  const metrics = useMemo(() => {
    const campaignCount = filteredRows.length;
    const opportunitiesWon = filteredRows.reduce((sum, c) => sum + (c.completed_won_count ?? 0), 0);

    const withConversion = filteredRows.filter((c) => c.company_count > 0 && c.completed_won_count != null);
    const avgConversion = withConversion.length > 0
      ? withConversion.reduce((sum, c) => sum + ((c.completed_won_count ?? 0) / c.company_count) * 100, 0) / withConversion.length
      : 0;

    return { campaignCount, newOpportunitiesTotal, opportunitiesWon, avgConversion };
  }, [filteredRows, newOpportunitiesTotal]);

  const hasActiveFilters = filters.length > 0 || search.trim().length > 0;
  const hasNoCampaigns = !loading && !error && campaigns.length === 0 && !hasActiveFilters;
  const hasNoResults = !loading && !error && totalFiltered === 0 && !hasNoCampaigns;

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

  const handleRowClick = (campaign: CampaignRowData) => {
    router.push(`/partner/campaigns/${campaign.slug}`);
  };

  return {
    paginatedRows,
    totalFiltered,
    metrics,
    loading,
    error,
    hasNoCampaigns,
    hasNoResults,
    search,
    filters,
    sort,
    currentPage,
    pageSize: PAGE_SIZE,
    handleSearchChange,
    handleFiltersChange,
    handleSortChange,
    handleRowClick,
    handlePageChange: setCurrentPage,
  };
}
