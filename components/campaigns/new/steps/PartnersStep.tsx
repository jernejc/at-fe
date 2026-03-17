'use client';

import { useMemo, useState } from 'react';
import { Users } from 'lucide-react';
import { formatCompactNumber } from '@/lib/utils';
import { SearchField } from '@/components/ui/search-field';
import { Button } from '@/components/ui/button';
import type { PartnerListItem } from '../hooks/usePartnerSelection';
import { PartnerRow, PartnerRowSkeleton, toPartnerRowDataFromSummary } from '../../partners/PartnerRow';
import { Separator } from '@/components/ui/separator';

interface PartnersStepProps {
  partners: PartnerListItem[];
  selectedSlugs: Set<string>;
  onToggle: (slug: string) => void;
  loading: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
}

/** Partner selection step with title and selectable row list. */
export function PartnersStep({ partners, selectedSlugs, onToggle, loading, hasMore, loadingMore, onLoadMore }: PartnersStepProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return partners;
    const q = search.trim().toLowerCase();
    return partners.filter((p) => p.name.toLowerCase().includes(q));
  }, [partners, search]);

  return (
    <div className='flex-1 p-4 overflow-hidden'>
      <div className='h-full rounded-2xl border border-border bg-card overflow-hidden flex flex-col'>
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-xl font-display font-bold text-foreground">
              Select partners
            </h1>
            <SearchField
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search partners…"
              className="w-56"
            />
          </div>

          {loading ? (
            <div className="flex flex-col">
              {Array.from({ length: 5 }, (_, i) => (
                <PartnerRowSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col">
              {filtered.map((p) => {
                const row = toPartnerRowDataFromSummary(p);
                return (
                  <div key={p.slug}>
                    <Separator />
                    <PartnerRow
                      partner={row}
                      selectable
                      selected={selectedSlugs.has(p.slug)}
                      onSelect={() => onToggle(p.slug)}
                      rightContent={
                        <div className="hidden md:flex items-center gap-7 shrink-0">
                          <span className="flex items-center gap-2 text-sm w-22">
                            <Users className="w-3.5 h-3.5 shrink-0" />
                            <span className="tabular-nums">
                              {p.capacity != null ? formatCompactNumber(p.capacity) : '\u2013'}
                            </span>
                          </span>
                          {p.type && (
                            <span className="w-24 truncate text-sm capitalize">
                              {p.type}
                            </span>
                          )}
                        </div>
                      }
                      className="-mx-6"
                    />
                  </div>
                );
              })}

              {hasMore && !search.trim() && (
                <div className="flex justify-center mt-4">
                  <Button variant="ghost" onClick={onLoadMore} disabled={loadingMore}>
                    {loadingMore ? 'Loading...' : 'Load more'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
