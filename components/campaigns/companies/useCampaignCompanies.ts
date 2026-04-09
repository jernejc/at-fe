'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getCampaignCompanies } from '@/lib/api/campaigns';
import { deriveCompanyStatus } from '@/lib/utils';
import type { CompanyRowData } from '@/lib/schemas/company';
import type { MembershipRead } from '@/lib/schemas/campaign';
import type { PartnerAssignmentSummary } from '@/lib/schemas/partner';
import type { FilterDefinition, ActiveFilter, SortOptionDefinition, SortState } from '@/lib/schemas/filter';

const PAGE_SIZE = 50;

const SORT_OPTIONS: SortOptionDefinition[] = [
  { value: 'fit_score', label: 'Fit Score' },
  { value: 'name', label: 'Name' },
  { value: 'created_at', label: 'Date Added' },
];

const STATUS_FILTER: FilterDefinition = {
  key: 'status',
  label: 'Status',
  operators: ['is'],
  options: [
    { value: 'new', label: 'New' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'closed_won', label: 'Closed Won' },
    { value: 'closed_lost', label: 'Closed Lost' },
    { value: 'default', label: 'Unworked' },
  ],
};

function buildPartnerFilter(partners: PartnerAssignmentSummary[]): FilterDefinition {
  return {
    key: 'partner',
    label: 'Partner',
    operators: ['is'],
    options: [
      { value: 'unassigned', label: 'Unassigned' },
      ...partners.map((p) => ({ value: String(p.partner_id), label: p.partner_name })),
    ],
  };
}

/** Map a campaign membership to the shape expected by CompanyRow. */
function toRowData(m: MembershipRead): CompanyRowData {
  return {
    id: m.id,
    company_id: m.company_id,
    name: m.company_name ?? m.domain,
    domain: m.domain,
    logo_url: m.logo_url,
    logo_base64: m.logo_base64,
    status: deriveCompanyStatus({ assignedAt: m.assigned_at }),
    fit_score: m.cached_fit_score,
    hq_country: m.hq_country,
    employee_count: m.employee_count,
    assigned_at: m.assigned_at,
    partner_id: m.assigned_partner_id ?? undefined,
    partner_name: m.assigned_partner_name ?? undefined,
  };
}

interface UseCampaignCompaniesOptions {
  slug: string;
  enabled?: boolean;
  /** Pre-loaded partners from the provider (avoids duplicate fetch). */
  partners?: PartnerAssignmentSummary[];
  /** Initial sort state. Defaults to fit_score descending. Pass null for no default sort. */
  defaultSort?: SortState | null;
  /** Whether to include the partner filter. Defaults to true. */
  showPartnerFilter?: boolean;
}

export interface UseCampaignCompaniesReturn {
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
  /** Campaign partner list (for reassignment dropdowns). */
  partners: PartnerAssignmentSummary[];
  /** Re-fetch the companies list. */
  refetch: () => void;
  /** Optimistically update partner fields on a company. */
  updateCompanyPartner: (membershipId: number, partnerId: number, partnerName: string) => void;
}

/** Fetches and manages campaign companies with search, sort, and filter. */
export function useCampaignCompanies({ slug, enabled = true, partners: externalPartners, defaultSort = { field: 'fit_score', direction: 'desc' }, showPartnerFilter = true }: UseCampaignCompaniesOptions): UseCampaignCompaniesReturn {
  const [rawCompanies, setRawCompanies] = useState<MembershipRead[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPageRaw] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFiltersRaw] = useState<ActiveFilter[]>([]);
  const [activeSort, setActiveSortRaw] = useState<SortState | null>(defaultSort);

  const partners = useMemo(() => externalPartners ?? [], [externalPartners]);
  const [fetchVersion, setFetchVersion] = useState(0);
  const refetch = useCallback(() => setFetchVersion((v) => v + 1), []);

  /** Optimistically update partner fields on a company without refetching. */
  const updateCompanyPartner = useCallback((membershipId: number, partnerId: number, partnerName: string) => {
    setRawCompanies((prev) => prev.map((m) =>
      m.id === membershipId
        ? { ...m, assigned_partner_id: partnerId, assigned_partner_name: partnerName }
        : m
    ));
  }, []);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, [searchQuery]);

  // Reset page on filter/sort change
  const setActiveFilters = useCallback((filters: ActiveFilter[]) => {
    setActiveFiltersRaw(filters);
    setPageRaw(1);
  }, []);

  const setActiveSort = useCallback((sort: SortState | null) => {
    setActiveSortRaw(sort);
    setPageRaw(1);
  }, []);

  const setPage = useCallback((p: number) => setPageRaw(p), []);


  // Fetch companies
  useEffect(() => {
    if (!enabled || !slug) return;

    let cancelled = false;
    const fetchCompanies = async () => {
      setLoading(true);
      setError(null);
      try {
        const statusFilter = activeFilters.find((f) => f.key === 'status');
        const partnerFilter = activeFilters.find((f) => f.key === 'partner');

        const data = await getCampaignCompanies(slug, {
          page,
          page_size: PAGE_SIZE,
          sort_by: (activeSort?.field as 'fit_score' | 'created_at' | 'name') ?? undefined,
          sort_order: activeSort?.direction,
          // Sent for forward compatibility — backend ignores for now
          status: statusFilter?.value,
          partner_id: partnerFilter?.value === 'unassigned' ? undefined : partnerFilter?.value,
        });

        if (cancelled) return;

        // Client-side fallback filtering until backend supports status/partner_id
        let items = data.items;
        if (statusFilter) {
          items = items.filter((m) => deriveCompanyStatus({ assignedAt: m.assigned_at }) === statusFilter.value);
        }
        if (partnerFilter) {
          items = partnerFilter.value === 'unassigned'
            ? items.filter((m) => !m.assigned_partner_id)
            : items.filter((m) => String(m.assigned_partner_id) === partnerFilter.value);
        }

        setRawCompanies(items);
        setTotalCount(data.total);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load companies');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchCompanies();
    return () => { cancelled = true; };
  }, [slug, enabled, page, activeSort, activeFilters, fetchVersion]);

  // Client-side search + mapping (enrich with partner logos from loaded partners)
  const companies = useMemo(() => {
    const logoByPartnerId = new Map(
      partners.map((p) => [String(p.partner_id), p.partner_logo_url]),
    );
    const mapped = rawCompanies.map((m) => {
      const row = toRowData(m);
      if (row.partner_id) {
        row.partner_logo_url = logoByPartnerId.get(String(row.partner_id)) ?? undefined;
      }
      return row;
    });
    if (!debouncedSearch) return mapped;
    const q = debouncedSearch.toLowerCase();
    return mapped.filter(
      (c) => c.name.toLowerCase().includes(q) || c.domain.toLowerCase().includes(q),
    );
  }, [rawCompanies, debouncedSearch, partners]);

  const filterDefinitions = useMemo<FilterDefinition[]>(
    () => showPartnerFilter ? [STATUS_FILTER, buildPartnerFilter(partners)] : [STATUS_FILTER],
    [partners, showPartnerFilter],
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
    partners,
    refetch,
    updateCompanyPartner,
  };
}
