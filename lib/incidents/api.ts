import { apiRequest } from "@/lib/http";
import type {
  AddNotePayload,
  CaseVerdict,
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
  RelatedEvent,
  TimelineParams,
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
  if (filters?.severity) params.set("severity", filters.severity);
  if (filters?.source_type) params.set("source_type", filters.source_type);
  if (filters?.agent_id) params.set("agent_id", filters.agent_id);
  if (filters?.search) params.set("search", filters.search);
  if (filters?.page) params.set("page", String(filters.page));
  if (filters?.page_size) params.set("page_size", String(filters.page_size));
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

// Assigns to the given analyst, or to the caller when userId is omitted
// ("reassign to self" per the endpoint's own description). Returns the
// full case, so the caller can just replace its cached copy.
export async function assignIncident(id: string, userId?: string): Promise<Incident> {
  return apiRequest<Incident>(`/api/v1/incidents/${id}/assign/`, {
    method: "POST",
    body: JSON.stringify(userId ? { user_id: userId } : {}),
  });
}

// Bumps the case to the next severity tier and marks it INVESTIGATING —
// it does not add a distinct "escalated" status (there isn't one).
export async function escalateIncident(id: string, reason: string): Promise<Incident> {
  return apiRequest<Incident>(`/api/v1/incidents/${id}/escalate/`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

// Sets the analyst verdict and the customer-visible guidance in one call.
// Live-confirmed to work even though the generated PATCH request schema
// in the API docs only lists {status, resolution_summary} — the backend
// accepts and persists these two as well, each logging its own timeline
// event ("Verdict set to...", "Customer guidance updated").
export async function updateIncidentVerdict(
  id: string,
  payload: { verdict?: CaseVerdict; customer_guidance?: string }
): Promise<Incident> {
  return apiRequest<Incident>(`/api/v1/incidents/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

// The complete unparsed Wazuh document. Analyst-only; a manually-created
// case (no Wazuh alert behind it) returns {}. The same content usually
// arrives inline as Incident.raw_document, so this is a fallback for the
// cases where that came back empty.
export async function fetchIncidentRaw(id: string): Promise<Record<string, unknown>> {
  return apiRequest<Record<string, unknown>>(`/api/v1/incidents/${id}/raw/`);
}

export async function fetchIncidentStats(): Promise<IncidentStats> {
  return apiRequest<IncidentStats>(`/api/v1/incidents/stats/`);
}

export async function fetchIncidentTimeline(
  id: string,
  { minutes, scope }: TimelineParams
): Promise<Paginated<RelatedEvent>> {
  const raw = await apiRequest<Paginated<RelatedEvent | Paginated<RelatedEvent>>>(
    `/api/v1/incidents/${id}/timeline/?minutes=${minutes}&scope=${scope}`
  );
  return {
    ...raw,
    results: raw.results.flatMap((entry) => ("results" in entry ? entry.results : [entry])),
  };
}
