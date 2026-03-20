'use client';

import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { CompanyRow, CompanyRowSkeleton } from '@/components/campaigns/CompanyRow';
import { DashboardCellTitle } from '@/components/ui/dashboard';
import type { NewOpportunityItem } from './useNewOpportunities';
import { mapAssignmentToCompanyRow } from './useNewOpportunities';

interface NewOpportunitiesCellProps {
  items: NewOpportunityItem[];
  loading: boolean;
}

/** Dashboard cell content showing recently assigned companies as new opportunities. */
export function NewOpportunitiesCell({ items, loading }: NewOpportunitiesCellProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full">
      <DashboardCellTitle className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-500" />
        New Opportunities
        {!loading && items.length > 0 && (
          <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
            {items.length}
          </span>
        )}
      </DashboardCellTitle>

      {loading ? (
        <div className="flex flex-col mt-2">
          {Array.from({ length: 3 }, (_, i) => (
            <CompanyRowSkeleton key={i} hideStatus visibleMetrics={[]} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">No new opportunities this week</p>
        </div>
      ) : (
        <div className="flex flex-col mt-2">
          {items.map((item) => (
            <CompanyRow
              key={item.assignment.id}
              company={mapAssignmentToCompanyRow(item)}
              onClick={() => router.push(`/partner/campaigns/${item.campaignSlug}/companies`)}
              visibleMetrics={[]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
