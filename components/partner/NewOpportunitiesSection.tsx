'use client';

import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { CompanyRowCompact } from '@/components/campaigns/CompanyRowCompact';
import type { CampaignSummary, MembershipRead } from '@/lib/schemas';
import { isNewOpportunity } from '@/lib/utils';

interface NewOpportunitiesSectionProps {
    campaigns: CampaignSummary[];
    companiesMap: Map<number, MembershipRead[]>;
}

export function NewOpportunitiesSection({
    campaigns,
    companiesMap,
}: NewOpportunitiesSectionProps) {
    const router = useRouter();

    // Filter campaigns to only those with at least one new company
    const campaignsWithNewCompanies = campaigns
        .map(campaign => {
            const companies = companiesMap.get(campaign.id) || [];
            const newCompanies = companies.filter(c => isNewOpportunity(c.created_at));
            return { campaign, newCompanies };
        })
        .filter(({ newCompanies }) => newCompanies.length > 0);

    if (campaignsWithNewCompanies.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            {/* Section Header */}
            <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    New Opportunities
                </h2>
            </div>

            {/* Campaign Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {campaignsWithNewCompanies.map(({ campaign, newCompanies }) => (
                    <button
                        key={campaign.id}
                        onClick={() => router.push(`/partner/campaigns/${campaign.slug}`)}
                        className="bg-gradient-to-br from-amber-50/80 via-yellow-50/60 to-orange-50/40 dark:from-amber-950/20 dark:via-yellow-950/10 dark:to-slate-900 border-2 border-amber-200/60 dark:border-amber-800/30 rounded-xl p-4 shadow-lg shadow-amber-100/50 dark:shadow-black/30 hover:shadow-xl hover:border-amber-300 dark:hover:border-amber-700/50 hover:scale-[1.01] transition-all text-left"
                    >
                        {/* Campaign Header */}
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                                {campaign.name}
                            </h3>
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 shrink-0 ml-2">
                                {newCompanies.length} new
                            </span>
                        </div>

                        {/* Company Rows */}
                        <div className="space-y-1 -mx-4 px-0">
                            {newCompanies.slice(0, 3).map(company => (
                                <CompanyRowCompact
                                    key={company.id}
                                    name={company.company_name || company.domain}
                                    domain={company.domain}
                                    logoBase64={company.logo_base64}
                                    isNew={true}
                                />
                            ))}
                            {newCompanies.length > 3 && (
                                <div className="text-xs text-slate-500 dark:text-slate-400 text-center py-2">
                                    +{newCompanies.length - 3} more
                                </div>
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
