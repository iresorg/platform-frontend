// Shapes for the real /portal/* endpoints. The backend does the Golden
// Rule sanitization server-side now (see each schema's own "must not
// contain" doc comment) — nothing here needs a client-side adapter the
// way the old /incidents-derived Case type did.

import type { IncidentStatus } from "@/lib/incidents/types";

// Same enum the analyst side uses (NEW/OPEN/INVESTIGATING/RESOLVED/CLOSED)
// — the portal doesn't get its own status vocabulary, just its own wording
// for these values. See lib/portal/format.ts.
export type PortalCaseStatus = IncidentStatus;

export interface PortalSeverityCount {
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  count: number;
}

// GET /portal/overview. Response schema wasn't documented in the OpenAPI
// spec (no serializer registered) — confirmed live instead.
export interface PortalOverview {
  protection_status: string;
  open_cases: number;
  by_severity: PortalSeverityCount[];
  endpoints: { active: number; total: number };
  last_incident_at: string | null;
}

// GET /portal/cases row shape (CustomerCaseList) — deliberately thin.
export interface PortalCaseListItem {
  id: string;
  title: string;
  summary: string;
  status: PortalCaseStatus;
  customer_guidance: string;
  agent_name: string;
  event_time: string | null;
  created_at: string;
  updated_at: string;
}

// A single sanitized timeline entry. The backend types this as a free-form
// object (no fixed schema, and a resolved test case came back with an
// empty timeline), so every field is read defensively rather than assumed
// present under one exact name.
export type PortalTimelineEntry = Record<string, unknown>;

// GET /portal/cases/:id (CustomerCaseDetail).
export interface PortalCaseDetail extends PortalCaseListItem {
  timeline: PortalTimelineEntry[];
  resolved_at: string | null;
  acknowledged_at: string | null;
}

// GET /portal/endpoints row (CustomerEndpoint) — a real per-device row,
// unlike the analyst-only aggregate counts on dashboard/endpoints/.
export interface PortalEndpoint {
  id: string;
  name: string;
  ip: string;
  status: string;
  last_seen: string | null;
  open_cases: number;
}

export interface PortalAcknowledgeResponse {
  message: string;
  case_id: string;
  acknowledged_at: string;
}
