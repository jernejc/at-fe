'use client';

import type { WSCompanyResult, WSSearchInsights } from '@/lib/schemas';
import type { useResultsFilters } from '../hooks/useResultsFilters';
import { ResultsCard } from '../results/ResultsCard';

interface ResultsStepProps {
  companies: WSCompanyResult[];
  totalCompanies: number;
  selectedCompanyDomain: string | null;
  onSelectCompany: (domain: string) => void;
  productId: number | null;
  resultsFilters: ReturnType<typeof useResultsFilters>;
  insights: WSSearchInsights | null;
  suggestedQueries: string[];
  onSuggestedQueryClick: (query: string) => void;
  isSearching: boolean;
}

/** Results step showing a full-screen card with filters and company list. */
export function ResultsStep({
  companies,
  totalCompanies,
  selectedCompanyDomain,
  onSelectCompany,
  productId,
  resultsFilters,
  insights,
  suggestedQueries,
  onSuggestedQueryClick,
  isSearching,
}: ResultsStepProps) {
  return (
    <div className="flex-1 p-4 overflow-hidden">
      <ResultsCard
        companies={companies}
        totalCompanies={totalCompanies}
        selectedCompanyDomain={selectedCompanyDomain}
        onSelectCompany={onSelectCompany}
        productId={productId}
        resultsFilters={resultsFilters}
        insights={insights}
        suggestedQueries={suggestedQueries}
        onSuggestedQueryClick={onSuggestedQueryClick}
        isSearching={isSearching}
      />
    </div>
  );
}
