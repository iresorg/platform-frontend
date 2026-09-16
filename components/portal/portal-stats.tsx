import type { Case } from "@/lib/cases/types";

export function PortalStats({ cases }: { cases: Case[] }) {
  const open = cases.filter((c) => c.status !== "resolved").length;
  const priority = cases.filter((c) => c.status === "escalated").length;
  const resolved = cases.filter((c) => c.status === "resolved").length;
  const total = cases.length;

  const items = [
    {
      label: "Open Incidents",
      value: open,
      description: "Being handled by your SOC team",
      tone: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Priority Review",
      value: priority,
      description: "Escalated to a senior lead",
      tone: "text-destructive",
    },
    {
      label: "Resolved",
      value: resolved,
      description: "Closed with guidance provided",
      tone: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Total Incidents",
      value: total,
      description: "Recorded on your account",
      tone: "text-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-border bg-card p-4 shadow-sm"
        >
          <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
            {item.label}
          </p>
          <p className={`mt-1.5 text-3xl font-bold ${item.tone}`}>
            {item.value}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {item.description}
          </p>
        </div>
      ))}
    </div>
  );
}
