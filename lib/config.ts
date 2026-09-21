export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// The real backend covers auth (api/v1/auth/...) and alerts/incidents
// (api/v1/alerts/...) — both now wired to real calls below. It has no
// /cases or /endpoints routes at all: there's no server-side concept
// matching this app's unified "Case" model (SLA, risk score, assigned
// analyst, verdict) or a device/asset inventory, so there is nothing for
// those two modules to connect to yet. They stay mocked until the backend
// exposes something to point them at — this isn't a choice made against
// "use real data", it's a hard limitation of the current API surface.
export const USE_MOCK_AUTH: boolean = false;
export const USE_MOCK_CASES: boolean = true;
export const USE_MOCK_ENDPOINTS: boolean = true;

// Alerts is real whenever a backend URL is configured.
export const USE_MOCK_ALERTS: boolean = !API_BASE_URL;

// How the queue/case queries in lib/cases/queries.ts learn about new data.
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
