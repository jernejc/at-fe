'use client';

import { useCampaignDetail } from '@/components/providers/CampaignDetailProvider';
import type { CampaignRead } from '@/lib/schemas';

interface UseCampaignDetailHeaderReturn {
    campaignName: string | null;
    campaignIcon: string | null;
    campaignStatus: string | null;
    productName: string | null;
    loading: boolean;
    error: string | null;
}

/** Derives header fields from the shared CampaignDetailContext. */
export function useCampaignDetailHeader(): UseCampaignDetailHeaderReturn {
    const { campaign, overview, loading, error } = useCampaignDetail();

    return {
        campaignName: campaign?.name ?? null,
        campaignIcon: (campaign as CampaignRead & { icon?: string | null })?.icon ?? null,
        campaignStatus: campaign?.status ?? null,
        productName: overview?.product_name ?? null,
        loading,
        error,
    };
}
