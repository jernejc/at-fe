'use client';

import { Building2, ChevronDown } from 'lucide-react';
import { Menu } from '@base-ui/react/menu';
import { ExpandableCard, ExpandableCardHeader } from '@/components/ui/expandable-card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import type { PartnerAssignmentSummary } from '@/lib/schemas';
import { Separator } from '@/components/ui/separator';

const popupStyles =
  'bg-popover text-popover-foreground ring-foreground/10 min-w-48 rounded-lg shadow-md ring-1 p-1 origin-(--transform-origin) data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 duration-100';

const itemStyles =
  'flex items-center gap-2 rounded-md py-1.5 px-2 text-sm cursor-default outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground';

interface AssignmentCardProps {
  partnerName: string | null | undefined;
  partnerLogoUrl: string | null | undefined;
  status: string;
  partners: PartnerAssignmentSummary[];
  reassigning: boolean;
  onReassign: (partnerId: number) => void;
}

/** Displays partner assignment and company status within a campaign. */
export function AssignmentCard({
  partnerName,
  partnerLogoUrl,
  status,
  partners,
  reassigning,
  onReassign,
}: AssignmentCardProps) {
  return (
    <ExpandableCard>
      <ExpandableCardHeader className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Assignment</h3>

        {/* Partner row */}
        <div className="space-y-1.5">
          <p className="text-sm text-muted-foreground">Partner</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar size="sm">
                {partnerLogoUrl && <AvatarImage src={partnerLogoUrl} alt={partnerName ?? ''} />}
                <AvatarFallback>
                  <Building2 className="size-3.5" />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-foreground">
                {partnerName ?? 'Unassigned'}
              </span>
            </div>

            <Menu.Root modal={false}>
              <Menu.Trigger
                disabled={reassigning || partners.length === 0}
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-1.5')}
              >
                {reassigning ? 'Reassigning...' : 'Reassign'}
                <ChevronDown className="size-3.5 text-muted-foreground" />
              </Menu.Trigger>
              <Menu.Portal>
                <Menu.Positioner side="bottom" align="end" sideOffset={4} className="isolate z-50">
                  <Menu.Popup className={popupStyles}>
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
          </div>
        </div>

        <Separator />

        {/* Progress / Status row */}
        <div className="space-y-1.5">
          <p className="text-sm text-muted-foreground">Progress</p>
          <Badge variant="grey">{formatStatus(status)}</Badge>
        </div>
      </ExpandableCardHeader>
    </ExpandableCard>
  );
}

function formatStatus(status: string): string {
  switch (status) {
    case 'new': return 'New';
    case 'in_progress': return 'In Progress';
    case 'closed_won': return 'Closed Won';
    case 'closed_lost': return 'Closed Lost';
    default: return 'Unworked';
  }
}
