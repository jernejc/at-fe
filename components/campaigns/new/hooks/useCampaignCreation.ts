'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createCampaign, updateCampaign, addCompaniesBulk } from '@/lib/api/campaigns';
import { bulkAssignPartners, assignAllCompaniesToPartners } from '@/lib/api/partners';
import type { WSCompanyResult, WSPartnerSuggestion, PartnerSummary } from '@/lib/schemas';
import { CAMPAIGN_ICON_NAMES, type CampaignIconName } from '@/lib/config/campaign-icons';

interface CreateParams {
  productId: number;
  companies: WSCompanyResult[];
  selectedPartnerSlugs: Set<string>;
  partnerSuggestions: WSPartnerSuggestion[];
  allPartners: PartnerSummary[];
}

interface UseCampaignCreationReturn {
  campaignName: string;
  setCampaignName: (name: string) => void;
  campaignIcon: CampaignIconName;
  setCampaignIcon: (icon: CampaignIconName) => void;
  isCreating: boolean;
  createError: string | null;
  create: (params: CreateParams) => Promise<void>;
}

/** Manages campaign name, icon, and the multi-step creation API orchestration. */
export function useCampaignCreation(): UseCampaignCreationReturn {
  const router = useRouter();
  const [campaignName, setCampaignName] = useState('');
  const [campaignIcon, setCampaignIcon] = useState(
    () => CAMPAIGN_ICON_NAMES[Math.floor(Math.random() * CAMPAIGN_ICON_NAMES.length)],
  );
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const create = useCallback(
    async ({ productId, companies, selectedPartnerSlugs, partnerSuggestions, allPartners }: CreateParams) => {
      if (!campaignName.trim()) return;

      setIsCreating(true);
      setCreateError(null);

      let campaign;
      try {
        campaign = await createCampaign({
          name: campaignName.trim(),
          target_product_id: productId,
        });
      } catch (error) {
        console.error('Failed to create campaign:', error);
        setCreateError(
          error instanceof Error ? error.message : 'Failed to create campaign. Please try again.',
        );
        setIsCreating(false);
        return;
      }

      // Campaign exists from this point — always navigate to it, even if later steps fail
      const warnings: string[] = [];

      try {
        if (campaignIcon) {
          await updateCampaign(campaign.slug, { icon: campaignIcon });
        }
      } catch (error) {
        console.error('Failed to set campaign icon:', error);
        warnings.push('set the campaign icon');
      }

      const domains = companies.map((c) => c.domain);
      if (domains.length > 0) {
        try {
          await addCompaniesBulk(campaign.slug, domains);
        } catch (error) {
          console.error('Failed to add companies:', error);
          warnings.push('add companies');
        }
      }

      const partnerIds: number[] = [];
      selectedPartnerSlugs.forEach((slug) => {
        const suggested = partnerSuggestions.find((p) => p.slug === slug);
        if (suggested) {
          partnerIds.push(suggested.partner_id);
          return;
        }
        const fromAll = allPartners.find((p) => p.slug === slug);
        if (fromAll) partnerIds.push(fromAll.id);
      });

      if (partnerIds.length > 0) {
        try {
          await bulkAssignPartners(campaign.slug, partnerIds);
          await assignAllCompaniesToPartners(campaign.slug);
        } catch (error) {
          console.error('Failed to assign partners:', error);
          warnings.push('assign partners');
        }
      }

      if (warnings.length > 0) {
        toast.warning(
          `Campaign created, but failed to ${warnings.join(' and ')}. You can fix this from the campaign page.`,
        );
      }

      setIsCreating(false);
      router.push(`/campaigns/${campaign.slug}`);
    },
    [campaignName, campaignIcon, router],
  );

  return {
    campaignName,
    setCampaignName,
    campaignIcon,
    setCampaignIcon,
    isCreating,
    createError,
    create,
  };
}
