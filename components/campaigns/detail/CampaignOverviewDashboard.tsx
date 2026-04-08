'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dashboard, DashboardCell, DashboardCellTitle, DashboardCellBody } from '@/components/ui/dashboard';
import { StatusIndicator } from '@/components/ui/status-indicator';
import { FitScoreIndicator } from '@/components/ui/fit-score-indicator';
import { PublishDialog } from './PublishDialog';
import { normalizeScoreNullable } from '@/lib/utils';
import type { CampaignRead, CampaignOverview } from '@/lib/schemas';

interface CampaignOverviewDashboardProps {
  campaign: CampaignRead | null;
  overview: CampaignOverview | null;
  loading: boolean;
  isPublishing: boolean;
  isUnpublishing: boolean;
  handlePublish: () => Promise<void>;
  handleUnpublish: () => Promise<void>;
  /** Future metrics — will be wired when the metrics endpoint exists. */
  unassignedCount?: number;
  inactivePartnerCount?: number;
  partnerCount?: number;
  targetAmount?: number | null;
  closedAmount?: number | null;
  progressPct?: number | null;
  conversionRate?: number | null;
}

/** Campaign overview metrics dashboard — 4-column grid matching the design reference. */
export function CampaignOverviewDashboard({
  campaign,
  overview,
  loading,
  isPublishing,
  isUnpublishing,
  handlePublish,
  handleUnpublish,
  unassignedCount,
  inactivePartnerCount,
  partnerCount,
  targetAmount,
  closedAmount,
  progressPct,
  conversionRate,
}: CampaignOverviewDashboardProps) {
  const [publishDialogMode, setPublishDialogMode] = useState<'publish' | 'unpublish' | null>(null);

  const status = campaign?.status ?? 'draft';
  const rawFit = campaign?.avg_fit_score ?? null;
  const avgFit = rawFit != null ? Math.round(normalizeScoreNullable(rawFit)) : null;

  return (
    <>
      <Dashboard>
        {/* Row 1 — Product & Status */}
        <DashboardCell size="half" height="auto">
          <DashboardCellTitle>Product</DashboardCellTitle>
          <DashboardCellBody size="sm" loading={loading}>
            {overview?.product_name ?? '--'}
          </DashboardCellBody>
        </DashboardCell>

        <DashboardCell size="half" height="auto">
          <DashboardCellTitle>Status</DashboardCellTitle>
          <div className="flex items-center justify-between">
            <DashboardCellBody size="sm" loading={loading} className="flex items-center gap-3">
              <StatusIndicator status={status} size={10} />
              <span className='capitalize'>{status}</span>
            </DashboardCellBody>
            {status === 'draft' && !loading && (
              <Button
                variant="secondary"
                onClick={() => setPublishDialogMode('publish')}
              >
                <Bell data-icon="inline-start" />
                Publish
              </Button>
            )}
          </div>
        </DashboardCell>

        {/* Row 2 — Companies, Partners, Avg. fit, Target */}
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

        <DashboardCell
          size="quarter"
          gradient={inactivePartnerCount && inactivePartnerCount > 0 ? 'red' : undefined}
        >
          <div>
            <DashboardCellTitle>Partners</DashboardCellTitle>
            {inactivePartnerCount != null && inactivePartnerCount > 0 && (
              <Badge variant="red" className="mt-1">
                {inactivePartnerCount} inactive
              </Badge>
            )}
          </div>
          <DashboardCellBody loading={loading}>
            {partnerCount != null ? partnerCount : '--'}
          </DashboardCellBody>
        </DashboardCell>

        <DashboardCell size="quarter">
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
          <DashboardCellTitle>Target</DashboardCellTitle>
          <DashboardCellBody loading={loading}>
            {targetAmount != null ? formatCompactCurrency(targetAmount) : '--'}
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

      <PublishDialog
        mode={publishDialogMode ?? 'publish'}
        open={publishDialogMode !== null}
        onOpenChange={(open) => !open && setPublishDialogMode(null)}
        onConfirm={publishDialogMode === 'unpublish' ? handleUnpublish : handlePublish}
        loading={publishDialogMode === 'unpublish' ? isUnpublishing : isPublishing}
        unassignedCount={unassignedCount}
      />
    </>
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
