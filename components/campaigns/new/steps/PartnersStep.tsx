'use client';

import { Loader2 } from 'lucide-react';
import type { PartnerListItem } from '../hooks/usePartnerSelection';
import { PartnerGrid } from '../partners/PartnerGrid';

interface PartnersStepProps {
  partners: PartnerListItem[];
  selectedSlugs: Set<string>;
  onToggle: (slug: string) => void;
  loading: boolean;
}

/** Partner selection step with title and responsive grid. */
export function PartnersStep({ partners, selectedSlugs, onToggle, loading }: PartnersStepProps) {
  return (
    <div className='flex-1 p-4 overflow-hidden'>
      <div className='h-full rounded-2xl border border-border bg-card overflow-hidden flex flex-col'>
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-8">
          <h1 className="text-xl font-display font-bold text-foreground mb-8">
            Select partners
          </h1>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <PartnerGrid partners={partners} selectedSlugs={selectedSlugs} onToggle={onToggle} />
          )}
        </div>
      </div>
    </div>
  );
}
