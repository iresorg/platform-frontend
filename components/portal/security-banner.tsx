import type { Case } from "@/lib/cases/types";

function formatLastReviewed(now: Date): string {
  return now.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function SecurityBanner({
  cases,
  now,
}: {
  cases: Case[];
  now: Date;
}) {
  const openCount = cases.filter((c) => c.status !== "resolved").length;
  const hasActiveIncident = openCount > 0;

  if (hasActiveIncident) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 dark:border-amber-900/60 dark:bg-amber-950/40">
        <div className="flex items-start gap-3">
          <span
            className="mt-1.5 size-2.5 shrink-0 rounded-full bg-amber-500"
            aria-hidden="true"
          />
          <div>
            <p className="font-heading font-bold text-amber-900 dark:text-amber-200">
              Incident under review
            </p>
            <p className="mt-0.5 text-sm text-amber-800 dark:text-amber-300">
              Our analysts are actively working {openCount} incident
              {openCount === 1 ? "" : "s"} in your environment. You will see
              plain-language guidance here as soon as each case is closed.
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold tracking-wide text-amber-700/70 uppercase dark:text-amber-400/70">
            Last reviewed
          </p>
          <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
            Today, {formatLastReviewed(now)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 dark:border-emerald-900/60 dark:bg-emerald-950/40">
      <div className="flex items-start gap-3">
        <span
          className="mt-1.5 size-2.5 shrink-0 rounded-full bg-emerald-500"
          aria-hidden="true"
        />
        <div>
          <p className="font-heading font-bold text-emerald-900 dark:text-emerald-200">
            Protected
          </p>
          <p className="mt-0.5 text-sm text-emerald-800 dark:text-emerald-300">
            No active incidents. Your environment is being monitored 24/7.
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs font-bold tracking-wide text-emerald-700/70 uppercase dark:text-emerald-400/70">
          Last reviewed
        </p>
        <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200">
          Today, {formatLastReviewed(now)}
        </p>
      </div>
    </div>
  );
}
