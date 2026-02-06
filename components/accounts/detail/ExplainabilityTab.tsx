import { useState } from 'react';
import {
    CompanyExplainabilityResponse,
    SignalInterest,
    SignalEvent,
    FitSummaryFit
} from '@/lib/schemas';
import { SectionHeader } from './components';
import { TabHeaderWithAction } from './EnrichedEmptyState';
import { Progress } from '@/components/ui/progress';
import { cn, normalizeScore } from '@/lib/utils';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import {
    Zap,
    Activity,
    Clock,
    AlertCircle,
    ArrowRight,
    Users,
    Brain,
    Target,
    Calendar,
    Signal,
    SignalHigh,
    SignalMedium,
    SignalLow,
    SignalZero,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface NarrativeCardProps {
    title: string;
    icon: LucideIcon;
    content: string;
    accentColor: 'violet' | 'amber' | 'blue';
}

function NarrativeCard({ title, icon: Icon, content, accentColor }: NarrativeCardProps) {
    const colorClasses = {
        violet: {
            iconBg: 'bg-violet-100 dark:bg-violet-900/30',
            iconText: 'text-violet-600 dark:text-violet-400',
        },
        amber: {
            iconBg: 'bg-amber-100 dark:bg-amber-900/30',
            iconText: 'text-amber-600 dark:text-amber-400',
        },
        blue: {
            iconBg: 'bg-blue-100 dark:bg-blue-900/30',
            iconText: 'text-blue-600 dark:text-blue-400',
        },
    };

    const colors = colorClasses[accentColor];

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                    <div className={cn('w-7 h-7 rounded-md flex items-center justify-center', colors.iconBg)}>
                        <Icon className={cn('w-4 h-4', colors.iconText)} />
                    </div>
                    <CardTitle className="text-sm font-semibold text-slate-900 dark:text-white">
                        {title}
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                    {content}
                </p>
            </CardContent>
        </Card>
    );
}

interface ExplainabilityTabProps {
    data: CompanyExplainabilityResponse;
    onSelectFit: (productId: number) => void;
    onSelectSignal: (signalId: number) => void;
    /** Callback to regenerate signals and fits for all products */
    onProcess?: (onProgress?: (status: string) => void) => Promise<void>;
}

