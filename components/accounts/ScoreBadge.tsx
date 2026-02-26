'use client';

import { Badge } from '@/components/ui/badge';
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
    const variant = isHot ? 'green' : isWarm ? 'orange' : 'grey';

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
    };

    return (
        <Badge
            variant={variant}
            className={cn(
                sizeClasses[size],
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

    const config: Record<string, { variant: 'red' | 'orange' | 'grey'; label: string }> = {
        'immediate': { variant: 'red', label: 'Immediate' },
        'near-term': { variant: 'orange', label: 'Near-term' },
        'future': { variant: 'grey', label: 'Future' },
    };

    const { variant, label } = config[normalized] || { variant: 'grey' as const, label: urgency };

    return (
        <Badge variant={variant} className={cn('px-2 py-0.5 text-xs', className)}>
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

const signalVariantMap = {
    growth: 'green',
    technology: 'blue',
    critical: 'purple',
    default: 'grey',
} as const;

export function SignalTag({ children, variant = 'default', className }: SignalTagProps) {
    return (
        <Badge variant={signalVariantMap[variant]} className={cn('px-2 py-0.5 text-xs font-normal', className)}>
            {children}
        </Badge>
    );
}
