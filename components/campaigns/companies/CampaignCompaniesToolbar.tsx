'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Filter } from '@/components/ui/filter';
import { Sort } from '@/components/ui/sort';
import type { FilterDefinition, ActiveFilter, SortOptionDefinition, SortState } from '@/lib/schemas/filter';

interface CampaignCompaniesToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterDefinitions: FilterDefinition[];
  activeFilters: ActiveFilter[];
  onFiltersChange: (filters: ActiveFilter[]) => void;
  sortOptions: SortOptionDefinition[];
  activeSort: SortState | null;
  onSortChange: (sort: SortState | null) => void;
  totalCount: number;
  visibleCount: number;
}

/** Toolbar with search, filter, and sort controls for the companies list. */
export function CampaignCompaniesToolbar({
  searchQuery,
  onSearchChange,
  filterDefinitions,
  activeFilters,
  onFiltersChange,
  sortOptions,
  activeSort,
  onSortChange,
  totalCount,
  visibleCount,
}: CampaignCompaniesToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search companies…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>

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

      <span className="text-sm text-muted-foreground whitespace-nowrap shrink-0">
        {visibleCount !== totalCount
          ? `${visibleCount} of ${totalCount} companies`
          : `${totalCount} companies`}
      </span>
    </div>
  );
}
