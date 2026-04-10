'use client';

import type { TaggedSignal } from '@/app/discovery/[slug]/products/useProductsAndSignals';
import { SignalRow, SignalRowSkeleton } from '@/components/signals/SignalRow';
import { SignalTableHeader } from '@/components/signals/SignalTableHeader';
import { Separator } from '@/components/ui/separator';
import { AlertCircle } from 'lucide-react';

interface MergedSignalsListProps {
  signals: TaggedSignal[];
  loading: boolean;
  error: string | null;
  selectedSignalId: number | null;
  onSignalClick: (id: number) => void;
  /** Ref callback from useListKeyboardNav for keyboard arrow navigation. */
  getItemRef?: (key: string | number) => (el: HTMLElement | null) => void;
}

/** Merged interest + event signals list with narrative, type badges, and selection. */
export function MergedSignalsList({
  signals,
  loading,
  error,
  selectedSignalId,
  onSignalClick,
  getItemRef,
}: MergedSignalsListProps) {
  if (loading) return <MergedSignalsListSkeleton />;

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
        <p className="text-sm font-medium text-foreground">No signals found.</p>
        <p className="text-sm text-muted-foreground">
          Try adjusting your filters or select a different product.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <section>
        <SignalTableHeader />
        <Separator />
        {signals.map((signal) => (
          <div key={signal.id}>
            <SignalRow
              ref={getItemRef?.(signal.id)}
              signal={signal}
              onClick={() => onSignalClick(signal.id)}
              isActive={selectedSignalId === signal.id}
              className="-mx-5"
            />
            <Separator />
          </div>
        ))}
      </section>
    </div>
  );
}

function MergedSignalsListSkeleton() {
  return (
    <div>
      <div className="h-4 w-48 bg-muted rounded animate-pulse mb-1" />
      <div className="h-3 w-full max-w-md bg-muted rounded animate-pulse mb-6" />
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
