import { fetchAPI } from './core';
import type { FitScore } from '../schemas';

export async function getFitBreakdown(domain: string, productId: number): Promise<FitScore> {
    const response = await fetchAPI<{ fit: FitScore }>(`/api/v1/companies/${encodeURIComponent(domain)}/fits/${productId}/breakdown`);
    return response.fit;
}
