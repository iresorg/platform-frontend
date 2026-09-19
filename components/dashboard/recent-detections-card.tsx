import Link from "next/link";
import { StatusBadge } from "@/components/cases/status-badge";
import type { Case } from "@/lib/cases/types";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function RecentDetectionsCard({ cases }: { cases: Case[] }) {
  const recent = [...cases]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h3 className="mb-3 text-xs font-bold tracking-wide text-muted-foreground uppercase">
        Recent Detections
      </h3>
      <ul className="flex flex-col gap-2.5">
        {recent.map((c) => (
          <li key={c.id}>
            <Link
              href={`/cases/${c.id}`}
              className="flex items-center justify-between gap-3 rounded-lg px-2.5 py-2 transition-colors hover:bg-muted/60"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{c.title}</p>
                <p className="text-xs text-muted-foreground">
                  {c.customer_name} · {formatTime(c.created_at)}
                </p>
              </div>
              <StatusBadge status={c.status} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
