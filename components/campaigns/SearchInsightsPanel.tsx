'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { WSSearchInsights, WSInterestFrequency } from '@/lib/schemas';
import { 
    Lightbulb, 
    ArrowRight, 
    Search, 
    TrendingUp, 
    Clock, 
    Sparkles,
    ChevronRight
} from 'lucide-react';

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

// Search stats badge
function SearchStatsBadge({ 
    totalResults, 
    searchTimeMs 
}: { 
    totalResults?: number; 
    searchTimeMs?: number;
}) {
    if (totalResults === undefined && searchTimeMs === undefined) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-100/80 dark:bg-slate-800/60 text-xs"
        >
            {totalResults !== undefined && (
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                    <TrendingUp className="w-3 h-3" />
                    <span className="font-medium">{totalResults.toLocaleString()}</span>
                    <span className="text-slate-400 dark:text-slate-500">found</span>
                </span>
            )}
            {searchTimeMs !== undefined && totalResults !== undefined && (
                <span className="text-slate-300 dark:text-slate-600">•</span>
            )}
            {searchTimeMs !== undefined && (
                <span className="flex items-center gap-1 text-slate-500 dark:text-slate-500 tabular-nums">
                    <Clock className="w-3 h-3" />
                    {(searchTimeMs / 1000).toFixed(1)}s
                </span>
            )}
        </motion.div>
    );
}

// Interest pill with frequency indicator
function InterestPill({ 
    interest, 
    frequency, 
    index 
}: { 
    interest: string; 
    frequency: number;
    index: number;
}) {
    // Normalize frequency for visual weight (assuming max around 10)
    const normalizedWeight = Math.min(frequency / 8, 1);
    
    return (
        <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + index * 0.04, ease: [0.23, 1, 0.32, 1] }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 text-xs"
        >
            <span className="text-slate-700 dark:text-slate-300 capitalize">
                {interest.replace(/_/g, ' ')}
            </span>
            {/* Frequency indicator dots */}
            <span className="flex items-center gap-0.5">
                {[0, 1, 2].map((i) => (
                    <span
                        key={i}
                        className={cn(
                            'w-1 h-1 rounded-full transition-colors',
                            i <= normalizedWeight * 2 
                                ? 'bg-emerald-400 dark:bg-emerald-500' 
                                : 'bg-slate-200 dark:bg-slate-700'
                        )}
                    />
                ))}
            </span>
        </motion.span>
    );
}

// Search suggestion chip
function SuggestionChip({ 
    query, 
    index, 
    onClick 
}: { 
    query: string; 
    index: number;
    onClick?: () => void;
}) {
    return (
        <motion.button
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.06, ease: [0.23, 1, 0.32, 1] }}
            whileHover={{ scale: 1.02, x: 2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={cn(
                'group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium',
                'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
                'text-slate-600 dark:text-slate-300',
                'hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-800 dark:hover:text-slate-200',
                'hover:shadow-sm transition-all duration-200'
            )}
        >
            <Search className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
            <span>{query}</span>
            <ArrowRight className="w-3 h-3 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
        </motion.button>
    );
}

// Tip item with icon
function TipItem({ tip, index }: { tip: string; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 + index * 0.05 }}
            className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400"
        >
            <div className="flex items-center justify-center w-4 h-4 rounded bg-amber-50 dark:bg-amber-900/20 shrink-0 mt-0.5">
                <Lightbulb className="w-2.5 h-2.5 text-amber-500 dark:text-amber-400" />
            </div>
            <span className="leading-relaxed">{tip}</span>
        </motion.div>
    );
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
    ])].slice(0, 3);

    const allTips = [...new Set([
        ...(insights?.refinement_tips || []),
        ...refinementTips,
    ])].slice(0, 2);

    const hasSuggestions = allSuggestions.length > 0;
    const hasTips = allTips.length > 0;

    if (!hasObservation && !hasSuggestions && !hasTips && !hasInterests) {
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className={cn(
                    'relative rounded-xl border border-slate-200/80 dark:border-slate-700/50',
                    'bg-gradient-to-br from-slate-50/50 to-white dark:from-slate-800/20 dark:to-slate-900/30',
                    'backdrop-blur-sm p-4 space-y-4 overflow-hidden',
                    className
                )}
            >
                {/* Subtle top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-300/40 dark:via-amber-500/20 to-transparent" />

                {/* Header with stats */}
                <div className="flex items-center justify-between gap-3">
                    <motion.div 
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2"
                    >
                        <div className="flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/40 dark:to-amber-800/20">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            Search Insights
                        </span>
                    </motion.div>

                    <SearchStatsBadge totalResults={totalResults} searchTimeMs={searchTimeMs} />
                </div>

                {/* Main observation */}
                {hasObservation && (
                    <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="rounded-lg bg-white/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/30 p-3"
                    >
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            {insights!.observation}
                        </p>
                    </motion.div>
                )}

                {/* Top Interests */}
                {hasInterests && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.15 }}
                        className="space-y-2"
                    >
                        <div className="flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                Common Interests
                            </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            {interestSummary.slice(0, 5).map((interest, index) => (
                                <InterestPill
                                    key={interest.interest}
                                    interest={interest.interest}
                                    frequency={interest.frequency}
                                    index={index}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Suggested Queries */}
                {hasSuggestions && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-2"
                    >
                        <div className="flex items-center gap-1.5">
                            <Search className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                Try Also
                            </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            {allSuggestions.map((query, index) => (
                                <SuggestionChip
                                    key={query}
                                    query={query}
                                    index={index}
                                    onClick={() => onQueryClick?.(query)}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Tips */}
                {hasTips && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.25 }}
                        className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-700/50"
                    >
                        {allTips.map((tip, index) => (
                            <TipItem key={index} tip={tip} index={index} />
                        ))}
                    </motion.div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}

// Compact inline version for tighter spaces
export function SearchInsightsInline({
    observation,
    suggestedQueries = [],
    totalResults,
    searchTimeMs,
    onQueryClick,
    className,
}: {
    observation?: string;
    suggestedQueries?: string[];
    totalResults?: number;
    searchTimeMs?: number;
    onQueryClick?: (query: string) => void;
    className?: string;
}) {
    if (!observation && suggestedQueries.length === 0 && totalResults === undefined) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn('flex items-center gap-3 flex-wrap text-xs', className)}
        >
            {/* Stats */}
            {totalResults !== undefined && (
                <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                        {totalResults.toLocaleString()}
                    </span>
                    results
                    {searchTimeMs !== undefined && (
                        <span className="text-slate-400 dark:text-slate-500 ml-1">
                            ({(searchTimeMs / 1000).toFixed(1)}s)
                        </span>
                    )}
                </span>
            )}

            {/* Suggested queries */}
            {suggestedQueries.length > 0 && (
                <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 dark:text-slate-500">Also try:</span>
                    {suggestedQueries.slice(0, 2).map((q, i) => (
                        <button
                            key={q}
                            onClick={() => onQueryClick?.(q)}
                            className="group inline-flex items-center gap-0.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                        >
                            {q}
                            <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
