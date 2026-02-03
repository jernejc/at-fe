'use client';

import { useRouter } from 'next/navigation';
import { cn, formatCompactNumber, formatRelativeDate, getProductBadgeTheme, getProductTextColor } from '@/lib/utils';
import type { CampaignSummary, PartnerCompanyAssignmentWithCompany } from '@/lib/schemas';
import type { ProductSummary } from '@/lib/schemas/product';
import { Clock, Package, DollarSign, Building2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface CampaignCardProps {
    campaign: CampaignSummary;
    product?: ProductSummary | null;
    companies: PartnerCompanyAssignmentWithCompany[];
    pipelineValue: number;
    newOpportunities?: PartnerCompanyAssignmentWithCompany[];
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

export function CampaignCard({ campaign, product, companies, pipelineValue, newOpportunities = [] }: CampaignCardProps) {
    const router = useRouter();
    const progress = campaign.company_count > 0
        ? Math.round((campaign.processed_count / campaign.company_count) * 100)
        : 0;

    const productTheme = getProductBadgeTheme(product?.id);
    const productIconColor = getProductTextColor(product?.id);

    return (
        <div
            onClick={() => router.push(`/partner/campaigns/${campaign.slug}`)}
            className={cn(
                "group relative bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800",
                "p-5 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700",
                "hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/20",
                "transition-all duration-300 overflow-hidden flex flex-col h-full"
            )}
        >
            {/* Header: Product Badge & Campaign Name */}
            <div className="flex flex-col gap-1.5 mb-3">
                {product ? (
                    <div className={cn(
                        "flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full w-fit border transition-colors",
                        productTheme.bg, productTheme.text, productTheme.border
                    )}>
                        <Package className={cn("w-3 h-3", productIconColor)} strokeWidth={2.5} />
                        <span className="truncate max-w-[150px]">{product.name}</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full w-fit border border-slate-200 dark:border-slate-700">
                        <Package className="w-3 h-3 text-slate-400" strokeWidth={2.5} />
                        Unassigned
                    </div>
                )}
                <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight line-clamp-2 transition-colors">
                    {campaign.name}
                </h3>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4 mt-auto">
                {/* Companies + Opportunities */}
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Companies</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-slate-900 dark:text-white">
                            {formatCompactNumber(campaign.company_count)}
                        </span>
                        {newOpportunities.length > 0 && (
                            <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-600">
                                {newOpportunities.length} new
                            </span>
                        )}
                    </div>
                </div>

                {/* Pipeline Value */}
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-medium mb-1">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Pipeline</span>
                    </div>
                    <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(pipelineValue)}
                    </div>
                </div>
            </div>

            {/* Progress & Footer */}
            <div className="space-y-3">
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>Progress</span>
                        <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5 bg-slate-100 dark:bg-slate-800" />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatRelativeDate(campaign.updated_at)}</span>
                    </div>

                    <div className={cn(
                        "flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold capitalize border shadow-sm",
                        (campaign.status === 'active' || campaign.status === 'published') && "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30",
                        campaign.status === 'draft' && "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
                        campaign.status === 'archived' && "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30",
                        campaign.status === 'completed' && "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30"
                    )}>
                        <span className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            (campaign.status === 'active' || campaign.status === 'published') && "bg-emerald-500 dark:bg-emerald-400",
                            campaign.status === 'draft' && "bg-slate-400 dark:bg-slate-500",
                            campaign.status === 'archived' && "bg-amber-500 dark:bg-amber-400",
                            campaign.status === 'completed' && "bg-blue-500 dark:bg-blue-400"
                        )} />
                        {campaign.status}
                    </div>
                </div>
            </div>
        </div>
    );
}
