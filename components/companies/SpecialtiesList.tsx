'use client';

import { useMemo, useState } from 'react';
import { SearchField } from '@/components/ui/search-field';

interface SpecialtiesListProps {
  specialties: string[];
}

/**
 * Specialties section: title above a bordered table container with a search
 * input header and a scrollable auto-fit grid of name-sorted specialty cells.
 */
export function SpecialtiesList({ specialties }: SpecialtiesListProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const sorted = [...specialties].sort((a, b) => a.localeCompare(b));
    const q = search.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((s) => s.toLowerCase().includes(q));
  }, [specialties, search]);

  return (
    <section>
      <h3 className="text-base font-medium text-foreground mb-3">Specialties</h3>

      <div className="rounded-md border border-border overflow-hidden">
        <div className="flex items-center justify-end gap-3 px-3 py-2 bg-muted/30">
          <SearchField
            value={search}
            size="sm"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search specialties..."
            className="w-56"
          />
        </div>

        <div className="border-t border-border max-h-96 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground px-3 py-4">
              No specialties match your search.
            </p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] -mt-px -ml-px">
              {filtered.map((s, i) => (
                <div
                  key={`${s}-${i}`}
                  className="px-3 py-2 text-xs text-foreground"
                >
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
