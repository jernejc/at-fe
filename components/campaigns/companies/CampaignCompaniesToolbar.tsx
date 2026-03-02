'use client';

import { Search, Download, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Filter } from '@/components/ui/filter';
import { Sort } from '@/components/ui/sort';
import { Button } from '@/components/ui/button';
import { useCampaignExport } from '@/hooks/useCampaignExport';
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
  campaignSlug: string;
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
  campaignSlug,
}: CampaignCompaniesToolbarProps) {
  const { isExporting, handleExport } = useCampaignExport({ slug: campaignSlug });

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

      <Button
        variant="secondary"
        size="sm"
        onClick={handleExport}
        disabled={isExporting}
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 animate-spin" data-icon="inline-start" />
        ) : (
          <Download className="w-4 h-4" data-icon="inline-start" />
        )}
        Export
      </Button>
    </div>
  );
}
