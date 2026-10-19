"use client";

// Stands in for GET/PUT /tenants/:id/scope and GET /tenants/:id/connectors
// — see the backend asks list. The Overview tab of A11 is real (backed
// by lib/tenants/api.ts); only Scope and Connectors are mocked here.

import { useQuery } from "@tanstack/react-query";
import { mockDelay } from "@/lib/mocks/helpers";

export interface MockScopeItem {
  type: "asset" | "network" | "cloud_account" | "time_window";
  value: string;
}

export interface MockScope {
  items: MockScopeItem[];
  signed_by: string;
  signed_date: string;
}

export function useMockTenantScopeQuery(tenantId: string | undefined) {
  return useQuery({
    queryKey: ["mock", "tenant-scope", tenantId],
    enabled: Boolean(tenantId),
    queryFn: (): Promise<MockScope> =>
      mockDelay({
        items: [
          { type: "network", value: "10.20.0.0/16 (Victoria Island office)" },
          { type: "asset", value: "All Windows and macOS endpoints enrolled via agent" },
          { type: "cloud_account", value: "AWS account 847-291-xxxx (read-only)" },
          { type: "time_window", value: "24/7 — no blackout window" },
        ],
        signed_by: "Tunde Bakare (Meridian VI IT Director)",
        signed_date: "2026-06-15",
      }),
  });
}

export interface MockConnector {
  mode: "push" | "pull";
  status: "connected" | "silent";
  last_heartbeat: string;
  expected_heartbeat_seconds: number;
}

export function useMockConnectorQuery(tenantId: string | undefined) {
  return useQuery({
    queryKey: ["mock", "tenant-connector", tenantId],
    enabled: Boolean(tenantId),
    queryFn: (): Promise<MockConnector> =>
      mockDelay({
        mode: "push",
        status: "connected",
        last_heartbeat: new Date(Date.now() - 45_000).toISOString(),
        expected_heartbeat_seconds: 120,
      }),
  });
}
