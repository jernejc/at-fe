'use client';

import { cn } from '@/lib/utils';
import { PendingDataWrapper } from './performance/DataPendingOverlay';
import { LeadConversionFunnel } from './performance/LeadConversionFunnel';
import { PartnerPerformanceTable } from './performance/PartnerPerformanceTable';

interface PerformanceTabProps {
    /** Campaign slug for data fetching */
    campaignSlug: string;
    /** Number of partners in campaign */
    partnerCount?: number;
    /** Whether performance data is available from partners */
    hasData?: boolean;
    /** Additional classes */
    className?: string;
}

/**
 * Performance tab showing partner-shared performance metrics.
 * Displays lead conversion funnel and partner performance table.
 * When data is not available, shows grayed-out sample data with pending overlay.
 */
export function PerformanceTab({
    campaignSlug,
    partnerCount = 0,
    hasData = false,
    className,
}: PerformanceTabProps) {
    return (
        <div className={cn('space-y-6', className)}>
            {/* Lead Conversion Funnel */}
            <PendingDataWrapper isPending={!hasData}>
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
                    <LeadConversionFunnel hasData={hasData} />
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
            {/* Funnel skeleton */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className={cn('h-5 w-40 rounded', shimmer)} />
                    <div className="flex gap-3">
                        <div className={cn('h-4 w-24 rounded', shimmer)} />
                        <div className={cn('h-4 w-24 rounded', shimmer)} />
                    </div>
                </div>
                <div className="flex gap-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={cn('flex-1 h-24 rounded-lg', shimmer)} />
                    ))}
                </div>
            </div>

            {/* Table skeleton */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                    <div className={cn('h-5 w-48 rounded', shimmer)} />
                    <div className={cn('h-6 w-28 rounded-full', shimmer)} />
                </div>
                <div className="p-5 space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={cn('h-12 rounded', shimmer)} />
                    ))}
                </div>
            </div>
        </div>
    );
}
