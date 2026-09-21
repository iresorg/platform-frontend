"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { RequireRole } from "@/components/auth/require-role";
import { AnalystShell } from "@/components/dashboard/analyst-shell";
import { PortalShell } from "@/components/portal/portal-shell";

function ShellByRole({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user?.role === "customer" ? (
    <PortalShell>{children}</PortalShell>
  ) : (
    <AnalystShell>{children}</AnalystShell>
  );
}

// Team and Account are shared by every role, so they wear whichever
// chrome matches the signed-in user instead of belonging to one shell.
export function SettingsShell({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole roles={["analyst", "lead", "customer"]}>
      <ShellByRole>{children}</ShellByRole>
    </RequireRole>
  );
}
