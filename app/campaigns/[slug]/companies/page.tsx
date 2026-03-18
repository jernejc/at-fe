'use client';

import { useState, useCallback } from 'react';
import { useCampaignDetail } from '@/components/providers/CampaignDetailProvider';
import { CampaignCompaniesView } from '@/components/campaigns/companies/CampaignCompaniesView';
import { useCampaignCompanies } from '@/components/campaigns/companies/useCampaignCompanies';
import { useBulkSelection } from '@/hooks/useBulkSelection';
import { useBulkActions } from '@/components/campaigns/companies/useBulkActions';
import { CampaignCompanyDetail } from '@/components/campaigns/companies/detail/CampaignCompanyDetail';
import { DetailSidePanel } from '@/components/ui/detail-side-panel/DetailSidePanel';
import { useListKeyboardNav } from '@/hooks/useListKeyboardNav';
import type { CompanyRowData } from '@/lib/schemas';

export default function CampaignCompaniesPage() {
  const { campaign, partners: providerPartners, loading: campaignLoading } = useCampaignDetail();
  const slug = campaign?.slug ?? '';

  const companiesState = useCampaignCompanies({
    slug,
    enabled: !campaignLoading && !!campaign,
    partners: providerPartners,
  });

  const [selectedCompany, setSelectedCompany] = useState<CompanyRowData | null>(null);

  const handleCompanyClick = useCallback((company: CompanyRowData) => {
    setSelectedCompany((prev) => (prev?.id === company.id ? null : company));
  }, []);

  const handleClose = useCallback(() => setSelectedCompany(null), []);

  const { refetch, partners } = companiesState;

  const handleReassigned = useCallback(() => {
    refetch();
  }, [refetch]);

  // Bulk edit mode
  const {
    isEditing,
    selectedIds,
    selectedCount,
    toggleSelect,
    toggleSelectAll,
    isAllSelected,
    isPartiallySelected,
    startEditing,
    cancelEditing,
  } = useBulkSelection();
  const {
    handleRemove: bulkRemove,
    handleReassign: bulkReassign,
    isRemoving,
    isReassigning,
  } = useBulkActions();

  const handleStartEditing = useCallback(() => {
    setSelectedCompany(null);
    startEditing();
  }, [startEditing]);

  const handleRemove = useCallback(() => {
    bulkRemove(
      slug,
      selectedIds,
      companiesState.companies,
      refetch,
      cancelEditing,
    );
  }, [slug, selectedIds, companiesState.companies, refetch, cancelEditing, bulkRemove]);

  const handleReassign = useCallback((partnerId: number) => {
    bulkReassign(
      slug,
      partnerId,
      selectedIds,
      companiesState.companies,
      refetch,
      cancelEditing,
    );
  }, [slug, selectedIds, companiesState.companies, refetch, cancelEditing, bulkReassign]);

  const { getItemRef } = useListKeyboardNav({
    items: companiesState.companies,
    selectedItem: selectedCompany,
    getKey: (c) => c.id,
    onSelect: setSelectedCompany,
    enabled: !!selectedCompany && !isEditing,
  });

  return (
    <DetailSidePanel
      open={!!selectedCompany && !isEditing}
      onClose={handleClose}
      detail={
        selectedCompany ? (
          <CampaignCompanyDetail
            company={selectedCompany}
            slug={slug}
            targetProductId={campaign?.target_product_id ?? null}
            partners={partners}
            onReassigned={handleReassigned}
          />
        ) : null
      }
    >
      <CampaignCompaniesView
        {...companiesState}
        campaignSlug={slug}
        selectedCompanyId={selectedCompany?.id ?? null}
        onCompanyClick={handleCompanyClick}
        getItemRef={getItemRef}
        isEditing={isEditing}
        selectedIds={selectedIds}
        selectedCount={selectedCount}
        onToggleSelect={toggleSelect}
        onToggleSelectAll={toggleSelectAll}
        isAllSelected={isAllSelected(companiesState.companies)}
        isPartiallySelected={isPartiallySelected(companiesState.companies)}
        onStartEditing={handleStartEditing}
        onCancelEditing={cancelEditing}
        onRemove={handleRemove}
        onReassign={handleReassign}
        isRemoving={isRemoving}
        isReassigning={isReassigning}
        editPartners={partners}
      />
    </DetailSidePanel>
  );
}
