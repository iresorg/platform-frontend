import { RequireRole } from "@/components/auth/require-role";
import { PortalShell } from "@/components/portal/portal-shell";

export default function PortalLayout({ children }: LayoutProps<"/portal">) {
  return (
    <RequireRole roles={["tenant_user", "tenant_admin"]}>
      <PortalShell>{children}</PortalShell>
    </RequireRole>
  );
}
