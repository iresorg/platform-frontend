"use client";

import { ColorBadge, type BadgeTone } from "@/components/ui/color-badge";
import { useNow } from "@/hooks/use-now";

// Score and band shown exactly as the API returns them — never
// recomputed client-side (guide A7 rule). `band` is whatever string the
// backend sends; this only picks a tone to go with it, falling back to
// slate for a band name it hasn't seen.
const BAND_TONE: Record<string, BadgeTone> = {
  critical: "red",
  high: "orange",
  medium: "amber",
  low: "slate",
};

export function RiskBadge({ score, band }: { score: number; band: string }) {
  const tone = BAND_TONE[band.toLowerCase()] ?? "slate";
  return (
    <span className="inline-flex items-center gap-1.5">
      <ColorBadge tone={tone}>{band}</ColorBadge>
      <span className="font-mono text-xs text-muted-foreground tabular-nums">{score}</span>
    </span>
  );
}

// due_at and band name/day-count come from the API — this never computes
// a deadline, it only formats the one it was given.
export function DeadlineBadge({ band, dueAt }: { band: string; dueAt: string | null }) {
  const now = useNow(60_000);
  const tone = BAND_TONE[band.toLowerCase()] ?? "slate";
  const overdue = dueAt ? new Date(dueAt).getTime() < now.getTime() : false;
  return (
    <span className="inline-flex flex-col gap-0.5">
      <ColorBadge tone={overdue ? "red" : tone}>{band}</ColorBadge>
      {dueAt && (
        <span className="text-xs text-muted-foreground">
          {overdue ? "Overdue since " : "Due "}
          {new Date(dueAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </span>
      )}
    </span>
  );
}
