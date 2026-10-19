"use client";

import { RequirePermission } from "@/components/auth/require-permission";

import { FileBarChart, Loader2 } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { FileDownload } from "@/components/shared/file-download";
import { MockDataBanner } from "@/components/shared/mock-data-banner";
import { MockGate } from "@/components/shared/mock-gate";
import { ColorBadge } from "@/components/ui/color-badge";
import { mockDownloadReport, useMockReportsQuery } from "@/lib/mocks/reports";

export default function PortalReportsPage() {
  const { data: reports, isLoading } = useMockReportsQuery();

  return (
    <RequirePermission code="portal.report.read">
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl">Reports</h1>
        <p className="text-sm text-muted-foreground">Monthly and executive summaries prepared by your security team.</p>
      </div>

      <MockGate>
      <MockDataBanner endpoint="GET /portal/reports" />

      {!isLoading && reports?.length === 0 ? (
        <section className="rounded-xl border border-border bg-card shadow-sm">
          <EmptyState icon={FileBarChart} title="No reports yet" description="Your first report will appear here once it's ready." />
        </section>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="flex flex-col divide-y divide-border">
            {reports?.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 px-5 py-4">
                <div>
                  <p className="text-sm font-medium capitalize">{r.type} report — {r.period}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.generated_at ? new Date(r.generated_at).toLocaleDateString(undefined, { dateStyle: "medium" }) : "Preparing..."}
                  </p>
                </div>
                {r.status === "ready" ? (
                  <FileDownload filename={`${r.type}-${r.period.replace(/\s+/g, "-")}.txt`} fetchBlob={() => mockDownloadReport(r)} />
                ) : (
                  <ColorBadge tone="amber">
                    <Loader2 className="mr-1 size-3 animate-spin" aria-hidden="true" /> Preparing
                  </ColorBadge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      </MockGate>
    </div>
    </RequirePermission>
  );
}
