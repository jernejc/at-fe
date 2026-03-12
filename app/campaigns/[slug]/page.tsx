'use client';

import { useCampaignDetail } from '@/components/providers/CampaignDetailProvider';
import { CampaignOverviewDashboard } from '@/components/campaigns/detail/CampaignOverviewDashboard';

export default function CampaignOverviewPage() {
  const {
    campaign,
    overview,
    partners,
    loading,
    isPublishing,
    isUnpublishing,
    handlePublish,
    handleUnpublish,
  } = useCampaignDetail();

  const partnerCount = partners.length;
  const inactivePartnerCount = partners.filter(
    (p) => p.partner_status !== 'active',
  ).length;

  return (
    <CampaignOverviewDashboard
      campaign={campaign}
      overview={overview}
      loading={loading}
      isPublishing={isPublishing}
      isUnpublishing={isUnpublishing}
      handlePublish={handlePublish}
      handleUnpublish={handleUnpublish}
      partnerCount={partnerCount}
      inactivePartnerCount={inactivePartnerCount}
    />
  );
}
