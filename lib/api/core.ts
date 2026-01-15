import { firebaseAuth } from '@/lib/auth/firebaseClient';
import { onAuthStateChanged } from 'firebase/auth';

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export const A2A_API_BASE = process.env.NEXT_PUBLIC_A2A_API_URL || 'http://localhost:8100';

// Custom error class to carry API error details
export class APIError extends Error {
    status: number;
    statusText: string;
    detail: string | null;

    constructor(status: number, statusText: string, detail: string | null = null) {
        const message = detail
            ? `${status}: ${detail}`
            : `API Error: ${status} ${statusText}`;
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.statusText = statusText;
        this.detail = detail;
    }
}

// One-time promise that resolves when Firebase auth state is initialized
let authReadyPromise: Promise<void> | null = null;

function getAuthReadyPromise(): Promise<void> {
    if (!authReadyPromise) {
        authReadyPromise = new Promise((resolve) => {
            const unsubscribe = onAuthStateChanged(firebaseAuth, () => {
                unsubscribe();
                resolve();
            });
        });
    }
    return authReadyPromise;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    try {
        // Wait for Firebase auth to be initialized before checking currentUser
        await getAuthReadyPromise();
        const currentUser = firebaseAuth.currentUser;
        if (currentUser) {
            const idToken = await currentUser.getIdToken();
            headers['Authorization'] = `Bearer ${idToken}`;
        }
    } catch (error) {
        console.warn('Failed to get Firebase auth token:', error);
    }

    return headers;
}

export async function fetchAPI<T>(endpoint: string, options?: RequestInit, baseUrl: string = API_BASE): Promise<T> {
    const authHeaders = await getAuthHeaders();

    const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers: {
            ...authHeaders,
            ...options?.headers,
        },
    });

    if (!response.ok) {
        // Try to parse error body for detail message
        let detail: string | null = null;
        try {
            const errorBody = await response.json();
            // Handle FastAPI's standard error format: { "detail": "..." }
            if (errorBody && typeof errorBody.detail === 'string') {
                detail = errorBody.detail;
            } else if (errorBody && typeof errorBody.message === 'string') {
                detail = errorBody.message;
            } else if (errorBody && typeof errorBody.error === 'string') {
                detail = errorBody.error;
            }
        } catch {
            // Response body wasn't JSON or couldn't be parsed
        }
        throw new APIError(response.status, response.statusText, detail);
    }

    return response.json();
}

export function buildQueryString(params: Record<string, unknown>): string {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, String(value));
        }
    }
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
}
