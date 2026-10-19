"use client";

import { useState, useSyncExternalStore } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Donut } from "@/components/shared/donut";
import { Skeleton } from "@/components/ui/skeleton";
import { useVulnerabilityPostureQuery } from "@/lib/dashboard/queries";
import { useMetricsOverviewQuery, useMetricsTopEndpointsQuery, useMetricsTrendQuery } from "@/lib/metrics/queries";
import type { SeverityCounts } from "@/lib/dashboard/types";

const STORAGE_KEY = "ires.queue.charts.collapsed";

// Remembering the collapsed state is a per-browser convenience, so a
// blocked or empty localStorage just means it starts open.
function readCollapsed(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}
const subscribe = (cb: () => void) => {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
};

const TIERS: { key: keyof SeverityCounts; label: string; color: string; bar: string }[] = [
  { key: "Critical", label: "Critical", color: "var(--red)", bar: "bg-ires-red" },
  { key: "High", label: "High", color: "var(--sunset)", bar: "bg-sunset" },
  { key: "Medium", label: "Medium", color: "var(--amber)", bar: "bg-amber-brand" },
  { key: "Low", label: "Low", color: "var(--gray-400)", bar: "bg-gray-400" },
];

const AXIS_STYLE = { fontSize: 12, fill: "var(--muted-foreground)" };
const TOOLTIP_STYLE = { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 };

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h3 className="mb-4 text-xs font-bold tracking-wide text-muted-foreground uppercase">{title}</h3>
      {children}
    </section>
  );
}

function formatDay(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// Every figure comes from a server-side aggregate — /metrics/* hits
// Postgres directly — never summed across paginated /cases pages, which
// would quietly count one page.
export function ChartsRow() {
  const stored = useSyncExternalStore(subscribe, readCollapsed, () => false);
  const [override, setOverride] = useState<boolean | null>(null);
  const collapsed = override ?? stored;
  const { data: metrics, isLoading: metricsLoading } = useMetricsOverviewQuery();
  const { data: posture, isLoading: postureLoading } = useVulnerabilityPostureQuery();
  const { data: trend, isLoading: trendLoading } = useMetricsTrendQuery(7);
  const { data: topEndpoints, isLoading: topLoading } = useMetricsTopEndpointsQuery(5);

  function toggle() {
    const next = !collapsed;
    setOverride(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    } catch {
      // not persisted — fine
    }
  }

  const bySeverity = new Map<string, number>((metrics?.by_severity ?? []).map((s) => [s.severity, s.count]));
  const severitySegments = TIERS.map((t) => ({
    label: t.label,
    value: bySeverity.get(t.key.toUpperCase()) ?? 0,
    color: t.color,
  }));
  const maxFinding = Math.max(1, ...TIERS.map((t) => posture?.[t.key] ?? 0));
  const trendData = (trend ?? []).map((p) => ({ ...p, label: formatDay(p.date) }));

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={!collapsed}
        className="flex w-fit cursor-pointer items-center gap-1.5 text-xs font-bold tracking-wide text-muted-foreground uppercase hover:text-foreground"
      >
        {collapsed ? <ChevronDown className="size-4" aria-hidden="true" /> : <ChevronUp className="size-4" aria-hidden="true" />}
        {collapsed ? "Show charts" : "Hide charts"}
      </button>
      {!collapsed && (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <Card title="Cases by severity">
            {metricsLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <Donut segments={severitySegments} centerLabel="cases" ariaLabel={`Cases by severity: ${severitySegments.map((s) => `${s.value} ${s.label}`).join(", ")}`} />
            )}
          </Card>
          <Card title="Open findings by severity">
            {postureLoading || !posture ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <div className="flex flex-col gap-3">
                {TIERS.map((t) => (
                  <div key={t.key} className="flex items-center gap-3">
                    <span className="w-16 shrink-0 text-sm text-muted-foreground">{t.label}</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div className={`h-full rounded-full ${t.bar}`} style={{ width: `${((posture[t.key] ?? 0) / maxFinding) * 100}%` }} />
                    </div>
                    <span className="w-8 shrink-0 text-right text-sm font-medium tabular-nums">{posture[t.key] ?? 0}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
          <Card title="Created vs resolved, last 7 days">
            {trendLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="label" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Line type="monotone" dataKey="created" name="Created" stroke="var(--red)" strokeWidth={2} dot={{ r: 3, fill: "var(--red)" }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="resolved" name="Resolved" stroke="var(--emerald)" strokeWidth={2} dot={{ r: 3, fill: "var(--emerald)" }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-ires-red" aria-hidden="true" />Created</span>
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-emerald-brand" aria-hidden="true" />Resolved</span>
            </div>
          </Card>
          <Card title="Top affected endpoints">
            {topLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : !topEndpoints || topEndpoints.length === 0 ? (
              <p className="flex h-40 items-center justify-center text-sm text-muted-foreground">No open cases on any endpoint.</p>
            ) : (
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topEndpoints} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="agent_name" width={110} tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      formatter={(value) => [value, "Open cases"]}
                      labelFormatter={(_, payload) => payload?.[0]?.payload?.customer_name ?? ""}
                    />
                    <Bar dataKey="open_cases" name="Open cases" fill="var(--ocean)" radius={[0, 4, 4, 0]} maxBarSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
