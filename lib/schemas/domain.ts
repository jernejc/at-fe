// Domain result schema

import type { CompanyRead } from './company';
import type { EmployeeSummary } from './employee';

export interface DomainResult {
    domain: string;
    company: CompanyRead;
    employees: EmployeeSummary[];
    employees_total: number;
    posts_total: number;
    jobs_total: number;
    news_total: number;
}
