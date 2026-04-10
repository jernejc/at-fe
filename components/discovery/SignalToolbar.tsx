'use client';

import { useMemo } from 'react';
import { Filter } from '@/components/ui/filter';
import { Sort } from '@/components/ui/sort';
import type { FitSummaryFit } from '@/lib/schemas';
import type { FilterDefinition, ActiveFilter, SortOptionDefinition, SortState } from '@/lib/schemas/filter';

interface SignalToolbarProps {
  products: FitSummaryFit[];
  filters: ActiveFilter[];
  onFiltersChange: (filters: ActiveFilter[]) => void;
  sort: SortState | null;
  onSortChange: (sort: SortState | null) => void;
}

const SORT_OPTIONS: SortOptionDefinition[] = [
  { value: 'strength', label: 'Strength' },
  { value: 'name', label: 'Name' },
  { value: 'confidence', label: 'Confidence' },
  { value: 'component_count', label: 'Signal count' },
];

/** Filter + Sort toolbar for the merged signals list. */
export function SignalToolbar({
  products,
  filters,
  onFiltersChange,
  sort,
  onSortChange,
}: SignalToolbarProps) {
  const filterDefinitions: FilterDefinition[] = useMemo(() => [
    {
      key: 'signal_type',
      label: 'Signal type',
      options: [
        { value: 'interest', label: 'Interest' },
        { value: 'event', label: 'Event' },
      ],
    },
    {
      key: 'product',
      label: 'Product',
      options: products.map((p) => ({
        value: String(p.product_id),
        label: p.product_name,
      })),
    },
  ], [products]);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Filter
        definitions={filterDefinitions}
        value={filters}
        onValueChange={onFiltersChange}
      />
      <Sort
        options={SORT_OPTIONS}
        value={sort}
        onValueChange={onSortChange}
      />
    </div>
  );
}
