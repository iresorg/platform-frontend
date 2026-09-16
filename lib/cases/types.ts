export type CaseStatus = "new" | "investigating" | "escalated" | "resolved";

export type VerdictClassification =
  | "true_positive"
  | "false_positive"
  | "benign";

export interface AssignedAnalyst {
  id: string;
  name: string;
}

export interface CaseVerdict {
  classification: VerdictClassification;
  notes: string;
  customer_guidance: string;
}

export interface OpenCtiEnrichment {
  is_enriched: boolean;
  malware_family?: string;
  confidence?: number;
  threat_actor?: string;
  indicators?: string[];
}

export interface RawAlertRef {
  agent_id: string;
  agent_name: string;
  rule_id: string;
  full_log: string;
}

export interface Case {
  id: string;
  customer_id: string;
  customer_name: string;
  source: string;
  severity: number;
  status: CaseStatus;
  assigned_analyst: AssignedAnalyst | null;
  title: string;
  summary: string;
  sla_due_at: string;
  created_at: string;
  verdict: CaseVerdict | null;
  opencti_enrichment: OpenCtiEnrichment | null;
  raw_alert_ref: RawAlertRef;
}

export type CaseEventType =
  | "status_change"
  | "assignment"
  | "escalation"
  | "note"
  | "verdict";

export interface CaseEvent {
  id: string;
  case_id: string;
  type: CaseEventType;
  message: string;
  actor_name: string;
  created_at: string;
}

export interface CaseFilters {
  status?: CaseStatus;
  severityMin?: number;
  severityMax?: number;
  customerId?: string;
}
