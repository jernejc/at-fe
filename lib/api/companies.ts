import { fetchAPI, buildQueryString } from './core';
import type {
    PaginatedResponse,
    CompanySummary,
    CompanySummaryWithFit,
    CompanyDetailResponse,
    CompanyExplainabilityResponse,
    CompanyFilters,
    EmployeeSummary,
    JobPostingSummary,
} from '../schemas';
import type { SignalProvenanceResponse } from '../schemas/provenance';

export async function getCompanies(
    filters: CompanyFilters = {},
    requestOptions?: RequestInit
): Promise<PaginatedResponse<CompanySummary | CompanySummaryWithFit>> {
    const query = buildQueryString(filters);
    return fetchAPI<PaginatedResponse<CompanySummary | CompanySummaryWithFit>>(
        `/api/v1/companies${query}`,
        requestOptions
    );
}

export async function getCompany(
    domain: string,
    options?: { include?: string; employee_limit?: number; product_id?: number }
): Promise<CompanyDetailResponse> {
    const query = buildQueryString(options || {});
    return fetchAPI<CompanyDetailResponse>(`/api/v1/companies/${encodeURIComponent(domain)}${query}`);
}


export async function getCompanyExplainability(domain: string): Promise<CompanyExplainabilityResponse> {
    return fetchAPI<CompanyExplainabilityResponse>(`/api/v1/companies/${encodeURIComponent(domain)}/explainability`);
}

export async function getSignalProvenance(domain: string, signalId: number): Promise<SignalProvenanceResponse> {
    return fetchAPI<SignalProvenanceResponse>(`/api/v1/companies/${encodeURIComponent(domain)}/signals/${signalId}`);
}

export async function getCompanyEmployees(
    domain: string,
    page = 1,
    pageSize = 20,
    filters?: { title_contains?: string; department?: string; is_decision_maker?: boolean; country?: string }
): Promise<PaginatedResponse<EmployeeSummary>> {
    const query = buildQueryString({ page, page_size: pageSize, ...filters });
    return fetchAPI<PaginatedResponse<EmployeeSummary>>(`/api/v1/companies/${encodeURIComponent(domain)}/employees${query}`);
}

export async function getCompanyJobs(
    domain: string,
    page = 1,
    pageSize = 20,
    filters?: { department?: string; is_remote?: boolean }
): Promise<PaginatedResponse<JobPostingSummary>> {
    const query = buildQueryString({ page, page_size: pageSize, ...filters });
    return fetchAPI<PaginatedResponse<JobPostingSummary>>(`/api/v1/companies/${encodeURIComponent(domain)}/jobs${query}`);
}

