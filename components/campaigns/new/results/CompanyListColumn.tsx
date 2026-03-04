'use client';

import type { WSCompanyResult } from '@/lib/schemas';
import { Skeleton } from '@/components/ui/skeleton';
import { CompanyRow } from './CompanyRow';

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

/** Scrollable column listing search result companies. */
export function CompanyListColumn({ companies, selectedDomain, onSelect, isSearching }: CompanyListColumnProps) {
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
    <div>
      {companies.map((company) => (
        <CompanyRow
          key={company.domain}
          company={company}
          isSelected={selectedDomain === company.domain}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
