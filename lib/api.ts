// API Client for Company Intelligence API

const API_BASE = 'https://at-data.cogitech.dev';

// ============= Re-export all schemas for backward compatibility =============

export type {
    PaginatedResponse,
    Technology,
    Location,
    SocialProfile,
    FundingRound,
    ValidationError,
    HTTPValidationError,
    CompanySummary,
    CompanyRead,
    StatsResponse,
    CompanyFilters,
    DomainResult,
    EmployeeSummary,
    EmployeeRead,
    EmployeeWithPosts,
    WorkExperience,
    Education,
    Certification,
    Publication,
    Patent,
    Award,
    PostSummary,
    JobPostingSummary,
    NewsArticleSummary,
    PlaybookSummary,
    PlaybookRead,
    PlaybookContact,
    PlaybookContactResponse,
    OutreachTemplateResponse,
    CompanyPlaybooksResponse,
    PlaybookFilters,
    CompanySignal,
    CompanySignalResponse,
    CompanySignalsResponse,
    EmployeeSignalResponse,
    EmployeeSignalsListResponse,
    SignalCategoryInfo,
    SignalCategoriesResponse,
    SignalAggregationResponse,
    AggregatedSignal,
    CompanySignalAggregationResult,
    AggregationResultResponse,
    AnalysisStatusResponse,
    ProductSummary,
    ProductRead,
    ProductCreate,
    ProductUpdate,
    ProductInterestWeightSchema,
    ProductEventWeightSchema,
    ProductFitResponse,
    SearchResults,
} from './schemas';

// Import types needed for API functions
import type {
    PaginatedResponse,
    CompanySummary,
    CompanyRead,
    CompanyFilters,
    DomainResult,
    EmployeeSummary,
    JobPostingSummary,
    NewsArticleSummary,
    PostSummary,
    PlaybookSummary,
    PlaybookRead,
    PlaybookFilters,
    CompanySignalsResponse,
    StatsResponse,
    SearchResults,
    ProductSummary,
    ProductRead,
    ProductCreate,
    ProductUpdate,
    ProductFitResponse,
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

// Companies
export async function getCompanies(filters: CompanyFilters = {}): Promise<PaginatedResponse<CompanySummary>> {
    const query = buildQueryString(filters);
    return fetchAPI<PaginatedResponse<CompanySummary>>(`/api/v1/companies${query}`);
}

export async function getCompany(domain: string): Promise<DomainResult> {
    return fetchAPI<DomainResult>(`/api/v1/companies/${encodeURIComponent(domain)}`);
}

export async function getCompanyEmployees(
    domain: string,
    page = 1,
    pageSize = 20
): Promise<PaginatedResponse<EmployeeSummary>> {
    const query = buildQueryString({ page, page_size: pageSize });
    return fetchAPI<PaginatedResponse<EmployeeSummary>>(`/api/v1/companies/${encodeURIComponent(domain)}/employees${query}`);
}

export async function getCompanyJobs(
    domain: string,
    page = 1,
    pageSize = 20
): Promise<PaginatedResponse<JobPostingSummary>> {
    const query = buildQueryString({ page, page_size: pageSize });
    return fetchAPI<PaginatedResponse<JobPostingSummary>>(`/api/v1/companies/${encodeURIComponent(domain)}/jobs${query}`);
}

export async function getCompanyNews(
    domain: string,
    page = 1,
    pageSize = 20
): Promise<PaginatedResponse<NewsArticleSummary>> {
    const query = buildQueryString({ page, page_size: pageSize });
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

// Signals
export async function getCompanySignals(companyId: number): Promise<CompanySignalsResponse> {
    return fetchAPI<CompanySignalsResponse>(`/signals/companies/${companyId}`);
}

// Playbooks
export async function getPlaybooks(filters: PlaybookFilters = {}): Promise<PaginatedResponse<PlaybookSummary>> {
    const query = buildQueryString(filters);
    return fetchAPI<PaginatedResponse<PlaybookSummary>>(`/api/v1/playbooks${query}`);
}

export async function getPlaybook(playbookId: number): Promise<PlaybookRead> {
    return fetchAPI<PlaybookRead>(`/api/v1/playbooks/${playbookId}`);
}

export async function getCompanyPlaybooks(domain: string): Promise<CompanyPlaybooksResponse> {
    return fetchAPI<CompanyPlaybooksResponse>(`/api/v1/playbooks/companies/${encodeURIComponent(domain)}`);
}

// Products
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

// Stats
export async function getStats(): Promise<StatsResponse> {
    return fetchAPI<StatsResponse>('/api/v1/stats');
}

// Search
export async function searchCompanies(query: string, limit = 20): Promise<SearchResults> {
    const params = buildQueryString({ q: query, entity_type: 'company', limit });
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
