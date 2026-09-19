import { Laptop, ShieldOff, WifiOff } from "lucide-react";
import type { Endpoint } from "@/lib/endpoints/types";

const STATUS_CONFIG = {
  online: { label: "Protected", icon: Laptop, tone: "text-emerald-600 dark:text-emerald-400" },
  isolated: { label: "Isolated for safety", icon: ShieldOff, tone: "text-destructive" },
  offline: { label: "Offline", icon: WifiOff, tone: "text-muted-foreground" },
} as const;

// Customer-facing: shows device name, OS and protection status only.
// Agent IDs and raw telemetry stay analyst-side per the portal's Golden Rule.
export function EndpointHealthCard({ endpoints }: { endpoints: Endpoint[] }) {
  const isolated = endpoints.filter((e) => e.status === "isolated").length;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-5 py-4">
        <h2 className="font-heading font-bold">Device protection</h2>
        <p className="text-sm text-muted-foreground">
          {isolated > 0
            ? `${isolated} device${isolated > 1 ? "s" : ""} temporarily isolated as a precaution`
            : "All monitored devices are reporting normally"}
        </p>
      </div>
      <ul className="divide-y divide-border">
        {endpoints.map((endpoint) => {
          const config = STATUS_CONFIG[endpoint.status];
          const Icon = config.icon;
          return (
            <li
              key={endpoint.id}
              className="flex items-center justify-between gap-3 px-5 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{endpoint.hostname}</p>
                <p className="text-xs text-muted-foreground">{endpoint.os}</p>
              </div>
              <span className={`flex items-center gap-1.5 text-sm font-medium ${config.tone}`}>
                <Icon className="size-4" aria-hidden="true" />
                {config.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
