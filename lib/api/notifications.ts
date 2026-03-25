/**
 * Notification API module.
 *
 * Endpoints:
 *   GET  /api/v1/notifications/unread-count  → UnreadCountResponse
 *   GET  /api/v1/notifications?page_size=N   → PaginatedResponse<Notification>
 *   PATCH /api/v1/notifications/{id}          → void (mark single read)
 *   POST  /api/v1/notifications/mark-all-read → void
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

/** Mark a single notification as read. */
export async function markNotificationRead(notificationId: number): Promise<void> {
    return fetchAPI<void>(`/api/v1/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
    });
}

/** Mark all notifications as read for the current user. */
export async function markAllRead(): Promise<void> {
    return fetchAPI<void>('/api/v1/notifications/mark-all-read', { method: 'POST' });
}
