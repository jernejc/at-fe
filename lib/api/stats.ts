import { fetchAPI } from './core';
import type { StatsResponse } from '../schemas';

export async function getStats(): Promise<StatsResponse> {
    return fetchAPI<StatsResponse>('/api/v1/stats');
}
