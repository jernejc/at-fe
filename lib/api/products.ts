import { fetchAPI, buildQueryString } from './core';
import type {
    PaginatedResponse,
    ProductSummary,
    ProductRead,
    ProductCreate,
    ProductUpdate,
    ProductFitResponse,
    ProductCandidatesResponse,
    CompanyFitComparisonResponse,
} from '../schemas';

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
    },
    requestOptions?: RequestInit
): Promise<ProductCandidatesResponse> {
    const query = buildQueryString(options || {});
    return fetchAPI<ProductCandidatesResponse>(
        `/api/v1/products/${productId}/candidates${query}`,
        requestOptions
    );
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
