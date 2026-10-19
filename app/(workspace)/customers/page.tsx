"use client";

import { RequirePermission } from "@/components/auth/require-permission";

import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { TestBadge } from "@/components/shared/test-badge";
import { useCustomersQuery } from "@/lib/customers/queries";
import type { AdminCustomerList } from "@/lib/customers/types";

export default function CustomersPage() {
  const router = useRouter();
  const { data: customers, isLoading, isError, error } = useCustomersQuery();

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
      <div>
        <h1 className="text-xl">Customers</h1>
        <p className="text-sm text-muted-foreground">Client setup, onboarding progress and portal access.</p>
      </div>

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
