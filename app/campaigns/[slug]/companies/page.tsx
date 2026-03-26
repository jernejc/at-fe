'use client';

import { useState, useCallback, useRef } from 'react';
import { useCampaignDetail } from '@/components/providers/CampaignDetailProvider';
import { CampaignCompaniesView } from '@/components/campaigns/companies/CampaignCompaniesView';
import { useCampaignCompanies } from '@/components/campaigns/companies/useCampaignCompanies';
import { useBulkSelection } from '@/hooks/useBulkSelection';
import { useBulkActions } from '@/components/campaigns/companies/useBulkActions';
import { CampaignCompanyDetail } from '@/components/campaigns/companies/detail/CampaignCompanyDetail';
import type { CachedCompanyDetail } from '@/components/campaigns/companies/detail/useCampaignCompanyDetail';
import { DetailSidePanel } from '@/components/ui/detail-side-panel/DetailSidePanel';
import { useListKeyboardNav } from '@/hooks/useListKeyboardNav';
import { assignAllCompaniesToPartners } from '@/lib/api/partners';
import { toast } from 'sonner';
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
  const companyCacheRef = useRef(new Map<string, CachedCompanyDetail>());

  const handleCompanyClick = useCallback((company: CompanyRowData) => {
    setSelectedCompany((prev) => (prev?.id === company.id ? null : company));
  }, []);

  const handleClose = useCallback(() => setSelectedCompany(null), []);

  const { refetch, partners, updateCompanyPartner, activeFilters } = companiesState;

  const handleReassigned = useCallback((newPartnerId: number) => {
    const newPartner = partners.find((p) => p.partner_id === newPartnerId);
    if (!newPartner) return;

    // Optimistically update the selected company
    setSelectedCompany((prev) => prev ? {
      ...prev,
      partner_id: newPartner.partner_id,
      partner_name: newPartner.partner_name,
      partner_logo_url: newPartner.partner_logo_url ?? undefined,
    } : null);

    // Optimistically update the company in the list
    if (selectedCompany) {
      updateCompanyPartner(selectedCompany.id, newPartner.partner_id, newPartner.partner_name);
    }

    // Only refetch if a partner filter is active (company may leave the filtered set)
    if (activeFilters.some((f) => f.key === 'partner')) refetch();
  }, [partners, selectedCompany, updateCompanyPartner, activeFilters, refetch]);

  // Auto-assign unassigned companies to partners
  const [isAutoAssigning, setIsAutoAssigning] = useState(false);
  const hasUnassigned = companiesState.companies.some((c) => !c.partner_id);

  const handleAutoAssign = useCallback(async () => {
    setIsAutoAssigning(true);
    try {
      const result = await assignAllCompaniesToPartners(slug, { clear_existing: false });
      toast.success(`Assigned ${result.assigned} companies to partners`);
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to auto-assign companies');
    } finally {
      setIsAutoAssigning(false);
    }
  }, [slug, refetch]);

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
            cache={companyCacheRef}
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
        hasUnassigned={hasUnassigned}
        onAutoAssign={handleAutoAssign}
        isAutoAssigning={isAutoAssigning}
      />
    </DetailSidePanel>
  );
}
