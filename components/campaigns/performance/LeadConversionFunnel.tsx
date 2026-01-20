'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight, Phone, UserCheck, FileText, Trophy } from 'lucide-react';

interface FunnelStage {
    name: string;
    count: number;
    conversionRate?: number; // Conversion from previous stage
}

interface LeadConversionFunnelProps {
    /** Whether data is available (false = show sample data) */
    hasData?: boolean;
    /** Custom funnel stages - uses sample data if not provided */
    stages?: FunnelStage[];
    /** Additional classes */
    className?: string;
}

// Sample data matching the reference design
const SAMPLE_STAGES: FunnelStage[] = [
    { name: 'CONTACTED', count: 1240 },
    { name: 'QUALIFIED', count: 806, conversionRate: 65 },
    { name: 'PROPOSAL', count: 322, conversionRate: 40 },
    { name: 'CLOSED', count: 64, conversionRate: 20 },
];

// Icon mapping for stages
const stageIcons: Record<string, React.ElementType> = {
    'CONTACTED': Phone,
    'QUALIFIED': UserCheck,
    'PROPOSAL': FileText,
    'CLOSED': Trophy,
};

// Color progression for the funnel stages
const stageColors = [
    'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
    'bg-blue-100 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800',
    'bg-blue-200 dark:bg-blue-800/50 border-blue-300 dark:border-blue-700',
    'bg-blue-600 dark:bg-blue-600 border-blue-700 dark:border-blue-500',
];

const stageTextColors = [
    'text-slate-700 dark:text-slate-300',
    'text-blue-700 dark:text-blue-300',
    'text-blue-800 dark:text-blue-200',
    'text-white dark:text-white',
];

const stageLabelColors = [
    'text-slate-500 dark:text-slate-400',
    'text-blue-600 dark:text-blue-400',
    'text-blue-700 dark:text-blue-300',
    'text-blue-100 dark:text-blue-100',
];

/**
 * Lead Conversion Funnel visualization showing the sales pipeline stages.
 * Styled similarly to the existing FunnelVisualization component.
 */
export function LeadConversionFunnel({
    hasData = false,
    stages = SAMPLE_STAGES,
    className,
}: LeadConversionFunnelProps) {
    const [viewMode, setViewMode] = useState<'total' | 'qualified'>('qualified');

    const displayStages = stages;

    return (
        <div className={cn('space-y-4', className)}>
            {/* Header with toggle */}
            <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                    Lead Conversion Funnel
                </h3>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setViewMode('total')}
                        className={cn(
                            'flex items-center gap-1.5 text-xs font-medium transition-colors',
                            viewMode === 'total'
                                ? 'text-slate-900 dark:text-white'
                                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                        )}
                    >
                        <span className={cn(
                            'w-2 h-2 rounded-full',
                            viewMode === 'total' ? 'bg-slate-400' : 'bg-slate-200 dark:bg-slate-700'
                        )} />
                        TOTAL VOLUME
                    </button>
                    <button
                        onClick={() => setViewMode('qualified')}
                        className={cn(
                            'flex items-center gap-1.5 text-xs font-medium transition-colors',
                            viewMode === 'qualified'
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                        )}
                    >
                        <span className={cn(
                            'w-2 h-2 rounded-full',
                            viewMode === 'qualified' ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'
                        )} />
                        QUALIFIED ONLY
                    </button>
                </div>
            </div>

            {/* Funnel stages */}
            <div className="flex items-stretch gap-0">
                {displayStages.map((stage, index) => {
                    const Icon = stageIcons[stage.name] || Phone;
                    const isLast = index === displayStages.length - 1;
                    const colorClass = stageColors[Math.min(index, stageColors.length - 1)];
                    const textColor = stageTextColors[Math.min(index, stageTextColors.length - 1)];
                    const labelColor = stageLabelColors[Math.min(index, stageLabelColors.length - 1)];

                    // Calculate flex basis for funnel shape (decreasing width)
                    const widthPercent = 100 - (index * 12);

                    return (
                        <div key={stage.name} className="flex items-center flex-1 min-w-0">
                            <div
                                className={cn(
                                    'relative flex-1 rounded-lg border py-4 px-4 transition-all',
                                    colorClass,
                                    // Funnel shape with overlapping
                                    index > 0 && '-ml-3',
                                    isLast && 'rounded-r-2xl'
                                )}
                                style={{
                                    clipPath: isLast
                                        ? undefined
                                        : 'polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%)',
                                    zIndex: displayStages.length - index,
                                }}
                            >
                                <div className="text-center">
                                    <div className={cn('text-[10px] font-semibold uppercase tracking-wider mb-1', labelColor)}>
                                        {stage.name}
                                    </div>
                                    <div className={cn('text-2xl font-bold tabular-nums', textColor)}>
                                        {stage.count.toLocaleString()}
                                    </div>
                                    {stage.conversionRate !== undefined && (
                                        <div className={cn(
                                            'mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full inline-block',
                                            isLast
                                                ? 'bg-blue-500/30 text-blue-100'
                                                : 'bg-white/50 dark:bg-slate-900/30 text-blue-600 dark:text-blue-400'
                                        )}>
                                            {stage.conversionRate}% Conv.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
