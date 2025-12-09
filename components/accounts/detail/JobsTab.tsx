// Jobs Tab Component with Pagination

import type { JobPostingSummary } from '@/lib/schemas';
import { EmptyState } from './components';
import { formatRelativeDate } from './utils';

interface JobsTabProps {
    jobs: JobPostingSummary[];
    total: number;
    onLoadMore?: () => void;
    loadingMore?: boolean;
}

export function JobsTab({ jobs, total, onLoadMore, loadingMore }: JobsTabProps) {
    if (jobs.length === 0) return <EmptyState>No open positions</EmptyState>;

    // Group by department
    const byDept = jobs.reduce((acc, job) => {
        const dept = job.department || 'Other';
        if (!acc[dept]) acc[dept] = [];
        acc[dept].push(job);
        return acc;
    }, {} as Record<string, JobPostingSummary[]>);

    const departments = Object.keys(byDept);

    return (
        <div className="p-6 space-y-6">
            {/* Jobs by department */}
            {departments.map(dept => (
                <section key={dept}>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-1 h-4 bg-slate-600" />
                        <h4 className="font-semibold text-sm">{dept}</h4>
                        <span className="text-xs text-muted-foreground">({byDept[dept].length})</span>
                    </div>
                    <div className="border divide-y rounded-lg overflow-hidden">
                        {byDept[dept].map((job) => (
                            <div key={job.id} className="flex items-start justify-between p-3 hover:bg-muted/30 transition-colors gap-4">
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{job.title}</p>
                                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-sm">
                                        {job.location && (
                                            <span className="text-muted-foreground flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                {job.location}
                                            </span>
                                        )}
                                        {job.employment_type && (
                                            <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                {job.employment_type}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    {job.is_remote && (
                                        <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">Remote</span>
                                    )}
                                    {job.posted_at && (
                                        <span className="text-xs text-muted-foreground">{formatRelativeDate(job.posted_at)}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            ))}

            {/* Load More Button */}
            {total > jobs.length && onLoadMore && (
                <div className="flex flex-col items-center gap-2 pt-4">
                    <p className="text-sm text-muted-foreground">Showing {jobs.length} of {total} positions</p>
                    <button
                        onClick={onLoadMore}
                        disabled={loadingMore}
                        className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loadingMore ? 'Loading...' : 'Load More'}
                    </button>
                </div>
            )}
        </div>
    );
}
