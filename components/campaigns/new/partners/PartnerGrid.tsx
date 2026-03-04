'use client';

import type { PartnerListItem } from '../hooks/usePartnerSelection';
import { PartnerCard } from './PartnerCard';

interface PartnerGridProps {
  partners: PartnerListItem[];
  selectedSlugs: Set<string>;
  onToggle: (slug: string) => void;
}

/** Responsive 3-column grid of selectable partner cards. */
export function PartnerGrid({ partners, selectedSlugs, onToggle }: PartnerGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {partners.map((p) => (
        <PartnerCard
          key={p.slug}
          partner={p}
          isSelected={selectedSlugs.has(p.slug)}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}
