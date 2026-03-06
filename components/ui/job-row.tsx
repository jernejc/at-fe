'use client';

import { cn, formatRelativeDate } from '@/lib/utils';
import type { JobPostingSummary } from '@/lib/schemas';
import { MapPin, Briefcase, HouseWifi } from 'lucide-react';

interface JobRowProps {
  /** Job posting data for the row. */
  job: JobPostingSummary;
  /** Row click handler. */
  onClick?: (job: JobPostingSummary) => void;
  /** Whether this row is currently selected/active. */
  isActive?: boolean;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}

/** Horizontal row representation of a job posting with date badge, title, location, and metrics. */
export function JobRow({ job, onClick, isActive, className, ref }: JobRowProps) {
  const handleClick = () => onClick?.(job);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(job);
    }
  };

  return (
    <div
      ref={ref}
      className={cn(
        'group flex items-center gap-4 px-6 py-4 transition-colors outline-none',
        onClick && 'cursor-pointer hover:bg-card hover:shadow-[0_0_0_1px_var(--border)] hover:rounded-xl',
        isActive && 'bg-card shadow-[0_0_0_1px_var(--border)] rounded-xl',
        className,
      )}
      onClick={onClick ? handleClick : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
    >
      {/* Date badge */}
      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
        <span className="text-xs font-medium text-muted-foreground text-center leading-tight">
          {job.posted_at ? formatRelativeDate(job.posted_at) : '—'}
        </span>
      </div>

      {/* Title + location */}
      <div className="flex-1 min-w-0 flex flex-col">
        <span className="text-base font-medium text-foreground truncate leading-tight">
          {job.title}
        </span>
        {job.location && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{job.location}</span>
          </span>
        )}
      </div>

      {/* Metrics (hidden on mobile) */}
      <div className="hidden md:flex items-center gap-7 shrink-0">
        {/* Remote */}
        {job.is_remote && (
          <span className="flex items-center gap-2 text-sm w-24">
            <HouseWifi className="w-3.5 h-3.5 shrink-0 text-blue-500" />
            <span>Remote</span>
          </span>
        )}

        {/* Employment type */}
        {job.employment_type && (
          <span className="flex items-center gap-2 text-sm w-24">
            <Briefcase className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{job.employment_type}</span>
          </span>
        )}
      </div>
    </div>
  );
}

/** Loading skeleton for JobRow. */
export function JobRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-6 py-4">
      <div className="w-12 h-12 rounded-lg bg-muted animate-pulse" />
      <div className="flex-1 space-y-1.5">
        <div className="w-40 h-4 bg-muted rounded animate-pulse" />
        <div className="w-24 h-3 bg-muted rounded animate-pulse" />
      </div>
      <div className="hidden md:flex items-center gap-7 shrink-0">
        <div className="w-24 h-4 bg-muted rounded animate-pulse" />
        <div className="w-24 h-4 bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
}
