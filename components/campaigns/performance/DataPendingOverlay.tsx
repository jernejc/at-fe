'use client';

import { Clock, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataPendingOverlayProps {
    /** Short message to display */
    message?: string;
    /** Additional description for tooltip  */
    description?: string;
    /** Whether to use compact styling */
    compact?: boolean;
    /** Additional classes */
    className?: string;
}

/**
 * Overlay component for sections where partner data is not yet available.
 * Displays a subtle message encouraging users to push partners to share data.
 */
export function DataPendingOverlay({
    message = 'Waiting for partners to share data',
    description = 'Push partners to share their performance metrics',
    compact = false,
    className,
}: DataPendingOverlayProps) {
    return (
        <div
            className={cn(
                'absolute inset-0 z-10 flex items-center justify-center',
                'bg-white/60 dark:bg-slate-900/60 backdrop-blur-[1px]',
                !className?.includes('rounded') && 'rounded-xl',
                className
            )}
            title={description}
        >
            <div className={cn(
                'flex items-center gap-2 rounded-lg',
                'bg-slate-100/95 dark:bg-slate-800/95',
                'border border-slate-200 dark:border-slate-700',
                'shadow-sm',
                compact ? 'px-2 py-1 gap-1.5' : 'px-4 py-2',
                compact ? 'text-[10px]' : 'text-sm'
            )}>
                <Clock className={cn(
                    'text-slate-400 dark:text-slate-500',
                    compact ? 'w-3 h-3' : 'w-4 h-4'
                )} />
                <span className="text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
                    {message}
                </span>
            </div>
        </div>
    );
}

/**
 * Wrapper that applies a grayed-out state to its children with the pending overlay.
 */
interface PendingDataWrapperProps {
    children: React.ReactNode;
    isPending?: boolean;
    message?: string;
    description?: string;
    compact?: boolean;
    className?: string;
}

export function PendingDataWrapper({
    children,
    isPending = true,
    message,
    description,
    compact,
    className,
}: PendingDataWrapperProps) {
    return (
        <div className={cn('relative', className)}>
            <div className={cn(isPending && 'opacity-50 pointer-events-none select-none')}>
                {children}
            </div>
            {isPending && <DataPendingOverlay message={message} description={description} compact={compact} />}
        </div>
    );
}
