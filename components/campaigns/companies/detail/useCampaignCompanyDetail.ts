'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { getCompany, getCompanyExplainability } from '@/lib/api/companies';
import { getFitBreakdown } from '@/lib/api/fit-scores';
import { assignCompanyToPartner, unassignCompanyFromPartner } from '@/lib/api/partners';
import type { CompanyRead, CompanyExplainabilityResponse, FitScore } from '@/lib/schemas';

interface UseCampaignCompanyDetailOptions {
  domain: string;
  companyId: number;
  /** Current partner_id from the membership. */
  partnerId: number | null;
  slug: string;
  /** Campaign's target product, used for fit breakdown. */
  targetProductId: number | null;
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
  onReassigned,
}: UseCampaignCompanyDetailOptions): UseCampaignCompanyDetailReturn {
  const [company, setCompany] = useState<CompanyRead | null>(null);
  const [explainability, setExplainability] = useState<CompanyExplainabilityResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [fitBreakdown, setFitBreakdown] = useState<FitScore | null>(null);
  const [fitLoading, setFitLoading] = useState(false);
  const [reassigning, setReassigning] = useState(false);

  // Fetch company data and explainability only (lightweight: 2 API calls)
  useEffect(() => {
    if (!domain) return;

    let cancelled = false;
    setLoading(true);
    setCompany(null);
    setExplainability(null);

    Promise.all([
      getCompany(domain),
      getCompanyExplainability(domain),
    ])
      .then(([companyRes, explainabilityRes]) => {
        if (cancelled) return;
        setCompany(companyRes.company);
        setExplainability(explainabilityRes);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Failed to load campaign company detail', err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [domain]);

  // Fetch fit breakdown independently when we have a target product
  useEffect(() => {
    if (!domain || !targetProductId) {
      setFitBreakdown(null);
      setFitLoading(false);
      return;
    }

    let cancelled = false;
    setFitLoading(true);
    setFitBreakdown(null);

    getFitBreakdown(domain, targetProductId)
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
  }, [domain, targetProductId]);

  const reassignToPartner = useCallback(async (newPartnerId: number) => {
    setReassigning(true);
    try {
      if (partnerId) {
        await unassignCompanyFromPartner(slug, partnerId, companyId);
      }
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
    company,
    explainability,
    fitBreakdown,
    loading,
    fitLoading,
    reassigning,
    reassignToPartner,
  };
}
