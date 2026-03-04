'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createCampaign, updateCampaign, addCompaniesBulk } from '@/lib/api/campaigns';
import { bulkAssignPartners, bulkAssignCompaniesToPartner } from '@/lib/api/partners';
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

      try {
        // 1. Create campaign
        const campaign = await createCampaign({
          name: campaignName.trim(),
          target_product_id: productId,
        });

        // 2. Set icon
        if (campaignIcon) {
          await updateCampaign(campaign.slug, { icon: campaignIcon });
        }

        // 3. Add companies
        const domains = companies.map((c) => c.domain);
        if (domains.length > 0) {
          await addCompaniesBulk(campaign.slug, domains);
        }

        // 4. Resolve partner IDs from slugs
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

        // 5. Assign partners and round-robin distribute companies
        if (partnerIds.length > 0) {
          await bulkAssignPartners(campaign.slug, partnerIds);

          const companyIds = companies.map((c) => c.company_id).filter(Boolean);
          if (companyIds.length > 0) {
            const companiesPerPartner = new Map<number, number[]>();
            partnerIds.forEach((id) => companiesPerPartner.set(id, []));
            companyIds.forEach((cId, i) => {
              const pId = partnerIds[i % partnerIds.length];
              companiesPerPartner.get(pId)!.push(cId);
            });

            for (const [partnerId, pCompanyIds] of companiesPerPartner) {
              if (pCompanyIds.length > 0) {
                await bulkAssignCompaniesToPartner(campaign.slug, partnerId, pCompanyIds);
              }
            }
          }
        }

        // 6. Navigate to campaign detail
        router.push(`/campaigns/${campaign.slug}`);
      } catch (error) {
        console.error('Failed to create campaign:', error);
        setCreateError(
          error instanceof Error ? error.message : 'Failed to create campaign. Please try again.',
        );
      } finally {
        setIsCreating(false);
      }
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
