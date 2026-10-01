// api/v1/dashboard/... — no response samples were given for any of these
// four; every shape below was instead confirmed live (GET with a working
// token). kpis, protection-status and vulnerability-posture all returned
// real, well-formed objects (zeroed out, since the test tenant has no
// activity). dashboard/endpoints/ returned an empty array, so the shape
// of one *item* is still unknown — DashboardEndpoint is a placeholder
// until a populated response is seen.

export interface DashboardKpis {
  unassigned_cases: number;
  near_sla_breach: number;
  critical: number;
  quarantine_count: number;
  open_total: number;
  // Cases whose customer couldn't be resolved — an agent group is
  // misconfigured, which is an ops problem rather than a security one.
  // Optional in the schema (defaults to 0), absent on some responses.
  no_customer?: number;
}

export interface ProtectionStatus {
  protection_status: string;
  open_incident_count: number;
  open_case_count?: number;
}

// Keys observed Title-cased, not lowercase like other enums in this API.
export interface SeverityCounts {
  Critical: number;
  High: number;
  Medium: number;
  Low: number;
}

export type VulnerabilityPosture = SeverityCounts & { total?: number };

// CONFIRMED — a per-tenant endpoint-coverage summary, not a per-device
// list as first guessed. The sample response was doubly-nested
// ([[{...}]]) while a live probe on an empty tenant returned a flat [] —
// the api layer normalizes both shapes to a flat array, since which one
// is real (or whether it varies) isn't settled yet.
export interface EndpointCoverage {
  tenant_id: string;
  // The schema also returns these; older responses omit them.
  customer_id?: string;
  tenant_name?: string;
  tenant_slug?: string;
  active: number;
  total: number;
}
