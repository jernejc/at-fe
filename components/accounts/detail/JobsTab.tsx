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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
        <Card
            onClick={onClick}
            className="group relative cursor-pointer border-border/60 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all duration-200 overflow-hidden"
        >
            <CardContent className="flex flex-col h-full gap-4 p-4">
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                        <h5 className="font-semibold text-base text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                            {job.title}
                        </h5>
                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {job.location && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/40 px-2 py-1 rounded-md border border-border/50">
                                <MapPin className="h-3 w-3 opacity-70" />
                                <span className="truncate max-w-[150px]">{job.location}</span>
                            </div>
                        )}
                        {job.employment_type && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/40 px-2 py-1 rounded-md border border-border/50">
                                <Briefcase className="h-3 w-3 opacity-70" />
                                <span className="truncate max-w-[150px]">{job.employment_type}</span>
                            </div>
                        )}
                        {job.is_remote && (
                            <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-md border border-emerald-100 dark:border-emerald-900/50">
                                <Globe className="h-3 w-3" />
                                <span>Remote</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/50 mt-auto">
                    <span className="text-xs text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">
                        Posted {job.posted_at ? formatRelativeDate(job.posted_at) : 'recently'}
                    </span>
                    <Badge variant="secondary" className="text-[10px] font-normal px-1.5 h-5 bg-muted text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                        View Details
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}
