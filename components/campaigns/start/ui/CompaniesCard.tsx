'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CompanyRowCompact } from '@/components/campaigns/CompanyRowCompact';
import { CompanyDetailView } from './CompanyDetailView';
import { getCompany, getCompanyExplainability } from '@/lib/api/companies';
import { getFitBreakdown } from '@/lib/api/fit-scores';
import type { WSCompanyResult, CompanyRead, CompanyExplainabilityResponse, WSSearchInsights, WSInterestFrequency, FitScore } from '@/lib/schemas';
import { Building2, SearchX, Sparkles, TrendingUp } from 'lucide-react';

interface CompaniesCardProps {
    companies: WSCompanyResult[];
    totalCount: number;
    className?: string;
    isLoading?: boolean;
    insights?: WSSearchInsights | null;
    interestSummary?: WSInterestFrequency[];
    selectedProductId?: number;
}

const animationConfig = {
    duration: 0.5,
    ease: [0.23, 1, 0.32, 1] as const,
};

// Interest pill component for displaying common interests
function InterestPill({
    interest,
    frequency,
    index
}: {
    interest: string;
    frequency: number;
    index: number;
}) {
    const normalizedWeight = Math.min(frequency / 8, 1);

    return (
        <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.03, ease: [0.23, 1, 0.32, 1] }}
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 text-xs"
        >
            <span className="text-slate-600 dark:text-slate-300 capitalize">
                {interest.replace(/_/g, ' ')}
            </span>
            <span className="flex items-center gap-0.5">
                {[0, 1, 2].map((i) => (
                    <span
                        key={i}
                        className={cn(
                            'w-1 h-1 rounded-full transition-colors',
                            i <= normalizedWeight * 2
                                ? 'bg-emerald-400 dark:bg-emerald-500'
                                : 'bg-slate-200 dark:bg-slate-700'
                        )}
                    />
                ))}
            </span>
        </motion.span>
    );
}

