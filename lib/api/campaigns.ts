import { fetchAPI, buildQueryString, API_BASE } from './core';
import type {
    PaginatedResponse,
    CampaignSummary,
    CampaignRead,
    CampaignCreate,
    CampaignUpdate,
    CampaignOverview,
    CampaignComparison,
    MembershipRead,
    MembershipCreate,
    MembershipUpdate,
    BulkAddResult,
    ProcessResult,
    CampaignExport,
    ImportResult,
    CampaignImport,
    CampaignFilters,
    CampaignFunnel,
} from '../schemas';

export async function getCampaigns(filters: CampaignFilters = {}): Promise<PaginatedResponse<CampaignSummary>> {
    const query = buildQueryString(filters as Record<string, unknown>);
    return fetchAPI<PaginatedResponse<CampaignSummary>>(`/api/v1/campaigns${query}`);
}

export async function getCampaign(slug: string): Promise<CampaignRead> {
    return fetchAPI<CampaignRead>(`/api/v1/campaigns/${encodeURIComponent(slug)}`);
}

export async function createCampaign(data: CampaignCreate): Promise<CampaignRead> {
    return fetchAPI<CampaignRead>('/api/v1/campaigns', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function updateCampaign(slug: string, data: CampaignUpdate): Promise<CampaignRead> {
    return fetchAPI<CampaignRead>(`/api/v1/campaigns/${encodeURIComponent(slug)}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}

export async function deleteCampaign(slug: string): Promise<void> {
    await fetchAPI<void>(`/api/v1/campaigns/${encodeURIComponent(slug)}`, {
        method: 'DELETE',
    });
}

export async function getCampaignOverview(
    slug: string,
    productId?: number
): Promise<CampaignOverview> {
    const query = buildQueryString({ product_id: productId });
    return fetchAPI<CampaignOverview>(`/api/v1/campaigns/${encodeURIComponent(slug)}/overview${query}`);
}

export async function getCampaignComparison(
    slug: string,
    options?: {
        product_id?: number;
        sort_by?: 'fit_score' | 'name' | 'employee_count' | 'industry';
        sort_order?: 'asc' | 'desc';
        limit?: number;
    }
): Promise<CampaignComparison> {
    const query = buildQueryString(options || {});
    return fetchAPI<CampaignComparison>(`/api/v1/campaigns/${encodeURIComponent(slug)}/comparison${query}`);
}

export async function getCampaignCompanies(
    slug: string,
    options?: {
        page?: number;
        page_size?: number;
        segment?: string;
        sort_by?: 'priority' | 'fit_score' | 'created_at' | 'name';
        sort_order?: 'asc' | 'desc';
    }
): Promise<PaginatedResponse<MembershipRead>> {
    const query = buildQueryString(options || {});
    return fetchAPI<PaginatedResponse<MembershipRead>>(`/api/v1/campaigns/${encodeURIComponent(slug)}/companies${query}`);
}

export async function addCompanyToCampaign(
    slug: string,
    data: MembershipCreate
): Promise<MembershipRead> {
    return fetchAPI<MembershipRead>(`/api/v1/campaigns/${encodeURIComponent(slug)}/companies`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function addCompaniesBulk(
    slug: string,
    domains: string[]
): Promise<BulkAddResult> {
    return fetchAPI<BulkAddResult>(`/api/v1/campaigns/${encodeURIComponent(slug)}/companies/bulk`, {
        method: 'POST',
        body: JSON.stringify({ domains }),
    });
}

export async function updateMembership(
    slug: string,
    domain: string,
    data: MembershipUpdate
): Promise<MembershipRead> {
    return fetchAPI<MembershipRead>(`/api/v1/campaigns/${encodeURIComponent(slug)}/companies/${encodeURIComponent(domain)}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}

export async function removeCompanyFromCampaign(
    slug: string,
    domain: string
): Promise<void> {
    await fetchAPI<void>(`/api/v1/campaigns/${encodeURIComponent(slug)}/companies/${encodeURIComponent(domain)}`, {
        method: 'DELETE',
    });
}

export async function exportCampaign(slug: string): Promise<CampaignExport> {
    return fetchAPI<CampaignExport>(`/api/v1/campaigns/${encodeURIComponent(slug)}/export`);
}

export async function exportCampaignCSV(slug: string): Promise<Blob> {
    const response = await fetch(`${API_BASE}/api/v1/campaigns/${encodeURIComponent(slug)}/export/csv`);
    if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`);
    }
    return response.blob();
}

export async function importCampaign(data: CampaignImport): Promise<ImportResult> {
    return fetchAPI<ImportResult>('/api/v1/campaigns/import', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function refreshCampaignStats(
    slug: string,
    productId?: number
): Promise<CampaignRead> {
    const query = buildQueryString({ product_id: productId });
    return fetchAPI<CampaignRead>(`/api/v1/campaigns/${encodeURIComponent(slug)}/refresh-stats${query}`, {
        method: 'POST',
    });
}

export async function processCampaign(
    slug: string,
    options?: {
        use_a2a?: boolean;
        force_reprocess?: boolean;
        product_id?: number;
    }
): Promise<ProcessResult> {
    return fetchAPI<ProcessResult>(`/api/v1/campaigns/${encodeURIComponent(slug)}/process`, {
        method: 'POST',
        body: JSON.stringify(options || {}),
    });
}

export async function getCampaignFunnel(
    slug: string,
    productId?: number
): Promise<CampaignFunnel> {
    const query = buildQueryString({ product_id: productId });
    return fetchAPI<CampaignFunnel>(`/api/v1/campaigns/${encodeURIComponent(slug)}/funnel${query}`);
}
