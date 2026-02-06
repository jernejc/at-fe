'use client';

import { DollarSign, Trophy, Target, TrendingUp } from 'lucide-react';
import { CRMAnalyticsWrapper } from './CRMAnalyticsWrapper';
import { CRMStatCard } from './CRMStatCard';
import { PipelineTrendChart } from './PipelineTrendChart';
import { OutreachFunnelChart } from './OutreachFunnelChart';
import { demoDashboardAnalytics } from '@/lib/data/crm-analytics.mock';

function formatCurrency(value: number): string {
    if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
        return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
}

export function DashboardCRMAnalytics() {
    const data = demoDashboardAnalytics;

    return (
        <CRMAnalyticsWrapper className="space-y-4">
            {/* Section Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Analytics
                </h2>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                    Synced from your CRM
                </span>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <CRMStatCard
                    icon={DollarSign}
                    iconBgClass="bg-blue-50 dark:bg-blue-900/30"
                    label="Active Pipeline"
                    value={formatCurrency(data.pipelineValue)}
                    valueColorClass="text-blue-600 dark:text-blue-400"
                    trend={{ value: data.pipelineTrend, label: '% MoM', isPositive: true }}
                />
                <CRMStatCard
                    icon={Trophy}
                    iconBgClass="bg-emerald-50 dark:bg-emerald-900/30"
                    label="Won Revenue"
                    value={formatCurrency(data.wonRevenue)}
                    valueColorClass="text-emerald-600 dark:text-emerald-400"
                    trend={{ value: data.revenueTrend, label: '% MoM', isPositive: true }}
                />
                <CRMStatCard
                    icon={Target}
                    iconBgClass="bg-violet-50 dark:bg-violet-900/30"
                    label="Active Opportunities"
                    value={data.activeOpportunities}
                    valueColorClass="text-violet-600 dark:text-violet-400"
                    trend={{ value: data.opportunitiesTrend, label: ' this week', isPositive: true }}
                />
                <CRMStatCard
                    icon={TrendingUp}
                    iconBgClass="bg-amber-50 dark:bg-amber-900/30"
                    label="Conversion Rate"
                    value={`${data.conversionRate}%`}
                    valueColorClass="text-amber-600 dark:text-amber-400"
                    trend={{ value: data.conversionTrend, label: 'pts', isPositive: true }}
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PipelineTrendChart data={data.monthlyTrend} title="Pipeline Trend (6 months)" />
                <OutreachFunnelChart data={data.outreachFunnel} title="Outreach Funnel" />
            </div>
        </CRMAnalyticsWrapper>
    );
}
