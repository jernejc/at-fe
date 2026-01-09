'use client';

import { useState, useCallback, useEffect } from 'react';
import {
    getCompany,
    getCompanyEmployees,
    getCompanyPlaybooks,
    getCompanyJobs,
    getCompanyNews,
    getCompanyExplainability,
    getProducts,
} from '@/lib/api';
import {
    CompanyDetailResponse,
    CompanyExplainabilityResponse,
    PlaybookSummary,
    JobPostingSummary,
    NewsArticleSummary,
    EmployeeSummary,
    ProductSummary,
} from '@/lib/schemas';

interface UseAccountDetailReturn {
    data: CompanyDetailResponse | null;
    playbooks: PlaybookSummary[];
    explainability: CompanyExplainabilityResponse | null;
    decisionMakers: EmployeeSummary[];
    employees: EmployeeSummary[];
    employeesTotal: number;
    jobs: JobPostingSummary[];
    jobsTotal: number;
    news: NewsArticleSummary[];
    newsTotal: number;
    loading: boolean;
    loadMoreJobs: () => Promise<void>;
    loadMoreNews: () => Promise<void>;
    loadMoreEmployees: () => Promise<void>;
    loadingMoreJobs: boolean;
    loadingMoreNews: boolean;
    loadingMoreEmployees: boolean;
    refetch: () => void;
    refetchExplainability: () => Promise<void>;
    refetchPlaybooks: () => Promise<void>;
    /** All available products for score calculation */
    allProducts: ProductSummary[];
}

export function useAccountDetail(domain: string, isOpen: boolean): UseAccountDetailReturn {
    const [data, setData] = useState<CompanyDetailResponse | null>(null);
    const [playbooks, setPlaybooks] = useState<PlaybookSummary[]>([]);
    const [explainability, setExplainability] = useState<CompanyExplainabilityResponse | null>(null);

    const [decisionMakers, setDecisionMakers] = useState<EmployeeSummary[]>([]);
    const [employees, setEmployees] = useState<EmployeeSummary[]>([]);
    const [employeesPage, setEmployeesPage] = useState(1);
    const [employeesTotal, setEmployeesTotal] = useState(0);
    const [loadingMoreEmployees, setLoadingMoreEmployees] = useState(false);

    const [jobs, setJobs] = useState<JobPostingSummary[]>([]);
    const [jobsPage, setJobsPage] = useState(1);
    const [jobsTotal, setJobsTotal] = useState(0);
    const [loadingMoreJobs, setLoadingMoreJobs] = useState(false);

    const [news, setNews] = useState<NewsArticleSummary[]>([]);
    const [newsPage, setNewsPage] = useState(1);
    const [newsTotal, setNewsTotal] = useState(0);
    const [loadingMoreNews, setLoadingMoreNews] = useState(false);

    const [allProducts, setAllProducts] = useState<ProductSummary[]>([]);

    const [loading, setLoading] = useState(true);

    const loadData = useCallback(() => {
        if (!domain) return;

        setLoading(true);
        getCompany(domain)
            .then(res => {
                setData(res);
                setPlaybooks([]);
                setDecisionMakers([]);
                setEmployees([]);
                setEmployeesTotal(0);
                setJobs([]);
                setNews([]);
                setEmployeesPage(1);
                setJobsPage(1);
                setNewsPage(1);

                Promise.all([
                    // Fetch ALL decision makers (key contacts) - use max API limit of 100
                    getCompanyEmployees(domain, 1, 100, { is_decision_maker: true })
                        .then(res => setDecisionMakers(res.items)),
                    // Fetch regular employees (non-decision makers) with higher default limit
                    getCompanyEmployees(domain, 1, 100, { is_decision_maker: false })
                        .then(res => {
                            setEmployees(res.items);
                            setEmployeesTotal(res.total);
                        }),
                    getCompanyPlaybooks(domain).then(res => setPlaybooks(res.playbooks)),
                    getCompanyJobs(domain, 1).then(res => {
                        setJobs(res.items);
                        setJobsTotal(res.total);
                    }),
                    getCompanyNews(domain, 1).then(res => {
                        setNews(res.items);
                        setNewsTotal(res.total);
                    }),
                    getCompanyExplainability(domain).then(setExplainability),
                    // Fetch all available products for score calculation
                    getProducts(1, 100).then(res => setAllProducts(res.items))
                ]).finally(() => setLoading(false));
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [domain]);

    useEffect(() => {
        if (isOpen && domain) {
            loadData();
        }
    }, [isOpen, domain, loadData]);

    const loadMoreJobs = async () => {
        if (loadingMoreJobs) return;
        setLoadingMoreJobs(true);
        try {
            const nextPage = jobsPage + 1;
            const res = await getCompanyJobs(domain, nextPage);
            setJobs(prev => [...prev, ...res.items]);
            setJobsPage(nextPage);
        } catch (error) {
            console.error("Failed to load more jobs", error);
        } finally {
            setLoadingMoreJobs(false);
        }
    };

    const loadMoreNews = async () => {
        if (loadingMoreNews) return;
        setLoadingMoreNews(true);
        try {
            const nextPage = newsPage + 1;
            const res = await getCompanyNews(domain, nextPage);
            setNews(prev => [...prev, ...res.items]);
            setNewsPage(nextPage);
        } catch (error) {
            console.error("Failed to load more news", error);
        } finally {
            setLoadingMoreNews(false);
        }
    };

    const loadMoreEmployees = async () => {
        if (loadingMoreEmployees) return;
        setLoadingMoreEmployees(true);
        try {
            const nextPage = employeesPage + 1;
            const res = await getCompanyEmployees(domain, nextPage, 100, { is_decision_maker: false });
            setEmployees(prev => [...prev, ...res.items]);
            setEmployeesPage(nextPage);
        } catch (error) {
            console.error("Failed to load more employees", error);
        } finally {
            setLoadingMoreEmployees(false);
        }
    };

    // Targeted refetch for explainability (fits & signals) only
    const refetchExplainability = useCallback(async () => {
        if (!domain) return;
        try {
            const result = await getCompanyExplainability(domain);
            setExplainability(result);
        } catch (error) {
            console.error("Failed to refetch explainability", error);
        }
    }, [domain]);

    // Targeted refetch for playbooks only
    const refetchPlaybooks = useCallback(async () => {
        if (!domain) return;
        try {
            const result = await getCompanyPlaybooks(domain);
            setPlaybooks(result.playbooks);
        } catch (error) {
            console.error("Failed to refetch playbooks", error);
        }
    }, [domain]);

    return {
        data,
        playbooks,
        explainability,
        decisionMakers,
        employees,
        employeesTotal,
        jobs,
        jobsTotal,
        news,
        newsTotal,
        loading,
        loadMoreJobs,
        loadMoreNews,
        loadMoreEmployees,
        loadingMoreJobs,
        loadingMoreNews,
        loadingMoreEmployees,
        refetch: loadData,
        refetchExplainability,
        refetchPlaybooks,
        allProducts,
    };
}
