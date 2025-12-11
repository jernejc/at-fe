// API Client for Company Intelligence API

export const API_BASE = 'http://localhost:8000';

// Import types needed for API functions
import type {
    PaginatedResponse,
    CompanySummary,
    CompanySummaryWithFit,
    CompanyRead,
    CompanyDetailResponse,
    CompanyFilters,
    DomainResult,
    EmployeeSummary,
    EmployeeSummaryWithWeight,
    EmployeeDetailResponse,
    EmployeeWithPosts,
    EmployeeFilters,
    AnalyzeEmployeeResponse,
    JobPostingSummary,
    NewsArticleSummary,
    PostSummary,
    PlaybookSummary,
    PlaybookRead,
    PlaybookFilters,
    PlaybookRegenerateResponse,
    BulkPlaybookGenerationResponse,
    CompanySignalsResponse,
    SignalContributorsResponse,
    SignalCategoriesResponse,
    SignalStatsResponse,
    AggregateResponse,
    FitScore,
    FitScoreSummary,
    FitCacheHealth,
    FitCalculateRequest,
    FitCalculateResponse,
    CompanyFitComparisonResponse,
    StatsResponse,
    SearchResults,
    ProductSummary,
    ProductRead,
    ProductCreate,
    ProductUpdate,
    ProductFitResponse,
    ProductCandidatesResponse,
    CompanyPlaybooksResponse,
} from './schemas';

// ============= API Functions =============

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

function buildQueryString(params: Record<string, unknown>): string {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, String(value));
        }
    }
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
}

// ============= Companies =============

export async function getCompanies(filters: CompanyFilters = {}): Promise<PaginatedResponse<CompanySummary | CompanySummaryWithFit>> {
    const query = buildQueryString(filters);
    return fetchAPI<PaginatedResponse<CompanySummary | CompanySummaryWithFit>>(`/api/v1/companies${query}`);
}

export async function getCompany(
    domain: string,
    options?: { include?: string; employee_limit?: number; product_id?: number }
): Promise<CompanyDetailResponse> {
    const query = buildQueryString(options || {});
    return fetchAPI<CompanyDetailResponse>(`/api/v1/companies/${encodeURIComponent(domain)}${query}`);
}

