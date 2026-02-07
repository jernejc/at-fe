// Jobs Tab Component with Pagination

import { cn, formatRelativeDate } from '@/lib/utils';
import type { JobPostingSummary } from '@/lib/schemas';
import { SectionHeader } from './components';
import { ListCard } from './ListCard';
import { LoadMoreSection } from './LoadMoreSection';
import { MapPin, Briefcase, Globe } from 'lucide-react';


interface JobsTabProps {
    jobs: JobPostingSummary[];
    total: number;
    onLoadMore?: () => void;
    loadingMore?: boolean;
    onSelectJob: (job: JobPostingSummary) => void;
    onProcess?: () => Promise<void>;
}

export function JobsTab({ jobs, total, onLoadMore, loadingMore, onSelectJob, onProcess }: JobsTabProps) {

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
            <SectionHeader title="Open Positions" count={total} color="bg-emerald-600" />

            {showGrouping ? (
                departments.map(dept => (
                    <section key={dept} className="space-y-3">
                        <SectionHeader title={dept.length === 2 ? dept.toUpperCase() : dept} count={byDept[dept].length} />
                        <div className="grid grid-cols-1 gap-2">
                            {byDept[dept].map((job) => (
                                <JobCard
                                    key={job.id}
                                    job={job}
                                    onClick={() => onSelectJob(job)}
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
                            onClick={() => onSelectJob(job)}
                        />
                    ))}
                </div>
            )}

            {/* Load More Button */}
            {onLoadMore && (
                <LoadMoreSection
                    currentCount={jobs.length}
                    totalCount={total}
                    onLoadMore={onLoadMore}
                    loadingMore={loadingMore ?? false}
                    itemLabel="positions"
                />
            )}
        </div>
    );
}


function JobCard({ job, onClick }: { job: JobPostingSummary, onClick: () => void }) {
    return (
        <ListCard
            leftColumn={job.posted_at ? formatRelativeDate(job.posted_at) : '—'}
            onClick={onClick}
            rightIcon="arrow"
        >
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
        </ListCard>
    );
}
