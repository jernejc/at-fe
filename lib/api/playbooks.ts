import { fetchAPI } from './core';
import type {
    PlaybookRead,
    CompanyPlaybooksResponse,
} from '../schemas';

export async function getCompanyPlaybooks(domain: string): Promise<CompanyPlaybooksResponse> {
    return fetchAPI<CompanyPlaybooksResponse>(`/api/v1/companies/${encodeURIComponent(domain)}/playbooks`);
}

/** Response from the async playbook generation endpoint. */
export interface AsyncPlaybookResponse {
    task_id: string;
    status: string;
    poll_url: string;
    stream_url: string;
    is_existing: boolean;
}

/**
 * Kick off async playbook generation. Returns immediately with a task ID and stream URL.
 * @param domain - Company domain
 * @param productId - Target product ID
 */
export async function generateCompanyPlaybookAsync(
    domain: string,
    productId: number
): Promise<AsyncPlaybookResponse> {
    return fetchAPI<AsyncPlaybookResponse>(
        `/api/async/v1/companies/${encodeURIComponent(domain)}/generate-playbook`,
        {
            method: 'POST',
            body: JSON.stringify({ product_id: productId }),
        }
    );
}

export async function getCompanyPlaybook(_domain: string, playbookId: number): Promise<PlaybookRead> {
    // Note: domain parameter kept for API compatibility but playbooks are fetched by ID directly
    return fetchAPI<PlaybookRead>(`/api/v1/playbooks/${playbookId}`);
}

