'use client';

import { Brain, Target, Calendar } from 'lucide-react';
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
    fitBreakdown,
    playbook,
    loading,
    fitLoading,
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
  const signals = explainability?.signals_summary;

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
            fitBreakdown={fitBreakdown}
            fitsSummary={explainability?.fits_summary ?? []}
            targetProductId={targetProductId}
            loading={fitLoading}
          />

          <ContactsCard
            contacts={playbook?.contacts ?? []}
            loading={playbookLoading}
          />

          {companyData && <CompanyInfoCard company={companyData} />}

          {signalNarrative && (
            <AnalysisCard
              title="Signal Analysis"
              icon={Brain}
              narrative={signalNarrative}
              interests={signals?.interests}
              events={signals?.events}
              accentColor="violet"
            />
          )}

          {interestNarrative && (
            <AnalysisCard
              title="Interest Analysis"
              icon={Target}
              narrative={interestNarrative}
              interests={signals?.interests}
              accentColor="amber"
            />
          )}

          {eventNarrative && (
            <AnalysisCard
              title="Event Analysis"
              icon={Calendar}
              narrative={eventNarrative}
              events={signals?.events}
              accentColor="blue"
            />
          )}
        </div>
      )}
    </div>
  );
}
