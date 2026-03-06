'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDiscoveryDetail } from '@/components/providers/DiscoveryDetailProvider';
import { getCompanyJobs } from '@/lib/api/companies';
import type { JobPostingSummary } from '@/lib/schemas';

/** Fetches and manages paginated job postings for the current discovery company. */
export function useDiscoveryJobs() {
  const { domain } = useDiscoveryDetail();

  const [jobs, setJobs] = useState<JobPostingSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetch() {
      setLoading(true);
      setError(null);
      try {
        const res = await getCompanyJobs(domain, 1);
        if (cancelled) return;
        setJobs(res.items);
        setTotal(res.total);
        setPage(1);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load jobs');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetch();
    return () => { cancelled = true; };
  }, [domain]);

  const loadMore = useCallback(async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await getCompanyJobs(domain, nextPage);
      setJobs(prev => [...prev, ...res.items]);
      setPage(nextPage);
    } catch {
      // Silently fail load-more — user can retry
    } finally {
      setLoadingMore(false);
    }
  }, [domain, page, loadingMore]);

  const { grouped, departments, showGrouping } = useMemo(() => {
    const byDept = jobs.reduce((acc, job) => {
      const dept = job.department || 'Other';
      if (!acc[dept]) acc[dept] = [];
      acc[dept].push(job);
      return acc;
    }, {} as Record<string, JobPostingSummary[]>);

    const depts = Object.keys(byDept);
    const shouldGroup = depts.length > 2 || (depts.length === 2 && !depts.includes('Other'));

    return { grouped: byDept, departments: depts, showGrouping: shouldGroup };
  }, [jobs]);

  return { jobs, total, grouped, showGrouping, departments, loading, error, loadingMore, loadMore };
}
