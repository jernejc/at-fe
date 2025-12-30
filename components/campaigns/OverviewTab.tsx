'use client';

import { useMemo } from 'react';
import type { CampaignOverview, MembershipRead, CompanySummary, CompanySummaryWithFit } from '@/lib/schemas';
import {
    ChevronRight, TrendingUp, ArrowRight, BarChart3, Flame, Clock, MessageSquare,
    CalendarCheck, Send, AlertCircle, Users, Loader2
} from 'lucide-react';
import { CompanyRowCompact, CompanyRowCompactSkeleton } from './CompanyRowCompact';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export type DrillDownFilter = {
    type: 'industry' | 'fit_range' | 'outreach_status';
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

// ============================================================================
// Mock Data Generation (to be replaced with real API data)
// ============================================================================

interface OutreachPipeline {
    not_started: number;
    contacted: number;
    responded: number;
    meeting_booked: number;
}

interface AccountNeedingAttention {
    domain: string;
    name: string;
    industry: string | null;
    fitScore: number | null;
    logoBase64?: string | null;
    reason: 'high_fit_not_contacted' | 'stale' | 'needs_followup';
    reasonLabel: string;
}

function generateMockPipeline(companies: MembershipRead[]): OutreachPipeline {
    const total = companies.length;
    if (total === 0) {
        return { not_started: 0, contacted: 0, responded: 0, meeting_booked: 0 };
    }

    const meetingBooked = Math.floor(total * 0.05);
    const responded = Math.floor(total * 0.12);
    const contacted = Math.floor(total * 0.35);
    const notStarted = total - meetingBooked - responded - contacted;

    return { not_started: notStarted, contacted, responded, meeting_booked: meetingBooked };
}

function generateAccountsNeedingAttention(companies: MembershipRead[]): AccountNeedingAttention[] {
    // High-fit accounts not contacted (top priority)
    const highFit = companies
        .filter(c => c.cached_fit_score !== null && c.cached_fit_score >= 0.75)
        .slice(0, 2)
        .map(c => ({
            domain: c.domain,
            name: c.company_name || c.domain,
            industry: c.industry,
            fitScore: c.cached_fit_score,
            logoBase64: c.logo_base64,
            reason: 'high_fit_not_contacted' as const,
            reasonLabel: 'High fit, not contacted',
        }));

    const stale = companies
        .filter(c => c.cached_fit_score !== null && c.cached_fit_score >= 0.5 && c.cached_fit_score < 0.75)
        .slice(0, 2)
        .map(c => ({
            domain: c.domain,
            name: c.company_name || c.domain,
            industry: c.industry,
            fitScore: c.cached_fit_score,
            logoBase64: c.logo_base64,
            reason: 'stale' as const,
            reasonLabel: 'No activity in 14+ days',
        }));

    return [...highFit, ...stale].slice(0, 4);
}

// ============================================================================
// Color Helpers
// ============================================================================

const getFitColor = (range: string) => {
    const start = parseInt(range.split('-')[0]);
    if (start >= 80) return { bg: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' };
    if (start >= 60) return { bg: 'bg-green-500', text: 'text-green-600 dark:text-green-400' };
    if (start >= 40) return { bg: 'bg-yellow-500', text: 'text-yellow-600 dark:text-yellow-400' };
    if (start >= 20) return { bg: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-400' };
    return { bg: 'bg-red-500', text: 'text-red-600 dark:text-red-400' };
};

// ============================================================================
// Main Component
// ============================================================================

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
    const pipeline = useMemo(() => generateMockPipeline(companies), [companies]);
    const accountsNeedingAttention = useMemo(() => generateAccountsNeedingAttention(companies), [companies]);

    return (
        <div className="space-y-6">
            {/* Main content - Two column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column - Pipeline + Top Companies */}
                <div className="lg:col-span-2 space-y-6">
                    <OutreachPipelineCard pipeline={pipeline} onDrillDown={onDrillDown} />
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

                {/* Right column - Partner Overview + Needs Attention + Fit Distribution */}
                <div className="space-y-6">
                    <PartnerOverviewCard
                        companies={companies}
                        onManagePartners={onManagePartners}
                    />
                    <NeedsAttentionCard
                        accounts={accountsNeedingAttention}
                        onCompanyClick={onCompanyClick}
                        onViewAll={onViewAllCompanies}
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
// Outreach Pipeline Card
// ============================================================================

const PIPELINE_STAGES = [
    { key: 'not_started', label: 'Not Started', icon: Clock },
    { key: 'contacted', label: 'Contacted', icon: Send },
    { key: 'responded', label: 'Responded', icon: MessageSquare },
    { key: 'meeting_booked', label: 'Meeting', icon: CalendarCheck },
] as const;

function OutreachPipelineCard({
    pipeline,
    onDrillDown,
}: {
    pipeline: OutreachPipeline;
    onDrillDown?: (filter: DrillDownFilter) => void;
}) {
    const total = Object.values(pipeline).reduce((sum, count) => sum + count, 0);

    return (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
            {/* Step Progress */}
            <div className="flex items-start">
                {PIPELINE_STAGES.map((stage, idx) => {
                    const Icon = stage.icon;
                    const count = pipeline[stage.key as keyof OutreachPipeline];
                    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                    const isLast = idx === PIPELINE_STAGES.length - 1;
                    const hasProgress = count > 0;

                    return (
                        <div key={stage.key} className="flex-1 flex items-start">
                            {/* Step content */}
                            <Tooltip>
                                <TooltipTrigger
                                    onClick={() => onDrillDown?.({ type: 'outreach_status', value: stage.key, label: stage.label })}
                                    className="flex flex-col items-center cursor-pointer w-full"
                                >
                                    {/* Icon circle */}
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center",
                                        hasProgress
                                            ? isLast
                                                ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"
                                                : "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
                                    )}>
                                        <Icon className="w-4 h-4" />
                                    </div>

                                    {/* Count */}
                                    <div className="mt-2 text-center">
                                        <div className={cn(
                                            "text-lg font-semibold tabular-nums",
                                            hasProgress
                                                ? "text-slate-900 dark:text-white"
                                                : "text-slate-400 dark:text-slate-500"
                                        )}>
                                            {count}
                                        </div>
                                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                            {stage.label}
                                        </div>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <div className="text-center">
                                        <div className="font-medium">{stage.label}</div>
                                        <div className="text-slate-400 text-xs">{percentage}% of total</div>
                                    </div>
                                </TooltipContent>
                            </Tooltip>

                            {/* Arrow connector */}
                            {!isLast && (
                                <div className="flex-1 flex items-center self-stretch px-1">
                                    <div className="w-full flex items-center text-slate-400 dark:text-slate-500">
                                        <div className="flex-1 h-0.5 bg-current rounded-full" />
                                        <ChevronRight className="w-5 h-5 -ml-1.5 shrink-0" />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ============================================================================
// Partner Overview Card
// ============================================================================

function PartnerOverviewCard({
    companies,
    onManagePartners,
}: {
    companies: MembershipRead[];
    onManagePartners: () => void;
}) {
    const assigned = companies.filter(c => c.partner_id).length;
    const unassigned = companies.length - assigned;
    const partners = new Map<string, { name: string; count: number }>();

    companies.forEach(c => {
        if (c.partner_id && c.partner_name) {
            const existing = partners.get(c.partner_id);
            if (existing) {
                existing.count++;
            } else {
                partners.set(c.partner_id, { name: c.partner_name, count: 1 });
            }
        }
    });

    const topPartners = Array.from(partners.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

    return (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <h3 className="font-medium text-sm text-slate-900 dark:text-white">Partners</h3>
                </div>
                <button
                    onClick={onManagePartners}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                    Manage
                </button>
            </div>
            <div className="p-4">
                {/* Stats row */}
                <div className="flex items-center gap-4 text-sm mb-4">
                    <div>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{assigned}</span>
                        <span className="text-slate-500 dark:text-slate-400 ml-1">assigned</span>
                    </div>
                    <span className="text-slate-300 dark:text-slate-700">·</span>
                    <div>
                        <span className={cn(
                            "font-semibold",
                            unassigned > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-400"
                        )}>{unassigned}</span>
                        <span className="text-slate-500 dark:text-slate-400 ml-1">unassigned</span>
                    </div>
                </div>

                {/* Top partners */}
                {topPartners.length > 0 ? (
                    <div className="space-y-2">
                        {topPartners.map((partner, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                                <span className="text-slate-700 dark:text-slate-300 truncate">{partner.name}</span>
                                <span className="text-slate-500 dark:text-slate-400 tabular-nums">{partner.count}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">No partners assigned yet</p>
                )}
            </div>
        </div>
    );
}

// ============================================================================
// Top Companies Card (restored)
// ============================================================================

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

    // Sort dynamic companies by fit score
    const sortedDynamicCompanies = useDynamic && dynamicCompanies
        ? [...dynamicCompanies].sort((a, b) => {
            const scoreA = 'combined_score' in a ? (a.combined_score ?? 0) : 0;
            const scoreB = 'combined_score' in b ? (b.combined_score ?? 0) : 0;
            return scoreB - scoreA;
        })
        : undefined;

    const displayCompanies = useDynamic ? sortedDynamicCompanies : topCompanies;
    const shownCount = displayCompanies?.slice(0, 6).length || 0;
    const totalCount = useDynamic ? dynamicCompaniesTotal : totalCompanies;
    const hasMore = totalCount > shownCount;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-slate-400" />
                    <h3 className="font-medium text-sm text-slate-900 dark:text-white">Top Companies</h3>
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
                    sortedDynamicCompanies && sortedDynamicCompanies.length > 0 ? sortedDynamicCompanies.slice(0, 6).map((company, idx) => (
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
                    topCompanies && topCompanies.length > 0 ? topCompanies.slice(0, 6).map((company, idx) => (
                        <CompanyRowCompact
                            key={company.id}
                            name={company.company_name || company.domain}
                            domain={company.domain}
                            rank={idx + 1}
                            industry={company.industry}
                            employeeCount={company.employee_count}
                            hqCountry={company.hq_country}
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

// ============================================================================
// Needs Attention Card (compact)
// ============================================================================

const ATTENTION_CONFIG = {
    high_fit_not_contacted: { icon: Flame, color: 'text-orange-500' },
    stale: { icon: Clock, color: 'text-slate-400' },
    needs_followup: { icon: MessageSquare, color: 'text-blue-500' },
};

function NeedsAttentionCard({
    accounts,
    onCompanyClick,
    onViewAll,
}: {
    accounts: AccountNeedingAttention[];
    onCompanyClick: (domain: string) => void;
    onViewAll: () => void;
}) {
    if (accounts.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="font-medium text-sm text-slate-900 dark:text-white">Needs Attention</h3>
                </div>
                <div className="p-6 text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">All caught up</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <h3 className="font-medium text-sm text-slate-900 dark:text-white">Needs Attention</h3>
                </div>
                <button
                    onClick={onViewAll}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                    View all
                </button>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {accounts.map((account) => {
                    const config = ATTENTION_CONFIG[account.reason];
                    const Icon = config.icon;

                    return (
                        <button
                            key={account.domain}
                            onClick={() => onCompanyClick(account.domain)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
                        >
                            <Icon className={cn("w-4 h-4 shrink-0", config.color)} />
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                    {account.name}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                    {account.reasonLabel}
                                </div>
                            </div>
                            {account.fitScore !== null && (
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                    {Math.round(account.fitScore * 100)}%
                                </span>
                            )}
                            <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ============================================================================
// Fit Distribution Card
// ============================================================================

function FitDistributionCard({
    fitDistribution,
    onDrillDown,
}: {
    fitDistribution?: CampaignOverview['fit_distribution'];
    onDrillDown?: (filter: DrillDownFilter) => void;
}) {
    const hasData = fitDistribution && Object.values(fitDistribution).some(v => v > 0);

    if (!hasData) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="font-medium text-sm text-slate-900 dark:text-white">Fit Distribution</h3>
                </div>
                <div className="p-6 text-center">
                    <BarChart3 className="w-6 h-6 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">No fit scores yet</p>
                </div>
            </div>
        );
    }

    const totalScored = Object.values(fitDistribution).reduce((sum, val) => sum + val, 0) - (fitDistribution.unscored || 0);

    return (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-medium text-sm text-slate-900 dark:text-white">Fit Distribution</h3>
            </div>
            <div className="p-4 space-y-2">
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
                                    onClick={() => onDrillDown?.({ type: 'fit_range', value: range, label: `Fit: ${range}%` })}
                                    className="w-full text-left cursor-pointer"
                                >
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <span className={`font-medium ${colors.text}`}>{range}%</span>
                                        <span className="text-slate-500 dark:text-slate-400 tabular-nums">{count}</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${colors.bg}`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="left">
                                    <div className="text-center">
                                        <div className="font-medium">{count} companies</div>
                                        <div className="text-slate-400 text-xs">{percentage.toFixed(1)}%</div>
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

// ============================================================================
// Skeleton Components
// ============================================================================

const shimmer = "animate-pulse bg-slate-200 dark:bg-slate-700";

export function OverviewTabSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Pipeline skeleton */}
                    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                            <div className={`h-4 w-28 rounded ${shimmer}`} />
                        </div>
                        <div className="p-4">
                            <div className={`h-8 rounded mb-4 ${shimmer}`} />
                            <div className="flex gap-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className={`h-4 w-20 rounded ${shimmer}`} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Top companies skeleton */}
                    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                            <div className={`h-4 w-36 rounded ${shimmer}`} />
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <CompanyRowCompactSkeleton key={i} showRank />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Partner overview skeleton */}
                    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                            <div className={`h-4 w-20 rounded ${shimmer}`} />
                        </div>
                        <div className="p-4">
                            <div className="flex gap-4 mb-4">
                                <div className={`h-4 w-20 rounded ${shimmer}`} />
                                <div className={`h-4 w-24 rounded ${shimmer}`} />
                            </div>
                            <div className="space-y-2">
                                {[1, 2].map((i) => (
                                    <div key={i} className="flex justify-between">
                                        <div className={`h-4 w-24 rounded ${shimmer}`} />
                                        <div className={`h-4 w-6 rounded ${shimmer}`} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Needs attention skeleton */}
                    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                            <div className={`h-4 w-28 rounded ${shimmer}`} />
                        </div>
                        <div className="p-4 space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded ${shimmer}`} />
                                    <div className="flex-1">
                                        <div className={`h-4 w-24 rounded mb-1 ${shimmer}`} />
                                        <div className={`h-3 w-32 rounded ${shimmer}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Fit distribution skeleton */}
                    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                            <div className={`h-4 w-28 rounded ${shimmer}`} />
                        </div>
                        <div className="p-4 space-y-3">
                            {[85, 60, 45, 30, 20].map((width, i) => (
                                <div key={i} className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <div className={`h-3 w-12 rounded ${shimmer}`} />
                                        <div className={`h-3 w-6 rounded ${shimmer}`} />
                                    </div>
                                    <div className={`h-1.5 rounded-full ${shimmer}`} style={{ width: `${width}%` }} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