// Compact insights section for the companies list header
function CompaniesInsights({
    insights,
    interestSummary,
}: {
    insights?: WSSearchInsights | null;
    interestSummary?: WSInterestFrequency[];
}) {
    const hasObservation = insights?.observation;
    const hasInterests = interestSummary && interestSummary.length > 0;

    if (!hasObservation && !hasInterests) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5 bg-gradient-to-br from-slate-50/80 to-white dark:from-slate-800/30 dark:to-slate-900/50"
        >
            {/* Main observation */}
            {hasObservation && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.05 }}
                    className="flex items-start gap-2"
                >
                    <div className="flex items-center justify-center w-5 h-5 rounded-md bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/40 dark:to-amber-800/20 shrink-0 mt-0.5">
                        <Sparkles className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {insights!.observation}
                    </p>
                </motion.div>
            )}

            {/* Common interests */}
            {hasInterests && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-start gap-2"
                >
                    <div className="flex items-center justify-center w-5 h-5 rounded-md shrink-0 mt-0.5">
                        <TrendingUp className="w-3 h-3 text-slate-400" />
                    </div>
                    <div>
                        <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-1">
                            Common Interests
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap mt-2">
                            {interestSummary!.slice(0, 5).map((interest, index) => (
                                <InterestPill
                                    key={interest.interest}
                                    interest={interest.interest}
                                    frequency={interest.frequency}
                                    index={index}
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}

export function CompaniesCard({ companies, totalCount, className, isLoading = false, insights, interestSummary = [], selectedProductId }: CompaniesCardProps) {
    const [selectedCompany, setSelectedCompany] = useState<WSCompanyResult | null>(null);
    const [companyData, setCompanyData] = useState<CompanyRead | null>(null);
    const [explainability, setExplainability] = useState<CompanyExplainabilityResponse | null>(null);
    const [fitBreakdown, setFitBreakdown] = useState<FitScore | null>(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    const handleCompanyClick = async (company: WSCompanyResult) => {
        setSelectedCompany(company);
        setIsDetailLoading(true);
        setCompanyData(null);
        setExplainability(null);
        setFitBreakdown(null);

        try {
            const [companyRes, explainRes, fitRes] = await Promise.all([
                getCompany(company.domain),
                getCompanyExplainability(company.domain),
                selectedProductId
                    ? getFitBreakdown(company.domain, selectedProductId).catch(() => null)
                    : Promise.resolve(null),
            ]);

            setCompanyData(companyRes.company);
            setExplainability(explainRes);
            setFitBreakdown(fitRes);
        } catch (error) {
            console.error('Failed to load company details:', error);
        } finally {
            setIsDetailLoading(false);
        }
    };

    const handleCloseDetail = () => {
        setSelectedCompany(null);
        setCompanyData(null);
        setExplainability(null);
        setFitBreakdown(null);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={animationConfig}
            className={cn(
                'flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg',
                className
            )}
        >
            <AnimatePresence mode="wait">
                {!selectedCompany ? (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={animationConfig}
                        className="flex flex-col flex-1 min-h-0"
                    >
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                            <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-slate-500" />
                                <span className="font-medium text-slate-900 dark:text-white text-sm">
                                    Matching Companies
                                </span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                                {isLoading ? (
                                    <span className="flex items-center gap-1">
                                        <motion.span
                                            animate={{ opacity: [0.5, 1, 0.5] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        >
                                            Loading...
                                        </motion.span>
                                    </span>
                                ) : (
                                    `${totalCount} found`
                                )}
                            </Badge>
                        </div>

                        {/* Companies list */}
                        <ScrollArea className="flex-1 min-h-0">
                            {isLoading && companies.length === 0 ? (
                                // Skeleton loaders while searching
                                <div className="p-2 space-y-2">
                                    {[...Array(5)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-800"
                                        >
                                            <motion.div
                                                className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700"
                                                animate={{ opacity: [0.5, 0.8, 0.5] }}
                                                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                                            />
                                            <div className="flex-1 space-y-2">
                                                <motion.div
                                                    className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4"
                                                    animate={{ opacity: [0.5, 0.8, 0.5] }}
                                                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                                                />
                                                <motion.div
                                                    className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-1/2"
                                                    animate={{ opacity: [0.5, 0.8, 0.5] }}
                                                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                                                />
                                            </div>
                                            <motion.div
                                                className="w-12 h-6 bg-slate-200 dark:bg-slate-700 rounded"
                                                animate={{ opacity: [0.5, 0.8, 0.5] }}
                                                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : companies.length === 0 ? (
                                // Empty state - no results found
                                <div className="flex flex-col items-center justify-center h-full py-12 text-center px-4">
                                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                                        <SearchX className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                                    </div>
                                    <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                                        No matches found
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[200px]">
                                        Try adjusting your search criteria or using different keywords
                                    </p>
                                </div>
                            ) : (
                                // Companies list
                                <div>
                                    {companies.map((company, index) => (
                                        <motion.div
                                            key={company.domain}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.02, duration: 0.2 }}
                                        >
                                            <CompanyRowCompact
                                                name={company.name}
                                                domain={company.domain}
                                                logoBase64={company.logo_base64}
                                                industry={company.industry}
                                                employeeCount={company.employee_count}
                                                fitScore={company.match_score}
                                                signals={company.top_interests}
                                                rank={index + 1}
                                                onClick={() => handleCompanyClick(company)}
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>

                        {/* Insights section */}
                        {!isLoading && companies.length > 0 && (
                            <CompaniesInsights
                                insights={insights}
                                interestSummary={interestSummary}
                            />
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="detail"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        transition={animationConfig}
                        className="flex flex-col flex-1 min-h-0"
                    >
                        <CompanyDetailView
                            company={selectedCompany}
                            companyData={companyData}
                            explainability={explainability}
                            fitBreakdown={fitBreakdown}
                            isLoading={isDetailLoading}
                            onClose={handleCloseDetail}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
