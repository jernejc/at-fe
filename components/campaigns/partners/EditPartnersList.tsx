'use client';

import { Users } from 'lucide-react';
import { formatCompactNumber } from '@/lib/utils';
import { PartnerRow, PartnerRowSkeleton, type PartnerRowData } from './PartnerRow';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

interface EditPartnersListProps {
  partners: PartnerRowData[];
  selectedSlugs: Set<string>;
  /** Slugs of partners that cannot be deselected. */
  disabledSlugs: Set<string>;
  onToggle: (slug: string) => void;
  loading: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  searchQuery: string;
}

/** Selectable partner list shown during edit mode. */
export function EditPartnersList({
  partners,
  selectedSlugs,
  disabledSlugs,
  onToggle,
  loading,
  hasMore,
  loadingMore,
  onLoadMore,
  searchQuery,
}: EditPartnersListProps) {
  if (loading) {
    return (
      <div className="flex flex-col">
        <EditTableHeader />
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

  return (
    <div className="flex flex-col">
      <EditTableHeader />
      <Separator />
      {partners.map((partner) => (
        <div key={partner.slug}>
          <PartnerRow
            partner={partner}
            selectable
            selected={selectedSlugs.has(partner.slug)}
            disabled={disabledSlugs.has(partner.slug)}
            onSelect={() => onToggle(partner.slug)}
            rightContent={<PartnerRightContent type={partner.type} capacity={partner.capacity} />}
            className="-mx-5"
          />
          <Separator />
        </div>
      ))}

      {hasMore && !searchQuery.trim() && (
        <div className="flex justify-center mt-4">
          <Button variant="ghost" onClick={onLoadMore} disabled={loadingMore}>
            {loadingMore ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  );
}

/** Column headers for the edit mode partner list. */
function EditTableHeader() {
  return (
    <div className="flex items-center -mx-5 gap-4 px-6 py-2 text-xs font-medium text-muted-foreground">
      {/* Spacer for checkbox + avatar */}
      <div className="w-14 shrink-0" />
      <div className="flex-1 min-w-0">Partner</div>
      <div className="hidden md:flex items-center gap-7 shrink-0">
        <span className="w-22">Capacity</span>
        <span className="w-24">Type</span>
      </div>
    </div>
  );
}

/** Right-side content showing capacity and type (no progress bar). */
function PartnerRightContent({ type, capacity }: { type: string; capacity: number | null }) {
  return (
    <div className="hidden md:flex items-center gap-7 shrink-0">
      <span className="flex items-center gap-2 text-sm w-22">
        <Users className="w-3.5 h-3.5 shrink-0" />
        <span className="tabular-nums">
          {capacity != null ? formatCompactNumber(capacity) : '\u2013'}
        </span>
      </span>
      {type && (
        <span className="w-24 truncate text-sm capitalize">
          {type}
        </span>
      )}
    </div>
  );
}
