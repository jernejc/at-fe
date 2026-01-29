'use client';

import { MessageSquare, CalendarCheck, TrendingUp, Clock } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import { CRMAnalyticsWrapper } from './CRMAnalyticsWrapper';
import { CRMStatCard } from './CRMStatCard';
import { Card, CardContent } from '@/components/ui/card';
import { demoCampaignAnalytics } from '@/lib/data/crm-analytics.mock';
import { OUTREACH_CONFIG, type OutreachStatus } from '@/lib/config/outreach';

// Map outreach status to chart-friendly colors (hex values)
const OUTREACH_COLORS: Record<OutreachStatus, string> = {
    not_started: '#94A3B8', // slate-400
    draft: '#F59E0B',       // amber-500
    sent: '#3B82F6',        // blue-500
    replied: '#10B981',     // emerald-500
    meeting_booked: '#8B5CF6', // violet-500
};

export function CampaignCRMAnalytics() {
    const data = demoCampaignAnalytics;

    // Prepare stacked bar data
    const total = Object.values(data.outreachDistribution).reduce((a, b) => a + b, 0);
    const stackedData = (Object.entries(data.outreachDistribution) as [OutreachStatus, number][])
        .map(([status, value]) => ({
            status,
            label: OUTREACH_CONFIG[status].shortLabel,
            value,
            percentage: Math.round((value / total) * 100),
        }));

    return (
        <CRMAnalyticsWrapper className="space-y-4">
            {/* Section Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Campaign CRM Insights
                </h2>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                    Synced from your CRM
                </span>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <CRMStatCard
                    icon={MessageSquare}
                    iconBgClass="bg-blue-50 dark:bg-blue-900/30"
                    label="Response Rate"
                    value={`${data.responseRate}%`}
                    valueColorClass="text-blue-600 dark:text-blue-400"
                />
                <CRMStatCard
                    icon={CalendarCheck}
                    iconBgClass="bg-violet-50 dark:bg-violet-900/30"
                    label="Meetings Booked"
                    value={data.meetingsBooked}
                    valueColorClass="text-violet-600 dark:text-violet-400"
                />
                <CRMStatCard
                    icon={TrendingUp}
                    iconBgClass="bg-emerald-50 dark:bg-emerald-900/30"
                    label="Campaign ROI"
                    value={`${data.campaignROI}x`}
                    valueColorClass="text-emerald-600 dark:text-emerald-400"
                />
                <CRMStatCard
                    icon={Clock}
                    iconBgClass="bg-amber-50 dark:bg-amber-900/30"
                    label="Avg Deal Cycle"
                    value={`${data.avgDealCycle} days`}
                    valueColorClass="text-amber-600 dark:text-amber-400"
                />
            </div>

            {/* Outreach Progress Bar */}
            <Card>
                <CardContent className="p-5">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
                        Outreach Progress
                    </h3>

                    {/* Stacked horizontal bar */}
                    <div className="h-10 flex rounded-lg overflow-hidden">
                        {stackedData.map(({ status, value, percentage }) => (
                            <div
                                key={status}
                                className="flex items-center justify-center transition-all duration-300 hover:opacity-90"
                                style={{
                                    width: `${percentage}%`,
                                    backgroundColor: OUTREACH_COLORS[status],
                                    minWidth: value > 0 ? '24px' : '0',
                                }}
                                title={`${OUTREACH_CONFIG[status].label}: ${value} (${percentage}%)`}
                            >
                                {percentage >= 10 && (
                                    <span className="text-xs font-medium text-white">
                                        {value}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Legend */}
                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
                        {stackedData.map(({ status, label, value, percentage }) => (
                            <div key={status} className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-sm"
                                    style={{ backgroundColor: OUTREACH_COLORS[status] }}
                                />
                                <span className="text-xs text-slate-600 dark:text-slate-400">
                                    {label}: <span className="font-medium text-slate-900 dark:text-white">{value}</span>
                                    <span className="text-slate-400 dark:text-slate-500"> ({percentage}%)</span>
                                </span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </CRMAnalyticsWrapper>
    );
}
