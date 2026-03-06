'use client';

import { useMemo } from 'react';
import { useDiscoveryInterests } from './useDiscoveryInterests';
import { DiscoverySignalsList } from '@/components/discovery/DiscoverySignalsList';
import { DetailSidePanel } from '@/components/ui/detail-side-panel/DetailSidePanel';
import { SignalProvenanceDetail } from '@/components/signals/SignalProvenanceDetail';
import { useListKeyboardNav } from '@/hooks/useListKeyboardNav';

export default function DiscoveryInterestsPage() {
  const {
    interests, narrative, loading, error,
    selectedSignalId, provenance, provenanceLoading, selectSignal, clearSelection,
  } = useDiscoveryInterests();

  const selectedSignal = useMemo(
    () => interests.find((s) => s.id === selectedSignalId) ?? null,
    [interests, selectedSignalId],
  );

  const { getItemRef } = useListKeyboardNav({
    items: interests,
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
      <DiscoverySignalsList
        signalType="interest"
        signals={interests}
        narrative={narrative}
        loading={loading}
        error={error}
        selectedSignalId={selectedSignalId}
        onSignalClick={selectSignal}
        getItemRef={getItemRef}
      />
    </DetailSidePanel>
  );
}
