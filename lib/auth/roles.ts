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
