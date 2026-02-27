'use client';

import { Brain, Target, Calendar } from 'lucide-react';
import { useCampaignCompanyDetail } from './useCampaignCompanyDetail';
import { CampaignCompanyDetailSkeleton } from './CampaignCompanyDetailSkeleton';
import { AssignmentCard } from './AssignmentCard';
import { CampaignFitCard } from './CampaignFitCard';
import { CompanyInfoCard } from './CompanyInfoCard';
import { AnalysisCard } from './AnalysisCard';
import type { CompanyRowData, PartnerAssignmentSummary } from '@/lib/schemas';

interface CampaignCompanyDetailProps {
  company: CompanyRowData;
  slug: string;
  targetProductId: number | null;
  partners: PartnerAssignmentSummary[];
  onReassigned: () => void;
}

/** Campaign company detail sidebar content with expandable cards. */
export function CampaignCompanyDetail({
  company,
  slug,
  targetProductId,
  partners,
  onReassigned,
}: CampaignCompanyDetailProps) {
  const {
    company: companyData,
    explainability,
    fitBreakdown,
    loading,
    fitLoading,
    reassigning,
    reassignToPartner,
  } = useCampaignCompanyDetail({
    domain: company.domain,
    companyId: company.id,
    partnerId: company.partner_id ?? null,
    slug,
    targetProductId,
    isOpen: true,
    onReassigned,
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
            partners={partners}
            reassigning={reassigning}
            onReassign={reassignToPartner}
          />

          <CampaignFitCard
            fitBreakdown={fitBreakdown}
            fitsSummary={explainability?.fits_summary ?? []}
            loading={fitLoading}
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
