"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, MonitorCheck } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { RelativeTime } from "@/components/shared/relative-time";
import { SkeletonTable } from "@/components/shared/skeletons";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDeviceStatus, isDeviceOffline } from "@/lib/portal/format";
import { usePortalEndpointsQuery } from "@/lib/portal/queries";

const HEAD = "bg-muted/60 text-xs font-bold tracking-wide text-muted-foreground uppercase";

// A real per-device table now (GET /portal/endpoints) — device name,
// plain status, last seen, open incident count. Offline devices sort to
// the top, since those are the actionable ones. No agent IDs, no Wazuh
// status strings.
export default function PortalDevicesPage() {
  const { data: devices, isLoading } = usePortalEndpointsQuery();
  const [branch, setBranch] = useState<string | null>(null);

  // Only shown for multi-branch clients — the column and filter would be
  // noise on a single-branch client's device list.
  const branches = useMemo(
    () => Array.from(new Set((devices ?? []).map((d) => d.branch_label).filter((b): b is string => Boolean(b)))),
    [devices]
  );
  const showBranch = branches.length > 1;

  const filtered = showBranch && branch ? (devices ?? []).filter((d) => d.branch_label === branch) : devices;
  const sorted = [...(filtered ?? [])].sort((a, b) => {
    const aOff = isDeviceOffline(a.status), bOff = isDeviceOffline(b.status);
    if (aOff !== bOff) return aOff ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  const total = devices?.length ?? 0;
  const offline = (devices ?? []).filter((d) => isDeviceOffline(d.status)).length;

  return (
    <div className="flex flex-col gap-4">

      <div>
        <h1 className="text-2xl">Devices</h1>
        <p className="text-sm text-muted-foreground">The computers and servers we&rsquo;re protecting for you.</p>
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {!isLoading && total === 0 ? (
          <EmptyState icon={MonitorCheck} title="We're connecting your devices" description="They'll appear here once they start reporting." />
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
              <p className="text-sm">
                <span className="font-medium">{total - offline} of {total}</span> devices reporting normally
              </p>
              {showBranch && (
                <Select value={branch ?? "all"} onValueChange={(v) => setBranch(v === "all" ? null : v)}>
                  <SelectTrigger size="sm" aria-label="Filter by branch">
                    <SelectValue placeholder="All branches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All branches</SelectItem>
                    {branches.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className={HEAD}>Device</TableHead>
                    {showBranch && <TableHead className={HEAD}>Branch</TableHead>}
                    <TableHead className={HEAD}>
                      <span className="inline-flex items-center gap-1">Status <ArrowUpDown className="size-3" aria-hidden="true" /></span>
                    </TableHead>
                    <TableHead className={HEAD}>Last seen</TableHead>
                    <TableHead className={`${HEAD} text-right`}>Open incidents</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && <SkeletonTable rows={5} cols={showBranch ? 5 : 4} />}
                  {sorted.map((d) => {
                    const offlineRow = isDeviceOffline(d.status);
                    return (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium">{d.name}</TableCell>
                        {showBranch && (
                          <TableCell className="text-sm text-muted-foreground">{d.branch_label ?? "—"}</TableCell>
                        )}
                        <TableCell>
                          <span className={offlineRow ? "inline-flex items-center gap-1.5 text-sunset" : "inline-flex items-center gap-1.5 text-tone-green-fg"}>
                            <span className={offlineRow ? "size-2 rounded-full bg-sunset" : "size-2 rounded-full bg-emerald-brand"} aria-hidden="true" />
                            {formatDeviceStatus(d.status)}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {d.last_seen ? <RelativeTime iso={d.last_seen} /> : "—"}
                        </TableCell>
                        <TableCell className="text-right text-sm font-medium tabular-nums">{d.open_cases}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
