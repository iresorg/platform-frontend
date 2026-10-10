import type { UserRole } from "@/lib/auth/types";

// ---------------------------------------------------------------------
// TIER DERIVATION IS A GUESS. Read this before changing it.
//
// The target build (iRES_Frontend_Screens_and_Data_Guide_Target.md §1)
// specifies five roles — tier1, tier2, admin, tenant_user, tenant_admin —
// as a first-class field the backend returns. As of the current schema
// (checked live, 2026-10-10) GET /me still has no such field: it returns
// a flat `permissions: string[]` built from real, granted permission
// codes (confirmed live: alerts.*, cases.*, incidents.*, assets.*,
// findings.*, reports.*, integrations.*, api_keys.*, audit_logs.view,
// tenant.*, members.*, roles.*) with no tier or user_type attached.
//
// So this derives a best-effort tier from which codes a membership
// happens to hold, the same way the old deriveRole() mapped permissions
// to analyst/customer. It is NOT the same thing as the backend actually
// assigning a tier — two memberships with different real intentions could
// hash to the same tier here if their permission sets look alike, and the
// boundaries (e.g. "resolve as true positive is Tier 2+") aren't enforced
// server-side the way the guide assumes, because the backend doesn't
// split "resolve" by classification at all. Every UI restriction this
// derivation drives must still be read as advisory, not security — see
// the backend asks list for what's actually needed: a real `tier` or
// `user_type` field in GET /me, and permission codes split finely enough
// to tell tier1 and tier2 apart without guessing.
// ---------------------------------------------------------------------

// Any of these means "this membership can act on cases, not just read
// them" — the baseline for every staff tier. Lacking all of them means a
// read-only membership, which lands in the portal (the backend has no
// separate tenant-account type, so this is still the only signal that
// distinguishes staff from a tenant user).
const STAFF_SIGNAL = new Set([
  "alerts.update",
  "alerts.assign",
  "alerts.resolve",
  "incidents.create",
  "incidents.update",
  "incidents.resolve",
  "cases.update",
  "cases.resolve",
  "cases.create",
]);

// Tenant.manage is the one real permission that maps cleanly onto the
// guide's Admin tier (tenants, scope, tokens, users — A11/A13 Act).
const ADMIN_SIGNAL = new Set(["tenant.manage", "roles.create", "roles.delete"]);

// No real permission separates "resolves true positives and reassigns"
// (Tier 2) from "triages and closes false positives" (Tier 1). These are
// the closest proxies available today — audit visibility and report
// generation both happen to be the kind of thing a more senior analyst
// would hold on this backend's existing role templates.
const TIER2_SIGNAL = new Set([
  "audit_logs.view",
  "reports.generate",
  "members.manage",
  "roles.assign",
]);

// Within a read-only (tenant) membership, anything that manages other
// members or the org itself reads as the tenant's own admin.
const TENANT_ADMIN_SIGNAL = new Set([
  "members.invite",
  "members.manage",
  "members.remove",
  "tenant.manage",
]);

export function deriveRole(permissions: string[]): UserRole {
  const has = (set: Set<string>) => permissions.some((p) => set.has(p));

  if (!has(STAFF_SIGNAL)) {
    return has(TENANT_ADMIN_SIGNAL) ? "tenant_admin" : "tenant_user";
  }
  if (has(ADMIN_SIGNAL)) return "admin";
  if (has(TIER2_SIGNAL)) return "tier2";
  return "tier1";
}

// Where each role lands after signing in, and where the route guards send
// someone who's in the wrong workspace.
export function roleHome(role: UserRole): string {
  switch (role) {
    case "tenant_user":
    case "tenant_admin":
      return "/portal";
    case "admin":
      return "/overview";
    case "tier2":
      // The guide wants this filtered to escalated cases. There's no real
      // status or flag for that yet (see the backend asks — escalate sets
      // severity + INVESTIGATING, nothing queryable survives), so Tier 2
      // lands on the same unfiltered queue as Tier 1 until the backend
      // can tell one apart from the other.
      return "/cases";
    case "tier1":
    default:
      return "/cases";
  }
}