export async function getCompanyLegacy(
    domain: string,
    options?: { include_employees?: boolean; employee_limit?: number }
): Promise<DomainResult> {
    const query = buildQueryString(options || {});
    return fetchAPI<DomainResult>(`/api/v1/companies/${encodeURIComponent(domain)}${query}`);
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

export async function getCompanyNews(
    domain: string,
    page = 1,
    pageSize = 20,
    filters?: { event_type?: string }
): Promise<PaginatedResponse<NewsArticleSummary>> {
    const query = buildQueryString({ page, page_size: pageSize, ...filters });
    return fetchAPI<PaginatedResponse<NewsArticleSummary>>(`/api/v1/companies/${encodeURIComponent(domain)}/news${query}`);
}

export async function getCompanyPosts(
    domain: string,
    page = 1,
    pageSize = 20
): Promise<PaginatedResponse<PostSummary>> {
    const query = buildQueryString({ page, page_size: pageSize });
    return fetchAPI<PaginatedResponse<PostSummary>>(`/api/v1/companies/${encodeURIComponent(domain)}/posts${query}`);
}

// ============= Employees =============

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

// ============= Signals =============

export async function getSignalCategories(type?: 'interest' | 'event'): Promise<SignalCategoriesResponse> {
    const query = buildQueryString({ type });
    return fetchAPI<SignalCategoriesResponse>(`/api/v1/signals/categories${query}`);
}

export async function getCompanySignals(
    domain: string,
    options?: { min_confidence?: number; type?: 'interest' | 'event' }
): Promise<CompanySignalsResponse> {
    const query = buildQueryString(options || {});
    return fetchAPI<CompanySignalsResponse>(`/api/v1/signals/company/${encodeURIComponent(domain)}${query}`);
}

export async function getSignalContributors(
    domain: string,
    options?: { category?: string; type?: 'interest' | 'event' }
): Promise<SignalContributorsResponse> {
    const query = buildQueryString(options || {});
    return fetchAPI<SignalContributorsResponse>(`/api/v1/signals/company/${encodeURIComponent(domain)}/contributors${query}`);
}

export async function aggregateCompanySignals(
    domain: string,
    options?: { max_employees?: number; min_seniority?: string; force?: boolean; reaggregate_only?: boolean }
): Promise<AggregateResponse> {
    return fetchAPI<AggregateResponse>(`/api/v1/signals/company/${encodeURIComponent(domain)}/aggregate`, {
        method: 'POST',
        body: JSON.stringify(options || {}),
    });
}

export async function getSignalStats(): Promise<SignalStatsResponse> {
    return fetchAPI<SignalStatsResponse>('/api/v1/signals/stats');
}

// ============= Fit Scores =============

export async function getFits(filters: {
    page?: number;
    page_size?: number;
    domain?: string;
    product_id?: number;
    min_score?: number;
    min_likelihood?: number;
    min_urgency?: number;
    industry?: string;
    country?: string;
    sort?: string;
} = {}): Promise<PaginatedResponse<FitScoreSummary>> {
    const query = buildQueryString(filters);
    return fetchAPI<PaginatedResponse<FitScoreSummary>>(`/api/v1/fits${query}`);
}

export async function getFitHealth(): Promise<FitCacheHealth> {
    return fetchAPI<FitCacheHealth>('/api/v1/fits/health');
}

export async function getFit(domain: string, productId: number, forceCalculate = false): Promise<FitScore> {
    const query = buildQueryString({ force_calculate: forceCalculate });
    return fetchAPI<FitScore>(`/api/v1/fits/${encodeURIComponent(domain)}/${productId}${query}`);
}

export async function calculateFits(request: FitCalculateRequest = {}): Promise<FitCalculateResponse> {
    return fetchAPI<FitCalculateResponse>('/api/v1/fits/calculate', {
        method: 'POST',
        body: JSON.stringify(request),
    });
}

// ============= Products =============

export async function getProducts(page = 1, pageSize = 20, category?: string): Promise<PaginatedResponse<ProductSummary>> {
    const query = buildQueryString({ page, page_size: pageSize, category });
    return fetchAPI<PaginatedResponse<ProductSummary>>(`/api/v1/products${query}`);
}

export async function getProduct(productId: number): Promise<ProductRead> {
    return fetchAPI<ProductRead>(`/api/v1/products/${productId}`);
}

export async function getProductByName(name: string): Promise<ProductRead> {
    return fetchAPI<ProductRead>(`/api/v1/products/by-name/${encodeURIComponent(name)}`);
}

export async function createProduct(product: ProductCreate): Promise<ProductRead> {
    return fetchAPI<ProductRead>('/api/v1/products', {
        method: 'POST',
        body: JSON.stringify(product),
    });
}

export async function updateProduct(productId: number, product: ProductUpdate): Promise<ProductRead> {
    return fetchAPI<ProductRead>(`/api/v1/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(product),
    });
}

export async function deleteProduct(productId: number): Promise<void> {
    await fetchAPI<void>(`/api/v1/products/${productId}`, {
        method: 'DELETE',
    });
}

export async function calculateProductFit(productId: number, domain: string): Promise<ProductFitResponse> {
    return fetchAPI<ProductFitResponse>(`/api/v1/products/${productId}/fit/${encodeURIComponent(domain)}`);
}

export async function getProductCandidates(
    productId: number,
    options?: {
        page?: number;
        page_size?: number;
        min_fit_score?: number;
        min_urgency_score?: number;
        industry?: string;
        country?: string;
    }
): Promise<ProductCandidatesResponse> {
    const query = buildQueryString(options || {});
    return fetchAPI<ProductCandidatesResponse>(`/api/v1/products/${productId}/candidates${query}`);
}

export async function calculateProductCandidates(
    productId: number,
    options?: { force?: boolean; company_ids?: number[] }
): Promise<{ product_id: number; companies_calculated: number; companies_skipped: number; duration_seconds: number; status: string }> {
    const query = buildQueryString({ force: options?.force, company_ids: options?.company_ids?.join(',') });
    return fetchAPI(`/api/v1/products/${productId}/candidates/calculate${query}`, {
        method: 'POST',
    });
}

export async function compareCompanyFits(domain: string, productIds?: number[]): Promise<CompanyFitComparisonResponse> {
    const query = buildQueryString({ product_ids: productIds?.join(',') });
    return fetchAPI<CompanyFitComparisonResponse>(`/api/v1/products/compare/${encodeURIComponent(domain)}${query}`);
}

// ============= Playbooks =============

export async function getPlaybooks(filters: PlaybookFilters = {}): Promise<PaginatedResponse<PlaybookSummary>> {
    const query = buildQueryString(filters);
    return fetchAPI<PaginatedResponse<PlaybookSummary>>(`/api/v1/playbooks${query}`);
}

export async function getPlaybook(playbookId: number): Promise<PlaybookRead> {
    return fetchAPI<PlaybookRead>(`/api/v1/playbooks/${playbookId}`);
}

export async function deletePlaybook(playbookId: number): Promise<void> {
    await fetchAPI<void>(`/api/v1/playbooks/${playbookId}`, {
        method: 'DELETE',
    });
}

export async function getCompanyPlaybooks(domain: string): Promise<CompanyPlaybooksResponse> {
    return fetchAPI<CompanyPlaybooksResponse>(`/api/v1/playbooks/company/${encodeURIComponent(domain)}`);
}

export async function generatePlaybooks(
    domain: string,
    options?: { product_groups?: string[]; force?: boolean }
): Promise<PlaybookRegenerateResponse> {
    return fetchAPI<PlaybookRegenerateResponse>(`/api/v1/playbooks/company/${encodeURIComponent(domain)}/generate`, {
        method: 'POST',
        body: JSON.stringify(options || {}),
    });
}

export async function generatePlaybooksBulk(
    productId: number,
    options?: { limit?: number; min_fit_score?: number; force?: boolean }
): Promise<BulkPlaybookGenerationResponse> {
    const query = buildQueryString({ product_id: productId, ...options });
    return fetchAPI<BulkPlaybookGenerationResponse>(`/api/v1/playbooks/bulk/generate${query}`, {
        method: 'POST',
    });
}

// ============= Stats =============

export async function getStats(): Promise<StatsResponse> {
    return fetchAPI<StatsResponse>('/api/v1/stats');
}

// ============= Search =============

export async function searchCompanies(query: string, limit = 20): Promise<SearchResults> {
    const params = buildQueryString({ q: query, entity_type: 'company', limit });
    return fetchAPI<SearchResults>(`/api/v1/search${params}`);
}

export async function search(query: string, entityType?: 'company' | 'employee' | 'all', limit = 20): Promise<SearchResults> {
    const params = buildQueryString({ q: query, entity_type: entityType, limit });
    return fetchAPI<SearchResults>(`/api/v1/search${params}`);
}

// ============= Helper Functions =============

export function getScoreCategory(score: number): 'hot' | 'warm' | 'cold' {
    if (score >= 80) return 'hot';
    if (score >= 60) return 'warm';
    return 'cold';
}

export function getScoreLabel(score: number): string {
    const category = getScoreCategory(score);
    return category.charAt(0).toUpperCase() + category.slice(1);
}

export function getUrgencyLabel(urgency: number | null): string {
    if (urgency === null) return 'Unknown';
    if (urgency >= 8) return 'Immediate';
    if (urgency >= 5) return 'Near-term';
    return 'Future';
}

export function formatEmployeeCount(count: number | null): string {
    if (count === null) return 'Unknown';
    if (count >= 10000) return `${Math.floor(count / 1000)}K+`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
}

// Product group definitions
export const PRODUCT_GROUPS = [
    { id: 'gen_ai', name: 'Gen AI / Agentic AI', color: '#8b5cf6' },
    { id: 'database', name: 'Database Modernization / Cloud Infra', color: '#3b82f6' },
    { id: 'collaboration', name: 'Collaboration & Productivity', color: '#10b981' },
] as const;

export type ProductGroupId = typeof PRODUCT_GROUPS[number]['id'];

// ============= A2A =============

export async function getA2ADiagram(): Promise<string> {
    const response = await fetch('https://at-data.cogitech.dev/a2a/diagram');
    if (!response.ok) {
        throw new Error(`Failed to fetch diagram: ${response.status} ${response.statusText}`);
    }
    const text = await response.text();
    // Remove markdown code fences if present, handling potential whitespace
    return text.replaceAll('```mermaid', '').replaceAll('```', '').trim();
}

export async function getA2AHealth(): Promise<any> {
    const response = await fetch('https://at-data.cogitech.dev/a2a/health');
    if (!response.ok) {
        throw new Error(`Failed to fetch health: ${response.status} ${response.statusText}`);
    }
    return response.json();
}

// ============= Processing =============

export interface ProcessingOptions {
    force?: boolean;
    include_posts?: boolean;
    full_details?: boolean;
}

export async function startProcessing(domain: string, options?: ProcessingOptions): Promise<any> {
    const query = buildQueryString((options || {}) as Record<string, unknown>);
    return fetchAPI(`/processing/${encodeURIComponent(domain)}${query}`, {
        method: 'POST',
    });
}
