'use client';

import type { CampaignComparison } from '@/lib/schemas';

interface ComparisonTabProps {
    comparison: CampaignComparison | null;
}

export function ComparisonTab({ comparison }: ComparisonTabProps) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Company Comparison</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Side-by-side analysis of target accounts
                </p>
            </div>
            {comparison && comparison.companies.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Company</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Industry</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Size</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Location</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Fit Score</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Top Signals</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {comparison.companies.map((company, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900 dark:text-white">{company.name || company.domain}</div>
                                        <div className="text-sm text-slate-500 dark:text-slate-400">{company.domain}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{company.industry || '—'}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{company.employee_count?.toLocaleString() || '—'}</td>
                                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{company.hq_country || '—'}</td>
                                    <td className="px-6 py-4">
                                        {company.fit_score !== null ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                                {Math.round(company.fit_score * 100)}%
                                            </span>
                                        ) : (
                                            <span className="text-slate-400 dark:text-slate-500">—</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {company.top_signals.slice(0, 3).map((signal, i) => (
                                                <span
                                                    key={i}
                                                    className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded"
                                                >
                                                    {signal}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                    <p>No comparison data available</p>
                    <p className="text-sm mt-1">Process companies to see insights</p>
                </div>
            )}
        </div>
    );
}
