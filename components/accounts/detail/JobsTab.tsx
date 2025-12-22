// Jobs Tab Component with Pagination

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { JobPostingSummary } from '@/lib/schemas';
import { EmptyState, SectionHeader } from './components';
import { formatRelativeDate } from './utils';
import { JobDetailSheet } from './JobDetailSheet';
import { MapPin, Briefcase, Globe, ArrowRight } from 'lucide-react';


interface JobsTabProps {
    jobs: JobPostingSummary[];
    total: number;
    onLoadMore?: () => void;
    loadingMore?: boolean;
}

export function JobsTab({ jobs, total, onLoadMore, loadingMore }: JobsTabProps) {
    const [selectedJob, setSelectedJob] = useState<JobPostingSummary | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    const handleJobClick = (job: JobPostingSummary) => {
        setSelectedJob(job);
        setDetailOpen(true);
    };

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
        <div className="space-y-6 animate-in fade-in duration-500">
            {showGrouping ? (
                departments.map(dept => (
                    <section key={dept} className="space-y-3">
                        <SectionHeader title={dept} count={byDept[dept].length} />
                        <div className="grid grid-cols-1 gap-2">
                            {byDept[dept].map((job) => (
                                <JobCard
                                    key={job.id}
                                    job={job}
                                    onClick={() => handleJobClick(job)}
                                />
                            ))}
                        </div>
                    </section>
                ))
            ) : (
                <div className="grid grid-cols-1 gap-2">
                    {jobs.map((job) => (
                        <JobCard
                            key={job.id}
                            job={job}
                            onClick={() => handleJobClick(job)}
                        />
                    ))}
                </div>
            )}

            {/* Load More Button */}
            {total > jobs.length && onLoadMore && (
                <div className="flex flex-col items-center gap-2 pt-6 border-t border-border">
                    <p className="text-sm text-muted-foreground">Showing {jobs.length} of {total} positions</p>
                    <Button
                        onClick={onLoadMore}
                        disabled={loadingMore}
                        variant="ghost"
                        className="px-6 py-2 h-auto text-sm font-semibold hover:text-primary hover:bg-primary/5 transition-all"
                    >
                        {loadingMore ? 'Loading...' : 'Load More Jobs'}
                    </Button>
                </div>
            )}

            <JobDetailSheet
                job={selectedJob}
                isOpen={detailOpen}
                onClose={() => setDetailOpen(false)}
            />
        </div>
    );
}


function JobCard({ job, onClick }: { job: JobPostingSummary, onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            className="group relative bg-card rounded-md border border-border hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer hover:shadow-sm overflow-hidden"
        >
            <div className="flex">
                {/* Left: Posted Date */}
                <div className="w-24 border-r border-border bg-muted/5 flex items-center justify-center py-3 shrink-0">
                    <span className="text font-medium text-muted-foreground text-center px-2">
                        {job.posted_at ? formatRelativeDate(job.posted_at) : '—'}
                    </span>
                </div>

                {/* Main Content */}
                <div className="flex-1 px-4 py-3 min-w-0">
                    <h5 className="font-medium text-sm text-foreground truncate">
                        {job.title}
                    </h5>

                    {/* Metadata at bottom */}
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                        {job.location && (
                            <div className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5 text-slate-500" />
                                <span className="text-xs font-medium text-muted-foreground truncate max-w-[120px]">{job.location}</span>
                            </div>
                        )}
                        {job.employment_type && (
                            <div className="flex items-center gap-1">
                                <Briefcase className="h-3.5 w-3.5 text-amber-500" />
                                <span className="text-xs font-medium text-muted-foreground">{job.employment_type}</span>
                            </div>
                        )}
                        {job.is_remote && (
                            <div className="flex items-center gap-1">
                                <Globe className="h-3.5 w-3.5 text-emerald-500" />
                                <span className="text-xs font-medium text-muted-foreground">Remote</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Arrow Icon */}
                <div className="flex items-center justify-center w-8 border-l border-border bg-card">
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </div>
            </div>
        </div>
    );
}
