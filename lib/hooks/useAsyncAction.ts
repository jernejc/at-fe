'use client';

import { useState, useCallback } from 'react';

interface UseAsyncActionReturn {
    /** Whether the action is currently loading */
    isLoading: boolean;
    /** Execute the async action */
    execute: () => Promise<void>;
}

/**
 * Hook to manage async action loading states.
 * Handles internal loading state and supports external loading override.
 * 
 * @param action - The async function to execute
 * @param externalLoading - Optional external loading state that overrides internal state
 */
export function useAsyncAction(
    action: () => Promise<void>,
    externalLoading?: boolean
): UseAsyncActionReturn {
    const [internalLoading, setInternalLoading] = useState(false);
    const isLoading = externalLoading ?? internalLoading;

    const execute = useCallback(async () => {
        if (isLoading) return;
        setInternalLoading(true);
        try {
            await action();
        } finally {
            setInternalLoading(false);
        }
    }, [action, isLoading]);

    return { isLoading, execute };
}
