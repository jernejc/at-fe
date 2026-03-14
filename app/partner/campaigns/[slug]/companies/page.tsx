'use client';

import { useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useCampaignDetail } from '@/components/providers/CampaignDetailProvider';
import { useCampaignCompanies } from '@/components/campaigns/companies/useCampaignCompanies';
import { PartnerCampaignCompaniesView } from '@/components/partner/campaigns/companies/PartnerCampaignCompaniesView';
import type { CompanyRowData } from '@/lib/schemas';

export default function PartnerCampaignCompaniesPage() {
  const router = useRouter();
  const { slug } = useParams<{ slug: string }>();
  const { campaign, partners, loading: campaignLoading } = useCampaignDetail();

  const companiesState = useCampaignCompanies({
    slug: campaign?.slug ?? '',
    enabled: !campaignLoading && !!campaign,
    partners,
    defaultSort: null,
  });

  const handleCompanyClick = useCallback(
    (company: CompanyRowData) => {
      router.push(`/partner/campaigns/${slug}/companies/${company.domain}`);
    },
    [router, slug],
  );

  return (
    <PartnerCampaignCompaniesView
      {...companiesState}
      campaignSlug={campaign?.slug ?? ''}
      onCompanyClick={handleCompanyClick}
    />
  );
}
