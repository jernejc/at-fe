'use client';

import { Building2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import type { PartnerListItem } from '../hooks/usePartnerSelection';

interface PartnerCardProps {
  partner: PartnerListItem;
  isSelected: boolean;
  onToggle: (slug: string) => void;
}

/** Selectable partner card with checkbox, logo, capacity, type, and industries. */
export function PartnerCard({ partner, isSelected, onToggle }: PartnerCardProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(partner.slug)}
      className={cn(
        'rounded-xl border p-5 text-left transition-all w-full',
        isSelected ? 'border-primary' : 'border-border hover:border-border-d',
      )}
    >
      {/* Top row: checkbox, avatar, capacity, type */}
      <div className="flex items-center gap-3">
        {/* Checkbox */}
        <div
          className={cn(
            'size-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors',
            isSelected
              ? 'bg-primary border-primary text-primary-foreground'
              : 'border-muted-foreground/30',
          )}
        >
          {isSelected && <Check className="size-3" />}
        </div>

        <Avatar className="size-10 rounded-lg shrink-0">
          {partner.logo_url && <AvatarImage src={partner.logo_url} alt={partner.name} />}
          <AvatarFallback className="rounded-lg text-sm font-medium">
            {partner.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1" />

        {partner.capacity != null && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Building2 className="size-3" />
            <span>{partner.capacity}</span>
          </div>
        )}

        {partner.type && (
          <Badge variant="grey" className="text-xs">
            {partner.type}
          </Badge>
        )}
      </div>

      {/* Name */}
      <div className="mt-3 text-lg font-semibold text-foreground">{partner.name}</div>

      {/* Industries */}
      {partner.industries.length > 0 && (
        <div className="text-sm text-muted-foreground mt-1 line-clamp-1">
          {partner.industries.join(', ')}
        </div>
      )}
    </button>
  );
}
