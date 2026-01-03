import { fetchAPI, buildQueryString } from './core';
import type {
    PaginatedResponse,
    EmployeeSummaryWithWeight,
    EmployeeDetailResponse,
    EmployeeFilters,
    AnalyzeEmployeeResponse,
} from '../schemas';

export async function getEmployees(filters: EmployeeFilters = {}): Promise<PaginatedResponse<EmployeeSummaryWithWeight>> {
    const query = buildQueryString(filters);
    return fetchAPI<PaginatedResponse<EmployeeSummaryWithWeight>>(`/api/v1/employees${query}`);
}

export async function getEmployee(
    employeeId: number,
    options?: { include_posts?: boolean; posts_limit?: number }
): Promise<EmployeeDetailResponse> {
    const query = buildQueryString(options || {});
    return fetchAPI<EmployeeDetailResponse>(`/api/v1/employees/${employeeId}${query}`);
}

export async function analyzeEmployee(employeeId: number, force = false): Promise<AnalyzeEmployeeResponse> {
    return fetchAPI<AnalyzeEmployeeResponse>(`/api/v1/employees/${employeeId}/analyze`, {
        method: 'POST',
        body: JSON.stringify({ force }),
    });
}

export async function getEmployeeByLinkedIn(linkedinId: string): Promise<EmployeeDetailResponse> {
    return fetchAPI<EmployeeDetailResponse>(`/api/v1/employees/by-linkedin/${encodeURIComponent(linkedinId)}`);
}
