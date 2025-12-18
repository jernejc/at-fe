import {
    CompanyExplainabilityResponse,
    SignalInterest,
    SignalEvent
} from '@/lib/schemas';
import { SectionHeader } from './components';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Brain,
    Target,
    Zap,
    Clock,
    Database,
    TrendingUp,
    Activity,
    AlertCircle
} from 'lucide-react';

interface ExplainabilityTabProps {
    data: CompanyExplainabilityResponse;
}

export function ExplainabilityTab({ data }: ExplainabilityTabProps) {
    const { signals_summary, fits_summary, data_coverage, freshness } = data;

    // Helper to get color based on score
    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600 dark:text-green-400";
        if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
        return "text-red-600 dark:text-red-400";
    };

    const getProgressColor = (score: number) => {
        if (score >= 80) return "bg-green-600";
        if (score >= 60) return "bg-yellow-600";
        return "bg-red-600";
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Summary Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {fits_summary.map((fit) => {
                    // Normalize scores to 0-100 if they are 0-1
                    const score = fit.combined_score <= 1 ? fit.combined_score * 100 : fit.combined_score;
                    const likelihood = fit.likelihood_score <= 1 ? fit.likelihood_score * 100 : fit.likelihood_score;
                    const urgency = fit.urgency_score <= 1 ? fit.urgency_score * 100 : fit.urgency_score;

                    return (
                        <div key={fit.product_id} className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
                                {/* Radial Score Chart */}
                                <div className="relative flex-shrink-0">
                                    <svg className="h-32 w-32 transform -rotate-90">
                                        <circle
                                            className="text-slate-100 dark:text-slate-800"
                                            strokeWidth="8"
                                            stroke="currentColor"
                                            fill="transparent"
                                            r="58"
                                            cx="64"
                                            cy="64"
                                        />
                                        <circle
                                            className={`${getScoreColor(score).split(' ')[0]} transition-all duration-1000 ease-out`}
                                            strokeWidth="8"
                                            strokeDasharray={364.4} // 2 * pi * 58
                                            strokeDashoffset={364.4 - (364.4 * score) / 100}
                                            strokeLinecap="round"
                                            stroke="currentColor"
                                            fill="transparent"
                                            r="58"
                                            cx="64"
                                            cy="64"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className={`text-3xl font-bold ${getScoreColor(score)}`}>
                                            {Math.round(score)}
                                        </span>
                                        <span className="text-xs uppercase font-bold text-slate-400 mt-1">Fit Score</span>
                                    </div>
                                </div>

                                {/* Stats & Drivers */}
                                <div className="flex-1 space-y-6 text-center sm:text-left">
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{fit.product_name || "Overall Fit Score"}</h3>
                                        <p className="text-sm text-slate-500 mt-1">Based on detected signals and company profile matching.</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto sm:mx-0">
                                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                                            <div className="text-xs text-slate-500 mb-1">Likelihood</div>
                                            <div className="font-semibold text-slate-700 dark:text-slate-200">{Math.round(likelihood)}%</div>
                                            <Progress value={likelihood} className="h-1 mt-2 bg-slate-200 dark:bg-slate-700" />
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                                            <div className="text-xs text-slate-500 mb-1">Urgency</div>
                                            <div className="font-semibold text-slate-700 dark:text-slate-200">{Math.round(urgency)}%</div>
                                            <Progress value={urgency} className="h-1 mt-2 bg-slate-200 dark:bg-slate-700" />
                                        </div>
                                    </div>

                                    {fit.top_drivers && fit.top_drivers.length > 0 && (
                                        <div className="pt-2">
                                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">Top Drivers</span>
                                            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                                                {fit.top_drivers.map((driver, i) => (
                                                    <Badge key={i} variant="secondary" className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800/50 px-2.5 py-1">
                                                        {driver}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Right Column: AI Explainer / Coverage Stats */}
                <div className="lg:col-span-1 space-y-4">
                    <Card className="h-full bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                <Database className="h-4 w-4" />
                                Data Coverage
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {data_coverage ? (
                                <>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-600 dark:text-slate-400">Employees Analyzed</span>
                                            <span className="font-bold text-slate-900 dark:text-slate-100">{data_coverage.employees_analyzed?.toLocaleString() || 0}</span>
                                        </div>
                                        <Progress value={Math.min(100, (data_coverage.employees_analyzed / 1000) * 100)} className="h-1.5" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-600 dark:text-slate-400">Signals Found</span>
                                            <span className="font-bold text-slate-900 dark:text-slate-100">{data_coverage.signals_analyzed?.toLocaleString() || 0}</span>
                                        </div>
                                        <Progress value={Math.min(100, (data_coverage.signals_analyzed / 50) * 100)} className="h-1.5" />
                                    </div>
                                </>
                            ) : (
                                <div className="text-sm text-muted-foreground">Coverage data unavailable</div>
                            )}

                            {freshness && (
                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Clock className="h-4 w-4 text-slate-400" />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Data Freshness</span>
                                    </div>
                                    <div className="bg-white dark:bg-slate-950 rounded-lg p-3 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                        <div className="text-xs text-slate-500">Average Age</div>
                                        <div className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">{Math.round(freshness.avg_source_age_days || 0)} days</div>
                                    </div>
                                    <div className="text-[10px] text-slate-400 text-right mt-2">
                                        Last calculated: {freshness.newest_source ? new Date(freshness.newest_source).toLocaleDateString() : 'Unknown'}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Signals Breakdown */}
            <div className="space-y-6">
                <SectionHeader title="Signal Analysis" />

                {/* Interests */}
                {signals_summary.interests.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-md">
                                <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            </div>
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Detected Interests</h3>
                        </div>
                        <div className="grid gap-3">
                            {signals_summary.interests.map((signal, idx) => (
                                <SignalCard key={idx} signal={signal} type="interest" />
                            ))}
                        </div>
                    </div>
                )}

                {/* Events */}
                {signals_summary.events.length > 0 && (
                    <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-2 px-1">
                            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                                <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Key Events</h3>
                        </div>
                        <div className="grid gap-3">
                            {signals_summary.events.map((signal, idx) => (
                                <SignalCard key={idx} signal={signal} type="event" />
                            ))}
                        </div>
                    </div>
                )}

                {signals_summary.interests.length === 0 && signals_summary.events.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                        <AlertCircle className="h-10 w-10 mb-4 opacity-20" />
                        <p className="font-medium">No signals detected</p>
                        <p className="text-sm opacity-70 mt-1">We couldn't find specific interests or events for this company.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function SignalCard({ signal, type }: { signal: SignalInterest | SignalEvent, type: 'interest' | 'event' }) {
    const isHighConfidence = signal.confidence > 0.8;
    const accentColor = type === 'interest' ? 'bg-amber-500' : 'bg-blue-500';
    const bgHover = type === 'interest' ? 'hover:bg-amber-50 dark:hover:bg-amber-900/10' : 'hover:bg-blue-50 dark:hover:bg-blue-900/10';
    const borderHover = type === 'interest' ? 'hover:border-amber-200 dark:hover:border-amber-800' : 'hover:border-blue-200 dark:hover:border-blue-800';

    return (
        <div className={`group relative bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl p-5 transition-all duration-200 ${bgHover} ${borderHover} hover:shadow-sm`}>
            <div className="flex flex-col sm:flex-row gap-4 sm:items-start justify-between">
                <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-base text-slate-900 dark:text-slate-100">{signal.category}</span>
                        {isHighConfidence && (
                            <Badge variant="secondary" className="gap-1 text-[10px] px-1.5 py-0 h-5 bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50">
                                <TrendingUp className="h-3 w-3" />
                                High Confidence
                            </Badge>
                        )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-4xl">
                        {signal.evidence_summary}
                    </p>
                </div>

                {/* Strength Meter */}
                <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1 min-w-[120px] pt-1 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 sm:border-l sm:pl-4 mt-2 sm:mt-0">
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Strength</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{Math.round(signal.strength)}%</span>
                    </div>
                    <div className="w-full sm:w-28 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full ${accentColor} transition-all duration-500`}
                            style={{ width: `${signal.strength}%` }}
                        />
                    </div>
                    <div className="hidden sm:block text-[10px] text-slate-400 mt-2">
                        based on {signal.contributor_count} signals
                    </div>
                </div>
            </div>
            {/* Mobile contributor count */}
            <div className="sm:hidden text-[10px] text-slate-400 mt-2">
                based on {signal.contributor_count} signals
            </div>
        </div>
    )
}
