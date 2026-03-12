'use client';

import { Badge } from '@/components/ui/badge';
import {
  ExpandableCard,
  ExpandableCardHeader,
  ExpandableCardDetails,
} from '@/components/ui/expandable-card';
import { Dashboard, DashboardCell, DashboardCellTitle, DashboardCellBody } from '@/components/ui/dashboard';
import { FitScoreIndicator } from '@/components/ui/fit-score-indicator';
import { CircularProgress } from '@/components/ui/circular-progress';
import { SignalRow } from '@/components/signals/SignalRow';
import { Separator } from '@/components/ui/separator';
import { normalizeScore } from '@/lib/utils';
import type { FitScore, SignalContribution } from '@/lib/schemas';
import { AlertTriangle } from 'lucide-react';

interface ProductFitDetailProps {
  breakdown: FitScore | null;
  isLoading?: boolean;
}

/** Product fit breakdown detail content for use inside DetailSidePanel. */
export function ProductFitDetail({ breakdown, isLoading }: ProductFitDetailProps) {
  if (isLoading) return <ProductFitDetailSkeleton />;

  if (!breakdown) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Failed to load product fit breakdown.
      </div>
    );
  }

  const score = Math.round(normalizeScore(breakdown.combined_score));
  const likelihood = Math.round(normalizeScore(breakdown.likelihood_score));
  const interests = breakdown.interest_matches ?? [];
  const events = breakdown.event_matches ?? [];
  const missing = breakdown.missing_signals ?? [];
  const drivers = breakdown.top_drivers ?? [];

  return (
    <div className="space-y-4">
      {/* Card 1: Product Overview */}
      <ExpandableCard>
        <ExpandableCardHeader className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground leading-tight">
            {breakdown.product_name}
          </h2>

          <Dashboard className="grid-cols-2">
            <DashboardCell size="half" className="lg:col-span-1" height="auto" gradient={score > 75 ? 'green' : undefined}>
              <DashboardCellTitle>Fit score</DashboardCellTitle>
              <DashboardCellBody className="flex items-end justify-between">
                <span>{score}%</span>
                <FitScoreIndicator score={score} size={80} showChange={false} showValue={false} />
              </DashboardCellBody>
            </DashboardCell>
            <DashboardCell size="half" className="lg:col-span-1 text-right" height="auto" gradient={likelihood > 75 ? 'green' : undefined}>
              <DashboardCellTitle>Likelihood</DashboardCellTitle>
              <DashboardCellBody className="flex items-end justify-between">
                <CircularProgress value={likelihood} size={80} />
                <span>{likelihood}%</span>
              </DashboardCellBody>
            </DashboardCell>
          </Dashboard>
        </ExpandableCardHeader>

        <ExpandableCardDetails className="space-y-3">
          <Separator />
          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div className="space-y-1">
              <span className="block font-medium text-foreground">Signals Used</span>
              <span>{breakdown.signals_used}</span>
            </div>
            <div className="space-y-1">
              <span className="block font-medium text-foreground">Calculated</span>
              <span>{new Date(breakdown.calculated_at).toLocaleDateString()}</span>
            </div>
          </div>
        </ExpandableCardDetails>
      </ExpandableCard>

      {/* Card 2: Top Drivers */}
      {drivers.length > 0 && (
        <ExpandableCard>
          <ExpandableCardHeader>
            <h3 className="text-lg font-semibold text-foreground mb-3">
              Top Drivers ({drivers.length})
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {drivers.map((driver, i) => (
                <Badge key={i} variant="grey" className="text-xs capitalize">
                  {driver.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          </ExpandableCardHeader>
        </ExpandableCard>
      )}

      {/* Card 3: Matched Interests */}
      {interests.length > 0 && (
        <SignalMatchCard title="Matched Interests" matches={interests} />
      )}

      {/* Card 4: Matched Events */}
      {events.length > 0 && (
        <SignalMatchCard title="Matched Events" matches={events} />
      )}

      {/* Card 5: Missing Signals */}
      {missing.length > 0 && (
        <ExpandableCard>
          <ExpandableCardHeader>
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              Missing Signals ({missing.length})
            </h3>
            <ul className="space-y-2">
              {missing.slice(0, 5).map((signal, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground/50 shrink-0" />
                  <span className="capitalize">{signal.replace(/_/g, ' ')}</span>
                </li>
              ))}
            </ul>
          </ExpandableCardHeader>

          {missing.length > 5 && (
            <ExpandableCardDetails>
              <ul className="space-y-2">
                {missing.slice(5).map((signal, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground/50 shrink-0" />
                    <span className="capitalize">{signal.replace(/_/g, ' ')}</span>
                  </li>
                ))}
              </ul>
            </ExpandableCardDetails>
          )}
        </ExpandableCard>
      )}
    </div>
  );
}

/* ---------- Sub-components ---------- */

/** Renders an ExpandableCard with SignalRow items and custom contribution metrics. */
function SignalMatchCard({ title, matches }: { title: string; matches: SignalContribution[] }) {
  const preview = matches.slice(0, 3);
  const remaining = matches.slice(3);

  return (
    <ExpandableCard>
      <ExpandableCardHeader>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          {title} ({matches.length})
        </h3>
        <div>
          {preview.map((match, i) => (
            <div key={`${match.category}-${i}`}>
              <SignalRow
                signal={{ ...match, strength: match.strength }}
                metrics={<ContributionMetrics match={match} />}
                className="-mx-6"
              />
              <Separator />
            </div>
          ))}
        </div>
      </ExpandableCardHeader>

      {remaining.length > 0 && (
        <ExpandableCardDetails>
          <div className="-mt-5">
            {remaining.map((match, i) => (
              <div key={`${match.category}-${i}`}>
                <SignalRow
                  signal={{ ...match, strength: match.strength }}
                  metrics={<ContributionMetrics match={match} />}
                  className="-mx-6"
                />
                {i < remaining.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </ExpandableCardDetails>
      )}
    </ExpandableCard>
  );
}

/** Custom metrics for a signal contribution: strength%, weight, +contribution. */
function ContributionMetrics({ match }: { match: SignalContribution }) {
  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      <span>
        <span className="text-foreground font-medium">{Math.round(match.strength)}%</span>
        <span className="ml-1">str</span>
      </span>
      <span>
        <span className="text-foreground font-medium">{match.weight}x</span>
        <span className="ml-1">wt</span>
      </span>
      <span className="text-foreground font-medium">
        +{match.contribution.toFixed(1)}
      </span>
    </div>
  );
}

function ProductFitDetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl ring-1 ring-foreground/10 px-6 py-5 space-y-3">
        <div className="h-5 w-48 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-24 bg-muted rounded-xl animate-pulse" />
          <div className="h-24 bg-muted rounded-xl animate-pulse" />
        </div>
      </div>
      <div className="bg-card rounded-xl ring-1 ring-foreground/10 px-6 py-5 space-y-3">
        <div className="h-5 w-32 bg-muted rounded animate-pulse" />
        <div className="flex gap-1.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-5 w-16 bg-muted rounded-full animate-pulse" />
          ))}
        </div>
      </div>
      <div className="bg-card rounded-xl ring-1 ring-foreground/10 px-6 py-5 space-y-3">
        <div className="h-5 w-40 bg-muted rounded animate-pulse" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3">
            <div className="w-4 h-4 bg-muted rounded animate-pulse" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            </div>
            <div className="w-24 h-4 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
