import { fetchAPI, API_BASE } from './core';
import type { DataDepth } from '../schemas';

export interface ProcessingOptions {
    refresh_data?: boolean;
    include_posts?: boolean;
    include_employees?: boolean;
    include_jobs?: boolean;
    full_details?: boolean; // Maps to target_depth='detailed' + all includes
    target_depth?: DataDepth | null;
    generate_signals?: boolean;
    generate_fits?: boolean;
    generate_playbook?: boolean;
    product_id?: number | null;
    max_employees?: number | null;
    use_a2a?: boolean;
    force?: boolean; // Alias for refresh_data for backward compat
}

export async function startProcessing(domain: string, options?: ProcessingOptions): Promise<{ process_id: string; status: string }> {
    // Map options to API schema
    const payload = {
        include_posts: options?.include_posts,
        include_employees: options?.include_employees,
        include_jobs: options?.include_jobs,
        max_employees: options?.max_employees,
        refresh_data: (options?.refresh_data || options?.force) ? true : undefined,
        generate_signals: options?.generate_signals ?? true,
        generate_fits: options?.generate_fits ?? true,
        generate_playbook: options?.generate_playbook ?? false,
        target_depth: options?.target_depth || (options?.full_details ? 'detailed' : null),
        product_id: options?.product_id,
        use_a2a: options?.use_a2a ?? false,
    };

    return fetchAPI(`/api/v1/companies/${encodeURIComponent(domain)}/process`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

/**
 * Wait for a processing job to complete by listening to its SSE stream.
 * Returns a promise that resolves when processing is complete, or rejects on error.
 */
export function waitForProcessingComplete(
    domain: string,
    processId: string,
    onProgress?: (message: string) => void
): Promise<void> {
    return new Promise((resolve, reject) => {
        const streamPath = `/api/v1/companies/${encodeURIComponent(domain)}/process/${encodeURIComponent(processId)}/stream`;
        const evtSource = new EventSource(`${API_BASE}${streamPath}`);

        const cleanup = () => {
            evtSource.close();
        };

        evtSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                const eventType = (data.type || '').toLowerCase();
                const status = (data.status || '').toLowerCase();

                // Report progress if callback provided
                if (onProgress) {
                    const message = data.message || data.status || 'Processing...';
                    onProgress(message);
                }

                // Handle completion
                if (eventType === 'complete' || status === 'completed' || status === 'done') {
                    cleanup();
                    resolve();
                    return;
                }

                // Handle error
                if (eventType === 'error' || status === 'error') {
                    cleanup();
                    reject(new Error(data.error || data.message || 'Processing failed'));
                    return;
                }
            } catch {
                // Non-JSON message, check for string patterns
                const rawMessage = event.data.replace(/^"|"$/g, '');
                const lowerMsg = rawMessage.toLowerCase();

                if (onProgress) {
                    onProgress(rawMessage);
                }

                if (lowerMsg.includes('completed') || rawMessage === 'completed') {
                    cleanup();
                    resolve();
                    return;
                }

                if (lowerMsg.includes('failed') || lowerMsg.includes('error')) {
                    cleanup();
                    reject(new Error(rawMessage));
                    return;
                }
            }
        };

        evtSource.onerror = (err) => {
            // EventSource fires error when connection closes, which may be normal
            // Only treat as error if we haven't resolved yet
            console.warn('SSE connection error or closed:', err);
            cleanup();
            // We don't reject here because the connection may close after completion
            // If we need to handle real errors, we should track state
        };
    });
}
