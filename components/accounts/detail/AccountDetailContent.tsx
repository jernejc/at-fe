'use client';

import { ReactNode, useCallback } from 'react';
import {
    CompanyRead,
    CompanyExplainabilityResponse,
    PlaybookSummary,
    JobPostingSummary,
    NewsArticleSummary,
    EmployeeSummary,
    ProductSummary,
    PlaybookContactResponse,
} from '@/lib/schemas';
import { ProcessingOptions } from '@/lib/api';
import { OverviewTab } from './OverviewTab';
import { ExplainabilityTab } from './ExplainabilityTab';
import { PlaybooksTab, PlaybookContext } from './PlaybooksTab';
import { PeopleTab } from './PeopleTab';
import { JobsTab } from './JobsTab';
import { NewsTab } from './NewsTab';
import { UpdatesTab } from './UpdatesTab';
import { EnrichedEmptyState, PlaybookEmptyState } from './EnrichedEmptyState';
import { Target, Users, Briefcase, Newspaper } from 'lucide-react';

interface AccountDetailContentProps {
    activeTab: string;
    company: CompanyRead;
    domain: string;
    explainability: CompanyExplainabilityResponse | null;
    playbooks: PlaybookSummary[];
    decisionMakers: EmployeeSummary[];
    employees: EmployeeSummary[];
    employeesTotal: number;
    jobs: JobPostingSummary[];
    jobsTotal: number;
    news: NewsArticleSummary[];
    newsTotal: number;
    onSelectEmployee: (employee: EmployeeSummary) => void;
    onSelectFit: (productId: number) => void;
    onSelectSignal: (signalId: number) => void;
    onSelectJob: (job: JobPostingSummary) => void;
    onSelectPlaybookEmployee: (employeeId: number | null, preview: { name: string; title?: string }, context: PlaybookContext) => void;
    onLoadMoreJobs: () => Promise<void>;
    onLoadMoreNews: () => Promise<void>;
    onLoadMoreEmployees: () => Promise<void>;
    loadingMoreJobs: boolean;
    loadingMoreNews: boolean;
    loadingMoreEmployees: boolean;
    employeeCount: number;
    onProcess: (options?: ProcessingOptions) => Promise<void>;
    onRegenerateExplainability: (onProgress?: (status: string) => void) => Promise<void>;
    onRegeneratePlaybooks: (productId?: number) => Promise<void>;
    allProducts: ProductSummary[];
    onSelectStakeholder: (contact: PlaybookContactResponse) => void;
}

function AnimatedPanel({ children }: { children: ReactNode }) {
    return (
        <div className="animate-in fade-in duration-300 slide-in-from-bottom-2">
            {children}
        </div>
    );
}

