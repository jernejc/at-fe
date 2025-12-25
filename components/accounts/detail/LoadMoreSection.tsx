'use client';

import { Button } from '@/components/ui/button';

interface LoadMoreSectionProps {
    /** Number of items currently displayed */
    currentCount: number;
    /** Total number of items available */
    totalCount: number;
    /** Callback to load additional items */
    onLoadMore: () => void;
    /** Whether a load operation is in progress */
    loadingMore: boolean;
    /** Label for the items (e.g., "jobs", "articles", "positions") */
    itemLabel?: string;
}

/**
 * Reusable pagination component showing count and load more button.
 * Used in Jobs, News, and other paginated lists.
 */
export function LoadMoreSection({
    currentCount,
    totalCount,
    onLoadMore,
    loadingMore,
    itemLabel = 'items',
}: LoadMoreSectionProps) {
    if (totalCount <= currentCount) return null;

    return (
        <div className="flex flex-col items-center gap-2 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">
                Showing {currentCount} of {totalCount} {itemLabel}
            </p>
            <Button
                onClick={onLoadMore}
                disabled={loadingMore}
                variant="ghost"
                className="px-6 py-2 h-auto text-sm font-semibold hover:text-primary hover:bg-primary/5 transition-all"
            >
                {loadingMore ? 'Loading...' : `Load More`}
            </Button>
        </div>
    );
}
