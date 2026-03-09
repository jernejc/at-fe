'use client';

import { ExpandableCard, ExpandableCardHeader, ExpandableCardDetails } from '@/components/ui/expandable-card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { PartnerRead } from '@/lib/schemas';
import type { PartnerRowData } from '@/components/campaigns/partners/PartnerRow';

interface PartnerOverviewCardProps {
  /** Full partner details (PartnerRead) or fallback to PartnerRowData. */
  partner: PartnerRead | PartnerRowData;
}

/** Returns true if the partner data has full details (from getPartner API). */
function isPartnerRead(p: PartnerRead | PartnerRowData): p is PartnerRead {
  return 'logo_url' in p;
}

/** Expandable card showing partner overview information. */
export function PartnerOverviewCard({ partner }: PartnerOverviewCardProps) {
  const name = partner.name;
  const logoUrl = isPartnerRead(partner) ? partner.logo_url : partner.logoUrl;
  const description = partner.description;
  const industries = partner.industries;
  const partnerType = partner.type ?? null;
  const capacity = partner.capacity;

  return (
    <ExpandableCard defaultExpanded>
      <ExpandableCardHeader className="flex items-center gap-4">
        <Avatar size="default" className="rounded-lg after:rounded-lg">
          {logoUrl && <AvatarImage src={logoUrl} alt={name} className="rounded-lg" />}
          <AvatarFallback className="rounded-lg text-sm">
            {name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-foreground truncate">{name}</h3>
          <p className="text-xs text-muted-foreground capitalize">{partner.status}</p>
        </div>
      </ExpandableCardHeader>

      <ExpandableCardDetails className="space-y-4">
        {description && (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">About</p>
            <p className="text-sm leading-relaxed">{description}</p>
          </div>
        )}

        {industries.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Industries</p>
              <div className="flex flex-wrap gap-1.5">
                {industries.map((industry, i) => (
                  <Badge key={i} variant="blue" className="text-xs">
                    {industry}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {(partnerType || capacity != null) && (
          <>
            <Separator />
            <div className="flex items-center gap-4 text-sm justify-between">
              {partnerType && (
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{partnerType}</p>
                </div>
              )}
              {capacity != null && (
                <div>
                  <p className="text-muted-foreground">Capacity</p>
                  <p className="font-medium tabular-nums">{capacity}</p>
                </div>
              )}
            </div>
          </>
        )}
      </ExpandableCardDetails>
    </ExpandableCard>
  );
}
