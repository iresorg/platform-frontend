"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/auth-provider";
import { roleHome } from "@/lib/auth/roles";
import { useSwitchTenantMutation } from "@/lib/tenants/queries";

// Detail pages belong to one tenant's data — after switching they'd 404,
// so fall back to their list page.
const DETAIL_FALLBACKS: [string, string][] = [
  ["/cases/incidents/", "/cases/incidents"],
  ["/cases/live-alerts/", "/cases/live-alerts"],
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
        const me = await refreshSession();

        // Don't trust the switch response alone: the backend has been seen
        // answering 200 "Switched" while /me kept reporting the old tenant
        // (it stores the choice in a session cookie that Bearer-token
        // requests never read). Only /me reflects what the API will
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
          (me.role === "customer" && pathname.startsWith("/cases")) ||
          (me.role !== "customer" && pathname.startsWith("/portal"));
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
