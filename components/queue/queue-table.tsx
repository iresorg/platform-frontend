"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, SearchX, ShieldCheck } from "lucide-react";
import { CopyButton } from "@/components/shared/copy-button";
import { EmptyState } from "@/components/shared/empty-state";
import { IntelBadge } from "@/components/shared/intel-badge";
import { RelativeTime } from "@/components/shared/relative-time";
import { SeverityBadge } from "@/components/shared/severity-badge";
import { SkeletonTable } from "@/components/shared/skeletons";
import { SLABadge } from "@/components/shared/sla-badge";
import { StatusPill } from "@/components/shared/status-pill";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNow } from "@/hooks/use-now";
import type { IncidentListItem } from "@/lib/incidents/types";
import { cn } from "cn";

const HEAD = "bg-muted/60 text-xs font-bold tracking-wide text-muted-foreground uppercase";
const COLS = 7;
const NEW_ROW_WINDOW_MS = 2 * 60_000;

export function QueueTable({
  rows,
  loading,
  error,
  hasFilters,
  onClearFilters,
}: {
  rows: IncidentListItem[] | undefined;
  loading: boolean;
  error: string | null;
  hasFilters: boolean;
  onClearFilters: () => void;
}) {
  const router = useRouter();
  const now = useNow(15_000);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className={cn(HEAD, "w-28")}>Severity</TableHead>
              <TableHead className={HEAD}>Title</TableHead>
              <TableHead className={HEAD}>Status</TableHead>
              <TableHead className={HEAD}>Endpoint</TableHead>
              <TableHead className={HEAD}>SLA</TableHead>
              <TableHead className={HEAD}>Created</TableHead>
              <TableHead className={HEAD}>Assignee</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && !rows && <SkeletonTable rows={8} cols={COLS} />}

            {error && !rows && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={COLS} className="py-14 text-center text-sm text-destructive">
                  Couldn&rsquo;t load cases: {error}
                </TableCell>
              </TableRow>
            )}

            {rows?.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={COLS} className="p-0">
                  {hasFilters ? (
                    <EmptyState
                      icon={SearchX}
                      title="No cases match these filters"
                      description="Try widening the search, or clear the filters to see everything."
                      action={<Button variant="outline" onClick={onClearFilters}>Clear filters</Button>}
                    />
                  ) : (
                    <EmptyState icon={ShieldCheck} title="Zero active cases pending triage" description="New cases appear here as soon as the pipeline raises them." />
                  )}
                </TableCell>
              </TableRow>
            )}

            {rows?.map((c) => {
              const done = c.status === "RESOLVED" || c.status === "CLOSED";
              const isNew = now.getTime() - new Date(c.created_at).getTime() < NEW_ROW_WINDOW_MS;
              return (
                <TableRow
                  key={c.id}
                  onClick={() => router.push(`/cases/${c.id}`)}
                  className={cn("group cursor-pointer", isNew && "bg-tone-blue-bg/40")}
                >
                  <TableCell>
                    <span className="flex items-center gap-1.5">
                      <SeverityBadge severity={c.severity} />
                      <IntelBadge score={c.intel_score} />
                    </span>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <Link
                      href={`/cases/${c.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="block truncate font-medium hover:underline"
                      title={c.title}
                    >
                      {c.title}
                      {(c.occurrence_count ?? 0) > 1 && (
                        <span className="ml-1.5 font-mono text-xs text-muted-foreground">×{c.occurrence_count}</span>
                      )}
                    </Link>
                    {isNew && <span className="text-xs font-bold text-ocean">New</span>}
                  </TableCell>
                  <TableCell><StatusPill status={c.status} /></TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1">
                      <span className="font-mono text-xs">{c.agent_name || "—"}</span>
                      {c.agent_name && <CopyButton text={c.agent_name} label="endpoint name" className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100" />}
                    </span>
                  </TableCell>
                  <TableCell><SLABadge dueAt={c.sla_due_at} done={done} /></TableCell>
                  <TableCell className="text-sm text-muted-foreground"><RelativeTime iso={c.created_at} /></TableCell>
                  <TableCell className="text-sm">
                    <span className="flex items-center justify-between gap-2">
                      <span className="max-w-40 truncate">{c.assigned_to_email || <span className="text-muted-foreground">—</span>}</span>
                      <Link
                        href={`/cases/${c.id}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Open ${c.title} in a new tab`}
                        title="Open in new tab"
                        className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground focus-visible:opacity-100"
                      >
                        <ExternalLink className="size-4" aria-hidden="true" />
                      </Link>
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
