'use client';

import { useMemo } from 'react';
import type { CampaignOverview, MembershipRead, CompanySummary, CompanySummaryWithFit } from '@/lib/schemas';
import { CompanyRowCompactSkeleton } from './CompanyRowCompact';
import { DrillDownFilter } from './overview/types';
import { generateMockPipeline, generateAccountsNeedingAttention, calculateFitDistribution } from './overview/utils';
import { OutreachPipelineCard } from './overview/OutreachPipelineCard';
import { PartnerOverviewCard } from './overview/PartnerOverviewCard';
import { TopCompaniesCard } from './overview/TopCompaniesCard';
import { NeedsAttentionCard } from './overview/NeedsAttentionCard';
import { FitDistributionCard } from './overview/FitDistributionCard';
import { PerformancePreviewCard } from './overview/PerformancePreviewCard';

export type { DrillDownFilter };

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
    campaignSlug?: string;
}

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
    campaignSlug,
}: OverviewTabProps) {
    // Use actual companies or fall back to top_companies
    const displayCompanies = useMemo(() => {
        if (companies.length > 0) return companies;
        return overview.top_companies || [];
    }, [companies, overview.top_companies]);

    const pipeline = useMemo(() => generateMockPipeline(displayCompanies.length > 0 ? displayCompanies :
        Array.from({ length: overview.company_count || 0 }) as MembershipRead[]), [displayCompanies, overview.company_count]);
    const accountsNeedingAttention = useMemo(() => generateAccountsNeedingAttention(displayCompanies), [displayCompanies]);

    // Calculate fit distribution from loaded companies (better than potentially empty backend overview)
    // We merge companies (loaded list) and top_companies (backend summary) to get the most complete picture available on client
    const derivedFitDistribution = useMemo(() => {
        const uniqueCompanies = new Map<string, MembershipRead>();

        // Add top companies first
        if (overview.top_companies) {
            overview.top_companies.forEach(c => uniqueCompanies.set(c.domain, c));
        }

        // Add loaded companies (may override top companies, or add new ones)
        if (companies.length > 0) {
            companies.forEach(c => {
                const existing = uniqueCompanies.get(c.domain);
                // Only overwrite if existing doesn't have a score, or if new one HAS a score
                // (We want to preserve the score if we have it from top_companies but not from the general list)
                if (!existing || (c.cached_fit_score !== null && c.cached_fit_score !== undefined)) {
                    uniqueCompanies.set(c.domain, c);
                } else if (existing && (existing.cached_fit_score === null || existing.cached_fit_score === undefined) && (c.cached_fit_score !== null && c.cached_fit_score !== undefined)) {
                    // This case is covered by first condition (c has score)
                    uniqueCompanies.set(c.domain, c);
                }
            });
        }

        // If searching/filtering, include dynamic companies too if they are mapped to format
        // This is crucial if 'Top Companies' card is showing dynamic companies (filtered/searched results)
        if (dynamicCompanies && dynamicCompanies.length > 0) {
            dynamicCompanies.forEach(c => {
                // Map CompanySummary or CompanySummaryWithFit to MembershipRead-like shape for score
                const score = 'combined_score' in c ? c.combined_score : ('likelihood_score' in c ? c.likelihood_score : null); // Type guard approximation

                // If it has a score, we want to include it, possibly overriding existing unscored
                if (score !== null && score !== undefined) {
                    // Create a partial MembershipRead for calculation purposes
                    const proxy: MembershipRead = {
                        id: c.id,
                        company_id: 0,
                        domain: c.domain,
                        company_name: c.name,
                        industry: c.industry,
                        employee_count: c.employee_count,
                        hq_country: c.hq_country,
                        segment: null,
                        cached_fit_score: score,
                        cached_likelihood_score: null,
                        cached_urgency_score: null,
                        is_processed: true,
                        notes: null,
                        priority: 0,
                        created_at: c.updated_at
                    };

                    const existing = uniqueCompanies.get(c.domain);
                    // Override if existing is null or unscored
                    if (!existing || existing.cached_fit_score === null || existing.cached_fit_score === undefined) {
                        uniqueCompanies.set(c.domain, proxy);
                    }
                }
            });
        }

        const mergedList = Array.from(uniqueCompanies.values());
        return calculateFitDistribution(mergedList);
    }, [companies, overview.top_companies, dynamicCompanies]);



    return (
        <div className="space-y-6">
            {/* Main content - Two column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column - Pipeline + Top Companies */}
                <div className="lg:col-span-2 space-y-6">
                    <PerformancePreviewCard />
                    {/*<OutreachPipelineCard pipeline={pipeline} onDrillDown={onDrillDown} />*/}
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
                        campaignSlug={campaignSlug}
                        onManagePartners={onManagePartners}
                        totalCompanyCount={overview.company_count}
                        companies={displayCompanies}
                    />
                    <NeedsAttentionCard
                        accounts={accountsNeedingAttention}
                        onCompanyClick={onCompanyClick}
                        onViewAll={onViewAllCompanies}
                    />
                    {/*<FitDistributionCard
                        fitDistribution={fitDistribution}
                        onDrillDown={onDrillDown}
                    />*/}
                </div>
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
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
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
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                            <div className={`h-4 w-36 rounded ${shimmer}`} />
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-700">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <CompanyRowCompactSkeleton key={i} showRank />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Partner overview skeleton */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
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
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
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
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
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
