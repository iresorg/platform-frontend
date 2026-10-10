"use client";

import { AlertOctagon } from "lucide-react";
import { ConfidenceMeter } from "@/components/shared/confidence-meter";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { MockDataBanner } from "@/components/shared/mock-data-banner";
import { CopyButton } from "@/components/shared/copy-button";
import { RelativeTime } from "@/components/shared/relative-time";
import { useMockIntelQuery, type MockIntelMatch } from "@/lib/mocks/intel";

// Same vocabulary as the case workspace's intel card — same match_type
// wording, same null handling for family/actor.
const MATCH_TYPE_LABEL: Record<MockIntelMatch["match_type"], string> = {
  observable_only: "Seen in threat intelligence",
  indicator_only: "Confirmed malicious indicator",
  indicator_and_observable: "Confirmed malicious indicator",
};

export default function ThreatIntelPage() {
  const { data: matches, isLoading } = useMockIntelQuery();

  const columns: DataTableColumn<MockIntelMatch>[] = [
    {
      key: "indicator",
      header: "Indicator",
      render: (m) => (
        <span className="flex items-center gap-1.5 font-mono text-xs">
          {m.indicator}
          <CopyButton text={m.indicator} label="indicator" />
        </span>
      ),
    },
    { key: "type", header: "Type", render: (m) => <span className="text-sm uppercase text-muted-foreground">{m.ioc_type}</span> },
    { key: "confidence", header: "Confidence", render: (m) => <ConfidenceMeter value={m.confidence} /> },
    { key: "match_type", header: "Match", render: (m) => <span className="text-sm">{MATCH_TYPE_LABEL[m.match_type]}</span> },
    { key: "source", header: "Source", render: (m) => <span className="text-sm text-muted-foreground">via {m.source}</span> },
    { key: "tenants", header: "Tenants affected", render: (m) => <span className="text-sm tabular-nums">{m.tenants_affected}</span> },
    { key: "last_seen", header: "Last seen", render: (m) => <RelativeTime iso={m.last_seen} /> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl">Threat Intel</h1>
        <p className="text-sm text-muted-foreground">Indicators matched across every tenant.</p>
      </div>

      <MockDataBanner endpoint="GET /intel/matches" />

      <DataTable
        columns={columns}
        rows={matches}
        rowKey={(m) => m.id}
        loading={isLoading}
        emptyIcon={AlertOctagon}
        emptyTitle="No intel matches"
      />
    </div>
  );
}
