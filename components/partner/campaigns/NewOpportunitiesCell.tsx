'use client';

import { useRouter } from 'next/navigation';
import { Sparkles, Loader2 } from 'lucide-react';
import { CompanyRow, CompanyRowSkeleton } from '@/components/campaigns/CompanyRow';
import { DashboardCellTitle } from '@/components/ui/dashboard';
import { Button } from '@/components/ui/button';
import type { NewOpportunityItem } from './useNewOpportunities';
import { mapAssignmentToCompanyRow } from './useNewOpportunities';

interface NewOpportunitiesCellProps {
  items: NewOpportunityItem[];
  loading: boolean;
  totalCount: number;
  hasMore: boolean;
  loadMore: () => void;
  loadingMore: boolean;
}

/** Dashboard cell content showing recently assigned companies as new opportunities. */
export function NewOpportunitiesCell({
  items,
  loading,
  totalCount,
  hasMore,
  loadMore,
  loadingMore,
}: NewOpportunitiesCellProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full">
      <DashboardCellTitle className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-500" />
        New Opportunities
        {!loading && totalCount > 0 && (
          <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
            {totalCount}
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
              key={`${item.item.campaign_id}-${item.item.company.id}`}
              company={mapAssignmentToCompanyRow(item)}
              onClick={() => router.push(`/partner/campaigns/${item.campaignSlug}/companies`)}
              visibleMetrics={[]}
            />
          ))}
          {hasMore && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 self-center text-muted-foreground"
              onClick={loadMore}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Loading…
                </>
              ) : (
                'Load more'
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
