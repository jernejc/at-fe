'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { WSSearchInsights, WSInterestFrequency } from '@/lib/schemas';
import { Lightbulb, Search, TrendingUp } from 'lucide-react';

interface SearchInsightsPanelProps {
    insights: WSSearchInsights | null;
    suggestedQueries?: string[];
    refinementTips?: string[];
    interestSummary?: WSInterestFrequency[];
    searchTimeMs?: number;
    totalResults?: number;
    onQueryClick?: (query: string) => void;
    className?: string;
}

export function SearchInsightsPanel({
    insights,
    suggestedQueries = [],
    refinementTips = [],
    interestSummary = [],
    searchTimeMs,
    totalResults,
    onQueryClick,
    className,
}: SearchInsightsPanelProps) {
    const hasObservation = insights?.observation;
    const hasInterests = interestSummary.length > 0;
    
    const allSuggestions = [...new Set([
        ...(insights?.suggested_queries || []),
        ...suggestedQueries,
    ])].slice(0, 4);

    const allTips = [...new Set([
        ...(insights?.refinement_tips || []),
        ...refinementTips,
    ])].slice(0, 3);

    const hasSuggestions = allSuggestions.length > 0;
    const hasTips = allTips.length > 0;

    if (!hasObservation && !hasSuggestions && !hasTips && !hasInterests) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={cn(
                'rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4 space-y-3',
                className
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <Lightbulb className="w-4 h-4 text-slate-500" />
                    Insights
                </div>
                {searchTimeMs !== undefined && (
                    <span className="text-xs text-slate-400">
                        {(searchTimeMs / 1000).toFixed(1)}s
                        {totalResults !== undefined && ` · ${totalResults} found`}
                    </span>
                )}
            </div>

            {/* Observation */}
            {hasObservation && (
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {insights.observation}
                </p>
            )}

            {/* Top Interests */}
            {hasInterests && (
                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <TrendingUp className="w-3 h-3" />
                        Common interests
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {interestSummary.slice(0, 5).map((interest) => (
                            <span
                                key={interest.interest}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs text-slate-600 dark:text-slate-400"
                            >
                                {interest.interest.replace(/_/g, ' ')}
                                <span className="text-slate-400 dark:text-slate-500">×{interest.frequency}</span>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Suggested Queries */}
            {hasSuggestions && (
                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Search className="w-3 h-3" />
                        Try also
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {allSuggestions.map((query) => (
                            <button
                                key={query}
                                onClick={() => onQueryClick?.(query)}
                                className="px-2 py-1 text-xs rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                            >
                                {query}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Tips */}
            {hasTips && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <ul className="space-y-1">
                        {allTips.map((tip) => (
                            <li
                                key={tip}
                                className="text-xs text-slate-500 dark:text-slate-500 pl-3 relative before:content-['·'] before:absolute before:left-0 before:text-slate-400"
                            >
                                {tip}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </motion.div>
    );
}

export function SearchInsightsInline({
    observation,
    suggestedQueries = [],
    onQueryClick,
    className,
}: {
    observation?: string;
    suggestedQueries?: string[];
    onQueryClick?: (query: string) => void;
    className?: string;
}) {
    if (!observation && suggestedQueries.length === 0) return null;

    return (
        <div className={cn('text-xs text-slate-500', className)}>
            {observation && <span>{observation.slice(0, 80)}...</span>}
            {suggestedQueries.length > 0 && (
                <span className="ml-2">
                    Try: {suggestedQueries.slice(0, 2).map((q, i) => (
                        <button
                            key={q}
                            onClick={() => onQueryClick?.(q)}
                            className="text-slate-600 dark:text-slate-400 hover:underline ml-1"
                        >
                            {q}{i < 1 && suggestedQueries.length > 1 ? ',' : ''}
                        </button>
                    ))}
                </span>
            )}
        </div>
    );
}
