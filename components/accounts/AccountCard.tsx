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
    signals?: string[];
    selected?: boolean;
    onSelect?: (selected: boolean) => void;
    onClick?: () => void;
}

export function AccountCard({
    company,
    playbook,
    keyContact,
    signals = [],
    selected = false,
    onSelect,
    onClick,
}: AccountCardProps) {
    const fitScore = playbook?.fit_score ?? 0;

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

    const lastActive = '2d ago'; // Mock data or derive from usage
    const hasSignals = signals && signals.length > 0;

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

                {/* Signals Row - The "Why" */}
                {hasSignals && (
                    <div className="flex flex-wrap gap-2">
                        {signals.slice(0, 3).map((signal, i) => (
                            <div key={i} className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-border/50 text-xs font-medium text-slate-700 dark:text-slate-300">
                                <span className={cn("w-1.5 h-1.5 rounded-full",
                                    i === 0 ? "bg-emerald-500" : "bg-blue-500"
                                )}></span>
                                {signal}
                            </div>
                        ))}
                        {signals.length > 3 && (
                            <span className="text-xs text-muted-foreground self-center">+{signals.length - 3} more</span>
                        )}
                    </div>
                )}
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
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <span>Updated {lastActive}</span>
                    </span>
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
