"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/auth-provider";
import { roleHome } from "@/lib/auth/roles";
import { isStaffRole } from "@/lib/auth/types";
import { useSwitchTenantMutation } from "@/lib/tenants/queries";

// Every top-level staff route — used to tell whether a just-switched-to
// role belongs in this shell at all.
const STAFF_ROUTE_PREFIXES = [
  "/overview", "/alerts", "/cases", "/assets", "/fleet", "/vulnerabilities",
  "/compliance", "/threat-intel", "/ai-review", "/tenants", "/reports", "/admin",
];

// Detail pages belong to one tenant's data — after switching they'd 404,
// so fall back to their list page.
const DETAIL_FALLBACKS: [string, string][] = [
  ["/cases/", "/cases"],
  ["/alerts/", "/alerts"],
  ["/tenants/", "/tenants"],
];

export function useTenantSwitch() {
  const { refreshSession } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const mutation = useSwitchTenantMutation();

  const switchTo = useCallback(
    async (tenantId: string) => {
      try {
        const res = await mutation.mutateAsync(tenantId);
        // The response carries a fresh token already scoped to the new
        // tenant — pass it straight through so the confirmation /me call
        // below reads it instead of the stale one in storage. (Reusing the
        // old token here was the actual bug: /me would always re-report
        // the tenant it was already scoped to, no matter what was switched
        // to, because nothing had told it to look at a different token.)
        const me = await refreshSession(res.access_token);

        // Confirm rather than assume: only /me reflects what the API will
        // actually scope data to.
        if (me.customer_id !== tenantId) {
          toast.error(
            `The server accepted the switch to ${res.active_tenant.name} but still reports ${me.tenant_name ?? "another organization"} as active, so nothing changed.`
          );
          return false;
        }
        // Everything cached belongs to the previous tenant.
        await queryClient.resetQueries();

        const home = roleHome(me.role);
        const inWrongShell =
          (!isStaffRole(me.role) && STAFF_ROUTE_PREFIXES.some((p) => pathname.startsWith(p))) ||
          (isStaffRole(me.role) && pathname.startsWith("/portal"));
        const fallback = DETAIL_FALLBACKS.find(([prefix]) => pathname.startsWith(prefix));
        if (inWrongShell) router.replace(home);
        else if (fallback) router.replace(fallback[1]);

        toast.success(`Switched to ${res.active_tenant.name}.`);
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Couldn't switch organization.");
        return false;
      }
    },
    [mutation, refreshSession, queryClient, router, pathname]
  );

  return { switchTo, isSwitching: mutation.isPending };
}
