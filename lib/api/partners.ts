import { fetchAPI, buildQueryString } from './core';
import type {
    PaginatedResponse,
    PartnerSummary,
    PartnerRead,
    PartnerCreate,
    CampaignPartnerRead,
    CampaignPartnerCreate,
    PartnerFilters,
    PartnerBulkAssignResult,
    PartnerSuggestion,
    PartnerAssignmentSummary,
    PartnerCompanyAssignmentCreate,
    PartnerCompanyAssignmentRead,
    PartnerCompanyAssignmentUpdate,
    PartnerCompanyAssignmentWithCompany,
    PartnerCompanyAssignmentWithPartner,
    BulkCompanyAssignResult,
} from '../schemas';

// ============= Partners =============

export async function getPartners(filters: PartnerFilters = {}): Promise<PaginatedResponse<PartnerSummary>> {
    const query = buildQueryString(filters as Record<string, unknown>);
    return fetchAPI<PaginatedResponse<PartnerSummary>>(`/api/v1/partners${query}`);
}

export async function getPartner(idOrSlug: string | number): Promise<PartnerRead> {
    return fetchAPI<PartnerRead>(`/api/v1/partners/${encodeURIComponent(String(idOrSlug))}`);
}

export async function createPartner(data: PartnerCreate): Promise<PartnerRead> {
    return fetchAPI<PartnerRead>('/api/v1/partners', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function getCampaignPartners(slug: string): Promise<PartnerAssignmentSummary[]> {
    return fetchAPI<PartnerAssignmentSummary[]>(
        `/api/v1/campaigns/${encodeURIComponent(slug)}/partners`
    );
}

export async function assignPartnerToCampaign(
    slug: string,
    data: CampaignPartnerCreate
): Promise<CampaignPartnerRead> {
    return fetchAPI<CampaignPartnerRead>(
        `/api/v1/campaigns/${encodeURIComponent(slug)}/partners`,
        { method: 'POST', body: JSON.stringify(data) }
    );
}

export async function bulkAssignPartners(
    slug: string,
    partnerIds: number[],
    assignedBy?: string
): Promise<PartnerBulkAssignResult> {
    return fetchAPI<PartnerBulkAssignResult>(
        `/api/v1/campaigns/${encodeURIComponent(slug)}/partners/bulk`,
        { method: 'POST', body: JSON.stringify({ partner_ids: partnerIds, assigned_by: assignedBy }) }
    );
}

export async function unassignPartnerFromCampaign(slug: string, partnerId: number): Promise<void> {
    await fetchAPI<void>(
        `/api/v1/campaigns/${encodeURIComponent(slug)}/partners/${partnerId}`,
        { method: 'DELETE' }
    );
}

// Get partner suggestions based on company domains
export async function suggestPartnersForCompanies(
    domains: string[],
    limit?: number
): Promise<PartnerSuggestion[]> {
    return fetchAPI<PartnerSuggestion[]>('/api/v1/partners/suggest_for_companies', {
        method: 'POST',
        body: JSON.stringify({ domains, limit }),
    });
}

// ============= Partner-Company Assignments =============

/**
 * List companies assigned to a partner within a campaign
 */
export async function getPartnerAssignedCompanies(
    slug: string,
    partnerId: number,
    status?: string
): Promise<PartnerCompanyAssignmentWithCompany[]> {
    const query = buildQueryString({ status });
    return fetchAPI<PartnerCompanyAssignmentWithCompany[]>(
        `/api/v1/campaigns/${encodeURIComponent(slug)}/partners/${partnerId}/companies${query}`
    );
}

/**
 * Assign a single company to a partner
 */
export async function assignCompanyToPartner(
    slug: string,
    partnerId: number,
    data: PartnerCompanyAssignmentCreate
): Promise<PartnerCompanyAssignmentRead> {
    return fetchAPI<PartnerCompanyAssignmentRead>(
        `/api/v1/campaigns/${encodeURIComponent(slug)}/partners/${partnerId}/companies`,
        { method: 'POST', body: JSON.stringify(data) }
    );
}

/**
 * Bulk assign companies to a partner
 */
export async function bulkAssignCompaniesToPartner(
    slug: string,
    partnerId: number,
    companyIds: number[],
    assignedBy?: string,
    notes?: string
): Promise<BulkCompanyAssignResult> {
    return fetchAPI<BulkCompanyAssignResult>(
        `/api/v1/campaigns/${encodeURIComponent(slug)}/partners/${partnerId}/companies/bulk`,
        { method: 'POST', body: JSON.stringify({ company_ids: companyIds, assigned_by: assignedBy, notes }) }
    );
}

/**
 * Unassign a company from a partner
 */
export async function unassignCompanyFromPartner(
    slug: string,
    partnerId: number,
    companyId: number
): Promise<void> {
    await fetchAPI<void>(
        `/api/v1/campaigns/${encodeURIComponent(slug)}/partners/${partnerId}/companies/${companyId}`,
        { method: 'DELETE' }
    );
}

/**
 * Update assignment metadata (notes, status)
 */
export async function updatePartnerCompanyAssignment(
    slug: string,
    partnerId: number,
    companyId: number,
    data: PartnerCompanyAssignmentUpdate
): Promise<PartnerCompanyAssignmentRead> {
    return fetchAPI<PartnerCompanyAssignmentRead>(
        `/api/v1/campaigns/${encodeURIComponent(slug)}/partners/${partnerId}/companies/${companyId}`,
        { method: 'PATCH', body: JSON.stringify(data) }
    );
}

/**
 * List partners assigned to a company within a campaign
 */
export async function getCompanyAssignedPartners(
    slug: string,
    companyId: number
): Promise<PartnerCompanyAssignmentWithPartner[]> {
    return fetchAPI<PartnerCompanyAssignmentWithPartner[]>(
        `/api/v1/campaigns/${encodeURIComponent(slug)}/companies/${companyId}/partners`
    );
}
