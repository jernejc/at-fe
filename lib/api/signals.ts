import { fetchAPI, buildQueryString } from './core';
import type {
    CompanySignalsResponse,
    SignalContributorsResponse,
    SignalCategoriesResponse,
    SignalStatsResponse,
    AggregateResponse,
} from '../schemas';

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
