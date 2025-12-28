'use client';

import { useMemo } from 'react';
import { OutreachStatus } from '@/lib/schemas/campaign';
import { cn } from '@/lib/utils';
import {
    Clock,
    FileEdit,
    Send,
    MessageSquare,
    CalendarCheck,
} from 'lucide-react';

interface PipelineStage {
    status: OutreachStatus;
    count: number;
    label: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
}

interface OutreachPipelineProps {
    statusCounts: Record<OutreachStatus, number>;
    total: number;
    activeFilter: OutreachStatus | 'all';
    onStageClick: (status: OutreachStatus | 'all') => void;
}

const PIPELINE_STAGES: Omit<PipelineStage, 'count'>[] = [
    {
        status: 'not_started',
        label: 'Not Started',
        icon: Clock,
        color: 'text-slate-500',
        bgColor: 'bg-slate-100 dark:bg-slate-800',
    },
    {
        status: 'draft',
        label: 'Draft',
        icon: FileEdit,
        color: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-50 dark:bg-amber-900/30',
    },
    {
        status: 'sent',
        label: 'Sent',
        icon: Send,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-900/30',
    },
    {
        status: 'replied',
        label: 'Replied',
        icon: MessageSquare,
        color: 'text-emerald-600 dark:text-emerald-400',
        bgColor: 'bg-emerald-50 dark:bg-emerald-900/30',
    },
    {
        status: 'meeting_booked',
        label: 'Meeting',
        icon: CalendarCheck,
        color: 'text-violet-600 dark:text-violet-400',
        bgColor: 'bg-violet-50 dark:bg-violet-900/30',
    },
];

export function OutreachPipeline({
    statusCounts,
    total,
    activeFilter,
    onStageClick
}: OutreachPipelineProps) {
    // Build stages with counts
    const stages = useMemo<PipelineStage[]>(() => {
        return PIPELINE_STAGES.map(stage => ({
            ...stage,
            count: statusCounts[stage.status] || 0,
        }));
    }, [statusCounts]);

    if (total === 0) return null;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Outreach Status
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                    {total} accounts total
                </span>
            </div>

            {/* Simple horizontal bar breakdown */}
            <div className="flex h-3 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 mb-4">
                {stages.map((stage) => {
                    const percentage = total > 0 ? (stage.count / total) * 100 : 0;
                    if (percentage === 0) return null;

                    return (
                        <div
                            key={stage.status}
                            className={cn(stage.bgColor, "first:rounded-l-full last:rounded-r-full")}
                            style={{ width: `${percentage}%` }}
                            title={`${stage.label}: ${stage.count} (${percentage.toFixed(0)}%)`}
                        />
                    );
                })}
            </div>

            {/* Stage cards */}
            <div className="grid grid-cols-5 gap-2">
                {stages.map((stage) => {
                    const Icon = stage.icon;
                    const percentage = total > 0 ? (stage.count / total) * 100 : 0;
                    const isActive = activeFilter === stage.status;

                    return (
                        <button
                            key={stage.status}
                            onClick={() => onStageClick(isActive ? 'all' : stage.status)}
                            className={cn(
                                "flex flex-col items-center p-3 rounded-lg text-center",
                                isActive
                                    ? cn(stage.bgColor, "ring-2 ring-offset-1 ring-offset-white dark:ring-offset-slate-900", stage.color.replace('text-', 'ring-'))
                                    : "bg-slate-50 dark:bg-slate-800/50"
                            )}
                        >
                            <Icon className={cn(
                                "w-4 h-4 mb-1.5",
                                isActive ? stage.color : "text-slate-400"
                            )} />
                            <span className={cn(
                                "text-xl font-bold",
                                isActive ? stage.color : "text-slate-700 dark:text-slate-200"
                            )}>
                                {stage.count}
                            </span>
                            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                                {stage.label}
                            </span>
                            <span className="text-[9px] text-slate-400 dark:text-slate-500">
                                {percentage.toFixed(0)}%
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
