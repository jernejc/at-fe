'use client';

import { DollarSign, Percent, Calendar } from 'lucide-react';
import { CRMAnalyticsWrapper } from './CRMAnalyticsWrapper';
import { DealStageProgress } from './DealStageProgress';
import { OutreachTimeline } from './OutreachTimeline';
import { Card, CardContent } from '@/components/ui/card';
import { demoCompanyAnalytics, type Stakeholder } from '@/lib/data/crm-analytics.mock';
import { cn } from '@/lib/utils';

function formatCurrency(value: number): string {
    if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
}

function StakeholderItem({ stakeholder }: { stakeholder: Stakeholder }) {
    return (
        <div className="flex items-center gap-3 py-2">
            {/* Status dot */}
            <div
                className={cn(
                    "w-2.5 h-2.5 rounded-full flex-shrink-0",
                    stakeholder.engaged
                        ? "bg-emerald-500"
                        : "bg-slate-300 dark:bg-slate-600"
                )}
            />

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {stakeholder.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    {stakeholder.title}
                </p>
            </div>

            {/* Status label */}
            <div className="flex-shrink-0">
                {stakeholder.engaged ? (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400">
                        {stakeholder.lastActivity}
                    </span>
                ) : (
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                        Not contacted
                    </span>
                )}
            </div>
        </div>
    );
}

export function CompanyCRMStatus() {
    const data = demoCompanyAnalytics;

    return (
        <CRMAnalyticsWrapper>
            <Card>
                <CardContent className="p-5 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                            Deal Progress
                        </h3>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            Synced from CRM
                        </span>
                    </div>

                    {/* Quick stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                    {formatCurrency(data.dealValue)}
                                </span>
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                Deal Value
                            </span>
                        </div>
                        <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <Percent className="w-3.5 h-3.5 text-blue-500" />
                                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                    {data.probability}%
                                </span>
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                Probability
                            </span>
                        </div>
                        <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <Calendar className="w-3.5 h-3.5 text-violet-500" />
                                <span className="text-sm font-bold text-violet-600 dark:text-violet-400">
                                    {data.expectedCloseDate}
                                </span>
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                Expected Close
                            </span>
                        </div>
                    </div>

                    {/* Deal Stage Progress */}
                    <div>
                        <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                            Deal Stage
                        </h4>
                        <DealStageProgress currentStage={data.currentStage} />
                    </div>

                    {/* Two columns for Timeline and Stakeholders */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Outreach Timeline */}
                        <div>
                            <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                                Outreach Timeline
                            </h4>
                            <OutreachTimeline events={data.timeline} />
                        </div>

                        {/* Stakeholder Engagement */}
                        <div>
                            <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                                Stakeholder Engagement
                            </h4>
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {data.stakeholders.map(stakeholder => (
                                    <StakeholderItem key={stakeholder.id} stakeholder={stakeholder} />
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </CRMAnalyticsWrapper>
    );
}
