'use client';

import type { CampaignOverview, CampaignComparison } from '@/lib/schemas';
import { FunnelVisualization } from './FunnelVisualization';
import { Table2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalysisTabProps {
    slug: string;
    productId?: number;
    overview: CampaignOverview;
    comparison: CampaignComparison | null;
    onCompanyClick: (domain: string) => void;
}

// Color helper for fit scores
const getFitColor = (score: number | null) => {
    if (score === null) return 'bg-slate-100 dark:bg-slate-800 text-slate-500';
    const pct = score * 100;
    if (pct >= 80) return 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400';
    if (pct >= 60) return 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400';
    if (pct >= 40) return 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400';
    if (pct >= 20) return 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400';
    return 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400';
};

export function AnalysisTab({
    slug,
    productId,
    overview,
    comparison,
    onCompanyClick,
}: AnalysisTabProps) {
    return (
        <div className="space-y-6">
            {/* Campaign Funnel */}
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="font-medium text-sm text-slate-900 dark:text-white">Campaign Funnel</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Company progression through qualification stages
                    </p>
                </div>
                <div className="p-4">
                    <FunnelVisualization slug={slug} productId={productId} />
                </div>
            </div>

            {/* Company Comparison Table */}
            <CompanyComparisonCard
                comparison={comparison}
                onCompanyClick={onCompanyClick}
            />
        </div>
    );
}

// ============================================================================
// Company Comparison Card
// ============================================================================

function CompanyComparisonCard({
    comparison,
    onCompanyClick,
}: {
    comparison: CampaignComparison | null;
    onCompanyClick: (domain: string) => void;
}) {
    if (!comparison || comparison.companies.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="font-medium text-sm text-slate-900 dark:text-white">Company Analysis</h3>
                </div>
                <div className="p-6 text-center">
                    <Table2 className="w-6 h-6 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">No comparison data available</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Process companies to see insights</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-medium text-sm text-slate-900 dark:text-white">Company Analysis</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {comparison.companies.length} companies with fit scores and signals
                </p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Company</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Industry</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Size</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Fit</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Top Signals</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {comparison.companies.map((company, idx) => (
                            <tr
                                key={idx}
                                onClick={() => onCompanyClick(company.domain)}
                                className="hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer transition-colors"
                            >
                                <td className="px-4 py-3">
                                    <div className="font-medium text-slate-900 dark:text-white">{company.name || company.domain}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">{company.domain}</div>
                                </td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{company.industry || '—'}</td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-400 tabular-nums">
                                    {company.employee_count?.toLocaleString() || '—'}
                                </td>
                                <td className="px-4 py-3">
                                    {company.fit_score !== null ? (
                                        <span className={cn(
                                            "inline-flex px-2 py-0.5 rounded text-xs font-semibold",
                                            getFitColor(company.fit_score)
                                        )}>
                                            {Math.round(company.fit_score * 100)}%
                                        </span>
                                    ) : (
                                        <span className="text-slate-400">—</span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-wrap gap-1">
                                        {company.top_signals.slice(0, 2).map((signal, i) => (
                                            <span
                                                key={i}
                                                className="inline-block px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded"
                                            >
                                                {signal}
                                            </span>
                                        ))}
                                        {company.top_signals.length > 2 && (
                                            <span className="text-xs text-slate-400">+{company.top_signals.length - 2}</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ============================================================================
// Skeleton
// ============================================================================

const shimmer = "animate-pulse bg-slate-200 dark:bg-slate-700";

export function AnalysisTabSkeleton() {
    return (
        <div className="space-y-6">
            {/* Funnel skeleton */}
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <div className={`h-4 w-28 rounded ${shimmer}`} />
                </div>
                <div className="p-4">
                    <div className="flex gap-2">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className={`flex-1 h-16 rounded ${shimmer}`} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Table skeleton */}
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <div className={`h-4 w-32 rounded ${shimmer}`} />
                </div>
                <div className="p-4 space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex gap-4">
                            <div className={`h-10 w-32 rounded ${shimmer}`} />
                            <div className={`h-10 w-20 rounded ${shimmer}`} />
                            <div className={`h-10 w-16 rounded ${shimmer}`} />
                            <div className={`h-10 w-12 rounded ${shimmer}`} />
                            <div className={`h-10 flex-1 rounded ${shimmer}`} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
