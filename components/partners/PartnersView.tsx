'use client';

import { Building2, Users } from 'lucide-react';
import { PartnerRow, PartnerRowSkeleton, type PartnerRowData } from '@/components/campaigns/partners/PartnerRow';
import { Separator } from '@/components/ui/separator';
import { formatCompactNumber } from '@/lib/utils';
import { PartnersToolbar } from './PartnersToolbar';
import type { UsePartnersReturn } from './usePartners';

interface PartnersViewProps extends UsePartnersReturn {
  /** Currently selected partner ID, or null. */
  selectedPartnerId?: number | null;
  /** Handler when a partner row is clicked. */
  onPartnerClick?: (partner: PartnerRowData) => void;
  /** Ref callback for keyboard navigation focus management. */
  getItemRef?: (key: string | number) => (el: HTMLElement | null) => void;
}

/** Renders the global partners list with toolbar, rows, and empty state. */
export function PartnersView({
  partners,
  loading,
  error,
  searchQuery,
  setSearchQuery,
  sortOptions,
  activeSort,
  setActiveSort,
  filterDefinitions,
  activeFilters,
  setActiveFilters,
  selectedPartnerId,
  onPartnerClick,
  getItemRef,
}: PartnersViewProps) {
  return (
    <div className="flex flex-col gap-6">
      <PartnersToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortOptions={sortOptions}
        activeSort={activeSort}
        onSortChange={setActiveSort}
        filterDefinitions={filterDefinitions}
        activeFilters={activeFilters}
        onFiltersChange={setActiveFilters}
      />

      {loading ? (
        <PartnersListSkeleton />
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : partners.length === 0 ? (
        <PartnersEmptyState hasSearch={searchQuery.length > 0 || activeFilters.length > 0} />
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
                rightContent={<PartnerRightContent partner={partner} />}
              />
              <Separator />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Right-side content for each partner row on the global partners page. */
function PartnerRightContent({ partner }: { partner: PartnerRowData }) {
  return (
    <div className="hidden md:flex items-center gap-7 shrink-0">
      <span className="w-20 text-sm capitalize">{partner.status}</span>
      <span className="flex items-center gap-2 text-sm w-22">
        <Users className="w-3.5 h-3.5 shrink-0" />
        <span className="tabular-nums">
          {formatCompactNumber(partner.capacity ?? 0)}
        </span>
      </span>
      <span className="w-24 truncate text-sm capitalize">{partner.type || '—'}</span>
    </div>
  );
}

/** Column headers for the partners list. */
function TableHeader() {
  return (
    <div className="flex items-center -mx-5 gap-4 px-6 py-2 text-xs font-medium text-muted-foreground">
      <div className="w-8 shrink-0" />
      <div className="flex-1 min-w-0">Partner</div>
      <div className="hidden md:flex items-center gap-7 shrink-0">
        <span className="w-20">Status</span>
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
            ? 'Search filters the current page. Try browsing other pages or adjusting your filters.'
            : 'Partners will appear here once created.'}
        </p>
      </div>
    </div>
  );
}
