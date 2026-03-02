'use client';

import { Building2 } from 'lucide-react';
import { CompanyRow, CompanyRowSkeleton } from '@/components/campaigns/CompanyRow';
import { Separator } from '@/components/ui/separator';
import { CampaignCompaniesToolbar } from './CampaignCompaniesToolbar';
import type { CompanyRowData } from '@/lib/schemas';
import type { UseCampaignCompaniesReturn } from './useCampaignCompanies';

interface CampaignCompaniesViewProps extends UseCampaignCompaniesReturn {
  /** Campaign slug for export functionality. */
  campaignSlug: string;
  /** Currently selected company ID, or null. */
  selectedCompanyId?: number | null;
  /** Handler when a company row is clicked. */
  onCompanyClick?: (company: CompanyRowData) => void;
  /** Ref callback for keyboard navigation focus management. */
  getItemRef?: (key: string | number) => (el: HTMLElement | null) => void;
}

/** Renders the campaign companies list with toolbar, rows, and empty state. */
export function CampaignCompaniesView({
  companies,
  loading,
  error,
  searchQuery,
  setSearchQuery,
  filterDefinitions,
  activeFilters,
  setActiveFilters,
  sortOptions,
  activeSort,
  setActiveSort,
  campaignSlug,
  selectedCompanyId,
  onCompanyClick,
  getItemRef,
}: CampaignCompaniesViewProps) {
  return (
    <div className="flex flex-col gap-6">
      <CampaignCompaniesToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterDefinitions={filterDefinitions}
        activeFilters={activeFilters}
        onFiltersChange={setActiveFilters}
        sortOptions={sortOptions}
        activeSort={activeSort}
        onSortChange={setActiveSort}
        campaignSlug={campaignSlug}
      />

      {loading ? (
        <CompaniesListSkeleton />
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : companies.length === 0 ? (
        <CompaniesEmptyState hasFilters={activeFilters.length > 0 || searchQuery.length > 0} />
      ) : (
        <div className="flex flex-col">
          <TableHeader />
          <Separator />
          {companies.map((company) => (
            <div key={company.id}>
              <CompanyRow
                company={company}
                className="-mx-5"
                onClick={onCompanyClick}
                isActive={selectedCompanyId === company.id}
                ref={getItemRef?.(company.id)}
              />
              <Separator />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Column headers matching the CompanyRow right-side metrics layout. */
function TableHeader() {
  return (
    <div className="flex items-center -mx-5 gap-4 px-6 py-2 text-xs font-medium text-muted-foreground">
      {/* Spacer for status indicator */}
      <div className="w-5 shrink-0" />
      {/* Spacer for avatar */}
      <div className="w-8 shrink-0" />
      {/* Company name column */}
      <div className="flex-1 min-w-0">Company</div>
      {/* Right-side metric columns (hidden on mobile, matching CompanyRow) */}
      <div className="hidden md:flex items-center gap-7 shrink-0">
        <span className="w-18">Fit</span>
        <span className="w-30">Location</span>
        <span className="w-16">Size</span>
        <span className="w-20">Revenue</span>
        <span className="w-30">Partner</span>
      </div>
    </div>
  );
}

function CompaniesListSkeleton() {
  return (
    <div className="flex flex-col">
      <TableHeader />
      <Separator />
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i}>
          <CompanyRowSkeleton />
          <Separator />
        </div>
      ))}
    </div>
  );
}

function CompaniesEmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <Building2 className="size-10 text-muted-foreground/50" />
      <div>
        <p className="text-sm font-medium text-foreground">
          {hasFilters ? 'No matching companies' : 'No companies yet'}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {hasFilters
            ? 'Try adjusting your search or filters.'
            : 'Add companies to this campaign to get started.'}
        </p>
      </div>
    </div>
  );
}
