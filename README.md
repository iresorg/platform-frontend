# iRES — Incident Response & Emergency Service

A multi-tenant SOC (Security Operations Center) platform frontend: one case pipeline connecting alert triage, incident management, and threat intelligence for analysts, with a plain-language client portal for customers.

Live at **[ires-system.vercel.app](https://ires-system.vercel.app)**.

## Tech stack

- **[Next.js 16](https://nextjs.org)** (App Router) with Turbopack, **React 19**, **TypeScript**
- **Tailwind CSS v4** + **shadcn/radix-ui** components, **lucide-react** icons, **next-themes** for light/dark mode
- **motion** for scroll-driven and reveal animations (landing page)
- **react-hook-form** + **zod** for forms and validation
- **TanStack Query** for server state, **TanStack Table** for data tables
- **sonner** for toast notifications

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | Lint the codebase |

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | No | Base URL of the real backend (e.g. `https://api.example.com`). When unset, alerts fall back to mock data. |

## App structure

Public:
- `/` — Landing page (`components/landing/*`): sticky header, hero, a scroll-pinned "how it works" walkthrough (plain stacked cards on mobile), advantage/coverage/solutions grids, persona quotes, integrations marquee, and CTA/footer bands.
- `/login`, `/register`, `/forgot-password`, `/reset-password`, `/invite/[token]` — Auth flow (shared `AuthSplitLayout`, with a back button to the landing page).

SOC analyst workspace (`/cases/*`):
- `/cases` — Triage queue, the analyst landing page.
- `/cases/overview` — Security operations dashboard (alert stats, threat level, endpoint status).
- `/cases/incident-command` — Escalated/major incidents across customers.
- `/cases/incidents`, `/cases/incidents/[id]` — Incident list and detail.
- `/cases/live-alerts`, `/cases/live-alerts/[id]` — Live alert list and triage/escalation detail.
- `/cases/[id]` — Case workspace.

Customer portal (`/portal/*`):
- `/portal` — Customer dashboard (endpoint health, stats, cases, CSV export).
- `/portal/cases/[id]` — Plain-language case timeline for a customer.

Account (any signed-in role):
- `/settings/account` — Profile, password change, active sessions.
- `/settings/team` — Team members and role-based access control (RBAC), permission-gated.

## Auth model

Roles are UI-level only: `analyst`, `lead`, `customer`. The real backend has no role concept — instead it returns tenant-scoped permissions (`GET /api/v1/me`), and `lib/auth/roles.ts` derives a UI role from which permissions a user holds (e.g. `alerts.update`, `incidents.create` → `analyst`). A freshly-registered tenant owner holds every permission, so lands in the SOC workspace — there's no server-side "customer account" type yet.

Session: JWT + user info in `localStorage`; a non-sensitive role-only cookie (`ires_session`) lets Next middleware (`proxy.ts`) do optimistic role-based redirects. Real authorization is always enforced server-side via the bearer token. Client-side pages are additionally guarded by `<RequireRole>`.

### Mock vs. real data (`lib/config.ts`)

The backend currently covers auth, alerts, incidents, and tenant/RBAC management, but has no concept of this app's unified "Case" model (SLA, risk score, assigned analyst, verdict) or a device/endpoint inventory — so those two stay mocked until the backend grows the matching routes.

| Domain | Source | Switch |
| --- | --- | --- |
| Auth | Real (`/api/v1/auth/*`, `/api/v1/me`) | `USE_MOCK_AUTH = false` |
| Alerts | Real when `NEXT_PUBLIC_API_BASE_URL` is set | `USE_MOCK_ALERTS = !API_BASE_URL` |
| Incidents | Real (`/api/v1/incidents/*`) | — |
| Tenants / RBAC | Real (`/api/v1/tenants/*`, `/api/v1/permissions`) | — |
| Cases | Mocked (in-memory, seeded data) | `USE_MOCK_CASES = true` |
| Endpoints | Mocked (in-memory, seeded data) | `USE_MOCK_ENDPOINTS = true` |

`REALTIME_MODE` (`"poll"` | `"push"`) is a single switch for how case/queue data refreshes: `"poll"` (current default) refetches every `CASE_POLL_INTERVAL_MS` (20s); `"push"` is reserved for a future WebSocket/SSE subscription.

## Deployment

Hosted on Vercel (project `ires-system`), auto-deployed on push to `main` via the GitHub integration (`github.com/iresorg/platform-frontend`). Production env vars are set directly in the Vercel project settings.

## Keeping this README current

This file is meant to track the app as it evolves — update the relevant section whenever routes, the auth model, the mock/real data split, or environment variables change.
