'use client';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScoreBadge } from './ScoreBadge';
import { cn } from '@/lib/utils';
import { formatCompactNumber } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

// Unified account type for display
interface AccountItem {
    company_id: number;
    company_domain: string;
    company_name: string;
    industry: string | null;
    employee_count: number | null;
    hq_country: string | null;
    logo_url: string | null;
    combined_score: number | null;
    urgency_score: number | null;
    top_drivers: string[] | null;
    calculated_at: string | null;
    top_contact: {
        full_name: string;
        current_title: string | null;
        avatar_url: string | null;
    } | null;
}

interface AccountCardProps {
    account: AccountItem;
    selected?: boolean;
    onSelect?: (selected: boolean) => void;
    onClick?: () => void;
}

export function AccountCard({
    account,
    selected = false,
    onSelect,
    onClick,
}: AccountCardProps) {
    // Fit scores (may be null for "All Accounts" view)
    const hasScore = account.combined_score !== null;
    const fitScore = account.combined_score ?? 0;
    const urgencyScore = account.urgency_score ?? 0;
    const scorePercent = Math.round(fitScore * 100);

    // Format relative date
    const formatRelativeDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffHours < 1) return 'just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Get freshness color based on calculated_at
    const getFreshnessColor = (dateStr: string): string => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 1) return 'text-emerald-600 dark:text-emerald-400';
        if (diffDays < 7) return 'text-amber-600 dark:text-amber-400';
        return 'text-muted-foreground/60';
    };

    // Get company initials for fallback
    const companyInitials = account.company_name
        .split(' ')
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    // Get contact initials for fallback
    const contactInitials = account.top_contact?.full_name
        ? account.top_contact.full_name
            .split(' ')
            .map(w => w[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()
        : '';

    const lastUpdated = account.calculated_at ? formatRelativeDate(account.calculated_at) : null;
    const freshnessColor = account.calculated_at ? getFreshnessColor(account.calculated_at) : 'text-muted-foreground/40';

    return (
        <div
            className={cn(
                'group relative flex items-center gap-4 px-5 py-4 border-b border-border/50 cursor-pointer transition-all duration-200',
                'bg-white dark:bg-slate-900/40',
                'hover:bg-gradient-to-r hover:from-blue-50/50 hover:via-white hover:to-slate-50/30 dark:hover:from-blue-900/20 dark:hover:via-slate-900/60 dark:hover:to-slate-900/40',
                'hover:shadow-[0_2px_12px_-4px_rgba(0,0,0,0.1)] hover:z-10',
                selected && 'bg-blue-50/60 dark:bg-blue-900/20 border-l-2 border-l-blue-500'
            )}
            onClick={onClick}
        >
            {/* Selection Checkbox */}
            <div className="shrink-0 flex items-center justify-center">
                <input
                    type="checkbox"
                    checked={selected}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                        e.stopPropagation();
                        onSelect?.(e.target.checked);
                    }}
                    className={cn(
                        "w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500/30 focus:ring-offset-0 cursor-pointer transition-all duration-200",
                        selected ? "opacity-100 scale-100" : "opacity-0 group-hover:opacity-60 scale-90 group-hover:scale-100"
                    )}
                />
            </div>

            {/* Company Logo */}
            <div className="relative shrink-0 rounded-xl p-0.5 bg-white dark:bg-slate-800 shadow-sm border border-border/50">
                <Avatar className="w-12 h-12 rounded-lg after:hidden">
                    {account.logo_url && (
                        <AvatarImage
                            src={account.logo_url}
                            alt={account.company_name}
                            className="object-contain rounded-lg"
                        />
                    )}
                    <AvatarFallback className="rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 text-slate-600 dark:text-slate-300 font-bold text-xs">
                        {companyInitials}
                    </AvatarFallback>
                </Avatar>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0 flex flex-col gap-2">
                {/* Header Row */}
                <div>
                    <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-semibold text-base text-foreground truncate leading-tight transition-colors duration-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {account.company_name}
                        </h3>
                        {/* Urgency Pulse */}
                        {hasScore && urgencyScore >= 8 && (
                            <span className="relative flex h-2 w-2" title="High Intent">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-x-4 text-xs text-muted-foreground flex-wrap">
                        {account.industry && (
                            <span className="inline-flex items-center gap-1">
                                <svg className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <span className="truncate max-w-[180px] leading-none">{account.industry}</span>
                            </span>
                        )}
                        {account.hq_country && (
                            <span className="inline-flex items-center gap-1">
                                <svg className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="truncate max-w-[120px] leading-none">{account.hq_country}</span>
                            </span>
                        )}
                        {account.employee_count && (
                            <span className="inline-flex items-center gap-1">
                                <svg className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span className="leading-none">{formatCompactNumber(account.employee_count)} employees</span>
                            </span>
                        )}
                    </div>
                </div>

                {/* Status Pills Row */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    {/* Intent Badge */}
                    {hasScore && urgencyScore >= 8 && (
                        <Badge variant="secondary" className="gap-1 px-2 py-0.5 rounded-full bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-0 text-[10px] font-medium">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                            </span>
                            High Intent
                        </Badge>
                    )}
                    {hasScore && urgencyScore >= 5 && urgencyScore < 8 && (
                        <Badge variant="secondary" className="gap-1 px-2 py-0.5 rounded-full bg-amber-100/80 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-0 text-[10px] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Warming Up
                        </Badge>
                    )}

                    {/* Top Drivers */}
                    {account.top_drivers && account.top_drivers.length > 0 && (
                        account.top_drivers.slice(0, 2).map((driver, i) => (
                            <Badge
                                key={i}
                                variant="outline"
                                className="px-2 py-0.5 rounded-full bg-slate-50/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-slate-200/60 dark:border-slate-700/60 text-[10px] font-medium"
                            >
                                {driver}
                            </Badge>
                        ))
                    )}
                </div>
            </div>

            {/* Right Side: Contact + Score */}
            <div className="flex items-center gap-6 shrink-0">
                {/* Key Contact Preview (xl screens only) */}
                <div className="hidden xl:flex flex-col items-end gap-0.5 text-right min-w-[130px]">
                    <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider font-medium">Top Contact</span>
                    {account.top_contact ? (
                        <div className="flex items-center gap-2 justify-end p-1 rounded-lg transition-colors duration-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 -mr-1">
                            <div className="flex flex-col items-end">
                                <span className="text-xs font-medium text-foreground leading-none">{account.top_contact.full_name}</span>
                                <span className="text-[10px] text-muted-foreground/70 truncate max-w-[110px]">{account.top_contact.current_title}</span>
                            </div>
                            <Avatar className="w-7 h-7 border border-border/50">
                                {account.top_contact.avatar_url && <AvatarImage src={account.top_contact.avatar_url} />}
                                <AvatarFallback className="text-[9px] bg-slate-100 dark:bg-slate-800">{contactInitials}</AvatarFallback>
                            </Avatar>
                        </div>
                    ) : (
                        <span className="text-[10px] text-muted-foreground/30 italic">—</span>
                    )}
                </div>

                {/* Divider between contact and score */}
                {hasScore && <div className="hidden lg:block w-px h-12 bg-border/60" />}

                {/* Score - simple, clean presentation */}
                {hasScore && (
                    <div className="flex flex-col items-end gap-1 min-w-[70px]">
                        <ScoreBadge score={scorePercent} size="md" />
                        {lastUpdated && (
                            <span className={cn("flex items-center gap-1 text-[9px]", freshnessColor)}>
                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {lastUpdated}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Hover Arrow */}
            <div className="flex items-center self-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0">
                <div className="p-1.5 rounded-full text-muted-foreground/40 group-hover:text-blue-500 transition-colors duration-200">
                    <ChevronRight className="w-4 h-4" />
                </div>
            </div>
        </div>
    );
}

// Refined Skeleton
export function AccountCardSkeleton() {
    return (
        <div className="flex items-center gap-4 px-4 py-3.5 border-b border-border/30 animate-pulse">
            <div className="w-5 h-5 shrink-0" />
            <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-xl shrink-0" />
            <div className="flex-1 space-y-3">
                <div className="space-y-1.5">
                    <div className="w-40 h-5 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-md" />
                    <div className="w-56 h-3 bg-slate-100 dark:bg-slate-800 rounded opacity-60" />
                </div>
                <div className="flex gap-1.5">
                    <div className="w-20 h-5 bg-slate-100 dark:bg-slate-800 rounded-full" />
                    <div className="w-24 h-5 bg-slate-100 dark:bg-slate-800 rounded-full" />
                </div>
            </div>
        </div>
    );
}
