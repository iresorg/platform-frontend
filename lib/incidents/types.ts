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
  | "VULNERABILITY"
  | "ENRICHMENT_REVIEW"
  | "MANUAL";

export type IncidentSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

// "NEW" joined the backend's status enum alongside the existing four — a
// case that hasn't been touched yet may now arrive as either "NEW" or
// "OPEN"; treat them the same everywhere (open, unassigned-looking).
export type IncidentStatus = "NEW" | "OPEN" | "INVESTIGATING" | "RESOLVED" | "CLOSED";

// The three values the backend's `verdict` field actually holds — set via
// PATCH alongside customer_guidance now that both are real, writable
// fields (confirmed live; the generated OpenAPI request schema for PATCH
// is under-documented and doesn't list them, but the backend accepts and
// persists them, logging its own timeline events for each).
export type CaseVerdict = "TRUE_POSITIVE" | "FALSE_POSITIVE" | "BENIGN";

// What GET /incidents/ (and /cases/) returns per row. The schema calls the
// list "compact", but live rows carry the full triage fields — SLA, intel
// score, occurrence count — so the queue needs no per-row detail fetch.
export interface IncidentListItem {
  id: string;
  title: string;
  summary?: string;
  source_type: IncidentSourceType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  agent_id: string;
  agent_name: string;
  rule_id?: string;
  dedupe_key?: string;
  occurrence_count?: number;
  intel_score?: number;
  event_time?: string | null;
  last_seen_at?: string | null;
  sla_due_at?: string | null;
  // Free-form on the backend ("any?"); see lib/incidents/enrichment.ts.
  opencti_enrichment?: unknown;
  assigned_to_email: string;
  created_at: string;
  updated_at: string;
}

export interface IncidentNote {
  id: string;
  author_email: string;
  // Groups notes into timeline kinds (created, enriched, assigned...).
  // Empty on older records, so callers must cope with "".
  event_type?: string;
  content: string;
  payload?: unknown;
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
  opencti_enrichment?: unknown;
  raw_alert_ref?: unknown;
  external_alert_id?: string | null;
  // Real, writable fields as of the /portal + /metrics backend update —
  // no longer overloading resolution_summary for the customer-visible
  // text. customer_guidance is what /portal/cases exposes to the client;
  // resolution_summary is kept only for older cases that still carry it.
  verdict?: CaseVerdict | "";
  customer_guidance?: string;
  // Full Wazuh _source document — same content as GET .../raw/, included
  // inline now so the raw-event card doesn't need a second request unless
  // this comes back empty (e.g. a manually-created case).
  raw_document?: Record<string, unknown> | null;
  acknowledged_at?: string | null;
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
  severity?: IncidentSeverity;
  source_type?: IncidentSourceType;
  agent_id?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

// GET /cases/{id}/timeline/ — other Wazuh events on the same endpoint (or
// the whole customer) around the case's event_time.
export interface RelatedEvent {
  timestamp: string;
  rule_id: string;
  rule_level: number;
  rule_description: string;
  rule_groups: string[];
  agent_id: string;
  agent_name: string;
  full_log?: string;
}

export type TimelineScope = "agent" | "customer";

export interface TimelineParams {
  minutes: 15 | 30 | 60;
  scope: TimelineScope;
}
