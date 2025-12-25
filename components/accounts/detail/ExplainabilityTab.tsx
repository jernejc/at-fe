import {
    CompanyExplainabilityResponse,
    SignalInterest,
    SignalEvent,
    FitSummaryFit
} from '@/lib/schemas';
import { SectionHeader } from './components';
import { TabHeaderWithAction } from './EnrichedEmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
    Target,
    Zap,
    Activity,
    Clock,
    AlertCircle,
    ArrowRight,
    Users,
    Database,
    Calendar,
    BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ExplainabilityTabProps {
    data: CompanyExplainabilityResponse;
    onSelectFit: (productId: number) => void;
    onSelectSignal: (signalId: number) => void;
    onProcess?: () => Promise<void>;
}

export function ExplainabilityTab({ data, onSelectFit, onSelectSignal, onProcess }: ExplainabilityTabProps) {
    const { signals_summary, fits_summary, data_coverage, freshness, company_domain } = data;

    const handleFitClick = (productId: number) => {
        onSelectFit(productId);
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    const handleSignalClick = (signalId: number) => {
        onSelectSignal(signalId);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Main Content: Fit Scores */}
            <div className="space-y-6">
                {onProcess ? (
                    <TabHeaderWithAction
                        title="Product Fit"
                        actionLabel="Regenerate"
                        onAction={onProcess}
                    />
                ) : (
                    <SectionHeader title="Product Fit" />
                )}

                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 gap-2"
                >
                    {fits_summary.map((fit, idx) => (
                        <motion.div key={fit.product_id} variants={item}>
                            <FitCard
                                fit={fit}
                                onClick={() => handleFitClick(fit.product_id)}
                                index={idx}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* Signal Analysis Section */}
            <section className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                <SectionHeader title="Signal Intelligence" />

                <div className="grid gap-6">
                    {/* Interests */}
                    {signals_summary.interests.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider pl-1">
                                Detected Interests
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        <div className="space-y-4 pt-4">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider pl-1">
                                Key Events
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        <div className="flex flex-col items-center justify-center py-16 text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full mb-3">
                                <AlertCircle className="h-6 w-6 text-slate-400" />
                            </div>
                            <p className="font-medium text-slate-900 dark:text-slate-200">No signals detected</p>
                            <p className="text-sm text-slate-500 mt-1 max-w-sm text-center">Our AI couldn't currently identify specific interests or events for this company.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Data Quality Footer */}
            <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground bg-muted/20 -mx-6 px-6 pb-6 -mb-6">
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
                    <span className="text-muted-foreground/50">•</span>
                    <span>Last updated: {freshness?.newest_source ? new Date(freshness.newest_source).toLocaleDateString() : 'Unknown'}</span>
                </div>
            </div>
        </div>
    );
}

function FitCard({ fit, onClick, index }: { fit: FitSummaryFit, onClick: () => void, index: number }) {
    // Normalize scores to 0-100
    const score = fit.combined_score <= 1 ? fit.combined_score * 100 : fit.combined_score;
    const likelihood = fit.likelihood_score <= 1 ? fit.likelihood_score * 100 : fit.likelihood_score;
    const urgency = fit.urgency_score <= 1 ? fit.urgency_score * 100 : fit.urgency_score;

    return (
        <div
            onClick={onClick}
            className="group relative bg-card rounded-md border border-border hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer hover:shadow-sm overflow-hidden"
        >
            <div className="flex items-center h-full">
                {/* Left: Score & Product Title */}
                <div className="flex-1 px-4 py-1 flex items-center gap-4">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full border border-muted bg-muted/30 font-semibold text-sm text-foreground shrink-0">
                        {Math.round(score)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-foreground truncate">
                            {fit.product_name}
                        </h3>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {fit.top_drivers && fit.top_drivers.length > 0 ? (
                                fit.top_drivers.slice(0, 3).map((driver, i) => (
                                    <span key={i} className="inline-flex items-center text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                                        {driver}
                                    </span>
                                ))
                            ) : (
                                <span className="text-[10px] text-muted-foreground">No key drivers</span>
                            )}
                            {fit.top_drivers && fit.top_drivers.length > 3 && (
                                <span className="text-[10px] text-muted-foreground">+{fit.top_drivers.length - 3}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Metrics */}
                <div className="w-48 border-l border-border bg-muted/5 px-4 py-3 flex flex-col justify-center gap-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Likelihood</span>
                        <div className="flex items-center gap-2">
                            <div className="h-1 w-12 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-foreground/60 rounded-full" style={{ width: `${likelihood}%` }} />
                            </div>
                            <span className="w-7 text-right font-mono text-[11px] text-foreground">{Math.round(likelihood)}%</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Urgency</span>
                        <div className="flex items-center gap-2">
                            <div className="h-1 w-12 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-foreground/60 rounded-full" style={{ width: `${urgency}%` }} />
                            </div>
                            <span className="w-7 text-right font-mono text-[11px] text-foreground">{Math.round(urgency)}%</span>
                        </div>
                    </div>
                </div>

                {/* Arrow Icon */}
                <div className="flex items-center justify-center w-8 border-l border-border bg-card">
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </div>
            </div>
        </div>
    );
}

function SignalCard({ signal, type, onClick }: { signal: SignalInterest | SignalEvent, type: 'interest' | 'event', onClick: () => void }) {
    const isHighConfidence = signal.confidence > 0.8;

    return (
        <Card
            onClick={onClick}
            className="group relative overflow-hidden transition-all hover:shadow-md cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 flex flex-col h-full"
        >
            <CardContent className="px-4 py-1 flex flex-col h-full">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                        {type === 'interest' ? (
                            <Zap className="h-3.5 w-3.5 text-amber-500" />
                        ) : (
                            <Activity className="h-3.5 w-3.5 text-blue-500" />
                        )}
                        <span className="text-sm font-semibold text-foreground">
                            {signal.category}
                        </span>
                    </div>
                    {isHighConfidence && (
                        <div title="High Confidence" className="flex-shrink-0">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)] animate-pulse" />
                        </div>
                    )}
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-grow font-normal leading-relaxed">
                    {signal.evidence_summary}
                </p>

                <div className="mt-auto pt-3 border-t border-border/50">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-medium text-muted-foreground">Signal Strength</span>
                        <span className="font-bold text-foreground">{Math.round(signal.strength)}%</span>
                    </div>
                    <Progress value={signal.strength} className="h-1.5" indicatorClassName="bg-slate-700 dark:bg-slate-300" />
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-[10px] text-muted-foreground">{signal.contributor_count} source{signal.contributor_count !== 1 ? 's' : ''}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
