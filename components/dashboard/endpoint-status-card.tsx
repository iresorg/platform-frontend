import { Laptop, ShieldOff, WifiOff } from "lucide-react";
import type { Endpoint } from "@/lib/endpoints/types";

export function EndpointStatusCard({ endpoints }: { endpoints: Endpoint[] }) {
  const online = endpoints.filter((e) => e.status === "online").length;
  const isolated = endpoints.filter((e) => e.status === "isolated").length;
  const offline = endpoints.filter((e) => e.status === "offline").length;

  const rows = [
    { label: "Online", value: online, icon: Laptop, tone: "text-emerald-600 dark:text-emerald-400" },
    { label: "Isolated", value: isolated, icon: ShieldOff, tone: "text-destructive" },
    { label: "Offline", value: offline, icon: WifiOff, tone: "text-muted-foreground" },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h3 className="mb-1 text-xs font-bold tracking-wide text-muted-foreground uppercase">
        Endpoint Status
      </h3>
      <p className="mb-4 text-2xl font-bold">
        {endpoints.length}{" "}
        <span className="text-sm font-normal text-muted-foreground">
          endpoints reporting
        </span>
      </p>
      <div className="flex flex-col gap-3">
        {rows.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="flex items-center gap-2.5 text-sm">
            <Icon className={`size-4 ${tone}`} aria-hidden="true" />
            <span className="flex-1 text-muted-foreground">{label}</span>
            <span className="font-medium tabular-nums">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
