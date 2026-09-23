import type { ProtectionStatus } from "@/lib/dashboard/types";

// Real, tenant-scoped, and safe for the portal: just a status word and an
// open-incident count — nothing technical, matching the Golden Rule the
// mock SecurityBanner already follows.
export function RealProtectionBanner({ status }: { status: ProtectionStatus }) {
  const protected_ = status.open_incident_count === 0;
  const tone = protected_
    ? {
        border: "border-emerald-200 dark:border-emerald-900/60",
        bg: "bg-emerald-50 dark:bg-emerald-950/40",
        dot: "bg-emerald-500",
        heading: "text-emerald-900 dark:text-emerald-200",
        body: "text-emerald-800 dark:text-emerald-300",
      }
    : {
        border: "border-amber-200 dark:border-amber-900/60",
        bg: "bg-amber-50 dark:bg-amber-950/40",
        dot: "bg-amber-500",
        heading: "text-amber-900 dark:text-amber-200",
        body: "text-amber-800 dark:text-amber-300",
      };

  return (
    <div className={`flex flex-wrap items-center justify-between gap-4 rounded-xl border px-5 py-4 ${tone.border} ${tone.bg}`}>
      <div className="flex items-start gap-3">
        <span className={`mt-1.5 size-2.5 shrink-0 rounded-full ${tone.dot}`} aria-hidden="true" />
        <div>
          <p className={`font-heading font-bold ${tone.heading}`}>{status.protection_status}</p>
          <p className={`mt-0.5 text-sm ${tone.body}`}>
            {protected_
              ? "No open incidents. Your environment is being monitored 24/7."
              : `${status.open_incident_count} open incident${status.open_incident_count === 1 ? "" : "s"} being handled by your SOC team.`}
          </p>
        </div>
      </div>
    </div>
  );
}
