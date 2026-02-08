
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
import { normalizeScore } from '@/lib/utils';
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

    if (!fit) return null;

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
                        <div className="p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
                            <SheetHeader className="space-y-4">
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
                                    <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-2xl border border-border min-w-[100px] shadow-sm">
                                        <span className="text-4xl font-bold text-foreground">
                                            {Math.round(score)}
                                        </span>
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground mt-1 tracking-wider">Fit Score</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8 max-w-lg">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            <span>Likelihood</span>
                                            <span className="text-foreground">{Math.round(likelihood)}%</span>
                                        </div>
                                        <Progress value={likelihood} className="h-2" />
                                    </div>
                                    {/* <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            <span>Urgency</span>
                                            <span className="text-foreground">{Math.round(urgency)}%</span>
                                        </div>
                                        <Progress value={urgency} className="h-2" />
                                    </div> */}
                                </div>
                            </SheetHeader>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6">
                            <div className="py-6 space-y-8">
                                {fit.top_drivers && fit.top_drivers.length > 0 && (
                                    <section className="space-y-3">
                                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                            <Target className="h-4 w-4 text-blue-500" />
                                            Top Drivers
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {fit.top_drivers.map((driver, i) => (
                                                <Badge key={i} variant="secondary" className="px-2.5 py-1 text-sm capitalize bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                                    {driver.replace(/_/g, ' ')}
                                                </Badge>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {fit.interest_matches && fit.interest_matches.length > 0 && (
                                    <section className="space-y-4">
                                        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                            <Zap className="h-4 w-4 text-primary" />
                                            Matched Interests
                                        </h3>
                                        <div className="space-y-3">
                                            {fit.interest_matches.map((match, i) => (
                                                <SignalMatchCard key={i} match={match} type="interest" />
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {fit.event_matches && fit.event_matches.length > 0 && (
                                    <section className="space-y-4">
                                        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                            <Activity className="h-4 w-4 text-primary" />
                                            Matched Events
                                        </h3>
                                        <div className="space-y-3">
                                            {fit.event_matches.map((match, i) => (
                                                <SignalMatchCard key={i} match={match} type="event" />
                                            ))}
                                        </div>
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
    // Format category for display if no display_name
    const formatCategory = (cat: string) => 
        cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    
    const displayName = match.display_name || formatCategory(match.category);
    
    // Only show category as secondary label if it's meaningfully different from display_name
    // (not just a formatting difference like "Rapid Hiring" vs "rapid_hiring")
    const shouldShowCategory = match.display_name && 
        match.display_name !== match.category &&
        match.display_name.toLowerCase().replace(/\s+/g, '') !== match.category.toLowerCase().replace(/_/g, '');
    
    return (
        <div className="bg-card border border-border rounded-lg p-3 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="font-medium text-sm text-foreground">
                        {displayName}
                    </div>
                    {shouldShowCategory && (
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            {match.category.replace(/_/g, ' ')}
                        </div>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {Math.round(match.strength)}% strength
                        </span>
                        <span className="text-muted-foreground/50">•</span>
                        <span>{match.weight}x weight</span>
                    </div>
                </div>
                <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded text-xs font-semibold shrink-0">
                    <CheckCircle2 className="h-3 w-3" />
                    +{match.contribution.toFixed(2)}
                </div>
            </div>
        </div>
    );
}

