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
                "group relative bg-card rounded-md border border-border hover:border-slate-300 dark:hover:border-slate-700 transition-all overflow-hidden",
                isClickable && "cursor-pointer hover:shadow-sm",
                className
            )}
        >
            <div className="flex">
                {/* Left Column */}
                {leftColumn && (
                    <div className="w-24 border-r border-border bg-muted/5 flex items-center justify-center py-3 shrink-0">
                        <span className="text font-medium text-muted-foreground text-center px-2">
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
                    <div className="flex items-center justify-center w-8 border-l border-border bg-card">
                        {rightIcon === 'external' ? (
                            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        ) : (
                            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
