'use client';

import { useState, useCallback } from 'react';
import { useCampaignDetail } from '@/components/providers/CampaignDetailProvider';
import { CampaignPartnersView } from '@/components/campaigns/partners/CampaignPartnersView';
import { useCampaignPartners } from '@/components/campaigns/partners/useCampaignPartners';
import { useEditCampaignPartners } from '@/components/campaigns/partners/useEditCampaignPartners';
import { CampaignPartnerDetail } from '@/components/campaigns/partners/detail/CampaignPartnerDetail';
import { DetailSidePanel } from '@/components/ui/detail-side-panel/DetailSidePanel';
import { useListKeyboardNav } from '@/hooks/useListKeyboardNav';
import type { PartnerRowData } from '@/components/campaigns/partners/PartnerRow';

export default function CampaignPartnersPage() {
  const { campaign, partners: providerPartners, loading: campaignLoading, refreshData } = useCampaignDetail();
  const slug = campaign?.slug ?? '';

  const partnersState = useCampaignPartners({
    slug,
    enabled: !campaignLoading && !!campaign,
    initialPartners: providerPartners,
  });

  const editState = useEditCampaignPartners({
    slug,
    assignedPartners: partnersState.allPartners,
    campaignStatus: campaign?.status ?? 'draft',
    onSaved: () => {
      partnersState.refetch();
      refreshData();
    },
  });

  const [selectedPartner, setSelectedPartner] = useState<PartnerRowData | null>(null);

  const { enterEditMode, isEditing } = editState;

  const handleEnterEditMode = useCallback(() => {
    setSelectedPartner(null);
    enterEditMode();
  }, [enterEditMode]);

  const handlePartnerClick = useCallback((partner: PartnerRowData) => {
    if (isEditing) return;
    setSelectedPartner((prev) => (prev?.id === partner.id ? null : partner));
  }, [isEditing]);

  const handleClose = useCallback(() => setSelectedPartner(null), []);

  const { refetch, allPartners } = partnersState;

  const handleReassigned = useCallback(() => {
    refetch();
  }, [refetch]);

  const { getItemRef } = useListKeyboardNav({
    items: partnersState.partners,
    selectedItem: selectedPartner,
    getKey: (p) => p.id,
    onSelect: setSelectedPartner,
    enabled: !!selectedPartner && !isEditing,
  });

  return (
    <DetailSidePanel
      open={!!selectedPartner && !isEditing}
      onClose={handleClose}
      detail={
        selectedPartner ? (
          <CampaignPartnerDetail
            partner={selectedPartner}
            slug={slug}
            allPartners={allPartners}
            onReassigned={handleReassigned}
          />
        ) : null
      }
    >
      <CampaignPartnersView
        {...partnersState}
        selectedPartnerId={selectedPartner?.id ?? null}
        onPartnerClick={handlePartnerClick}
        getItemRef={getItemRef}
        {...editState}
        enterEditMode={handleEnterEditMode}
      />
    </DetailSidePanel>
  );
}
