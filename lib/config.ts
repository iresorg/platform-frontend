export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const IS_PRODUCTION = process.env.NODE_ENV === "production";

// Tenants allowed to see mock/demo data in production (sales demos,
// internal walkthroughs) even though real tenant users otherwise can't —
// see hooks/use-mock-visible.ts. Comma-separated tenant ids.
const DEMO_TENANT_IDS = new Set(
  (process.env.NEXT_PUBLIC_DEMO_TENANT_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
);

export function isDemoTenant(tenantId: string | undefined): boolean {
  return Boolean(tenantId && DEMO_TENANT_IDS.has(tenantId));
}

// Everything talks to the real backend. The mock login (demo accounts on
// the sign-in page) only exists behind this switch and is off.
export const USE_MOCK_AUTH: boolean = false;

// How the queue/case queries in lib/incidents/queries.ts learn about new data.
// Two backend-integration docs disagree here — one wants HTTP polling
// every 15-30s, the other wants a WebSocket/SSE push channel — so this
// is deliberately the single switch, not a hardcoded interval, so the
// decision can be made once the real backend exists rather than guessed
// now.
//
// "poll": refetchInterval-driven (current default, no live backend needed).
// "push": a WebSocket/SSE subscription calls queryClient.invalidateQueries()
//   on message instead of refetchInterval — wire that subscription up
//   wherever REALTIME_MODE is read once a live endpoint exists, and this
//   flips with zero changes to the query hooks' consumers.
export const REALTIME_MODE: "poll" | "push" = "poll";

export const CASE_POLL_INTERVAL_MS = 20_000;
