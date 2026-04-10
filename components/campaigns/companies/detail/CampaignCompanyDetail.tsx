'use client';

import { useCampaignCompanyDetail } from './useCampaignCompanyDetail';
import type { CachedCompanyDetail } from './useCampaignCompanyDetail';
import { CampaignCompanyDetailSkeleton } from './CampaignCompanyDetailSkeleton';
import { AssignmentCard } from './AssignmentCard';
import { CampaignFitCard } from './CampaignFitCard';
import { ContactsCard } from './ContactsCard';
import { CompanyInfoCard } from './CompanyInfoCard';
import { AnalysisCard } from './AnalysisCard';
import type { CompanyRowData, PartnerAssignmentSummary } from '@/lib/schemas';

interface CampaignCompanyDetailProps {
  company: CompanyRowData;
  slug: string;
  targetProductId: number | null;
  partners: PartnerAssignmentSummary[];
  onReassigned: (newPartnerId: number) => void;
  cache?: React.RefObject<Map<string, CachedCompanyDetail>>;
}

/** Campaign company detail sidebar content with expandable cards. */
export function CampaignCompanyDetail({
  company,
  slug,
  targetProductId,
  partners,
  onReassigned,
  cache,
}: CampaignCompanyDetailProps) {
  const {
    company: companyData,
    explainability,
    playbook,
    loading,
    playbookLoading,
    reassigning,
    reassignToPartner,
  } = useCampaignCompanyDetail({
    domain: company.domain,
    companyId: company.company_id ?? company.id,
    partnerId: company.partner_id ?? null,
    slug,
    targetProductId,
    onReassigned,
    cache,
  });

  const signalNarrative = explainability?.signal_narrative;
  const interestNarrative = explainability?.interest_narrative;
  const eventNarrative = explainability?.event_narrative;

  return (
    <div>
      {loading ? (
        <CampaignCompanyDetailSkeleton />
      ) : (
        <div className="space-y-3">
          <AssignmentCard
            partnerName={company.partner_name}
            partnerLogoUrl={company.partner_logo_url}
            status={company.status}
            partners={partners.filter((p) => p.partner_id !== company.partner_id)}
            reassigning={reassigning}
            onReassign={reassignToPartner}
          />

          <CampaignFitCard
            fitsSummary={explainability?.fits_summary ?? []}
            targetProductId={targetProductId}
            domain={company.domain}
            loading={loading}
          />

          <ContactsCard
            contacts={playbook?.contacts ?? []}
            loading={playbookLoading}
          />

          {companyData && <CompanyInfoCard company={companyData} />}

          {signalNarrative && (
            <AnalysisCard
              signalNarrative={signalNarrative}
              interestNarrative={interestNarrative}
              eventNarrative={eventNarrative}
            />
          )}
        </div>
      )}
    </div>
  );
}
