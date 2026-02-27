'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { useAccountDetail } from '@/hooks/useAccountDetail';
import { getFitBreakdown } from '@/lib/api/fit-scores';
import { assignCompanyToPartner, unassignCompanyFromPartner } from '@/lib/api/partners';
import type { CompanyRead, CompanyExplainabilityResponse, FitScore } from '@/lib/schemas';

interface UseCampaignCompanyDetailOptions {
  domain: string;
  companyId: number;
  /** Current partner_id from the membership (string from backend). */
  partnerId: string | null;
  slug: string;
  /** Campaign's target product, used for fit breakdown. */
  targetProductId: number | null;
  isOpen: boolean;
  /** Called after a successful partner reassignment. */
  onReassigned?: () => void;
}

export interface UseCampaignCompanyDetailReturn {
  company: CompanyRead | null;
  explainability: CompanyExplainabilityResponse | null;
  fitBreakdown: FitScore | null;
  loading: boolean;
  fitLoading: boolean;
  reassigning: boolean;
  reassignToPartner: (newPartnerId: number) => Promise<void>;
}

/** Fetches company details, explainability, and fit breakdown for a campaign company sidebar. */
export function useCampaignCompanyDetail({
  domain,
  companyId,
  partnerId,
  slug,
  targetProductId,
  isOpen,
  onReassigned,
}: UseCampaignCompanyDetailOptions): UseCampaignCompanyDetailReturn {
  const account = useAccountDetail(domain, isOpen);

  const [fitBreakdown, setFitBreakdown] = useState<FitScore | null>(null);
  const [fitLoading, setFitLoading] = useState(false);
  const [reassigning, setReassigning] = useState(false);

  // Determine product ID: campaign target or first available product
  const productId = targetProductId ?? account.allProducts[0]?.id ?? null;

  // Fetch fit breakdown once we have a product ID and the account has loaded
  useEffect(() => {
    if (!isOpen || !domain || !productId || account.loading) return;

    let cancelled = false;
    setFitLoading(true);

    getFitBreakdown(domain, productId)
      .then((result) => {
        if (!cancelled) setFitBreakdown(result);
      })
      .catch(() => {
        if (!cancelled) setFitBreakdown(null);
      })
      .finally(() => {
        if (!cancelled) setFitLoading(false);
      });

    return () => { cancelled = true; };
  }, [isOpen, domain, productId, account.loading]);

  // Reset fit breakdown when domain changes
  useEffect(() => {
    setFitBreakdown(null);
  }, [domain]);

  const reassignToPartner = useCallback(async (newPartnerId: number) => {
    setReassigning(true);
    try {
      // Unassign from current partner if one exists
      if (partnerId) {
        await unassignCompanyFromPartner(slug, Number(partnerId), companyId);
      }
      // Assign to the new partner
      await assignCompanyToPartner(slug, newPartnerId, { company_id: companyId });
      toast.success('Company reassigned successfully');
      onReassigned?.();
    } catch (err) {
      toast.error('Failed to reassign company', {
        description: err instanceof Error ? err.message : 'Please try again',
      });
    } finally {
      setReassigning(false);
    }
  }, [slug, companyId, partnerId, onReassigned]);

  return {
    company: account.data?.company ?? null,
    explainability: account.explainability,
    fitBreakdown,
    loading: account.loading,
    fitLoading,
    reassigning,
    reassignToPartner,
  };
}
