import { fetchAPI } from './core';

export interface UserProfile {
    id: number;
    email: string;
    firebase_uid: string;
    user_type: 'pdm' | 'partner';
    partner_id: number | null;
    partner_name: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * Get current user profile. Creates user if doesn't exist.
 * Call this after sign-in to ensure user is created and custom claims are set.
 */
export async function getCurrentUserProfile(): Promise<UserProfile> {
    return fetchAPI<UserProfile>('/api/v1/users/me');
}
