"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { RequireRole } from "@/components/auth/require-role";
import { AnalystShell } from "@/components/dashboard/analyst-shell";
import { PortalShell } from "@/components/portal/portal-shell";
import { isStaffRole } from "@/lib/auth/types";

function ShellByRole({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user && isStaffRole(user.role) ? (
    <AnalystShell>{children}</AnalystShell>
  ) : (
    <PortalShell>{children}</PortalShell>
  );
}

// Team and Account are shared by every role, so they wear whichever
// chrome matches the signed-in user instead of belonging to one shell.
export function SettingsShell({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole roles={["tier1", "tier2", "admin", "tenant_user", "tenant_admin"]}>
      <ShellByRole>{children}</ShellByRole>
    </RequireRole>
  );
}
