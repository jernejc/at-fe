'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import { PartnerPortalHeader } from '@/components/partner/PartnerPortalHeader';
import { getCampaigns, getCampaignCompanies } from '@/lib/api';
import type { CampaignSummary, MembershipRead } from '@/lib/schemas';

export default function PartnerPage() {
    const { status: sessionStatus } = useSession();

    const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
    const [companiesMap, setCompaniesMap] = useState<Map<number, MembershipRead[]>>(new Map());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            if (sessionStatus === 'loading') return;
            try {
                setLoading(true);

                const campaignsRes = await getCampaigns();
                setCampaigns(campaignsRes.items);

                const cMap = new Map<number, MembershipRead[]>();
                for (const campaign of campaignsRes.items) {
                    try {
                        const res = await getCampaignCompanies(campaign.slug, { page_size: 100 });
                        cMap.set(campaign.id, res.items);
                    } catch (e) {
                        console.error(`Failed to fetch companies for ${campaign.slug}:`, e);
                        cMap.set(campaign.id, []);
                    }
                }
                setCompaniesMap(cMap);
            } catch (err) {
                console.error('Failed to fetch data:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [sessionStatus]);

    const allOpportunities = useMemo(() => {
        const all: MembershipRead[] = [];
        companiesMap.forEach(companies => all.push(...companies));
        return all;
    }, [companiesMap]);

    if (loading) {
        return (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        );
    }

    return (
      <div className='flex-1'>
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-700">
          <div className="px-6 py-6 max-w-[1600px] mx-auto w-full">
            <PartnerPortalHeader
              partner={null}
              opportunities={allOpportunities}
              campaigns={campaigns}
              newOpportunitiesCount={0}
              hidePartnerInfo={true}
            />
          </div>
        </div>
      </div>
    );
}
