'use client';

import { Building2 } from 'lucide-react';
import { CompanyRow, CompanyRowSkeleton } from '@/components/campaigns/CompanyRow';
import { SearchField } from '@/components/ui/search-field';
import { Filter } from '@/components/ui/filter';
import { Sort } from '@/components/ui/sort';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { EngagementIndicator } from '@/components/ui/engagement-indicator';
import { FitScoreIndicator } from '@/components/ui/fit-score-indicator';
import { normalizeScoreNullable } from '@/lib/utils';
import type { CompanyRowData } from '@/lib/schemas';
import type { UseCampaignCompaniesReturn } from '@/components/campaigns/companies/useCampaignCompanies';

interface PartnerCampaignCompaniesViewProps extends UseCampaignCompaniesReturn {
  /** Handler when a company row is clicked. */
  onCompanyClick?: (company: CompanyRowData) => void;
}

/** Read-only campaign companies list with partner-specific metrics. */
export function PartnerCampaignCompaniesView({
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
  onCompanyClick,
}: PartnerCampaignCompaniesViewProps) {
  return (
    <div className="flex flex-col gap-6">
      <Toolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterDefinitions={filterDefinitions}
        activeFilters={activeFilters}
        onFiltersChange={setActiveFilters}
        sortOptions={sortOptions}
        activeSort={activeSort}
        onSortChange={setActiveSort}
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
                renderMetrics={(c) => <PartnerMetrics company={c} />}
              />
              <Separator />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Custom metrics for each partner company row: outreach progress, leads engaged, fit score. */
function PartnerMetrics({ company }: { company: CompanyRowData }) {
  const fitScore = company.fit_score != null
    ? Math.round(normalizeScoreNullable(company.fit_score))
    : null;

  return (
    <>
      {/* Outreach Progress */}
      <div className="flex items-center gap-2 w-32">
        <Progress variant="striped" value={0} className="h-2 flex-1" />
        <span className="text-xs text-muted-foreground tabular-nums">0%</span>
      </div>

      {/* Leads Engaged */}
      <div className="w-20">
        <EngagementIndicator engaged={0} total={0} size={20} />
      </div>

      {/* Fit Score */}
      {fitScore != null ? (
        <FitScoreIndicator
          score={fitScore}
          change={company.fit_score_change ?? undefined}
          size={16}
          className="w-18"
        />
      ) : (
        <span className="w-18 text-sm text-muted-foreground">{'\u2013'}</span>
      )}
    </>
  );
}

/** Column headers matching the partner metrics layout. */
function TableHeader() {
  return (
    <div className="flex items-center -mx-5 gap-4 px-6 py-2 text-xs font-medium text-muted-foreground">
      {/* Spacer for avatar */}
      <div className="w-8 shrink-0" />
      {/* Company name column */}
      <div className="flex-1 min-w-0">Company</div>
      {/* Right-side metric columns (hidden on mobile) */}
      <div className="hidden md:flex items-center gap-7 shrink-0">
        <span className="w-32">Outreach</span>
        <span className="w-20">Engaged</span>
        <span className="w-18">Fit</span>
      </div>
    </div>
  );
}

/** Skeleton for the metrics area. */
const metricsSkeleton = (
  <>
    <div className="w-32 h-2 bg-muted rounded-full animate-pulse" />
    <div className="w-20 h-4 bg-muted rounded animate-pulse" />
    <div className="w-18 h-4 bg-muted rounded animate-pulse" />
  </>
);

function CompaniesListSkeleton() {
  return (
    <div className="flex flex-col">
      <TableHeader />
      <Separator />
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i}>
          <CompanyRowSkeleton renderMetricsSkeleton={metricsSkeleton} className='-mx-5' />
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
            : 'Companies will appear here once assigned to this campaign.'}
        </p>
      </div>
    </div>
  );
}

import type { FilterDefinition, ActiveFilter, SortOptionDefinition, SortState } from '@/lib/schemas/filter';

interface ToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterDefinitions: FilterDefinition[];
  activeFilters: ActiveFilter[];
  onFiltersChange: (filters: ActiveFilter[]) => void;
  sortOptions: SortOptionDefinition[];
  activeSort: SortState | null;
  onSortChange: (sort: SortState | null) => void;
}

/** Simplified toolbar — search, filter, sort only. No edit or export controls. */
function Toolbar({
  searchQuery,
  onSearchChange,
  filterDefinitions,
  activeFilters,
  onFiltersChange,
  sortOptions,
  activeSort,
  onSortChange,
}: ToolbarProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
      <SearchField
        className="w-64"
        placeholder="Search companies…"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      <Filter
        definitions={filterDefinitions}
        value={activeFilters}
        onValueChange={onFiltersChange}
      />

      <Sort
        options={sortOptions}
        value={activeSort}
        onValueChange={onSortChange}
      />
    </div>
  );
}
