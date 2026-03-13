'use client';

import { useMemo } from 'react';
import { useCampaignDetail } from '@/components/providers/CampaignDetailProvider';
import { useCampaignCompanyDetail } from '@/components/providers/CampaignCompanyDetailProvider';
import { normalizeScoreNullable, deriveCompanyStatus, isNewOpportunity } from '@/lib/utils';
import type { CompanyRead } from '@/lib/schemas';
import type { CompanyStatusValue } from '@/components/ui/company-status';

interface UsePartnerCompanyOverviewReturn {
  company: CompanyRead | null;
  fitScore: number | null;
  status: CompanyStatusValue;
  isNew: boolean;
  loading: boolean;
  error: string | null;
  /** Campaign display name. */
  campaignName: string | null;
  /** Campaign icon name from registry. */
  campaignIcon: string | null;
  /** Product name associated with the campaign. */
  productName: string | null;
}

/** Reads company details + campaign membership from the shared CampaignCompanyDetailProvider. */
export function usePartnerCompanyOverview(): UsePartnerCompanyOverviewReturn {
  const { campaign, overview } = useCampaignDetail();
  const { company, membership, loading, error } = useCampaignCompanyDetail();

  const fitScore = useMemo(() => {
    if (membership?.cached_fit_score == null) return null;
    return Math.round(normalizeScoreNullable(membership.cached_fit_score));
  }, [membership]);

  const status: CompanyStatusValue = useMemo(
    () => membership ? deriveCompanyStatus({ assignedAt: membership.assigned_at }) : 'default',
    [membership],
  );

  const isNew = useMemo(
    () => membership ? isNewOpportunity({ assigned_at: membership.assigned_at }) : false,
    [membership],
  );

  return {
    company,
    fitScore,
    status,
    isNew,
    loading,
    error,
    campaignName: campaign?.name ?? null,
    campaignIcon: campaign?.icon ?? null,
    productName: overview?.product_name ?? null,
  };
}
