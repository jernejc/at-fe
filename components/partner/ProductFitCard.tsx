'use client';

import { FitSummaryFit } from '@/lib/schemas';
import { normalizeScore } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

interface ProductFitCardProps {
    fit: FitSummaryFit;
    onClick: () => void;
}

export function ProductFitCard({ fit, onClick }: ProductFitCardProps) {
    const score = normalizeScore(fit.combined_score);
    const likelihood = normalizeScore(fit.likelihood_score);
    const urgency = normalizeScore(fit.urgency_score);

    return (
        <div
            onClick={onClick}
            className="group relative bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer hover:shadow-sm overflow-hidden"
        >
            <div className="flex items-center h-full">
                {/* Left: Score & Product Title */}
                <div className="flex-1 px-4 py-3 flex items-center gap-4">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-sm text-slate-900 dark:text-white shrink-0">
                        {Math.round(score)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-slate-900 dark:text-white truncate">
                            {fit.product_name}
                        </h3>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {fit.top_drivers && fit.top_drivers.length > 0 ? (
                                fit.top_drivers.slice(0, 3).map((driver, i) => (
                                    <span key={i} className="inline-flex items-center text-[10px] text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-700/50 px-1.5 py-0.5 rounded">
                                        {driver}
                                    </span>
                                ))
                            ) : (
                                <span className="text-[10px] text-slate-500 dark:text-slate-400">No key drivers</span>
                            )}
                            {fit.top_drivers && fit.top_drivers.length > 3 && (
                                <span className="text-[10px] text-slate-500 dark:text-slate-400">+{fit.top_drivers.length - 3}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Metrics */}
                <div className="w-48 border-l border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/30 px-4 py-3 flex flex-col justify-center gap-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400">Likelihood</span>
                        <div className="flex items-center gap-2">
                            <div className="h-1 w-12 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-slate-600 dark:bg-slate-400 rounded-full" style={{ width: `${likelihood}%` }} />
                            </div>
                            <span className="w-7 text-right font-mono text-[11px] text-slate-900 dark:text-white">{Math.round(likelihood)}%</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400">Urgency</span>
                        <div className="flex items-center gap-2">
                            <div className="h-1 w-12 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-slate-600 dark:bg-slate-400 rounded-full" style={{ width: `${urgency}%` }} />
                            </div>
                            <span className="w-7 text-right font-mono text-[11px] text-slate-900 dark:text-white">{Math.round(urgency)}%</span>
                        </div>
                    </div>
                </div>

                {/* Arrow Icon */}
                <div className="flex items-center justify-center w-8 border-l border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/30 h-full">
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
            </div>
        </div>
    );
}
