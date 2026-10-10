"use client";

// Stands in for GET/POST/DELETE /tenants/:id/enrolment-tokens (staff, A11)
// and the same shape under /portal/enrolment-tokens (P5) — see the
// backend asks list. Shared module since both screens need the same
// token/device lifecycle; the real backend's /endpoints (confirmed live)
// shows this pattern already exists for *reading* devices, just not for
// issuing enrolment tokens.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mockDelay } from "@/lib/mocks/helpers";

export type TokenStatus = "active" | "expired" | "revoked" | "full";

export interface MockEnrolmentToken {
  id: string;
  label: string;
  os: "windows" | "linux" | "macos";
  created_at: string;
  expires_at: string;
  device_cap: number;
  used: number;
  status: TokenStatus;
}

export interface MockPendingDevice {
  id: string;
  display_name: string;
  status: "pending" | "active";
  first_seen: string;
  needs_attention: boolean;
}

let tokens: MockEnrolmentToken[] = [
  { id: "tok-1", label: "Office rollout — Windows", os: "windows", created_at: "2026-09-20T10:00:00Z", expires_at: "2026-10-20T10:00:00Z", device_cap: 25, used: 18, status: "active" },
  { id: "tok-2", label: "Finance laptops", os: "macos", created_at: "2026-08-01T10:00:00Z", expires_at: "2026-09-01T10:00:00Z", device_cap: 5, used: 5, status: "expired" },
];

let pendingDevices: MockPendingDevice[] = [];

function installCommand(os: MockEnrolmentToken["os"], token: string): string {
  if (os === "windows") return `irm https://enrol.iresorg.com/${token} | iex`;
  if (os === "macos") return `curl -sL https://enrol.iresorg.com/${token}/mac.sh | sh`;
  return `curl -sL https://enrol.iresorg.com/${token}/linux.sh | sudo sh`;
}

export function useMockEnrolmentTokensQuery() {
  return useQuery({ queryKey: ["mock", "enrolment-tokens"], queryFn: () => mockDelay(tokens) });
}

export function useMockPendingDevicesQuery(enabled: boolean) {
  return useQuery({
    queryKey: ["mock", "pending-devices"],
    queryFn: () => mockDelay(pendingDevices),
    enabled,
    refetchInterval: enabled ? 4000 : false,
  });
}

export function useMockCreateTokenMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ label, os, cap }: { label: string; os: MockEnrolmentToken["os"]; cap: number }) => {
      const id = `tok-${tokens.length + 1}`;
      const token: MockEnrolmentToken = {
        id,
        label,
        os,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 86_400_000).toISOString(),
        device_cap: cap,
        used: 0,
        status: "active",
      };
      tokens = [token, ...tokens];
      await mockDelay(null, 200);
      return { token, command: installCommand(os, `${id}-${Math.random().toString(36).slice(2, 10)}`) };
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["mock", "enrolment-tokens"] }),
  });
}

export function useMockRevokeTokenMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      tokens = tokens.map((t) => (t.id === id ? { ...t, status: "revoked" as const } : t));
      return mockDelay(null, 200);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["mock", "enrolment-tokens"] }),
  });
}

// Simulates a machine running the install command: appears Pending, then
// Online a few seconds later, same as the guide's P5 flow describes.
export function mockSimulateEnrolment(displayName: string) {
  const device: MockPendingDevice = { id: `dev-${Date.now()}`, display_name: displayName, status: "pending", first_seen: new Date().toISOString(), needs_attention: false };
  pendingDevices = [device, ...pendingDevices];
  setTimeout(() => {
    pendingDevices = pendingDevices.map((d) => (d.id === device.id ? { ...d, status: "active" } : d));
  }, 5000);
}
