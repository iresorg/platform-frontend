"use client";

import { useNow } from "@/hooks/use-now";

function relative(from: Date, to: Date): string {
  const sec = Math.round((to.getTime() - from.getTime()) / 1000);
  if (sec < 45) return "just now";
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const day = Math.round(hr / 24);
  if (day < 14) return `${day} day${day === 1 ? "" : "s"} ago`;
  return from.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

// "4 min ago" in lists; the exact timestamp on hover.
export function RelativeTime({ iso, className }: { iso: string | null | undefined; className?: string }) {
  const now = useNow(30_000);
  if (!iso) return <span className="text-muted-foreground">—</span>;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return <span className="text-muted-foreground">—</span>;
  return (
    <time dateTime={iso} title={date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "medium" })} className={className}>
      {relative(date, now)}
    </time>
  );
}
