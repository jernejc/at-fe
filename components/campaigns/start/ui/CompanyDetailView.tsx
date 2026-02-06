'use client';

import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn, normalizeScore } from '@/lib/utils';
import { SectionHeader, DetailCell } from '@/components/accounts/detail/components';
import { CompanyDetailHeader } from './CompanyDetailHeader';
import { CompanyDetailSkeleton } from './CompanyDetailSkeleton';
import type { WSCompanyResult, CompanyRead, CompanyExplainabilityResponse, FitScore, SignalContribution } from '@/lib/schemas';
import { TrendingUp, Zap, Calendar, Brain, Target, Package, Radio, Building, CircleQuestionMark, CheckCircle2, Activity } from 'lucide-react';
import { SignalCard } from '@/components/signals/SignalCard';
import { Progress } from '@/components/ui/progress';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { LucideIcon } from 'lucide-react';

type CompanyDetailTab = 'narratives' | 'product-fit' | 'signals' | 'details';

interface CompanyDetailViewProps {
    company: WSCompanyResult;
    companyData: CompanyRead | null;
    explainability: CompanyExplainabilityResponse | null;
    fitBreakdown?: FitScore | null;
    isLoading: boolean;
    onClose: () => void;
}

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

function formatLocation(company: CompanyRead): string {
    const parts = [company.hq_city, company.hq_state, company.hq_country].filter(Boolean);
    return parts.join(', ') || '—';
}

function FitSignalMatchCard({ match }: { match: SignalContribution }) {
    const formatCategory = (cat: string) =>
        cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    const displayName = match.display_name || formatCategory(match.category);

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="font-medium text-sm text-slate-900 dark:text-white">
                        {displayName}
                    </div>
                    {match.display_name && match.display_name !== match.category && (
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            {match.category.replace(/_/g, ' ')}
                        </div>
                    )}
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {Math.round(match.strength)}% strength
                        </span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span>{match.weight}x weight</span>
                    </div>
                </div>
                <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded text-xs font-semibold shrink-0">
                    <CheckCircle2 className="h-3 w-3" />
                    +{Math.round(match.contribution)}
                </div>
            </div>
        </div>
    );
}

