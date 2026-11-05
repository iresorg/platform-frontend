import type { UserRole } from "@/lib/auth/types";

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
      // The guide wants this filtered to escalated cases — now possible
      // via IncidentListItem.is_escalated (added to the backend
      // 2026-10-17); the Escalated toggle on /cases applies ?tile=.
      return "/cases?tile=escalated";
    case "tier1":
    default:
      return "/cases";
  }
}

// Every top-level staff route, for telling whether a role belongs there.
export const STAFF_ROUTE_PREFIXES = [
  "/overview", "/alerts", "/cases", "/assets", "/fleet", "/vulnerabilities",
  "/compliance", "/threat-intel", "/ai-review", "/customers", "/tenants", "/reports", "/admin",
];

// A ?from= value is only followed if it stays on this site. Parsed rather
// than prefix-checked: browsers read "//host", "/\\host" and "/\t/host" as
// another origin, and all of those start with "/".
export function safeRedirectPath(from: string | null): string | null {
  if (!from?.startsWith("/")) return null;
  const base = "http://ires.invalid";
  try {
    return new URL(from, base).origin === base ? from : null;
  } catch {
    return null;
  }
}

// Where an account with no active tenant goes instead of roleHome(): a page
// to pick a tenant it belongs to, or explaining it has none. An admin with
// none goes on to the Customers screen with the onboarding dialog open.
export const ONBOARD_TENANT_PATH = "/customers?onboard=1";
// "Create organization" goes through onboarding for now, so a new organization
// gets its customer record and branches. Unlike ?onboard=1, this one is for
// accounts that already have a tenant.
export const CREATE_ORGANIZATION_PATH = "/customers?onboard=create";
export const NO_ORGANIZATION_PATH = "/no-organization";

// Staff routes an admin with no tenant may still use — onboarding a
// customer, and managing staff (which isn't tenant-scoped).
export const TENANTLESS_ADMIN_PREFIXES = ["/customers", "/admin"];
