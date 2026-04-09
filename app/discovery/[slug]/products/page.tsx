'use client';

import { useMemo } from 'react';
import { useDiscoveryProducts } from './useDiscoveryProducts';
import { DiscoveryProductsList } from '@/components/discovery/DiscoveryProductsList';
import { DetailSidePanel } from '@/components/ui/detail-side-panel/DetailSidePanel';
import { ProductFitDetail } from '@/components/discovery/ProductFitDetail';
import { useListKeyboardNav } from '@/hooks/useListKeyboardNav';

export default function DiscoveryProductsPage() {
  const {
    products, loading, error,
    selectedProductId, selectProduct, clearSelection,
  } = useDiscoveryProducts();

  const selectedProduct = useMemo(
    () => products.find((p) => p.product_id === selectedProductId) ?? null,
    [products, selectedProductId],
  );

  const { getItemRef } = useListKeyboardNav({
    items: products,
    selectedItem: selectedProduct,
    getKey: (p) => p.product_id,
    onSelect: (p) => selectProduct(p.product_id),
    enabled: !!selectedProduct,
  });

  return (
    <DetailSidePanel
      open={!!selectedProductId}
      onClose={clearSelection}
      detail={<ProductFitDetail product={selectedProduct} />}
    >
      <DiscoveryProductsList
        products={products}
        loading={loading}
        error={error}
        selectedProductId={selectedProductId}
        onProductClick={selectProduct}
        getItemRef={getItemRef}
      />
    </DetailSidePanel>
  );
}
