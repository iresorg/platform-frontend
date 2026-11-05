"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CASE_POLL_INTERVAL_MS, REALTIME_MODE } from "@/lib/config";
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications/api";

// No push channel for notifications yet, so the badge polls the cheap
// count endpoint and the list is only fetched when it's opened.
const POLL_REFETCH_INTERVAL = REALTIME_MODE === "poll" ? CASE_POLL_INTERVAL_MS : false;

export const notificationKeys = {
  all: ["notifications"] as const,
  list: ["notifications", "list"] as const,
  unread: ["notifications", "unread"] as const,
  count: ["notifications", "count"] as const,
};

export function useUnreadCountQuery() {
  return useQuery({
    queryKey: notificationKeys.count,
    queryFn: fetchUnreadCount,
    refetchInterval: POLL_REFETCH_INTERVAL,
    retry: false,
  });
}

export function useNotificationsQuery(enabled: boolean) {
  return useQuery({ queryKey: notificationKeys.list, queryFn: () => fetchNotifications(), enabled, retry: false });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: ({ unread_count }) => {
      queryClient.setQueryData(notificationKeys.count, { unread_count });
      void queryClient.invalidateQueries({ queryKey: notificationKeys.list });
    },
  });
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: ({ unread_count }) => {
      queryClient.setQueryData(notificationKeys.count, { unread_count });
      void queryClient.invalidateQueries({ queryKey: notificationKeys.list });
    },
  });
}
