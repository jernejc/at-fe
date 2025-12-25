'use client';

import { useState, useEffect } from 'react';
import { CampaignFunnel, FunnelStage } from '@/lib/schemas/campaign';
import { getCampaignFunnel } from '@/lib/api';
import { Users, Zap, BarChart3, Star, FileText, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FunnelVisualizationProps {
    slug: string;
    productId?: number;
    className?: string;
}

// Stages to exclude from display
const EXCLUDED_STAGES = ['processed'];

// Icon mapping for funnel stages
const stageIcons: Record<string, React.ElementType> = {
    'total': Users,
    'signals': Zap,
    'fits': BarChart3,
    'high fit': Star,
    'playbooks': FileText,
};

function getStageIcon(stageName: string): React.ElementType {
    const lowerName = stageName.toLowerCase();
    for (const [key, icon] of Object.entries(stageIcons)) {
        if (lowerName.includes(key)) {
            return icon;
        }
    }
    return Users;
}

export function FunnelVisualization({ slug, productId, className }: FunnelVisualizationProps) {
    const [funnel, setFunnel] = useState<CampaignFunnel | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadFunnel() {
            try {
                setLoading(true);
                const data = await getCampaignFunnel(slug, productId);
                setFunnel(data);
                setError(null);
            } catch (err) {
                console.error('Failed to load funnel:', err);
                setError('Failed to load funnel metrics');
            } finally {
                setLoading(false);
            }
        }
        loadFunnel();
    }, [slug, productId]);

    if (loading) {
        return (
            <div className={cn("animate-pulse", className)}>
                <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex-1">
                            <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error || !funnel || funnel.stages.length === 0) {
        return null;
    }

    // Filter out excluded stages
    const displayStages = funnel.stages.filter(
        stage => !EXCLUDED_STAGES.some(excluded => stage.name.toLowerCase().includes(excluded))
    );

    if (displayStages.length === 0) {
        return null;
    }

    const maxCount = Math.max(...displayStages.map(s => s.count));

    return (
        <div className={cn("space-y-2", className)}>
            {/* Stage Cards */}
            <div className="flex items-stretch gap-1">
                {displayStages.map((stage, index) => {
                    const Icon = getStageIcon(stage.name);
                    const widthPercent = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;
                    const isLast = index === displayStages.length - 1;

                    // Calculate drop rate from previous stage
                    const prevStage = index > 0 ? displayStages[index - 1] : null;
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
                                {/* Subtle progress bar */}
                                <div
                                    className="absolute inset-y-0 left-0 bg-slate-100 dark:bg-slate-800/50"
                                    style={{ width: `${widthPercent}%` }}
                                />

                                <div className="relative px-3 py-2.5">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <Icon className={cn(
                                            "w-3.5 h-3.5",
                                            isLast ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"
                                        )} />
                                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                                            {stage.name}
                                        </span>
                                    </div>

                                    <div className="flex items-baseline gap-1.5">
                                        <span className={cn(
                                            "text-lg font-semibold tabular-nums",
                                            isLast ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"
                                        )}>
                                            {stage.count.toLocaleString()}
                                        </span>
                                        <span className="text-xs text-slate-400 dark:text-slate-500">
                                            {stage.percentage.toFixed(0)}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Connector with drop rate */}
                            {!isLast && (
                                <div className="flex flex-col items-center px-0.5 shrink-0">
                                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700" />
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

            {/* Conversion Summary */}
            {funnel.conversion_rate > 0 && (
                <div className="text-right text-xs text-slate-500 dark:text-slate-400">
                    Conversion: <span className="font-medium text-emerald-600 dark:text-emerald-400">{(funnel.conversion_rate * 100).toFixed(1)}%</span>
                </div>
            )}
        </div>
    );
}
