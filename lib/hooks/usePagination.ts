'use client';

import { useState, useCallback } from 'react';

interface PaginatedResponse<T> {
    items: T[];
    total: number;
}

interface UsePaginationOptions<T> {
    /** Function to fetch a page of items */
    fetchFn: (page: number) => Promise<PaginatedResponse<T>>;
    /** Initial items (optional) */
    initialItems?: T[];
    /** Initial total count (optional) */
    initialTotal?: number;
}

interface UsePaginationReturn<T> {
    /** Current list of items */
    items: T[];
    /** Total number of items available */
    total: number;
    /** Load the next page of items */
    loadMore: () => Promise<void>;
    /** Whether a load operation is in progress */
    loading: boolean;
    /** Reset items and reload from page 1 */
    reset: (newItems?: T[], newTotal?: number) => void;
    /** Current page number */
    page: number;
}

/**
 * Generic hook for paginated data loading.
 * Handles page tracking, loading states, and item accumulation.
 */
export function usePagination<T>({
    fetchFn,
    initialItems = [],
    initialTotal = 0,
}: UsePaginationOptions<T>): UsePaginationReturn<T> {
    const [items, setItems] = useState<T[]>(initialItems);
    const [total, setTotal] = useState(initialTotal);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    const loadMore = useCallback(async () => {
        if (loading) return;
        setLoading(true);
        try {
            const nextPage = page + 1;
            const res = await fetchFn(nextPage);
            setItems(prev => [...prev, ...res.items]);
            setPage(nextPage);
        } catch (error) {
            console.error("Failed to load more items", error);
        } finally {
            setLoading(false);
        }
    }, [fetchFn, loading, page]);

    const reset = useCallback((newItems: T[] = [], newTotal: number = 0) => {
        setItems(newItems);
        setTotal(newTotal);
        setPage(1);
    }, []);

    return {
        items,
        total,
        loadMore,
        loading,
        reset,
        page,
    };
}
