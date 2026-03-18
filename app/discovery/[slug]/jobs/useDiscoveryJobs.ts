'use client';

import { useEffect, useMemo } from 'react';
import { useDiscoveryDetail } from '@/components/providers/DiscoveryDetailProvider';
import type { JobPostingSummary } from '@/lib/schemas';

/** Provides paginated job postings from cached provider data. */
export function useDiscoveryJobs() {
  const {
    jobs, jobsTotal, jobsLoading, jobsError, ensureJobs,
    loadMoreJobs, jobsLoadingMore,
  } = useDiscoveryDetail();

  useEffect(() => {
    ensureJobs();
  }, [ensureJobs]);

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

  return {
    jobs, total: jobsTotal, grouped, showGrouping, departments,
    loading: jobsLoading, error: jobsError,
    loadingMore: jobsLoadingMore, loadMore: loadMoreJobs,
  };
}
