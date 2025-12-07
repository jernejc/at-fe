'use client';

import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface ScoreBadgeProps {
    score: number;
    showLabel?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function ScoreBadge({ score, showLabel = true, size = 'md', className }: ScoreBadgeProps) {
    const isHot = score >= 80;
    const isWarm = score >= 60 && score < 80;
    const label = isHot ? 'Hot' : isWarm ? 'Warm' : 'Cold';

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
    };

    const variantClasses = isHot
        ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
        : isWarm
            ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
            : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';

    return (
        <Badge
            className={cn(
                sizeClasses[size],
                variantClasses,
                isHot && 'score-hot',
                className
            )}
        >
            <span className="font-bold">{score}</span>
            {showLabel && <span className="ml-1 opacity-80">{label}</span>}
        </Badge>
    );
}

// Urgency Badge
interface UrgencyBadgeProps {
    urgency: 'immediate' | 'near-term' | 'future' | string;
    timeframe?: string;
    className?: string;
}

export function UrgencyBadge({ urgency, timeframe, className }: UrgencyBadgeProps) {
    const normalized = urgency.toLowerCase().replace(/[_\s]/g, '-');

    const config: Record<string, { classes: string; label: string }> = {
        'immediate': {
            classes: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400',
            label: 'Immediate'
        },
        'near-term': {
            classes: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400',
            label: 'Near-term'
        },
        'future': {
            classes: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400',
            label: 'Future'
        },
    };

    const { classes, label } = config[normalized] || { classes: config['future'].classes, label: urgency };

    return (
        <Badge className={cn('px-2 py-0.5 text-xs', classes, className)}>
            <span>{label}</span>
            {timeframe && <span className="ml-1 opacity-70">{timeframe}</span>}
        </Badge>
    );
}

// Signal Tag
interface SignalTagProps {
    children: React.ReactNode;
    variant?: 'growth' | 'technology' | 'critical' | 'default';
    className?: string;
}

export function SignalTag({ children, variant = 'default', className }: SignalTagProps) {
    const variants = {
        growth: 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400',
        technology: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400',
        critical: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400',
        default: 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400',
    };

    return (
        <Badge className={cn('px-2 py-0.5 text-xs font-normal', variants[variant], className)}>
            {children}
        </Badge>
    );
}
