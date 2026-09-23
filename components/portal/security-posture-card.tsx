import type { EndpointCoverage, VulnerabilityPosture } from "@/lib/dashboard/types";

const TIERS: { key: keyof VulnerabilityPosture; label: string; bar: string }[] = [
  { key: "Critical", label: "Critical", bar: "bg-red-500" },
  { key: "High", label: "High", bar: "bg-amber-500" },
  { key: "Medium", label: "Medium", bar: "bg-blue-500" },
  { key: "Low", label: "Low", bar: "bg-slate-400" },
];

// Real, tenant-scoped data safe for the portal: coverage ratios and
// severity counts, no per-device or per-finding technical detail.
export function SecurityPostureCard({
  coverage,
  posture,
}: {
  coverage: EndpointCoverage[];
  posture: VulnerabilityPosture;
}) {
  const totalActive = coverage.reduce((sum, c) => sum + c.active, 0);
  const totalDevices = coverage.reduce((sum, c) => sum + c.total, 0);
  const maxSeverity = Math.max(1, ...TIERS.map((t) => posture[t.key]));

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-5 py-4">
        <h2 className="font-heading font-bold">Security posture</h2>
        <p className="text-sm text-muted-foreground">
          A snapshot of device coverage and open findings by severity.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
        <div>
          <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
            Devices protected
          </p>
          <p className="mt-1.5 text-2xl font-bold">
            {totalActive} <span className="text-base font-normal text-muted-foreground">/ {totalDevices}</span>
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${totalDevices > 0 ? (totalActive / totalDevices) * 100 : 0}%` }}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
            Open findings
          </p>
          {TIERS.map(({ key, label, bar }) => (
            <div key={key} className="flex items-center gap-3">
              <span className="w-14 shrink-0 text-xs text-muted-foreground">{label}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${bar}`}
                  style={{ width: `${(posture[key] / maxSeverity) * 100}%` }}
                />
              </div>
              <span className="w-5 shrink-0 text-right text-xs font-medium tabular-nums">
                {posture[key]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
