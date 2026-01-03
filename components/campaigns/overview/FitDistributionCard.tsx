import { CampaignOverview } from '@/lib/schemas';
import { BarChart3 } from 'lucide-react';
import { getFitColor } from './utils';
import { DrillDownFilter } from './types';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

export function FitDistributionCard({
    fitDistribution,
    onDrillDown,
}: {
    fitDistribution?: CampaignOverview['fit_distribution'];
    onDrillDown?: (filter: DrillDownFilter) => void;
}) {
    const hasData = fitDistribution && Object.values(fitDistribution).some(v => v > 0);

    if (!hasData) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                    <h3 className="font-medium text-sm text-slate-900 dark:text-white">Fit Distribution</h3>
                </div>
                <div className="p-6 text-center">
                    <BarChart3 className="w-6 h-6 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">No fit scores yet</p>
                </div>
            </div>
        );
    }

    const totalScored = Object.values(fitDistribution).reduce((sum, val) => sum + val, 0) - (fitDistribution.unscored || 0);

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <h3 className="font-medium text-sm text-slate-900 dark:text-white">Fit Distribution</h3>
            </div>
            <div className="p-4 space-y-2">
                {Object.entries(fitDistribution)
                    .filter(([key]) => key !== 'unscored')
                    .sort((a, b) => {
                        const aStart = parseInt(a[0].split('-')[0]);
                        const bStart = parseInt(b[0].split('-')[0]);
                        return bStart - aStart;
                    })
                    .map(([range, count]) => {
                        const percentage = totalScored > 0 ? (count / totalScored) * 100 : 0;
                        const colors = getFitColor(range);

                        return (
                            <Tooltip key={range}>
                                <TooltipTrigger
                                    onClick={() => onDrillDown?.({ type: 'fit_range', value: range, label: `Fit: ${range}%` })}
                                    className="w-full text-left cursor-pointer"
                                >
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <span className={`font-medium ${colors.text}`}>{range}%</span>
                                        <span className="text-slate-500 dark:text-slate-400 tabular-nums">{count}</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${colors.bg}`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="left">
                                    <div className="text-center">
                                        <div className="font-medium">{count} companies</div>
                                        <div className="text-slate-400 text-xs">{percentage.toFixed(1)}%</div>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        );
                    })}
                {fitDistribution.unscored > 0 && (
                    <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-700">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>Unscored</span>
                            <span className="tabular-nums">{fitDistribution.unscored}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
