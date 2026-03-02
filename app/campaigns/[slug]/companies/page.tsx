'use client';

import { useState, useCallback } from 'react';
import { useCampaignDetail } from '@/components/providers/CampaignDetailProvider';
import { CampaignCompaniesView } from '@/components/campaigns/companies/CampaignCompaniesView';
import { useCampaignCompanies } from '@/components/campaigns/companies/useCampaignCompanies';
import { useBulkSelection } from '@/components/campaigns/companies/useBulkSelection';
import { useBulkActions } from '@/components/campaigns/companies/useBulkActions';
import { CampaignCompanyDetail } from '@/components/campaigns/companies/detail/CampaignCompanyDetail';
import { DetailSidePanel } from '@/components/ui/detail-side-panel/DetailSidePanel';
import { useListKeyboardNav } from '@/hooks/useListKeyboardNav';
import type { CompanyRowData } from '@/lib/schemas';

export default function CampaignCompaniesPage() {
  const { campaign, loading: campaignLoading } = useCampaignDetail();
  const slug = campaign?.slug ?? '';

  const companiesState = useCampaignCompanies({
    slug,
    enabled: !campaignLoading && !!campaign,
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
  const bulk = useBulkSelection();
  const bulkActions = useBulkActions();

  const handleStartEditing = useCallback(() => {
    setSelectedCompany(null);
    bulk.startEditing();
  }, [bulk.startEditing]);

  const handleRemove = useCallback(() => {
    bulkActions.handleRemove(
      slug,
      bulk.selectedIds,
      companiesState.companies,
      refetch,
      bulk.cancelEditing,
    );
  }, [slug, bulk.selectedIds, companiesState.companies, refetch, bulk.cancelEditing, bulkActions.handleRemove]);

  const handleReassign = useCallback((partnerId: number) => {
    bulkActions.handleReassign(
      slug,
      partnerId,
      bulk.selectedIds,
      companiesState.companies,
      refetch,
      bulk.cancelEditing,
    );
  }, [slug, bulk.selectedIds, companiesState.companies, refetch, bulk.cancelEditing, bulkActions.handleReassign]);

  const { getItemRef } = useListKeyboardNav({
    items: companiesState.companies,
    selectedItem: selectedCompany,
    getKey: (c) => c.id,
    onSelect: setSelectedCompany,
    enabled: !!selectedCompany && !bulk.isEditing,
  });

  return (
    <DetailSidePanel
      open={!!selectedCompany && !bulk.isEditing}
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
        isEditing={bulk.isEditing}
        selectedIds={bulk.selectedIds}
        selectedCount={bulk.selectedCount}
        onToggleSelect={bulk.toggleSelect}
        onToggleSelectAll={bulk.toggleSelectAll}
        isAllSelected={bulk.isAllSelected(companiesState.companies)}
        isPartiallySelected={bulk.isPartiallySelected(companiesState.companies)}
        onStartEditing={handleStartEditing}
        onCancelEditing={bulk.cancelEditing}
        onRemove={handleRemove}
        onReassign={handleReassign}
        isRemoving={bulkActions.isRemoving}
        isReassigning={bulkActions.isReassigning}
        editPartners={partners}
      />
    </DetailSidePanel>
  );
}
