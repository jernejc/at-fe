'use client';

import { useState, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Partner, MembershipWithProgress, OutreachStatus } from '@/lib/schemas/campaign';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { OutreachPipeline } from './OutreachPipeline';
import { PartnerMetrics } from './PartnerMetrics';
import { RecentActivity } from './RecentActivity';
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
    MapPin,
    LayoutDashboard,
    Building,
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
    const [activeTab, setActiveTab] = useState<'overview' | 'accounts'>('overview');
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
                className="h-[92vh] p-0 flex flex-col bg-background border-t border-border shadow-2xl transition-all duration-500 ease-in-out gap-0 rounded-t-xl"
            >
                <SheetHeader className="sr-only">
                    <SheetTitle>{partner.name} Details</SheetTitle>
                </SheetHeader>

                {/* Header */}
                <div className="relative overflow-hidden border-b border-border/60 shrink-0">
                    <div className="relative max-w-7xl mx-auto w-full px-6 py-5 pt-7 pr-14">
                        <div className="flex gap-5 items-start">
                            {/* Logo with elevated container */}
                            <div className="relative rounded-lg p-1 bg-white dark:bg-slate-800 shadow-sm border border-border/60 shrink-0">
                                {partner.logo_url ? (
                                    <div className="w-16 h-16 rounded-md flex items-center justify-center overflow-hidden bg-white">
                                        <img
                                            src={partner.logo_url}
                                            alt={partner.name}
                                            className="w-10 h-10 object-contain"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 rounded-md bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                                        <TypeIcon className="w-6 h-6 text-slate-400" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                {/* Title row */}
                                <div className="flex items-center gap-2.5 flex-wrap">
                                    <h2 className="text-xl font-bold tracking-tight text-foreground">
                                        {partner.name}
                                    </h2>
                                    <Badge variant="secondary" className="capitalize text-xs">
                                        {partner.type}
                                    </Badge>
                                </div>

                                {/* Description and industry row */}
                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-1">
                                    {partner.description && (
                                        <span className="text-foreground/80 font-medium">
                                            {partner.description}
                                        </span>
                                    )}
                                    {metrics && metrics.industries.length > 0 && (
                                        <span className="flex items-center gap-1">
                                            {metrics.industries.slice(0, 2).join(', ')}
                                            {metrics.industries.length > 2 && ` +${metrics.industries.length - 2}`}
                                        </span>
                                    )}
                                </div>

                                {/* Metric pills row */}
                                <div className="flex flex-wrap gap-2 mt-3">
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm border bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-900/20 dark:border-slate-800 dark:text-slate-400">
                                        <span className="text-base">👥</span>
                                        <span className="font-semibold">{assigned}</span>
                                        <span className="text-xs text-muted-foreground">/ {capacity} assigned</span>
                                    </div>
                                    {metrics && (
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm border bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-100">
                                            <span className="text-base">✉️</span>
                                            <span className="font-semibold">{metrics.engagedCount}</span>
                                            <span className="text-xs text-emerald-700 dark:text-emerald-300">engaged</span>
                                        </div>
                                    )}
                                    <div className={cn(
                                        "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm border",
                                        utilizationPercent >= 90
                                            ? "bg-red-50 border-red-200 text-red-900 dark:bg-red-900/20 dark:border-red-800 dark:text-red-100"
                                            : utilizationPercent >= 70
                                                ? "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-100"
                                                : "bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-900/20 dark:border-slate-800 dark:text-slate-400"
                                    )}>
                                        <span className="text-base">📊</span>
                                        <span className="font-semibold">{Math.round(utilizationPercent)}%</span>
                                        <span className="text-xs text-muted-foreground">capacity</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b bg-background sticky top-0 z-30 shrink-0">
                    <div className="max-w-7xl mx-auto w-full px-6">
                        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'overview' | 'accounts')} className="w-full">
                            <TabsList variant="line" className="h-12 gap-6">
                                <TabsTrigger value="overview" className="gap-2">
                                    <LayoutDashboard className="w-4 h-4" />
                                    Overview
                                </TabsTrigger>
                                <TabsTrigger value="accounts" className="gap-2">
                                    <Building className="w-4 h-4" />
                                    Accounts
                                    <span className="ml-1 text-[10px] font-semibold bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                                        {assignedCompanies.length}
                                    </span>
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
                    <div className="max-w-7xl mx-auto w-full p-6">
                        {activeTab === 'overview' && (
                            <div className="space-y-6 animate-in fade-in-50">
                                {/* Outreach Status */}
                                {metrics && (
                                    <OutreachPipeline
                                        statusCounts={metrics.statusCounts}
                                        total={assignedCompanies.length}
                                        activeFilter={statusFilter}
                                        onStageClick={setStatusFilter}
                                    />
                                )}

                                {/* Two-column grid: Metrics + Activity */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Left: Performance Metrics */}
                                    <div className="space-y-4">
                                        <PartnerMetrics accounts={assignedCompanies} />

                                        {/* Industry Coverage */}
                                        {metrics && metrics.industries.length > 0 && (
                                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                                                    Industry Coverage
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {metrics.industries.map((industry) => (
                                                        <Badge key={industry} variant="outline" className="text-xs font-normal">
                                                            {industry}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Recent Activity */}
                                    <RecentActivity
                                        accounts={assignedCompanies}
                                        onAccountClick={onCompanyClick}
                                    />
                                </div>

                                {/* Empty state for no accounts */}
                                {assignedCompanies.length === 0 && (
                                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
                                        <Mail className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                                        <p className="font-medium text-slate-600 dark:text-slate-300">
                                            No accounts assigned yet
                                        </p>
                                        <p className="text-sm mt-1 text-slate-400 dark:text-slate-500">
                                            Assign accounts to this partner in the Assignments view
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'accounts' && (
                            <div className="space-y-4 animate-in fade-in-50">
                                {/* Filter by status */}
                                {assignedCompanies.length > 0 && (
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm text-slate-500">Filter:</span>
                                        <button
                                            onClick={() => setStatusFilter('all')}
                                            className={cn(
                                                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                                                statusFilter === 'all'
                                                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                                                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                                            )}
                                        >
                                            All ({assignedCompanies.length})
                                        </button>
                                        {(Object.entries(OUTREACH_CONFIG) as [OutreachStatus, typeof OUTREACH_CONFIG[OutreachStatus]][]).map(([status, config]) => {
                                            const count = metrics?.statusCounts[status] || 0;
                                            if (count === 0) return null;
                                            const Icon = config.icon;
                                            return (
                                                <button
                                                    key={status}
                                                    onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
                                                    className={cn(
                                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border",
                                                        statusFilter === status
                                                            ? cn(config.bgColor, config.color, "border-transparent")
                                                            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700"
                                                    )}
                                                >
                                                    <Icon className="w-3.5 h-3.5" />
                                                    {config.shortLabel} ({count})
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Accounts List */}
                                <div className="space-y-3">
                                    {filteredCompanies.map((company) => {
                                        const statusConfig = OUTREACH_CONFIG[company.outreach_status];
                                        const StatusIcon = statusConfig.icon;
                                        const hasFitScore = company.cached_fit_score != null;
                                        const fitScorePercent = hasFitScore ? Math.round(company.cached_fit_score! * 100) : null;

                                        // Format last activity
                                        const formatLastActivity = (dateStr?: string) => {
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

                                        const lastActivity = formatLastActivity(company.last_activity);

                                        const getFitTierStyle = (score: number | null) => {
                                            if (score === null) return 'bg-slate-100 dark:bg-slate-800 text-slate-500';
                                            if (score >= 80) return 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400';
                                            if (score >= 60) return 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
                                            if (score >= 40) return 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400';
                                            return 'bg-slate-100 dark:bg-slate-800 text-slate-500';
                                        };

                                        return (
                                            <button
                                                key={company.id}
                                                onClick={() => onCompanyClick(company.domain)}
                                                className="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all text-left group"
                                            >
                                                <div className="flex items-start gap-4">
                                                    {/* Company Logo */}
                                                    <div className="w-12 h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                                                        {company.logo_base64 ? (
                                                            <img
                                                                src={`data:image/png;base64,${company.logo_base64}`}
                                                                alt=""
                                                                className="w-8 h-8 object-contain"
                                                            />
                                                        ) : (
                                                            <img
                                                                src={`https://www.google.com/s2/favicons?domain=${company.domain}&sz=64`}
                                                                alt=""
                                                                className="w-7 h-7 object-contain"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                                }}
                                                            />
                                                        )}
                                                    </div>

                                                    {/* Company Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                                                {company.company_name || company.domain}
                                                            </span>
                                                            <div className={cn(
                                                                "shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                                                                statusConfig.bgColor,
                                                                statusConfig.color
                                                            )}>
                                                                <StatusIcon className="w-3 h-3" />
                                                                {statusConfig.shortLabel}
                                                            </div>
                                                        </div>
                                                        <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                                            {company.industry || 'Unknown Industry'}
                                                        </div>
                                                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 dark:text-slate-500">
                                                            {company.employee_count && (
                                                                <div className="flex items-center gap-1">
                                                                    <Users className="w-3.5 h-3.5" />
                                                                    <span>{company.employee_count.toLocaleString()}</span>
                                                                </div>
                                                            )}
                                                            {company.hq_country && (
                                                                <div className="flex items-center gap-1">
                                                                    <MapPin className="w-3.5 h-3.5" />
                                                                    <span>{company.hq_country}</span>
                                                                </div>
                                                            )}
                                                            {lastActivity && (
                                                                <div className="flex items-center gap-1">
                                                                    <Clock className="w-3.5 h-3.5" />
                                                                    <span>{lastActivity}</span>
                                                                </div>
                                                            )}
                                                            <div className="flex items-center gap-1">
                                                                <Target className="w-3.5 h-3.5" />
                                                                <span>{company.decision_makers_count} contacts</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Fit Score & Arrow */}
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
                                    })}

                                    {filteredCompanies.length === 0 && (
                                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
                                            <Mail className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                                            <p className="font-medium text-slate-600 dark:text-slate-300">
                                                {assignedCompanies.length === 0
                                                    ? "No accounts assigned yet"
                                                    : "No accounts match this filter"
                                                }
                                            </p>
                                            <p className="text-sm mt-1 text-slate-400 dark:text-slate-500">
                                                {assignedCompanies.length === 0
                                                    ? "Assign accounts to this partner in the Assignments view"
                                                    : "Try selecting a different status filter"
                                                }
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
