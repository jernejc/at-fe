'use client';

import { useState, useCallback } from 'react';
import { useCampaignDetail } from '@/components/providers/CampaignDetailProvider';
import { CampaignCompaniesView } from '@/components/campaigns/companies/CampaignCompaniesView';
import { useCampaignCompanies } from '@/components/campaigns/companies/useCampaignCompanies';
import { CampaignCompanyDetail } from '@/components/campaigns/companies/detail/CampaignCompanyDetail';
import { DetailSidePanel } from '@/components/ui/detail-side-panel/DetailSidePanel';
import { useListKeyboardNav } from '@/hooks/useListKeyboardNav';
import type { CompanyRowData } from '@/lib/schemas';

export default function CampaignCompaniesPage() {
  const { campaign, loading: campaignLoading } = useCampaignDetail();

  const companiesState = useCampaignCompanies({
    slug: campaign?.slug ?? '',
    enabled: !campaignLoading && !!campaign,
  });

  const [selectedCompany, setSelectedCompany] = useState<CompanyRowData | null>(null);

  const handleCompanyClick = useCallback((company: CompanyRowData) => {
    setSelectedCompany((prev) => (prev?.id === company.id ? null : company));
  }, []);

  const handleClose = useCallback(() => setSelectedCompany(null), []);

  const { refetch, partners } = companiesState;

  const handleReassigned = useCallback(() => {
    refetch();
  }, [refetch]);

  const { getItemRef } = useListKeyboardNav({
    items: companiesState.companies,
    selectedItem: selectedCompany,
    getKey: (c) => c.id,
    onSelect: setSelectedCompany,
    enabled: !!selectedCompany,
  });

  return (
    <DetailSidePanel
      open={!!selectedCompany}
      onClose={handleClose}
      detail={
        selectedCompany ? (
          <CampaignCompanyDetail
            company={selectedCompany}
            slug={campaign?.slug ?? ''}
            targetProductId={campaign?.target_product_id ?? null}
            partners={partners}
            onReassigned={handleReassigned}
          />
        ) : null
      }
    >
      <CampaignCompaniesView
        {...companiesState}
        selectedCompanyId={selectedCompany?.id ?? null}
        onCompanyClick={handleCompanyClick}
        getItemRef={getItemRef}
      />
    </DetailSidePanel>
  );
}
