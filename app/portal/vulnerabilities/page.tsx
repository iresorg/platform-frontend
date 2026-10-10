"use client";

import { ShieldCheck } from "lucide-react";
import { MockDataBanner } from "@/components/shared/mock-data-banner";
import { EmptyState } from "@/components/shared/empty-state";
import { ColorBadge } from "@/components/ui/color-badge";
import { useNow } from "@/hooks/use-now";
import { useMockFindingsQuery, toPortalFinding } from "@/lib/mocks/findings";

export default function PortalVulnerabilitiesPage() {
  const { data: findings, isLoading } = useMockFindingsQuery();
  const now = useNow(60_000);
  const items = (findings ?? []).map(toPortalFinding);
  const dueThisWeek = items.filter((i) => new Date(i.due_by).getTime() - now.getTime() < 7 * 86_400_000).length;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl">Vulnerabilities</h1>
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Loading..." : `${items.length} issue${items.length === 1 ? "" : "s"} to fix, ${dueThisWeek} due this week`}
        </p>
      </div>

      <MockDataBanner endpoint="GET /portal/vulnerabilities" />

      {!isLoading && items.length === 0 ? (
        <section className="rounded-xl border border-border bg-card shadow-sm">
          <EmptyState icon={ShieldCheck} title="Nothing to fix right now" description="We'll let you know as soon as something needs your attention." />
        </section>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((i) => (
            <div key={i.id} className="flex items-start justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="min-w-0">
                <p className="text-sm font-medium">{i.plain_title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{i.device_display_name}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <ColorBadge tone={i.priority_label.includes("immediately") ? "red" : i.priority_label.includes("week") ? "orange" : "slate"} variant="outline">
                  {i.priority_label}
                </ColorBadge>
                <span className="text-xs text-muted-foreground">
                  Due {new Date(i.due_by).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
