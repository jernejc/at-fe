'use client';

import { useState, useCallback } from 'react';
import { useCampaignDetail } from '@/components/providers/CampaignDetailProvider';
import { CampaignPartnersView } from '@/components/campaigns/partners/CampaignPartnersView';
import { useCampaignPartners } from '@/components/campaigns/partners/useCampaignPartners';
import { CampaignPartnerDetail } from '@/components/campaigns/partners/detail/CampaignPartnerDetail';
import { DetailSidePanel } from '@/components/ui/detail-side-panel/DetailSidePanel';
import { useListKeyboardNav } from '@/hooks/useListKeyboardNav';
import type { PartnerRowData } from '@/components/campaigns/partners/PartnerRow';

export default function CampaignPartnersPage() {
  const { campaign, loading: campaignLoading } = useCampaignDetail();
  const slug = campaign?.slug ?? '';

  const partnersState = useCampaignPartners({
    slug,
    enabled: !campaignLoading && !!campaign,
  });

  const [selectedPartner, setSelectedPartner] = useState<PartnerRowData | null>(null);

  const handlePartnerClick = useCallback((partner: PartnerRowData) => {
    setSelectedPartner((prev) => (prev?.id === partner.id ? null : partner));
  }, []);

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
    enabled: !!selectedPartner,
  });

  return (
    <DetailSidePanel
      open={!!selectedPartner}
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
      />
    </DetailSidePanel>
  );
}
