'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { WSSearchInterpretation } from '@/lib/schemas';

interface InterpretationCardProps {
    interpretation: WSSearchInterpretation | null;
    className?: string;
}

export function InterpretationCard({ interpretation, className }: InterpretationCardProps) {
    // Only show keywords - the intent is redundant with the search query
    const hasKeywords = interpretation?.keywords && interpretation.keywords.length > 0;

    if (!hasKeywords) return null;

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key="keywords"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={cn('flex flex-wrap items-center gap-1.5', className)}
            >
                <span className="text-xs text-slate-400">Searching for:</span>
                {interpretation!.keywords.slice(0, 6).map((keyword) => (
                    <span
                        key={keyword}
                        className="inline-flex px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    >
                        {keyword}
                    </span>
                ))}
            </motion.div>
        </AnimatePresence>
    );
}
