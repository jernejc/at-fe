'use client';

import { useMemo, useState } from 'react';
import { differenceInYears } from 'date-fns';
import type { Technology } from '@/lib/schemas';

export type TechSortMode = 'name' | 'recency';

/** Recency buckets used for both font weight and group headers. */
export type RecencyBucket = 0 | 1 | 2 | 3 | 4;

export const RECENCY_BUCKET_LABELS: Record<RecencyBucket, string> = {
  0: 'Detected in the last year',
  1: 'Detected 1–2 years ago',
  2: 'Detected 2–3 years ago',
  3: 'Detected over 3 years ago',
  4: 'Verification date unknown',
};

const BUCKET_WEIGHT_CLASS: Record<RecencyBucket, string> = {
  0: 'font-bold',
  1: 'font-medium',
  2: 'font-light',
  3: 'font-thin',
  4: 'font-thin',
};

/** Buckets a `lastVerifiedAt` ISO date by years from `now`. Null → bucket 4. */
export function getRecencyBucket(date: string | null, now: Date = new Date()): RecencyBucket {
  if (!date) return 4;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return 4;
  const years = differenceInYears(now, parsed);
  if (years < 1) return 0;
  if (years < 2) return 1;
  if (years < 3) return 2;
  return 3;
}

export function getWeightClass(bucket: RecencyBucket): string {
  return BUCKET_WEIGHT_CLASS[bucket];
}

/** Group of technologies that share a recency bucket; emitted only in recency mode. */
export interface TechGroup {
  bucket: RecencyBucket;
  label: string;
  items: Technology[];
}

interface UseTechStackListResult {
  search: string;
  setSearch: (v: string) => void;
  sort: TechSortMode;
  setSort: (v: TechSortMode) => void;
  filteredCount: number;
  /** Flat sorted list (used in name mode). */
  flat: Technology[];
  /** Grouped list (used in recency mode). */
  groups: TechGroup[];
}

/** State + filtering/sorting/grouping for the shared tech stack list. */
export function useTechStackList(technologies: Technology[]): UseTechStackListResult {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<TechSortMode>('name');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return technologies;
    return technologies.filter((t) => t.technology.toLowerCase().includes(q));
  }, [technologies, search]);

  const flat = useMemo(() => {
    const arr = [...filtered];
    if (sort === 'name') {
      arr.sort((a, b) => a.technology.localeCompare(b.technology));
    } else {
      arr.sort((a, b) => {
        const ta = a.lastVerifiedAt ? new Date(a.lastVerifiedAt).getTime() : -Infinity;
        const tb = b.lastVerifiedAt ? new Date(b.lastVerifiedAt).getTime() : -Infinity;
        return tb - ta;
      });
    }
    return arr;
  }, [filtered, sort]);

  const groups = useMemo<TechGroup[]>(() => {
    if (sort !== 'recency') return [];
    const byBucket = new Map<RecencyBucket, Technology[]>();
    for (const t of flat) {
      const bucket = getRecencyBucket(t.lastVerifiedAt);
      const list = byBucket.get(bucket) ?? [];
      list.push(t);
      byBucket.set(bucket, list);
    }
    const order: RecencyBucket[] = [0, 1, 2, 3, 4];
    return order
      .filter((b) => byBucket.has(b))
      .map((bucket) => ({
        bucket,
        label: RECENCY_BUCKET_LABELS[bucket],
        items: byBucket.get(bucket)!,
      }));
  }, [flat, sort]);

  return {
    search,
    setSearch,
    sort,
    setSort,
    filteredCount: filtered.length,
    flat,
    groups,
  };
}
