"use client";

// Stands in for GET /assets, PATCH /assets/:id — see the backend asks
// list. No such endpoint exists today; the permission codes assets.view /
// assets.update / assets.create / assets.delete are already granted in
// GET /me, which suggests this is coming, just not live yet.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mockDelay, mockInt, mockPick } from "@/lib/mocks/helpers";

export type Criticality = "critical" | "high" | "medium" | "low";

export interface MockAsset {
  id: string;
  tenant_name: string;
  hostname: string;
  type: "workstation" | "server" | "network_device" | "cloud_resource";
  os: string;
  ip: string;
  criticality: Criticality;
  discovered_by: "agent" | "scanner";
  open_cases: number;
  open_findings: number;
  last_seen: string;
}

const HOSTS = ["MER-VI-WS12", "MER-VI-WS04", "FILESRV-01", "MER-VI-DC01", "MER-VI-WS09", "WAREHOUSE-SRV", "FRONT-DESK-PC", "MER-VI-WS21"];
const OS_LIST = ["Windows 11 Pro", "Windows Server 2022", "Ubuntu 22.04 LTS", "macOS Sonoma"];
const CRITICALITY: Criticality[] = ["critical", "high", "medium", "low"];

function buildAssets(): MockAsset[] {
  return HOSTS.map((hostname, i) => ({
    id: `asset-${i + 1}`,
    tenant_name: "Meridian VI",
    hostname,
    type: hostname.includes("SRV") || hostname.includes("DC") ? "server" : "workstation",
    os: mockPick(OS_LIST),
    ip: `10.20.${mockInt(1, 9)}.${mockInt(2, 250)}`,
    criticality: mockPick(CRITICALITY),
    discovered_by: mockPick<"agent" | "scanner">(["agent", "scanner"]),
    open_cases: mockInt(0, 3),
    open_findings: mockInt(0, 9),
    last_seen: new Date(Date.now() - mockInt(0, 60) * 60_000).toISOString(),
  }));
}

let assets = buildAssets();

export function useMockAssetsQuery(criticality?: string, q?: string) {
  return useQuery({
    queryKey: ["mock", "assets", criticality, q],
    queryFn: () =>
      mockDelay(
        assets.filter(
          (a) =>
            (!criticality || a.criticality === criticality) &&
            (!q || a.hostname.toLowerCase().includes(q.toLowerCase()))
        )
      ),
  });
}

export function useMockAssetQuery(id: string) {
  return useQuery({
    queryKey: ["mock", "asset", id],
    queryFn: () => mockDelay(assets.find((a) => a.id === id) ?? null),
    enabled: Boolean(id),
  });
}

export function useMockUpdateAssetCriticalityMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, criticality }: { id: string; criticality: Criticality }) => {
      assets = assets.map((a) => (a.id === id ? { ...a, criticality } : a));
      return mockDelay(assets.find((a) => a.id === id)!);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["mock", "asset"] }).then(() => queryClient.invalidateQueries({ queryKey: ["mock", "assets"] })),
  });
}
