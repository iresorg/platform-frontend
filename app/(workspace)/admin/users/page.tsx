"use client";

import { RequirePermission } from "@/components/auth/require-permission";

import { useState } from "react";
import { ScrollText } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { MembersPanel } from "@/components/team/members-panel";
import { RolesPanel } from "@/components/team/roles-panel";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { RelativeTime } from "@/components/shared/relative-time";
import { useCan } from "@/hooks/use-can";
import { useAuditLogsQuery } from "@/lib/audit/queries";
import type { AuditLogEntry } from "@/lib/audit/types";
import { cn } from "cn";

type Tab = "users" | "roles" | "audit";

function AuditTab() {
  const { data: logs, isLoading, error } = useAuditLogsQuery();

  const columns: DataTableColumn<AuditLogEntry>[] = [
    { key: "event", header: "Event", render: (l) => <span className="font-mono text-xs">{l.event_type}</span> },
    { key: "actor", header: "Actor", render: (l) => <span className="text-sm">{l.actor_email}</span> },
    { key: "target", header: "Target", render: (l) => <span className="text-sm text-muted-foreground">{l.target_type}</span> },
    { key: "ip", header: "IP", render: (l) => <span className="font-mono text-xs text-muted-foreground">{l.ip_address ?? "—"}</span> },
    { key: "when", header: "When", render: (l) => <RelativeTime iso={l.created_at} /> },
  ];

  return (
    <DataTable
      columns={columns}
      rows={logs}
      rowKey={(l) => l.id}
      loading={isLoading}
      error={error instanceof Error ? error.message : null}
      emptyIcon={ScrollText}
      emptyTitle="No audit events yet"
      emptyDescription="Every sign-in, case change and approval will appear here with its actor."
    />
  );
}

export default function AdminUsersPage() {
  const { user } = useAuth();
  const can = useCan();
  const [tab, setTab] = useState<Tab>(can("user.manage") ? "users" : "audit");
  const tenantId = user?.customer_id;

  const tabs: { id: Tab; label: string; show: boolean }[] = [
    { id: "users", label: "Users", show: can("user.manage") },
    { id: "roles", label: "Roles", show: can("user.manage") },
    { id: "audit", label: "Audit", show: can("audit.read") },
  ];
  const visible = tabs.filter((t) => t.show);

  return (
    <RequirePermission code="audit.read">
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl">Users &amp; Audit</h1>
        <p className="text-sm text-muted-foreground">
          {can("user.manage") ? "Manage staff and tenant access, and review every action taken." : "Every case change, sign-in and approval, with its actor."}
        </p>
      </div>

      {visible.length > 1 && (
        <div role="tablist" aria-label="Sections" className="inline-flex w-fit rounded-lg border border-border bg-muted/50 p-0.5">
          {visible.map((t) => (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "cursor-pointer rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors",
                tab === t.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {tab === "users" && can("user.manage") && tenantId && <MembersPanel tenantId={tenantId} />}
      {tab === "roles" && can("user.manage") && tenantId && <RolesPanel tenantId={tenantId} />}
      {tab === "audit" && can("audit.read") && <AuditTab />}
    </div>
    </RequirePermission>
  );
}
