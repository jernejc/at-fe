'use client';

import { cn } from '@/lib/utils';
import { RefreshCw, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PendingDataWrapper } from './performance/DataPendingOverlay';
import { LeadConversionFunnel } from './performance/LeadConversionFunnel';
import { PartnerPerformanceTable } from './performance/PartnerPerformanceTable';

interface PerformanceTabProps {
    campaignSlug: string;
    partnerCount?: number;
    hasData?: boolean;
    className?: string;
}

// KPI card data type
interface KpiCardData {
    label: string;
    value: string;
    change?: number;
    subtext?: string;
    highlight?: boolean;
}

// Sample KPI data
const SAMPLE_KPIS: KpiCardData[] = [
    { label: 'LEADS TOTAL', value: '1,240', change: 5.2, highlight: true },
    { label: 'LEADS ASSIGNED', value: '890', change: -2.1, subtext: '71.7% assignment rate' },
    { label: 'PIPELINE', value: '€4.2M', change: 12.4, subtext: 'Expected yield: €1.8M' },
    { label: 'CLOSED WON', value: '€1.1M', change: 8.7, subtext: '44% of total target' },
    { label: 'WIN RATE', value: '14%', change: 1.5, subtext: 'Industry avg: 12%' },
];

function KpiCard({ label, value, change, subtext, highlight }: KpiCardData) {
    const isPositive = change !== undefined && change >= 0;

    return (
        <div className={cn(
            'relative px-4 py-3 rounded-xl border transition-all',
            highlight
                ? 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/50'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
        )}>
            <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {label}
                </span>
                {change !== undefined && (
                    <span className={cn(
                        'inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded',
                        isPositive
                            ? 'text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/40'
                            : 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/40'
                    )}>
                        {isPositive ? '+' : ''}{change}%
                    </span>
                )}
            </div>
            <div className={cn(
                'text-2xl font-bold tabular-nums',
                highlight
                    ? 'text-blue-700 dark:text-blue-300'
                    : 'text-slate-900 dark:text-white'
            )}>
                {value}
            </div>
            {highlight && (
                <div className="mt-2 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500 dark:bg-blue-400" style={{ width: '72%' }} />
                </div>
            )}
            {!highlight && subtext && (
                <div className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    {subtext}
                </div>
            )}
        </div>
    );
}

/**
 * Performance tab showing partner-shared performance metrics.
 * Styled consistently with CompaniesTab and AnalysisTab.
 */
export function PerformanceTab({
    campaignSlug,
    partnerCount = 0,
    hasData = false,
    className,
}: PerformanceTabProps) {
    return (
        <div className={cn('space-y-6', className)}>
            {/* KPI Cards */}
            <PendingDataWrapper isPending={!hasData}>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {SAMPLE_KPIS.map((kpi, idx) => (
                        <KpiCard key={idx} {...kpi} />
                    ))}
                </div>
            </PendingDataWrapper>

            {/* Lead Conversion Funnel - matching AnalysisTab card style */}
            <PendingDataWrapper isPending={!hasData}>
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <div>
                            <h3 className="font-medium text-sm text-slate-900 dark:text-white">Lead Conversion Funnel</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Pipeline progression from contact to close
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
                                <RefreshCw className="w-3 h-3" />
                                Sync
                            </Button>
                            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
                                <SlidersHorizontal className="w-3 h-3" />
                                Filter
                            </Button>
                        </div>
                    </div>
                    <div className="p-4">
                        <LeadConversionFunnel hasData={hasData} />
                    </div>
                </div>
            </PendingDataWrapper>

            {/* Partner Performance Details */}
            <PendingDataWrapper isPending={!hasData}>
                <PartnerPerformanceTable />
            </PendingDataWrapper>
        </div>
    );
}

/**
 * Skeleton loader for the Performance tab.
 */
export function PerformanceTabSkeleton() {
    const shimmer = 'animate-pulse bg-slate-200 dark:bg-slate-700';

    return (
        <div className="space-y-6">
            {/* KPI skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                        <div className={cn('h-3 w-20 rounded mb-2', shimmer)} />
                        <div className={cn('h-7 w-16 rounded', shimmer)} />
                    </div>
                ))}
            </div>

            {/* Funnel skeleton - matching AnalysisTab */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                    <div className={cn('h-4 w-40 rounded', shimmer)} />
                </div>
                <div className="p-4">
                    <div className="flex gap-2">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className={cn('flex-1 h-20 rounded-lg', shimmer)} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Table skeleton */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                    <div className={cn('h-4 w-48 rounded', shimmer)} />
                </div>
                <div className="p-4 space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={cn('h-12 rounded', shimmer)} />
                    ))}
                </div>
            </div>
        </div>
    );
}
