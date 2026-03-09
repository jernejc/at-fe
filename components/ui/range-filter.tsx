'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/** Props for the RangeFilter component. */
export interface RangeFilterProps {
  /** Label displayed in the top-left corner. */
  title: string;
  /** Raw values array (rounded & counted) OR a pre-computed { value: count } map. */
  values: number[] | Record<number, number>;
  /** Override the chart/slider minimum (extends range beyond data if needed). */
  min?: number;
  /** Override the chart/slider maximum (extends range beyond data if needed). */
  max?: number;
  /** Maximum number of bar columns. Values are grouped into buckets when the range exceeds this. @default 50 */
  maxBars?: number;
  /** Controlled selected range — keeps slider in sync with external state. */
  range?: [number, number];
  /** Fires when the user changes the selected range. */
  onChange?: (range: [number, number]) => void;
  /** Custom formatter for the displayed average value. @default String(avg) */
  formatAvg?: (avg: number) => string;
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

interface Bucket {
  start: number;
  end: number;
  count: number;
}

/** Group histogram into at most `maxBars` buckets, filling all gaps. */
function buildBuckets(
  hist: Map<number, number>,
  overrideMin?: number,
  overrideMax?: number,
  maxBars = 50,
): Bucket[] {
  const keys = [...hist.keys()].sort((a, b) => a - b);
  if (keys.length === 0 && overrideMin == null) return [];

  const min = overrideMin ?? keys[0];
  const max = overrideMax ?? keys[keys.length - 1];
  const span = max - min;

  // When range fits in maxBars, each integer gets its own bar
  if (span < maxBars) {
    return Array.from({ length: span + 1 }, (_, i) => ({
      start: min + i,
      end: min + i,
      count: hist.get(min + i) ?? 0,
    }));
  }

  // Otherwise group into evenly-sized buckets
  const bucketWidth = (span + 1) / maxBars;
  const buckets: Bucket[] = [];

  for (let i = 0; i < maxBars; i++) {
    const start = Math.round(min + i * bucketWidth);
    const end = Math.round(min + (i + 1) * bucketWidth) - 1;
    let count = 0;
    for (const [k, c] of hist) {
      if (k >= start && k <= end) count += c;
    }
    buckets.push({ start, end, count });
  }

  return buckets;
}

/** Compute a weighted average directly from the raw histogram. */
function weightedAvg(hist: Map<number, number>): number {
  let total = 0;
  let count = 0;
  for (const [value, c] of hist) {
    total += value * c;
    count += c;
  }
  return count === 0 ? 0 : Math.round(total / count);
}

/**
 * Histogram bar chart with a dual-thumb range slider for filtering numeric values.
 * Bars inside the selected range are dark; bars outside are muted.
 */
export function RangeFilter({ title, values, min: propMin, max: propMax, maxBars = 50, range: propRange, onChange, formatAvg, className }: RangeFilterProps) {
  const hist = React.useMemo(() => buildHistogram(values), [values]);
  const buckets = React.useMemo(() => buildBuckets(hist, propMin, propMax, maxBars), [hist, propMin, propMax, maxBars]);
  const avg = React.useMemo(() => weightedAvg(hist), [hist]);

  const dataMin = buckets.length > 0 ? buckets[0].start : 0;
  const dataMax = buckets.length > 0 ? buckets[buckets.length - 1].end : 0;
  const maxCount = Math.max(...buckets.map((b) => b.count), 1);

  const [rangeMin, setRangeMin] = React.useState(propRange ? propRange[0] : dataMin);
  const [rangeMax, setRangeMax] = React.useState(propRange ? propRange[1] : dataMax);

  // Sync range from controlled prop or reset to full range when data changes
  React.useEffect(() => {
    if (propRange) {
      setRangeMin(propRange[0]);
      setRangeMax(propRange[1]);
    } else {
      setRangeMin(dataMin);
      setRangeMax(dataMax);
    }
  }, [propRange, dataMin, dataMax]);

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

  if (buckets.length === 0) return null;

  return (
    <div
      data-slot="range-filter"
      className={cn('rounded-xl p-6', className)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm text-muted-foreground">{title}</span>
        <span className="text-4xl font-display font-medium text-foreground">{formatAvg ? formatAvg(avg) : avg}</span>
      </div>

      {/* Bar chart */}
      <div className="flex items-end gap-0.5 px-2" style={{ height: 64 }}>
        {buckets.map((bucket) => {
          const inRange = bucket.end >= rangeMin && bucket.start <= rangeMax;
          const heightPct = (bucket.count / maxCount) * 100;
          return (
            <div
              key={bucket.start}
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
      <div className="relative h-5 -mt-2 mb-2">
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
        <span className="text-sm text-muted-foreground">min {rangeMin.toLocaleString()}</span>
        <span className="text-sm text-muted-foreground">{rangeMax.toLocaleString()} max</span>
      </div>
    </div>
  );
}