export function AccountDetailContent({
    activeTab,
    company,
    domain,
    explainability,
    playbooks,
    decisionMakers,
    employees,
    employeesTotal,
    jobs,
    jobsTotal,
    news,
    newsTotal,
    onSelectEmployee,
    onSelectFit,
    onSelectSignal,
    onSelectJob,
    onSelectPlaybookEmployee,
    onLoadMoreJobs,
    onLoadMoreNews,
    onLoadMoreEmployees,
    loadingMoreJobs,
    loadingMoreNews,
    loadingMoreEmployees,
    employeeCount,
    onProcess,
    onRegenerateExplainability,
    onRegeneratePlaybooks,
    allProducts,
    onSelectStakeholder,
}: AccountDetailContentProps) {
    const hasExplainability = !!explainability;
    const hasPlaybooks = playbooks.length > 0;
    const hasPeople = employeeCount > 0;
    const hasJobs = jobsTotal > 0;
    const hasNews = newsTotal > 0;
    const hasUpdates = (company.updates?.length || 0) > 0;

    const handleGenerateSignals = useCallback(() =>
        onProcess({ generate_signals: true, generate_fits: true, refresh_data: false }), [onProcess]);

    return (
        <div className="flex-1 overflow-y-auto overflow-x-hidden isolate bg-slate-50 dark:bg-slate-900">
            <div className="p-6 max-w-7xl mx-auto w-full">
                {activeTab === 'overview' && (
                    <AnimatedPanel>
                        <OverviewTab company={company} />
                    </AnimatedPanel>
                )}

                {activeTab === 'explainability' && (
                    <AnimatedPanel>
                        {hasExplainability && explainability ? (
                            <ExplainabilityTab
                                data={explainability}
                                onSelectFit={onSelectFit}
                                onSelectSignal={onSelectSignal}
                                onProcess={onRegenerateExplainability}
                            />
                        ) : (
                            <EnrichedEmptyState
                                icon={<Target className="w-8 h-8" />}
                                title="No fit scores or signals detected"
                                description="Run AI analysis to generate signals and calculate fit scores for your products."
                                actionLabel="Generate Signals & Fits"
                                onAction={handleGenerateSignals}
                            />
                        )}
                    </AnimatedPanel>
                )}

                {activeTab === 'playbooks' && (
                    <AnimatedPanel>
                        {hasPlaybooks ? (
                            <PlaybooksTab
                                playbooks={playbooks}
                                availableEmployees={[]}
                                domain={domain}
                                onSelectEmployee={onSelectPlaybookEmployee}
                                onProcess={onRegeneratePlaybooks}
                                allProducts={allProducts}
                                onGeneratePlaybook={onRegeneratePlaybooks}
                                onSelectStakeholder={onSelectStakeholder}
                            />
                        ) : (
                            <PlaybookEmptyState
                                products={allProducts.map(p => ({ id: p.id, name: p.name }))}
                                onAction={onRegeneratePlaybooks}
                            />
                        )}
                    </AnimatedPanel>
                )}

                {activeTab === 'people' && (
                    <AnimatedPanel>
                        {hasPeople ? (
                            <PeopleTab
                                decisionMakers={decisionMakers}
                                employees={employees}
                                employeesTotal={employeesTotal}
                                total={employeeCount}
                                onSelectEmployee={onSelectEmployee}
                                onLoadMore={onLoadMoreEmployees}
                                loadingMore={loadingMoreEmployees}
                            />
                        ) : (
                            <EnrichedEmptyState
                                icon={<Users className="w-8 h-8" />}
                                title="No employees found"
                                description="Enrich this company to discover key contacts, decision makers, and their professional backgrounds."
                                actionLabel="Enrich Employees"
                                onAction={() => onProcess({ include_employees: true })}
                            />
                        )}
                    </AnimatedPanel>
                )}

                {activeTab === 'jobs' && (
                    <AnimatedPanel>
                        {hasJobs ? (
                            <JobsTab
                                jobs={jobs}
                                total={jobsTotal}
                                onLoadMore={onLoadMoreJobs}
                                loadingMore={loadingMoreJobs}
                                onSelectJob={onSelectJob}
                            />
                        ) : (
                            <EnrichedEmptyState
                                icon={<Briefcase className="w-8 h-8" />}
                                title="No job postings found"
                                description="Fetch job postings to understand hiring priorities, technology stack, and growth signals."
                                actionLabel="Fetch Jobs"
                                onAction={() => onProcess({ include_jobs: true })}
                            />
                        )}
                    </AnimatedPanel>
                )}

                {activeTab === 'news' && (
                    <AnimatedPanel>
                        {hasNews ? (
                            <NewsTab
                                news={news}
                                total={newsTotal}
                                onLoadMore={onLoadMoreNews}
                                loadingMore={loadingMoreNews}
                            />
                        ) : (
                            <EnrichedEmptyState
                                icon={<Newspaper className="w-8 h-8" />}
                                title="No news articles found"
                                description="News articles and company updates will appear here when available from our data sources."
                                actionLabel="Refresh Data"
                                onAction={() => onProcess({ refresh_data: true })}
                            />
                        )}
                    </AnimatedPanel>
                )}

                {activeTab === 'updates' && hasUpdates && (
                    <AnimatedPanel>
                        <UpdatesTab updates={company.updates || []} />
                    </AnimatedPanel>
                )}
            </div>
        </div>
    );
}
