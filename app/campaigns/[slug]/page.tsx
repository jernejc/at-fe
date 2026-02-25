'use client';

import { useCampaignDetail } from '@/components/providers/CampaignDetailProvider';
import { CampaignOverviewDashboard } from '@/components/campaigns/detail/CampaignOverviewDashboard';

export default function CampaignOverviewPage() {
  const {
    campaign,
    overview,
    loading,
    isPublishing,
    isUnpublishing,
    handlePublish,
    handleUnpublish,
  } = useCampaignDetail();

  return (
    <CampaignOverviewDashboard
      campaign={campaign}
      overview={overview}
      loading={loading}
      isPublishing={isPublishing}
      isUnpublishing={isUnpublishing}
      handlePublish={handlePublish}
      handleUnpublish={handleUnpublish}
    />
  );
}
