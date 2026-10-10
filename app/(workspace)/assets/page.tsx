"use client";

import { useMemo, useState } from "react";
import { Search, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Can } from "@/components/auth/can";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { MockDataBanner } from "@/components/shared/mock-data-banner";
import { RelativeTime } from "@/components/shared/relative-time";
import { ColorBadge, type BadgeTone } from "@/components/ui/color-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMockAssetsQuery, useMockUpdateAssetCriticalityMutation, type Criticality, type MockAsset } from "@/lib/mocks/assets";

const CRITICALITY_TONE: Record<Criticality, BadgeTone> = { critical: "red", high: "orange", medium: "amber", low: "slate" };

function AssetDrawer({ asset, onClose }: { asset: MockAsset | null; onClose: () => void }) {
  const update = useMockUpdateAssetCriticalityMutation();
  return (
    <Dialog open={Boolean(asset)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        {asset && (
          <>
            <DialogHeader>
              <DialogTitle>{asset.hostname}</DialogTitle>
              <DialogDescription>{asset.tenant_name} · {asset.os}</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">IP</span><span className="font-mono text-xs">{asset.ip}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Discovered by</span><span className="capitalize">{asset.discovered_by}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Open cases</span><span>{asset.open_cases}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Open findings</span><span>{asset.open_findings}</span></div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Criticality</span>
                <Can code="asset.write" fallback={<ColorBadge tone={CRITICALITY_TONE[asset.criticality]}>{asset.criticality}</ColorBadge>}>
                  <Select
                    value={asset.criticality}
                    onValueChange={(v) => {
                      update.mutate(
                        { id: asset.id, criticality: v as Criticality },
                        { onSuccess: () => toast.success("Criticality updated — findings on this asset will re-score.") }
                      );
                    }}
                  >
                    <SelectTrigger size="sm" className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(["critical", "high", "medium", "low"] as const).map((c) => (
                        <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Can>
              </div>
            </div>
            <MockDataBanner endpoint="GET /assets, PATCH /assets/:id" />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function AssetsPage() {
  const [criticality, setCriticality] = useState<string>("");
  const [q, setQ] = useState("");
  const { data: assets, isLoading } = useMockAssetsQuery(criticality || undefined, q || undefined);
  const [selected, setSelected] = useState<MockAsset | null>(null);

  const columns: DataTableColumn<MockAsset>[] = useMemo(
    () => [
      { key: "hostname", header: "Asset", render: (a) => <div><p className="font-medium">{a.hostname}</p><p className="text-xs text-muted-foreground">{a.tenant_name}</p></div> },
      { key: "type", header: "Type", render: (a) => <span className="text-sm capitalize text-muted-foreground">{a.type.replace("_", " ")}</span> },
      { key: "os", header: "OS", render: (a) => <span className="text-sm text-muted-foreground">{a.os}</span> },
      { key: "criticality", header: "Criticality", render: (a) => <ColorBadge tone={CRITICALITY_TONE[a.criticality]}>{a.criticality}</ColorBadge> },
      { key: "open", header: "Open", render: (a) => <span className="text-sm">{a.open_cases} cases · {a.open_findings} findings</span> },
      { key: "last_seen", header: "Last seen", render: (a) => <RelativeTime iso={a.last_seen} /> },
    ],
    []
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl">Assets</h1>
        <p className="text-sm text-muted-foreground">Every known device, across tenants.</p>
      </div>

      <MockDataBanner endpoint="GET /assets" />

      <div className="flex flex-wrap items-center gap-2">
        <Select value={criticality || "all"} onValueChange={(v) => setCriticality(v === "all" ? "" : v)}>
          <SelectTrigger size="sm" aria-label="Filter by criticality"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All criticality</SelectItem>
            {(["critical", "high", "medium", "low"] as const).map((c) => (
              <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative min-w-48 max-w-xs flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search hostname…" className="h-9 pl-8" />
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={assets}
        rowKey={(a) => a.id}
        loading={isLoading}
        onRowClick={setSelected}
        hasFilters={Boolean(criticality || q)}
        onClearFilters={() => { setCriticality(""); setQ(""); }}
        emptyIcon={ShieldCheck}
        emptyTitle="No assets found"
      />

      <AssetDrawer asset={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
