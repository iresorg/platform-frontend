import { apiRequest } from "@/lib/http";
import type {
  AddNotePayload,
  ChangeStatusPayload,
  CreateIncidentPayload,
  CreateIncidentResponse,
  Incident,
  IncidentFilters,
  IncidentListItem,
  IncidentNote,
  IncidentStats,
  Paginated,
  PatchIncidentResponse,
  UpdateIncidentPayload,
} from "@/lib/incidents/types";

// The list sample came back double-wrapped — each entry in the outer
// results array was itself a full {count, next, previous, results}
// page rather than an item, mirroring the same doubly-nested shape seen
// on dashboard/endpoints/. Flattens either shape to a plain item array;
// outer count/next/previous still drive pagination.
function flattenIncidentResults(
  results: (IncidentListItem | Paginated<IncidentListItem>)[]
): IncidentListItem[] {
  return results.flatMap((entry) =>
    "results" in entry ? entry.results : [entry]
  );
}

export async function fetchIncidents(
  filters?: IncidentFilters
): Promise<Paginated<IncidentListItem>> {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.page) params.set("page", String(filters.page));
  const qs = params.toString();
  const raw = await apiRequest<
    Paginated<IncidentListItem | Paginated<IncidentListItem>>
  >(`/api/v1/incidents/${qs ? `?${qs}` : ""}`);
  return { ...raw, results: flattenIncidentResults(raw.results) };
}

export async function fetchIncident(id: string): Promise<Incident> {
  return apiRequest<Incident>(`/api/v1/incidents/${id}/`);
}

export async function createIncident(
  payload: CreateIncidentPayload
): Promise<CreateIncidentResponse> {
  return apiRequest<CreateIncidentResponse>(`/api/v1/incidents/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateIncident(
  id: string,
  payload: UpdateIncidentPayload
): Promise<PatchIncidentResponse> {
  return apiRequest<PatchIncidentResponse>(`/api/v1/incidents/${id}/`, {
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

// Docs show a lean {id, status, resolved_at, resolution_summary} response;
// a live call returned the full Incident instead. Typed as the live
// shape — the query hook merges rather than replaces the cache either way.
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
