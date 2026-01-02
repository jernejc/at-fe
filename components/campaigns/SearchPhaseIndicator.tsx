'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { WSSearchPhase } from '@/lib/schemas';
import { useState, useEffect } from 'react';
import { 
    Wifi, 
    Brain, 
    Search, 
    BarChart3, 
    Download, 
    Users, 
    Lightbulb, 
    CheckCircle2, 
    AlertCircle 
} from 'lucide-react';

interface SearchPhaseIndicatorProps {
    phase: WSSearchPhase;
    className?: string;
    showElapsedTime?: boolean;
}

interface PhaseConfig {
    text: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    glowColor: string;
    progress: number; // 0-100 progress through the search
}

const phaseConfig: Record<string, PhaseConfig> = {
    connecting: { 
        text: 'Connecting', 
        icon: Wifi,
        color: 'text-slate-500 dark:text-slate-400',
        bgColor: 'bg-slate-100 dark:bg-slate-800',
        glowColor: 'shadow-slate-200/50 dark:shadow-slate-700/50',
        progress: 5,
    },
    interpreting: { 
        text: 'Understanding query', 
        icon: Brain,
        color: 'text-slate-600 dark:text-slate-400',
        bgColor: 'bg-slate-100 dark:bg-slate-800',
        glowColor: 'shadow-slate-200/50 dark:shadow-slate-700/50',
        progress: 15,
    },
    searching: { 
        text: 'Searching', 
        icon: Search,
        color: 'text-slate-600 dark:text-slate-400',
        bgColor: 'bg-slate-100 dark:bg-slate-800',
        glowColor: 'shadow-slate-200/50 dark:shadow-slate-700/50',
        progress: 35,
    },
    ranking: { 
        text: 'Ranking', 
        icon: BarChart3,
        color: 'text-slate-600 dark:text-slate-400',
        bgColor: 'bg-slate-100 dark:bg-slate-800',
        glowColor: 'shadow-slate-200/50 dark:shadow-slate-700/50',
        progress: 55,
    },
    results: { 
        text: 'Loading results', 
        icon: Download,
        color: 'text-slate-600 dark:text-slate-400',
        bgColor: 'bg-slate-100 dark:bg-slate-800',
        glowColor: 'shadow-slate-200/50 dark:shadow-slate-700/50',
        progress: 70,
    },
    suggesting: { 
        text: 'Finding partners', 
        icon: Users,
        color: 'text-emerald-600 dark:text-emerald-400',
        bgColor: 'bg-emerald-50 dark:bg-emerald-900/30',
        glowColor: 'shadow-emerald-300/50 dark:shadow-emerald-600/30',
        progress: 80,
    },
    partner_suggestion: { 
        text: 'Matching partners', 
        icon: Users,
        color: 'text-emerald-600 dark:text-emerald-400',
        bgColor: 'bg-emerald-50 dark:bg-emerald-900/30',
        glowColor: 'shadow-emerald-300/50 dark:shadow-emerald-600/30',
        progress: 85,
    },
    suggestions_complete: { 
        text: 'Finalizing', 
        icon: CheckCircle2,
        color: 'text-emerald-600 dark:text-emerald-400',
        bgColor: 'bg-emerald-50 dark:bg-emerald-900/30',
        glowColor: 'shadow-emerald-300/50 dark:shadow-emerald-600/30',
        progress: 92,
    },
    insights: { 
        text: 'Generating insights', 
        icon: Lightbulb,
        color: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-50 dark:bg-amber-900/30',
        glowColor: 'shadow-amber-300/50 dark:shadow-amber-600/30',
        progress: 95,
    },
    complete: { 
        text: 'Complete', 
        icon: CheckCircle2,
        color: 'text-emerald-600 dark:text-emerald-400',
        bgColor: 'bg-emerald-50 dark:bg-emerald-900/30',
        glowColor: 'shadow-emerald-300/50 dark:shadow-emerald-600/30',
        progress: 100,
    },
    error: { 
        text: 'Error', 
        icon: AlertCircle,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/30',
        glowColor: 'shadow-red-300/50 dark:shadow-red-600/30',
        progress: 0,
    },
};

const defaultConfig: PhaseConfig = {
    text: 'Processing',
    icon: Search,
    color: 'text-slate-500 dark:text-slate-400',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
    glowColor: 'shadow-slate-200/50 dark:shadow-slate-700/50',
    progress: 50,
};

