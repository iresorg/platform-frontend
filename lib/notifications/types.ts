// GET/POST /api/v1/notifications — per user, not tenant-scoped. The list
// comes back as a plain array (no envelope, no pagination per the spec).

export type NotificationType = "CASE_ASSIGNED" | "CASE_ESCALATED" | "SYSTEM";

export interface Notification {
  id: string;
  notification_type: NotificationType;
  title: string;
  message: string;
  case_id: string | null;
  // The tenant the case belongs to, so a click can switch there first.
  tenant_slug: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface UnreadCountResponse {
  unread_count: number;
}

export interface MarkReadResponse {
  message: string;
  unread_count: number;
}
