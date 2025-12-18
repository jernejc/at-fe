'use client';

import { cn } from '@/lib/utils';
import type { CampaignFilterUI } from '@/lib/schemas/campaign';
import { X } from 'lucide-react';

interface FilterPillProps {
    filter: CampaignFilterUI;
    onRemove: () => void;
    className?: string;
}

const FILTER_COLORS: Record<string, string> = {
    industry: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300',
    size_min: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
    size_max: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
    country: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300',
    domain_list: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
    natural_query: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

export function FilterPill({ filter, onRemove, className }: FilterPillProps) {
    const colorClasses = FILTER_COLORS[filter.type] || FILTER_COLORS.natural_query;

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium',
                'animate-in fade-in-50 slide-in-from-left-1 duration-150',
                colorClasses,
                className
            )}
        >
            <span className="max-w-[180px] truncate">{filter.displayLabel}</span>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                }}
                className="ml-0.5 p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                aria-label="Remove filter"
            >
                <X className="w-3 h-3" />
            </button>
        </span>
    );
}

export function FilterPillSkeleton() {
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 animate-pulse">
            <span className="w-16 h-3 rounded bg-slate-200 dark:bg-slate-700" />
        </span>
    );
}
