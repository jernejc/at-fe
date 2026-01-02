'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { CampaignSummary } from '@/lib/schemas';
import { Building2, Flame, Thermometer, Snowflake } from 'lucide-react';

interface CampaignCardPreviewProps {
    campaign: CampaignSummary;
    onAssignProduct?: () => void;
}

export function CampaignCardPreview({ campaign, onAssignProduct }: CampaignCardPreviewProps) {
    const router = useRouter();
    const avgFitScore = campaign.avg_fit_score ? Math.round(campaign.avg_fit_score * 100) : null;

    // Estimate hot/warm/cold distribution based on avg fit score
    // In reality, this would come from the campaign overview API
    const estimateDistribution = () => {
        if (!avgFitScore || campaign.company_count === 0) return null;

        // Simple estimation - in production, fetch from API
        const total = campaign.company_count;
        if (avgFitScore >= 70) {
            return { hot: Math.round(total * 0.4), warm: Math.round(total * 0.4), cold: Math.round(total * 0.2) };
        } else if (avgFitScore >= 50) {
            return { hot: Math.round(total * 0.2), warm: Math.round(total * 0.5), cold: Math.round(total * 0.3) };
        } else {
            return { hot: Math.round(total * 0.1), warm: Math.round(total * 0.3), cold: Math.round(total * 0.6) };
        }
    };

    const distribution = estimateDistribution();

    const handleClick = () => {
        if (onAssignProduct) {
            onAssignProduct();
        } else {
            router.push(`/campaigns/${campaign.slug}`);
        }
    };

    return (
        <div
            onClick={handleClick}
            className={cn(
                "group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800",
                "p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700",
                "transition-colors min-w-[200px] max-w-[280px]"
            )}
        >
            {/* Campaign Name */}
            <h4 className="font-semibold text-sm text-slate-900 dark:text-white truncate mb-2 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                {campaign.name}
            </h4>

            {/* Company Count */}
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 mb-3">
                <Building2 className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">{campaign.company_count} companies</span>
            </div>

            {/* Fit Distribution */}
            {distribution && (
                <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                        <Flame className="w-3 h-3" />
                        <span className="font-medium">{distribution.hot}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                        <Thermometer className="w-3 h-3" />
                        <span className="font-medium">{distribution.warm}</span>
                    </div>
                    <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                        <Snowflake className="w-3 h-3" />
                        <span className="font-medium">{distribution.cold}</span>
                    </div>
                </div>
            )}

            {/* Status & Date */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className={cn(
                    "text-xs px-2 py-0.5 rounded-lg font-medium",
                    campaign.status === 'active' && "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                    campaign.status === 'draft' && "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
                    campaign.status === 'archived' && "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500"
                )}>
                    {campaign.status}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                    {new Date(campaign.updated_at).toLocaleDateString()}
                </span>
            </div>
        </div>
    );
}
