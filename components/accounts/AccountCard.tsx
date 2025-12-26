'use client';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScoreBadge } from './ScoreBadge';
import { cn } from '@/lib/utils';
import { formatCompactNumber } from '@/lib/utils';

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

        if (diffDays < 1) return 'text-emerald-600 dark:text-emerald-400'; // Fresh
        if (diffDays < 7) return 'text-amber-600 dark:text-amber-400';    // Recent
        return 'text-muted-foreground';                                     // Stale
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
    const freshnessColor = account.calculated_at ? getFreshnessColor(account.calculated_at) : 'text-muted-foreground';

    return (
        <div
            className={cn(
                'group relative flex items-center gap-5 p-5 border-b border-border/40 cursor-pointer transition-all duration-200',
                'hover:bg-slate-50/80 dark:hover:bg-slate-900/40 hover:shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] hover:z-10',
                selected && 'bg-blue-50/40 dark:bg-blue-900/10'
            )}
            onClick={onClick}
        >
            {/* Selection Checkbox - Always present but subtle */}
            <div className="shrink-0 flex items-center justify-center pt-3">
                <input
                    type="checkbox"
                    checked={selected}
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                    onChange={(e) => {
                        e.stopPropagation();
                        onSelect?.(e.target.checked);
                    }}
                    className={cn(
                        "w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-opacity z-20",
                        selected ? "opacity-100" : "opacity-30 group-hover:opacity-100"
                    )}
                />
            </div>

            {/* Company Logo - Larger & Boxed */}
            <div className="relative shrink-0 rounded-xl p-0.5 bg-white dark:bg-slate-800 shadow-sm border border-border/60 mt-1">
                <Avatar className="w-14 h-14 rounded-lg after:hidden">
                    {account.logo_url && (
                        <AvatarImage
                            src={account.logo_url}
                            alt={account.company_name}
                            className="object-contain rounded-lg"
                        />
                    )}
                    <AvatarFallback className="rounded-lg bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300 font-bold text-sm">
                        {companyInitials}
                    </AvatarFallback>
                </Avatar>
            </div>

            {/* Main Content Info */}
            <div className="flex-1 min-w-0 flex flex-col gap-3">

                {/* Header Row: Name & Metadata */}
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-foreground truncate leading-tight group-hover:text-blue-600 transition-colors">
                            {account.company_name}
                        </h3>
                        {/* Urgency Dot if Hot */}
                        {hasScore && urgencyScore >= 8 && (
                            <span className="relative flex h-2.5 w-2.5" title="High Urgency">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-x-3 gap-y-1 text-sm text-muted-foreground flex-wrap leading-tight">
                        {account.industry && (
                            <span className="font-medium text-foreground/70 truncate max-w-[200px]">
                                {account.industry}
                            </span>
                        )}

                        {account.hq_country && (
                            <span className="flex items-center gap-1">
                                <span className="text-border/60">•</span>
                                <span className="truncate max-w-[150px]">{account.hq_country}</span>
                            </span>
                        )}

                        {account.employee_count && (
                            <span className="flex items-center gap-1">
                                <span className="text-border/60">•</span>
                                <span>{formatCompactNumber(account.employee_count)} employees</span>
                            </span>
                        )}
                    </div>
                </div>

                {/* Status Row - Urgency + Top Drivers */}
                <div className="flex flex-wrap items-center gap-3 text-xs">
                    {/* Urgency Indicator */}
                    {hasScore && urgencyScore >= 8 && (
                        <Badge variant="destructive" className="gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 hover:bg-emerald-200">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            High Intent
                        </Badge>
                    )}
                    {hasScore && urgencyScore >= 5 && urgencyScore < 8 && (
                        <Badge variant="secondary" className="gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 hover:bg-amber-200">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            Warming Up
                        </Badge>
                    )}

                    {/* Top Drivers as Pills */}
                    {account.top_drivers && account.top_drivers.length > 0 && (
                        account.top_drivers.slice(0, 3).map((driver, i) => (
                            <Badge key={i} variant="outline" className="px-2.5 py-1 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200">
                                {driver}
                            </Badge>
                        ))
                    )}
                </div>
            </div>

            {/* Right Side: Key Contact, Score & Timestamps */}
            <div className="flex items-start gap-8 shrink-0">

                {/* Key Contact Preview (if available) */}
                <div className="hidden xl:flex flex-col items-end gap-1 text-right min-w-[140px]">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Top Contact</span>
                    {account.top_contact ? (
                        <div className="flex items-center gap-2 justify-end group/contact p-1 rounded hover:bg-muted/50 transition-colors -mr-1">
                            <div className="flex flex-col items-end">
                                <span className="text-sm font-medium text-foreground leading-none">{account.top_contact.full_name}</span>
                                <span className="text-xs text-muted-foreground truncate max-w-[120px]">{account.top_contact.current_title}</span>
                            </div>
                            <Avatar className="w-8 h-8 border border-border">
                                {account.top_contact.avatar_url && <AvatarImage src={account.top_contact.avatar_url} />}
                                <AvatarFallback className="text-[10px]">{contactInitials}</AvatarFallback>
                            </Avatar>
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground/60 italic">None identified</div>
                    )}
                </div>

                {/* Vertical Divider */}
                <div className="hidden lg:block w-px h-12 bg-border/40 self-center" />

                {/* Score & Urgency */}
                <div className="flex flex-col items-end gap-1 min-w-[80px]">
                    {hasScore ? (
                        <>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Fit Score</span>
                            <ScoreBadge score={Math.round(fitScore * 100)} size="lg" className="text-base px-3 py-1" />
                        </>
                    ) : (
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                            No fit score
                        </span>
                    )}
                    {lastUpdated && (
                        <span className={cn("flex items-center gap-1 text-[10px]", freshnessColor)}>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{lastUpdated}</span>
                        </span>
                    )}
                </div>

                {/* Hover Action */}
                <div className="hidden sm:flex items-center self-center pl-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-foreground hover:text-blue-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

// Rich Skeleton
export function AccountCardSkeleton() {
    return (
        <div className="flex items-start gap-5 p-5 border-b border-border/40">
            <div className="w-5 h-5 mt-3 shrink-0" />
            <div className="w-14 h-14 bg-muted rounded-xl shrink-0 mt-1" />
            <div className="flex-1 space-y-4">
                <div className="space-y-2">
                    <div className="w-48 h-6 bg-muted rounded" />
                    <div className="w-64 h-4 bg-muted rounded opacity-60" />
                </div>
                <div className="flex gap-2">
                    <div className="w-24 h-6 bg-muted rounded-md" />
                    <div className="w-32 h-6 bg-muted rounded-md" />
                </div>
            </div>
            <div className="w-20 h-10 bg-muted rounded-lg shrink-0" />
        </div>
    );
}
