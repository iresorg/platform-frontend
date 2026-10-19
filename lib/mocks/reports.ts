"use client";

// Stands in for GET/POST /reports, GET /reports/:id/download,
// GET /portal/reports, GET /portal/reports/:id/download — see the
// backend asks list. reports.view / reports.generate / reports.export
// are real granted permissions; no endpoint exists yet.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mockDelay } from "@/lib/mocks/helpers";

export interface MockReport {
  id: string;
  tenant_name: string;
  type: "monthly" | "executive";
  period: string;
  status: "generating" | "ready" | "failed";
  generated_at: string | null;
  generated_by: string;
}

let reports: MockReport[] = [
  { id: "r1", tenant_name: "Meridian VI", type: "monthly", period: "September 2026", status: "ready", generated_at: "2026-10-01T09:00:00Z", generated_by: "tier2@iresorg.com" },
  { id: "r2", tenant_name: "Meridian VI", type: "executive", period: "Q3 2026", status: "ready", generated_at: "2026-10-03T14:00:00Z", generated_by: "admin@iresorg.com" },
];

export function useMockReportsQuery() {
  return useQuery({
    queryKey: ["mock", "reports"],
    queryFn: () => mockDelay(reports),
    refetchInterval: (query) => (query.state.data?.some((r) => r.status === "generating") ? 1500 : false),
  });
}

export function useMockGenerateReportMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ type, period, generatedBy }: { type: MockReport["type"]; period: string; generatedBy: string }) => {
      const id = `r${reports.length + 1}`;
      reports = [{ id, tenant_name: "Meridian VI", type, period, status: "generating", generated_at: null, generated_by: generatedBy }, ...reports];
      await mockDelay(null, 200);
      // Finishes "generating" shortly after — the report screen polls
      // this query, so it'll pick up the ready status on its own.
      setTimeout(() => {
        reports = reports.map((r) => (r.id === id ? { ...r, status: "ready", generated_at: new Date().toISOString() } : r));
      }, 3000);
      return reports[0];
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["mock", "reports"] }),
  });
}

export async function mockDownloadReport(report: MockReport): Promise<Blob> {
  const text = `iRES ${report.type} report\nOrganization: ${report.tenant_name}\nPeriod: ${report.period}\nGenerated: ${report.generated_at}\n\n(Demo file — the backend has no /reports endpoint yet.)`;
  await mockDelay(null, 300);
  return new Blob([text], { type: "text/plain" });
}
