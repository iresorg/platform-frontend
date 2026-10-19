"use client";

import { Building2, ChevronsUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTenantSwitch } from "@/components/tenants/use-tenant-switch";
import { useAuth } from "@/components/auth/auth-provider";
import { useMyTenantsQuery } from "@/lib/tenants/queries";

// The guide's TenantPicker is "All tenants, or a selection" — this
// backend has no cross-tenant query on any endpoint (confirmed live: a
// case list, metrics call, etc. only ever returns the caller's *active*
// tenant's data, however many tenants the user belongs to), so there is
// no "All tenants" to offer. This is the one-tenant-at-a-time version:
// picking an org here switches the active tenant (same flow as the
// header's TenantSwitcher) and the screen refetches scoped to it. See the
// backend asks list for what a real cross-tenant `tenant_id=` filter
// would need.
export function TenantPicker() {
  const { user } = useAuth();
  const { data: tenants, isLoading } = useMyTenantsQuery();
  const { switchTo, isSwitching } = useTenantSwitch();

  if (!tenants || tenants.length <= 1) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={isSwitching}
        aria-label="Filter by organization"
        className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium outline-none transition-colors hover:bg-muted disabled:opacity-60"
      >
        <Building2 className="size-4 shrink-0" aria-hidden="true" />
        <span className="max-w-40 truncate">{user?.tenant_name ?? "Organization"}</span>
        <ChevronsUpDown className="size-3.5 shrink-0 opacity-60" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
          View this organization
        </DropdownMenuLabel>
        {isLoading && <p className="px-2 py-1.5 text-sm text-muted-foreground">Loading...</p>}
        {tenants.map((t) => (
          <DropdownMenuItem key={t.id} disabled={t.id === user?.customer_id} onSelect={() => void switchTo(t.id)}>
            {t.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
