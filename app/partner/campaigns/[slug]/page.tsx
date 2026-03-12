'use client';

import { useCampaignDetail } from '@/components/providers/CampaignDetailProvider';
import { PartnerCampaignOverviewDashboard } from '@/components/partner/campaigns/detail/PartnerCampaignOverviewDashboard';

export default function PartnerCampaignOverviewPage() {
  const { campaign, overview, loading } = useCampaignDetail();

  return (
    <PartnerCampaignOverviewDashboard
      campaign={campaign}
      overview={overview}
      loading={loading}
    />
  );
}
