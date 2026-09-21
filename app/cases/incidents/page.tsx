"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertOctagon, ChevronRight, FolderOpen, Search } from "lucide-react";
import { CreateIncidentDialog } from "@/components/incidents/create-incident-dialog";
import { IncidentSeverityBadge } from "@/components/incidents/incident-severity-badge";
import { IncidentStatusBadge } from "@/components/incidents/incident-status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useIncidentsQuery, useIncidentStatsQuery } from "@/lib/incidents/queries";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function IncidentsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useIncidentsQuery({ page });
  const { data: stats } = useIncidentStatsQuery();

  const incidents = data?.results ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl">Incidents</h1>
          <p className="text-sm text-muted-foreground">
            Formal investigations — escalated from alerts or opened manually.
          </p>
        </div>
        <CreateIncidentDialog />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-navy/10 text-brand-navy dark:bg-brand-navy/20 dark:text-[#8b8fe8]">
            <FolderOpen className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-2xl leading-none font-bold">
              {stats?.total_incidents ?? "—"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Total Incidents</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
            <AlertOctagon className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-2xl leading-none font-bold">{stats?.open_incidents ?? "—"}</p>
            <p className="mt-1 text-xs text-muted-foreground">Open</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
            <Search className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-2xl leading-none font-bold">
              {stats?.investigating_incidents ?? "—"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Investigating</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
            <FolderOpen className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-2xl leading-none font-bold">
              {stats?.resolved_incidents ?? "—"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Resolved</p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="bg-muted/50 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  Severity
                </TableHead>
                <TableHead className="bg-muted/50 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  Title
                </TableHead>
                <TableHead className="bg-muted/50 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  Agent
                </TableHead>
                <TableHead className="bg-muted/50 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  Status
                </TableHead>
                <TableHead className="bg-muted/50 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  Assigned
                </TableHead>
                <TableHead className="bg-muted/50 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  Updated
                </TableHead>
                <TableHead className="w-8 bg-muted/50" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}>
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                  </TableRow>
                ))}

              {isError && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-16 text-center text-sm text-destructive"
                  >
                    Couldn&rsquo;t reach the live backend
                    {error instanceof Error ? `: ${error.message}` : "."}
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && !isError && incidents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-16 text-center text-muted-foreground">
                    No incidents opened yet.
                  </TableCell>
                </TableRow>
              )}

              {incidents.map((incident) => (
                <TableRow key={incident.id} className="group">
                  <TableCell>
                    <IncidentSeverityBadge severity={incident.severity} />
                  </TableCell>
                  <TableCell className="max-w-sm">
                    <Link
                      href={`/cases/incidents/${incident.id}`}
                      className="font-medium hover:underline"
                    >
                      {incident.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {incident.agent_name}
                  </TableCell>
                  <TableCell>
                    <IncidentStatusBadge status={incident.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {incident.assigned_to_email || "Unassigned"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatTime(incident.updated_at)}
                  </TableCell>
                  <TableCell>
                    <Link href={`/cases/incidents/${incident.id}`}>
                      <ChevronRight
                        className="size-4 text-muted-foreground/50 transition-colors group-hover:text-foreground"
                        aria-hidden="true"
                      />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {data && (data.next || data.previous) && (
          <div className="flex items-center justify-between border-t border-border px-5 py-3">
            <p className="text-xs text-muted-foreground">
              {data.count} total incident{data.count === 1 ? "" : "s"}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!data.previous}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!data.next}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
