import { fetchAPI, buildQueryString } from './core';
import type {
    PaginatedResponse,
    PlaybookSummary,
    PlaybookRead,
    PlaybookFilters,
    PlaybookRegenerateResponse,
    BulkPlaybookGenerationResponse,
    CompanyPlaybooksResponse,
} from '../schemas';

export async function getPlaybooks(filters: PlaybookFilters = {}): Promise<PaginatedResponse<PlaybookSummary>> {
    const query = buildQueryString(filters);
    return fetchAPI<PaginatedResponse<PlaybookSummary>>(`/api/v1/playbooks${query}`);
}

export async function getPlaybook(playbookId: number): Promise<PlaybookRead> {
    return fetchAPI<PlaybookRead>(`/api/v1/playbooks/${playbookId}`);
}

export async function deletePlaybook(playbookId: number): Promise<void> {
    await fetchAPI<void>(`/api/v1/playbooks/${playbookId}`, {
        method: 'DELETE',
    });
}

export async function getCompanyPlaybooks(domain: string): Promise<CompanyPlaybooksResponse> {
    return fetchAPI<CompanyPlaybooksResponse>(`/api/v1/companies/${encodeURIComponent(domain)}/playbooks`);
}

export async function generateCompanyPlaybook(
    domain: string,
    productId: number
): Promise<{ process_id: string; status: string }> {
    return fetchAPI(`/api/v1/companies/${encodeURIComponent(domain)}/generate-playbook`, {
        method: 'POST',
        body: JSON.stringify({ product_id: productId }),
    });
}

export async function getCompanyPlaybook(_domain: string, playbookId: number): Promise<PlaybookRead> {
    // Note: domain parameter kept for API compatibility but playbooks are fetched by ID directly
    return fetchAPI<PlaybookRead>(`/api/v1/playbooks/${playbookId}`);
}

export async function generatePlaybooks(
    domain: string,
    options?: { product_groups?: string[]; force?: boolean }
): Promise<PlaybookRegenerateResponse> {
    return fetchAPI<PlaybookRegenerateResponse>(`/api/v1/playbooks/company/${encodeURIComponent(domain)}/generate`, {
        method: 'POST',
        body: JSON.stringify(options || {}),
    });
}

export async function generatePlaybooksBulk(
    productId: number,
    options?: { limit?: number; min_fit_score?: number; force?: boolean }
): Promise<BulkPlaybookGenerationResponse> {
    const query = buildQueryString({ product_id: productId, ...options });
    return fetchAPI<BulkPlaybookGenerationResponse>(`/api/v1/playbooks/bulk/generate${query}`, {
        method: 'POST',
    });
}