export function SearchPhaseIndicator({ phase, className, showElapsedTime = false }: SearchPhaseIndicatorProps) {
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [startTime] = useState(Date.now());

    useEffect(() => {
        if (phase === 'idle' || phase === 'complete' || phase === 'error') {
            return;
        }

        const interval = setInterval(() => {
            setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);

        return () => clearInterval(interval);
    }, [phase, startTime]);

    if (phase === 'idle') return null;

    const config = phaseConfig[phase] || defaultConfig;
    const Icon = config.icon;
    const isComplete = phase === 'complete';
    const isError = phase === 'error';

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={phase}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                className={cn('flex items-center gap-2', className)}
            >
                {/* Icon with glow effect */}
                <motion.div
                    className={cn(
                        'relative flex items-center justify-center w-5 h-5 rounded-md',
                        config.bgColor,
                        !isComplete && !isError && 'shadow-sm',
                        !isComplete && !isError && config.glowColor
                    )}
                    animate={!isComplete && !isError ? {
                        boxShadow: [
                            '0 0 0 0 rgba(0,0,0,0)',
                            '0 0 8px 2px rgba(99, 102, 241, 0.15)',
                            '0 0 0 0 rgba(0,0,0,0)',
                        ],
                    } : undefined}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                >
                    <motion.div
                        animate={!isComplete && !isError ? { rotate: [0, 5, -5, 0] } : undefined}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <Icon className={cn('w-3 h-3', config.color)} />
                    </motion.div>
                </motion.div>

                {/* Text */}
                <span className={cn('text-xs font-medium', config.color)}>
                    {config.text}
                </span>

                {/* Elapsed time */}
                {showElapsedTime && elapsedSeconds >= 2 && !isComplete && !isError && (
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[10px] text-slate-400 dark:text-slate-500 tabular-nums"
                    >
                        {elapsedSeconds}s
                    </motion.span>
                )}

                {/* Progress sweep indicator */}
                {!isComplete && !isError && (
                    <div className="flex items-center gap-0.5 ml-1">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className={cn('w-1 h-1 rounded-full', config.color.replace('text-', 'bg-'))}
                                animate={{
                                    opacity: [0.3, 1, 0.3],
                                    scale: [0.8, 1, 0.8],
                                }}
                                transition={{
                                    duration: 0.8,
                                    repeat: Infinity,
                                    delay: i * 0.15,
                                    ease: 'easeInOut',
                                }}
                            />
                        ))}
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}

// Full-width progress bar variant for prominent display
export function SearchPhaseProgressBar({ 
    phase, 
    className 
}: { 
    phase: WSSearchPhase; 
    className?: string;
}) {
    if (phase === 'idle') return null;

    const config = phaseConfig[phase] || defaultConfig;
    const Icon = config.icon;
    const isComplete = phase === 'complete';
    const isError = phase === 'error';

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className={cn('overflow-hidden', className)}
        >
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                {/* Icon */}
                <motion.div
                    className={cn(
                        'flex items-center justify-center w-6 h-6 rounded-md',
                        config.bgColor
                    )}
                    animate={!isComplete && !isError ? {
                        scale: [1, 1.05, 1],
                    } : undefined}
                    transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                >
                    <Icon className={cn('w-3.5 h-3.5', config.color)} />
                </motion.div>

                {/* Text and progress */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <span className={cn('text-xs font-medium', config.color)}>
                            {config.text}
                        </span>
                        {!isComplete && !isError && (
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                {config.progress}%
                            </span>
                        )}
                    </div>

                    {/* Progress bar */}
                    <div className="h-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <motion.div
                            className={cn(
                                'h-full rounded-full',
                                isError ? 'bg-red-500' : 'bg-gradient-to-r from-slate-400 via-slate-500 to-emerald-500'
                            )}
                            initial={{ width: 0 }}
                            animate={{ width: `${config.progress}%` }}
                            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                        />
                        {/* Shimmer effect */}
                        {!isComplete && !isError && (
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                animate={{ x: ['-100%', '100%'] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// Compact inline version - minimal dots
export function SearchPhaseDotsInline({ phase, className }: { phase: WSSearchPhase; className?: string }) {
    if (phase === 'idle' || phase === 'complete') return null;

    const config = phaseConfig[phase] || defaultConfig;

    return (
        <div className={cn('flex items-center gap-0.5', className)}>
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className={cn('w-1 h-1 rounded-full', config.color.replace('text-', 'bg-'))}
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.4, 1, 0.4],
                    }}
                    transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.1,
                        ease: 'easeInOut',
                    }}
                />
            ))}
        </div>
    );
}
