'use client';

import { useState, useEffect, useCallback } from 'react';
import { getPartnerCompanies } from '@/lib/api';
import type { PartnerCompanyItem, CompanyRowData } from '@/lib/schemas';

const PAGE_SIZE = 100;
const NEW_THRESHOLD_DAYS = 7;

/** A new opportunity item from the cross-campaign partners/companies endpoint. */
export interface NewOpportunityItem {
  item: PartnerCompanyItem;
  campaignSlug: string;
  campaignName: string;
}

/** Convert a PartnerCompanyItem to CompanyRowData with status 'new'. */
export function mapAssignmentToCompanyRow(opportunity: NewOpportunityItem): CompanyRowData {
  const { item } = opportunity;
  return {
    id: item.company.id,
    name: item.company.name,
    domain: item.company.domain,
    logo_url: item.company.logo_url,
    logo_base64: item.company.logo_base64,
    status: 'new',
    hq_country: item.company.hq_country,
    employee_count: item.company.employee_count,
    assigned_at: item.assigned_at,
  };
}

/** Fetches new opportunity assignments across all campaigns via a single endpoint. */
export function useNewOpportunities(partnerId: number | undefined): {
  newOpportunities: NewOpportunityItem[];
  newOpportunitiesLoading: boolean;
  totalCount: number;
  hasMore: boolean;
  loadMore: () => void;
  loadingMore: boolean;
} {
  const [items, setItems] = useState<NewOpportunityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [nextPage, setNextPage] = useState(2);

  useEffect(() => {
    if (!partnerId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting state on empty input
      setItems([]);
      setLoading(false);
      setTotalCount(0);
      setHasMore(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const cutoff = new Date(Date.now() - NEW_THRESHOLD_DAYS * 24 * 60 * 60 * 1000);
    const assignedSince = cutoff.toISOString();

    getPartnerCompanies({ assigned_since: assignedSince, page: 1, page_size: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return;
        setItems(res.items.map(mapItemToOpportunity));
        setTotalCount(res.total);
        setHasMore(res.has_next);
        setNextPage(2);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Failed to fetch new opportunities:', err);
        setItems([]);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [partnerId]);

  const loadMore = useCallback(() => {
    if (!partnerId || loadingMore || !hasMore) return;

    setLoadingMore(true);
    const cutoff = new Date(Date.now() - NEW_THRESHOLD_DAYS * 24 * 60 * 60 * 1000);
    const assignedSince = cutoff.toISOString();

    getPartnerCompanies({ assigned_since: assignedSince, page: nextPage, page_size: PAGE_SIZE })
      .then((res) => {
        setItems((prev) => [...prev, ...res.items.map(mapItemToOpportunity)]);
        setHasMore(res.has_next);
        setNextPage((p) => p + 1);
        setLoadingMore(false);
      })
      .catch((err) => {
        console.error('Failed to load more opportunities:', err);
        setLoadingMore(false);
      });
  }, [partnerId, loadingMore, hasMore, nextPage]);

  return {
    newOpportunities: items,
    newOpportunitiesLoading: loading,
    totalCount,
    hasMore,
    loadMore,
    loadingMore,
  };
}

/** Map a raw API item to a NewOpportunityItem. */
function mapItemToOpportunity(item: PartnerCompanyItem): NewOpportunityItem {
  return {
    item,
    campaignSlug: item.campaign_slug,
    campaignName: item.campaign_name,
  };
}
