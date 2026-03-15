'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useCampaignDetail } from '@/components/providers/CampaignDetailProvider';
import { useCampaignCompanyDetail } from '@/components/providers/CampaignCompanyDetailProvider';
import {
  getCompanyPlaybooks,
  getCompanyPlaybook,
  generateCompanyPlaybook,
  waitForProcessingComplete,
} from '@/lib/api';
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

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const isGeneratingRef = useRef(false);

  const productId = campaign?.target_product_id ?? null;

  // Trigger lazy fetch on first visit to playbook tab
  useEffect(() => {
    const cleanup = ensurePlaybook();
    return cleanup;
  }, [ensurePlaybook]);

  const generatePlaybookFn = useCallback(async () => {
    if (!productId || isGeneratingRef.current) return;

    isGeneratingRef.current = true;
    setIsGenerating(true);
    setGenerationError(null);

    try {
      const response = await generateCompanyPlaybook(domain, productId);

      if (response?.process_id) {
        await waitForProcessingComplete(domain, response.process_id);
      }

      const { playbooks } = await getCompanyPlaybooks(domain);
      const target = playbooks.find((p) => p.product_id === productId);

      if (target) {
        setPlaybookProductName(target.product_name ?? null);
        const detail = await getCompanyPlaybook(domain, target.id);
        setPlaybook(detail);
      } else {
        setGenerationError(
          'Playbook generation completed but playbook was not found. Please refresh.',
        );
      }
    } catch (err) {
      console.error('Failed to generate playbook:', err);
      setGenerationError('Failed to generate playbook. Please try again.');
    } finally {
      isGeneratingRef.current = false;
      setIsGenerating(false);
    }
  }, [domain, productId, setPlaybook, setPlaybookProductName]);

  return {
    playbook,
    loading: playbookLoading || campaignLoading,
    isGenerating,
    generationError,
    productName: playbookProductName ?? overview?.product_name ?? null,
    generatePlaybook: generatePlaybookFn,
  };
}
