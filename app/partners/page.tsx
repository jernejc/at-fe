'use client';

import { useState, useCallback } from 'react';
import { DetailSidePanel } from '@/components/ui/detail-side-panel/DetailSidePanel';
import { PartnersView } from '@/components/partners/PartnersView';
import { PartnerDetail } from '@/components/partners/detail/PartnerDetail';
import { Pagination } from '@/components/ui/pagination';
import { usePartners } from '@/components/partners/usePartners';
import { useListKeyboardNav } from '@/hooks/useListKeyboardNav';
import type { PartnerRowData } from '@/components/campaigns/partners/PartnerRow';

export default function PartnersPage() {
  const partnersState = usePartners();
  const [selectedPartner, setSelectedPartner] = useState<PartnerRowData | null>(null);

  const handlePartnerClick = useCallback((partner: PartnerRowData) => {
    setSelectedPartner((prev) => (prev?.id === partner.id ? null : partner));
  }, []);

  const handleClose = useCallback(() => setSelectedPartner(null), []);

  const { getItemRef } = useListKeyboardNav({
    items: partnersState.partners,
    selectedItem: selectedPartner,
    getKey: (p) => p.id,
    onSelect: setSelectedPartner,
    enabled: !!selectedPartner,
  });

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="max-w-[1600px] mx-auto w-full px-10 py-10 flex-1">
        <DetailSidePanel
          open={!!selectedPartner}
          onClose={handleClose}
          detail={
            selectedPartner ? (
              <PartnerDetail partner={selectedPartner} />
            ) : null
          }
        >
          <PartnersView
            {...partnersState}
            selectedPartnerId={selectedPartner?.id ?? null}
            onPartnerClick={handlePartnerClick}
            getItemRef={getItemRef}
          />
        </DetailSidePanel>
      </div>

      <Pagination
        currentPage={partnersState.page}
        totalCount={partnersState.totalCount}
        pageSize={partnersState.pageSize}
        onPageChange={partnersState.setPage}
        disabled={partnersState.loading}
      />
    </div>
  );
}
