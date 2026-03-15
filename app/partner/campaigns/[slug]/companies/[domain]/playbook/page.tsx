'use client';

import { usePlaybook, PlaybookEmptyState, PlaybookContent, PlaybookContentSkeleton } from '@/components/playbook';

/** Playbook page — loads and displays the playbook for the campaign's target product. */
export default function CompanyPlaybookPage() {
  const { playbook, loading, isGenerating, generationError, productName, generatePlaybook } =
    usePlaybook();

  if (loading) {
    return <PlaybookContentSkeleton />;
  }

  if (!playbook) {
    return (
      <PlaybookEmptyState
        productName={productName}
        isGenerating={isGenerating}
        generationError={generationError}
        onGenerate={generatePlaybook}
      />
    );
  }

  return <PlaybookContent playbook={playbook} />;
}
