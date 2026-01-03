'use client';

import { useState, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Partner, MembershipWithProgress, OutreachStatus } from '@/lib/schemas/campaign';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { OutreachPipeline } from './OutreachPipeline';
import { CompanyRowCompact } from '@/components/campaigns/CompanyRowCompact';
import {
    Building2,
    CalendarCheck,
    FileEdit,
    Zap,
    Briefcase,
    Globe,
    Send,
    Mail,
    Clock,
    MessageSquare,
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
                className="h-[92vh] p-0 flex flex-col bg-slate-50 dark:bg-slate-950 border-t border-border shadow-2xl transition-all duration-500 ease-in-out gap-0 rounded-t-xl"
            >
                <SheetHeader className="sr-only">
                    <SheetTitle>{partner.name} Details</SheetTitle>
                </SheetHeader>

                {/* Header */}
                <div className="bg-background border-b border-border/60 shrink-0">
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

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto w-full p-6 space-y-6">
                        {/* Outreach Status */}
                        {metrics && (
                            <OutreachPipeline
                                statusCounts={metrics.statusCounts}
                                total={assignedCompanies.length}
                                activeFilter={statusFilter}
                                onStageClick={setStatusFilter}
                            />
                        )}

                        {/* Accounts List */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold">
                                    Accounts
                                    <span className="ml-2 text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                        {filteredCompanies.length}
                                    </span>
                                </h3>
                                {statusFilter !== 'all' && (
                                    <button
                                        onClick={() => setStatusFilter('all')}
                                        className="text-xs text-primary hover:underline"
                                    >
                                        Clear filter
                                    </button>
                                )}
                            </div>

                            <div className="space-y-3">
                                {filteredCompanies.map((company) => (
                                    <CompanyRowCompact
                                        key={company.id}
                                        name={company.company_name || company.domain}
                                        domain={company.domain}
                                        logoBase64={company.logo_base64}
                                        industry={company.industry}
                                        employeeCount={company.employee_count}
                                        hqCountry={company.hq_country}
                                        outreachStatus={company.outreach_status}
                                        lastActivity={company.last_activity}
                                        decisionMakersCount={company.decision_makers_count}
                                        fitScore={company.cached_fit_score}
                                        onClick={() => onCompanyClick(company.domain)}
                                        variant="card"
                                    />
                                ))}

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
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
