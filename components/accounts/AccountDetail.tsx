'use client';

import { useState, useEffect } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription
} from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
    getCompany,
    getCompanySignals,
    getCompanyPlaybooks,
    getCompanyJobs,
    getCompanyNews,
    CompanyDetailResponse,
    CompanySignalsResponse,
    PlaybookSummary,
    JobPostingSummary,
    NewsArticleSummary,
    EmployeeRead
} from '@/lib/api';
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

    // Jobs pagination state
    const [jobs, setJobs] = useState<JobPostingSummary[]>([]);
    const [jobsPage, setJobsPage] = useState(1);
    const [jobsTotal, setJobsTotal] = useState(0);
    const [loadingMoreJobs, setLoadingMoreJobs] = useState(false);

    // News pagination state
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

    return (
        <Sheet open={open} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="bottom" className="h-[85vh] flex flex-col p-0">
                {loading ? (
                    <>
                        <SheetHeader className="sr-only"><SheetTitle>Loading</SheetTitle></SheetHeader>
                        <div className="p-8 space-y-6 animate-pulse">
                            <div className="flex gap-5">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50" />
                                <div className="flex-1 space-y-3">
                                    <div className="h-7 w-56 bg-muted" />
                                    <div className="h-4 w-80 bg-muted" />
                                </div>
                            </div>
                        </div>
                    </>
                ) : company ? (
                    <div className="flex flex-col h-full">
                        {/* Header */}
                        <AccountDetailHeader company={company} />

                        {/* Tabs with color indicator */}
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                            <div className="border-y bg-muted/30">
                                <TabsList className="h-11 bg-transparent px-6 gap-0">
                                    <TabBtn value="overview" active={activeTab}>Overview</TabBtn>
                                    <TabBtn value="playbooks" active={activeTab}>Playbooks ({playbooks.length})</TabBtn>
                                    <TabBtn value="people" active={activeTab}>People ({data?.counts['employees'] || 0})</TabBtn>
                                    <TabBtn value="signals" active={activeTab}>Signals ({(signals?.interests?.length || 0) + (signals?.events?.length || 0)})</TabBtn>
                                    <TabBtn value="jobs" active={activeTab}>Jobs ({jobsTotal || 0})</TabBtn>
                                    <TabBtn value="news" active={activeTab}>News ({newsTotal || 0})</TabBtn>
                                    <TabBtn value="updates" active={activeTab}>Updates ({company.updates?.length || 0})</TabBtn>
                                </TabsList>
                            </div>

                            <div className="flex-1 overflow-y-auto bg-muted/20">
                                <TabsContent value="overview" className="m-0">
                                    <OverviewTab company={company} />
                                </TabsContent>
                                <TabsContent value="playbooks" className="m-0">
                                    <PlaybooksTab playbooks={playbooks} />
                                </TabsContent>
                                <TabsContent value="people" className="m-0">
                                    <PeopleTab decisionMakers={decisionMakers} employees={otherEmployees} total={data?.counts.employees || 0} />
                                </TabsContent>
                                <TabsContent value="signals" className="m-0">
                                    <SignalsTab signals={signals} />
                                </TabsContent>
                                <TabsContent value="jobs" className="m-0">
                                    <JobsTab
                                        jobs={jobs}
                                        total={jobsTotal}
                                        onLoadMore={handleLoadMoreJobs}
                                        loadingMore={loadingMoreJobs}
                                    />
                                </TabsContent>
                                <TabsContent value="news" className="m-0">
                                    <NewsTab
                                        news={news}
                                        total={newsTotal}
                                        onLoadMore={handleLoadMoreNews}
                                        loadingMore={loadingMoreNews}
                                    />
                                </TabsContent>
                                <TabsContent value="updates" className="m-0">
                                    <UpdatesTab updates={company.updates || []} />
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>
                ) : (
                    <>
                        <SheetHeader className="sr-only"><SheetTitle>Not found</SheetTitle></SheetHeader>
                        <div className="flex-1 flex items-center justify-center text-muted-foreground">Company not found</div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}

// Custom tab button with color accent
function TabBtn({ value, active, children }: { value: string; active: string; children: React.ReactNode }) {
    const isActive = active === value;
    return (
        <TabsTrigger
            value={value}
            className={cn(
                "h-11 px-4 rounded-none border-b-2 transition-colors",
                isActive
                    ? "border-blue-600 text-blue-600 font-semibold bg-transparent"
                    : "border-transparent text-muted-foreground hover:text-foreground"
            )}
        >
            {children}
        </TabsTrigger>
    );
}
