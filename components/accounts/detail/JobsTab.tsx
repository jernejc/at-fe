// Jobs Tab Component with Pagination

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { JobPostingSummary } from '@/lib/schemas';
import { EmptyState, SectionHeader } from './components';
import { formatRelativeDate } from './utils';

interface JobsTabProps {
    jobs: JobPostingSummary[];
    total: number;
    onLoadMore?: () => void;
    loadingMore?: boolean;
}

export function JobsTab({ jobs, total, onLoadMore, loadingMore }: JobsTabProps) {
    if (jobs.length === 0) return <EmptyState>No open positions</EmptyState>;

    // Group by department logic
    const byDept = jobs.reduce((acc, job) => {
        const dept = job.department || 'Other';
        if (!acc[dept]) acc[dept] = [];
        acc[dept].push(job);
        return acc;
    }, {} as Record<string, JobPostingSummary[]>);

    const departments = Object.keys(byDept);
    // If we only have "Other" or very few departments, show flat list to avoid unnecessary headers
    const showGrouping = departments.length > 2 || (departments.length === 2 && !departments.includes('Other'));

    return (
        <div className="space-y-6">
            {showGrouping ? (
                departments.map(dept => (
                    <section key={dept}>
                        <SectionHeader title={dept} count={byDept[dept].length} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {byDept[dept].map((job) => (
                                <JobCard key={job.id} job={job} />
                            ))}
                        </div>
                    </section>
                ))
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {jobs.map((job) => (
                        <JobCard key={job.id} job={job} />
                    ))}
                </div>
            )}

            {/* Load More Button */}
            {total > jobs.length && onLoadMore && (
                <div className="flex flex-col items-center gap-2 pt-6 border-t">
                    <p className="text-sm text-muted-foreground">Showing {jobs.length} of {total} positions</p>
                    <Button
                        onClick={onLoadMore}
                        disabled={loadingMore}
                        variant="outline"
                        className="px-6 py-2.5 h-auto text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all"
                    >
                        {loadingMore ? 'Loading...' : 'Load More Jobs'}
                    </Button>
                </div>
            )}
        </div>
    );
}


function JobCard({ job }: { job: JobPostingSummary }) {
    return (
        <Card className="group relative block rounded-xl border-border bg-card hover:border-blue-400 dark:hover:border-blue-600 transition-colors shadow-sm">
            <CardContent className="flex flex-col h-full gap-3 p-4">
                <div className="flex-1 min-w-0">
                    <h5 className="font-semibold text-base text-foreground mb-2">
                        {job.title}
                    </h5>

                    <div className="flex flex-wrap gap-2">
                        {job.location && (
                            <Badge variant="secondary" className="gap-1 px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground hover:bg-muted-foreground/20">
                                <svg className="w-3 h-3 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {job.location}
                            </Badge>
                        )}
                        {job.employment_type && (
                            <Badge variant="secondary" className="gap-1 px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground hover:bg-muted-foreground/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                {job.employment_type}
                            </Badge>
                        )}
                        {job.is_remote && (
                            <Badge variant="outline" className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/40">
                                Remote
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/50 mt-auto">
                    <span className="text-xs text-muted-foreground">
                        Posted {job.posted_at ? formatRelativeDate(job.posted_at) : 'recently'}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
