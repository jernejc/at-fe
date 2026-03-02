'use client';

import { Search, Download, Loader2, Pencil, X, Trash2, ChevronDown, CircleOff } from 'lucide-react';
import { Menu } from '@base-ui/react/menu';
import { Input } from '@/components/ui/input';
import { Filter } from '@/components/ui/filter';
import { Sort } from '@/components/ui/sort';
import { Button, buttonVariants } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useCampaignExport } from '@/hooks/useCampaignExport';
import { cn } from '@/lib/utils';
import type { FilterDefinition, ActiveFilter, SortOptionDefinition, SortState } from '@/lib/schemas/filter';
import type { PartnerAssignmentSummary } from '@/lib/schemas';

const popupStyles =
  'bg-popover text-popover-foreground ring-foreground/10 min-w-48 rounded-lg shadow-md ring-1 p-1 origin-(--transform-origin) data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 duration-100';

const itemStyles =
  'flex items-center gap-2 rounded-md py-1.5 px-2 text-sm cursor-default outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground';

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
  /** Whether bulk-edit mode is active. */
  isEditing: boolean;
  /** Number of currently selected companies. */
  selectedCount: number;
  /** Enter edit mode. */
  onStartEditing: () => void;
  /** Cancel edit mode. */
  onCancelEditing: () => void;
  /** Remove selected companies. */
  onRemove: () => void;
  /** Reassign selected companies to a partner (0 = unassign). */
  onReassign: (partnerId: number) => void;
  /** Whether a remove operation is in progress. */
  isRemoving: boolean;
  /** Whether a reassign operation is in progress. */
  isReassigning: boolean;
  /** Campaign partners for the reassign dropdown. */
  partners: PartnerAssignmentSummary[];
}

/** Toolbar with search, filter, sort, export, and bulk-edit controls. */
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
  isEditing,
  selectedCount,
  onStartEditing,
  onCancelEditing,
  onRemove,
  onReassign,
  isRemoving,
  isReassigning,
  partners,
}: CampaignCompaniesToolbarProps) {
  const { isExporting, handleExport } = useCampaignExport({ slug: campaignSlug });

  if (isEditing) {
    return <EditToolbar
      selectedCount={selectedCount}
      onCancel={onCancelEditing}
      onRemove={onRemove}
      onReassign={onReassign}
      isRemoving={isRemoving}
      isReassigning={isReassigning}
      partners={partners}
    />;
  }

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

      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          onClick={onStartEditing}
        >
          <Pencil className="w-4 h-4" data-icon="inline-start" />
          Edit
        </Button>

        <Button
          variant="secondary"
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
    </div>
  );
}

interface EditToolbarProps {
  selectedCount: number;
  onCancel: () => void;
  onRemove: () => void;
  onReassign: (partnerId: number) => void;
  isRemoving: boolean;
  isReassigning: boolean;
  partners: PartnerAssignmentSummary[];
}

/** Toolbar shown during bulk-edit mode with cancel, remove, and reassign actions. */
function EditToolbar({
  selectedCount,
  onCancel,
  onRemove,
  onReassign,
  isRemoving,
  isReassigning,
  partners,
}: EditToolbarProps) {
  const hasSelection = selectedCount > 0;
  const isBusy = isRemoving || isReassigning;

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">
        {selectedCount} selected
      </span>

      <div className="flex items-center gap-2">
        <Button
          variant="destructive"
          onClick={onRemove}
          disabled={!hasSelection || isBusy}
        >
          {isRemoving ? (
            <Loader2 className="w-4 h-4 animate-spin" data-icon="inline-start" />
          ) : (
            <Trash2 className="w-4 h-4" data-icon="inline-start" />
          )}
          Remove
        </Button>

        <Menu.Root modal={false}>
          <Menu.Trigger
            disabled={!hasSelection || isBusy}
            className={cn(buttonVariants({ variant: 'outline' }), 'gap-1.5')}
          >
            {isReassigning ? (
              <Loader2 className="w-4 h-4 animate-spin" data-icon="inline-start" />
            ) : null}
            Reassign
            <ChevronDown className="size-3.5 text-muted-foreground" data-icon="inline-end" />
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner side="bottom" align="end" sideOffset={4} className="isolate z-50">
              <Menu.Popup className={popupStyles}>
                <Menu.Item
                  className={itemStyles}
                  onClick={() => onReassign(0)}
                >
                  <CircleOff className="size-4 text-muted-foreground" />
                  <span>Unassigned</span>
                </Menu.Item>
                {partners.map((p) => (
                  <Menu.Item
                    key={p.partner_id}
                    className={itemStyles}
                    onClick={() => onReassign(p.partner_id)}
                  >
                    <Avatar className="size-6">
                      {p.partner_logo_url && (
                        <AvatarImage src={p.partner_logo_url} alt={p.partner_name} />
                      )}
                      <AvatarFallback className="text-[10px]">
                        {p.partner_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">{p.partner_name}</span>
                  </Menu.Item>
                ))}
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>

        <Button variant="ghost" onClick={onCancel} disabled={isBusy}>
          <X className="w-4 h-4" data-icon="inline-start" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
