'use client';

import { useState, useCallback, useEffect } from 'react';
import {
    getCompany,
    getCompanyEmployees,
    getCompanyPlaybooks,
    getCompanyJobs,
    getCompanyNews,
    getCompanyExplainability,
} from '@/lib/api';
import {
    CompanyDetailResponse,
    CompanyExplainabilityResponse,
    PlaybookSummary,
    JobPostingSummary,
    NewsArticleSummary,
    EmployeeSummary,
} from '@/lib/schemas';

interface UseAccountDetailReturn {
    data: CompanyDetailResponse | null;
    playbooks: PlaybookSummary[];
    explainability: CompanyExplainabilityResponse | null;
    decisionMakers: EmployeeSummary[];
    employees: EmployeeSummary[];
    jobs: JobPostingSummary[];
    jobsTotal: number;
    news: NewsArticleSummary[];
    newsTotal: number;
    loading: boolean;
    loadMoreJobs: () => Promise<void>;
    loadMoreNews: () => Promise<void>;
    loadingMoreJobs: boolean;
    loadingMoreNews: boolean;
    refetch: () => void;
}

export function useAccountDetail(domain: string, isOpen: boolean): UseAccountDetailReturn {
    const [data, setData] = useState<CompanyDetailResponse | null>(null);
    const [playbooks, setPlaybooks] = useState<PlaybookSummary[]>([]);
    const [explainability, setExplainability] = useState<CompanyExplainabilityResponse | null>(null);

    const [decisionMakers, setDecisionMakers] = useState<EmployeeSummary[]>([]);
    const [employees, setEmployees] = useState<EmployeeSummary[]>([]);

    const [jobs, setJobs] = useState<JobPostingSummary[]>([]);
    const [jobsPage, setJobsPage] = useState(1);
    const [jobsTotal, setJobsTotal] = useState(0);
    const [loadingMoreJobs, setLoadingMoreJobs] = useState(false);

    const [news, setNews] = useState<NewsArticleSummary[]>([]);
    const [newsPage, setNewsPage] = useState(1);
    const [newsTotal, setNewsTotal] = useState(0);
    const [loadingMoreNews, setLoadingMoreNews] = useState(false);

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
                setJobs([]);
                setNews([]);
                setJobsPage(1);
                setNewsPage(1);

                Promise.all([
                    // Fetch decision makers
                    getCompanyEmployees(domain, 1, 20, { is_decision_maker: true })
                        .then(res => setDecisionMakers(res.items)),
                    // Fetch regular employees
                    getCompanyEmployees(domain, 1, 20)
                        .then(res => setEmployees(res.items)),
                    getCompanyPlaybooks(domain).then(res => setPlaybooks(res.playbooks)),
                    getCompanyJobs(domain, 1).then(res => {
                        setJobs(res.items);
                        setJobsTotal(res.total);
                    }),
                    getCompanyNews(domain, 1).then(res => {
                        setNews(res.items);
                        setNewsTotal(res.total);
                    }),
                    getCompanyExplainability(domain).then(setExplainability)
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

    return {
        data,
        playbooks,
        explainability,
        decisionMakers,
        employees,
        jobs,
        jobsTotal,
        news,
        newsTotal,
        loading,
        loadMoreJobs,
        loadMoreNews,
        loadingMoreJobs,
        loadingMoreNews,
        refetch: loadData,
    };
}
