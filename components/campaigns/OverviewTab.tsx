'use client';

import type { CampaignOverview, MembershipRead } from '@/lib/schemas';
import { ChevronRight } from 'lucide-react';
import { CompanyRowCompact } from './CompanyRowCompact';

interface OverviewTabProps {
    overview: CampaignOverview;
    companies: MembershipRead[];
    onCompanyClick: (domain: string) => void;
    onManagePartners: () => void;
}

// Color helper for fit scores
const getFitColor = (range: string) => {
    const start = parseInt(range.split('-')[0]);
    if (start >= 80) return 'bg-emerald-500 dark:bg-emerald-500';
    if (start >= 60) return 'bg-green-500 dark:bg-green-500';
    if (start >= 40) return 'bg-yellow-500 dark:bg-yellow-500';
    if (start >= 20) return 'bg-orange-500 dark:bg-orange-500';
    return 'bg-red-500 dark:bg-red-500';
};

export function OverviewTab({
    overview,
    companies,
    onCompanyClick,
    onManagePartners,
}: OverviewTabProps) {
    return (
        <div className="space-y-6">
            {/* Mini Funnel */}
            <div className="flex items-center justify-between py-2.5 px-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Pipeline</span>
                <div className="flex items-center gap-1">
                    {[
                        { label: 'Total', value: overview.company_count, color: 'text-slate-900 dark:text-white' },
                        { label: 'Analyzed', value: overview.processed_count, color: 'text-blue-600 dark:text-blue-400' },
                        { label: 'Scored', value: Object.values(overview.fit_distribution || {}).reduce((sum, v) => sum + v, 0) - (overview.fit_distribution?.unscored || 0), color: 'text-violet-600 dark:text-violet-400' },
                        { label: 'High Fit', value: (overview.fit_distribution?.['80-100'] || 0) + (overview.fit_distribution?.['60-80'] || 0), color: 'text-emerald-600 dark:text-emerald-400' },
                    ].map((stage, idx, arr) => (
                        <div key={stage.label} className="flex items-center">
                            <div className="flex flex-col items-center px-3">
                                <span className={`text-sm font-semibold tabular-nums ${stage.color}`}>{stage.value}</span>
                                <span className="text-[10px] text-slate-400">{stage.label}</span>
                            </div>
                            {idx < arr.length - 1 && (
                                <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Partner Stats */}
            <PartnerStatsBar companies={companies} onManagePartners={onManagePartners} />

            {/* Main content - Two column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Left column - Top Companies */}
                <div className="lg:col-span-3 space-y-6">
                    <TopCompaniesCard
                        topCompanies={overview.top_companies}
                        onCompanyClick={onCompanyClick}
                    />
                </div>

                {/* Right column - Stats sidebar */}
                <div className="lg:col-span-2 space-y-4">
                    <IndustryBreakdownCard industryBreakdown={overview.industry_breakdown} />
                    <FitDistributionCard fitDistribution={overview.fit_distribution} />
                </div>
            </div>
        </div>
    );
}

// Partner Stats Bar
function PartnerStatsBar({
    companies,
    onManagePartners,
}: {
    companies: MembershipRead[];
    onManagePartners: () => void;
}) {
    const assignedCount = companies.filter(c => c.partner_id).length;
    const unassignedCount = companies.length - assignedCount;
    const uniquePartners = new Set(companies.filter(c => c.partner_id).map(c => c.partner_id)).size;

    return (
        <div className="flex items-center justify-between py-3 px-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Partner Assignments</span>
            <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{assignedCount}</span>
                    <span className="text-slate-500 dark:text-slate-400">assigned</span>
                </div>
                <div className="w-px h-4 bg-slate-200 dark:bg-slate-700" />
                <div className="flex items-center gap-1.5">
                    <span className={`font-semibold ${unassignedCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>{unassignedCount}</span>
                    <span className="text-slate-500 dark:text-slate-400">pending</span>
                </div>
                <div className="w-px h-4 bg-slate-200 dark:bg-slate-700" />
                <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-900 dark:text-white">{uniquePartners}</span>
                    <span className="text-slate-500 dark:text-slate-400">partners active</span>
                </div>
                <button
                    onClick={onManagePartners}
                    className="ml-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                    Manage →
                </button>
            </div>
        </div>
    );
}

// Top Companies Card
function TopCompaniesCard({
    topCompanies,
    onCompanyClick,
}: {
    topCompanies?: CampaignOverview['top_companies'];
    onCompanyClick: (domain: string) => void;
}) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-medium text-sm text-slate-900 dark:text-white">Top Companies by Fit</h3>
                <span className="text-xs text-slate-400">{topCompanies?.length || 0} shown</span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {topCompanies && topCompanies.length > 0 ? topCompanies.slice(0, 8).map((company, idx) => (
                    <CompanyRowCompact
                        key={company.id}
                        name={company.company_name || company.domain}
                        domain={company.domain}
                        rank={idx + 1}
                        fitScore={company.cached_fit_score}
                        logoBase64={company.logo_base64}
                        partnerName={company.partner_name}
                        onClick={() => onCompanyClick(company.domain)}
                        className="cursor-pointer"
                    />
                )) : (
                    <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                        No companies yet. Add one to get started!
                    </div>
                )}
            </div>
        </div>
    );
}

// Industry Breakdown Card
function IndustryBreakdownCard({
    industryBreakdown,
}: {
    industryBreakdown?: Record<string, number>;
}) {
    if (!industryBreakdown || Object.keys(industryBreakdown).length === 0) {
        return null;
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-medium text-sm text-slate-900 dark:text-white">Industries</h3>
            </div>
            <div className="p-4">
                <div className="flex flex-wrap gap-1.5">
                    {Object.entries(industryBreakdown)
                        .filter(([_, count]) => count > 0)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 8)
                        .map(([industry, count]) => (
                            <span
                                key={industry}
                                className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded"
                            >
                                {industry}
                                <span className="text-slate-400 dark:text-slate-500">{count}</span>
                            </span>
                        ))}
                </div>
            </div>
        </div>
    );
}

// Fit Distribution Card
function FitDistributionCard({
    fitDistribution,
}: {
    fitDistribution?: CampaignOverview['fit_distribution'];
}) {
    if (!fitDistribution || !Object.values(fitDistribution).some(v => v > 0)) {
        return null;
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-medium text-sm text-slate-900 dark:text-white">Fit Distribution</h3>
            </div>
            <div className="p-4 space-y-2.5">
                {Object.entries(fitDistribution)
                    .filter(([key]) => key !== 'unscored')
                    .sort((a, b) => {
                        const aStart = parseInt(a[0].split('-')[0]);
                        const bStart = parseInt(b[0].split('-')[0]);
                        return bStart - aStart;
                    })
                    .map(([range, count]) => {
                        const total = Object.values(fitDistribution).reduce((sum, val) => sum + val, 0) - (fitDistribution.unscored || 0);
                        const percentage = total > 0 ? (count / total) * 100 : 0;
                        const colorClass = getFitColor(range);

                        return (
                            <div key={range} className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-600 dark:text-slate-400">{range}%</span>
                                    <span className="text-slate-400 dark:text-slate-500">{count}</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                {fitDistribution.unscored > 0 && (
                    <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>Unscored</span>
                            <span>{fitDistribution.unscored}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Segments Card
function SegmentsCard({
    segments,
}: {
    segments?: CampaignOverview['segments'];
}) {
    if (!segments || segments.length === 0) {
        return null;
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-medium text-sm text-slate-900 dark:text-white">Segments</h3>
            </div>
            <div className="p-4 space-y-2">
                {segments.slice(0, 5).map((segment) => (
                    <div key={segment.name} className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">{segment.name}</span>
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900 dark:text-white">{segment.count}</span>
                            <span className="text-xs text-slate-400">({segment.percentage.toFixed(0)}%)</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
