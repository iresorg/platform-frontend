import { RelativeTime } from "@/components/shared/relative-time";
import { isProtected } from "@/lib/portal/format";
import type { PortalOverview } from "@/lib/portal/types";

// First thing on the page, and deliberately quiet: a status word, one line
// of plain text, and when it was last checked. No numbers competing for
// attention, nothing technical.
export function RealProtectionBanner({
  overview,
  checkedAt,
}: {
  overview: PortalOverview;
  checkedAt?: number;
}) {
  const protectedNow = isProtected(overview.protection_status);
  const heading = protectedNow ? overview.protection_status : "Incident under review";
  const tone = protectedNow
    ? { box: "border-tone-green-line bg-tone-green-bg", dot: "bg-emerald-brand", text: "text-tone-green-fg" }
    : { box: "border-tone-amber-line bg-tone-amber-bg", dot: "bg-amber-brand", text: "text-tone-amber-fg" };

  return (
    <div className={`flex flex-wrap items-center justify-between gap-4 rounded-xl border px-5 py-4 ${tone.box}`}>
      <div className="flex items-start gap-3">
        <span className={`mt-2 size-2.5 shrink-0 rounded-full ${tone.dot}`} aria-hidden="true" />
        <div>
          <p className={`font-heading text-lg font-bold ${tone.text}`}>{heading}</p>
          <p className={`text-sm ${tone.text}`}>
            {protectedNow
              ? "No active security incidents. Your environment is being monitored around the clock."
              : "Our analysts are working on an incident in your environment. We'll post plain-language guidance here as soon as it's closed."}
          </p>
        </div>
      </div>
      {checkedAt !== undefined && (
        <p className={`text-xs ${tone.text}`}>
          Last checked <RelativeTime iso={new Date(checkedAt).toISOString()} />
        </p>
      )}
    </div>
  );
}
