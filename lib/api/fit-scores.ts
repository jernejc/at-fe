import { fetchAPI, buildQueryString } from './core';
import type {
    PaginatedResponse,
    FitScore,
    FitScoreSummary,
    FitCacheHealth,
    FitCalculateRequest,
    FitCalculateResponse,
} from '../schemas';

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

export async function getFitBreakdown(domain: string, productId: number): Promise<FitScore> {
    const response = await fetchAPI<{ fit: FitScore }>(`/api/v1/companies/${encodeURIComponent(domain)}/fits/${productId}/breakdown`);
    return response.fit;
}

export async function calculateFits(request: FitCalculateRequest = {}): Promise<FitCalculateResponse> {
    return fetchAPI<FitCalculateResponse>('/api/v1/fits/calculate', {
        method: 'POST',
        body: JSON.stringify(request),
    });
}
