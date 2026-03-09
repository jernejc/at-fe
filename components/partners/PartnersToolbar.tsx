'use client';

import { SearchField } from '@/components/ui/search-field';
import { Sort } from '@/components/ui/sort';
import { Filter } from '@/components/ui/filter';
import type { SortOptionDefinition, SortState, FilterDefinition, ActiveFilter } from '@/lib/schemas/filter';

interface PartnersToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortOptions: SortOptionDefinition[];
  activeSort: SortState | null;
  onSortChange: (sort: SortState | null) => void;
  filterDefinitions: FilterDefinition[];
  activeFilters: ActiveFilter[];
  onFiltersChange: (filters: ActiveFilter[]) => void;
}

/** Toolbar with search, sort, and filters for the partners list. */
export function PartnersToolbar({
  searchQuery,
  onSearchChange,
  sortOptions,
  activeSort,
  onSortChange,
  filterDefinitions,
  activeFilters,
  onFiltersChange,
}: PartnersToolbarProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchField
        className="w-64"
        placeholder="Search partners…"
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
