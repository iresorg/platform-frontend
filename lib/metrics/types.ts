// GET /metrics/overview, /metrics/trend, /metrics/top-endpoints — hit
// Postgres directly, real-time aggregates rather than a count over one
// paginated page of /cases. None of these have a documented response
// schema in the OpenAPI spec (auto-gen didn't pick up a serializer), so
// every field here is confirmed against a live call instead.

export interface MetricsSeverityCount {
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  count: number;
}

export interface MetricsOverview {
  unassigned: number;
  near_sla_breach: number;
  critical: number;
  // No customer/tenant could be resolved for these — an agent
  // misconfiguration, not a security event. See the queue's "Unmapped" tile.
  no_customer: number;
  by_severity: MetricsSeverityCount[];
  // Beyond what the screens guide specified, confirmed live — kept
  // optional since nothing here depends on them yet.
  enriched_share?: number;
  endpoints?: { active: number; total: number };
}

export interface MetricsTrendPoint {
  date: string;
  created: number;
  resolved: number;
}

export interface MetricsTopEndpoint {
  agent_id: string;
  agent_name: string;
  customer_name: string;
  open_cases: number;
}
