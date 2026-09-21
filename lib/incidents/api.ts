import { apiRequest } from "@/lib/http";
import type {
  AddNotePayload,
  ChangeStatusPayload,
  CreateIncidentPayload,
  Incident,
  IncidentFilters,
  IncidentListItem,
  IncidentNote,
  IncidentStats,
  Paginated,
  UpdateIncidentPayload,
} from "@/lib/incidents/types";

export async function fetchIncidents(
  filters?: IncidentFilters
): Promise<Paginated<IncidentListItem>> {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.page) params.set("page", String(filters.page));
  const qs = params.toString();
  return apiRequest<Paginated<IncidentListItem>>(`/api/v1/incidents/${qs ? `?${qs}` : ""}`);
}

export async function fetchIncident(id: string): Promise<Incident> {
  return apiRequest<Incident>(`/api/v1/incidents/${id}/`);
}

export async function createIncident(payload: CreateIncidentPayload): Promise<Incident> {
  return apiRequest<Incident>(`/api/v1/incidents/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateIncident(
  id: string,
  payload: UpdateIncidentPayload
): Promise<IncidentListItem> {
  return apiRequest<IncidentListItem>(`/api/v1/incidents/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function addIncidentNote(
  id: string,
  payload: AddNotePayload
): Promise<IncidentNote> {
  return apiRequest<IncidentNote>(`/api/v1/incidents/${id}/notes/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function changeIncidentStatus(
  id: string,
  payload: ChangeStatusPayload
): Promise<Incident> {
  return apiRequest<Incident>(`/api/v1/incidents/${id}/status/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchIncidentStats(): Promise<IncidentStats> {
  return apiRequest<IncidentStats>(`/api/v1/incidents/stats/`);
}
