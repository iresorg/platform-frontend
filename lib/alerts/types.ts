// Shapes for the real backend's Alerts/Incidents API (api/v1/alerts/...).
// Alert status is one of NEW, ACKNOWLEDGED, IN_PROGRESS, RESOLVED,
// DISMISSED (from GET /alerts/stats/) but stays `string` so an unexpected
// value renders instead of breaking.
import type { IncidentSeverity } from "@/lib/incidents/types";

export interface Alert {
  id: string;
  external_id: string;
  rule_id: string;
  rule_level: number;
  rule_description: string;
  rule_groups: string[] | null;
  agent_id: string;
  agent_name: string;
  agent_ip: string;
  status: string;
  detected_at: string;
  created_at: string;
}

export interface AlertDetail extends Alert {
  threat_context: unknown | null;
  raw_payload: unknown | null;
  triage_notes: string | null;
  triaged_by_email: string | null;
  triaged_at: string | null;
  updated_at: string;
}

export interface AlertStats {
  total_alerts: number;
  last_24h_count: number;
  severity_distribution: Record<string, number>;
  status_distribution: Record<string, number>;
}

// Canonical Incident shapes live in lib/incidents/types.ts (confirmed
// against the full /api/v1/incidents/ spec) — re-exported here since
// escalating an alert (below) returns one.
export type { Incident, IncidentNote, IncidentSeverity } from "@/lib/incidents/types";

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface TriagePayload {
  status: string;
  notes: string;
}

export interface EscalatePayload {
  title: string;
  severity: IncidentSeverity;
  description: string;
}

export interface AlertFilters {
  status?: string;
  page?: number;
}
