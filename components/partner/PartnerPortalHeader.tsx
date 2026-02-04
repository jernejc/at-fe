'use client';

import { useMemo } from 'react';
import {
    Building2,
    TrendingUp,
    Target,
    Globe,
    Users,
    DollarSign,
    Zap,
    ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/partner/StatCard';
import type { PartnerRead, PartnerCompanyAssignmentWithCompany, CampaignSummary } from '@/lib/schemas';

interface PartnerStats {
    totalOpportunities: number;
    newOpportunities: number;
    activeCampaigns: number;
    avgFitScore: number;
    topIndustries: string[];
    estimatedPipelineValue: number;
    totalContacts: number;
}

interface PartnerPortalHeaderProps {
    partner: PartnerRead | null;
    partnerName?: string;
    opportunities: PartnerCompanyAssignmentWithCompany[];
    campaigns: CampaignSummary[];
    newOpportunitiesCount: number;
    isPDM?: boolean;
    hidePartnerInfo?: boolean;
    onCRMConnect?: () => void;
}

/**
 * Calculates real stats from opportunity data
 */
function calculateStats(
    opportunities: PartnerCompanyAssignmentWithCompany[],
    campaigns: CampaignSummary[],
    newOpportunitiesCount: number
): PartnerStats {
    // Calculate top industries from actual data
    const industryCounts = new Map<string, number>();
    opportunities.forEach(o => {
        if (o.company.industry) {
            industryCounts.set(o.company.industry, (industryCounts.get(o.company.industry) || 0) + 1);
        }
    });
    const topIndustries = Array.from(industryCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([industry]) => industry);

    // Estimate pipeline value based on employee count tiers
    // Simple heuristic: larger companies = higher deal values
    const estimatedPipelineValue = opportunities.reduce((sum, o) => {
        const employees = o.company.employee_count || 0;
        if (employees > 10000) return sum + 500000;
        if (employees > 1000) return sum + 150000;
        if (employees > 100) return sum + 50000;
        return sum + 15000;
    }, 0);

    // Estimate contacts (assume ~3 contacts per company on average)
    const totalContacts = opportunities.length * 3;

    return {
        totalOpportunities: opportunities.length - newOpportunitiesCount,
        newOpportunities: newOpportunitiesCount,
        activeCampaigns: campaigns.length,
        avgFitScore: 0, // Not available in partner assignments
        topIndustries,
        estimatedPipelineValue,
        totalContacts,
    };
}

/**
 * Format currency value for display
 */
function formatCurrency(value: number): string {
    if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
}

export function PartnerPortalHeader({
    partner,
    partnerName,
    opportunities,
    campaigns,
    newOpportunitiesCount,
    isPDM = false,
    hidePartnerInfo = false,
    onCRMConnect,
}: PartnerPortalHeaderProps) {
    const stats = useMemo(
        () => calculateStats(opportunities, campaigns, newOpportunitiesCount),
        [opportunities, campaigns, newOpportunitiesCount]
    );

    return (
        <div className="space-y-4">
            {/* Partner Info */}
            {!hidePartnerInfo && (
            <div className="flex items-center gap-3 w-full">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                    {partner?.logo_url ? (
                        <img src={partner.logo_url} alt={partner.name} className="w-full h-full object-cover" />
                    ) : (
                        <Building2 className="w-6 h-6 text-slate-400" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight truncate">
                        {partner?.name || partnerName || 'Partner Portal'}
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {isPDM ? 'Partner Portal • PDM View' : 'Partner Portal'}
                    </p>
                </div>
            </div>
            )}

            {/* CRM Integration Banner */}
            <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-500/20 dark:via-purple-500/20 dark:to-pink-500/20 rounded-xl border border-indigo-200/50 dark:border-indigo-500/30 p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                                Supercharge with CRM Integration
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                                Sync opportunities to Salesforce or HubSpot. Track pipeline, automate follow-ups.
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={onCRMConnect}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md shrink-0"
                    >
                        Connect CRM
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <StatCard
                    icon={Building2}
                    label="Opportunities"
                    value={stats.totalOpportunities}
                />
                <StatCard
                    icon={DollarSign}
                    iconBgClass="bg-emerald-50 dark:bg-emerald-900/30"
                    label="Est. Pipeline"
                    value={formatCurrency(stats.estimatedPipelineValue)}
                    valueColorClass="text-emerald-600 dark:text-emerald-400"
                />
                <StatCard
                    icon={Users}
                    label="Contacts"
                    value={stats.totalContacts}
                />
                <StatCard
                    icon={TrendingUp}
                    iconBgClass="bg-indigo-50 dark:bg-indigo-900/30"
                    label="Avg Fit"
                    value={`${stats.avgFitScore}%`}
                    valueColorClass="text-indigo-600 dark:text-indigo-400"
                />
                <StatCard
                    icon={Target}
                    label="Campaigns"
                    value={stats.activeCampaigns}
                />
                {/* Top Industries - custom layout for badges */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/80 p-4 flex flex-col justify-between min-h-[120px] col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium tracking-wide uppercase">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <Globe className="w-3.5 h-3.5" />
                        </div>
                        <span>Top Industries</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {stats.topIndustries.length > 0 ? (
                            stats.topIndustries.slice(0, 2).map((industry, i) => (
                                <Badge
                                    key={i}
                                    variant="secondary"
                                    className="text-xs px-2 py-0.5"
                                >
                                    {industry}
                                </Badge>
                            ))
                        ) : (
                            <span className="text-sm text-slate-400">—</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
