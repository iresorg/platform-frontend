import { apiRequest } from "@/lib/http";
import type { MarkReadResponse, Notification, UnreadCountResponse } from "@/lib/notifications/types";

export async function fetchNotifications(params?: { is_read?: boolean }): Promise<Notification[]> {
  const qs = params?.is_read === undefined ? "" : `?is_read=${params.is_read}`;
  return apiRequest<Notification[]>(`/api/v1/notifications/${qs}`);
}

export async function fetchUnreadCount(): Promise<UnreadCountResponse> {
  return apiRequest<UnreadCountResponse>("/api/v1/notifications/unread-count/");
}

export async function markNotificationRead(id: string): Promise<MarkReadResponse> {
  return apiRequest<MarkReadResponse>(`/api/v1/notifications/${id}/read/`, { method: "POST" });
}

export async function markAllNotificationsRead(): Promise<MarkReadResponse> {
  return apiRequest<MarkReadResponse>("/api/v1/notifications/mark-all-read/", { method: "POST" });
}
