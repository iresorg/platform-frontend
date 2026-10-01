"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, SearchX, ShieldCheck } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { SkeletonTable } from "@/components/shared/skeletons";
import { Button } from "@/components/ui/button";
import { ColorBadge } from "@/components/ui/color-badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CUSTOMER_STATUS_LABEL, CUSTOMER_STATUS_TONE, isPortalCaseDone } from "@/lib/portal/format";
import { usePortalCasesQuery } from "@/lib/portal/queries";
import { cn } from "cn";

const HEAD = "bg-muted/60 text-xs font-bold tracking-wide text-muted-foreground uppercase";
const PAGE_SIZE = 10;

type StatusFilter = "all" | "open" | "resolved";
const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Under review" },
  { value: "resolved", label: "Resolved" },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

// Start/end of the picked local day, so "to" includes the whole day.
function dayStart(value: string): number { return new Date(`${value}T00:00:00`).getTime(); }
function dayEnd(value: string): number { return new Date(`${value}T23:59:59.999`).getTime(); }

export default function PortalIncidentsPage() {
  const router = useRouter();
  // One page covers a customer's whole history at MVP scale, same as the
  // Overview screen — filtering (status, date) happens client-side below
  // rather than round-tripping per filter change.
  const { data: casesPage, isLoading } = usePortalCasesQuery({ page_size: 100 });
  const [status, setStatus] = useState<StatusFilter>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);

  const all = useMemo(
    () => [...(casesPage?.results ?? [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [casesPage]
  );
  const filtered = useMemo(
    () =>
      all.filter((c) => {
        const done = isPortalCaseDone(c.status);
        if (status === "open" && done) return false;
        if (status === "resolved" && !done) return false;
        const at = new Date(c.created_at).getTime();
        if (from && at < dayStart(from)) return false;
        if (to && at > dayEnd(to)) return false;
        return true;
      }),
    [all, status, from, to]
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const filtersActive = status !== "all" || from !== "" || to !== "";

  function clearFilters() {
    setStatus("all"); setFrom(""); setTo(""); setPage(1);
  }

  return (
    <div className="flex flex-col gap-4">

      <div>
        <h1 className="text-2xl">Incidents</h1>
        <p className="text-sm text-muted-foreground">Everything we&rsquo;ve looked into for you, newest first.</p>
      </div>

      <div className="flex flex-wrap items-end gap-x-6 gap-y-3 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div role="group" aria-label="Filter by status" className="flex rounded-lg bg-muted p-1">
          {STATUS_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              aria-pressed={status === o.value}
              onClick={() => { setStatus(o.value); setPage(1); }}
              className={cn(
                "cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                status === o.value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
        <label className="flex flex-col gap-1 text-xs font-bold tracking-wide text-muted-foreground uppercase">
          From
          <Input type="date" value={from} max={to || undefined} onChange={(e) => { setFrom(e.target.value); setPage(1); }} className="h-9 w-40 font-normal normal-case" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold tracking-wide text-muted-foreground uppercase">
          To
          <Input type="date" value={to} min={from || undefined} onChange={(e) => { setTo(e.target.value); setPage(1); }} className="h-9 w-40 font-normal normal-case" />
        </label>
        {filtersActive && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>Clear filters</Button>
        )}
        <p className="ml-auto text-sm text-muted-foreground" aria-live="polite">
          {filtered.length} incident{filtered.length === 1 ? "" : "s"}
        </p>
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {!isLoading && all.length === 0 ? (
          <EmptyState icon={ShieldCheck} title="You're all set" description="We're monitoring your devices. Anything we find will show up here in plain language." />
        ) : !isLoading && filtered.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No incidents match these filters"
            action={<Button variant="outline" size="sm" onClick={clearFilters}>Clear filters</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className={`${HEAD} w-32`}>Date</TableHead>
                  <TableHead className={HEAD}>What happened</TableHead>
                  <TableHead className={HEAD}>Status</TableHead>
                  <TableHead className={`${HEAD} w-40`} />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && <SkeletonTable rows={6} cols={4} />}
                {rows.map((c) => (
                  <TableRow key={c.id} className="cursor-pointer" onClick={() => router.push(`/portal/incidents/${c.id}`)}>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(c.created_at)}</TableCell>
                    <TableCell className="max-w-md text-sm">
                      <Link href={`/portal/incidents/${c.id}`} onClick={(e) => e.stopPropagation()} className="hover:underline">
                        {c.summary || c.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <ColorBadge tone={CUSTOMER_STATUS_TONE[c.status]} variant="outline">
                        {CUSTOMER_STATUS_LABEL[c.status]}
                      </ColorBadge>
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium text-ocean dark:text-sky">
                      {c.status === "RESOLVED" && c.customer_guidance.trim() !== "" && (
                        <span className="inline-flex items-center gap-1">View guidance <ChevronRight className="size-4" aria-hidden="true" /></span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        {pageCount > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
            <span className="text-muted-foreground">Page {current} of {pageCount}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={current <= 1} onClick={() => setPage(current - 1)}>
                <ChevronLeft aria-hidden="true" /> Previous
              </Button>
              <Button variant="outline" size="sm" disabled={current >= pageCount} onClick={() => setPage(current + 1)}>
                Next <ChevronRight aria-hidden="true" />
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
