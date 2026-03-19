'use client';

import { Pencil } from 'lucide-react';
import { SearchField } from '@/components/ui/search-field';
import { Sort } from '@/components/ui/sort';
import { Button } from '@/components/ui/button';
import type { SortOptionDefinition, SortState } from '@/lib/schemas/filter';

interface CampaignPartnersToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortOptions: SortOptionDefinition[];
  activeSort: SortState | null;
  onSortChange: (sort: SortState | null) => void;
  /** Whether edit mode is active. */
  isEditing?: boolean;
  onEditClick?: () => void;
  onSaveClick?: () => void;
  onCancelClick?: () => void;
  isSaving?: boolean;
  hasChanges?: boolean;
}

/** Toolbar with search, sort, and edit mode controls for the campaign partners list. */
export function CampaignPartnersToolbar({
  searchQuery,
  onSearchChange,
  sortOptions,
  activeSort,
  onSortChange,
  isEditing,
  onEditClick,
  onSaveClick,
  onCancelClick,
  isSaving,
  hasChanges,
}: CampaignPartnersToolbarProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchField
        className="w-64"
        placeholder="Search partners…"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      {!isEditing && (
        <Sort
          options={sortOptions}
          value={activeSort}
          onValueChange={onSortChange}
        />
      )}

      <div className="ml-auto flex items-center gap-2">
        {isEditing ? (
          <>
            <Button variant="ghost" onClick={onCancelClick} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={onSaveClick} disabled={isSaving || !hasChanges} variant="secondary">
              {isSaving ? 'Saving…' : 'Save changes'}
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" onClick={onEditClick}>
            <Pencil className="size-3.5 mr-1.5" data-icon="inline-start" />
            Edit
          </Button>
        )}
      </div>
    </div>
  );
}
