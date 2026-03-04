'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { WSCompanyResult, WSSearchInsights } from '@/lib/schemas';
import type { ResultsTab } from '../useNewCampaignFlow.types';
import type { useResultsFilters } from '../hooks/useResultsFilters';
import { FiltersColumn } from './FiltersColumn';
import { CompanyListColumn } from './CompanyListColumn';
import { CompanyDetailColumn } from '../company-detail/CompanyDetailColumn';
import { MobileTabSelector } from './MobileTabSelector';

interface ResultsCardProps {
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

/** Full-screen card with two-column layout: filters/detail (left) + company list (right). */
export function ResultsCard({
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
}: ResultsCardProps) {
  const [mobileTab, setMobileTab] = useState<ResultsTab>('metrics');

  const handleSelectCompany = (domain: string) => {
    onSelectCompany(domain);
    setMobileTab('metrics');
  };

  return (
    <div className="h-full rounded-2xl border border-border bg-card overflow-hidden flex flex-col">
      {/* Mobile tab selector */}
      <MobileTabSelector activeTab={mobileTab} onTabChange={setMobileTab} />

      {/* Two-column layout */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[2fr_1fr]">
        {/* Left column: filters or company detail */}
        <div
          className={cn(
            'min-h-0 overflow-y-auto border-r border-border',
            mobileTab !== 'metrics' && 'hidden lg:block',
          )}
        >
          {selectedCompanyDomain ? (
            <CompanyDetailColumn
              domain={selectedCompanyDomain}
              productId={productId}
              onBack={() => handleSelectCompany(selectedCompanyDomain)}
            />
          ) : (
            <FiltersColumn
              totalCompanies={totalCompanies}
              filteredCount={companies.length}
              filters={resultsFilters}
              insights={insights}
              suggestedQueries={suggestedQueries}
              onSuggestedQueryClick={onSuggestedQueryClick}
              isSearching={isSearching}
            />
          )}
        </div>

        {/* Right column: company list */}
        <div
          className={cn(
            'min-h-0 overflow-y-auto',
            mobileTab !== 'companies' && 'hidden lg:block',
          )}
        >
          <CompanyListColumn
            companies={companies}
            selectedDomain={selectedCompanyDomain}
            onSelect={handleSelectCompany}
            isSearching={isSearching}
          />
        </div>
      </div>
    </div>
  );
}
