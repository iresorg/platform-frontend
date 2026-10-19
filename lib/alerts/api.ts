import { apiRequest } from "@/lib/http";
import type {
  Alert,
  AlertDetail,
  AlertFilters,
  AlertStats,
  EscalatePayload,
  Incident,
  Paginated,
  TriagePayload,
} from "@/lib/alerts/types";

export async function fetchAlerts(filters?: AlertFilters): Promise<Paginated<Alert>> {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.page) params.set("page", String(filters.page));
  const qs = params.toString();
  return apiRequest<Paginated<Alert>>(`/api/v1/alerts/${qs ? `?${qs}` : ""}`);
}

export async function fetchAlert(id: string): Promise<AlertDetail> {
  return apiRequest<AlertDetail>(`/api/v1/alerts/${id}/`);
}

export async function fetchAlertStats(): Promise<AlertStats> {
  return apiRequest<AlertStats>(`/api/v1/alerts/stats/`);
}

export async function triageAlert(
  id: string,
  payload: TriagePayload
): Promise<AlertDetail> {
  return apiRequest<AlertDetail>(`/api/v1/alerts/${id}/triage/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function escalateAlert(
  id: string,
  payload: EscalatePayload
): Promise<Incident> {
  return apiRequest<Incident>(`/api/v1/alerts/${id}/escalate/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
