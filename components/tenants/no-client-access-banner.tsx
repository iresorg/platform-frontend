"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { customerTenants, useMyTenantsQuery } from "@/lib/tenants/queries";

// Staff who belong only to the backend's holding tenant get near-empty
// screens, since cases and alerts are scoped to the active tenant. Says why,
// so it doesn't read as there being no client activity.
export function NoClientAccessBanner() {
  const { user } = useAuth();
  const { data: tenants } = useMyTenantsQuery();

  if (!user?.customer_id || !tenants || customerTenants(tenants).length > 0) return null;

  return (
    <p role="status" className="border-b border-border bg-muted px-4 py-2 text-sm text-muted-foreground sm:px-6">
      Your account hasn&rsquo;t been given access to any clients yet, so client cases and alerts won&rsquo;t appear
      here. Ask an iRES administrator to add you.
    </p>
  );
}
