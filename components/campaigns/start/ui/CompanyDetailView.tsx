'use client';

import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { SectionHeader, DetailCell } from '@/components/accounts/detail/components';
import { CompanyDetailHeader } from './CompanyDetailHeader';
import { CompanyDetailSkeleton } from './CompanyDetailSkeleton';
import type { WSCompanyResult, CompanyRead, CompanyExplainabilityResponse, FitSummaryFit, SignalInterest, SignalEvent } from '@/lib/schemas';
import { Sparkles, TrendingUp, Zap, Calendar, Brain, Target, Package, Radio, Building, CircleQuestionMark } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { LucideIcon } from 'lucide-react';

type CompanyDetailTab = 'narratives' | 'product-fit' | 'signals' | 'details';

interface CompanyDetailViewProps {
    company: WSCompanyResult;
    companyData: CompanyRead | null;
    explainability: CompanyExplainabilityResponse | null;
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

function getFitScoreColor(score: number): string {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-amber-500';
    return 'bg-slate-400';
}

function formatLocation(company: CompanyRead): string {
    const parts = [company.hq_city, company.hq_state, company.hq_country].filter(Boolean);
    return parts.join(', ') || '—';
}

function ProductFitCard({ fit }: { fit: FitSummaryFit }) {
    const combinedPercent = Math.round(fit.combined_score * 100);
    const likelihoodPercent = Math.round(fit.likelihood_score * 100);
    const urgencyPercent = Math.round(fit.urgency_score * 100);

    return (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3 mb-3">
                <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg",
                    getFitScoreColor(combinedPercent)
                )}>
                    {combinedPercent}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 dark:text-white truncate">
                        {fit.product_name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {fit.top_drivers.slice(0, 3).join(', ')}
                    </p>
                </div>
            </div>

            <div className="space-y-2">
                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Likelihood
                        </span>
                        <span className="font-medium text-slate-900 dark:text-white">{likelihoodPercent}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 rounded-full transition-all"
                            style={{ width: `${likelihoodPercent}%` }}
                        />
                    </div>
                </div>
                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            Urgency
                        </span>
                        <span className="font-medium text-slate-900 dark:text-white">{urgencyPercent}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-amber-500 rounded-full transition-all"
                            style={{ width: `${urgencyPercent}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function SignalCard({ signal, type }: { signal: SignalInterest | SignalEvent; type: 'interest' | 'event' }) {
    const strengthPercent = Math.round(signal.strength * 10);
    const Icon = type === 'interest' ? Sparkles : Calendar;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
            <div className="flex items-start gap-2 mb-2">
                <div className={cn(
                    "w-6 h-6 rounded flex items-center justify-center shrink-0",
                    type === 'interest'
                        ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                        : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                )}>
                    <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                    <h5 className="font-medium text-sm text-slate-900 dark:text-white truncate">
                        {signal.display_name || signal.category}
                    </h5>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className={cn(
                            "text-xs font-medium px-1.5 py-0.5 rounded",
                            strengthPercent >= 70
                                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                                : strengthPercent >= 40
                                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        )}>
                            {strengthPercent}% strength
                        </span>
                    </div>
                </div>
            </div>
            {signal.evidence_summary && (
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-2">
                    {signal.evidence_summary}
                </p>
            )}
            {signal.source_types && signal.source_types.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                    {signal.source_types.slice(0, 3).map(source => (
                        <span
                            key={source}
                            className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded"
                        >
                            {source}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

export function CompanyDetailView({
    company,
    companyData,
    explainability,
    isLoading,
    onClose,
}: CompanyDetailViewProps) {
    const [activeTab, setActiveTab] = useState<CompanyDetailTab>('narratives');

    // Extract narrative content
    const sampleSignalNarrative = explainability?.signal_narrative ?? "This company shows strong buying signals across multiple dimensions. Employee activity on LinkedIn indicates active research into solutions similar to your offering, with 12 employees engaging with relevant content in the past 30 days. Technical job postings suggest they're building capabilities that align with your product's value proposition.";
    const sampleInterestNarrative = explainability?.interest_narrative ?? "Based on content engagement patterns, this company has demonstrated sustained interest in cloud infrastructure modernization and DevOps automation. Key decision-makers have been consuming thought leadership content around cost optimization and scalability challenges.";
    const sampleEventNarrative = explainability?.event_narrative ?? "Recent funding round of $50M Series C positions them for expansion. Leadership changes in the past quarter include a new CTO with a track record of digital transformation initiatives. They recently announced a partnership that signals strategic alignment with your target market.";

    const hasProductFit = explainability?.fits_summary && explainability.fits_summary.length > 0;
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
                            <div className="space-y-3">
                                <NarrativeCard
                                    title="Signal Analysis"
                                    icon={Brain}
                                    content={sampleSignalNarrative}
                                    accentColor="violet"
                                />
                                <NarrativeCard
                                    title="Interest Analysis"
                                    icon={Target}
                                    content={sampleInterestNarrative}
                                    accentColor="amber"
                                />
                                <NarrativeCard
                                    title="Event Analysis"
                                    icon={Calendar}
                                    content={sampleEventNarrative}
                                    accentColor="blue"
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="product-fit" className="p-7">
                            {hasProductFit ? (
                                <div className="space-y-3">
                                    {explainability!.fits_summary!.map((fit) => (
                                        <ProductFitCard key={fit.product_id} fit={fit} />
                                    ))}
                                </div>
                            ) : (
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
