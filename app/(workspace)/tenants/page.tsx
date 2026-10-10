"use client";

import { RequirePermission } from "@/components/auth/require-permission";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Plus } from "lucide-react";
import { Can } from "@/components/auth/can";
import { CreateTenantDialog } from "@/components/tenants/create-tenant-dialog";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { useMyTenantsQuery } from "@/lib/tenants/queries";
import type { Tenant } from "@/lib/tenants/types";

export default function TenantsPage() {
  const router = useRouter();
  const { data: tenants, isLoading } = useMyTenantsQuery();
  const [createOpen, setCreateOpen] = useState(false);

  const columns: DataTableColumn<Tenant>[] = [
    { key: "name", header: "Organization", render: (t) => <span className="font-medium">{t.name}</span> },
    { key: "slug", header: "Slug", render: (t) => <span className="font-mono text-xs text-muted-foreground">{t.slug}</span> },
    { key: "status", header: "Status", render: (t) => <span className="text-sm text-muted-foreground">{t.status ?? "Active"}</span> },
    { key: "created", header: "Created", render: (t) => <span className="text-sm text-muted-foreground">{t.created_at ? new Date(t.created_at).toLocaleDateString(undefined, { dateStyle: "medium" }) : "—"}</span> },
  ];

  return (
    <RequirePermission code="tenant.read">
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl">Tenants</h1>
          <p className="text-sm text-muted-foreground">Every organization you have access to.</p>
        </div>
        <Can code="tenant.write">
          <Button onClick={() => setCreateOpen(true)}><Plus aria-hidden="true" /> Create organization</Button>
        </Can>
      </div>

      <DataTable
        columns={columns}
        rows={tenants}
        rowKey={(t) => t.id}
        loading={isLoading}
        onRowClick={(t) => router.push(`/tenants/${t.id}`)}
        emptyIcon={Building2}
        emptyTitle="No organizations yet"
      />

      <CreateTenantDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
    </RequirePermission>
  );
}
