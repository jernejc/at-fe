import { fetchAPI, buildQueryString, API_BASE, getAuthHeaders } from './core';
import type {
  PaginatedResponse,
  ProductSummary,
  ProductCandidatesResponse,
} from '../schemas';

export async function getProducts(page = 1, pageSize = 20, category?: string): Promise<PaginatedResponse<ProductSummary>> {
  const query = buildQueryString({ page, page_size: pageSize, category });
  return fetchAPI<PaginatedResponse<ProductSummary>>(`/api/v1/products${query}`);
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

/** Export product candidates as an XLSX file. */
export async function exportProductXlsx(productId: number, limit = 100): Promise<Blob> {
  const url = `${API_BASE}/api/v1/products/${productId}/export/xlsx?limit=${limit}&playbooks_only=false`;
  const authHeaders = await getAuthHeaders();
  const response = await fetch(url, { headers: authHeaders });

  if (!response.ok) {
    if (response.status === 401) {
      const freshHeaders = await getAuthHeaders(true);
      const retryResponse = await fetch(url, { headers: freshHeaders });
      if (!retryResponse.ok) throw new Error(`Export failed: ${retryResponse.status}`);
      return retryResponse.blob();
    }
    throw new Error(`Export failed: ${response.status}`);
  }
  return response.blob();
}