export function CompanyDetailView({
    company,
    companyData,
    explainability,
    fitBreakdown,
    isLoading,
    onClose,
}: CompanyDetailViewProps) {
    const [activeTab, setActiveTab] = useState<CompanyDetailTab>('narratives');

    // Extract narrative content
    const signalNarrative = explainability?.signal_narrative;
    const interestNarrative = explainability?.interest_narrative;
    const eventNarrative = explainability?.event_narrative;
    const hasNarratives = signalNarrative || interestNarrative || eventNarrative;

    const hasProductFit = !!fitBreakdown;
    const hasSignals = explainability?.signals_summary && (
        (explainability.signals_summary.interests?.length ?? 0) > 0 ||
        (explainability.signals_summary.events?.length ?? 0) > 0
    );

    return (
        <div className="flex flex-col h-full min-h-0">
            <CompanyDetailHeader company={company} onClose={onClose} />

            <ScrollArea className="flex-1 min-h-0 overflow-y-auto">
                {isLoading ? (
                    <CompanyDetailSkeleton />
                ) : (
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as CompanyDetailTab)}>
                        <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 px-7 pt-4">
                            <TabsList className="w-full justify-start gap-4">
                                <TabsTrigger value="narratives" className="gap-2">
                                    <CircleQuestionMark className="w-4 h-4" />
                                    Why
                                </TabsTrigger>
                                <TabsTrigger value="product-fit" className="gap-2">
                                    <Package className="w-4 h-4" />
                                    Product Fit
                                </TabsTrigger>
                                <TabsTrigger value="signals" className="gap-2">
                                    <Radio className="w-4 h-4" />
                                    Signals
                                </TabsTrigger>
                                <TabsTrigger value="details" className="gap-2">
                                    <Building className="w-4 h-4" />
                                    Details
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="narratives" className="p-7">
                            {hasNarratives ? (
                                <div className="space-y-3">
                                    {signalNarrative && (
                                        <NarrativeCard
                                            title="Signal Analysis"
                                            icon={Brain}
                                            content={signalNarrative}
                                            accentColor="violet"
                                        />
                                    )}
                                    {interestNarrative && (
                                        <NarrativeCard
                                            title="Interest Analysis"
                                            icon={Target}
                                            content={interestNarrative}
                                            accentColor="amber"
                                        />
                                    )}
                                    {eventNarrative && (
                                        <NarrativeCard
                                            title="Event Analysis"
                                            icon={Calendar}
                                            content={eventNarrative}
                                            accentColor="blue"
                                        />
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <CircleQuestionMark className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                                    <p className="text-slate-500 dark:text-slate-400">
                                        No narrative data available.
                                    </p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="product-fit" className="p-7">
                            {hasProductFit ? (() => {
                                const score = normalizeScore(fitBreakdown!.combined_score);
                                const likelihood = normalizeScore(fitBreakdown!.likelihood_score);
                                const urgency = normalizeScore(fitBreakdown!.urgency_score);

                                return (
                                    <div className="space-y-6">
                                        {/* Score header */}
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-1">
                                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                                                    {fitBreakdown!.product_name}
                                                </h3>
                                            </div>
                                            <div className="flex flex-col items-center justify-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 min-w-20">
                                                <span className="text-3xl font-bold text-slate-900 dark:text-white">
                                                    {Math.round(score)}
                                                </span>
                                                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mt-0.5 tracking-wider">Fit Score</span>
                                            </div>
                                        </div>

                                        {/* Likelihood / Urgency bars */}
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                    <span>Likelihood</span>
                                                    <span className="text-slate-900 dark:text-white">{Math.round(likelihood)}%</span>
                                                </div>
                                                <Progress value={likelihood} className="h-2" />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                    <span>Urgency</span>
                                                    <span className="text-slate-900 dark:text-white">{Math.round(urgency)}%</span>
                                                </div>
                                                <Progress value={urgency} className="h-2" />
                                            </div>
                                        </div>

                                        {/* Top drivers */}
                                        {fitBreakdown!.top_drivers && fitBreakdown!.top_drivers.length > 0 && (
                                            <section className="space-y-3">
                                                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                                    <Target className="h-4 w-4 text-blue-500" />
                                                    Top Drivers
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {fitBreakdown!.top_drivers.map((driver, i) => (
                                                        <Badge key={i} variant="secondary" className="px-2.5 py-1 text-sm capitalize bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                                            {driver.replace(/_/g, ' ')}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </section>
                                        )}

                                        {/* Matched interests */}
                                        {fitBreakdown!.interest_matches && fitBreakdown!.interest_matches.length > 0 && (
                                            <section className="space-y-3">
                                                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                                    <Zap className="h-4 w-4 text-blue-500" />
                                                    Matched Interests
                                                </h4>
                                                <div className="space-y-2">
                                                    {fitBreakdown!.interest_matches.map((match, i) => (
                                                        <FitSignalMatchCard key={i} match={match} />
                                                    ))}
                                                </div>
                                            </section>
                                        )}

                                        {/* Matched events */}
                                        {fitBreakdown!.event_matches && fitBreakdown!.event_matches.length > 0 && (
                                            <section className="space-y-3">
                                                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                                    <Activity className="h-4 w-4 text-blue-500" />
                                                    Matched Events
                                                </h4>
                                                <div className="space-y-2">
                                                    {fitBreakdown!.event_matches.map((match, i) => (
                                                        <FitSignalMatchCard key={i} match={match} />
                                                    ))}
                                                </div>
                                            </section>
                                        )}
                                    </div>
                                );
                            })() : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Package className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                                    <p className="text-slate-500 dark:text-slate-400">
                                        No product fit data available.
                                    </p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="signals" className="p-7">
                            {hasSignals ? (
                                <div className="space-y-6">
                                    {/* Interests */}
                                    {(explainability!.signals_summary!.interests?.length ?? 0) > 0 && (
                                        <div>
                                            <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                                Detected Interests
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {explainability!.signals_summary!.interests!.slice(0, 6).map((interest) => (
                                                    <SignalCard key={interest.id} signal={interest} type="interest" />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Events */}
                                    {(explainability!.signals_summary!.events?.length ?? 0) > 0 && (
                                        <div>
                                            <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                                Key Events
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {explainability!.signals_summary!.events!.slice(0, 6).map((event) => (
                                                    <SignalCard key={event.id} signal={event} type="event" />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Radio className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                                    <p className="text-slate-500 dark:text-slate-400">
                                        No signal intelligence data available.
                                    </p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="details" className="p-7">
                            {companyData ? (
                                <div className="space-y-6">
                                    {/* Company Details Grid */}
                                    <section>
                                        <SectionHeader title="Company Details" color="bg-slate-600" />
                                        <div className="grid grid-cols-2 sm:grid-cols-4 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
                                            <DetailCell label="Industry" value={companyData.industry} />
                                            <DetailCell label="Type" value={companyData.company_type} />
                                            <DetailCell label="Size" value={companyData.employee_count_range} />
                                            <DetailCell label="Revenue" value={companyData.revenue} />
                                            <DetailCell label="Headquarters" value={formatLocation(companyData)} />
                                            <DetailCell label="Country" value={companyData.hq_country} />
                                            <DetailCell label="Founded" value={companyData.founded_year} />
                                            <DetailCell label="Stock" value={companyData.ticker} />
                                        </div>
                                    </section>

                                    {/* Specialties */}
                                    {companyData.specialties && companyData.specialties.length > 0 && (
                                        <section>
                                            <SectionHeader title="Specialties" count={companyData.specialties.length} color="bg-indigo-600" />
                                            <div className="flex flex-wrap gap-2">
                                                {companyData.specialties.map((specialty, idx) => (
                                                    <Badge
                                                        key={idx}
                                                        variant="secondary"
                                                        className="text-xs bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
                                                    >
                                                        {specialty}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {/* About Section */}
                                    {companyData.description && (
                                        <section>
                                            <SectionHeader title="About" color="bg-blue-600" />
                                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                                {companyData.description}
                                            </p>
                                        </section>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Building className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                                    <p className="text-slate-500 dark:text-slate-400">
                                        Unable to load company details.
                                    </p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                )}
            </ScrollArea>
        </div>
    );
}
