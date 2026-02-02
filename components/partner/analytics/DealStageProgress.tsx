'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DEAL_STAGES, type DealStage } from '@/lib/data/crm-analytics.mock';

interface DealStageProgressProps {
    currentStage: DealStage;
}

export function DealStageProgress({ currentStage }: DealStageProgressProps) {
    const currentIndex = DEAL_STAGES.findIndex(s => s.id === currentStage);

    return (
        <div className="w-full">
            <div className="flex items-center justify-between relative">
                {/* Progress line background */}
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-700" />

                {/* Active progress line */}
                <div
                    className="absolute top-4 left-0 h-0.5 bg-blue-500 transition-all duration-500"
                    style={{
                        width: `${(currentIndex / (DEAL_STAGES.length - 1)) * 100}%`,
                    }}
                />

                {/* Stage dots */}
                {DEAL_STAGES.map((stage, index) => {
                    const isCompleted = index < currentIndex;
                    const isCurrent = index === currentIndex;
                    const isPending = index > currentIndex;

                    return (
                        <div
                            key={stage.id}
                            className="flex flex-col items-center relative z-10"
                        >
                            {/* Dot */}
                            <div
                                className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                                    isCompleted && "bg-blue-500 border-blue-500",
                                    isCurrent && "bg-white dark:bg-slate-900 border-blue-500 ring-4 ring-blue-100 dark:ring-blue-900/50",
                                    isPending && "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600"
                                )}
                            >
                                {isCompleted ? (
                                    <Check className="w-4 h-4 text-white" />
                                ) : (
                                    <div
                                        className={cn(
                                            "w-2.5 h-2.5 rounded-full",
                                            isCurrent && "bg-blue-500",
                                            isPending && "bg-slate-300 dark:bg-slate-600"
                                        )}
                                    />
                                )}
                            </div>

                            {/* Label */}
                            <span
                                className={cn(
                                    "mt-2 text-xs font-medium whitespace-nowrap",
                                    (isCompleted || isCurrent) && "text-slate-900 dark:text-white",
                                    isPending && "text-slate-400 dark:text-slate-500"
                                )}
                            >
                                {stage.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
