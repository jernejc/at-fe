'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { WSSearchPhase } from '@/lib/schemas';
import { Loader2 } from 'lucide-react';

interface SearchPhaseIndicatorProps {
    phase: WSSearchPhase;
    className?: string;
}

const phaseText: Record<string, string> = {
    connecting: 'Connecting...',
    interpreting: 'Thinking...',
    searching: 'Searching...',
    ranking: 'Ranking...',
    results: 'Loading...',
    suggesting: 'Finding partners...',
    partner_suggestion: 'Finding partners...',
    suggestions_complete: 'Finishing...',
    insights: 'Analyzing...',
    complete: 'Done',
    error: 'Error',
};

export function SearchPhaseIndicator({ phase, className }: SearchPhaseIndicatorProps) {
    if (phase === 'idle' || phase === 'complete') return null;

    const text = phaseText[phase] || 'Processing...';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn('flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500', className)}
        >
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>{text}</span>
        </motion.div>
    );
}

export function SearchPhaseDotsInline({ phase, className }: { phase: WSSearchPhase; className?: string }) {
    return <SearchPhaseIndicator phase={phase} className={className} />;
}
