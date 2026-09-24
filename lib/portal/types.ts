// Types for the customer-safe translation layer. Nothing here should ever
// carry an internal-only field (risk_score, sla_due_at, rule_id, analyst
// identity) — see lib/portal/customer-view.ts for what strips those out.

export type CustomerPosture = "protected" | "monitoring" | "active_incident";

export type CustomerTimelineEntryType = "opened" | "update" | "escalation" | "resolution";

export interface CustomerTimelineEntry {
  id: string;
  type: CustomerTimelineEntryType;
  message: string;
  created_at: string;
}
