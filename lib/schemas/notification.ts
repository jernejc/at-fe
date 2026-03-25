/** Typed payload for notification data. */
export interface NotificationData {
  partner_id?: number;
  partner_name?: string;
  product_name?: string;
  campaign_name?: string;
  campaign_slug?: string;
  opportunity_count?: number;
}

/** A single notification from the backend. */
export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  data: NotificationData;
  user_id: number;
  campaign_id: number | null;
  read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Response shape for GET /api/v1/notifications/unread-count. */
export interface UnreadCountResponse {
  unread_count: number;
}
