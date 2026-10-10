"use client";

// Stands in for GET /intel/matches — see the backend asks list. The
// per-case opencti_enrichment data is real (A4's intel card uses it
// directly); what's missing is the cross-tenant aggregate view this
// screen is for. A real implementation should also surface any case
// whose own opencti_enrichment.is_enriched is true, which this mock
// doesn't attempt to merge in.

import { useQuery } from "@tanstack/react-query";
import { mockDelay, mockInt, mockPick } from "@/lib/mocks/helpers";

export interface MockIntelMatch {
  id: string;
  indicator: string;
  ioc_type: "ipv4" | "domain" | "file_hash";
  confidence: number;
  source: string;
  match_type: "observable_only" | "indicator_only" | "indicator_and_observable";
  malware_family: string | null;
  threat_actor: string | null;
  first_seen: string;
  last_seen: string;
  tenants_affected: number;
  case_ids: string[];
}

const SOURCES = ["AbuseIPDB", "AlienVault OTX", "VirusTotal"];
const INDICATORS: { indicator: string; type: MockIntelMatch["ioc_type"] }[] = [
  { indicator: "213.166.84.62", type: "ipv4" },
  { indicator: "45.148.10.80", type: "ipv4" },
  { indicator: "malicious-update-cdn.net", type: "domain" },
  { indicator: "a3f5c9...e21b (sha256)", type: "file_hash" },
  { indicator: "8.209.96.179", type: "ipv4" },
];

function build(): MockIntelMatch[] {
  return INDICATORS.map((ind, i) => ({
    id: `intel-${i + 1}`,
    indicator: ind.indicator,
    ioc_type: ind.type,
    confidence: mockInt(70, 100),
    source: mockPick(SOURCES),
    match_type: mockPick<MockIntelMatch["match_type"]>(["observable_only", "indicator_only", "indicator_and_observable"]),
    malware_family: i % 3 === 0 ? "Cobalt Strike" : null,
    threat_actor: null,
    first_seen: new Date(Date.now() - mockInt(1, 20) * 86_400_000).toISOString(),
    last_seen: new Date().toISOString(),
    tenants_affected: mockInt(1, 3),
    case_ids: [],
  }));
}

const matches = build();

export function useMockIntelQuery() {
  return useQuery({ queryKey: ["mock", "intel"], queryFn: () => mockDelay(matches) });
}
