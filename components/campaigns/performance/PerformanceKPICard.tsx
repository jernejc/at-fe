'use client';

import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PerformanceKPICardProps {
    /** Card title/label */
    title: string;
    /** Main value to display */
    value: string;
    /** Percentage change (positive or negative) */
    change?: number;
    /** Secondary label below the value */
    secondaryLabel?: string;
    /** Whether to show a progress bar */
    showProgress?: boolean;
    /** Progress percentage (0-100) */
    progressPercent?: number;
    /** Accent color variant */
    variant?: 'default' | 'primary';
    /** Additional classes */
    className?: string;
}

/**
 * Individual KPI card for the campaign header.
 * Displays a metric with optional change indicator, secondary label, and progress bar.
 */
export function PerformanceKPICard({
    title,
    value,
    change,
    secondaryLabel,
    showProgress = false,
    progressPercent = 0,
    variant = 'default',
    className,
}: PerformanceKPICardProps) {
    const isPositiveChange = change !== undefined && change >= 0;

    return (
        <div
            className={cn(
                'relative px-4 py-3 rounded-xl border transition-colors',
                variant === 'primary'
                    ? 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/50'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800',
                className
            )}
        >
            {/* Header with title and change badge */}
            <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {title}
                </span>
                {change !== undefined && (
                    <span
                        className={cn(
                            'inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded',
                            isPositiveChange
                                ? 'text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/40'
                                : 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/40'
                        )}
                    >
                        {isPositiveChange ? (
                            <TrendingUp className="w-2.5 h-2.5" />
                        ) : (
                            <TrendingDown className="w-2.5 h-2.5" />
                        )}
                        {isPositiveChange ? '+' : ''}{change.toFixed(1)}%
                    </span>
                )}
            </div>

            {/* Main value */}
            <div className={cn(
                'text-2xl font-bold tabular-nums',
                variant === 'primary'
                    ? 'text-blue-700 dark:text-blue-300'
                    : 'text-slate-900 dark:text-white'
            )}>
                {value}
            </div>

            {/* Progress bar */}
            {showProgress && (
                <div className="mt-2 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className={cn(
                            'h-full rounded-full transition-all',
                            variant === 'primary'
                                ? 'bg-blue-500 dark:bg-blue-400'
                                : 'bg-slate-400 dark:bg-slate-500'
                        )}
                        style={{ width: `${Math.min(progressPercent, 100)}%` }}
                    />
                </div>
            )}

            {/* Secondary label */}
            {secondaryLabel && (
                <div className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    {secondaryLabel}
                </div>
            )}
        </div>
    );
}
