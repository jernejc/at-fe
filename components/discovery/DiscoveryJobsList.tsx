'use client';

import type { JobPostingSummary } from '@/lib/schemas';
import { JobRow, JobRowSkeleton } from '@/components/ui/job-row';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

interface DiscoveryJobsListProps {
  jobs: JobPostingSummary[];
  total: number;
  grouped: Record<string, JobPostingSummary[]>;
  showGrouping: boolean;
  departments: string[];
  loading: boolean;
  error: string | null;
  loadingMore: boolean;
  loadMore: () => Promise<void>;
}

/** Renders the jobs list for a discovery company detail page. */
export function DiscoveryJobsList({
  jobs, total, grouped, showGrouping, departments, loading, error, loadingMore, loadMore,
}: DiscoveryJobsListProps) {
  if (loading) return <JobsListSkeleton />;

  if (error) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-muted-foreground">No job postings found.</p>
      </div>
    );
  }

  const hasMore = jobs.length < total;

  return (
    <div className="space-y-10">
      {showGrouping ? (
        departments.map(dept => (
          <section key={dept}>
            <h3 className="text-base font-medium text-foreground mb-3 capitalize">
              {dept.length === 2 ? dept.toUpperCase() : dept}{' '}
              <span className="text-muted-foreground font-normal">({grouped[dept].length})</span>
            </h3>
            {grouped[dept].map(job => (
              <div key={job.id}>
                <Separator />
                <JobRow job={job} className='-mx-6' />
              </div>
            ))}
            <Separator />
          </section>
        ))
      ) : (
        <section>
          <h3 className="text-base font-medium text-foreground mb-3">
            Open Positions <span className="text-muted-foreground font-normal">({total})</span>
          </h3>
          {jobs.map(job => (
            <div key={job.id}>
              <Separator />
              <JobRow job={job} className='-mx-6' />
            </div>
          ))}
          <Separator />
        </section>
      )}

      {hasMore && (
        <div className="space-y-4">
          <div className="flex justify-center">
            <Button variant="ghost" onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? 'Loading...' : 'Load more'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function JobsListSkeleton() {
  return (
    <div>
      <div className="h-5 w-40 bg-muted rounded animate-pulse mb-3" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i}>
          <Separator />
          <JobRowSkeleton className='-mx-6' />
        </div>
      ))}
      <Separator />
    </div>
  );
}
