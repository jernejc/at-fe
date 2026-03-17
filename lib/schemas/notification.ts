/** A single notification from the backend. */
export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown>;
  user_id: number;
  campaign_id: number;
  read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Response shape for GET /api/v1/notifications/unread-count. */
export interface UnreadCountResponse {
  unread_count: number;
}
