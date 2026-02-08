import { Users, Flame, Clock, MessageSquare, TrendingUp, AlertCircle, ChevronRight } from 'lucide-react';
import { AccountNeedingAttention } from './types';
import { cn } from '@/lib/utils';

const ATTENTION_CONFIG = {
    unassigned_high_fit: { icon: Users, color: 'text-amber-500' },
    high_fit_not_contacted: { icon: Flame, color: 'text-orange-500' },
    stale: { icon: Clock, color: 'text-slate-400' },
    needs_followup: { icon: MessageSquare, color: 'text-blue-500' },
    newly_added: { icon: TrendingUp, color: 'text-emerald-500' },
};

export function NeedsAttentionCard({
    accounts,
    onCompanyClick,
    onViewAll,
}: {
    accounts: AccountNeedingAttention[];
    onCompanyClick: (domain: string) => void;
    onViewAll: () => void;
}) {
    if (accounts.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col min-h-[220px]">
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-slate-500" />
                        <h3 className="font-medium text-sm text-slate-900 dark:text-white">Needs Attention</h3>
                    </div>
                </div>
                <div className="p-6 flex flex-col items-center justify-center flex-1 text-center bg-slate-50/50 dark:bg-slate-800/20">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                        <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                        No unassigned companies
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[220px] leading-relaxed">
                        This card lists campaign companies that do not have a partner assigned.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <h3 className="font-medium text-sm text-slate-900 dark:text-white">Needs Attention</h3>
                </div>
                <button
                    onClick={onViewAll}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                    View all
                </button>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {accounts.map((account) => {
                    const config = ATTENTION_CONFIG[account.reason];
                    const Icon = config.icon;

                    return (
                        <button
                            key={account.domain}
                            onClick={() => onCompanyClick(account.domain)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
                        >
                            <Icon className={cn("w-4 h-4 shrink-0", config.color)} />
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                    {account.name}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                    {account.reasonLabel}
                                </div>
                            </div>
                            {account.fitScore !== null && (
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                    {Math.round(account.fitScore * 100)}%
                                </span>
                            )}
                            <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
