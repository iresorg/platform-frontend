"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";
import { Can } from "@/components/auth/can";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { MockDataBanner } from "@/components/shared/mock-data-banner";
import { DeadlineBadge, RiskBadge } from "@/components/shared/risk-badge";
import { Button } from "@/components/ui/button";
import { ColorBadge } from "@/components/ui/color-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMockFindingsQuery, useMockRescanMutation, type MockFinding } from "@/lib/mocks/findings";

function ScoreDrawer({ finding, onClose }: { finding: MockFinding | null; onClose: () => void }) {
  const rescan = useMockRescanMutation();
  return (
    <Dialog open={Boolean(finding)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        {finding && (
          <>
            <DialogHeader>
              <DialogTitle>{finding.title}</DialogTitle>
              <DialogDescription>{finding.asset.name} · {finding.tenant_name}{finding.cve ? ` · ${finding.cve}` : ""}</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2 text-sm">
              <p className="mb-1 text-xs font-bold tracking-wide text-muted-foreground uppercase">Why this score</p>
              {[
                ["CVSS", finding.cvss],
                ["EPSS (exploit probability)", `${Math.round(finding.epss * 100)}%`],
                ["Known Exploited (CISA KEV)", finding.kev ? "Yes" : "No"],
                ["Threat intel context", finding.intel_context ?? "None"],
              ].map(([label, value]) => (
                <div key={label as string} className="flex justify-between rounded-md border border-border px-3 py-1.5">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium">{String(value)}</span>
                </div>
              ))}
              <div className="mt-1 flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                <span className="font-bold">Final risk score</span>
                <RiskBadge score={finding.risk_score} band={finding.deadline_band} />
              </div>
            </div>
            <Can code="finding.rescan">
              <Button
                size="sm"
                variant="outline"
                className="w-fit"
                disabled={rescan.isPending || finding.status === "rescan_pending"}
                onClick={() => rescan.mutate(finding.id, { onSuccess: () => toast.success("Rescan requested.") })}
              >
                {finding.status === "rescan_pending" ? "Rescan pending" : rescan.isPending ? "Requesting..." : "Request rescan"}
              </Button>
            </Can>
            <MockDataBanner endpoint="GET /findings, POST /findings/:id/rescan" />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function VulnerabilitiesPage() {
  const [band, setBand] = useState("");
  const { data: findings, isLoading } = useMockFindingsQuery(band || undefined);
  const [selected, setSelected] = useState<MockFinding | null>(null);

  const columns: DataTableColumn<MockFinding>[] = [
    { key: "title", header: "Finding", render: (f) => <div><p className="font-medium">{f.title}</p><p className="text-xs text-muted-foreground">{f.asset.name} · {f.tenant_name}</p></div> },
    { key: "risk", header: "Risk", render: (f) => <RiskBadge score={f.risk_score} band={f.deadline_band} /> },
    { key: "kev", header: "KEV", render: (f) => f.kev ? <ColorBadge tone="red">Yes</ColorBadge> : <span className="text-muted-foreground">—</span> },
    { key: "due", header: "Deadline", render: (f) => <DeadlineBadge band={f.deadline_band} dueAt={f.due_at} /> },
    { key: "status", header: "Status", render: (f) => <span className="text-sm text-muted-foreground">{f.status_label}</span> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl">Vulnerabilities</h1>
        <p className="text-sm text-muted-foreground">Ranked by risk, highest first — never re-ranked client-side.</p>
      </div>

      <MockDataBanner endpoint="GET /findings" />

      <Select value={band || "all"} onValueChange={(v) => setBand(v === "all" ? "" : v)}>
        <SelectTrigger size="sm" className="w-44" aria-label="Filter by band"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All bands</SelectItem>
          {(["critical", "high", "medium", "low"] as const).map((b) => (
            <SelectItem key={b} value={b} className="capitalize">{b}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <DataTable
        columns={columns}
        rows={findings}
        rowKey={(f) => f.id}
        loading={isLoading}
        onRowClick={setSelected}
        hasFilters={Boolean(band)}
        onClearFilters={() => setBand("")}
        emptyIcon={ShieldAlert}
        emptyTitle="No findings in this band"
      />

      <ScoreDrawer finding={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
