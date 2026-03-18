'use client';

import { X, Plus, FolderPlus } from 'lucide-react';
import { SearchField } from '@/components/ui/search-field';
import { Filter } from '@/components/ui/filter';
import { Sort } from '@/components/ui/sort';
import { Button } from '@/components/ui/button';
import type { FilterDefinition, ActiveFilter, SortOptionDefinition, SortState } from '@/lib/schemas/filter';

interface DiscoveryToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterDefinitions: FilterDefinition[];
  activeFilters: ActiveFilter[];
  onFiltersChange: (filters: ActiveFilter[]) => void;
  sortOptions: SortOptionDefinition[];
  activeSort: SortState | null;
  onSortChange: (sort: SortState | null) => void;
  /** Whether bulk-edit mode is active. */
  isEditing: boolean;
  /** Number of currently selected companies. */
  selectedCount: number;
  /** Enter edit mode. */
  onStartEditing: () => void;
  /** Cancel edit mode. */
  onCancelEditing: () => void;
  /** Create a new campaign with selected companies. */
  onNewCampaign: () => void;
  /** Add selected companies to an existing campaign. */
  onAddToExisting: () => void;
}

/** Toolbar with search, filter, sort, and bulk-edit controls for the discovery list. */
export function DiscoveryToolbar({
  searchQuery,
  onSearchChange,
  filterDefinitions,
  activeFilters,
  onFiltersChange,
  sortOptions,
  activeSort,
  onSortChange,
  isEditing,
  selectedCount,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- used when edit button is re-enabled
  onStartEditing,
  onCancelEditing,
  onNewCampaign,
  onAddToExisting,
}: DiscoveryToolbarProps) {
  if (isEditing) {
    return (
      <EditToolbar
        selectedCount={selectedCount}
        onCancel={onCancelEditing}
        onNewCampaign={onNewCampaign}
        onAddToExisting={onAddToExisting}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

      {/* <div className="flex items-center gap-2 shrink-0">
        <Button variant="outline" onClick={onStartEditing}>
          <Pencil className="w-4 h-4" data-icon="inline-start" />
          Edit
        </Button>
      </div> */}
    </div>
  );
}

interface EditToolbarProps {
  selectedCount: number;
  onCancel: () => void;
  onNewCampaign: () => void;
  onAddToExisting: () => void;
}

/** Toolbar shown during bulk-edit mode with campaign actions. */
function EditToolbar({ selectedCount, onCancel, onNewCampaign, onAddToExisting }: EditToolbarProps) {
  const hasSelection = selectedCount > 0;

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">
        {selectedCount} selected
      </span>

      <div className="flex items-center gap-2">
        <Button
          variant="default"
          onClick={onNewCampaign}
          disabled={!hasSelection}
        >
          <Plus className="w-4 h-4" data-icon="inline-start" />
          New Campaign
        </Button>

        <Button
          variant="outline"
          onClick={onAddToExisting}
          disabled={!hasSelection}
        >
          <FolderPlus className="w-4 h-4" data-icon="inline-start" />
          Add to Existing
        </Button>

        <Button variant="ghost" onClick={onCancel}>
          <X className="w-4 h-4" data-icon="inline-start" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
