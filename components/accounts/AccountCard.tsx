'use client';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar';
import { ScoreBadge, UrgencyBadge, SignalTag } from './ScoreBadge';
import type { CompanySummary, PlaybookSummary, EmployeeSummary } from '@/lib/schemas';
import { cn } from '@/lib/utils';

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
    const urgency = playbook?.fit_urgency ?? 0;
    const urgencyLabel = urgency >= 8 ? 'immediate' : urgency >= 5 ? 'near-term' : 'future';
    const timeframe = urgency >= 8 ? '0-3months' : urgency >= 5 ? '3-6months' : '6months+';

    // Format employee count
    const employeeCount = company.employee_count
        ? company.employee_count >= 1000
            ? `${Math.floor(company.employee_count / 1000)}K`
            : company.employee_count.toString()
        : 'N/A';

    // Get company initials for fallback
    const companyInitials = company.name
        .split(' ')
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    // Get contact initials
    const contactInitials = keyContact?.full_name
        ?.split(' ')
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || '?';

    return (
        <div
            className={cn(
                'account-row flex items-center gap-4 px-4 py-3 border-b border-border cursor-pointer',
                'hover:bg-muted/50',
                selected && 'bg-primary/5'
            )}
            onClick={onClick}
        >
            {/* Checkbox */}
            <div className="flex-shrink-0">
                <input
                    type="checkbox"
                    checked={selected}
                    onChange={(e) => {
                        e.stopPropagation();
                        onSelect?.(e.target.checked);
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                />
            </div>

            {/* Company Logo */}
            <Avatar className="w-10 h-10 rounded-lg">
                {(company.logo_base64 || company.logo_url) && (
                    <AvatarImage
                        src={company.logo_base64
                            ? (company.logo_base64.startsWith('data:') ? company.logo_base64 : `data:image/png;base64,${company.logo_base64}`)
                            : company.logo_url!}
                        alt={company.name}
                    />
                )}
                <AvatarFallback className="rounded-lg bg-muted text-muted-foreground text-sm font-medium">
                    {companyInitials}
                </AvatarFallback>
            </Avatar>

            {/* Company Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground truncate">{company.name}</h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="truncate">{company.industry || 'Technology'}</span>
                    <span className="text-border">•</span>
                    <span>{company.hq_city || 'Unknown'}{company.hq_country && `, ${company.hq_country}`}</span>
                </div>
            </div>

            {/* Score with breakdown */}
            <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                <ScoreBadge score={Math.round(fitScore * 100)} size="lg" />
                <span className="text-[10px] text-muted-foreground">
                    Fit {Math.round(fitScore * 50)} Sig {Math.round(fitScore * 50)}
                </span>
            </div>

            {/* Key Contact */}
            <div className="flex items-center gap-2 min-w-[160px] flex-shrink-0">
                <Avatar className="w-8 h-8">
                    {keyContact?.avatar_url && <AvatarImage src={keyContact.avatar_url} alt={keyContact.full_name} />}
                    <AvatarFallback className="text-xs">{contactInitials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                        {keyContact?.full_name || 'No key contact'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                        {keyContact?.current_title || 'LinkedIn profile re...'}
                    </p>
                </div>
                {keyContact?.profile_url && (
                    <a
                        href={keyContact.profile_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-blue-500 hover:text-blue-600"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                    </a>
                )}
            </div>

            {/* Urgency/Timing */}
            <div className="flex-shrink-0 min-w-[100px]">
                <UrgencyBadge urgency={urgencyLabel} timeframe={timeframe} />
                <p className="text-xs text-muted-foreground mt-0.5">
                    ${employeeCount} • {company.rating_overall?.toFixed(1) || 'N/A'}
                </p>
            </div>

            {/* Top Signal */}
            <div className="flex-1 min-w-[200px] max-w-[300px]">
                <p className="text-sm text-foreground truncate">
                    {signals[0] || 'Recent funding round'}
                </p>
                <div className="flex gap-1 mt-1">
                    {signals.slice(1, 4).map((signal, i) => (
                        <SignalTag key={i} variant={i === 0 ? 'growth' : i === 1 ? 'critical' : 'default'}>
                            {signal}
                        </SignalTag>
                    ))}
                    {signals.length > 4 && (
                        <span className="text-xs text-muted-foreground">+{signals.length - 4} more</span>
                    )}
                </div>
            </div>

            {/* Actions */}
            <button
                onClick={(e) => e.stopPropagation()}
                className="p-2 hover:bg-muted rounded-md flex-shrink-0"
            >
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
            </button>
        </div>
    );
}

// Loading skeleton
export function AccountCardSkeleton() {
    return (
        <div className="flex items-center gap-4 px-4 py-3 border-b border-border animate-pulse">
            <div className="w-4 h-4 bg-muted rounded" />
            <div className="w-10 h-10 bg-muted rounded-lg" />
            <div className="flex-1 space-y-2">
                <div className="w-32 h-4 bg-muted rounded" />
                <div className="w-48 h-3 bg-muted rounded" />
            </div>
            <div className="w-16 h-7 bg-muted rounded-full" />
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-muted rounded-full" />
                <div className="space-y-1">
                    <div className="w-24 h-3 bg-muted rounded" />
                    <div className="w-20 h-2 bg-muted rounded" />
                </div>
            </div>
            <div className="w-20 h-6 bg-muted rounded-full" />
            <div className="flex-1 space-y-1">
                <div className="w-48 h-3 bg-muted rounded" />
                <div className="flex gap-1">
                    <div className="w-12 h-4 bg-muted rounded-full" />
                    <div className="w-14 h-4 bg-muted rounded-full" />
                </div>
            </div>
        </div>
    );
}
