'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { WSSearchInterpretation } from '@/lib/schemas';
import { Search } from 'lucide-react';

interface InterpretationCardProps {
    interpretation: WSSearchInterpretation | null;
    isLoading?: boolean;
    className?: string;
}

// Loading state - minimal inline dots
function InterpretationSkeleton({ className }: { className?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn('flex items-center gap-2', className)}
        >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500 dark:text-slate-400">Analyzing</span>
            <div className="flex items-center gap-0.5">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="w-1 h-1 rounded-full bg-slate-400"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.12,
                        }}
                    />
                ))}
            </div>
        </motion.div>
    );
}

export function InterpretationCard({ interpretation, isLoading, className }: InterpretationCardProps) {
    const hasKeywords = interpretation?.keywords && interpretation.keywords.length > 0;

    // Show minimal loading state
    if (isLoading && !hasKeywords) {
        return <InterpretationSkeleton className={className} />;
    }

    if (!hasKeywords) return null;

    // Just show keywords inline - clean and useful
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key="interpretation"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={cn('flex items-center gap-2 flex-wrap', className)}
            >
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Search className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                    {interpretation!.keywords.slice(0, 5).map((keyword, index) => (
                        <motion.span
                            key={keyword}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                                duration: 0.2,
                                delay: index * 0.04,
                                ease: [0.23, 1, 0.32, 1],
                            }}
                            className="px-2 py-0.5 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        >
                            {keyword}
                        </motion.span>
                    ))}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

// Alias for backwards compatibility
export const InterpretationInline = InterpretationCard;
