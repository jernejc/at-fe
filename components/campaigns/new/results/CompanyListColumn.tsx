'use client';

import { useState, useCallback } from 'react';
import type { WSCompanyResult } from '@/lib/schemas';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { CompanyRow } from './CompanyRow';

const PAGE_SIZE = 25;

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

/** Scrollable column listing search result companies with progressive rendering. */
export function CompanyListColumn({ companies, selectedDomain, onSelect, isSearching }: CompanyListColumnProps) {
  // Use companies array identity as the key — when a new array is produced
  // (new search or filter change), CompanyList remounts and resets visibleCount.
  const [listKey, setListKey] = useState(0);
  const [prevCompanies, setPrevCompanies] = useState(companies);
  if (companies !== prevCompanies) {
    setPrevCompanies(companies);
    setListKey((k) => k + 1);
  }

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
    <CompanyList
      key={listKey}
      companies={companies}
      selectedDomain={selectedDomain}
      onSelect={onSelect}
    />
  );
}
