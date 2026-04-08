'use client';

import { Dashboard, DashboardCell, DashboardCellTitle, DashboardCellBody } from '@/components/ui/dashboard';
import { StatusIndicator } from '@/components/ui/status-indicator';
import { StatusesChart } from '@/components/ui/statuses-chart';
import { FitScoreIndicator } from '@/components/ui/fit-score-indicator';
import { Badge } from '@/components/ui/badge';
import { EngagementIndicator } from '@/components/ui/engagement-indicator';
import { normalizeScoreNullable } from '@/lib/utils';
import type { CampaignRead, CampaignOverview } from '@/lib/schemas';

interface PartnerCampaignOverviewDashboardProps {
  campaign: CampaignRead | null;
  overview: CampaignOverview | null;
  loading: boolean;
  /** Future metrics — will be wired when the metrics endpoint exists. */
  unassignedCount?: number;
  closedAmount?: number | null;
  progressPct?: number | null;
  conversionRate?: number | null;
  /** Status distribution counts for the Statuses chart cell. */
  statusNew?: number;
  statusUnworked?: number;
  statusInProgress?: number;
  statusWon?: number;
  statusLost?: number;
  /** 0-100 task completion % shown as striped overlay on in-progress bar. */
  statusInProgressCompletion?: number;
}

/** Partner campaign overview metrics dashboard — 4-column grid. */
export function PartnerCampaignOverviewDashboard({
  campaign,
  overview,
  loading,
  unassignedCount,
  closedAmount,
  progressPct,
  conversionRate,
  statusNew,
  statusUnworked,
  statusInProgress,
  statusWon,
  statusLost,
  statusInProgressCompletion,
}: PartnerCampaignOverviewDashboardProps) {
  const status = campaign?.status ?? 'draft';
  const rawFit = campaign?.avg_fit_score ?? null;
  const avgFit = rawFit != null ? Math.round(normalizeScoreNullable(rawFit)) : null;

  return (
    <Dashboard>
      {/* Row 1 — Product, Status & Actions */}
      <DashboardCell size="half" height="auto">
        <DashboardCellTitle>Product</DashboardCellTitle>
        <DashboardCellBody size="sm" loading={loading}>
          {overview?.product_name ?? '--'}
        </DashboardCellBody>
      </DashboardCell>

      <DashboardCell size="half" height="auto">
        <DashboardCellTitle>Status</DashboardCellTitle>
        <DashboardCellBody size="sm" loading={loading} className="flex items-center gap-3">
          <StatusIndicator status={status} size={10} />
          <span className='capitalize'>{status}</span>
        </DashboardCellBody>
      </DashboardCell>

      {/* Row 2 — Companies, Avg. fit, Statuses, Leads Engaged */}
      <DashboardCell
        size="quarter"
        gradient={unassignedCount && unassignedCount > 0 ? 'orange' : undefined}
      >
        <div>
          <DashboardCellTitle>Companies</DashboardCellTitle>
          {unassignedCount != null && unassignedCount > 0 && (
            <Badge variant="orange" className="mt-1">
              {unassignedCount} unassigned
            </Badge>
          )}
        </div>
        <DashboardCellBody loading={loading}>
          {campaign?.company_count ?? 0}
        </DashboardCellBody>
      </DashboardCell>

      <DashboardCell size="quarter" gradient={!loading && avgFit && avgFit > 75 ? 'green' : undefined}>
        <DashboardCellTitle tooltip="Average product fit across all companies in this campaign based on detected signals.">Avg. fit</DashboardCellTitle>
        <DashboardCellBody loading={loading} className="flex items-center gap-3">
          {avgFit != null ? (
            <>
              <FitScoreIndicator score={avgFit} showValue={false} showChange={false} size={32} />
              <span>{avgFit}%</span>
            </>
          ) : (
            <span>--</span>
          )}
        </DashboardCellBody>
      </DashboardCell>

      <DashboardCell size="quarter">
        <DashboardCellTitle>Statuses</DashboardCellTitle>
        <DashboardCellBody loading={loading} className="flex items-end">
          <StatusesChart
            newCount={statusNew ?? 0}
            unworkedCount={statusUnworked ?? 0}
            inProgressCount={statusInProgress ?? 0}
            wonCount={statusWon ?? 0}
            lostCount={statusLost ?? 0}
            inProgressCompletion={statusInProgressCompletion ?? 0}
          />
        </DashboardCellBody>
      </DashboardCell>

      <DashboardCell size="quarter">
        <DashboardCellTitle>Leads Engaged</DashboardCellTitle>
        <DashboardCellBody loading={loading} className="flex justify-center relative">
          <EngagementIndicator
            engaged={0}
            total={0}
            hideCount
            size={200}
            className="w-full max-w-50 [&_svg]:w-full [&_svg]:h-auto"
          />
          <p className="absolute left-0 right-0 bottom-0 text-center">
            <span>-</span>
            <span className="text-xl">/-</span>
          </p>
        </DashboardCellBody>
      </DashboardCell>

      {/* Row 3 — Progress, Avg. conversion, Closed */}
      <DashboardCell size="half">
        <DashboardCellTitle>Progress</DashboardCellTitle>
        <DashboardCellBody loading={loading}>
          {progressPct != null ? `${progressPct}%` : '--'}
        </DashboardCellBody>
      </DashboardCell>

      <DashboardCell size="quarter">
        <DashboardCellTitle>Avg. conversion</DashboardCellTitle>
        <DashboardCellBody loading={loading}>
          {conversionRate != null ? `${conversionRate}%` : '--'}
        </DashboardCellBody>
      </DashboardCell>

      <DashboardCell
        size="quarter"
        gradient={closedAmount && closedAmount > 0 ? 'green' : undefined}
      >
        <DashboardCellTitle>Closed</DashboardCellTitle>
        <DashboardCellBody loading={loading}>
          {closedAmount != null ? formatCompactCurrency(closedAmount) : '--'}
        </DashboardCellBody>
      </DashboardCell>
    </Dashboard>
  );
}

/** Formats a number as compact USD (e.g. 5000000 → "$5m"). */
function formatCompactCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(amount);
}
