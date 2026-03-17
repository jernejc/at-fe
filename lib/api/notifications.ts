/**
 * Notification API module.
 *
 * Endpoints:
 *   GET  /api/v1/notifications/unread-count  → UnreadCountResponse
 *   GET  /api/v1/notifications?page_size=N   → PaginatedResponse<Notification>
 *   POST /api/v1/notifications/mark-all-read → void
 */

import { fetchAPI, buildQueryString } from './core';
import type { PaginatedResponse, Notification, UnreadCountResponse } from '../schemas';

/** Fetch the number of unread notifications for the current user. */
export async function getUnreadCount(): Promise<UnreadCountResponse> {
    return fetchAPI<UnreadCountResponse>('/api/v1/notifications/unread-count');
}

/** Fetch a page of notifications for the current user. */
export async function getNotifications(pageSize = 25): Promise<PaginatedResponse<Notification>> {
    const query = buildQueryString({ page_size: pageSize });
    return fetchAPI<PaginatedResponse<Notification>>(`/api/v1/notifications${query}`);
}

/** Mark all notifications as read for the current user. */
export async function markAllRead(): Promise<void> {
    return fetchAPI<void>('/api/v1/notifications/mark-all-read', { method: 'POST' });
}
