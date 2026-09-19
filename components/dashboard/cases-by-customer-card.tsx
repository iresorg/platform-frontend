import type { Case } from "@/lib/cases/types";

// Stands in for a geographic threat map: shows where active risk is
// concentrated across tenants without needing map tiles or geo data
// nothing in the mock model actually has.
export function CasesByCustomerCard({ cases }: { cases: Case[] }) {
  const active = cases.filter((c) => c.status !== "resolved");
  const counts = new Map<string, number>();
  for (const c of active) {
    counts.set(c.customer_name, (counts.get(c.customer_name) ?? 0) + 1);
  }
  const rows = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  const max = rows.length > 0 ? rows[0][1] : 1;

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h3 className="mb-1 text-xs font-bold tracking-wide text-muted-foreground uppercase">
        Active Cases by Customer
      </h3>
      <p className="mb-4 text-sm text-muted-foreground">
        Where open risk is concentrated right now.
      </p>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No active cases.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map(([name, count]) => (
            <div key={name} className="flex items-center gap-3">
              <span className="w-40 shrink-0 truncate text-sm">{name}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-brand-navy dark:bg-[#6d72e0]"
                  style={{ width: `${(count / max) * 100}%` }}
                />
              </div>
              <span className="w-4 shrink-0 text-right text-sm font-medium tabular-nums">
                {count}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
