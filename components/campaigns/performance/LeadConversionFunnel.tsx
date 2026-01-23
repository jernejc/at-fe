'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Phone, UserCheck, FileText, Trophy, ChevronRight } from 'lucide-react';

interface FunnelStage {
    name: string;
    count: number;
    conversionRate?: number;
}

interface LeadConversionFunnelProps {
    hasData?: boolean;
    stages?: FunnelStage[];
    className?: string;
}

const SAMPLE_STAGES: FunnelStage[] = [
    { name: 'Contacted', count: 1240 },
    { name: 'Qualified', count: 806, conversionRate: 65 },
    { name: 'Proposal', count: 322, conversionRate: 40 },
    { name: 'Closed', count: 64, conversionRate: 20 },
];

// Icon mapping for stages
const stageIcons: Record<string, React.ElementType> = {
    'Contacted': Phone,
    'Qualified': UserCheck,
    'Proposal': FileText,
    'Closed': Trophy,
};

/**
 * Lead Conversion Funnel - Matches the Campaign Funnel design from Analysis tab
 */
export function LeadConversionFunnel({
    hasData = false,
    stages = SAMPLE_STAGES,
    className,
}: LeadConversionFunnelProps) {
    const [viewMode, setViewMode] = useState<'total' | 'qualified'>('qualified');
    
    const maxCount = Math.max(...stages.map(s => s.count));

    return (
        <div className={cn('space-y-3', className)}>
            {/* Stage Cards - matching FunnelVisualization style */}
            <div className="flex items-stretch gap-1">
                {stages.map((stage, index) => {
                    const Icon = stageIcons[stage.name] || Phone;
                    const widthPercent = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;
                    const isLast = index === stages.length - 1;
                    
                    // Calculate drop rate from previous stage
                    const prevStage = index > 0 ? stages[index - 1] : null;
                    const dropRate = prevStage && prevStage.count > 0
                        ? Math.round((1 - stage.count / prevStage.count) * 100)
                        : null;

                    return (
                        <div key={stage.name} className="flex items-center flex-1 min-w-0">
                            <div className={cn(
                                "relative flex-1 rounded-lg border transition-colors overflow-hidden",
                                isLast
                                    ? "bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900"
                                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                            )}>
                                {/* Subtle progress bar background */}
                                <div
                                    className={cn(
                                        "absolute inset-y-0 left-0",
                                        isLast 
                                            ? "bg-emerald-100 dark:bg-emerald-900/30"
                                            : "bg-slate-100 dark:bg-slate-800/50"
                                    )}
                                    style={{ width: `${widthPercent}%` }}
                                />

                                <div className="relative px-3 py-3">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Icon className={cn(
                                            "w-3.5 h-3.5",
                                            isLast ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"
                                        )} />
                                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                            {stage.name}
                                        </span>
                                    </div>

                                    <div className="flex items-baseline gap-2">
                                        <span className={cn(
                                            "text-2xl font-bold tabular-nums",
                                            isLast ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"
                                        )}>
                                            {stage.count.toLocaleString()}
                                        </span>
                                        {stage.conversionRate !== undefined && (
                                            <span className={cn(
                                                "text-xs font-medium",
                                                isLast ? "text-emerald-500 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"
                                            )}>
                                                {stage.conversionRate}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Connector with drop rate */}
                            {!isLast && (
                                <div className="flex flex-col items-center px-1 shrink-0">
                                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-700" />
                                    {dropRate !== null && dropRate > 0 && (
                                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">
                                            -{dropRate}%
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Total conversion summary */}
            <div className="text-right text-xs text-slate-500 dark:text-slate-400">
                Overall conversion: <span className="font-medium text-emerald-600 dark:text-emerald-400">5.2%</span>
            </div>
        </div>
    );
}
