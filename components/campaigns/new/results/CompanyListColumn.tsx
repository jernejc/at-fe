'use client';

import { useState, useCallback, useMemo } from 'react';
import type { WSCompanyResult, SortState, SortOptionDefinition } from '@/lib/schemas';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Sort } from '@/components/ui/sort';
import { CompanyRow } from './CompanyRow';

const PAGE_SIZE = 25;

const SORT_OPTIONS: SortOptionDefinition[] = [
  { value: 'match_score', label: 'Match Strength' },
  { value: 'product_fit_score', label: 'Product Fit' },
  { value: 'revenue_amount', label: 'Revenue' },
  { value: 'employee_count', label: 'Employee Size' },
];

const DEFAULT_SORT: SortState = { field: 'match_score', direction: 'desc' };

interface CompanyListColumnProps {
  companies: WSCompanyResult[];
  selectedDomain: string | null;
  onSelect: (domain: string) => void;
  isSearching: boolean;
}

/** Skeleton row matching the CompanyRow layout. */
function CompanyRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
      <Skeleton className="size-7 rounded-full shrink-0" />
      <Skeleton className="size-8 rounded-md shrink-0" />
      <div className="flex-1 min-w-0">
        <Skeleton className="h-4 w-32 mb-1" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

/** Inner list with its own visibleCount state, reset via key remount when companies change. */
function CompanyList({ companies, selectedDomain, onSelect }: Omit<CompanyListColumnProps, 'isSearching'>) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const showMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, companies.length));
  }, [companies.length]);

  const visibleCompanies = companies.slice(0, visibleCount);
  const remaining = companies.length - visibleCount;

  return (
    <div>
      {visibleCompanies.map((company) => (
        <CompanyRow
          key={company.domain}
          company={company}
          isSelected={selectedDomain === company.domain}
          onSelect={onSelect}
        />
      ))}
      {remaining > 0 && (
        <div className="flex justify-center p-4">
          <Button variant="ghost" size="sm" onClick={showMore}>
            Show more ({remaining} remaining)
          </Button>
        </div>
      )}
    </div>
  );
}

/** Sorts companies by the given sort state, pushing nulls to the end. */
function sortCompanies(companies: WSCompanyResult[], sort: SortState | null): WSCompanyResult[] {
  if (!sort) return companies;
  const { field, direction } = sort;
  const multiplier = direction === 'asc' ? 1 : -1;

  return [...companies].sort((a, b) => {
    const aVal = a[field as keyof WSCompanyResult] as number | null | undefined;
    const bVal = b[field as keyof WSCompanyResult] as number | null | undefined;
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    return (aVal - bVal) * multiplier;
  });
}

/** Scrollable column listing search result companies with progressive rendering and sorting. */
export function CompanyListColumn({ companies, selectedDomain, onSelect, isSearching }: CompanyListColumnProps) {
  const [sort, setSort] = useState<SortState | null>(DEFAULT_SORT);

  // Track original companies identity for list key (not the sorted array)
  const [listKey, setListKey] = useState(0);
  const [prevCompanies, setPrevCompanies] = useState(companies);
  if (companies !== prevCompanies) {
    setPrevCompanies(companies);
    setListKey((k) => k + 1);
  }

  const sortedCompanies = useMemo(() => sortCompanies(companies, sort), [companies, sort]);

  if (isSearching) {
    return (
      <div>
        {Array.from({ length: 8 }).map((_, i) => (
          <CompanyRowSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground text-sm">
        No companies match the current filters.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-1 bg-card border-b border-border px-4 py-2">
        <Sort options={SORT_OPTIONS} value={sort} onValueChange={setSort} />
      </div>
      <div className="flex items-center gap-3 px-4 py-1.5 text-xs font-medium text-muted-foreground border-b border-border">
        <span className="w-10 shrink-0 text-left">Fit</span>
        <span className="min-w-0 flex-1">Company</span>
        <span className="w-20 shrink-0">Match</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        <CompanyList
          key={listKey}
          companies={sortedCompanies}
          selectedDomain={selectedDomain}
          onSelect={onSelect}
        />
      </div>
    </div>
  );
}
