"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ChevronRight, Radio } from "lucide-react";
import { AlertStatusBadge } from "@/components/alerts/alert-status-badge";
import { RuleLevelBadge } from "@/components/alerts/rule-level-badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useAlertsQuery, useAlertStatsQuery } from "@/lib/alerts/queries";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function LiveAlertsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useAlertsQuery({ page });
  const { data: stats } = useAlertStatsQuery();

  const alerts = data?.results ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl">Live Alerts</h1>
        <p className="text-sm text-muted-foreground">
          Raw detections streamed from the live Wazuh backend.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-navy/10 text-brand-navy dark:bg-brand-navy/20 dark:text-[#8b8fe8]">
            <Radio className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-2xl leading-none font-bold">
              {stats?.total_alerts ?? "—"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Total Alerts</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
            <AlertTriangle className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-2xl leading-none font-bold">
              {stats?.last_24h_count ?? "—"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Last 24h</p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="bg-muted/50 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  Level
                </TableHead>
                <TableHead className="bg-muted/50 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  Rule
                </TableHead>
                <TableHead className="bg-muted/50 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  Agent
                </TableHead>
                <TableHead className="bg-muted/50 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  Status
                </TableHead>
                <TableHead className="bg-muted/50 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  Detected
                </TableHead>
                <TableHead className="w-8 bg-muted/50" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                  </TableRow>
                ))}

              {isError && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-16 text-center text-sm text-destructive"
                  >
                    Couldn&rsquo;t reach the live backend
                    {error instanceof Error ? `: ${error.message}` : "."}
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && !isError && alerts.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-16 text-center text-muted-foreground"
                  >
                    No alerts reported yet.
                  </TableCell>
                </TableRow>
              )}

              {alerts.map((alert) => (
                <TableRow key={alert.id} className="group">
                  <TableCell>
                    <RuleLevelBadge level={alert.rule_level} />
                  </TableCell>
                  <TableCell className="max-w-sm">
                    <Link
                      href={`/cases/live-alerts/${alert.id}`}
                      className="font-medium hover:underline"
                    >
                      {alert.rule_description}
                    </Link>
                    <p className="text-xs text-muted-foreground">{alert.rule_id}</p>
                  </TableCell>
                  <TableCell className="text-sm">
                    <p>{alert.agent_name}</p>
                    <p className="text-xs text-muted-foreground">{alert.agent_ip}</p>
                  </TableCell>
                  <TableCell>
                    <AlertStatusBadge status={alert.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatTime(alert.detected_at)}
                  </TableCell>
                  <TableCell>
                    <Link href={`/cases/live-alerts/${alert.id}`}>
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
              {data.count} total alert{data.count === 1 ? "" : "s"}
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
