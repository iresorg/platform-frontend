"use client";

import { Suspense, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { CreateIncidentDialog } from "@/components/incidents/create-incident-dialog";
import { ChartsRow } from "@/components/queue/charts-row";
import { MetricsBar, type TileFilter } from "@/components/queue/metrics-bar";
import { QueueTable } from "@/components/queue/queue-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNow } from "@/hooks/use-now";
import { useMetricsOverviewQuery } from "@/lib/metrics/queries";
import { useIncidentsQuery } from "@/lib/incidents/queries";
import type { IncidentSeverity, IncidentStatus } from "@/lib/incidents/types";

const PAGE_SIZE = 25;
const FIFTEEN_MIN = 15 * 60_000;

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "OPEN", label: "Open" },
  { value: "INVESTIGATING", label: "Investigating" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
];
const SEVERITY_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All severities" },
  { value: "CRITICAL", label: "Critical" },
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
];

function QueueContent() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const now = useNow(15_000);
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const status = (params.get("status") as IncidentStatus | null) ?? undefined;
  const severity = (params.get("severity") as IncidentSeverity | null) ?? undefined;
  const q = params.get("q") ?? "";
  const tile = params.get("tile") as "unassigned" | "nearsla" | null;
  const page = Math.max(1, Number(params.get("page") ?? 1) || 1);

  // Filters live in the URL so a filtered view survives a refresh and can be
  // sent to a colleague. Changing any filter returns to page one.
  function setParams(update: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(update)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    if (!("page" in update)) next.delete("page");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const { data, isLoading, isError, error } = useIncidentsQuery({
    status,
    severity,
    search: q || undefined,
    page,
    page_size: PAGE_SIZE,
  });
  const { data: metrics, isLoading: metricsLoading } = useMetricsOverviewQuery();

  // "Unassigned" and "Near SLA" have no API filter, so they narrow the rows
  // already loaded; Critical maps onto the real severity filter.
  const rows = data?.results.filter((c) => {
    const done = c.status === "RESOLVED" || c.status === "CLOSED";
    if (tile === "unassigned" && c.assigned_to_email) return false;
    if (tile === "nearsla") {
      if (done || !c.sla_due_at) return false;
      // Matches the tile's definition: due within 15 minutes, not yet
      // breached (breached cases already sort to the top of the queue).
      const remaining = new Date(c.sla_due_at).getTime() - now.getTime();
      return remaining > 0 && remaining <= FIFTEEN_MIN;
    }
    return true;
  });

  const activeTile: TileFilter | null = severity === "CRITICAL" ? "critical" : tile;
  const hasFilters = Boolean(status || severity || q || tile);
  const total = data?.count ?? 0;
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  function clearAll() {
    if (searchRef.current) searchRef.current.value = "";
    router.replace(pathname, { scroll: false });
  }

  function onSelectTile(next: TileFilter | null) {
    if (next === "critical") setParams({ severity: "CRITICAL", tile: null });
    else if (next === null) setParams({ severity: severity === "CRITICAL" ? null : severity ?? null, tile: null });
    else setParams({ tile: next, severity: severity === "CRITICAL" ? null : severity ?? null });
  }

  function onSearch(value: string) {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setParams({ q: value.trim() || null }), 300);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl">Triage Queue</h1>
          <p className="text-sm text-muted-foreground">Every open case, most urgent first.</p>
        </div>
        <CreateIncidentDialog />
      </div>

      <MetricsBar metrics={metrics} loading={metricsLoading} active={activeTile} onSelect={onSelectTile} />
      <ChartsRow />

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3 shadow-sm">
        <Select value={status ?? "all"} onValueChange={(v) => setParams({ status: v === "all" ? null : v })}>
          <SelectTrigger size="sm" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={severity ?? "all"} onValueChange={(v) => setParams({ severity: v === "all" ? null : v })}>
          <SelectTrigger size="sm" aria-label="Filter by severity">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SEVERITY_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative min-w-48 flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            ref={searchRef}
            defaultValue={q}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search title, endpoint…"
            aria-label="Search cases"
            className="h-8 pl-8"
          />
        </div>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearAll}>
            <X aria-hidden="true" />
            Clear all
          </Button>
        )}
        <p className="ml-auto text-sm text-muted-foreground" aria-live="polite">
          {tile && rows ? `${rows.length} of ${data?.results.length ?? 0} on this page` : `${total} case${total === 1 ? "" : "s"}`}
        </p>
      </div>

      <QueueTable
        rows={rows}
        loading={isLoading}
        error={isError ? (error instanceof Error ? error.message : "Unknown error") : null}
        hasFilters={hasFilters}
        onClearFilters={clearAll}
      />

      {data && total > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {from}–{to} of {total}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={!data.previous} onClick={() => setParams({ page: String(page - 1) })}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={!data.next} onClick={() => setParams({ page: String(page + 1) })}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TriageQueuePage() {
  return (
    <Suspense>
      <QueueContent />
    </Suspense>
  );
}
