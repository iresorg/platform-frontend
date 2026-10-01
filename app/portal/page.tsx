"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Download, ShieldCheck } from "lucide-react";
import { ColorBadge } from "@/components/ui/color-badge";
import { DeviceHealthCard } from "@/components/portal/device-health-card";
import { RealProtectionBanner } from "@/components/portal/real-protection-banner";
import { EmptyState } from "@/components/shared/empty-state";
import { SkeletonCard, SkeletonTable } from "@/components/shared/skeletons";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { downloadPortalCasesCsv } from "@/lib/portal/export-csv";
import { CUSTOMER_STATUS_LABEL, CUSTOMER_STATUS_TONE } from "@/lib/portal/format";
import { usePortalCasesQuery, usePortalEndpointsQuery, usePortalOverviewQuery } from "@/lib/portal/queries";

const HEAD = "bg-muted/60 text-xs font-bold tracking-wide text-muted-foreground uppercase";
const RECENT_LIMIT = 8;
const NEEDS_ATTENTION_LIMIT = 5;

const SEVERITY_ROWS: { key: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"; label: string; bar: string }[] = [
  { key: "CRITICAL", label: "Critical", bar: "bg-ires-red" },
  { key: "HIGH", label: "High", bar: "bg-sunset" },
  { key: "MEDIUM", label: "Medium", bar: "bg-amber-brand" },
  { key: "LOW", label: "Low", bar: "bg-gray-400" },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

// What a customer's IT manager sees: calm, plain, reassuring. It should
// not look like a SOC console — no rule IDs, logs, indicators, analyst
// names or severity numbers anywhere in what's rendered.
export default function PortalPage() {
  const router = useRouter();
  const { data: overview, dataUpdatedAt } = usePortalOverviewQuery();
  const { data: devices } = usePortalEndpointsQuery();
  // One page covers a customer's whole recent history at MVP scale — see
  // the backend asks for a smaller, purpose-built /portal/overview
  // response that wouldn't need this.
  const { data: casesPage, isLoading } = usePortalCasesQuery({ page_size: 100 });
  const cases = casesPage?.results ?? [];

  const sorted = [...cases].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const recent = sorted.slice(0, RECENT_LIMIT);
  // The list doesn't say whether a resolved case's guidance has already
  // been acknowledged (only the detail endpoint carries acknowledged_at),
  // so this shows every resolved case that has guidance rather than only
  // the unread ones — a customer re-reads something they've already seen
  // at worst, never misses one that's new.
  const needsAttention = sorted
    .filter((c) => c.status === "RESOLVED" && c.customer_guidance.trim() !== "")
    .slice(0, NEEDS_ATTENTION_LIMIT);

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const thisMonth = sorted.filter((c) => new Date(c.created_at) >= monthStart);
  const resolvedThisMonth = thisMonth.filter((c) => c.status === "RESOLVED" || c.status === "CLOSED");

  const bySeverity = new Map<string, number>((overview?.by_severity ?? []).map((s) => [s.severity, s.count]));
  const maxSeverity = Math.max(1, ...SEVERITY_ROWS.map((r) => bySeverity.get(r.key) ?? 0));

  return (
    <div className="flex flex-col gap-5">

      {overview ? <RealProtectionBanner overview={overview} checkedAt={dataUpdatedAt || undefined} /> : <SkeletonCard className="h-24" />}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <DeviceHealthCard devices={devices} />
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-xs font-bold tracking-wide text-muted-foreground uppercase">This month</h2>
          <div className="flex flex-col gap-4">
            <p>
              <span className="text-3xl font-bold tabular-nums">{thisMonth.length}</span>
              <span className="ml-2 text-sm text-muted-foreground">incident{thisMonth.length === 1 ? "" : "s"} reviewed</span>
            </p>
            <p>
              <span className="text-3xl font-bold tabular-nums">{resolvedThisMonth.length}</span>
              <span className="ml-2 text-sm text-muted-foreground">resolved</span>
            </p>
          </div>
        </section>
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-xs font-bold tracking-wide text-muted-foreground uppercase">Open, by priority</h2>
          <div className="flex flex-col gap-3">
            {SEVERITY_ROWS.map((r) => (
              <div key={r.key} className="flex items-center gap-3">
                <span className="w-14 shrink-0 text-xs text-muted-foreground">{r.label}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className={`h-full rounded-full ${r.bar}`} style={{ width: `${((bySeverity.get(r.key) ?? 0) / maxSeverity) * 100}%` }} />
                </div>
                <span className="w-6 shrink-0 text-right text-xs font-medium tabular-nums">{bySeverity.get(r.key) ?? 0}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {needsAttention.length > 0 && (
        <section className="overflow-hidden rounded-xl border-2 border-ocean/50 bg-tone-blue-bg/30 shadow-sm">
          <div className="border-b border-ocean/30 px-5 py-4">
            <h2 className="font-heading font-bold text-tone-blue-fg">Needs your attention</h2>
            <p className="text-sm text-tone-blue-fg/80">Guidance from your security team on resolved incidents</p>
          </div>
          <div className="flex flex-col divide-y divide-ocean/20">
            {needsAttention.map((c) => (
              <Link
                key={c.id}
                href={`/portal/incidents/${c.id}`}
                className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-card/60"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{c.summary || c.title}</p>
                  <p className="text-xs text-tone-blue-fg/70">{formatDate(c.created_at)}</p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-ocean dark:text-sky">
                  View guidance <ChevronRight className="size-4" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <h2 className="font-heading font-bold">Recent activity</h2>
            <p className="text-sm text-muted-foreground">Plain-language summaries from your security team</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={sorted.length === 0} onClick={() => downloadPortalCasesCsv(sorted)}>
              <Download aria-hidden="true" />
              Export CSV
            </Button>
            {sorted.length > RECENT_LIMIT && (
              <Button asChild variant="ghost" size="sm">
                <Link href="/portal/incidents">View all</Link>
              </Button>
            )}
          </div>
        </div>
        {!isLoading && sorted.length === 0 ? (
          <EmptyState icon={ShieldCheck} title="You're all set" description="We're monitoring your devices. Anything we find will show up here in plain language." />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className={`${HEAD} w-24`}>Date</TableHead>
                  <TableHead className={HEAD}>What happened</TableHead>
                  <TableHead className={HEAD}>Status</TableHead>
                  <TableHead className={`${HEAD} w-44`} />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && <SkeletonTable rows={4} cols={4} />}
                {recent.map((c) => (
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
                      {c.status === "RESOLVED" && c.customer_guidance.trim() !== "" ? (
                        <span className="inline-flex items-center gap-1">View guidance <ChevronRight className="size-4" aria-hidden="true" /></span>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}
