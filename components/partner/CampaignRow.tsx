'use client';

import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import type { CampaignSummary, MembershipRead } from '@/lib/schemas';

interface CampaignRowProps {
    campaign: CampaignSummary;
    productName: string | null;
    companies: MembershipRead[];
    pipelineValue: number;
    newOpportunities?: MembershipRead[];
}

function formatCurrency(value: number): string {
    if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
}

function getStatusColor(status: string) {
    switch (status.toLowerCase()) {
        case 'active':
            return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
        case 'draft':
            return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
        case 'completed':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
        case 'paused':
            return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
        default:
            return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
    }
}

export function CampaignRow({ campaign, productName, companies, pipelineValue, newOpportunities = [] }: CampaignRowProps) {
    const router = useRouter();

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <div
                onClick={() => router.push(`/partner/campaigns/${campaign.slug}`)}
                className="grid grid-cols-12 items-center gap-4 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                {/* Campaign Name */}
                <div className="col-span-4 min-w-0 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                        <img
                            src={`https://www.google.com/s2/favicons?domain=${campaign.owner || 'cloud.google.com'}&sz=64`}
                            className="w-5 h-5 object-contain"
                        />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            {campaign.name}
                        </p>
                        {productName && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {productName}
                            </p>
                        )}
                    </div>
                </div>

                {/* Pipeline Value */}
                <div className="col-span-2">
                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(pipelineValue)}
                    </p>
                </div>

                {/* # Companies */}
                <div className="col-span-2 flex items-center gap-3">
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                        {campaign.company_count}
                    </p>

                    {newOpportunities.length ? (
                        <Badge className="bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-600">
                            {newOpportunities.length} new
                        </Badge>
                    ) : null}
                </div>

                {/* Deadline */}
                <div className="col-span-2">
                    <p className="text-sm text-slate-400 dark:text-slate-500">—</p>
                </div>

                {/* Status */}
                <div className="col-span-2">
                    <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status}
                    </Badge>
                </div>
            </div>
        </div>
    );
}
