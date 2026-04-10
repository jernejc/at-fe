'use client';

import { ExternalLink } from 'lucide-react';
import {
  ExpandableCard,
  ExpandableCardHeader,
  ExpandableCardDetails,
} from '@/components/ui/expandable-card';
import { Dashboard, DashboardCell, DashboardCellTitle, DashboardCellBody } from '@/components/ui/dashboard';
import { FitScoreIndicator } from '@/components/ui/fit-score-indicator';
import { CircularProgress } from '@/components/ui/circular-progress';
import { SignalRow } from '@/components/signals/SignalRow';
import type { SignalRowData } from '@/components/signals/SignalRow';
import { normalizeScore } from '@/lib/utils';
import type { SignalContribution, FitSummaryFit } from '@/lib/schemas';

interface CampaignFitCardProps {
  fitsSummary: FitSummaryFit[];
  targetProductId: number | null;
  domain: string;
  loading: boolean;
}

/** Adapts a SignalContribution to the shape SignalRow expects. */
function toSignalRowData(match: SignalContribution): SignalRowData {
  return {
    category: match.category,
    display_name: match.display_name,
    strength: Math.round(match.strength),
    evidence_summary: match.evidence,
    source_types: match.source_type ? [match.source_type] : undefined,
    signalType:
      match.signal_type === 'interest' || match.signal_type === 'event'
        ? match.signal_type
        : undefined,
  };
}

/** Displays fit score, likelihood, and expandable signal contributions. */
export function CampaignFitCard({ fitsSummary, targetProductId, domain, loading }: CampaignFitCardProps) {
  // Find the matching product's summary
  const fit = targetProductId
    ? fitsSummary.find((f) => f.product_id === targetProductId) ?? null
    : null;

  const score = fit ? normalizeScore(fit.combined_score) : null;
  const likelihood = fit ? normalizeScore(fit.likelihood_score) : null;
  const explanation = fit?.fit_explanation;
  const productName = fit?.product_name;
  const productId = fit?.product_id ?? targetProductId;

  const hasMatches =
    (fit?.interest_matches?.length ?? 0) > 0 ||
    (fit?.event_matches?.length ?? 0) > 0;

  if (score === null && !loading) return null;

  return (
    <ExpandableCard>
      <ExpandableCardHeader className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Product fit</h3>
          {productName && (
            <p className="text-sm text-muted-foreground">{productName}</p>
          )}
        </div>

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
        <ExpandableCardDetails className="pt-5 space-y-4">
          {fit!.interest_matches && fit!.interest_matches.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Matched Interests
              </p>
              <div className="flex flex-col -mx-6">
                {[...fit!.interest_matches].sort((a, b) => b.strength - a.strength).map((match, i) => (
                  <SignalLink key={i} match={match} domain={domain} productId={productId}>
                    <SignalRow
                      signal={toSignalRowData(match)}
                      metrics={<ExternalLink size="14" />}
                      hoverable
                    />
                  </SignalLink>
                ))}
              </div>
            </div>
          )}

          {fit!.event_matches && fit!.event_matches.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Matched Events
              </p>
              <div className="flex flex-col -mx-6">
                {[...fit!.event_matches].sort((a, b) => b.strength - a.strength).map((match, i) => (
                  <SignalLink key={i} match={match} domain={domain} productId={productId}>
                    <SignalRow
                      signal={toSignalRowData(match)}
                      metrics={<ExternalLink size="14" />}
                      hoverable
                    />
                  </SignalLink>
                ))}
              </div>
            </div>
          )}
        </ExpandableCardDetails>
      )}
    </ExpandableCard>
  );
}

/** Wraps children in an anchor linking to the signal's discovery page, or renders plain if no signal_id. */
function SignalLink({
  match,
  domain,
  productId,
  children,
}: {
  match: SignalContribution;
  domain: string;
  productId: number | null;
  children: React.ReactNode;
}) {
  const href =
    match.signal_id && productId
      ? `/discovery/${domain}/products?product=${productId}&signal=${match.signal_id}`
      : null;

  if (!href) return <>{children}</>;

  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}