export function ExplainabilityTab({ data, onSelectFit, onSelectSignal, onProcess }: ExplainabilityTabProps) {
    const { signals_summary, fits_summary, data_coverage, freshness, signal_narrative, interest_narrative, event_narrative } = data;
    const [processingStatus, setProcessingStatus] = useState<string | undefined>(undefined);

    const handleFitClick = (productId: number) => {
        onSelectFit(productId);
    };

    const handleSignalClick = (signalId: number) => {
        onSelectSignal(signalId);
    };

    const handleRecalculate = async () => {
        if (onProcess) {
            setProcessingStatus('Starting...');
            try {
                await onProcess((status) => {
                    setProcessingStatus(status);
                });
            } finally {
                setProcessingStatus(undefined);
            }
        }
    };

    const hasNarratives = signal_narrative || interest_narrative || event_narrative;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {hasNarratives && (
                <section className="space-y-3 pb-6 border-b border-slate-200 dark:border-slate-800">
                    <div className="space-y-3">
                        {signal_narrative && (
                            <NarrativeCard
                                title="Signal Analysis"
                                icon={Brain}
                                content={signal_narrative}
                                accentColor="violet"
                            />
                        )}
                        {interest_narrative && (
                            <NarrativeCard
                                title="Interest Analysis"
                                icon={Target}
                                content={interest_narrative}
                                accentColor="amber"
                            />
                        )}
                        {event_narrative && (
                            <NarrativeCard
                                title="Event Analysis"
                                icon={Calendar}
                                content={event_narrative}
                                accentColor="blue"
                            />
                        )}
                    </div>
                </section>
            )}

            {/* Product Fit Section */}
            <section>
                {onProcess ? (
                    <TabHeaderWithAction
                        title="Product Fit"
                        actionLabel="Recalculate All"
                        onAction={handleRecalculate}
                        loadingStatus={processingStatus}
                    />
                ) : (
                    <SectionHeader title="Product Fit" />
                )}

                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 gap-2"
                >
                    {fits_summary.map((fit, idx) => (
                        <motion.div key={fit.product_id} variants={fadeInUp}>
                            <FitCard
                                fit={fit}
                                onClick={() => handleFitClick(fit.product_id)}
                                index={idx}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* Signal Analysis Section */}
            <section className="pt-6 border-t border-slate-200 dark:border-slate-800">
                <SectionHeader title="Signal Intelligence" color="bg-violet-600" />

                <div className="space-y-6">
                    {/* Interests */}
                    {signals_summary.interests.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Detected Interests
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {signals_summary.interests.map((signal, idx) => (
                                    <SignalCard
                                        key={idx}
                                        signal={signal}
                                        type="interest"
                                        onClick={() => handleSignalClick(signal.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Events */}
                    {signals_summary.events.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Key Events
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {signals_summary.events.map((signal, idx) => (
                                    <SignalCard
                                        key={idx}
                                        signal={signal}
                                        type="event"
                                        onClick={() => handleSignalClick(signal.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {signals_summary.interests.length === 0 && signals_summary.events.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                            <AlertCircle className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-3" />
                            <p className="font-medium text-slate-700 dark:text-slate-300">No signals detected</p>
                            <p className="text-sm text-slate-500 mt-1">AI analysis didn&apos;t identify specific interests or events.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Data Quality Footer */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2" title="Source coverage">
                            <Users className="h-3.5 w-3.5" />
                            <span>{data_coverage?.employees_analyzed?.toLocaleString() || 0} Employees Analyzed</span>
                        </div>
                        <div className="flex items-center gap-2" title="Signal density">
                            <Activity className="h-3.5 w-3.5" />
                            <span>{data_coverage?.signals_analyzed?.toLocaleString() || 0} Signals Found</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Data Freshness: {freshness?.avg_source_age_days ? `${Math.round(freshness.avg_source_age_days)} days avg` : 'Unknown'}</span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span>Last updated: {freshness?.newest_source ? new Date(freshness.newest_source).toLocaleDateString() : 'Unknown'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FitCard({ fit, onClick, index }: { fit: FitSummaryFit, onClick: () => void, index: number }) {
    // Normalize scores to 0-100
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

function SignalStrengthIcon({ strength, className }: { strength: number; className?: string }) {
    if (strength >= 8) return <Signal className={className} />;
    if (strength >= 6) return <SignalHigh className={className} />;
    if (strength >= 4) return <SignalMedium className={className} />;
    if (strength >= 2) return <SignalLow className={className} />;
    return <SignalZero className={className} />;
}

function SignalCard({ signal, type, onClick }: { signal: SignalInterest | SignalEvent, type: 'interest' | 'event', onClick: () => void }) {
    const isHighConfidence = signal.confidence > 0.8;

    // Map source types to colors
    const sourceTypeColors: Record<string, string> = {
        'employee': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
        'post': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
        'technographics': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
        'job': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
        'news': 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
        'default': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    };

    const getSourceTypeColor = (sourceType: string) => {
        const key = sourceType.toLowerCase();
        return sourceTypeColors[key] || sourceTypeColors['default'];
    };

    // Format source type for display
    const formatSourceType = (sourceType: string) => {
        return sourceType.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    };

    return (
        <div
            onClick={onClick}
            className="group relative overflow-hidden transition-all hover:shadow-sm cursor-pointer bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 flex flex-col h-full"
        >
            <div className="px-4 py-3 flex flex-col h-full">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                        {type === 'interest' ? (
                            <Zap className="h-3.5 w-3.5 text-amber-500" />
                        ) : (
                            <Activity className="h-3.5 w-3.5 text-blue-500" />
                        )}
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                            {signal.display_name || signal.category}
                        </span>
                    </div>
                    {isHighConfidence && (
                        <div title="High Confidence" className="flex-shrink-0">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.5)] animate-pulse" />
                        </div>
                    )}
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

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3 flex-grow leading-relaxed">
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
                        <span className="font-medium text-slate-700 dark:text-slate-300 inline-flex items-center gap-1">
                            <SignalStrengthIcon strength={signal.strength} className="w-3 h-3" />
                            {Math.round(signal.strength)}/10
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

