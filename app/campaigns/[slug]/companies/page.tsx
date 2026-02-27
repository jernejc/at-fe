'use client';

import { useState, useCallback } from 'react';
import { useCampaignDetail } from '@/components/providers/CampaignDetailProvider';
import { CampaignCompaniesView } from '@/components/campaigns/companies/CampaignCompaniesView';
import { useCampaignCompanies } from '@/components/campaigns/companies/useCampaignCompanies';
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
      detail={<CompanyDetailPlaceholder company={selectedCompany} />}
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

/** Placeholder for the right panel content. */
function CompanyDetailPlaceholder({ company }: { company: CompanyRowData | null }) {
  if (!company) return null;
  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-foreground">{company.name}</h2>
      <p className="text-sm text-muted-foreground mt-1">{company.domain}</p>
    </div>
  );
}
