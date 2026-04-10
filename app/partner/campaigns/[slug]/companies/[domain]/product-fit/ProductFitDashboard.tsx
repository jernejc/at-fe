'use client';

import {
  Dashboard,
  DashboardCell,
  DashboardCellTitle,
  DashboardCellBody,
} from '@/components/ui/dashboard';
import { FitScoreIndicator } from '@/components/ui/fit-score-indicator';
import { CircularProgress } from '@/components/ui/circular-progress';
import { Badge } from '@/components/ui/badge';
import { normalizeScore } from '@/lib/utils';
import type { FitScore } from '@/lib/schemas';

interface ProductFitDashboardProps {
  breakdown: FitScore | null;
  loading: boolean;
}

/** Dashboard grid showing product fit score, likelihood, signals used, calculated date, and top drivers. */
export function ProductFitDashboard({ breakdown, loading }: ProductFitDashboardProps) {
  const score = breakdown ? Math.round(normalizeScore(breakdown.combined_score)) : 0;
  const likelihood = breakdown ? Math.round(normalizeScore(breakdown.likelihood_score)) : 0;
  const drivers = breakdown?.top_drivers ?? [];

  return (
    <Dashboard>
      {/* Row 1: Metrics */}
      <DashboardCell gradient={!loading && score > 75 ? 'green' : undefined}>
        <DashboardCellTitle>Fit Score</DashboardCellTitle>
        <DashboardCellBody loading={loading} className="flex items-end justify-between">
          <span>{score}%</span>
          <FitScoreIndicator score={score} size={80} showChange={false} showValue={false} />
        </DashboardCellBody>
      </DashboardCell>

      <DashboardCell gradient={!loading && likelihood > 75 ? 'green' : undefined}>
        <DashboardCellTitle>Likelihood</DashboardCellTitle>
        <DashboardCellBody loading={loading} className="flex items-end justify-between">
          <CircularProgress value={likelihood} size={80} />
          <span>{likelihood}%</span>
        </DashboardCellBody>
      </DashboardCell>

      <DashboardCell>
        <DashboardCellTitle>Signals Used</DashboardCellTitle>
        <DashboardCellBody loading={loading}>
          {breakdown?.signals_used ?? '—'}
        </DashboardCellBody>
      </DashboardCell>

      <DashboardCell>
        <DashboardCellTitle>Calculated</DashboardCellTitle>
        <DashboardCellBody loading={loading} size="sm">
          {breakdown ? new Date(breakdown.calculated_at).toLocaleDateString() : '—'}
        </DashboardCellBody>
      </DashboardCell>

      {/* Row 2: Top Drivers */}
      <DashboardCell size="full" height="auto">
        <DashboardCellTitle>Top Drivers</DashboardCellTitle>
        <DashboardCellBody loading={loading}>
          {drivers.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {drivers.map((driver, i) => (
                <Badge key={i} variant="grey" className="text-xs capitalize font-normal">
                  {driver.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </DashboardCellBody>
      </DashboardCell>
    </Dashboard>
  );
}
