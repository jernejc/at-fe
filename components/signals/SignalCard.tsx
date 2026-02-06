import type { SignalInterest, SignalEvent } from '@/lib/schemas';
import { cn } from '@/lib/utils';
import {
    Activity,
    Signal,
    SignalHigh,
    SignalMedium,
    SignalLow,
    SignalZero,
    Sparkles,
} from 'lucide-react';

export function SignalStrengthIcon({ strength, className }: { strength: number; className?: string }) {
    if (strength >= 8) return <Signal className={className} />;
    if (strength >= 6) return <SignalHigh className={className} />;
    if (strength >= 4) return <SignalMedium className={className} />;
    if (strength >= 2) return <SignalLow className={className} />;
    return <SignalZero className={className} />;
}

const sourceTypeColors: Record<string, string> = {
    'employee': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    'post': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    'technographics': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    'job': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    'news': 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    'default': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

function getSourceTypeColor(sourceType: string) {
    const key = sourceType.toLowerCase();
    return sourceTypeColors[key] || sourceTypeColors['default'];
}

function formatSourceType(sourceType: string) {
    return sourceType.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function SignalCard({ signal, type, onClick }: { signal: SignalInterest | SignalEvent, type: 'interest' | 'event', onClick?: () => void }) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative overflow-hidden transition-all bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 flex flex-col h-full",
                onClick && "hover:shadow-sm cursor-pointer"
            )}
        >
            <div className="px-4 py-3 flex flex-col h-full">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                        {type === 'interest' ? (
                            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                        ) : (
                            <Activity className="h-3.5 w-3.5 text-blue-500" />
                        )}
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                            {signal.display_name || signal.category}
                        </span>
                    </div>
                    <span className={cn(
                        "text-xs font-medium px-1.5 py-0.5 rounded inline-flex items-center gap-1 shrink-0",
                        signal.strength >= 7
                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                            : signal.strength >= 4
                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    )}>
                        <SignalStrengthIcon strength={signal.strength} className="w-3 h-3" />
                        {Math.round(signal.strength)}/10
                    </span>
                </div>

                {/* Source types badges */}
                {signal.source_types && signal.source_types.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                        {signal.source_types.slice(0, 3).map((sourceType, i) => (
                            <span
                                key={i}
                                className={cn(
                                    "inline-flex items-center text-[9px] font-medium px-1.5 py-0.5 rounded",
                                    getSourceTypeColor(sourceType)
                                )}
                            >
                                {formatSourceType(sourceType)}
                            </span>
                        ))}
                        {signal.source_types.length > 3 && (
                            <span className="text-[9px] text-slate-500 dark:text-slate-400 px-1">
                                +{signal.source_types.length - 3}
                            </span>
                        )}
                    </div>
                )}

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3 grow leading-relaxed">
                    {signal.evidence_summary || 'No evidence summary available'}
                </p>

                <div className="mt-auto pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                            <span className="text-slate-500 dark:text-slate-400">
                                {signal.contributor_count} source{signal.contributor_count !== 1 ? 's' : ''}
                            </span>
                            {signal.component_count > 0 && (
                                <span className="text-slate-400 dark:text-slate-500">
                                    {signal.component_count} signal{signal.component_count !== 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
