'use client';

import { PlaybookEmptyState, PlaybookContent, PlaybookContentSkeleton } from '@/components/playbook';
import { useDiscoveryPlaybook } from './useDiscoveryPlaybook';
import { ProductSelector } from './ProductSelector';

/** Discovery playbooks page — select a product and view or generate its playbook. */
export default function DiscoveryPlaybooksPage() {
  const {
    products,
    productsLoading,
    productsError,
    selectedProductId,
    selectProduct,
    selectedProductName,
    playbook,
    playbookLoading,
    isGenerating,
    generationError,
    generatePlaybook,
    productIdsWithPlaybook,
  } = useDiscoveryPlaybook();

  return (
    <div className="space-y-8">
      <ProductSelector
        products={products}
        selectedProductId={selectedProductId}
        onSelectProduct={selectProduct}
        productIdsWithPlaybook={productIdsWithPlaybook}
        loading={productsLoading}
      />

      {productsError ? (
        <p className="text-sm text-destructive">{productsError}</p>
      ) : playbookLoading || productsLoading ? (
        <PlaybookContentSkeleton />
      ) : playbook ? (
        <PlaybookContent playbook={playbook} />
      ) : selectedProductId ? (
        <PlaybookEmptyState
          productName={selectedProductName}
          isGenerating={isGenerating}
          generationError={generationError}
          onGenerate={generatePlaybook}
        />
      ) : null}
    </div>
  );
}
