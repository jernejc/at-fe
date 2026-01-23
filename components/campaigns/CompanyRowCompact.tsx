'use client';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn, formatCompactNumber } from '@/lib/utils';
import { OutreachStatus, OUTREACH_CONFIG } from '@/lib/config/outreach';
import { Building2, Users, MapPin, Clock, Target, ChevronRight } from 'lucide-react';
import type { WSTopInterest } from '@/lib/schemas';

export type { OutreachStatus };

export interface CompanyRowCompactProps {
    name: string;
    domain: string;
    logoUrl?: string | null;
    logoBase64?: string | null;
    industry?: string | null;
    employeeCount?: number | null;
    hqCountry?: string | null;
    segment?: string | null;
    partnerName?: string | null;
    partnerLogoUrl?: string | null;
    outreachStatus?: OutreachStatus;
    lastActivity?: string | null;
    decisionMakersCount?: number;
    rank?: number;
    fitScore?: number | null;
    signals?: WSTopInterest[];
    onClick?: () => void;
    className?: string;
    variant?: 'compact' | 'card';
}

export function CompanyRowCompact({
    name,
    domain,
    logoUrl,
    logoBase64,
    industry,
    employeeCount,
    hqCountry,
    segment,
    partnerName,
    partnerLogoUrl,
    outreachStatus,
    lastActivity,
    decisionMakersCount,
    rank,
    fitScore,
    signals,
    onClick,
    className,
    variant = 'compact',
}: CompanyRowCompactProps) {
    const companyInitials = name
        .split(' ')
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const logoSrc = logoBase64
        ? (logoBase64.startsWith('data:') ? logoBase64 : `data:image/png;base64,${logoBase64}`)
        : logoUrl;

    const hasMetadata = industry || employeeCount || hqCountry;

    const formatLastActivity = (dateStr?: string | null) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getFitTierStyle = (score: number | null) => {
        if (score === null) return 'bg-slate-100 dark:bg-slate-800 text-slate-500';
        if (score >= 80) return 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400';
        if (score >= 60) return 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
        if (score >= 40) return 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400';
        return 'bg-slate-100 dark:bg-slate-800 text-slate-500';
    };

    const getSignalStrengthStyle = (strength: number) => {
        const percent = strength * 10;
        if (percent >= 70) return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300';
        if (percent >= 40) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
    };

    const fitScorePercent = fitScore != null ? Math.round(fitScore * 100) : null;
    const formattedActivity = formatLastActivity(lastActivity);

    if (variant === 'card') {
        const statusConfig = outreachStatus ? OUTREACH_CONFIG[outreachStatus] : null;
        const StatusIcon = statusConfig?.icon;

        return (
            <button
                onClick={onClick}
                className={cn(
                    "w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all text-left group",
                    className
                )}
            >
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                        {logoSrc ? (
                            <img
                                src={logoSrc}
                                alt=""
                                className="w-8 h-8 object-contain"
                            />
                        ) : (
                            <img
                                src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
                                alt=""
                                className="w-7 h-7 object-contain"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                {name}
                            </span>
                            {statusConfig && StatusIcon && (
                                <div className={cn(
                                    "shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                                    statusConfig.bgColor,
                                    statusConfig.color
                                )}>
                                    <StatusIcon className="w-3 h-3" />
                                    {statusConfig.shortLabel}
                                </div>
                            )}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            {industry || 'Unknown Industry'}
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 dark:text-slate-500">
                            {employeeCount && (
                                <div className="flex items-center gap-1">
                                    <Users className="w-3.5 h-3.5" />
                                    <span>{employeeCount.toLocaleString()}</span>
                                </div>
                            )}
                            {hqCountry && (
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span>{hqCountry}</span>
                                </div>
                            )}
                            {formattedActivity && (
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{formattedActivity}</span>
                                </div>
                            )}
                            {decisionMakersCount !== undefined && (
                                <div className="flex items-center gap-1">
                                    <Target className="w-3.5 h-3.5" />
                                    <span>{decisionMakersCount} contacts</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <div className={cn(
                            "px-3 py-1.5 rounded-lg text-sm font-bold",
                            getFitTierStyle(fitScorePercent)
                        )}>
                            {fitScorePercent != null ? `${fitScorePercent}%` : '–'}
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                </div>
            </button>
        );
    }

    return (
        <div className={cn(
            "group px-4 py-3 transition-colors",
            "hover:bg-slate-50 dark:hover:bg-slate-800/50",
            "border-b border-slate-100 dark:border-slate-800 last:border-0",
            onClick && "cursor-pointer",
            className
        )} onClick={onClick}>
            <div
                className="flex items-center gap-3"
            >
                {rank !== undefined && (
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs shrink-0">
                        {rank}
                    </div>
                )}

                <div className="shrink-0">
                    <Avatar className="w-7 h-7 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 after:hidden">
                        {logoSrc && (
                            <AvatarImage
                                src={logoSrc}
                                alt={name}
                                className="object-contain rounded-md"
                            />
                        )}
                        <AvatarFallback className="rounded-md bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-400 text-[10px] font-semibold">
                            {companyInitials}
                        </AvatarFallback>
                    </Avatar>
                </div>

                <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm text-slate-900 dark:text-white truncate leading-tight group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                        {name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {domain}
                    </div>
                </div>

                {hasMetadata && (
                    <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 shrink-0">
                        {industry && (
                            <span className="flex items-center gap-1 max-w-[100px] truncate">
                                <Building2 className="w-3 h-3 shrink-0" />
                                <span className="truncate">{industry}</span>
                            </span>
                        )}
                        {employeeCount && (
                            <span className="flex items-center gap-1">
                                <Users className="w-3 h-3 shrink-0" />
                                {formatCompactNumber(employeeCount)}
                            </span>
                        )}
                        {hqCountry && (
                            <span className="flex items-center gap-1 max-w-[80px] truncate">
                                <MapPin className="w-3 h-3 shrink-0" />
                                <span className="truncate">{hqCountry}</span>
                            </span>
                        )}
                    </div>
                )}

                {segment && (
                    <span className="hidden md:inline-flex px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs font-medium shrink-0">
                        {segment}
                    </span>
                )}

                {partnerName && (
                    <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 shrink-0">
                        {partnerLogoUrl ? (
                            <img
                                src={partnerLogoUrl}
                                alt={partnerName}
                                className="w-4 h-4 rounded object-contain"
                            />
                        ) : (
                            <div className="w-4 h-4 rounded bg-blue-200 dark:bg-blue-800 flex items-center justify-center text-[8px] font-bold text-blue-600 dark:text-blue-300">
                                {partnerName.charAt(0)}
                            </div>
                        )}
                        <span className="text-xs font-medium text-blue-700 dark:text-blue-300 max-w-[80px] truncate">
                            {partnerName}
                        </span>
                    </div>
                )}

                {fitScore !== null && fitScore !== undefined && (
                    <div className="text-sm font-semibold text-slate-900 dark:text-white min-w-[40px] text-right shrink-0">
                        {Math.round(fitScore * 100)}%
                    </div>
                )}
            </div>

            {signals && signals.length > 0 && (
                <div className="hidden lg:flex items-center flex-wrap gap-1 shrink-0 mt-2 ml-10">
                    {signals.map((signal) => (
                        <div
                            key={signal.category}
                            className={cn(
                                "px-1.5 py-0.5 rounded text-[10px] flex gap-1",
                                getSignalStrengthStyle(signal.strength)
                            )}
                            title={`${signal.category}: ${Math.round(signal.strength * 10)}%`}
                        >
                            <span className='truncate max-w-[100px]'>{signal.category}</span>
                            <span className='font-semibold'>{Math.round(signal.strength * 10)}%</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export function CompanyRowCompactSkeleton({ showRank = false }: { showRank?: boolean }) {
    return (
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
            {showRank && <div className="w-7 h-7 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0" />}
            <div className="w-7 h-7 bg-slate-100 dark:bg-slate-800 rounded-md shrink-0" />
            <div className="flex-1 space-y-1.5">
                <div className="w-32 h-4 bg-slate-100 dark:bg-slate-800 rounded" />
                <div className="w-24 h-3 bg-slate-100 dark:bg-slate-800 rounded opacity-60" />
            </div>
            <div className="w-12 h-5 bg-slate-100 dark:bg-slate-800 rounded shrink-0" />
        </div>
    );
}
