"use client";

import { RequirePermission } from "@/components/auth/require-permission";

import { FrameworkScore } from "@/components/shared/framework-score";
import { MockDataBanner } from "@/components/shared/mock-data-banner";
import { ColorBadge } from "@/components/ui/color-badge";
import { useMockComplianceQuery } from "@/lib/mocks/compliance";

export default function CompliancePage() {
  const { data: frameworks, isLoading } = useMockComplianceQuery();

  return (
    <RequirePermission code="compliance.read">
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl">Compliance</h1>
        <p className="text-sm text-muted-foreground">Framework coverage for the active tenant.</p>
      </div>

      <MockDataBanner endpoint="GET /compliance" />

      {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {frameworks?.map((f) => (
          <FrameworkScore key={f.name} name={f.name} version={f.version} score={f.score} passed={f.passed} failed={f.failed} notApplicable={f.not_applicable} asOf={f.effective_date} />
        ))}
      </div>

      {frameworks?.map((f) => (
        <section key={f.name} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-5 py-3">
            <h2 className="font-heading font-bold">{f.name} controls</h2>
          </div>
          <div className="flex flex-col divide-y divide-border">
            {f.controls.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <span className="text-sm">{c.title}</span>
                <ColorBadge tone={c.status === "passed" ? "emerald" : c.status === "failed" ? "red" : "slate"} variant="outline">
                  {c.status === "not_applicable" ? "N/A" : c.status}
                </ColorBadge>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
    </RequirePermission>
  );
}
