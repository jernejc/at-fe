import { fetchAPI, buildQueryString } from './core';
import type {
    PaginatedResponse,
    PartnerSummary,
    PartnerRead,
    PartnerFilters,
    PartnerBulkAssignResult,
    PartnerAssignmentSummary,
    PartnerCompanyAssignmentCreate,
    PartnerCompanyAssignmentRead,
    PartnerCompanyAssignmentWithCompany,
    PartnerCompanyItem,
    BulkCompanyAssignResult,
    AssignAllResult,
} from '../schemas';

// ============= Partners =============

export async function getPartners(filters: PartnerFilters = {}): Promise<PaginatedResponse<PartnerSummary>> {
    const query = buildQueryString(filters as Record<string, unknown>);
    return fetchAPI<PaginatedResponse<PartnerSummary>>(`/api/v1/partners${query}`);
}

export async function getPartner(idOrSlug: string | number): Promise<PartnerRead> {
    return fetchAPI<PartnerRead>(`/api/v1/partners/${encodeURIComponent(String(idOrSlug))}`);
}

export async function getCampaignPartners(slug: string): Promise<PartnerAssignmentSummary[]> {
    return fetchAPI<PartnerAssignmentSummary[]>(
        `/api/v1/campaigns/${encodeURIComponent(slug)}/partners`
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

/**
 * Remove a partner from a campaign.
 * DELETE /api/v1/campaigns/{slug}/partners/{partner_id}
 */
export async function removeCampaignPartner(
    slug: string,
    partnerId: number
): Promise<void> {
    await fetchAPI<void>(
        `/api/v1/campaigns/${encodeURIComponent(slug)}/partners/${partnerId}`,
        { method: 'DELETE' }
    );
}

/** Assign all campaign companies to partners (server-side round-robin). */
export async function assignAllCompaniesToPartners(
    slug: string,
    options?: { clear_existing?: boolean }
): Promise<AssignAllResult> {
    return fetchAPI<AssignAllResult>(
        `/api/v1/campaigns/${encodeURIComponent(slug)}/partners/assign-all`,
        { method: 'POST', body: JSON.stringify(options ?? {}) }
    );
}

// ============= Partner Companies (cross-campaign) =============

/**
 * List companies assigned to the current partner across all campaigns.
 * GET /api/v1/partners/companies
 */
export async function getPartnerCompanies(params: {
    assigned_since?: string;
    page?: number;
    page_size?: number;
}): Promise<PaginatedResponse<PartnerCompanyItem>> {
    const query = buildQueryString(params as Record<string, unknown>);
    return fetchAPI<PaginatedResponse<PartnerCompanyItem>>(`/api/v1/partners/companies${query}`);
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

