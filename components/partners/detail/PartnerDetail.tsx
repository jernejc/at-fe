'use client';

import { Loader2 } from 'lucide-react';
import { usePartnerDetail } from './usePartnerDetail';
import { PartnerOverviewCard } from './PartnerOverviewCard';
import { PartnerCampaignCard } from './PartnerCampaignCard';
import type { PartnerRowData } from '@/components/campaigns/partners/PartnerRow';

interface PartnerDetailProps {
  partner: PartnerRowData;
}

/** Right-panel detail view for a selected partner showing overview and campaign cards. */
export function PartnerDetail({ partner }: PartnerDetailProps) {
  const { partnerDetails, loading } = usePartnerDetail({
    partnerId: partner.partnerId,
    isOpen: true,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const campaigns = partnerDetails?.campaigns ?? [];

  return (
    <div className="space-y-3">
      <PartnerOverviewCard partner={partnerDetails ?? partner} />

      {campaigns.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No campaigns assigned to this partner.
        </p>
      ) : (
        campaigns.map((campaign) => (
          <PartnerCampaignCard
            key={campaign.id}
            campaign={campaign}
            partnerId={partner.partnerId}
          />
        ))
      )}
    </div>
  );
}
