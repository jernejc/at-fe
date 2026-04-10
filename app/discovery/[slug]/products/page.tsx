'use client';

import { Suspense, useMemo } from 'react';
import { useProductsAndSignals } from './useProductsAndSignals';
import { ProductDashboard } from '@/components/discovery/ProductDashboard';
import { SignalToolbar } from '@/components/discovery/SignalToolbar';
import { MergedSignalsList } from '@/components/discovery/MergedSignalsList';
import { DetailSidePanel } from '@/components/ui/detail-side-panel/DetailSidePanel';
import { SignalProvenanceDetail } from '@/components/signals/SignalProvenanceDetail';
import { useListKeyboardNav } from '@/hooks/useListKeyboardNav';

function ProductsAndSignalsContent() {
  const {
    products, selectedProductId, selectedProduct, selectProduct, clearProduct,
    filteredSignals, narratives, filters, setFilters, sort, setSort,
    loading, error, score, likelihood,
    selectedSignalId, provenance, provenanceLoading, selectSignal, clearSignalSelection,
  } = useProductsAndSignals();

  const selectedSignal = useMemo(
    () => filteredSignals.find((s) => s.id === selectedSignalId) ?? null,
    [filteredSignals, selectedSignalId],
  );

  const { getItemRef } = useListKeyboardNav({
    items: filteredSignals,
    selectedItem: selectedSignal,
    getKey: (s) => s.id,
    onSelect: (s) => selectSignal(s.id),
    enabled: !!selectedSignal,
  });

  return (
    <DetailSidePanel
      open={!!selectedSignalId}
      onClose={clearSignalSelection}
      detail={<SignalProvenanceDetail signal={provenance} isLoading={provenanceLoading} />}
    >
      <div className="flex flex-col gap-8">
        <ProductDashboard
          products={products}
          selectedProductId={selectedProductId}
          selectedProduct={selectedProduct}
          onSelectProduct={selectProduct}
          onClearProduct={clearProduct}
          score={score}
          likelihood={likelihood}
          narratives={narratives}
          loading={loading}
          error={error}
        />
        <SignalToolbar
          products={products}
          filters={filters}
          onFiltersChange={setFilters}
          sort={sort}
          onSortChange={setSort}
        />
        <MergedSignalsList
          signals={filteredSignals}
          loading={loading}
          error={error}
          selectedSignalId={selectedSignalId}
          onSignalClick={selectSignal}
          getItemRef={getItemRef}
        />
      </div>
    </DetailSidePanel>
  );
}

/** Products & signals page — dashboard with product selection, merged filterable signal list. */
export default function ProductsAndSignalsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsAndSignalsContent />
    </Suspense>
  );
}
