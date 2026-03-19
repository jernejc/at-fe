'use client';

import { Building2 } from 'lucide-react';
import { PartnerRow, PartnerRowSkeleton, type PartnerRowData } from './PartnerRow';
import { Separator } from '@/components/ui/separator';
import { CampaignPartnersToolbar } from './CampaignPartnersToolbar';
import { EditPartnersList } from './EditPartnersList';
import type { UseCampaignPartnersReturn } from './useCampaignPartners';
import type { UseEditCampaignPartnersReturn } from './useEditCampaignPartners';

type EditProps = Pick<
  UseEditCampaignPartnersReturn,
  | 'isEditing'
  | 'enterEditMode'
  | 'cancelEditMode'
  | 'saveChanges'
  | 'isSaving'
  | 'hasChanges'
  | 'filteredPartners'
  | 'selectedSlugs'
  | 'disabledSlugs'
  | 'togglePartner'
  | 'loadingPartners'
  | 'hasMore'
  | 'loadingMore'
  | 'loadMore'
  | 'editSearchQuery'
  | 'setEditSearchQuery'
>;

interface CampaignPartnersViewProps extends UseCampaignPartnersReturn, EditProps {
  /** Currently selected partner ID, or null. */
  selectedPartnerId?: number | null;
  /** Handler when a partner row is clicked. */
  onPartnerClick?: (partner: PartnerRowData) => void;
  /** Ref callback for keyboard navigation focus management. */
  getItemRef?: (key: string | number) => (el: HTMLElement | null) => void;
}

/** Renders the campaign partners list with toolbar, rows, and empty state. */
export function CampaignPartnersView({
  partners,
  loading,
  error,
  searchQuery,
  setSearchQuery,
  sortOptions,
  activeSort,
  setActiveSort,
  selectedPartnerId,
  onPartnerClick,
  getItemRef,
  // Edit mode props
  isEditing,
  enterEditMode,
  cancelEditMode,
  saveChanges,
  isSaving,
  hasChanges,
  filteredPartners,
  selectedSlugs,
  disabledSlugs,
  togglePartner,
  loadingPartners,
  hasMore,
  loadingMore,
  loadMore,
  editSearchQuery,
  setEditSearchQuery,
}: CampaignPartnersViewProps) {
  return (
    <div className="flex flex-col gap-6">
      <CampaignPartnersToolbar
        searchQuery={isEditing ? editSearchQuery : searchQuery}
        onSearchChange={isEditing ? setEditSearchQuery : setSearchQuery}
        sortOptions={sortOptions}
        activeSort={activeSort}
        onSortChange={setActiveSort}
        isEditing={isEditing}
        onEditClick={enterEditMode}
        onSaveClick={saveChanges}
        onCancelClick={cancelEditMode}
        isSaving={isSaving}
        hasChanges={hasChanges}
      />

      {isEditing ? (
        <EditPartnersList
          partners={filteredPartners}
          selectedSlugs={selectedSlugs}
          disabledSlugs={disabledSlugs}
          onToggle={togglePartner}
          loading={loadingPartners}
          hasMore={hasMore}
          loadingMore={loadingMore}
          onLoadMore={loadMore}
          searchQuery={editSearchQuery}
        />
      ) : loading ? (
        <PartnersListSkeleton />
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : partners.length === 0 ? (
        <PartnersEmptyState hasSearch={searchQuery.length > 0} />
      ) : (
        <div className="flex flex-col">
          <TableHeader />
          <Separator />
          {partners.map((partner) => (
            <div key={partner.id}>
              <PartnerRow
                partner={partner}
                className="-mx-5"
                onClick={onPartnerClick}
                isActive={selectedPartnerId === partner.id}
                ref={getItemRef?.(partner.id)}
              />
              <Separator />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Column headers matching the PartnerRow metrics layout. */
function TableHeader() {
  return (
    <div className="flex items-center -mx-5 gap-4 px-6 py-2 text-xs font-medium text-muted-foreground">
      {/* Spacer for avatar */}
      <div className="w-8 shrink-0" />
      {/* Partner name column */}
      <div className="flex-1 min-w-0">Partner</div>
      {/* Right-side metric columns (hidden on mobile) */}
      <div className="hidden md:flex items-center gap-7 shrink-0">
        <span className="w-24">Progress</span>
        <span className="w-22">Capacity</span>
        <span className="w-24">Type</span>
      </div>
    </div>
  );
}

function PartnersListSkeleton() {
  return (
    <div className="flex flex-col">
      <TableHeader />
      <Separator />
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i}>
          <PartnerRowSkeleton />
          <Separator />
        </div>
      ))}
    </div>
  );
}

function PartnersEmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <Building2 className="size-10 text-muted-foreground/50" />
      <div>
        <p className="text-sm font-medium text-foreground">
          {hasSearch ? 'No matching partners' : 'No partners yet'}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {hasSearch
            ? 'Try adjusting your search.'
            : 'Assign partners to this campaign to get started.'}
        </p>
      </div>
    </div>
  );
}
