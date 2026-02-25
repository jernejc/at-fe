'use client';

import { useEffect, useState } from 'react';
import { getCampaign, getCampaignOverview } from '@/lib/api';

interface UseCampaignDetailHeaderReturn {
    campaignName: string | null;
    campaignIcon: string | null;
    campaignStatus: string | null;
    productName: string | null;
    loading: boolean;
    error: string | null;
}

/** Lightweight hook that fetches only the data needed for the campaign detail header. */
export function useCampaignDetailHeader(slug: string): UseCampaignDetailHeaderReturn {
    const [campaignName, setCampaignName] = useState<string | null>(null);
    const [campaignIcon, setCampaignIcon] = useState<string | null>(null);
    const [campaignStatus, setCampaignStatus] = useState<string | null>(null);
    const [productName, setProductName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function fetchHeaderData() {
            try {
                const [campaign, overview] = await Promise.all([
                    getCampaign(slug),
                    getCampaignOverview(slug),
                ]);

                if (cancelled) return;

                setCampaignName(campaign.name);
                setCampaignIcon((campaign as any).icon ?? null);
                setCampaignStatus(campaign.status);
                setProductName(overview.product_name);
            } catch (err) {
                if (cancelled) return;
                setError(err instanceof Error ? err.message : 'Failed to load campaign');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchHeaderData();
        return () => { cancelled = true; };
    }, [slug]);

    return { campaignName, campaignIcon, campaignStatus, productName, loading, error };
}
