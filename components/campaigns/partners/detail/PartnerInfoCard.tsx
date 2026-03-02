'use client';

import { Card, CardHeader, CardContent, CardAction } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { PartnerRowData } from '../PartnerRow';
import { Separator } from '@/components/ui/separator';

interface PartnerInfoCardProps {
  partner: PartnerRowData;
}

/** Displays partner information with logo, description, and details. */
export function PartnerInfoCard({ partner }: PartnerInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-foreground">Partner info</h3>
        <CardAction>
          <Avatar size="sm" className="rounded-lg after:rounded-lg">
            {partner.logoUrl && (
              <AvatarImage src={partner.logoUrl} alt={partner.name} className="rounded-lg" />
            )}
            <AvatarFallback className="rounded-lg text-xs">
              {partner.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        {partner.description && (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">About</p>
            <p className="text-sm leading-relaxed">{partner.description}</p>
          </div>
        )}

        {partner.industries.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Industries</p>
              <div className="flex flex-wrap gap-1.5">
                {partner.industries.map((industry, i) => (
                  <Badge key={i} variant="blue" className="text-xs">
                    {industry}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        <Separator />

        <div className="flex items-center gap-4 text-sm justify-between">
          <div>
            <p className="text-muted-foreground">Type</p>
            <p className="font-medium capitalize">{partner.type}</p>
          </div>
          {partner.capacity != null && (
            <div>
              <p className="text-muted-foreground">Capacity</p>
              <p className="font-medium tabular-nums">{partner.capacity}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
