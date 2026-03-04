'use client';

import { ArrowLeft, Brain, Target, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CampaignFitCard } from '@/components/campaigns/companies/detail/CampaignFitCard';
import { CompanyInfoCard } from '@/components/campaigns/companies/detail/CompanyInfoCard';
import { AnalysisCard } from '@/components/campaigns/companies/detail/AnalysisCard';
import { useCompanyDetail } from './useCompanyDetail';
import { Loader2 } from 'lucide-react';

interface CompanyDetailColumnProps {
  domain: string;
  productId: number | null;
  onBack: () => void;
}

/** Scrollable column showing company fit, info, and analysis cards. */
export function CompanyDetailColumn({ domain, productId, onBack }: CompanyDetailColumnProps) {
  const { company, explainability, fitBreakdown, loading } = useCompanyDetail(domain, productId);

  const signalNarrative = explainability?.signal_narrative;
  const interestNarrative = explainability?.interest_narrative;
  const eventNarrative = explainability?.event_narrative;
  const signals = explainability?.signals_summary;

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-3">
      <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2 mb-2">
        <ArrowLeft className="size-4 mr-1" />
        Back to filters
      </Button>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <CampaignFitCard
            fitBreakdown={fitBreakdown}
            fitsSummary={explainability?.fits_summary ?? []}
            loading={false}
          />

          {company && <CompanyInfoCard company={company} />}

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
        </>
      )}
    </div>
  );
}
