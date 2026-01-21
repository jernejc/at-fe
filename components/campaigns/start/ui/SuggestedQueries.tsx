'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface SuggestedQueriesProps {
    queries: string[];
    onClick: (query: string) => void;
    className?: string;
}

export function SuggestedQueries({ queries, onClick, className }: SuggestedQueriesProps) {
    if (queries.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn('flex-1 flex flex-col justify-end px-6', className)}
        >
            <div className="flex items-center gap-1.5 mb-2 text-xs text-slate-500 dark:text-slate-400">
                <Sparkles className="w-3 h-3" />
                <span>Suggested refinements</span>
            </div>
            <div className="flex flex-wrap gap-2">
                {queries.map((query, index) => (
                    <motion.button
                        key={query}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => onClick(query)}
                        className={cn(
                            'px-3 py-1.5 rounded-full text-sm font-medium',
                            'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
                            'text-slate-700 dark:text-slate-300',
                            'hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600',
                            'transition-colors cursor-pointer text-left'
                        )}
                    >
                        {query}
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
}
