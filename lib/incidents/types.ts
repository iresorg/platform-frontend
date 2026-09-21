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

// Full serializer — what GET/POST/PATCH /incidents/{id}/ returns.
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
  source_type?: IncidentSourceType;
  severity?: IncidentSeverity;
  status?: IncidentStatus;
  agent_id?: string;
  agent_name?: string;
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
