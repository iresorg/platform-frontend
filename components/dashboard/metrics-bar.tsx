import { AlertTriangle, Clock, UserCheck, UserX } from "lucide-react";
import { computeCaseMetrics } from "@/lib/cases/metrics";
import type { Case } from "@/lib/cases/types";

export function MetricsBar({
  cases,
  now,
  userId,
}: {
  cases: Case[];
  now: Date;
  userId?: string;
}) {
  const metrics = computeCaseMetrics(cases, now, userId);
  const items = [
    {
      label: "Assigned to Me",
      value: metrics.assignedToMe,
      icon: UserCheck,
      tint: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
    },
    {
      label: "Unassigned Cases",
      value: metrics.unassigned,
      icon: UserX,
      tint: "bg-brand-navy/10 text-brand-navy dark:bg-brand-navy/20 dark:text-[#8b8fe8]",
    },
    {
      label: "Near SLA Breach",
      value: metrics.nearSlaBreach,
      icon: Clock,
      tint: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
    },
    {
      label: "Critical Alerts",
      value: metrics.critical,
      icon: AlertTriangle,
      tint: "bg-destructive/10 text-destructive",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3  lg:grid-cols-4">
      {items.map(({ label, value, icon: Icon, tint }) => (
        <div
          key={label}
          className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div
            className={`flex size-11 shrink-0 items-center justify-center rounded-full ${tint}`}
          >
            <Icon className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-2xl leading-none font-bold">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
