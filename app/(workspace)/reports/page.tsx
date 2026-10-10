"use client";

import { RequirePermission } from "@/components/auth/require-permission";

import { useState } from "react";
import { FileBarChart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/auth-provider";
import { FileDownload } from "@/components/shared/file-download";
import { MockDataBanner } from "@/components/shared/mock-data-banner";
import { TenantVisibleMark } from "@/components/shared/tenant-visible-mark";
import { Button } from "@/components/ui/button";
import { ColorBadge } from "@/components/ui/color-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  mockDownloadReport,
  useMockGenerateReportMutation,
  useMockReportsQuery,
  type MockReport,
} from "@/lib/mocks/reports";

export default function ReportsPage() {
  const { user } = useAuth();
  const { data: reports, isLoading } = useMockReportsQuery();
  const generate = useMockGenerateReportMutation();
  const [type, setType] = useState<MockReport["type"]>("monthly");
  const [period, setPeriod] = useState("October 2026");
  const hasGenerating = reports?.some((r) => r.status === "generating");

  async function onGenerate() {
    if (!user) return;
    await generate.mutateAsync({ type, period, generatedBy: user.email });
    toast.success("Generating — this updates automatically.");
  }

  return (
    <RequirePermission code="report.manage">
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl">Reports</h1>
        <p className="text-sm text-muted-foreground">Generate and share monthly or executive summaries with a tenant.</p>
      </div>

      <MockDataBanner endpoint="GET/POST /reports" />

      <section className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold tracking-wide text-muted-foreground uppercase" htmlFor="report-type">Type</label>
          <Select value={type} onValueChange={(v) => setType(v as MockReport["type"])}>
            <SelectTrigger id="report-type" size="sm" className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="executive">Executive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold tracking-wide text-muted-foreground uppercase" htmlFor="report-period">Period</label>
          <input
            id="report-period"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        <Button size="sm" disabled={generate.isPending} onClick={() => void onGenerate()}>
          {generate.isPending ? "Starting..." : "Generate"}
        </Button>
      </section>

      <TenantVisibleMark label="Reports are shared directly with the tenant once downloaded to them">
        <p className="text-xs text-muted-foreground">Nothing here is published automatically — downloading and sharing is a manual step.</p>
      </TenantVisibleMark>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {!isLoading && reports?.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No reports yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {reports?.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 px-5 py-4">
                <div className="flex items-center gap-3">
                  <FileBarChart className="size-4 text-muted-foreground" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium capitalize">{r.tenant_name} — {r.type} — {r.period}</p>
                    <p className="text-xs text-muted-foreground">by {r.generated_by}</p>
                  </div>
                </div>
                {r.status === "ready" ? (
                  <FileDownload filename={`${r.tenant_name}-${r.period.replace(/\s+/g, "-")}.txt`} fetchBlob={() => mockDownloadReport(r)} />
                ) : (
                  <ColorBadge tone="amber"><Loader2 className="mr-1 size-3 animate-spin" aria-hidden="true" /> Generating</ColorBadge>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {hasGenerating && <p className="text-xs text-muted-foreground">Polling until every report finishes.</p>}
    </div>
    </RequirePermission>
  );
}
