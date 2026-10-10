"use client";

import { RequirePermission } from "@/components/auth/require-permission";

import { FrameworkScore } from "@/components/shared/framework-score";
import { MockDataBanner } from "@/components/shared/mock-data-banner";
import { useMockPortalComplianceQuery } from "@/lib/mocks/compliance";

export default function PortalCompliancePage() {
  const { data: frameworks, isLoading } = useMockPortalComplianceQuery();

  return (
    <RequirePermission code="portal.compliance.read">
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl">Compliance</h1>
        <p className="text-sm text-muted-foreground">Where your organization stands against each framework.</p>
      </div>

      <MockDataBanner endpoint="GET /portal/compliance" />

      {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {frameworks?.map((f) => (
          <FrameworkScore key={f.name} name={f.name} version={f.version} score={f.score} passed={f.areas.filter((a) => a.status_label === "In place").length} failed={f.areas.filter((a) => a.status_label !== "In place").length} asOf={f.as_of} />
        ))}
      </div>

      {frameworks?.map((f) => {
        const needsWork = f.areas.filter((a) => a.status_label !== "In place");
        if (needsWork.length === 0) return null;
        return (
          <section key={f.name} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="font-heading font-bold">{f.name} — needs attention</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {needsWork.map((a) => (
                <li key={a.plain_title} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm">
                  {a.plain_title}
                  <span className="text-xs font-medium text-tone-amber-fg">{a.status_label}</span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
    </RequirePermission>
  );
}
