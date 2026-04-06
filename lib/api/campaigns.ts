import { fetchAPI, buildQueryString, API_BASE, getAuthHeaders } from './core';
import type {
    PaginatedResponse,
    CampaignSummary,
    CampaignRead,
    CampaignCreate,
    CampaignUpdate,
    CampaignOverview,
    MembershipRead,
    MembershipUpdate,
    BulkAddResult,
    CampaignFilters,
    CampaignCompanyRead,
    ExportFormat,
    GSheetExportResult,
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

export async function publishCampaign(slug: string): Promise<CampaignRead> {
    return fetchAPI<CampaignRead>(`/api/v1/campaigns/${encodeURIComponent(slug)}/publish`, {
        method: 'POST',
    });
}

export async function unpublishCampaign(slug: string): Promise<CampaignRead> {
    return fetchAPI<CampaignRead>(`/api/v1/campaigns/${encodeURIComponent(slug)}/unpublish`, {
        method: 'POST',
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

export async function getCampaignCompanies(
    slug: string,
    options?: {
        page?: number;
        page_size?: number;
        segment?: string;
        status?: string;
        partner_id?: string;
        sort_by?: 'priority' | 'fit_score' | 'created_at' | 'name';
        sort_order?: 'asc' | 'desc';
    }
): Promise<PaginatedResponse<MembershipRead>> {
    const query = buildQueryString(options || {});
    return fetchAPI<PaginatedResponse<MembershipRead>>(`/api/v1/campaigns/${encodeURIComponent(slug)}/companies${query}`);
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

async function fetchCSVExport(url: string): Promise<Blob> {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(url, { headers: authHeaders });

    if (!response.ok) {
        if (response.status === 401) {
            console.warn('Export 401, retrying with fresh token');
            const freshHeaders = await getAuthHeaders(true);
            const retryResponse = await fetch(url, { headers: freshHeaders });
            if (!retryResponse.ok) throw new Error(`Export failed: ${retryResponse.status}`);
            return retryResponse.blob();
        }
        throw new Error(`Export failed: ${response.status}`);
    }
    return response.blob();
}

export async function exportCampaignCSV(slug: string): Promise<Blob> {
    return fetchCSVExport(`${API_BASE}/api/v1/campaigns/${encodeURIComponent(slug)}/export/xlsx`);
}

export async function exportCampaignContactsCSV(slug: string): Promise<Blob> {
    return fetchCSVExport(`${API_BASE}/api/v1/campaigns/${encodeURIComponent(slug)}/export/contacts/xlsx`);
}

/** Export campaign companies in the specified format. */
export async function exportCampaign(slug: string, format: ExportFormat): Promise<Blob | GSheetExportResult> {
    const path = `/api/v1/campaigns/${encodeURIComponent(slug)}/export/${format}`;
    if (format === 'gsheet') {
        return fetchAPI<GSheetExportResult>(path);
    }
    return fetchCSVExport(`${API_BASE}${path}`);
}

/** Export campaign contacts in the specified format. */
export async function exportCampaignContacts(slug: string, format: ExportFormat): Promise<Blob | GSheetExportResult> {
    const path = `/api/v1/campaigns/${encodeURIComponent(slug)}/export/contacts/${format}`;
    if (format === 'gsheet') {
        return fetchAPI<GSheetExportResult>(path);
    }
    return fetchCSVExport(`${API_BASE}${path}`);
}

/** Fetch a single company's membership detail within a campaign. */
export async function getCampaignCompany(
    slug: string,
    domain: string
): Promise<CampaignCompanyRead> {
    return fetchAPI<CampaignCompanyRead>(
        `/api/v1/campaigns/${encodeURIComponent(slug)}/companies/${encodeURIComponent(domain)}`
    );
}

