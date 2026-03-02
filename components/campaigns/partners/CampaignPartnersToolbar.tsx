'use client';

import { SearchField } from '@/components/ui/search-field';
import { Sort } from '@/components/ui/sort';
import type { SortOptionDefinition, SortState } from '@/lib/schemas/filter';

interface CampaignPartnersToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortOptions: SortOptionDefinition[];
  activeSort: SortState | null;
  onSortChange: (sort: SortState | null) => void;
}

/** Toolbar with search and sort for the campaign partners list. */
export function CampaignPartnersToolbar({
  searchQuery,
  onSearchChange,
  sortOptions,
  activeSort,
  onSortChange,
}: CampaignPartnersToolbarProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchField
        className="w-64"
        placeholder="Search partners…"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      <Sort
        options={sortOptions}
        value={activeSort}
        onValueChange={onSortChange}
      />
    </div>
  );
}
