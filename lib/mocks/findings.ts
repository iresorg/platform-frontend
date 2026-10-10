"use client";

// Stands in for GET /findings, GET /findings/:id, POST /findings/:id/rescan,
// GET /portal/vulnerabilities — see the backend asks list. finding.view /
// finding.update are real granted permissions; no list/detail endpoint
// exists yet to back them.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mockDelay, mockInt, mockPick } from "@/lib/mocks/helpers";

export type DeadlineBand = "critical" | "high" | "medium" | "low";
export type FindingStatus = "open" | "rescan_pending" | "fixed" | "still_open";

export interface MockFinding {
  id: string;
  tenant_name: string;
  asset: { id: string; name: string };
  title: string;
  cve: string | null;
  source: "agent" | "scanner";
  cvss: number;
  epss: number;
  kev: boolean;
  intel_context: string | null;
  risk_score: number;
  deadline_band: DeadlineBand;
  due_at: string;
  status: FindingStatus;
  first_seen: string;
  last_seen: string;
  plain_title: string;
  plain_summary: string;
  priority_label: string;
  status_label: string;
}

const TITLES = [
  { tech: "OpenSSH pre-auth double-free (CVE-2024-6387)", plain: "A weakness in remote login software could let an attacker in without a password.", cve: "CVE-2024-6387" },
  { tech: "Outdated TLS 1.0 still enabled", plain: "An old, insecure connection method is still turned on.", cve: null },
  { tech: "Unpatched Windows SMB vulnerability (CVE-2023-29324)", plain: "A file-sharing weakness could let malware spread between devices.", cve: "CVE-2023-29324" },
  { tech: "Default credentials on network printer", plain: "A printer on the network is still using its factory password.", cve: null },
  { tech: "Log4Shell remnant in legacy app server (CVE-2021-44228)", plain: "An old, well-known software flaw is still present on one system.", cve: "CVE-2021-44228" },
  { tech: "Missing endpoint disk encryption", plain: "A laptop's hard drive isn't encrypted, risking data if it's lost or stolen.", cve: null },
];
const BANDS: { band: DeadlineBand; days: number }[] = [
  { band: "critical", days: 2 },
  { band: "high", days: 7 },
  { band: "medium", days: 30 },
  { band: "low", days: 90 },
];

function buildFindings(): MockFinding[] {
  return TITLES.map((t, i) => {
    const { band, days } = BANDS[i % BANDS.length];
    const kev = i === 0 || i === 4;
    const cvss = kev ? 9.1 : mockInt(40, 85) / 10;
    return {
      id: `finding-${i + 1}`,
      tenant_name: "Meridian VI",
      asset: { id: `asset-${(i % 8) + 1}`, name: mockPick(["MER-VI-WS12", "MER-VI-WS04", "FILESRV-01", "MER-VI-DC01"]) },
      title: t.tech,
      cve: t.cve,
      source: mockPick<"agent" | "scanner">(["agent", "scanner"]),
      cvss,
      epss: kev ? 0.94 : mockInt(2, 60) / 100,
      kev,
      intel_context: kev ? "Actively exploited in the wild (CISA KEV)." : null,
      risk_score: kev ? mockInt(90, 99) : mockInt(20, 85),
      deadline_band: band,
      due_at: new Date(Date.now() + days * 86_400_000).toISOString(),
      status: (i === 5 ? "rescan_pending" : "open") as FindingStatus,
      first_seen: new Date(Date.now() - mockInt(1, 30) * 86_400_000).toISOString(),
      last_seen: new Date().toISOString(),
      plain_title: t.plain,
      plain_summary: t.plain,
      priority_label: band === "critical" ? "Fix immediately" : band === "high" ? "Fix this week" : band === "medium" ? "Fix this month" : "Fix when convenient",
      status_label: i === 5 ? "Rechecking" : "Needs fixing",
    };
  }).sort((a, b) => b.risk_score - a.risk_score);
}

let findings = buildFindings();

export function useMockFindingsQuery(band?: string) {
  return useQuery({
    queryKey: ["mock", "findings", band],
    queryFn: () => mockDelay(findings.filter((f) => !band || f.deadline_band === band)),
  });
}

export function useMockFindingQuery(id: string) {
  return useQuery({
    queryKey: ["mock", "finding", id],
    queryFn: () => mockDelay(findings.find((f) => f.id === id) ?? null),
    enabled: Boolean(id),
  });
}

export function useMockRescanMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      findings = findings.map((f) => (f.id === id ? { ...f, status: "rescan_pending" as const, status_label: "Rechecking" } : f));
      return mockDelay(findings.find((f) => f.id === id)!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mock", "findings"] });
      queryClient.invalidateQueries({ queryKey: ["mock", "finding"] });
    },
  });
}

// Portal-safe view: no CVSS, no risk score, no scanner name (guide P6 rule).
export function toPortalFinding(f: MockFinding) {
  return {
    id: f.id,
    plain_title: f.plain_title,
    plain_summary: f.plain_summary,
    device_display_name: f.asset.name,
    priority_label: f.priority_label,
    due_by: f.due_at,
    status_label: f.status_label,
  };
}
