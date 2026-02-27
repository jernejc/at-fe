'use client';

import { TrendingUp, CheckCircle2 } from 'lucide-react';
import {
  ExpandableCard,
  ExpandableCardHeader,
  ExpandableCardDetails,
} from '@/components/ui/expandable-card';
import { FitScoreIndicator } from '@/components/ui/fit-score-indicator';
import { Progress } from '@/components/ui/progress';
import { normalizeScore } from '@/lib/utils';
import type { FitScore, SignalContribution, FitSummaryFit } from '@/lib/schemas';
import { Separator } from '@/components/ui/separator';

interface CampaignFitCardProps {
  fitBreakdown: FitScore | null;
  fitsSummary: FitSummaryFit[];
  loading: boolean;
}

/** Displays fit score, likelihood, and expandable signal contributions. */
export function CampaignFitCard({ fitBreakdown, fitsSummary, loading }: CampaignFitCardProps) {
  // Use breakdown if available, otherwise fall back to summary
  const score = fitBreakdown
    ? normalizeScore(fitBreakdown.combined_score)
    : fitsSummary[0]
      ? normalizeScore(fitsSummary[0].combined_score)
      : null;

  const likelihood = fitBreakdown
    ? normalizeScore(fitBreakdown.likelihood_score)
    : fitsSummary[0]
      ? normalizeScore(fitsSummary[0].likelihood_score)
      : null;

  const topDrivers = fitBreakdown?.top_drivers ?? fitsSummary[0]?.top_drivers ?? [];
  const explanation = topDrivers.length > 0
    ? topDrivers.map((d) => d.replace(/_/g, ' ')).join(', ')
    : null;

  const hasMatches =
    (fitBreakdown?.interest_matches?.length ?? 0) > 0 ||
    (fitBreakdown?.event_matches?.length ?? 0) > 0;

  if (score === null && !loading) return null;

  return (
    <ExpandableCard>
      <ExpandableCardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground">Campaign fit</h3>
            {explanation && (
              <p className="leading-relaxed">{explanation}</p>
            )}
          </div>
          {score !== null && (
            <div className='flex items-center gap-3 px-3 py-6'>
              <FitScoreIndicator score={Math.round(score)} size={28} showChange={false} showValue={false} />
              <div className='font-display font-bold text-4xl leading-1 -mt-1'>{Math.round(score)}</div>
            </div>
          )}
        </div>

        {likelihood !== null && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Likelihood</span>
                <span className="text-foreground font-medium">{Math.round(likelihood)}%</span>
              </div>
              <Progress value={likelihood} className="h-2" />
            </div>
          </>
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
