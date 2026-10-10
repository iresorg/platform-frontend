import { apiRequest } from "@/lib/http";
import type { AuditLogEntry } from "@/lib/audit/types";

export async function fetchAuditLogs(): Promise<AuditLogEntry[]> {
  const res = await apiRequest<{ data: AuditLogEntry[] }>("/api/v1/audit/logs");
  return res.data;
}
