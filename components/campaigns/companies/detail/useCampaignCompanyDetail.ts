'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { getCompany, getCompanyExplainability } from '@/lib/api/companies';
import { getFitBreakdown } from '@/lib/api/fit-scores';
import { getCompanyPlaybooks, getCompanyPlaybook } from '@/lib/api/playbooks';
import { assignCompanyToPartner, unassignCompanyFromPartner } from '@/lib/api/partners';
import type { CompanyRead, CompanyExplainabilityResponse, FitScore, PlaybookRead } from '@/lib/schemas';

/** Cached detail data for a single company, keyed by domain. */
export interface CachedCompanyDetail {
  company: CompanyRead | null;
  explainability: CompanyExplainabilityResponse | null;
  fitBreakdown: FitScore | null;
  playbook: PlaybookRead | null;
}

interface UseCampaignCompanyDetailOptions {
  domain: string;
  companyId: number;
  /** Current partner_id from the membership. */
  partnerId: number | null;
  slug: string;
  /** Campaign's target product, used for fit breakdown. */
  targetProductId: number | null;
  /** Called after a successful partner reassignment with the new partner ID. */
  onReassigned?: (newPartnerId: number) => void;
  /** Optional cache shared across selections to avoid re-fetching previously viewed companies. */
  cache?: React.RefObject<Map<string, CachedCompanyDetail>>;
}

export interface UseCampaignCompanyDetailReturn {
  company: CompanyRead | null;
  explainability: CompanyExplainabilityResponse | null;
  fitBreakdown: FitScore | null;
  playbook: PlaybookRead | null;
  loading: boolean;
  fitLoading: boolean;
  playbookLoading: boolean;
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
  cache,
}: UseCampaignCompanyDetailOptions): UseCampaignCompanyDetailReturn {
  const cached = cache?.current.get(domain);

  const [company, setCompany] = useState<CompanyRead | null>(cached?.company ?? null);
  const [explainability, setExplainability] = useState<CompanyExplainabilityResponse | null>(cached?.explainability ?? null);
  const [loading, setLoading] = useState(!cached);

  const [fitBreakdown, setFitBreakdown] = useState<FitScore | null>(cached?.fitBreakdown ?? null);
  const [fitLoading, setFitLoading] = useState(false);
  const [playbook, setPlaybook] = useState<PlaybookRead | null>(cached?.playbook ?? null);
  const [playbookLoading, setPlaybookLoading] = useState(false);
  const [reassigning, setReassigning] = useState(false);

  // Fetch company data and explainability only (lightweight: 2 API calls)
  useEffect(() => {
    if (!domain) return;
    if (cache?.current.has(domain)) return;

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

        // Write to cache
        const entry = cache?.current.get(domain) ?? { company: null, explainability: null, fitBreakdown: null, playbook: null };
        entry.company = companyRes.company;
        entry.explainability = explainabilityRes;
        cache?.current.set(domain, entry);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Failed to load campaign company detail', err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [domain, cache]);

  // Fetch fit breakdown independently when we have a target product
  useEffect(() => {
    if (!domain || !targetProductId) {
      setFitBreakdown(null);
      setFitLoading(false);
      return;
    }
    if (cache?.current.get(domain)?.fitBreakdown) return;

    let cancelled = false;
    setFitLoading(true);
    setFitBreakdown(null);

    getFitBreakdown(domain, targetProductId)
      .then((result) => {
        if (!cancelled) {
          setFitBreakdown(result);

          const entry = cache?.current.get(domain) ?? { company: null, explainability: null, fitBreakdown: null, playbook: null };
          entry.fitBreakdown = result;
          cache?.current.set(domain, entry);
        }
      })
      .catch(() => {
        if (!cancelled) setFitBreakdown(null);
      })
      .finally(() => {
        if (!cancelled) setFitLoading(false);
      });

    return () => { cancelled = true; };
  }, [domain, targetProductId, cache]);

  // Fetch playbook contacts for the target product
  useEffect(() => {
    if (!domain || !targetProductId) {
      setPlaybook(null);
      setPlaybookLoading(false);
      return;
    }
    if (cache?.current.get(domain)?.playbook) return;

    let cancelled = false;
    setPlaybookLoading(true);
    setPlaybook(null);

    async function fetchPlaybook() {
      try {
        const { playbooks } = await getCompanyPlaybooks(domain);
        const target = playbooks.find((p) => p.product_id === targetProductId);
        if (cancelled || !target) {
          if (!cancelled) setPlaybookLoading(false);
          return;
        }
        const detail = await getCompanyPlaybook(domain, target.id);
        if (!cancelled) {
          setPlaybook(detail);

          const entry = cache?.current.get(domain) ?? { company: null, explainability: null, fitBreakdown: null, playbook: null };
          entry.playbook = detail;
          cache?.current.set(domain, entry);
        }
      } catch {
        // Silently fail — contacts card simply won't render
      } finally {
        if (!cancelled) setPlaybookLoading(false);
      }
    }

    fetchPlaybook();
    return () => { cancelled = true; };
  }, [domain, targetProductId, cache]);

  const reassignToPartner = useCallback(async (newPartnerId: number) => {
    setReassigning(true);
    try {
      if (partnerId) {
        await unassignCompanyFromPartner(slug, partnerId, companyId);
      }
      await assignCompanyToPartner(slug, newPartnerId, { company_id: companyId });
      toast.success('Company reassigned successfully');
      onReassigned?.(newPartnerId);
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
    playbook,
    loading,
    fitLoading,
    playbookLoading,
    reassigning,
    reassignToPartner,
  };
}
