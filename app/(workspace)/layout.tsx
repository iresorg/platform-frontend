import { RequireRole } from "@/components/auth/require-role";
import { RequireTenant } from "@/components/auth/require-tenant";
import { AnalystShell } from "@/components/dashboard/analyst-shell";

// Shared by every staff screen (A1-A13) — a route group, so each screen
// still gets its own top-level URL (/overview, /cases, /fleet, ...)
// without each needing its own copy of this guard and shell.
export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole roles={["tier1", "tier2", "admin"]}>
      <RequireTenant>
        <AnalystShell>{children}</AnalystShell>
      </RequireTenant>
    </RequireRole>
  );
}
