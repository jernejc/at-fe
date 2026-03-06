'use client';

import type { SignalInterest, SignalEvent } from '@/lib/schemas';
import { SignalRow, SignalRowSkeleton } from '@/components/signals/SignalRow';
import { SignalTableHeader } from '@/components/signals/SignalTableHeader';
import { Separator } from '@/components/ui/separator';
import { AlertCircle } from 'lucide-react';

const CONFIG = {
  interest: {
    title: 'Detected Interests',
    narrativeTitle: 'Interest Analysis',
    emptyMessage: 'No interests detected yet.',
    emptyDetail: 'AI analysis didn\u2019t identify specific interests for this company.',
  },
  event: {
    title: 'Key Events',
    narrativeTitle: 'Event Analysis',
    emptyMessage: 'No events detected yet.',
    emptyDetail: 'AI analysis didn\u2019t identify specific events for this company.',
  },
} as const;

interface DiscoverySignalsListProps {
  signalType: 'interest' | 'event';
  signals: (SignalInterest | SignalEvent)[];
  narrative: string | null;
  loading: boolean;
  error: string | null;
  selectedSignalId: number | null;
  onSignalClick: (signalId: number) => void;
  /** Ref callback from useListKeyboardNav for keyboard arrow navigation. */
  getItemRef?: (key: string | number) => (el: HTMLElement | null) => void;
}

/** Renders a signal list with optional narrative, table header, and row items. */
export function DiscoverySignalsList({
  signalType,
  signals,
  narrative,
  loading,
  error,
  selectedSignalId,
  onSignalClick,
  getItemRef,
}: DiscoverySignalsListProps) {
  const config = CONFIG[signalType];

  if (loading) return <SignalsListSkeleton />;

  if (error) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (signals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-24 text-center">
        <AlertCircle className="size-8 text-muted-foreground/50" />
        <p className="text-sm font-medium text-foreground">{config.emptyMessage}</p>
        <p className="text-sm text-muted-foreground">{config.emptyDetail}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Narrative */}
      {narrative && (
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-1">{config.narrativeTitle}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{narrative}</p>
        </section>
      )}

      {/* Signal rows */}
      <section>
        <h3 className="text-base font-medium text-foreground mb-3">
          {config.title}{' '}
          <span className="text-muted-foreground font-normal">({signals.length})</span>
        </h3>
        <SignalTableHeader />
        <Separator />
        {signals.map((signal) => (
          <div key={signal.id}>
            <SignalRow
              ref={getItemRef?.(signal.id)}
              signal={signal}
              onClick={() => onSignalClick(signal.id)}
              isActive={selectedSignalId === signal.id}
              className='-mx-5'
            />
            <Separator />
          </div>
        ))}
      </section>
    </div>
  );
}

function SignalsListSkeleton() {
  return (
    <div>
      <div className="h-4 w-48 bg-muted rounded animate-pulse mb-1" />
      <div className="h-3 w-full max-w-md bg-muted rounded animate-pulse mb-6" />
      <div className="h-5 w-40 bg-muted rounded animate-pulse mb-3" />
      <Separator />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i}>
          <SignalRowSkeleton />
          <Separator />
        </div>
      ))}
    </div>
  );
}
