'use client';

import { useCampaignDetail } from '@/components/providers/CampaignDetailProvider';
import { CampaignCompaniesView } from '@/components/campaigns/companies/CampaignCompaniesView';
import { useCampaignCompanies } from '@/components/campaigns/companies/useCampaignCompanies';

export default function CampaignCompaniesPage() {
  const { campaign, loading: campaignLoading } = useCampaignDetail();

  const companiesState = useCampaignCompanies({
    slug: campaign?.slug ?? '',
    enabled: !campaignLoading && !!campaign,
  });

  return <CampaignCompaniesView {...companiesState} />;
}
