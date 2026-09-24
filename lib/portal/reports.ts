// Aggregation for the customer Reports view. Pure functions only — no
// fetching here. Resolution time is computed from each resolved case's
// verdict event timestamp minus its created_at; nothing here ever reads
// sla_due_at or risk_score.

import { CUSTOMER_STATUS_LABEL } from "@/lib/portal/customer-view";
import type { Case, CaseEvent } from "@/lib/cases/types";

export interface VolumePoint {
  date: string;
  label: string;
  count: number;
}

export interface OutcomeSlice {
  label: string;
  count: number;
  tone: "blue" | "amber" | "emerald";
}

export interface ResolutionPoint {
  date: string;
  label: string;
  avgHours: number;
}

function dayKey(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

function dayLabel(dayIso: string): string {
  return new Date(dayIso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function computeVolumeOverTime(cases: Case[]): VolumePoint[] {
  const counts = new Map<string, number>();
  for (const c of cases) {
    const key = dayKey(c.created_at);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, label: dayLabel(date), count }));
}

export function computeOutcomeBreakdown(cases: Case[]): OutcomeSlice[] {
  const underReview = cases.filter(
    (c) => c.status === "new" || c.status === "investigating"
  ).length;
  const priorityReview = cases.filter((c) => c.status === "escalated").length;
  const resolved = cases.filter((c) => c.status === "resolved").length;

  return [
    { label: CUSTOMER_STATUS_LABEL.new, count: underReview, tone: "blue" },
    { label: CUSTOMER_STATUS_LABEL.escalated, count: priorityReview, tone: "amber" },
    { label: CUSTOMER_STATUS_LABEL.resolved, count: resolved, tone: "emerald" },
  ];
}

export function computeResolutionTimeTrend(
  resolvedCases: Case[],
  eventsByCaseId: Record<string, CaseEvent[]>
): ResolutionPoint[] {
  const byDay = new Map<string, number[]>();

  for (const c of resolvedCases) {
    const events = eventsByCaseId[c.id];
    const verdictEvent = events?.find((e) => e.type === "verdict");
    if (!verdictEvent) continue;

    const hours =
      (new Date(verdictEvent.created_at).getTime() - new Date(c.created_at).getTime()) /
      3_600_000;
    if (hours < 0) continue;

    const key = dayKey(verdictEvent.created_at);
    const bucket = byDay.get(key) ?? [];
    bucket.push(hours);
    byDay.set(key, bucket);
  }

  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, hoursList]) => ({
      date,
      label: dayLabel(date),
      avgHours: Math.round((hoursList.reduce((a, b) => a + b, 0) / hoursList.length) * 10) / 10,
    }));
}

// ---- Plain-language insight strings, generated from the actual numbers ----

export function describeVolumeInsight(points: VolumePoint[]): string {
  if (points.length === 0) return "No security events recorded yet in this period.";
  const total = points.reduce((sum, p) => sum + p.count, 0);
  const busiest = points.reduce((max, p) => (p.count > max.count ? p : max), points[0]);
  return `${total} event${total === 1 ? "" : "s"} recorded over ${points.length} day${points.length === 1 ? "" : "s"}, busiest on ${busiest.label} with ${busiest.count}.`;
}

export function describeOutcomeInsight(slices: OutcomeSlice[]): string {
  const total = slices.reduce((sum, s) => sum + s.count, 0);
  if (total === 0) return "No incidents recorded yet.";
  const resolved = slices.find((s) => s.label === CUSTOMER_STATUS_LABEL.resolved);
  const resolvedPct = resolved ? Math.round((resolved.count / total) * 100) : 0;
  return `${resolvedPct}% of your ${total} incident${total === 1 ? "" : "s"} have been resolved with guidance provided.`;
}

export function describeResolutionInsight(points: ResolutionPoint[]): string {
  if (points.length === 0) {
    return "Not enough resolved incidents yet to show a resolution-time trend.";
  }
  const avg = points.reduce((sum, p) => sum + p.avgHours, 0) / points.length;
  const first = points[0].avgHours;
  const last = points[points.length - 1].avgHours;
  const trend =
    last < first ? "trending faster" : last > first ? "trending slower" : "holding steady";
  return `Incidents are resolved in about ${avg.toFixed(1)} hours on average, ${trend} over this period.`;
}
