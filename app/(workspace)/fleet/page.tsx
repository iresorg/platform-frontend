"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, HardDrive, Search } from "lucide-react";
import { ColorBadge } from "@/components/ui/color-badge";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { RelativeTime } from "@/components/shared/relative-time";
import { Input } from "@/components/ui/input";
import { useNow } from "@/hooks/use-now";
import { useEndpointsQuery } from "@/lib/endpoints/queries";
import type { EndpointItem } from "@/lib/endpoints/types";

// A6 · Agent fleet — real data (GET /endpoints, confirmed live). The
// guide also wants a `disconnect_window_minutes` per the backend rather
// than a hard-coded window; that field doesn't exist yet, so 30 minutes
// is a placeholder — see the backend asks list.
const SILENT_WINDOW_MINUTES = 30;

function isSilent(ep: EndpointItem, now: Date): boolean {
  if (!ep.last_keepalive) return true;
  return now.getTime() - new Date(ep.last_keepalive).getTime() > SILENT_WINDOW_MINUTES * 60_000;
}

export default function FleetPage() {
  const { data: endpoints, isLoading, error } = useEndpointsQuery();
  const [q, setQ] = useState("");
  const now = useNow(30_000);

  const filtered = useMemo(
    () => (endpoints ?? []).filter((e) => !q || e.name.toLowerCase().includes(q.toLowerCase()) || e.customer_name.toLowerCase().includes(q.toLowerCase())),
    [endpoints, q]
  );
  const sorted = useMemo(
    () => [...filtered].sort((a, b) => Number(isSilent(b, now)) - Number(isSilent(a, now))),
    [filtered, now]
  );

  const online = (endpoints ?? []).filter((e) => !isSilent(e, now)).length;
  const silent = (endpoints ?? []).length - online;
  const outdated = (endpoints ?? []).filter((e) => e.version && !e.version.includes("4.7")).length;

  const columns: DataTableColumn<EndpointItem>[] = [
    {
      key: "name",
      header: "Device",
      render: (e) => (
        <div>
          <p className="font-medium">{e.name}</p>
          <p className="text-xs text-muted-foreground">{e.customer_name}</p>
        </div>
      ),
    },
    { key: "os", header: "OS", render: (e) => <span className="text-sm text-muted-foreground">{e.os_name || "—"}</span> },
    { key: "ip", header: "IP", render: (e) => <span className="font-mono text-xs">{e.ip || "—"}</span> },
    { key: "version", header: "Agent version", render: (e) => <span className="text-sm text-muted-foreground">{e.version || "—"}</span> },
    {
      key: "status",
      header: "Status",
      render: (e) =>
        isSilent(e, now) ? (
          <ColorBadge tone="red" variant="outline"><AlertTriangle className="mr-1 size-3" aria-hidden="true" />Silent</ColorBadge>
        ) : (
          <ColorBadge tone="emerald" variant="outline">Online</ColorBadge>
        ),
    },
    {
      key: "last_seen",
      header: "Last seen",
      render: (e) => (e.last_keepalive ? <RelativeTime iso={e.last_keepalive} /> : <span className="text-muted-foreground">Never</span>),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl">Agent Fleet</h1>
        <p className="text-sm text-muted-foreground">Every enrolled endpoint, across tenants.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Online", value: online, tint: "bg-tone-green-bg text-tone-green-fg" },
          { label: "Silent", value: silent, tint: "bg-tone-red-bg text-tone-red-fg" },
          { label: "Outdated version", value: outdated, tint: "bg-tone-amber-bg text-tone-amber-fg" },
          { label: "Total", value: endpoints?.length ?? 0, tint: "bg-tone-blue-bg text-tone-blue-fg" },
        ].map((t) => (
          <div key={t.label} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
            <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${t.tint}`}>
              <HardDrive className="size-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xl leading-none font-bold tabular-nums">{t.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="relative max-w-xs">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search device or tenant…" className="h-9 pl-8" />
      </div>

      <DataTable
        columns={columns}
        rows={sorted}
        rowKey={(e) => e.agent_id}
        loading={isLoading}
        error={error instanceof Error ? error.message : null}
        hasFilters={Boolean(q)}
        onClearFilters={() => setQ("")}
        emptyIcon={HardDrive}
        emptyTitle="No endpoints enrolled yet"
        emptyDescription="Devices appear here once they're enrolled and reporting."
      />
    </div>
  );
}
