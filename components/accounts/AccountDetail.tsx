'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { X } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
    getCompany,
    getCompanySignals,
    getCompanyPlaybooks,
    getCompanyJobs,
    getCompanyNews,
    getCompanyExplainability,
    getEmployee,
} from '@/lib/api';
import {
    CompanyDetailResponse,
    CompanySignalsResponse,
    CompanyExplainabilityResponse,
    PlaybookSummary,
    JobPostingSummary,
    NewsArticleSummary,
    EmployeeRead,
    EmployeeSummary,
} from '@/lib/schemas';
import { cn } from '@/lib/utils';
import { JobsTab } from './detail/JobsTab';
import { NewsTab } from './detail/NewsTab';
import { OverviewTab } from './detail/OverviewTab';
import { PeopleTab } from './detail/PeopleTab';
import { PlaybooksTab } from './detail/PlaybooksTab';
import { UpdatesTab } from './detail/UpdatesTab';
import { ExplainabilityTab } from './detail/ExplainabilityTab';
import { AccountDetailHeader } from './detail/AccountDetailHeader';
import { EmployeeDetailModal } from './detail/EmployeeDetailModal';

interface AccountDetailProps {
    domain: string;
    open: boolean;
    onClose: () => void;
}

export function AccountDetail({ domain, open, onClose }: AccountDetailProps) {
    const [data, setData] = useState<CompanyDetailResponse | null>(null);
    const [playbooks, setPlaybooks] = useState<PlaybookSummary[]>([]);
    const [explainability, setExplainability] = useState<CompanyExplainabilityResponse | null>(null);

    const [jobs, setJobs] = useState<JobPostingSummary[]>([]);
    const [jobsPage, setJobsPage] = useState(1);
    const [jobsTotal, setJobsTotal] = useState(0);
    const [loadingMoreJobs, setLoadingMoreJobs] = useState(false);

    const [news, setNews] = useState<NewsArticleSummary[]>([]);
    const [newsPage, setNewsPage] = useState(1);
    const [newsTotal, setNewsTotal] = useState(0);
    const [loadingMoreNews, setLoadingMoreNews] = useState(false);

    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    // Employee Detail State
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRead | null>(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const handleEmployeeClick = useCallback(async (person: EmployeeSummary) => {
        setLoadingDetail(true);
        // Initialize with summary data to show header immediately
        setSelectedEmployee(person as unknown as EmployeeRead);
        setDetailModalOpen(true);
        try {
            const response = await getEmployee(person.id);
            // Merge detail data, preserving summary data if detail is missing fields
            if (response.employee) {
                setSelectedEmployee(prev => ({ ...prev, ...response.employee } as EmployeeRead));
            }
        } catch (error) {
            console.error('Failed to load employee details:', error);
        } finally {
            setLoadingDetail(false);
        }
    }, []);

    const handleCloseEmployeeModal = () => {
        setDetailModalOpen(false);
        // Clear after animation completes
        setTimeout(() => setSelectedEmployee(null), 300);
    };

    useEffect(() => {
        if (!open || !domain) return;

        // Reset to overview tab when opening
        setActiveTab('overview');

        async function fetchDetails() {
            setLoading(true);
            try {
                const [companyData, playbooksData] = await Promise.all([
                    getCompany(domain, { include: 'employees', employee_limit: 50 }),
                    getCompanyPlaybooks(domain).catch(() => ({ playbooks: [] })),
                ]);

                setData(companyData);
                setPlaybooks(playbooksData.playbooks);

                const [jobsData, newsData, explainabilityData] = await Promise.all([
                    getCompanyJobs(domain, 1, 20).catch(() => ({ items: [], total: 0, page: 1, page_size: 20, total_pages: 0, has_next: false, has_previous: false })),
                    getCompanyNews(domain, 1, 20).catch(() => ({ items: [], total: 0, page: 1, page_size: 20, total_pages: 0, has_next: false, has_previous: false })),
                    getCompanyExplainability(domain).catch(() => null),
                ]);

                setExplainability(explainabilityData);
                setJobs(jobsData.items);
                setJobsTotal(jobsData.total);
                setJobsPage(1);
                setNews(newsData.items);
                setNewsTotal(newsData.total);
                setNewsPage(1);
            } catch (err) {
                console.error('Error fetching company details:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchDetails();
    }, [domain, open]);

    // Load more jobs handler
    const handleLoadMoreJobs = useCallback(async () => {
        if (loadingMoreJobs || jobs.length >= jobsTotal) return;

        setLoadingMoreJobs(true);
        try {
            const nextPage = jobsPage + 1;
            const moreJobs = await getCompanyJobs(domain, nextPage, 20);
            setJobs([...jobs, ...moreJobs.items]);
            setJobsPage(nextPage);
        } catch (err) {
            console.error('Error loading more jobs:', err);
        } finally {
            setLoadingMoreJobs(false);
        }
    }, [domain, jobs, jobsPage, jobsTotal, loadingMoreJobs]);

    // Load more news handler
    const handleLoadMoreNews = useCallback(async () => {
        if (loadingMoreNews || news.length >= newsTotal) return;

        setLoadingMoreNews(true);
        try {
            const nextPage = newsPage + 1;
            const moreNews = await getCompanyNews(domain, nextPage, 20);
            setNews([...news, ...moreNews.items]);
            setNewsPage(nextPage);
        } catch (err) {
            console.error('Error loading more news:', err);
        } finally {
            setLoadingMoreNews(false);
        }
    }, [domain, loadingMoreNews, news, newsPage, newsTotal]);

    const company = data?.company;

    // Deduplicate employees by full_name, preferring those with avatar_url
    // Deduplicate employees by full_name, preferring those with avatar_url
    const { decisionMakers, otherEmployees } = useMemo(() => {
        const uniqueEmployees = (data?.employees || [])
            .sort((a, b) => {
                // Sort so entries with avatar come first
                if (a.avatar_url && !b.avatar_url) return -1;
                if (!a.avatar_url && b.avatar_url) return 1;
                return 0;
            })
            .filter((employee, index, arr) =>
                arr.findIndex(e => e.full_name === employee.full_name) === index
            );
        return {
            decisionMakers: uniqueEmployees.filter(e => e.is_decision_maker),
            otherEmployees: uniqueEmployees.filter(e => !e.is_decision_maker)
        };
    }, [data?.employees]);

    const hasPlaybooks = playbooks.length > 0;
    const hasPeople = (data?.counts?.employees || 0) > 0;
    const hasJobs = jobsTotal > 0;
    const hasNews = newsTotal > 0;
    const hasUpdates = (company?.updates?.length || 0) > 0;
    const hasExplainability = !!explainability;

    return (
        <>
            <Sheet open={open} onOpenChange={(open) => !open && onClose()}>
                <SheetContent side="bottom" showCloseButton={false} className="flex flex-col p-0 border-t-0 rounded-t-2xl overflow-hidden" style={{ height: '95vh', maxHeight: '95vh' }}>
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 z-50 rounded-full bg-white p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors shadow-sm"
                    >
                        <X className="h-5 w-5" />
                        <span className="sr-only">Close</span>
                    </button>
                    {loading ? (
                        <>
                            <SheetHeader className="sr-only"><SheetTitle>Loading</SheetTitle></SheetHeader>
                            <div className="p-8 space-y-8 animate-pulse bg-white dark:bg-slate-950 h-full">
                                <div className="max-w-7xl mx-auto w-full space-y-8">
                                    <div className="flex gap-6">
                                        <div className="w-24 h-24 rounded-xl bg-slate-200 dark:bg-slate-800" />
                                        <div className="flex-1 space-y-4 pt-2">
                                            <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                                            <div className="h-4 w-96 bg-slate-100 dark:bg-slate-900 rounded" />
                                            <div className="flex gap-2 pt-2">
                                                <div className="h-6 w-20 bg-slate-100 dark:bg-slate-900 rounded-full" />
                                                <div className="h-6 w-20 bg-slate-100 dark:bg-slate-900 rounded-full" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-px bg-slate-100 dark:bg-slate-900" />
                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="h-8 bg-slate-100 dark:bg-slate-900 rounded" />
                                        <div className="h-8 bg-slate-100 dark:bg-slate-900 rounded" />
                                        <div className="h-8 bg-slate-100 dark:bg-slate-900 rounded" />
                                        <div className="h-8 bg-slate-100 dark:bg-slate-900 rounded" />
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : company ? (
                        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
                            {/* Header */}
                            <div className="bg-white dark:bg-slate-900 z-20 shadow-sm transition-shadow">
                                <AccountDetailHeader company={company} />

                                {/* Tabs - Clean Underline Style */}
                                <div className="pt-1">
                                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                        <div className="w-full border-b border-border text-center">
                                            <TabsList variant="line" className="w-full max-w-7xl mx-auto justify-center gap-8">
                                                <TabsTrigger value="overview">Overview</TabsTrigger>

                                                {hasExplainability && (
                                                    <TabsTrigger value="explainability">
                                                        Explainability
                                                    </TabsTrigger>
                                                )}

                                                {hasPlaybooks && (
                                                    <TabsTrigger value="playbooks">
                                                        Playbooks
                                                        <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                                                            {formatCompactNumber(playbooks.length)}
                                                        </span>
                                                    </TabsTrigger>
                                                )}
                                                {hasPeople && (
                                                    <TabsTrigger value="people">
                                                        People
                                                        <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                                                            {formatCompactNumber(data?.counts['employees'] || 0)}
                                                        </span>
                                                    </TabsTrigger>
                                                )}
                                                {hasJobs && (
                                                    <TabsTrigger value="jobs">
                                                        Jobs
                                                        <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                                                            {formatCompactNumber(jobsTotal)}
                                                        </span>
                                                    </TabsTrigger>
                                                )}
                                                {hasNews && (
                                                    <TabsTrigger value="news">
                                                        News
                                                        <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                                                            {formatCompactNumber(newsTotal)}
                                                        </span>
                                                    </TabsTrigger>
                                                )}
                                                {hasUpdates && (
                                                    <TabsTrigger value="updates">
                                                        Updates
                                                        <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                                                            {formatCompactNumber(company?.updates?.length || 0)}
                                                        </span>
                                                    </TabsTrigger>
                                                )}
                                            </TabsList>
                                        </div>
                                    </Tabs>
                                </div>
                            </div>

                            {/* Content Area */}
                            <div className="flex-1 overflow-y-auto overflow-x-hidden isolate">
                                <div className="p-6 max-w-7xl mx-auto w-full">
                                    {activeTab === 'overview' && (
                                        <div className="animate-in fade-in duration-300 slide-in-from-bottom-2">
                                            <OverviewTab company={company} />
                                        </div>
                                    )}

                                    {activeTab === 'explainability' && hasExplainability && explainability && (
                                        <div className="animate-in fade-in duration-300 slide-in-from-bottom-2">
                                            <ExplainabilityTab data={explainability} />
                                        </div>
                                    )}

                                    {activeTab === 'playbooks' && hasPlaybooks && (
                                        <div className="animate-in fade-in duration-300 slide-in-from-bottom-2">
                                            <PlaybooksTab playbooks={playbooks} availableEmployees={otherEmployees} domain={domain} />
                                        </div>
                                    )}

                                    {activeTab === 'people' && hasPeople && (
                                        <div className="animate-in fade-in duration-300 slide-in-from-bottom-2">
                                            <PeopleTab
                                                decisionMakers={decisionMakers}
                                                employees={otherEmployees}
                                                total={data?.counts.employees || 0}
                                                onSelectEmployee={handleEmployeeClick}
                                            />
                                        </div>
                                    )}

                                    {activeTab === 'jobs' && hasJobs && (
                                        <div className="animate-in fade-in duration-300 slide-in-from-bottom-2">
                                            <JobsTab
                                                jobs={jobs}
                                                total={jobsTotal}
                                                onLoadMore={handleLoadMoreJobs}
                                                loadingMore={loadingMoreJobs}
                                            />
                                        </div>
                                    )}

                                    {activeTab === 'news' && hasNews && (
                                        <div className="animate-in fade-in duration-300 slide-in-from-bottom-2">
                                            <NewsTab
                                                news={news}
                                                total={newsTotal}
                                                onLoadMore={handleLoadMoreNews}
                                                loadingMore={loadingMoreNews}
                                            />
                                        </div>
                                    )}

                                    {activeTab === 'updates' && hasUpdates && (
                                        <div className="animate-in fade-in duration-300 slide-in-from-bottom-2">
                                            <UpdatesTab updates={company.updates || []} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <SheetHeader className="sr-only"><SheetTitle>Not found</SheetTitle></SheetHeader>
                            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
                                <div className="text-4xl mb-4">🔍</div>
                                <p className="font-medium">Company not found</p>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
            <EmployeeDetailModal
                employee={selectedEmployee}
                open={detailModalOpen}
                onClose={handleCloseEmployeeModal}
                isLoading={loadingDetail}
            />
        </>
    );
}

// Helper for formatting large numbers
function formatCompactNumber(num: number): string {
    return new Intl.NumberFormat('en-US', {
        notation: "compact",
        maximumFractionDigits: 1
    }).format(num);
}
