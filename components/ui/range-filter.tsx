'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/** Props for the RangeFilter component. */
export interface RangeFilterProps {
  /** Label displayed in the top-left corner. */
  title: string;
  /** Raw values array (rounded & counted) OR a pre-computed { value: count } map. */
  values: number[] | Record<number, number>;
  /** Fires when the user changes the selected range. */
  onChange?: (range: [number, number]) => void;
  className?: string;
}

/** Build a histogram from raw values or passthrough a record. */
function buildHistogram(values: number[] | Record<number, number>): Map<number, number> {
  const hist = new Map<number, number>();

  if (Array.isArray(values)) {
    for (const v of values) {
      const rounded = Math.round(v);
      hist.set(rounded, (hist.get(rounded) ?? 0) + 1);
    }
  } else {
    for (const [k, count] of Object.entries(values)) {
      hist.set(Number(k), count);
    }
  }

  return hist;
}

/**
 * Fill gaps between min and max with zero-count entries, return sorted.
 * Only fills integer gaps if the range is reasonable (<=200); otherwise
 * returns just the existing keys sorted.
 */
function fillAndSort(hist: Map<number, number>): [number, number][] {
  const keys = [...hist.keys()].sort((a, b) => a - b);
  if (keys.length === 0) return [];

  const min = keys[0];
  const max = keys[keys.length - 1];

  // Only fill integer gaps when range is small enough for a clean bar chart
  if (max - min <= 200) {
    const entries: [number, number][] = [];
    for (let i = min; i <= max; i++) {
      entries.push([i, hist.get(i) ?? 0]);
    }
    return entries;
  }

  // Sparse data: return existing keys as-is
  return keys.map((k) => [k, hist.get(k) ?? 0]);
}

/** Compute a weighted average from histogram entries. */
function weightedAvg(entries: [number, number][]): number {
  let total = 0;
  let count = 0;
  for (const [value, c] of entries) {
    total += value * c;
    count += c;
  }
  return count === 0 ? 0 : Math.round(total / count);
}

/**
 * Histogram bar chart with a dual-thumb range slider for filtering numeric values.
 * Bars inside the selected range are dark; bars outside are muted.
 */
export function RangeFilter({ title, values, onChange, className }: RangeFilterProps) {
  const hist = React.useMemo(() => buildHistogram(values), [values]);
  const entries = React.useMemo(() => fillAndSort(hist), [hist]);
  const avg = React.useMemo(() => weightedAvg(entries), [entries]);

  const dataMin = entries.length > 0 ? entries[0][0] : 0;
  const dataMax = entries.length > 0 ? entries[entries.length - 1][0] : 0;
  const maxCount = Math.max(...entries.map(([, c]) => c), 1);

  const [rangeMin, setRangeMin] = React.useState(dataMin);
  const [rangeMax, setRangeMax] = React.useState(dataMax);

  // Reset range when data changes
  React.useEffect(() => {
    setRangeMin(dataMin);
    setRangeMax(dataMax);
  }, [dataMin, dataMax]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    const next = Math.min(val, rangeMax);
    setRangeMin(next);
    onChange?.([next, rangeMax]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    const next = Math.max(val, rangeMin);
    setRangeMax(next);
    onChange?.([rangeMin, next]);
  };

  // Percentage positions for the active track highlight
  const range = dataMax - dataMin || 1;
  const leftPct = ((rangeMin - dataMin) / range) * 100;
  const rightPct = ((dataMax - rangeMax) / range) * 100;

  if (entries.length === 0) return null;

  return (
    <div
      data-slot="range-filter"
      className={cn('rounded-xl border border-border p-6', className)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm text-muted-foreground">{title}</span>
        <span className="text-4xl font-display font-medium text-foreground">{avg}</span>
      </div>

      {/* Bar chart */}
      <div className="flex items-end gap-0.5 px-2" style={{ height: 64 }}>
        {entries.map(([value, count]) => {
          const inRange = value >= rangeMin && value <= rangeMax;
          const heightPct = (count / maxCount) * 100;
          return (
            <div
              key={value}
              className={cn(
                'flex-1 rounded-t-xs transition-colors',
                inRange ? 'bg-foreground' : 'bg-muted-foreground/20'
              )}
              style={{ height: `${Math.max(heightPct, 0)}%` }}
            />
          );
        })}
      </div>

      {/* Range slider */}
      <div className="relative h-5 -mt-2">
        {/* Track background */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-0.5 bg-muted-foreground/20 rounded-full" />
        {/* Active track */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-0.5 bg-primary rounded-full"
          style={{ left: `${leftPct}%`, right: `${rightPct}%` }}
        />

        {/* Min thumb */}
        <input
          type="range"
          min={dataMin}
          max={dataMax}
          value={rangeMin}
          onChange={handleMinChange}
          className="range-thumb absolute inset-0 w-full appearance-none bg-transparent pointer-events-none"
          style={{ zIndex: rangeMin > dataMax - 5 ? 5 : 3 }}
        />
        {/* Max thumb */}
        <input
          type="range"
          min={dataMin}
          max={dataMax}
          value={rangeMax}
          onChange={handleMaxChange}
          className="range-thumb absolute inset-0 w-full appearance-none bg-transparent pointer-events-none"
          style={{ zIndex: 4 }}
        />
      </div>

      {/* Footer */}
      <div className="flex justify-between mt-0.5">
        <span className="text-sm text-muted-foreground">min {rangeMin}</span>
        <span className="text-sm text-muted-foreground">{rangeMax} max</span>
      </div>
    </div>
  );
}
