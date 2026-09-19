export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// No backend yet — every data module falls back to an in-memory mock
// implementation until NEXT_PUBLIC_API_BASE_URL is set.
export const USE_MOCK_API = !API_BASE_URL;

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
