import { RequireRole } from "@/components/auth/require-role";
import { AnalystShell } from "@/components/dashboard/analyst-shell";

export default function CasesLayout({ children }: LayoutProps<"/cases">) {
  return (
    <RequireRole roles={["analyst", "lead"]}>
      <AnalystShell>{children}</AnalystShell>
    </RequireRole>
  );
}
