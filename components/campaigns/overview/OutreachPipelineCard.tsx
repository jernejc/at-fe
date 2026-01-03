import { OutreachPipeline, DrillDownFilter } from './types';
import { Clock, Send, MessageSquare, CalendarCheck, ChevronRight } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const PIPELINE_STAGES = [
    { key: 'not_started', label: 'Not Started', icon: Clock },
    { key: 'contacted', label: 'Contacted', icon: Send },
    { key: 'responded', label: 'Responded', icon: MessageSquare },
    { key: 'meeting_booked', label: 'Meeting', icon: CalendarCheck },
] as const;

export function OutreachPipelineCard({
    pipeline,
    onDrillDown,
}: {
    pipeline: OutreachPipeline;
    onDrillDown?: (filter: DrillDownFilter) => void;
}) {
    const total = Object.values(pipeline).reduce((sum, count) => sum + count, 0);

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4">
            {/* Step Progress */}
            <div className="flex items-start">
                {PIPELINE_STAGES.map((stage, idx) => {
                    const Icon = stage.icon;
                    const count = pipeline[stage.key as keyof OutreachPipeline];
                    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                    const isLast = idx === PIPELINE_STAGES.length - 1;
                    const hasProgress = count > 0;

                    return (
                        <div key={stage.key} className="flex-1 flex items-start">
                            {/* Step content */}
                            <Tooltip>
                                <TooltipTrigger
                                    onClick={() => onDrillDown?.({ type: 'outreach_status', value: stage.key, label: stage.label })}
                                    className="flex flex-col items-center cursor-pointer w-full"
                                >
                                    {/* Icon circle */}
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center",
                                        hasProgress
                                            ? isLast
                                                ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"
                                                : "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
                                    )}>
                                        <Icon className="w-4 h-4" />
                                    </div>

                                    {/* Count */}
                                    <div className="mt-2 text-center">
                                        <div className={cn(
                                            "text-lg font-semibold tabular-nums",
                                            hasProgress
                                                ? "text-slate-900 dark:text-white"
                                                : "text-slate-400 dark:text-slate-500"
                                        )}>
                                            {count}
                                        </div>
                                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                            {stage.label}
                                        </div>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <div className="text-center">
                                        <div className="font-medium">{stage.label}</div>
                                        <div className="text-slate-400 text-xs">{percentage}% of total</div>
                                    </div>
                                </TooltipContent>
                            </Tooltip>

                            {/* Arrow connector */}
                            {!isLast && (
                                <div className="flex-1 flex items-center self-stretch px-1">
                                    <div className="w-full flex items-center text-slate-400 dark:text-slate-500">
                                        <div className="flex-1 h-0.5 bg-current rounded-full" />
                                        <ChevronRight className="w-5 h-5 -ml-1.5 shrink-0" />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
