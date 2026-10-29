import { RequireRole } from "@/components/auth/require-role";
import { RequireTenant } from "@/components/auth/require-tenant";
import { PortalShell } from "@/components/portal/portal-shell";

export default function PortalLayout({ children }: LayoutProps<"/portal">) {
  return (
    <RequireRole roles={["tenant_user", "tenant_admin"]}>
      <RequireTenant>
        <PortalShell>{children}</PortalShell>
      </RequireTenant>
    </RequireRole>
  );
}
