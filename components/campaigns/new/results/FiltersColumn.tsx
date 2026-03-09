'use client';

import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RangeFilter } from '@/components/ui/range-filter';
import { IndustryFilterCard } from './IndustryFilterCard';
import { CompanyMapWrapper } from './CompanyMapWrapper';
import { useCompanyMapData } from '../hooks/useCompanyMapData';
import { useTheme } from '@/components/providers/ThemeProvider';
import type { WSCompanyResult, WSSearchInsights } from '@/lib/schemas';
import type { useResultsFilters } from '../hooks/useResultsFilters';

/** Formats a raw revenue number into a compact dollar string (e.g. 13500000 → "$13.5M"). */
function formatRevenue(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

interface FiltersColumnProps {
  totalCompanies: number;
  filteredCount: number;
  filters: ReturnType<typeof useResultsFilters>;
  insights: WSSearchInsights | null;
  suggestedQueries: string[];
  onSuggestedQueryClick: (query: string) => void;
  isSearching: boolean;
  companies: WSCompanyResult[];
}

/** Skeleton placeholder matching the filters layout. */
function FiltersColumnSkeleton() {
  return (
    <div className="p-6">
      <Skeleton className="h-4 w-24 mb-4" />

      <div className="mb-4 flex flex-wrap gap-2">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-32 rounded-full" />
        <Skeleton className="h-6 w-28 rounded-full" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>

      <Skeleton className="h-[220px] w-full rounded-xl mb-6" />

      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-4" />
    </div>
  );
}

/** Left column showing insights, suggested queries, map, range filters, and industry filter. */
export function FiltersColumn({
  totalCompanies,
  filteredCount,
  filters,
  insights,
  suggestedQueries,
  onSuggestedQueryClick,
  isSearching,
  companies,
}: FiltersColumnProps) {
  const markers = useCompanyMapData(companies);
  const { theme } = useTheme();
  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      document.documentElement.classList.contains('dark'));

  if (isSearching) {
    return <FiltersColumnSkeleton />;
  }

  return (
    <div className="p-6">
      {/* Suggested queries */}
      {suggestedQueries.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-foreground mb-4">Suggested queries</h2>

          <div className="mb-4 flex flex-wrap gap-2">
            {suggestedQueries.map((query) => (
              <Badge
                key={query}
                variant="grey"
                className="cursor-pointer hover:bg-muted transition-colors"
                onClick={() => onSuggestedQueryClick(query)}
              >
                <Search className="size-3 mr-1" />
                {query}
              </Badge>
            ))}
          </div>
        </>
      )}

      <h2 className="text-sm font-semibold text-foreground mb-4">
        {filteredCount} matches
        {filteredCount !== totalCompanies && (
          <span className="text-sm font-normal text-muted-foreground ml-1">
            of {totalCompanies}
          </span>
        )}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <RangeFilter
          title="Avg. product fit"
          values={filters.fitValues}
          min={0}
          max={100}
          range={filters.fitRange}
          onChange={filters.onFitRangeChange}
          className="bg-background"
        />

        <RangeFilter
          title="Avg. revenue"
          values={filters.revenueValues}
          range={filters.revenueRange}
          onChange={filters.onRevenueRangeChange}
          formatAvg={formatRevenue}
          className="bg-background"
        />

        <RangeFilter
          title="Avg. employee count"
          values={filters.employeeValues}
          range={filters.employeeRange}
          onChange={filters.onEmployeeRangeChange}
          className="bg-background"
        />

        <IndustryFilterCard
          industries={filters.allIndustries}
          selected={filters.selectedIndustries}
          onToggle={filters.onIndustryToggle}
        />
      </div>

      {/* Company location map */}
      {markers.length > 0 && (
        <div className="rounded-xl bg-background overflow-hidden mt-6 h-[220px]">
          <CompanyMapWrapper markers={markers} isDark={isDark} />
        </div>
      )}

      {/* Insights */}
      {insights && (insights.observation || insights.insight) && (
        <div className="mt-6 text-sm text-muted-foreground">
          <h2 className="text-sm font-semibold text-foreground mb-4">Insights</h2>
          {insights.observation && <p>{insights.observation}</p>}
          {insights.insight && <p className="mt-1">{insights.insight}</p>}
        </div>
      )}
    </div>
  );
}
