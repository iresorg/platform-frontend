import { RequireRole } from "@/components/auth/require-role";
import { AnalystShell } from "@/components/dashboard/analyst-shell";

export default function CustomersLayout({ children }: LayoutProps<"/customers">) {
  return (
    <RequireRole roles={["analyst", "lead"]}>
      <AnalystShell>{children}</AnalystShell>
    </RequireRole>
  );
}
