'use client';

import { useMemo } from 'react';
import { MembershipWithProgress, OutreachStatus } from '@/lib/schemas/campaign';
import { cn } from '@/lib/utils';
import {
    TrendingUp,
    TrendingDown,
    Target,
    MessageSquare,
    CalendarCheck,
    Clock,
    Zap,
} from 'lucide-react';

interface PartnerMetricsProps {
    accounts: MembershipWithProgress[];
}

interface MetricCardProps {
    label: string;
    value: string | number;
    subValue?: string;
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
}

function MetricCard({
    label,
    value,
    subValue,
    icon: Icon,
    iconColor,
    iconBg,
    trend,
    trendValue,
}: MetricCardProps) {
    return (
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                iconBg
            )}>
                <Icon className={cn("w-5 h-5", iconColor)} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                        {value}
                    </span>
                    {subValue && (
                        <span className="text-xs text-slate-400">
                            {subValue}
                        </span>
                    )}
                    {trend && trendValue && (
                        <span className={cn(
                            "flex items-center gap-0.5 text-xs font-medium",
                            trend === 'up' ? "text-emerald-500" :
                                trend === 'down' ? "text-red-500" :
                                    "text-slate-400"
                        )}>
                            {trend === 'up' && <TrendingUp className="w-3 h-3" />}
                            {trend === 'down' && <TrendingDown className="w-3 h-3" />}
                            {trendValue}
                        </span>
                    )}
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                    {label}
                </span>
            </div>
        </div>
    );
}

export function PartnerMetrics({ accounts }: PartnerMetricsProps) {
    const metrics = useMemo(() => {
        if (!accounts.length) return null;

        const statusCounts = accounts.reduce((acc, c) => {
            acc[c.outreach_status] = (acc[c.outreach_status] || 0) + 1;
            return acc;
        }, {} as Record<OutreachStatus, number>);

        const sent = statusCounts.sent || 0;
        const replied = statusCounts.replied || 0;
        const meetingBooked = statusCounts.meeting_booked || 0;
        const totalOutreached = sent + replied + meetingBooked;

        // Response rate: (replied + meeting) / total sent
        const responseRate = totalOutreached > 0
            ? ((replied + meetingBooked) / totalOutreached) * 100
            : 0;

        // Conversion rate: meeting / total accounts
        const conversionRate = accounts.length > 0
            ? (meetingBooked / accounts.length) * 100
            : 0;

        // Engaged: replied + meeting
        const engaged = replied + meetingBooked;

        // Average fit score
        const scoredAccounts = accounts.filter(a => a.cached_fit_score != null);
        const avgFitScore = scoredAccounts.length > 0
            ? scoredAccounts.reduce((sum, a) => sum + (a.cached_fit_score || 0), 0) / scoredAccounts.length
            : null;

        // Mock average days to response (for demo)
        const avgDaysToResponse = totalOutreached > 0 ? 2.4 : null;

        return {
            responseRate,
            conversionRate,
            engaged,
            meetingBooked,
            avgFitScore,
            avgDaysToResponse,
            totalOutreached,
        };
    }, [accounts]);

    if (!metrics) return null;

    return (
        <div className="grid grid-cols-2 gap-3">
            <MetricCard
                label="Response Rate"
                value={`${metrics.responseRate.toFixed(0)}%`}
                subValue={`${metrics.engaged} of ${metrics.totalOutreached}`}
                icon={MessageSquare}
                iconColor="text-emerald-500"
                iconBg="bg-emerald-50 dark:bg-emerald-900/20"
                trend={metrics.responseRate > 30 ? 'up' : metrics.responseRate > 0 ? 'neutral' : undefined}
                trendValue={metrics.responseRate > 30 ? 'Strong' : undefined}
            />
            <MetricCard
                label="Conversion Rate"
                value={`${metrics.conversionRate.toFixed(0)}%`}
                subValue={`${metrics.meetingBooked} meetings`}
                icon={CalendarCheck}
                iconColor="text-violet-500"
                iconBg="bg-violet-50 dark:bg-violet-900/20"
            />
            <MetricCard
                label="Avg Fit Score"
                value={metrics.avgFitScore != null ? `${Math.round(metrics.avgFitScore * 100)}%` : '–'}
                icon={Target}
                iconColor="text-blue-500"
                iconBg="bg-blue-50 dark:bg-blue-900/20"
            />
            <MetricCard
                label="Avg Response Time"
                value={metrics.avgDaysToResponse != null ? `${metrics.avgDaysToResponse}d` : '–'}
                icon={Clock}
                iconColor="text-amber-500"
                iconBg="bg-amber-50 dark:bg-amber-900/20"
            />
        </div>
    );
}
