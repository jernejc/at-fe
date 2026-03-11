'use client';

import { cn, formatCompactNumber, formatCurrency, normalizeScoreNullable } from '@/lib/utils';
import type { CampaignRowData } from '@/lib/schemas';
import { Building2, Users, MapPin } from 'lucide-react';
import { CampaignIcon } from '@/lib/config/campaign-icons';
import { FitScoreIndicator } from '@/components/ui/fit-score-indicator';
import { CampaignProgress } from '@/components/ui/campaign-progress';
import { StatusIndicator } from '@/components/ui/status-indicator';
import { EngagementIndicator } from '@/components/ui/engagement-indicator';

interface CampaignRowProps {
  /** Campaign data (extended summary with optional enrichment fields) */
  campaign: CampaignRowData;
  /** Row click handler */
  onClick?: (campaign: CampaignRowData) => void;
  className?: string;
}

/** Horizontal table-row representation of a campaign with metrics. */
export function CampaignRow({ campaign, onClick, className }: CampaignRowProps) {
  const fitScore = campaign.avg_fit_score != null
    ? Math.round(normalizeScoreNullable(campaign.avg_fit_score))
    : null;

  const completedCount = (campaign.completed_won_count ?? 0) + (campaign.completed_lost_count ?? 0);

  const progressPct = campaign.company_count > 0
    ? Math.round((campaign.processed_count / campaign.company_count) * 100)
    : 0;

  const conversionPct = campaign.company_count > 0 && campaign.completed_won_count != null
    ? Math.round(((campaign.completed_won_count) / campaign.company_count) * 100)
    : null;

  return (
    <div
      className={cn(
        'group flex items-center gap-4 px-6 py-4 transition-colors overflow-hidden',
        onClick && 'cursor-pointer hover:bg-card hover:shadow-[0_0_0_1px_var(--border)] hover:rounded-xl',
        className,
      )}
      onClick={() => onClick?.(campaign)}
    >
      {/* Left: Campaign icon + status dot */}
      <div className="flex flex-col items-center gap-1.5 shrink-0">
        <div className="w-8 h-10 flex items-start justify-center">
          <CampaignIcon name={campaign.icon} className="w-7 h-7" />
        </div>
        <StatusIndicator status={campaign.status} />
      </div>

      {/* Middle: Campaign info (flex-grow) */}
      <div className="flex-1 min-w-0 flex flex-col">
        <span className="text-base font-medium text-foreground truncate leading-tight">
          {campaign.name}
        </span>

        <span className="text-xs text-muted-foreground truncate mt-1">
          {campaign.product_name ?? 'Unassigned'}
        </span>

        <div className="flex items-center gap-4 text-xs mt-2">
          <span className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span>{formatCompactNumber(campaign.company_count)}</span>
          </span>

          {campaign.avg_employee_size && (
            <span className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>{campaign.avg_employee_size}</span>
            </span>
          )}

          {campaign.main_location && (
            <span className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate max-w-[120px]">{campaign.main_location}</span>
            </span>
          )}
        </div>
      </div>

      {/* Right: Metrics */}
      <div className="hidden md:flex items-center gap-7 shrink-0">
        {/* Fit Score */}
        {fitScore != null && (
          <FitScoreIndicator
            score={fitScore}
            change={campaign.avg_fit_score_change ?? undefined}
            size={16}
            showChange={false}
          />
        )}

        {/* Campaign Progress */}
        <div className="flex items-center gap-2 w-28">
          <CampaignProgress
            total={campaign.company_count}
            inProgress={campaign.in_progress_count ?? 0}
            completed={completedCount || campaign.processed_count}
            taskCompletion={campaign.task_completion_pct ?? 0}
            height={10}
            showTooltip
            className="flex-1"
          />
          <span className="text-sm tabular-nums">
            {progressPct}%
          </span>
        </div>

        {/* Engagement — shown only when data is present (partner view) */}
        {campaign.engaged_count != null && campaign.assigned_count != null && (
          <div className="w-20">
            <EngagementIndicator
              engaged={campaign.engaged_count}
              total={campaign.assigned_count}
              size={20}
            />
          </div>
        )}

        {/* Conversion */}
        <span className="text-sm tabular-nums w-14">
          {conversionPct != null ? `${conversionPct}%` : '\u2013'}
        </span>

        {/* Won amount */}
        <span className="text-sm tabular-nums w-14">
          {campaign.total_won_amount != null ? formatCurrency(campaign.total_won_amount) : '\u2013'}
        </span>
      </div>
    </div>
  );
}

/** Loading skeleton for CampaignRow. */
export function CampaignRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-6 py-4">
      <div className="flex flex-col items-center gap-1.5 shrink-0">
        <div className="w-7 h-7 rounded bg-muted animate-pulse" />
        <div className="w-2 h-2 rounded-full bg-muted animate-pulse" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="w-48 h-4 bg-muted rounded animate-pulse" />
        <div className="w-32 h-3 bg-muted rounded animate-pulse" />
        <div className="w-40 h-3 bg-muted rounded animate-pulse" />
      </div>
      <div className="hidden md:flex items-center gap-7 shrink-0">
        <div className="w-16 h-4 bg-muted rounded animate-pulse" />
        <div className="w-28 h-3 bg-muted rounded animate-pulse" />
        <div className="w-14 h-4 bg-muted rounded animate-pulse" />
        <div className="w-14 h-4 bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
}
