"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAuditLogs } from "@/lib/audit/api";

export function useAuditLogsQuery(enabled = true) {
  return useQuery({
    queryKey: ["audit", "logs"] as const,
    queryFn: fetchAuditLogs,
    enabled,
    retry: false,
  });
}
