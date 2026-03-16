'use client';

import { TrendingUp, CheckCircle2 } from 'lucide-react';
import {
  ExpandableCard,
  ExpandableCardHeader,
  ExpandableCardDetails,
} from '@/components/ui/expandable-card';
import { Dashboard, DashboardCell, DashboardCellTitle, DashboardCellBody } from '@/components/ui/dashboard';
import { FitScoreIndicator } from '@/components/ui/fit-score-indicator';
import { CircularProgress } from '@/components/ui/circular-progress';
import { normalizeScore } from '@/lib/utils';
import type { FitScore, SignalContribution, FitSummaryFit } from '@/lib/schemas';

interface CampaignFitCardProps {
  fitBreakdown: FitScore | null;
  fitsSummary: FitSummaryFit[];
  targetProductId: number | null;
  loading: boolean;
}

/** Displays fit score, likelihood, and expandable signal contributions. */
export function CampaignFitCard({ fitBreakdown, fitsSummary, targetProductId, loading }: CampaignFitCardProps) {
  // Find the matching product's summary (not just the first entry)
  const matchingSummary = targetProductId
    ? fitsSummary.find((f) => f.product_id === targetProductId) ?? null
    : null;

  // Use breakdown if available, otherwise fall back to matching summary
  const score = fitBreakdown
    ? normalizeScore(fitBreakdown.combined_score)
    : matchingSummary
      ? normalizeScore(matchingSummary.combined_score)
      : null;

  const likelihood = fitBreakdown
    ? normalizeScore(fitBreakdown.likelihood_score)
    : matchingSummary
      ? normalizeScore(matchingSummary.likelihood_score)
      : null;

  const explanation = fitBreakdown?.fit_explanation;

  const hasMatches =
    (fitBreakdown?.interest_matches?.length ?? 0) > 0 ||
    (fitBreakdown?.event_matches?.length ?? 0) > 0;

  if (score === null && !loading) return null;

  return (
    <ExpandableCard>
      <ExpandableCardHeader className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Campaign fit</h3>

        {(score !== null || likelihood !== null) && (
          <Dashboard className="grid-cols-2">
            {score !== null && (
              <DashboardCell size="half" className='lg:col-span-1' height="auto" gradient={score > 75 ? 'green' : undefined}>
                <DashboardCellTitle>Fit score</DashboardCellTitle>
                <DashboardCellBody className='flex items-end justify-between'>
                  <span>{Math.round(score)}%</span>
                  <FitScoreIndicator score={Math.round(score)} size={80} showChange={false} showValue={false} />
                </DashboardCellBody>
              </DashboardCell>
            )}
            {likelihood !== null && (
              <DashboardCell size="half" className='lg:col-span-1 text-right' height="auto" gradient={likelihood > 75 ? 'green' : undefined}>
                <DashboardCellTitle>Likelihood</DashboardCellTitle>
                <DashboardCellBody className='flex items-end justify-between'>
                  <CircularProgress value={likelihood} size={80} />
                  <span>{Math.round(likelihood)}%</span>
                </DashboardCellBody>
              </DashboardCell>
            )}
          </Dashboard>
        )}

        {explanation && (
          <p className="leading-relaxed">{explanation}</p>
        )}
      </ExpandableCardHeader>

      {hasMatches && (
        <ExpandableCardDetails className="space-y-4">
          {fitBreakdown!.interest_matches && fitBreakdown!.interest_matches.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Matched Interests
              </p>
              <div className="space-y-2">
                {fitBreakdown!.interest_matches.map((match, i) => (
                  <ContributionCard key={i} match={match} />
                ))}
              </div>
            </div>
          )}

          {fitBreakdown!.event_matches && fitBreakdown!.event_matches.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Matched Events
              </p>
              <div className="space-y-2">
                {fitBreakdown!.event_matches.map((match, i) => (
                  <ContributionCard key={i} match={match} />
                ))}
              </div>
            </div>
          )}
        </ExpandableCardDetails>
      )}
    </ExpandableCard>
  );
}

function ContributionCard({ match }: { match: SignalContribution }) {
  const displayName = match.display_name || match.category.replace(/_/g, ' ');

  return (
    <div className="bg-muted/50 rounded-lg p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground capitalize">{displayName}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <TrendingUp className="size-3" />
              {Math.round(match.strength)}% strength
            </span>
            <span>{match.weight}x weight</span>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded text-xs font-semibold shrink-0">
          <CheckCircle2 className="size-3" />
          +{match.contribution.toFixed(2)}
        </div>
      </div>
    </div>
  );
}
