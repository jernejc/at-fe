'use client';

import { cn } from '@/lib/utils';
import {
  ExpandableCard,
  ExpandableCardHeader,
  ExpandableCardDetails,
  useExpandableCard,
} from '@/components/ui/expandable-card';
import { SignalRow } from '@/components/signals/SignalRow';
import type { SignalInterest, SignalEvent } from '@/lib/schemas';
import type { LucideIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface AnalysisCardProps {
  title: string;
  icon: LucideIcon;
  narrative: string;
  interests?: SignalInterest[];
  events?: SignalEvent[];
  accentColor: 'violet' | 'amber' | 'blue';
}

const colorMap = {
  violet: {
    bg: 'bg-violet-100 dark:bg-violet-900/30',
    text: 'text-violet-600 dark:text-violet-400',
  },
  amber: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-600 dark:text-amber-400',
  },
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-600 dark:text-blue-400',
  },
} as const;

/** Reusable expandable card for signal/interest/event analysis narratives. */
export function AnalysisCard({
  title,
  icon: Icon,
  narrative,
  interests = [],
  events = [],
  accentColor,
}: AnalysisCardProps) {
  const colors = colorMap[accentColor];
  const hasSignals = interests.length > 0 || events.length > 0;

  return (
    <ExpandableCard>
      <ExpandableCardHeader className="space-y-3">
        <div className="flex items-center gap-2">
          <div className={cn('size-7 rounded-md flex items-center justify-center', colors.bg)}>
            <Icon className={cn('size-4', colors.text)} />
          </div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        </div>
        <Narrative text={narrative} />
      </ExpandableCardHeader>

      {hasSignals && (
        <ExpandableCardDetails className="pt-5 space-y-4">
          {interests.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Related Interests
                </p>
                <div className="flex flex-col -mx-6">
                  {[...interests].sort((a, b) => b.strength - a.strength).slice(0, 6).map((signal) => (
                    <SignalRow key={signal.id} signal={signal} />
                  ))}
                </div>
              </div>
            </>
          )}

          {events.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Related Events
                </p>
                <div className="flex flex-col -mx-6">
                  {[...events].sort((a, b) => b.strength - a.strength).slice(0, 6).map((signal) => (
                    <SignalRow key={signal.id} signal={signal} />
                  ))}
                </div>
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
    <p className={cn('text-sm text-muted-foreground leading-relaxed', !expanded && 'line-clamp-3')}>
      {text}
    </p>
  );
}
