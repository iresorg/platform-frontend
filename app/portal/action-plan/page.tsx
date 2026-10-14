"use client";

import { CheckCircle2, ClipboardCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Can } from "@/components/auth/can";
import { EmptyState } from "@/components/shared/empty-state";
import { MockDataBanner } from "@/components/shared/mock-data-banner";
import { MockGate } from "@/components/shared/mock-gate";
import { Button } from "@/components/ui/button";
import { ColorBadge } from "@/components/ui/color-badge";
import { useMockActionPlanQuery, useMockMarkDoneMutation } from "@/lib/mocks/action-plan";

export default function ActionPlanPage() {
  const { data: items, isLoading } = useMockActionPlanQuery();
  const markDone = useMockMarkDoneMutation();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl">Action plan</h1>
        <p className="text-sm text-muted-foreground">Approved recommendations from your security team, ordered by when they&rsquo;re due.</p>
      </div>

      <MockGate>
      <MockDataBanner endpoint="GET /portal/action-plan" />

      {!isLoading && items?.length === 0 ? (
        <section className="rounded-xl border border-border bg-card shadow-sm">
          <EmptyState icon={ClipboardCheck} title="Nothing outstanding" description="Approved recommendations will show up here." />
        </section>
      ) : (
        <div className="flex flex-col gap-3">
          {items?.map((item) => (
            <section key={item.id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-heading font-bold">{item.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{item.why_it_matters}</p>
                </div>
                <ColorBadge
                  tone={item.status === "fixed" ? "emerald" : item.status === "still_open" ? "red" : item.status === "rescan_pending" ? "amber" : "blue"}
                  pulse={item.status === "rescan_pending"}
                >
                  {item.status === "rescan_pending" && <Loader2 className="mr-1 size-3 animate-spin" aria-hidden="true" />}
                  {item.status_label}
                </ColorBadge>
              </div>
              <ol className="mt-3 flex list-decimal flex-col gap-1 pl-5 text-sm">
                {item.steps.map((s) => <li key={s}>{s}</li>)}
              </ol>
              <p className="mt-3 text-xs text-muted-foreground">
                {item.devices.join(", ")} · Due {new Date(item.due_by).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </p>
              <Can code="portal.plan.complete">
                {item.status === "open" && (
                  <Button
                    size="sm"
                    className="mt-3"
                    disabled={markDone.isPending}
                    onClick={() =>
                      markDone.mutate(item.id, { onSuccess: () => toast.success("Thanks — we'll confirm once we've checked it.") })
                    }
                  >
                    <CheckCircle2 aria-hidden="true" /> We&rsquo;ve done this
                  </Button>
                )}
              </Can>
            </section>
          ))}
        </div>
      )}
      </MockGate>
    </div>
  );
}
