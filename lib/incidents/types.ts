// Duplicated from lib/alerts/types.ts rather than imported, to avoid a
// circular type-only import (alerts re-exports Incident from here since
// escalating an alert returns one).
export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type IncidentSourceType =
  | "ENDPOINT_VISIBILITY_DROP"
  | "ALERT_ESCALATION"
  | "MANUAL";

export type IncidentSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type IncidentStatus = "OPEN" | "INVESTIGATING" | "RESOLVED" | "CLOSED";

// Compact serializer — what GET /incidents/ (list) returns per row.
export interface IncidentListItem {
  id: string;
  title: string;
  source_type: IncidentSourceType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  agent_id: string;
  agent_name: string;
  assigned_to_email: string;
  created_at: string;
  updated_at: string;
}

export interface IncidentNote {
  id: string;
  author_email: string;
  content: string;
  created_at: string;
}

// Full serializer — what GET /incidents/{id}/ returns. PATCH returns a
// second, richer shape (PatchIncidentResponse below) carrying fields
// (rule_id, intel_score, sla_due_at, ...) this GET sample didn't include —
// unclear whether GET simply predates them or they're PATCH-only, so
// they're modeled as optional here too rather than assumed absent.
export interface Incident {
  id: string;
  title: string;
  description: string;
  source_type: IncidentSourceType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  agent_id: string;
  agent_name: string;
  assigned_to_email: string;
  related_alert: string | null;
  notes: IncidentNote[];
  resolved_at: string | null;
  resolution_summary: string;
  created_at: string;
  updated_at: string;
  // Wazuh/OpenCTI enrichment fields — confirmed only from the PATCH
  // response sample. Render conditionally; don't assume presence.
  summary?: string;
  rule_id?: string;
  dedupe_key?: string;
  occurrence_count?: number;
  intel_score?: number;
  event_time?: string | null;
  last_seen_at?: string | null;
  sla_due_at?: string | null;
  opencti_enrichment?: string;
  // Seen live on GET after a PATCH, in neither documented sample.
  external_alert_id?: string | null;
  raw_alert_ref?: string | null;
}

// POST /incidents/ — confirmed live to return only these 7 fields, even
// leaner than the documented sample (which also showed status,
// assigned_to_email and created_at; live omits all three). Callers that
// need the full record should fetch it by id after creating.
export interface CreateIncidentResponse {
  id: string;
  title: string;
  description: string;
  source_type: IncidentSourceType;
  severity: IncidentSeverity;
  agent_id: string;
  agent_name: string;
  status?: IncidentStatus;
  assigned_to_email?: string;
  created_at?: string;
}

// PATCH /incidents/{id}/ returns this shape, distinct from GET's — it
// adds the enrichment fields above and drops notes/related_alert. Treat
// as a partial update to whatever's already cached, not a full replacement.
export interface PatchIncidentResponse {
  id: string;
  title: string;
  summary: string;
  source_type: IncidentSourceType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  agent_id: string;
  agent_name: string;
  rule_id: string;
  dedupe_key: string;
  occurrence_count: number;
  intel_score: number;
  event_time: string | null;
  last_seen_at: string | null;
  sla_due_at: string | null;
  opencti_enrichment: string;
  assigned_to_email: string;
  created_at: string;
  updated_at: string;
}


export interface IncidentStats {
  total_incidents: number;
  open_incidents: number;
  investigating_incidents: number;
  resolved_incidents: number;
  closed_incidents: number;
  visibility_drop_incidents: number;
}

export interface CreateIncidentPayload {
  title: string;
  description: string;
  source_type: IncidentSourceType;
  severity: IncidentSeverity;
  agent_id: string;
  agent_name: string;
}

export interface UpdateIncidentPayload {
  title?: string;
  summary?: string;
  source_type?: IncidentSourceType;
  severity?: IncidentSeverity;
  status?: IncidentStatus;
  agent_id?: string;
  agent_name?: string;
  rule_id?: string;
  dedupe_key?: string;
  occurrence_count?: number;
  intel_score?: number;
  event_time?: string | null;
  last_seen_at?: string | null;
  sla_due_at?: string | null;
}

export interface AddNotePayload {
  content: string;
}

export interface ChangeStatusPayload {
  status: IncidentStatus;
  resolution_summary?: string;
}

export interface IncidentFilters {
  status?: IncidentStatus;
  page?: number;
}
