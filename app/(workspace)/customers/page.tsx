"use client";

import { RequirePermission } from "@/components/auth/require-permission";

import { Suspense, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Building2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/auth-provider";
import { OnboardCustomerDialog } from "@/components/customers/onboard-customer-dialog";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { TestBadge } from "@/components/shared/test-badge";
import { Button } from "@/components/ui/button";
import { useTenantSwitch } from "@/components/tenants/use-tenant-switch";
import { useCan } from "@/hooks/use-can";
import { roleHome } from "@/lib/auth/roles";
import { useCustomersQuery } from "@/lib/customers/queries";
import type { AdminCustomerList, AdminCustomerOnboardItem } from "@/lib/customers/types";
import { getMyTenants } from "@/lib/tenants/api";

function CustomersScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const can = useCan();
  const { user } = useAuth();
  const { switchTo } = useTenantSwitch();
  // ?onboard=1 is where RequireTenant sends an admin with no tenant.
  const [onboardOpen, setOnboardOpen] = useState(() => params.get("onboard") === "1" && can("customer.manage"));
  const { data: customers, isLoading, isError, error } = useCustomersQuery();
  const noTenant = Boolean(user && !user.customer_id);

  function handleOpenChange(open: boolean) {
    setOnboardOpen(open);
    if (!open && params.get("onboard")) router.replace(pathname);
  }

  // A tenantless admin is switched into the customer they just onboarded,
  // so the rest of the workspace has a tenant to scope to. Onboarding's
  // customer_id may be the tenant's id or its slug, so match either.
  async function handleOnboarded(items: AdminCustomerOnboardItem[]) {
    if (!user || user.customer_id || items.length === 0) return;
    try {
      const tenants = await getMyTenants();
      const ids = new Set(items.map((i) => i.customer_id));
      const match = tenants.find((t) => ids.has(t.id) || ids.has(t.slug));
      if (!match) {
        toast.info("Customer onboarded, but your account isn't a member of it yet, so there's no organization to switch into.");
        return;
      }
      if (await switchTo(match.id)) router.replace(roleHome(user.role));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't load your organizations.");
    }
  }

  const columns: DataTableColumn<AdminCustomerList>[] = [
    {
      key: "name",
      header: "Name",
      render: (c) => (
        <span className="inline-flex items-center gap-2 font-medium">
          {c.name}
          {c.is_test && <TestBadge />}
        </span>
      ),
    },
    { key: "branches", header: "Branches", render: (c) => <span className="text-sm text-muted-foreground">{c.branches_count}</span> },
    { key: "endpoints", header: "Endpoints", render: (c) => <span className="text-sm tabular-nums">{c.endpoints_active} / {c.endpoints_total}</span> },
    { key: "open_cases", header: "Open cases", render: (c) => <span className="text-sm font-medium tabular-nums">{c.open_cases}</span>, headClassName: "text-right", cellClassName: "text-right" },
  ];

  return (
    <RequirePermission code="customer.read">
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl">Customers</h1>
          <p className="text-sm text-muted-foreground">Client setup, onboarding progress and portal access.</p>
        </div>
        {can("customer.manage") && (
          <Button size="sm" onClick={() => setOnboardOpen(true)}>
            <Plus className="size-4" aria-hidden="true" />
            Onboard customer
          </Button>
        )}
      </div>

      {noTenant && (
        <p role="status" className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
          Your account isn&rsquo;t working in an organization yet. Onboard a customer to get started.
        </p>
      )}

      <OnboardCustomerDialog open={onboardOpen} onOpenChange={handleOpenChange} onOnboarded={handleOnboarded} />

      <DataTable
        columns={columns}
        rows={customers}
        rowKey={(c) => c.id}
        loading={isLoading}
        error={isError ? (error instanceof Error ? error.message : "Unknown error") : null}
        onRowClick={(c) => router.push(`/customers/${c.id}`)}
        emptyIcon={Building2}
        emptyTitle="No customers yet"
        emptyDescription="Clients appear here once they've been onboarded."
      />
    </div>
    </RequirePermission>
  );
}

export default function CustomersPage() {
  return (
    <Suspense>
      <CustomersScreen />
    </Suspense>
  );
}
