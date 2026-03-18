'use client';

import { useCallback } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { Menu } from '@base-ui/react/menu';
import { Card, CardHeader, CardContent, CardAction } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button, buttonVariants } from '@/components/ui/button';
import { SelectToggle } from '@/components/ui/select-toggle';
import { Separator } from '@/components/ui/separator';
import { CompanyRow, CompanyRowSkeleton } from '@/components/campaigns/CompanyRow';
import { useBulkSelection } from '@/hooks/useBulkSelection';
import { cn } from '@/lib/utils';
import type { CompanyRowData, PartnerAssignmentSummary } from '@/lib/schemas';

const popupStyles =
  'bg-popover text-popover-foreground ring-foreground/10 min-w-48 rounded-lg shadow-md ring-1 p-1 origin-(--transform-origin) data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 duration-100';

const itemStyles =
  'flex items-center gap-2 rounded-md py-1.5 px-2 text-sm cursor-default outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground';

interface PartnerCompaniesCardProps {
  /** Companies assigned to this partner. */
  companies: CompanyRowData[];
  /** Whether companies are being loaded. */
  loading: boolean;
  /** Current partner ID (excluded from reassign options). */
  currentPartnerId: number;
  /** All campaign partners for reassign dropdown. */
  allPartners: PartnerAssignmentSummary[];
  /** Whether a reassign operation is in progress. */
  reassigning: boolean;
  /** Called to reassign selected companies to a new partner. */
  onReassign: (companyIds: number[], newPartnerId: number) => Promise<void>;
}

/** Displays companies assigned to a partner with reassignment capabilities. */
export function PartnerCompaniesCard({
  companies,
  loading,
  currentPartnerId,
  allPartners,
  reassigning,
  onReassign,
}: PartnerCompaniesCardProps) {
  const {
    isEditing,
    selectedIds,
    selectedCount,
    toggleSelect,
    toggleSelectAll,
    isAllSelected,
    isPartiallySelected,
    startEditing,
    cancelEditing,
  } = useBulkSelection();

  const otherPartners = allPartners.filter((p) => p.partner_id !== currentPartnerId);
  const canReassign = otherPartners.length > 0;

  const handleReassign = useCallback(async (newPartnerId: number) => {
    const companyIds = Array.from(selectedIds);
    await onReassign(companyIds, newPartnerId);
    cancelEditing();
  }, [selectedIds, onReassign, cancelEditing]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-foreground">Companies</h3>
          {!loading && (
            <Badge variant="grey" className="text-xs">
              {companies.length}
            </Badge>
          )}
        </div>
        {canReassign && (
          <CardAction>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{selectedCount} selected</span>

                <Menu.Root modal={false}>
                  <Menu.Trigger
                    disabled={selectedCount === 0 || reassigning}
                    className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-1.5')}
                  >
                    {reassigning ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" data-icon="inline-start" />
                    ) : null}
                    Reassign
                    <ChevronDown className="size-3 text-muted-foreground" data-icon="inline-end" />
                  </Menu.Trigger>
                  <Menu.Portal>
                    <Menu.Positioner side="bottom" align="end" sideOffset={4} className="isolate z-50">
                      <Menu.Popup className={popupStyles}>
                        {otherPartners.map((p) => (
                          <Menu.Item
                            key={p.partner_id}
                            className={itemStyles}
                            onClick={() => handleReassign(p.partner_id)}
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

                <Button variant="ghost" size="sm" onClick={cancelEditing} disabled={reassigning}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={startEditing} disabled={companies.length === 0}>
                Reassign
              </Button>
            )}
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-1">
            {Array.from({ length: 3 }, (_, i) => (
              <CompanyRowSkeleton key={i} />
            ))}
          </div>
        ) : companies.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No companies assigned to this partner.
          </p>
        ) : (
          <div className="flex flex-col">
            {/* Select all header (edit mode only) */}
            {isEditing && (
              <>
                <div className="flex items-center gap-3 py-2">
                  <SelectToggle
                    checked={isAllSelected(companies)}
                    indeterminate={isPartiallySelected(companies)}
                    onChange={() => toggleSelectAll(companies)}
                  />
                  <span className="text-xs text-muted-foreground">Select all</span>
                </div>
              </>
            )}

            {companies.map((company) => (
              <div key={company.id}>
                <Separator />
                <CompanyRow
                  company={company}
                  hideStatus
                  visibleMetrics={['fit', 'location', 'size']}
                  selectable={isEditing}
                  selected={selectedIds.has(company.id)}
                  onSelect={(e) => toggleSelect(company.id, e.shiftKey, companies)}
                  className='-mx-6'
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
