'use client';

import { useState, useEffect } from 'react';
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
} from '@/lib/api';
import {
    CompanyDetailResponse,
    CompanySignalsResponse,
    PlaybookSummary,
    JobPostingSummary,
    NewsArticleSummary,
} from '@/lib/schemas';
import { cn } from '@/lib/utils';
import { JobsTab } from './detail/JobsTab';
import { NewsTab } from './detail/NewsTab';
import { OverviewTab } from './detail/OverviewTab';
import { PeopleTab } from './detail/PeopleTab';
import { PlaybooksTab } from './detail/PlaybooksTab';
import { SignalsTab } from './detail/SignalsTab';
import { UpdatesTab } from './detail/UpdatesTab';
import { AccountDetailHeader } from './detail/AccountDetailHeader';

interface AccountDetailProps {
    domain: string;
    open: boolean;
    onClose: () => void;
}

export function AccountDetail({ domain, open, onClose }: AccountDetailProps) {
    const [data, setData] = useState<CompanyDetailResponse | null>(null);
    const [signals, setSignals] = useState<CompanySignalsResponse | null>(null);
    const [playbooks, setPlaybooks] = useState<PlaybookSummary[]>([]);

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

                const [signalsData, jobsData, newsData] = await Promise.all([
                    getCompanySignals(domain).catch(() => null),
                    getCompanyJobs(domain, 1, 20).catch(() => ({ items: [], total: 0, page: 1, page_size: 20, total_pages: 0, has_next: false, has_previous: false })),
                    getCompanyNews(domain, 1, 20).catch(() => ({ items: [], total: 0, page: 1, page_size: 20, total_pages: 0, has_next: false, has_previous: false })),
                ]);

                setSignals(signalsData);
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
    const handleLoadMoreJobs = async () => {
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
    };

    // Load more news handler
    const handleLoadMoreNews = async () => {
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
    };

    const company = data?.company;

    // Deduplicate employees by full_name, preferring those with avatar_url
    const employees = (data?.employees || [])
        .sort((a, b) => {
            // Sort so entries with avatar come first
            if (a.avatar_url && !b.avatar_url) return -1;
            if (!a.avatar_url && b.avatar_url) return 1;
            return 0;
        })
        .filter((employee, index, arr) =>
            arr.findIndex(e => e.full_name === employee.full_name) === index
        );
    const decisionMakers = employees.filter(e => e.is_decision_maker);
    const otherEmployees = employees.filter(e => !e.is_decision_maker);

    const hasPlaybooks = playbooks.length > 0;
    const hasPeople = (data?.counts?.employees || 0) > 0;
    const hasSignals = ((signals?.interests?.length || 0) + (signals?.events?.length || 0)) > 0;
    const hasJobs = jobsTotal > 0;
    const hasNews = newsTotal > 0;
    const hasUpdates = (company?.updates?.length || 0) > 0;

    return (
        <Sheet open={open} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="bottom" hideClose className="h-[95vh] flex flex-col p-0 border-t-0 rounded-t-2xl overflow-hidden shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 z-50 rounded-full bg-white/80 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:bg-slate-900/80 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors backdrop-blur-sm"
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
                    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/50">
                        {/* Header */}
                        <div className="bg-white dark:bg-slate-900 z-10 transition-shadow">
                            <AccountDetailHeader company={company} />

                            {/* Tabs - Clean Underline Style */}
                            <div className="pt-1">
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                    <div className="w-full border-b border-border text-center">
                                        <TabsList className="h-auto w-full max-w-7xl mx-auto justify-center gap-8 bg-transparent p-0 rounded-none overflow-x-auto no-scrollbar">
                                            <TabBtn value="overview">Overview</TabBtn>

                                            {hasPlaybooks && (
                                                <TabBtn value="playbooks" count={playbooks.length}>Playbooks</TabBtn>
                                            )}
                                            {hasPeople && (
                                                <TabBtn value="people" count={data?.counts['employees']}>People</TabBtn>
                                            )}
                                            {hasSignals && (
                                                <TabBtn value="signals" count={(signals?.interests?.length || 0) + (signals?.events?.length || 0)}>Signals</TabBtn>
                                            )}
                                            {hasJobs && (
                                                <TabBtn value="jobs" count={jobsTotal}>Jobs</TabBtn>
                                            )}
                                            {hasNews && (
                                                <TabBtn value="news" count={newsTotal}>News</TabBtn>
                                            )}
                                            {hasUpdates && (
                                                <TabBtn value="updates" count={company.updates?.length}>Updates</TabBtn>
                                            )}
                                        </TabsList>
                                    </div>
                                </Tabs>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden">
                            <div className="p-6 max-w-7xl mx-auto w-full">
                                <Tabs value={activeTab} className="w-full">
                                    <TabsContent value="overview" className="mt-0 focus-visible:outline-none animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                                        <OverviewTab company={company} />
                                    </TabsContent>

                                    {hasPlaybooks && (
                                        <TabsContent value="playbooks" className="mt-0 focus-visible:outline-none animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                                            <PlaybooksTab playbooks={playbooks} availableEmployees={employees} domain={domain} />
                                        </TabsContent>
                                    )}
                                    {hasPeople && (
                                        <TabsContent value="people" className="mt-0 focus-visible:outline-none animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                                            <PeopleTab decisionMakers={decisionMakers} employees={otherEmployees} total={data?.counts.employees || 0} />
                                        </TabsContent>
                                    )}
                                    {hasSignals && (
                                        <TabsContent value="signals" className="mt-0 focus-visible:outline-none animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                                            <SignalsTab signals={signals} />
                                        </TabsContent>
                                    )}
                                    {hasJobs && (
                                        <TabsContent value="jobs" className="mt-0 focus-visible:outline-none animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                                            <JobsTab
                                                jobs={jobs}
                                                total={jobsTotal}
                                                onLoadMore={handleLoadMoreJobs}
                                                loadingMore={loadingMoreJobs}
                                            />
                                        </TabsContent>
                                    )}
                                    {hasNews && (
                                        <TabsContent value="news" className="mt-0 focus-visible:outline-none animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                                            <NewsTab
                                                news={news}
                                                total={newsTotal}
                                                onLoadMore={handleLoadMoreNews}
                                                loadingMore={loadingMoreNews}
                                            />
                                        </TabsContent>
                                    )}
                                    {hasUpdates && (
                                        <TabsContent value="updates" className="mt-0 focus-visible:outline-none animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                                            <UpdatesTab updates={company.updates || []} />
                                        </TabsContent>
                                    )}
                                </Tabs>
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
    );
}

// Custom tab button with clean underline style
function TabBtn({ value, count, children }: { value: string; count?: number; children: React.ReactNode }) {
    return (
        <TabsTrigger
            value={value}
            className={cn(
                "group relative flex items-center gap-2 pb-3 pt-2 px-1 rounded-none font-medium text-sm transition-none bg-transparent hover:text-foreground",
                "text-muted-foreground data-[state=active]:text-foreground data-[state=active]:font-semibold data-[state=active]:shadow-none",
                "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400 after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform"
            )}
        >
            <span>{children}</span>
            {count !== undefined && count > 0 && (
                <span className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none transition-colors",
                    "bg-muted text-muted-foreground",
                    "group-data-[state=active]:bg-blue-50 group-data-[state=active]:text-blue-600 dark:group-data-[state=active]:bg-blue-900/20 dark:group-data-[state=active]:text-blue-300"
                )}>
                    {formatCompactNumber(count)}
                </span>
            )}
        </TabsTrigger>
    );
}

// Helper for formatting large numbers
function formatCompactNumber(num: number): string {
    return new Intl.NumberFormat('en-US', {
        notation: "compact",
        maximumFractionDigits: 1
    }).format(num);
}
