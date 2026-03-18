import { fetchAPI, buildQueryString } from './core';
import type { EmployeeDetailResponse } from '../schemas';

export async function getEmployee(
    employeeId: number,
    options?: { include_posts?: boolean; posts_limit?: number }
): Promise<EmployeeDetailResponse> {
    const query = buildQueryString(options || {});
    return fetchAPI<EmployeeDetailResponse>(`/api/v1/employees/${employeeId}${query}`);
}
