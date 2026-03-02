'use client';

import { useCampaignPartnerDetail } from './useCampaignPartnerDetail';
import { PartnerInfoCard } from './PartnerInfoCard';
import { PartnerCompaniesCard } from './PartnerCompaniesCard';
import type { PartnerRowData } from '../PartnerRow';
import type { PartnerAssignmentSummary } from '@/lib/schemas';

interface CampaignPartnerDetailProps {
  partner: PartnerRowData;
  slug: string;
  allPartners: PartnerAssignmentSummary[];
  onReassigned: () => void;
}

/** Campaign partner detail sidebar content with partner info and assigned companies. */
export function CampaignPartnerDetail({
  partner,
  slug,
  allPartners,
  onReassigned,
}: CampaignPartnerDetailProps) {
  const {
    companies,
    loading,
    reassigning,
    reassignCompanies,
  } = useCampaignPartnerDetail({
    slug,
    partnerId: partner.partnerId,
    isOpen: true,
  });

  const handleReassign = async (companyIds: number[], newPartnerId: number) => {
    await reassignCompanies(companyIds, newPartnerId);
    onReassigned();
  };

  return (
    <div className="space-y-3">
      <PartnerInfoCard partner={partner} />

      <PartnerCompaniesCard
        companies={companies}
        loading={loading}
        currentPartnerId={partner.partnerId}
        allPartners={allPartners}
        reassigning={reassigning}
        onReassign={handleReassign}
      />
    </div>
  );
}
