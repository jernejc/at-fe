
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FitScore, SignalContribution } from '@/lib/schemas';
import {
    CheckCircle2,
    XCircle,
    TrendingUp,
    AlertCircle,
    Target,
    Zap,
    Activity
} from 'lucide-react';

interface FitBreakdownSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    fit: FitScore | null;
    isLoading?: boolean;
}

export function FitBreakdownSheet({ open, onOpenChange, fit, isLoading }: FitBreakdownSheetProps) {
    if (!fit && !isLoading) return null;

    // Helper to get color based on score
    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
        if (score >= 60) return "text-blue-600 dark:text-blue-400";
        return "text-slate-400 dark:text-slate-500";
    };

    const getProgressColor = (score: number) => {
        if (score >= 80) return "bg-emerald-500";
        if (score >= 60) return "bg-blue-500";
        return "bg-slate-300";
    };

    const normalizeScore = (val: number) => val <= 1 ? val * 100 : val;

    if (!fit) return null; // Should be handled by conditional rendering but satisfies typescript

    const score = normalizeScore(fit.combined_score);
    const likelihood = normalizeScore(fit.likelihood_score);
    const urgency = normalizeScore(fit.urgency_score);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="p-0 flex flex-col h-full bg-slate-50 dark:bg-slate-950 border-l shadow-xl"
                style={{ width: '100%', maxWidth: '650px', zIndex: 60 }}
                overlayClassName="!z-[60]"
            >
                {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
                    </div>
                ) : fit ? (
                    <>
                        <div className="p-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
                            <SheetHeader className="space-y-6">
                                <div className="flex items-start justify-between gap-6">
                                    <div className="space-y-2">
                                        <Badge variant="outline" className="mb-2 w-fit text-slate-500 font-normal border-slate-200">
                                            {fit.product_name}
                                        </Badge>
                                        <SheetTitle className="text-3xl font-bold flex items-center gap-2">
                                            Fit Breakdown
                                        </SheetTitle>
                                        <SheetDescription className="text-base max-w-md">
                                            Detailed analysis of why {fit.company_name} is a match for {fit.product_name}.
                                        </SheetDescription>
                                    </div>
                                    <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 min-w-[100px] shadow-sm">
                                        <span className={`text-4xl font-bold ${getScoreColor(score)}`}>
                                            {Math.round(score)}
                                        </span>
                                        <span className="text-[10px] uppercase font-bold text-slate-400 mt-1 tracking-wider">Fit Score</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8 max-w-lg">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs uppercase tracking-wider font-semibold text-slate-500">
                                            <span>Likelihood</span>
                                            <span className="text-slate-900 dark:text-slate-100">{Math.round(likelihood)}%</span>
                                        </div>
                                        <Progress value={likelihood} className="h-2" indicatorClassName={getProgressColor(likelihood)} />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs uppercase tracking-wider font-semibold text-slate-500">
                                            <span>Urgency</span>
                                            <span className="text-slate-900 dark:text-slate-100">{Math.round(urgency)}%</span>
                                        </div>
                                        <Progress value={urgency} className="h-2" indicatorClassName={getProgressColor(urgency)} />
                                    </div>
                                </div>
                            </SheetHeader>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6">
                            <div className="py-6 space-y-8">
                                {/* Top Drivers */}
                                {fit.top_drivers && fit.top_drivers.length > 0 && (
                                    <section className="space-y-3">
                                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                            <Target className="h-4 w-4 text-blue-500" />
                                            Top Drivers
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {fit.top_drivers.map((driver, i) => (
                                                <Badge key={i} variant="secondary" className="px-2.5 py-1 text-sm bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/50">
                                                    {driver}
                                                </Badge>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Signal Matches - Interests */}
                                {fit.interest_matches && fit.interest_matches.length > 0 && (
                                    <section className="space-y-4">
                                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                            <Zap className="h-4 w-4 text-amber-500" />
                                            Matched Interests
                                        </h3>
                                        <div className="space-y-3">
                                            {fit.interest_matches.map((match, i) => (
                                                <SignalMatchCard key={i} match={match} type="interest" />
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Signal Matches - Events */}
                                {fit.event_matches && fit.event_matches.length > 0 && (
                                    <section className="space-y-4">
                                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                            <Activity className="h-4 w-4 text-violet-500" />
                                            Matched Events
                                        </h3>
                                        <div className="space-y-3">
                                            {fit.event_matches.map((match, i) => (
                                                <SignalMatchCard key={i} match={match} type="event" />
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Missing Signals */}
                                {fit.missing_signals && fit.missing_signals.length > 0 && (
                                    <section className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                                        <h3 className="text-sm font-semibold text-slate-500 flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4" />
                                            Missing Signals
                                        </h3>
                                        <ul className="grid gap-2">
                                            {fit.missing_signals.map((signal, i) => (
                                                <li key={i} className="flex items-center gap-2 text-sm text-slate-500">
                                                    <XCircle className="h-4 w-4 text-slate-300 shrink-0" />
                                                    <span>{signal}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="p-8 text-center text-muted-foreground">
                        Failed to load fit breakdown.
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}

function SignalMatchCard({ match, type }: { match: SignalContribution, type: 'interest' | 'event' }) {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                    <div className="font-medium text-sm text-slate-900 dark:text-slate-100">
                        {match.category}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Strength: {Math.round(match.strength)}%
                        </span>
                        <span>•</span>
                        <span>Weight: {match.weight}x</span>
                    </div>
                </div>
                <div className="flex items-center gap-1 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded text-xs font-medium">
                    <CheckCircle2 className="h-3 w-3" />
                    +{Math.round(match.contribution)}
                </div>
            </div>
        </div>
    );
}
