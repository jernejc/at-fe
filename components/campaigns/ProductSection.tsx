'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { CampaignSummary } from '@/lib/schemas';
import type { ProductSummary } from '@/lib/schemas/product';
import { CampaignCardPreview } from './CampaignCardPreview';
import { ChevronDown, Package, Plus, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductSectionProps {
    product: ProductSummary | null; // null = unassigned campaigns
    campaigns: CampaignSummary[];
    onNewCampaign?: (productId: number | null) => void;
    onAssignProduct?: (campaign: CampaignSummary) => void;
    defaultExpanded?: boolean;
    color?: string;
}

// Product color palette for visual distinction
const PRODUCT_COLORS = [
    'from-blue-500 to-blue-600',
    'from-violet-500 to-violet-600',
    'from-emerald-500 to-emerald-600',
    'from-amber-500 to-amber-600',
    'from-rose-500 to-rose-600',
    'from-cyan-500 to-cyan-600',
    'from-indigo-500 to-indigo-600',
    'from-pink-500 to-pink-600',
];

export function ProductSection({
    product,
    campaigns,
    onNewCampaign,
    onAssignProduct,
    defaultExpanded = true,
    color,
}: ProductSectionProps) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const isUnassigned = product === null;

    // Use provided color or generate from product ID
    const gradientColor = color || (product ? PRODUCT_COLORS[product.id % PRODUCT_COLORS.length] : 'from-slate-400 to-slate-500');

    // Calculate totals
    const totalCompanies = campaigns.reduce((sum, c) => sum + c.company_count, 0);

    return (
        <div className={cn(
            "rounded-2xl border overflow-hidden transition-all",
            isUnassigned
                ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
        )}>
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={cn(
                    "w-full px-5 py-4 flex items-center justify-between",
                    "hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                )}
            >
                <div className="flex items-center gap-3">
                    {/* Product Icon */}
                    <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm",
                        isUnassigned
                            ? "bg-amber-100 dark:bg-amber-900/30"
                            : `bg-gradient-to-br ${gradientColor}`
                    )}>
                        {isUnassigned ? (
                            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        ) : (
                            <Package className="w-5 h-5 text-white" />
                        )}
                    </div>

                    {/* Title & Stats */}
                    <div className="text-left">
                        <h3 className={cn(
                            "font-semibold text-base",
                            isUnassigned
                                ? "text-amber-800 dark:text-amber-200"
                                : "text-slate-900 dark:text-white"
                        )}>
                            {isUnassigned ? 'Unassigned' : product.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''} · {totalCompanies} companies
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isUnassigned && (
                        <span className="text-xs text-amber-600 dark:text-amber-400 mr-2">
                            Click campaigns to assign product
                        </span>
                    )}
                    <ChevronDown className={cn(
                        "w-5 h-5 text-slate-400 transition-transform duration-200",
                        isExpanded && "rotate-180"
                    )} />
                </div>
            </button>

            {/* Content */}
            {isExpanded && (
                <div className="px-5 pb-5">
                    <div className="flex flex-wrap gap-3">
                        {campaigns.map((campaign) => (
                            <CampaignCardPreview
                                key={campaign.id}
                                campaign={campaign}
                                onAssignProduct={isUnassigned && onAssignProduct ? () => onAssignProduct(campaign) : undefined}
                            />
                        ))}

                        {/* Add Campaign Button */}
                        {!isUnassigned && onNewCampaign && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onNewCampaign(product.id);
                                }}
                                className={cn(
                                    "min-w-[200px] max-w-[280px] rounded-xl border-2 border-dashed",
                                    "border-slate-200 dark:border-slate-700 p-4",
                                    "flex flex-col items-center justify-center gap-2",
                                    "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300",
                                    "hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50",
                                    "transition-all cursor-pointer"
                                )}
                            >
                                <Plus className="w-5 h-5" />
                                <span className="text-sm font-medium">Add Campaign</span>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
