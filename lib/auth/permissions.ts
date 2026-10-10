import type { UserRole } from "@/lib/auth/types";

// The permission keys from the target guide (§1.3 staff, §1.4 portal).
// Tiers are cumulative by design (the guide's own words), so every one of
// these reduces to "which role(s) hold it" — there's no real backend
// permission granular enough to check per-action (e.g. nothing
// distinguishes "resolve as false positive" from "resolve as true
// positive"; both go through the same cases.resolve code). So unlike the
// older useCan() — which reads real codes GET /me returns — these are
// derived straight from the role this app already guessed (see
// lib/auth/roles.ts's derivation notice). Treat every gate built on this
// as UI-only, same as the guide itself says: the server doesn't enforce
// most of these splits today.
export type GuidePermissionKey =
  | "case.read"
  | "case.assign_self"
  | "case.assign_other"
  | "case.note"
  | "case.escalate"
  | "case.resolve_benign"
  | "case.resolve_tp"
  | "alert.read"
  | "metrics.read"
  | "agent.read"
  | "asset.read"
  | "asset.write"
  | "finding.read"
  | "finding.rescan"
  | "intel.read"
  | "compliance.read"
  | "ai.view"
  | "ai.review"
  | "tenant.read"
  | "tenant.write"
  | "tenant.tokens"
  | "report.manage"
  | "audit.read"
  | "user.manage"
  | "portal.read"
  | "portal.incident.ack"
  | "portal.devices.enrol"
  | "portal.compliance.read"
  | "portal.plan.complete"
  | "portal.report.read"
  | "portal.user.manage";

const ALL_STAFF: UserRole[] = ["tier1", "tier2", "admin"];
const TIER2_PLUS: UserRole[] = ["tier2", "admin"];
const BOTH_TENANT: UserRole[] = ["tenant_user", "tenant_admin"];

// Table 1.3 and 1.4, transcribed directly — change this, not the call
// sites, when Security tunes a boundary.
const GRANTED_TO: Record<GuidePermissionKey, UserRole[]> = {
  "case.read": ALL_STAFF,
  "case.assign_self": ALL_STAFF,
  "case.assign_other": TIER2_PLUS,
  "case.note": ALL_STAFF,
  "case.escalate": ["tier1"],
  "case.resolve_benign": ALL_STAFF,
  "case.resolve_tp": TIER2_PLUS,
  "alert.read": ALL_STAFF,
  "metrics.read": ALL_STAFF,
  "agent.read": ALL_STAFF,
  "asset.read": ALL_STAFF,
  "asset.write": TIER2_PLUS,
  "finding.read": ALL_STAFF,
  "finding.rescan": TIER2_PLUS,
  "intel.read": ALL_STAFF,
  "compliance.read": TIER2_PLUS,
  "ai.view": ALL_STAFF,
  "ai.review": TIER2_PLUS,
  "tenant.read": TIER2_PLUS,
  "tenant.write": ["admin"],
  "tenant.tokens": ["admin"],
  "report.manage": TIER2_PLUS,
  "audit.read": TIER2_PLUS,
  "user.manage": ["admin"],
  "portal.read": BOTH_TENANT,
  "portal.incident.ack": BOTH_TENANT,
  "portal.devices.enrol": ["tenant_admin"],
  "portal.compliance.read": ["tenant_admin"],
  "portal.plan.complete": ["tenant_admin"],
  "portal.report.read": ["tenant_admin"],
  "portal.user.manage": ["tenant_admin"],
};

export const GUIDE_PERMISSION_KEYS = new Set(Object.keys(GRANTED_TO));

export function hasGuidePermission(role: UserRole | undefined, key: GuidePermissionKey): boolean {
  if (!role) return false;
  return GRANTED_TO[key].includes(role);
}
