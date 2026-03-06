'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useDiscoveryCompanies } from '@/components/discovery/useDiscoveryCompanies';
import { DiscoveryView } from '@/components/discovery/DiscoveryView';
import { Pagination } from '@/components/ui/pagination';
import { useBulkSelection } from '@/hooks/useBulkSelection';
import type { CompanyRowData } from '@/lib/schemas';

export default function DiscoveryPage() {
  return (
    <Suspense>
      <DiscoveryPageContent />
    </Suspense>
  );
}

function DiscoveryPageContent() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const discovery = useDiscoveryCompanies();
  const bulk = useBulkSelection();

  const handleCompanyClick = (company: CompanyRowData) => {
    router.push(`/discovery/${company.domain}`);
  };

  const handleNewCampaign = () => {
    const domains = discovery.companies
      .filter((c) => bulk.selectedIds.has(c.id))
      .map((c) => c.domain)
      .join(',');
    router.push(`/campaigns/new?companies=${encodeURIComponent(domains)}`);
  };

  const handleAddToExisting = () => {
    // TODO(team): Implement add-to-existing-campaign dialog
  };

  if (status === 'loading' || !session) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="max-w-[1600px] mx-auto w-full px-10 py-10 flex-1">
        <DiscoveryView
          {...discovery}
          onCompanyClick={handleCompanyClick}
          isEditing={bulk.isEditing}
          selectedIds={bulk.selectedIds}
          selectedCount={bulk.selectedCount}
          onToggleSelect={bulk.toggleSelect}
          onToggleSelectAll={bulk.toggleSelectAll}
          isAllSelected={bulk.isAllSelected(discovery.companies)}
          isPartiallySelected={bulk.isPartiallySelected(discovery.companies)}
          onStartEditing={bulk.startEditing}
          onCancelEditing={bulk.cancelEditing}
          onNewCampaign={handleNewCampaign}
          onAddToExisting={handleAddToExisting}
        />
      </div>

      <Pagination
        currentPage={discovery.page}
        totalCount={discovery.totalCount}
        pageSize={discovery.pageSize}
        onPageChange={discovery.setPage}
        disabled={discovery.loading}
      />
    </div>
  );
}
