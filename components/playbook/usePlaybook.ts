'use client';

import { useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useCampaignDetail } from '@/components/providers/CampaignDetailProvider';
import { useCampaignCompanyDetail } from '@/components/providers/CampaignCompanyDetailProvider';
import { getCompanyPlaybooks, getCompanyPlaybook } from '@/lib/api';
import { usePlaybookGeneration } from '@/hooks/usePlaybookGeneration';
import type { PlaybookRead } from '@/lib/schemas';

interface UsePlaybookReturn {
  /** Full playbook detail for the campaign's target product, or null. */
  playbook: PlaybookRead | null;
  /** Whether the initial data is loading. */
  loading: boolean;
  /** Whether a playbook generation is in progress. */
  isGenerating: boolean;
  /** Error message from the last generation attempt. */
  generationError: string | null;
  /** Product name from the campaign (for display). */
  productName: string | null;
  /** Trigger playbook generation for the target product. */
  generatePlaybook: () => Promise<void>;
}

/** Loads and manages the playbook for the current company and campaign target product. */
export function usePlaybook(): UsePlaybookReturn {
  const { domain: rawDomain } = useParams<{ domain: string }>();
  const domain = decodeURIComponent(rawDomain);
  const { campaign, overview, loading: campaignLoading } = useCampaignDetail();
  const {
    playbook,
    playbookLoading,
    playbookProductName,
    ensurePlaybook,
    setPlaybook,
    setPlaybookProductName,
  } = useCampaignCompanyDetail();

  const productId = campaign?.target_product_id ?? null;

  // Trigger lazy fetch on first visit to playbook tab
  useEffect(() => {
    const cleanup = ensurePlaybook();
    return cleanup;
  }, [ensurePlaybook]);

  const handleGenerationComplete = useCallback(async () => {
    if (!productId) return;

    const { playbooks } = await getCompanyPlaybooks(domain);
    const target = playbooks.find((p) => p.product_id === productId);

    if (target) {
      setPlaybookProductName(target.product_name ?? null);
      const detail = await getCompanyPlaybook(domain, target.id);
      setPlaybook(detail);
    }
  }, [domain, productId, setPlaybook, setPlaybookProductName]);

  const { isGenerating, generationError, startGeneration } = usePlaybookGeneration({
    domain,
    productId,
    onComplete: handleGenerationComplete,
  });

  return {
    playbook,
    loading: playbookLoading || campaignLoading,
    isGenerating,
    generationError,
    productName: playbookProductName ?? overview?.product_name ?? null,
    generatePlaybook: startGeneration,
  };
}
