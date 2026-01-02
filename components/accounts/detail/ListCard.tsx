'use client';

import { cn } from '@/lib/utils';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

interface ListCardProps {
    /** Content for the left date/info column */
    leftColumn?: React.ReactNode;
    /** Main card content */
    children: React.ReactNode;
    /** Icon to show on the right: arrow (internal), external (opens new tab), or none */
    rightIcon?: 'arrow' | 'external' | 'none';
    /** Click handler - if provided, card becomes clickable */
    onClick?: () => void;
    /** Additional CSS classes */
    className?: string;
}

/**
 * Generic clickable list card with optional left column and right icon.
 * Used for consistent card layouts across Jobs, Updates, News tabs.
 */
export function ListCard({
    leftColumn,
    children,
    rightIcon = 'arrow',
    onClick,
    className,
}: ListCardProps) {
    const isClickable = !!onClick;

    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all overflow-hidden bg-white dark:bg-slate-800",
                isClickable && "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50",
                className
            )}
        >
            <div className="flex">
                {/* Left Column */}
                {leftColumn && (
                    <div className="w-24 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center py-3 shrink-0">
                        <span className="text font-medium text-slate-500 dark:text-slate-400 text-center px-2">
                            {leftColumn}
                        </span>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex-1 px-4 py-3 min-w-0">
                    {children}
                </div>

                {/* Right Icon */}
                {rightIcon !== 'none' && (
                    <div className="flex items-center justify-center w-8 border-l border-slate-200 dark:border-slate-700">
                        {rightIcon === 'external' ? (
                            <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        ) : (
                            <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
