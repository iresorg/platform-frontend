"use client";

import { ArrowUpDown, MonitorCheck } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { RelativeTime } from "@/components/shared/relative-time";
import { SkeletonTable } from "@/components/shared/skeletons";
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
  const sorted = [...(devices ?? [])].sort((a, b) => {
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
            <div className="border-b border-border px-5 py-4">
              <p className="text-sm">
                <span className="font-medium">{total - offline} of {total}</span> devices reporting normally
              </p>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className={HEAD}>Device</TableHead>
                    <TableHead className={HEAD}>
                      <span className="inline-flex items-center gap-1">Status <ArrowUpDown className="size-3" aria-hidden="true" /></span>
                    </TableHead>
                    <TableHead className={HEAD}>Last seen</TableHead>
                    <TableHead className={`${HEAD} text-right`}>Open incidents</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && <SkeletonTable rows={5} cols={4} />}
                  {sorted.map((d) => {
                    const offlineRow = isDeviceOffline(d.status);
                    return (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium">{d.name}</TableCell>
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
