'use client';

import { ReactNode } from 'react';
import {
    CompanyRead,
    CompanyExplainabilityResponse,
    PlaybookSummary,
    JobPostingSummary,
    NewsArticleSummary,
    EmployeeSummary,
} from '@/lib/schemas';
import { OverviewTab } from './OverviewTab';
import { ExplainabilityTab } from './ExplainabilityTab';
import { PlaybooksTab } from './PlaybooksTab';
import { PeopleTab } from './PeopleTab';
import { JobsTab } from './JobsTab';
import { NewsTab } from './NewsTab';
import { UpdatesTab } from './UpdatesTab';

interface AccountDetailContentProps {
    activeTab: string;
    company: CompanyRead;
    domain: string;
    explainability: CompanyExplainabilityResponse | null;
    playbooks: PlaybookSummary[];
    decisionMakers: EmployeeSummary[];
    employees: EmployeeSummary[];
    jobs: JobPostingSummary[];
    jobsTotal: number;
    news: NewsArticleSummary[];
    newsTotal: number;
    onSelectEmployee: (employee: EmployeeSummary) => void;
    onSelectFit: (productId: number) => void;
    onSelectSignal: (signalId: number) => void;
    onLoadMoreJobs: () => Promise<void>;
    onLoadMoreNews: () => Promise<void>;
    loadingMoreJobs: boolean;
    loadingMoreNews: boolean;
    employeeCount: number;
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
    jobs,
    jobsTotal,
    news,
    newsTotal,
    onSelectEmployee,
    onSelectFit,
    onSelectSignal,
    onLoadMoreJobs,
    onLoadMoreNews,
    loadingMoreJobs,
    loadingMoreNews,
    employeeCount,
}: AccountDetailContentProps) {
    const hasExplainability = !!explainability;
    const hasPlaybooks = playbooks.length > 0;
    const hasPeople = employeeCount > 0;
    const hasJobs = jobsTotal > 0;
    const hasNews = newsTotal > 0;
    const hasUpdates = (company.updates?.length || 0) > 0;

    return (
        <div className="flex-1 overflow-y-auto overflow-x-hidden isolate">
            <div className="p-6 max-w-7xl mx-auto w-full">
                {activeTab === 'overview' && (
                    <AnimatedPanel>
                        <OverviewTab company={company} />
                    </AnimatedPanel>
                )}

                {activeTab === 'explainability' && hasExplainability && explainability && (
                    <AnimatedPanel>
                        <ExplainabilityTab
                            data={explainability}
                            onSelectFit={onSelectFit}
                            onSelectSignal={onSelectSignal}
                        />
                    </AnimatedPanel>
                )}

                {activeTab === 'playbooks' && hasPlaybooks && (
                    <AnimatedPanel>
                        <PlaybooksTab
                            playbooks={playbooks}
                            availableEmployees={[]}
                            domain={domain}
                        />
                    </AnimatedPanel>
                )}

                {activeTab === 'people' && hasPeople && (
                    <AnimatedPanel>
                        <PeopleTab
                            decisionMakers={decisionMakers}
                            employees={employees}
                            total={employeeCount}
                            onSelectEmployee={onSelectEmployee}
                        />
                    </AnimatedPanel>
                )}

                {activeTab === 'jobs' && hasJobs && (
                    <AnimatedPanel>
                        <JobsTab
                            jobs={jobs}
                            total={jobsTotal}
                            onLoadMore={onLoadMoreJobs}
                            loadingMore={loadingMoreJobs}
                        />
                    </AnimatedPanel>
                )}

                {activeTab === 'news' && hasNews && (
                    <AnimatedPanel>
                        <NewsTab
                            news={news}
                            total={newsTotal}
                            onLoadMore={onLoadMoreNews}
                            loadingMore={loadingMoreNews}
                        />
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
