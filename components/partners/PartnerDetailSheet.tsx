'use client';

import { useState, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Partner, MembershipWithProgress, OutreachStatus } from '@/lib/schemas/campaign';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    Building2,
    Users,
    TrendingUp,
    Mail,
    Clock,
    MessageSquare,
    CalendarCheck,
    FileEdit,
    ChevronRight,
    Zap,
    Briefcase,
    Globe,
    Target,
    Send,
    Layers,
} from 'lucide-react';

interface PartnerDetailSheetProps {
    partner: Partner | null;
    open: boolean;
    onClose: () => void;
    assignedCompanies: MembershipWithProgress[];
    onCompanyClick: (domain: string) => void;
}

// Outreach status config
const OUTREACH_CONFIG: Record<OutreachStatus, { label: string; shortLabel: string; icon: React.ElementType; color: string; bgColor: string }> = {
    not_started: { label: 'Not Started', shortLabel: 'Pending', icon: Clock, color: 'text-slate-400', bgColor: 'bg-slate-100 dark:bg-slate-800' },
    draft: { label: 'Draft', shortLabel: 'Draft', icon: FileEdit, color: 'text-amber-500', bgColor: 'bg-amber-50 dark:bg-amber-900/20' },
    sent: { label: 'Sent', shortLabel: 'Sent', icon: Send, color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
    replied: { label: 'Replied', shortLabel: 'Replied', icon: MessageSquare, color: 'text-emerald-500', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20' },
    meeting_booked: { label: 'Meeting', shortLabel: 'Meeting', icon: CalendarCheck, color: 'text-violet-500', bgColor: 'bg-violet-50 dark:bg-violet-900/20' },
};

export function PartnerDetailSheet({
    partner,
    open,
    onClose,
    assignedCompanies,
    onCompanyClick
}: PartnerDetailSheetProps) {
    const [statusFilter, setStatusFilter] = useState<OutreachStatus | 'all'>('all');

    // Calculate metrics
    const metrics = useMemo(() => {
        if (!assignedCompanies.length) return null;

        const avgFitScore = assignedCompanies.reduce((sum, c) => sum + (c.cached_fit_score ?? 0), 0) / assignedCompanies.length;
        const totalDecisionMakers = assignedCompanies.reduce((sum, c) => sum + c.decision_makers_count, 0);

        const statusCounts = assignedCompanies.reduce((acc, c) => {
            acc[c.outreach_status] = (acc[c.outreach_status] || 0) + 1;
            return acc;
        }, {} as Record<OutreachStatus, number>);

        const engagedCount = (statusCounts.replied || 0) + (statusCounts.meeting_booked || 0);

        // Get unique industries
        const industries = [...new Set(assignedCompanies.map(c => c.industry).filter(Boolean))] as string[];

        return {
            avgFitScore,
            totalDecisionMakers,
            statusCounts,
            engagedCount,
            industries,
        };
    }, [assignedCompanies]);

    // Filtered companies
    const filteredCompanies = useMemo(() => {
        if (statusFilter === 'all') return assignedCompanies;
        return assignedCompanies.filter(c => c.outreach_status === statusFilter);
    }, [assignedCompanies, statusFilter]);

    // Partner type icon
    const getTypeIcon = (type: Partner['type']) => {
        switch (type) {
            case 'agency': return Zap;
            case 'technology': return Building2;
            case 'consulting': return Briefcase;
            case 'reseller': return Globe;
            default: return Building2;
        }
    };

    if (!partner) return null;

    const TypeIcon = getTypeIcon(partner.type);
    const capacity = partner.capacity ?? 10;
    const assigned = assignedCompanies.length;
    const utilizationPercent = Math.min((assigned / capacity) * 100, 100);

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent
                side="bottom"
                className="h-[85vh] p-0 flex flex-col bg-background border-t border-border shadow-2xl transition-all duration-500 ease-in-out gap-0 rounded-t-xl"
            >
                <SheetHeader className="sr-only">
                    <SheetTitle>{partner.name} Details</SheetTitle>
                </SheetHeader>

                {/* Header */}
                <div className="relative overflow-hidden border-b border-border/60 bg-white dark:bg-slate-900 shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-50/80 via-white/50 to-blue-50/30 dark:from-slate-900/80 dark:via-slate-900/50 dark:to-blue-900/10 pointer-events-none" />

                    <div className="relative px-6 py-5 pr-14">
                        {/* Main info row */}
                        <div className="flex gap-4 items-center">
                            {/* Logo */}
                            {partner.logo_url ? (
                                <div className="w-11 h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white flex items-center justify-center overflow-hidden shrink-0">
                                    <img
                                        src={partner.logo_url}
                                        alt={partner.name}
                                        className="w-7 h-7 object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                                    <TypeIcon className="w-5 h-5 text-slate-400" />
                                </div>
                            )}

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2.5">
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                                        {partner.name}
                                    </h2>
                                    <Badge variant="secondary" className="capitalize text-xs">
                                        {partner.type}
                                    </Badge>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                    {partner.description}
                                </p>
                                {/* Industry Tags */}
                                {metrics && metrics.industries.length > 0 && (
                                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                        {metrics.industries.slice(0, 4).map((industry) => (
                                            <Badge key={industry} variant="outline" className="text-xs font-normal">
                                                {industry}
                                            </Badge>
                                        ))}
                                        {metrics.industries.length > 4 && (
                                            <Badge variant="outline" className="text-xs font-normal text-slate-400">
                                                +{metrics.industries.length - 4} more
                                            </Badge>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Stats Row - moved below for better layout */}
                        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <Users className="w-4 h-4 text-slate-500" />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                                        {assigned} <span className="text-slate-400 font-normal">/ {capacity}</span>
                                    </div>
                                    <div className="text-xs text-slate-500">Assigned</div>
                                </div>
                            </div>
                            {metrics && (
                                <>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                                            <Target className="w-4 h-4 text-emerald-500" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-slate-900 dark:text-white">
                                                {Math.round(metrics.avgFitScore * 100)}%
                                            </div>
                                            <div className="text-xs text-slate-500">Avg Fit</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                            <TrendingUp className="w-4 h-4 text-blue-500" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-slate-900 dark:text-white">
                                                {metrics.engagedCount}
                                            </div>
                                            <div className="text-xs text-slate-500">Engaged</div>
                                        </div>
                                    </div>
                                </>
                            )}
                            {/* Capacity bar - inline */}
                            <div className="flex-1 ml-auto max-w-[200px]">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-slate-500">Capacity</span>
                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{Math.round(utilizationPercent)}%</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all duration-500",
                                            utilizationPercent >= 90 ? "bg-red-500" :
                                                utilizationPercent >= 70 ? "bg-amber-500" :
                                                    "bg-emerald-500"
                                        )}
                                        style={{ width: `${utilizationPercent}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Outreach Status Filter */}
                <div className="shrink-0 px-6 py-3 bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl">
                        {/* All filter */}
                        <button
                            onClick={() => setStatusFilter('all')}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                                statusFilter === 'all'
                                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                            )}
                        >
                            All
                            <span className={cn(
                                "text-xs px-1.5 py-0.5 rounded-md",
                                statusFilter === 'all'
                                    ? "bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300"
                                    : "bg-slate-200/60 dark:bg-slate-700 text-slate-500"
                            )}>
                                {assignedCompanies.length}
                            </span>
                        </button>

                        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700" />

                        {(Object.entries(OUTREACH_CONFIG) as [OutreachStatus, typeof OUTREACH_CONFIG[OutreachStatus]][]).map(([status, config]) => {
                            const count = metrics?.statusCounts[status] || 0;
                            const Icon = config.icon;
                            const isActive = statusFilter === status;

                            return (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(isActive ? 'all' : status)}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                                        isActive
                                            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                                            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                    )}
                                >
                                    <Icon className={cn(
                                        "w-3.5 h-3.5",
                                        isActive ? config.color : ""
                                    )} />
                                    <span className="hidden sm:inline">{config.shortLabel}</span>
                                    <span className={cn(
                                        "text-xs px-1.5 py-0.5 rounded-md",
                                        isActive
                                            ? cn(config.bgColor, config.color)
                                            : "bg-slate-200/60 dark:bg-slate-700 text-slate-500"
                                    )}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Accounts List */}
                <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 m-4 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        {filteredCompanies.map((company) => {
                            const statusConfig = OUTREACH_CONFIG[company.outreach_status];
                            const StatusIcon = statusConfig.icon;

                            return (
                                <button
                                    key={company.id}
                                    onClick={() => onCompanyClick(company.domain)}
                                    className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
                                >
                                    {/* Company Logo */}
                                    <div className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                                        {company.logo_base64 ? (
                                            <img
                                                src={`data:image/png;base64,${company.logo_base64}`}
                                                alt=""
                                                className="w-7 h-7 object-contain"
                                            />
                                        ) : (
                                            <img
                                                src={`https://www.google.com/s2/favicons?domain=${company.domain}&sz=64`}
                                                alt=""
                                                className="w-6 h-6 object-contain"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        )}
                                    </div>

                                    {/* Company Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                            {company.company_name || company.domain}
                                        </div>
                                        <div className="text-sm text-slate-500 dark:text-slate-400 truncate">
                                            {[company.industry, company.hq_country].filter(Boolean).join(' • ')}
                                        </div>
                                    </div>

                                    {/* Fit Score */}
                                    <div className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        {company.cached_fit_score ? Math.round(company.cached_fit_score * 100) : 0}%
                                    </div>

                                    {/* Outreach Status */}
                                    <div className={cn(
                                        "shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-medium",
                                        statusConfig.bgColor,
                                        statusConfig.color
                                    )}>
                                        <StatusIcon className="w-3.5 h-3.5" />
                                        {statusConfig.shortLabel}
                                    </div>

                                    {/* Decision Makers */}
                                    <div className="shrink-0 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                                        <Users className="w-4 h-4" />
                                        {company.decision_makers_count}
                                    </div>

                                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 shrink-0" />
                                </button>
                            );
                        })}

                        {filteredCompanies.length === 0 && (
                            <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                                <Mail className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                <p className="font-medium">
                                    {assignedCompanies.length === 0
                                        ? "No accounts assigned yet"
                                        : "No accounts match this filter"
                                    }
                                </p>
                                <p className="text-sm mt-1">
                                    {assignedCompanies.length === 0
                                        ? "Assign accounts to this partner in the Assignments view"
                                        : "Click a status to filter, or clear the filter"
                                    }
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
