import { fetchAPI, buildQueryString } from './core';
import type {
    PaginatedResponse,
    EmployeeSummaryWithWeight,
    EmployeeDetailResponse,
    EmployeeFilters,
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

