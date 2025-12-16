'use client';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar';
import { ScoreBadge } from './ScoreBadge';
import type { CompanySummary, PlaybookSummary, EmployeeSummary } from '@/lib/schemas';
import { cn } from '@/lib/utils';
import { MetricPill } from './detail/components';
import { formatCompactNumber } from './detail/utils';

interface AccountCardProps {
    company: CompanySummary;
    playbook?: PlaybookSummary;
    keyContact?: EmployeeSummary;
    selected?: boolean;
    onSelect?: (selected: boolean) => void;
    onClick?: () => void;
}

export function AccountCard({
    company,
    playbook,
    keyContact,
    selected = false,
    onSelect,
    onClick,
}: AccountCardProps) {
    const fitScore = playbook?.fit_score ?? 0;
    const fitUrgency = playbook?.fit_urgency ?? 0;
    const contactsCount = playbook?.contacts_count ?? 0;

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

    // Get freshness color based on updated_at
    const getFreshnessColor = (dateStr: string): string => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 1) return 'text-emerald-600 dark:text-emerald-400'; // Fresh
        if (diffDays < 7) return 'text-amber-600 dark:text-amber-400';    // Recent
        return 'text-muted-foreground';                                     // Stale
    };

    // Get company initials for fallback
    const companyInitials = company.name
        .split(' ')
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    // Get key contact initials for fallback
    const contactInitials = keyContact?.full_name
        ? keyContact.full_name
            .split(' ')
            .map(w => w[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()
        : '';

    // Calculate company maturity/location for display
    const location = company.hq_city ? `${company.hq_city}${company.hq_country ? `, ${company.hq_country}` : ''}` : null;

    const lastUpdated = company.updated_at ? formatRelativeDate(company.updated_at) : null;
    const freshnessColor = company.updated_at ? getFreshnessColor(company.updated_at) : 'text-muted-foreground';
    const hasPlaybook = playbook !== undefined;

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
                <Avatar className="w-14 h-14 rounded-lg">
                    {(company.logo_base64 || company.logo_url) && (
                        <AvatarImage
                            src={company.logo_base64
                                ? (company.logo_base64.startsWith('data:') ? company.logo_base64 : `data:image/png;base64,${company.logo_base64}`)
                                : company.logo_url!}
                            alt={company.name}
                            className="object-contain"
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
                            {company.name}
                        </h3>
                        {/* Urgency Dot if Hot */}
                        {(playbook?.fit_urgency || 0) >= 8 && (
                            <span className="relative flex h-2.5 w-2.5" title="High Urgency">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-x-3 gap-y-1 text-sm text-muted-foreground flex-wrap leading-tight">
                        {company.industry && (
                            <span className="font-medium text-foreground/70 truncate max-w-[200px]">
                                {company.industry}
                            </span>
                        )}

                        {location && (
                            <span className="flex items-center gap-1">
                                <span className="text-border/60">•</span>
                                <span className="truncate max-w-[150px]">{location}</span>
                            </span>
                        )}

                        {company.employee_count && (
                            <span className="flex items-center gap-1">
                                <span className="text-border/60">•</span>
                                <span>{formatCompactNumber(company.employee_count)} employees</span>
                            </span>
                        )}
                    </div>
                </div>

                {/* Playbook Status Row - Real Data */}
                <div className="flex flex-wrap items-center gap-3 text-xs">
                    {/* Urgency Indicator */}
                    {fitUrgency >= 8 && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            High Intent
                        </span>
                    )}
                    {fitUrgency >= 5 && fitUrgency < 8 && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            Warming Up
                        </span>
                    )}

                    {/* Contacts Ready */}
                    {hasPlaybook && contactsCount > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {contactsCount} contact{contactsCount !== 1 ? 's' : ''} ready
                        </span>
                    )}

                    {/* Playbook Badge */}
                    {hasPlaybook && contactsCount === 0 && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Playbook ready
                        </span>
                    )}
                </div>
            </div>

            {/* Right Side: Key Contact & Score */}
            <div className="flex items-start gap-8 shrink-0">

                {/* Key Contact Preview (if available) */}
                <div className="hidden xl:flex flex-col items-end gap-1 text-right min-w-[140px]">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Top Contact</span>
                    {keyContact ? (
                        <div className="flex items-center gap-2 justify-end group/contact p-1 rounded hover:bg-muted/50 transition-colors -mr-1">
                            <div className="flex flex-col items-end">
                                <span className="text-sm font-medium text-foreground leading-none">{keyContact.full_name}</span>
                                <span className="text-xs text-muted-foreground truncate max-w-[120px]">{keyContact.current_title}</span>
                            </div>
                            <Avatar className="w-8 h-8 border border-border">
                                {keyContact.avatar_url && <AvatarImage src={keyContact.avatar_url} />}
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
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Fit Score</span>
                    <ScoreBadge score={Math.round(fitScore * 100)} size="lg" className="text-base px-3 py-1" />
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
