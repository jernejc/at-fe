// Search-related schemas

import type { CompanySummary } from './company';
import type { EmployeeSummary } from './employee';

export interface SearchResults {
    query: string;
    total_results: number;
    companies: CompanySummary[];
    employees: EmployeeSummary[];
}
