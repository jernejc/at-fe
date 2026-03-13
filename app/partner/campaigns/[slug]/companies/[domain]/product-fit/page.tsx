'use client';

import { useMemo } from 'react';
import { useProductFit } from './useProductFit';
import { ProductFitDashboard } from './ProductFitDashboard';
import { DiscoverySignalsList } from '@/components/discovery/DiscoverySignalsList';
import { DetailSidePanel } from '@/components/ui/detail-side-panel/DetailSidePanel';
import { SignalProvenanceDetail } from '@/components/signals/SignalProvenanceDetail';
import { useListKeyboardNav } from '@/hooks/useListKeyboardNav';
import type { SignalInterest, SignalEvent } from '@/lib/schemas';

/** Product fit analysis page with dashboard, interest signals, and event signals. */
export default function CompanyProductFitPage() {
  const {
    breakdown,
    interests,
    events,
    interestNarrative,
    eventNarrative,
    loading,
    error,
    selectedSignalId,
    provenance,
    provenanceLoading,
    selectSignal,
    clearSelection,
  } = useProductFit();

  // Combine interests + events for unified keyboard navigation
  const allSignals: (SignalInterest | SignalEvent)[] = useMemo(
    () => [...interests, ...events],
    [interests, events],
  );

  const selectedSignal = useMemo(
    () => allSignals.find((s) => s.id === selectedSignalId) ?? null,
    [allSignals, selectedSignalId],
  );

  const { getItemRef } = useListKeyboardNav({
    items: allSignals,
    selectedItem: selectedSignal,
    getKey: (s) => s.id,
    onSelect: (s) => selectSignal(s.id),
    enabled: !!selectedSignal,
  });

  return (
    <DetailSidePanel
      open={!!selectedSignalId}
      onClose={clearSelection}
      detail={<SignalProvenanceDetail signal={provenance} isLoading={provenanceLoading} />}
    >
      <ProductFitDashboard breakdown={breakdown} loading={loading} />

      <div className="mt-10">
        <DiscoverySignalsList
          signalType="interest"
          signals={interests}
          narrative={interestNarrative}
          loading={loading}
          error={error}
          selectedSignalId={selectedSignalId}
          onSignalClick={selectSignal}
          getItemRef={getItemRef}
        />
      </div>

      {/* Only show events section when there are events or still loading */}
      {(loading || events.length > 0) && (
        <div className="mt-10">
          <DiscoverySignalsList
            signalType="event"
            signals={events}
            narrative={eventNarrative}
            loading={loading}
            error={null}
            selectedSignalId={selectedSignalId}
            onSignalClick={selectSignal}
            getItemRef={getItemRef}
          />
        </div>
      )}
    </DetailSidePanel>
  );
}
