import { fetchAPI, buildQueryString } from './core';
import type { SearchResults } from '../schemas';

export async function searchCompanies(query: string, limit = 20, productId?: number): Promise<SearchResults> {
    const params = buildQueryString({ q: query, entity_type: 'company', limit, product_id: productId });
    return fetchAPI<SearchResults>(`/api/v1/search${params}`);
}

export async function search(query: string, entityType?: 'company' | 'employee' | 'all', limit = 20): Promise<SearchResults> {
    const params = buildQueryString({ q: query, entity_type: entityType, limit });
    return fetchAPI<SearchResults>(`/api/v1/search${params}`);
}
