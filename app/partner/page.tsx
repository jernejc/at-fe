'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from "next-auth/react";
import { Loader2 } from 'lucide-react';
import { PartnerPortalHeader } from '@/components/partner/PartnerPortalHeader';
import { NewOpportunitiesSection } from '@/components/partner/NewOpportunitiesSection';
import { DashboardCRMAnalytics } from '@/components/partner/analytics';
import { getCampaigns, getPartnerAssignedCompanies } from '@/lib/api';
import type { CampaignSummary, PartnerCompanyAssignmentWithCompany } from '@/lib/schemas';
import { useRouter } from 'next/navigation';


export default function PartnerPage() {
    const router = useRouter();
    const { data: session, status: sessionStatus } = useSession();

    const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
    const [companiesMap, setCompaniesMap] = useState<Map<number, PartnerCompanyAssignmentWithCompany[]>>(new Map());
    const [loading, setLoading] = useState(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const partnerId = (session?.user as any)?.partner_id as number | undefined;

    useEffect(() => {
        async function fetchData() {
            if (sessionStatus === 'loading') return;
            if (!partnerId) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);

                const campaignsRes = await getCampaigns();
                setCampaigns(campaignsRes.items);

                const cMap = new Map<number, PartnerCompanyAssignmentWithCompany[]>();
                for (const campaign of campaignsRes.items) {
                    try {
                        const companies = await getPartnerAssignedCompanies(campaign.slug, partnerId);
                        cMap.set(campaign.id, companies);
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
    }, [sessionStatus, partnerId]);

    const allOpportunities = useMemo(() => {
        const all: PartnerCompanyAssignmentWithCompany[] = [];
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
              onCRMConnect={() => {
                router.push('/partner/integrations')
              }}
            />
          </div>
        </div>

        {/* New Opportunities Section */}
        <div className="px-6 py-6 max-w-[1600px] mx-auto w-full">
          <NewOpportunitiesSection campaigns={campaigns} companiesMap={companiesMap} />
        </div>

        {/* CRM Analytics Section */}
        <div className="px-6 py-6 max-w-[1600px] mx-auto w-full">
          <DashboardCRMAnalytics />
        </div>
      </div>
    );
}
