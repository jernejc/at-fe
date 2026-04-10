'use client';

import { cn } from '@/lib/utils';
import {
  ExpandableCard,
  ExpandableCardHeader,
  ExpandableCardDetails,
  useExpandableCard,
} from '@/components/ui/expandable-card';
import { Separator } from '@/components/ui/separator';

interface AnalysisCardProps {
  signalNarrative: string;
  interestNarrative?: string | null;
  eventNarrative?: string | null;
}

/** Unified analysis card showing signal, interest, and event narratives. */
export function AnalysisCard({ signalNarrative, interestNarrative, eventNarrative }: AnalysisCardProps) {
  const hasMoreNarratives = !!interestNarrative || !!eventNarrative;

  return (
    <ExpandableCard>
      <ExpandableCardHeader className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Analysis</h3>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Signal Analysis
          </p>
          <Narrative text={signalNarrative} />
        </div>
      </ExpandableCardHeader>

      {hasMoreNarratives && (
        <ExpandableCardDetails className="pt-5 space-y-4">
          {interestNarrative && (
            <>
              <Separator />
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Interest Analysis
                </p>
                <p className="leading-relaxed">{interestNarrative}</p>
              </div>
            </>
          )}
          {eventNarrative && (
            <>
              <Separator />
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Event Analysis
                </p>
                <p className="leading-relaxed">{eventNarrative}</p>
              </div>
            </>
          )}
        </ExpandableCardDetails>
      )}
    </ExpandableCard>
  );
}

function Narrative({ text }: { text: string }) {
  const { expanded } = useExpandableCard();
  return (
    <p className={cn('leading-relaxed', !expanded && 'line-clamp-3')}>
      {text}
    </p>
  );
}
