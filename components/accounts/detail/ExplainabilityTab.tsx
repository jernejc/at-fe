import { useState } from 'react';
import {
    CompanyExplainabilityResponse,
    SignalInterest,
    SignalEvent,
    FitScore,
    FitSummaryFit
} from '@/lib/schemas';
import { SignalProvenanceResponse } from '@/lib/schemas/provenance';
import { getFitBreakdown, getSignalProvenance } from '@/lib/api';
import { SectionHeader } from './components';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FitBreakdownSheet } from './FitBreakdownSheet';
import { SignalProvenanceSheet } from './SignalProvenanceSheet';
import { cn } from '@/lib/utils';
import {
    Brain,
    Target,
    Zap,
    Clock,
    Database,
    TrendingUp,
    Activity,
    AlertCircle,
    ChevronRight,
    Sparkles,
    BarChart3,
    Layers,
    ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ExplainabilityTabProps {
    data: CompanyExplainabilityResponse;
}

export function ExplainabilityTab({ data }: ExplainabilityTabProps) {
    const { signals_summary, fits_summary, data_coverage, freshness, company_domain } = data;

    // State for Sheets
    const [selectedFit, setSelectedFit] = useState<FitScore | null>(null);
    const [isFitLoading, setIsFitLoading] = useState(false);
    const [isFitOpen, setIsFitOpen] = useState(false);

    const [selectedSignal, setSelectedSignal] = useState<SignalProvenanceResponse | null>(null);
    const [isSignalLoading, setIsSignalLoading] = useState(false);
    const [isSignalOpen, setIsSignalOpen] = useState(false);

    // Handlers
    const handleFitClick = async (productId: number) => {
        setIsFitLoading(true);
        setIsFitOpen(true);
        try {
            const fit = await getFitBreakdown(company_domain, productId);
            setSelectedFit(fit);
        } catch (error) {
            console.error("Failed to fetch fit breakdown", error);
            setIsFitOpen(false);
        } finally {
            setIsFitLoading(false);
        }
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

    const handleSignalClick = async (signalId: number) => {
        setIsSignalLoading(true);
        setIsSignalOpen(true);
        try {
            const signal = await getSignalProvenance(company_domain, signalId);
            setSelectedSignal(signal);
        } catch (error) {
            console.error("Failed to fetch signal provenance", error);
            setIsSignalOpen(false);
        } finally {
            setIsSignalLoading(false);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Top Section: Fit & Coverage */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Main Content: Fit Scores */}
                <div className="xl:col-span-8 space-y-4">
                    <SectionHeader title="Product Fit" />

                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid gap-4"
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

                {/* Sidebar: Coverage & Stats */}
                <div className="xl:col-span-4 space-y-4">
                    <div className="space-y-4">
                        <SectionHeader title="Intelligence Coverage" />
                        <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-sm">
                            <CardContent className="space-y-5 p-5">
                                {data_coverage ? (
                                    <>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-end">
                                                <span className="text-sm text-slate-600 dark:text-slate-400">Employees</span>
                                                <span className="font-mono text-lg font-bold text-slate-900 dark:text-slate-100">{data_coverage.employees_analyzed?.toLocaleString() || 0}</span>
                                            </div>
                                            <Progress value={Math.min(100, (data_coverage.employees_analyzed / 1000) * 100)} className="h-1.5" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-end">
                                                <span className="text-sm text-slate-600 dark:text-slate-400">Signals Found</span>
                                                <span className="font-mono text-lg font-bold text-slate-900 dark:text-slate-100">{data_coverage.signals_analyzed?.toLocaleString() || 0}</span>
                                            </div>
                                            <Progress value={Math.min(100, (data_coverage.signals_analyzed / 50) * 100)} className="h-1.5" />
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-sm text-slate-500">Coverage data unavailable</div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {freshness && (
                        <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-sm">
                            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    DATA FRESHNESS
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-sm text-slate-600 dark:text-slate-400">Average Age</div>
                                    <Badge variant="secondary" className="font-mono text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800">
                                        {Math.round(freshness.avg_source_age_days || 0)} days
                                    </Badge>
                                </div>
                                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    Updated: {freshness.newest_source ? new Date(freshness.newest_source).toLocaleDateString() : 'Unknown'}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Signal Analysis Section (Full Width) */}
            <section className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                <SectionHeader title="Signal Intelligence" />

                <div className="grid gap-6">
                    {/* Interests */}
                    {signals_summary.interests.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-md bg-amber-100/50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                                    <Zap className="h-4 w-4" />
                                </div>
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">detected interests</h3>
                            </div>
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
                        <div className="space-y-3 pt-2">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-md bg-blue-100/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                    <Activity className="h-4 w-4" />
                                </div>
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Key Events</h3>
                            </div>
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

            {/* Sheets */}
            <FitBreakdownSheet
                open={isFitOpen}
                onOpenChange={setIsFitOpen}
                fit={selectedFit}
                isLoading={isFitLoading}
            />
            <SignalProvenanceSheet
                open={isSignalOpen}
                onOpenChange={setIsSignalOpen}
                signal={selectedSignal}
                isLoading={isSignalLoading}
            />
        </div>
    );
}

// ----------------------------------------------------------------------
// Sub-components
// ----------------------------------------------------------------------

function FitCard({ fit, onClick, index }: { fit: FitSummaryFit, onClick: () => void, index: number }) {
    // Normalize scores to 0-100
    const score = fit.combined_score <= 1 ? fit.combined_score * 100 : fit.combined_score;
    const likelihood = fit.likelihood_score <= 1 ? fit.likelihood_score * 100 : fit.likelihood_score;
    const urgency = fit.urgency_score <= 1 ? fit.urgency_score * 100 : fit.urgency_score;

    return (
        <div
            onClick={onClick}
            className="group relative bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 p-0 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer shadow-sm hover:shadow-md overflow-hidden"
        >
            <div className="flex flex-col sm:flex-row h-full">
                {/* Left: Score & Product Title */}
                <div className="flex-1 p-5 flex items-start gap-5">
                    <div className="flex flex-col items-center justify-center h-14 w-14 rounded-full border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-bold text-lg text-slate-700 dark:text-slate-200 shrink-0">
                        {Math.round(score)}
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {fit.product_name}
                        </h3>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {fit.top_drivers && fit.top_drivers.length > 0 ? (
                                fit.top_drivers.slice(0, 3).map((driver, i) => (
                                    <span key={i} className="inline-flex items-center text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                                        {driver}
                                    </span>
                                ))
                            ) : (
                                <span className="text-xs text-slate-400">No key drivers</span>
                            )}
                            {fit.top_drivers && fit.top_drivers.length > 3 && (
                                <span className="text-[10px] text-slate-400 self-center">+{fit.top_drivers.length - 3}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Metrics & Action */}
                <div className="sm:w-64 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 p-5 flex flex-col justify-center gap-4">
                    <div className="space-y-3">
                        {/* Mini Meters */}
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 font-medium">Likelihood</span>
                            <div className="flex items-center gap-2">
                                <div className="h-1.5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-slate-800 dark:bg-slate-200 rounded-full" style={{ width: `${likelihood}%` }} />
                                </div>
                                <span className="w-8 text-right font-mono text-slate-700 dark:text-slate-300">{Math.round(likelihood)}%</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 font-medium">Urgency</span>
                            <div className="flex items-center gap-2">
                                <div className="h-1.5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-slate-800 dark:bg-slate-200 rounded-full" style={{ width: `${urgency}%` }} />
                                </div>
                                <span className="w-8 text-right font-mono text-slate-700 dark:text-slate-300">{Math.round(urgency)}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Arrow Icon absolutely positioned or flexed */}
                <div className="hidden sm:flex items-center justify-center w-10 border-l border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 group-hover:bg-slate-50 dark:group-hover:bg-slate-900 transition-colors">
                    <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                </div>
            </div>
        </div>
    );
}

function SignalCard({ signal, type, onClick }: { signal: SignalInterest | SignalEvent, type: 'interest' | 'event', onClick: () => void }) {
    const isHighConfidence = signal.confidence > 0.8;

    return (
        <div
            onClick={onClick}
            className="group relative overflow-hidden bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md cursor-pointer flex flex-col h-full"
        >
            <div className="pl-1 flex flex-col h-full">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold text-slate-900 dark:text-slate-100`}>
                            {signal.category}
                        </span>
                    </div>
                    {isHighConfidence && (
                        <div title="High Confidence" className="flex-shrink-0">
                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)] animate-pulse" />
                        </div>
                    )}
                </div>

                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 flex-grow font-normal">
                    {signal.evidence_summary}
                </p>

                <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-medium text-slate-500">Signal Strength</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">{Math.round(signal.strength)}%</span>
                    </div>
                    {/* Segmented Progress Bar */}
                    <div className="flex gap-0.5 h-1.5">
                        {[...Array(10)].map((_, i) => {
                            const threshold = (i + 1) * 10;
                            const isActive = signal.strength >= threshold - 5;
                            return (
                                <div
                                    key={i}
                                    className={`flex-1 rounded-sm transition-all duration-500 ${isActive ? 'bg-slate-800 dark:bg-slate-200' : 'bg-slate-100 dark:bg-slate-800'}`}
                                    style={{ opacity: isActive ? 0.6 + (i * 0.04) : 1 }}
                                />
                            );
                        })}
                    </div>
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-[10px] text-slate-400">{signal.contributor_count} source{signal.contributor_count !== 1 ? 's' : ''}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
