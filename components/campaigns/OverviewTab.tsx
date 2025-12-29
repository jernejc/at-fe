'use client';

import type { CampaignOverview, MembershipRead, CompanySummary, CompanySummaryWithFit } from '@/lib/schemas';
import { ChevronRight, Loader2, TrendingUp, Users, Building2, ArrowRight } from 'lucide-react';
import { CompanyRowCompact, CompanyRowCompactSkeleton } from './CompanyRowCompact';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

export type DrillDownFilter = {
    type: 'industry' | 'fit_range';
    value: string;
    label: string;
};

interface OverviewTabProps {
    overview: CampaignOverview;
    companies: MembershipRead[];
    dynamicCompanies?: (CompanySummary | CompanySummaryWithFit)[];
    dynamicCompaniesTotal?: number;
    loadingDynamicCompanies?: boolean;
    onCompanyClick: (domain: string) => void;
    onManagePartners: () => void;
    onViewAllCompanies: () => void;
    onDrillDown?: (filter: DrillDownFilter) => void;
}

// Color helper for fit scores
const getFitColor = (range: string) => {
    const start = parseInt(range.split('-')[0]);
    if (start >= 80) return { bg: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' };
    if (start >= 60) return { bg: 'bg-green-500', text: 'text-green-600 dark:text-green-400' };
    if (start >= 40) return { bg: 'bg-yellow-500', text: 'text-yellow-600 dark:text-yellow-400' };
    if (start >= 20) return { bg: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-400' };
    return { bg: 'bg-red-500', text: 'text-red-600 dark:text-red-400' };
};

export function OverviewTab({
    overview,
    companies,
    dynamicCompanies,
    dynamicCompaniesTotal = 0,
    loadingDynamicCompanies = false,
    onCompanyClick,
    onManagePartners,
    onViewAllCompanies,
    onDrillDown,
}: OverviewTabProps) {
    const useDynamic = dynamicCompanies !== undefined;
    const displayTotal = useDynamic ? dynamicCompaniesTotal : overview.company_count;

    return (
        <div className="space-y-6">
            {/* Dynamic Filter Results Banner */}
            {useDynamic && (
                <div className="flex items-center gap-3 py-3 px-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    {loadingDynamicCompanies ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                            <span className="text-sm text-slate-600 dark:text-slate-400">Searching...</span>
                        </>
                    ) : (
                        <>
                            <span className="text-sm text-slate-600 dark:text-slate-400">Filter results:</span>
                            <span className="text-lg font-semibold text-blue-700 dark:text-blue-300 tabular-nums">
                                {displayTotal.toLocaleString()}
                            </span>
                            <span className="text-sm text-slate-500">matching companies</span>
                        </>
                    )}
                </div>
            )}

            {/* Partner Stats Bar */}
            <PartnerStatsBar companies={companies} onManagePartners={onManagePartners} />

            {/* Main content - Two column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Left column - Top Companies */}
                <div className="lg:col-span-3 space-y-6">
                    <TopCompaniesCard
                        topCompanies={overview.top_companies}
                        dynamicCompanies={dynamicCompanies}
                        dynamicCompaniesTotal={dynamicCompaniesTotal}
                        totalCompanies={overview.company_count}
                        loadingDynamicCompanies={loadingDynamicCompanies}
                        onCompanyClick={onCompanyClick}
                        onViewAll={onViewAllCompanies}
                    />
                </div>

                {/* Right column - Stats sidebar */}
                <div className="lg:col-span-2 space-y-4">
                    <IndustryBreakdownCard
                        industryBreakdown={overview.industry_breakdown}
                        onDrillDown={onDrillDown}
                    />
                    <FitDistributionCard
                        fitDistribution={overview.fit_distribution}
                        onDrillDown={onDrillDown}
                    />
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// Skeleton Components
// ============================================================================

const shimmer = "animate-pulse bg-slate-200 dark:bg-slate-700";

function PartnerStatsBarSkeleton() {
    return (
        <div className="flex items-center justify-between py-3 px-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <div className={`h-4 w-32 rounded ${shimmer}`} />
            <div className="flex items-center gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-1.5">
                        <div className={`h-4 w-6 rounded ${shimmer}`} />
                        <div className={`h-3 w-14 rounded ${shimmer}`} />
                    </div>
                ))}
            </div>
        </div>
    );
}

function TopCompaniesCardSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className={`h-4 w-36 rounded ${shimmer}`} />
                <div className={`h-3 w-16 rounded ${shimmer}`} />
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {Array.from({ length: rows }).map((_, i) => (
                    <CompanyRowCompactSkeleton key={i} showRank />
                ))}
            </div>
        </div>
    );
}

function IndustryBreakdownCardSkeleton() {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <div className={`h-4 w-20 rounded ${shimmer}`} />
            </div>
            <div className="p-4">
                <div className="flex flex-wrap gap-1.5">
                    {[80, 65, 90, 55, 70, 45].map((width, i) => (
                        <div key={i} className={`h-7 rounded-full ${shimmer}`} style={{ width: `${width}px` }} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function FitDistributionCardSkeleton() {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <div className={`h-4 w-28 rounded ${shimmer}`} />
            </div>
            <div className="p-4 space-y-3">
                {[85, 60, 45, 30, 20].map((width, i) => (
                    <div key={i} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <div className={`h-3 w-12 rounded ${shimmer}`} />
                            <div className={`h-3 w-6 rounded ${shimmer}`} />
                        </div>
                        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${shimmer}`} style={{ width: `${width}%` }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function OverviewTabSkeleton() {
    return (
        <div className="space-y-6">
            <PartnerStatsBarSkeleton />
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                    <TopCompaniesCardSkeleton rows={6} />
                </div>
                <div className="lg:col-span-2 space-y-4">
                    <IndustryBreakdownCardSkeleton />
                    <FitDistributionCardSkeleton />
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// Component Definitions
// ============================================================================

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
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Users className="w-4 h-4" />
                <span>Partner Assignments</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">{assignedCount}</span>
                    <span className="text-slate-400">assigned</span>
                </div>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <div className="flex items-center gap-1.5">
                    <span className={`font-semibold tabular-nums ${unassignedCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`}>
                        {unassignedCount}
                    </span>
                    <span className="text-slate-400">pending</span>
                </div>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 tabular-nums">{uniquePartners}</span>
                    <span className="text-slate-400">partners</span>
                </div>
                <button
                    onClick={onManagePartners}
                    className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                    Manage
                    <ChevronRight className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
}

function TopCompaniesCard({
    topCompanies,
    dynamicCompanies,
    dynamicCompaniesTotal = 0,
    totalCompanies = 0,
    loadingDynamicCompanies,
    onCompanyClick,
    onViewAll,
}: {
    topCompanies?: CampaignOverview['top_companies'];
    dynamicCompanies?: (CompanySummary | CompanySummaryWithFit)[];
    dynamicCompaniesTotal?: number;
    totalCompanies?: number;
    loadingDynamicCompanies?: boolean;
    onCompanyClick: (domain: string) => void;
    onViewAll: () => void;
}) {
    const useDynamic = dynamicCompanies !== undefined;
    const displayCompanies = useDynamic ? dynamicCompanies : topCompanies;
    const shownCount = displayCompanies?.slice(0, 8).length || 0;
    const totalCount = useDynamic ? dynamicCompaniesTotal : totalCompanies;
    const hasMore = totalCount > shownCount;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-slate-400" />
                    <h3 className="font-medium text-sm text-slate-900 dark:text-white">
                        {useDynamic ? 'Matching Companies' : 'Top Companies by Fit'}
                    </h3>
                </div>
                <div className="flex items-center gap-3">
                    {loadingDynamicCompanies ? (
                        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                    ) : (
                        <span className="text-xs text-slate-400 tabular-nums">
                            {shownCount} of {totalCount}
                        </span>
                    )}
                    {hasMore && !loadingDynamicCompanies && (
                        <button
                            onClick={onViewAll}
                            className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            View all
                            <ArrowRight className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {loadingDynamicCompanies ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <CompanyRowCompactSkeleton key={i} showRank />
                    ))
                ) : useDynamic ? (
                    dynamicCompanies && dynamicCompanies.length > 0 ? dynamicCompanies.slice(0, 8).map((company, idx) => (
                        <CompanyRowCompact
                            key={company.domain}
                            name={company.name}
                            domain={company.domain}
                            rank={idx + 1}
                            industry={company.industry}
                            employeeCount={company.employee_count}
                            hqCountry={company.hq_country}
                            fitScore={'combined_score' in company ? company.combined_score : null}
                            logoBase64={company.logo_base64}
                            onClick={() => onCompanyClick(company.domain)}
                            className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        />
                    )) : (
                        <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                            No companies match your filters
                        </div>
                    )
                ) : (
                    topCompanies && topCompanies.length > 0 ? topCompanies.slice(0, 8).map((company, idx) => (
                        <CompanyRowCompact
                            key={company.id}
                            name={company.company_name || company.domain}
                            domain={company.domain}
                            rank={idx + 1}
                            fitScore={company.cached_fit_score}
                            logoBase64={company.logo_base64}
                            partnerName={company.partner_name}
                            onClick={() => onCompanyClick(company.domain)}
                            className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        />
                    )) : (
                        <div className="p-8 text-center">
                            <div className="text-slate-500 dark:text-slate-400 text-sm">No companies yet</div>
                            <div className="text-slate-400 text-xs mt-1">Add companies to get started</div>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}

function IndustryBreakdownCard({
    industryBreakdown,
    onDrillDown,
}: {
    industryBreakdown?: Record<string, number>;
    onDrillDown?: (filter: DrillDownFilter) => void;
}) {
    if (!industryBreakdown || Object.keys(industryBreakdown).length === 0) {
        return null;
    }

    const totalCompanies = Object.values(industryBreakdown).reduce((sum, count) => sum + count, 0);
    const industries = Object.entries(industryBreakdown)
        .filter(([_, count]) => count > 0)
        .sort((a, b) => b[1] - a[1]);
    const displayedIndustries = industries.slice(0, 8);
    const remainingCount = industries.length - 8;

    const handleIndustryClick = (industry: string) => {
        onDrillDown?.({
            type: 'industry',
            value: industry,
            label: `Industry: ${industry}`,
        });
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-medium text-sm text-slate-900 dark:text-white">Industries</h3>
            </div>
            <div className="p-4">
                <div className="flex flex-wrap gap-2">
                    {displayedIndustries.map(([industry, count]) => {
                        const percentage = totalCompanies > 0 ? (count / totalCompanies) * 100 : 0;
                        return (
                            <Tooltip key={industry}>
                                <TooltipTrigger
                                    onClick={() => handleIndustryClick(industry)}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer"
                                >
                                    {industry}
                                    <span className="text-slate-400 dark:text-slate-500">{count}</span>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    <div className="text-center">
                                        <div className="font-medium">{count} companies</div>
                                        <div className="text-slate-400 text-xs">{percentage.toFixed(1)}% of total</div>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        );
                    })}
                    {remainingCount > 0 && (
                        <span className="inline-flex items-center px-2.5 py-1 text-xs text-slate-400 dark:text-slate-500">
                            +{remainingCount} more
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

function FitDistributionCard({
    fitDistribution,
    onDrillDown,
}: {
    fitDistribution?: CampaignOverview['fit_distribution'];
    onDrillDown?: (filter: DrillDownFilter) => void;
}) {
    if (!fitDistribution || !Object.values(fitDistribution).some(v => v > 0)) {
        return null;
    }

    const totalScored = Object.values(fitDistribution).reduce((sum, val) => sum + val, 0) - (fitDistribution.unscored || 0);

    const handleRangeClick = (range: string) => {
        onDrillDown?.({
            type: 'fit_range',
            value: range,
            label: `Fit: ${range}%`,
        });
    };

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
                        const percentage = totalScored > 0 ? (count / totalScored) * 100 : 0;
                        const colors = getFitColor(range);

                        return (
                            <Tooltip key={range}>
                                <TooltipTrigger
                                    onClick={() => handleRangeClick(range)}
                                    className="w-full text-left cursor-pointer group"
                                >
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <span className={`font-medium ${colors.text}`}>{range}%</span>
                                        <span className="text-slate-500 dark:text-slate-400 tabular-nums">{count}</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-300 ${colors.bg}`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="left">
                                    <div className="text-center">
                                        <div className="font-medium">{count} companies</div>
                                        <div className="text-slate-400 text-xs">{percentage.toFixed(1)}% of scored</div>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        );
                    })}
                {fitDistribution.unscored > 0 && (
                    <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>Unscored</span>
                            <span className="tabular-nums">{fitDistribution.unscored}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
