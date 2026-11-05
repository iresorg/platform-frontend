"use client";

import { useRouter } from "next/navigation";
import { Building2, Check, ChevronsUpDown, Plus } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { useTenantSwitch } from "@/components/tenants/use-tenant-switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCan } from "@/hooks/use-can";
import { CREATE_ORGANIZATION_PATH } from "@/lib/auth/roles";
import { useMyTenantsQuery } from "@/lib/tenants/queries";

export function TenantSwitcher() {
  const { user } = useAuth();
  const { data: tenants, isLoading } = useMyTenantsQuery();
  const { switchTo, isSwitching } = useTenantSwitch();
  const can = useCan();
  const router = useRouter();

  if (!user?.customer_id) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Switch organization"
          disabled={isSwitching}
          className="flex max-w-[12rem] cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm font-medium text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60 sm:max-w-[16rem]"
        >
          <Building2 className="size-4 shrink-0" aria-hidden="true" />
          <span className="hidden truncate sm:inline">{user.tenant_name ?? "Organization"}</span>
          <ChevronsUpDown className="size-3.5 shrink-0 opacity-60" aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
            Organizations
          </DropdownMenuLabel>
          {isLoading && (
            <p className="px-2 py-1.5 text-sm text-muted-foreground">Loading...</p>
          )}
          {tenants?.map((tenant) => {
            const active = tenant.id === user.customer_id;
            return (
              <DropdownMenuItem
                key={tenant.id}
                disabled={active}
                onSelect={() => void switchTo(tenant.id)}
                className="flex items-center justify-between gap-2"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm">{tenant.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {tenant.slug}
                  </span>
                </span>
                {active && <Check className="size-4 shrink-0" aria-hidden="true" />}
              </DropdownMenuItem>
            );
          })}
          {can("customer.manage") && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => router.push(CREATE_ORGANIZATION_PATH)}>
                <Plus aria-hidden="true" />
                Create organization
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
