"use client";

import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { PortalSubnav } from "@/components/portal/portal-subnav";
import { Skeleton } from "@/components/ui/skeleton";
import { useCustomerCasesQuery } from "@/lib/cases/queries";

// PLACEHOLDER: these are static, illustrative suggestions matched against a
// couple of coarse rules over the customer's own case data (below). There is
// no recommendation engine yet — when one exists on the backend, this file
// is the one to replace; the page/route and layout around it can stay.
const BASE_RECOMMENDATIONS = [
  {
    title: "Enable multi-factor authentication everywhere",
    description:
      "Accounts without MFA are the single most common way attackers get in. If any team members haven't turned it on yet, this is the highest-impact change available.",
  },
  {
    title: "Review who has administrative access",
    description:
      "Periodically confirming that only the people who need admin rights still have them closes off a common path for lateral movement.",
  },
  {
    title: "Keep endpoint software patched",
    description:
      "Most detections on customer accounts trace back to a known, already-patched vulnerability. Staying current closes that gap before it's used.",
  },
];

const HIGH_ACTIVITY_RECOMMENDATION = {
  title: "Consider a focused security review",
  description:
    "Your account has had more incidents than usual recently. A short review with your account team can help catch a pattern before it becomes a bigger issue.",
};

export default function PortalRecommendationsPage() {
  const { user } = useAuth();
  const customerId = user?.customer_id ?? "";
  const { data: cases, isLoading } = useCustomerCasesQuery(customerId);

  const openCount = (cases ?? []).filter((c) => c.status !== "resolved").length;
  const recommendations =
    openCount >= 2 ? [HIGH_ACTIVITY_RECOMMENDATION, ...BASE_RECOMMENDATIONS] : BASE_RECOMMENDATIONS;

  return (
    <div className="flex flex-col gap-4">
      <PortalSubnav />

      <div>
        <h1 className="text-xl">Recommendations</h1>
        <p className="text-sm text-muted-foreground">
          General guidance based on common patterns we see across accounts.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {recommendations.map((rec) => (
            <div
              key={rec.title}
              className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-navy/10 text-brand-navy dark:bg-brand-navy/20 dark:text-[#8b8fe8]">
                <ShieldCheck className="size-4" aria-hidden="true" />
              </div>
              <div>
                <p className="font-medium">{rec.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {rec.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
