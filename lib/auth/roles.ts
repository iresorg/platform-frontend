import type { UserRole } from "@/lib/auth/types";

// The backend has no analyst/lead/customer role — it has tenant-scoped
// roles made of permission codes (see GET /me). This app's routing is
// still built on three UI roles, so this maps one to the other: anyone who
// can act on alerts or incidents (not just read them) in their active
// tenant gets the SOC workspace; read-only members (e.g. the built-in
// Auditor / Compliance Officer roles) get the customer portal.
//
// Note a freshly registered tenant owner holds every permission, so they
// land in the SOC workspace — the backend has no "customer account" type.
//
// "lead" can't be derived yet — no documented permission separates a lead
// from an analyst. If one appears, map it here.
const SOC_PERMISSIONS = new Set([
  "alerts.update",
  "alerts.assign",
  "alerts.resolve",
  "incidents.create",
  "incidents.update",
  "incidents.resolve",
]);

export function deriveRole(permissions: string[]): UserRole {
  return permissions.some((p) => SOC_PERMISSIONS.has(p)) ? "analyst" : "customer";
}
