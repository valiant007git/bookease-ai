# BookEase AI — Workspace

## Overview

pnpm workspace monorepo using TypeScript. BookEase AI is a full SaaS appointment booking platform powered by AI, for clinics, salons, gyms, and local businesses.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React 19 + Vite 7 (`artifacts/bookease`)
- **Backend**: Express 5 (`artifacts/api-server`)
- **Database**: PostgreSQL + Drizzle ORM (`lib/db`)
- **Auth**: Clerk v6 (`@clerk/react@^6.5.0`, `@clerk/express@^2.1.12`)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec in `lib/api-spec`)
- **AI chatbot**: Replit AI (OpenAI-compatible) via SSE streaming
- **Build**: esbuild (CJS bundle for API server)

## Artifacts

### `artifacts/bookease` (web, preview path: `/`)
React + Vite SaaS frontend. Pages:
- `/` — Landing page with features, pricing, reviews
- `/sign-in`, `/sign-up` — Clerk auth pages
- `/dashboard` — Business stats overview (protected)
- `/bookings` — Appointment management (protected)
- `/availability` — Weekly hours/slot settings (protected)
- `/business` — Business profile setup (protected)
- `/widget/:businessId` — Public AI chatbot booking widget

### `artifacts/api-server` (api, preview path: `/api`)
Express 5 REST API. Routes:
- `GET /api/healthz` — Health check
- `GET/PUT /api/businesses/me` — Business profile upsert
- `GET /api/businesses/:id` — Public business info (for widget)
- `GET/POST/PUT/DELETE /api/availability` — Availability slots
- `GET /api/appointments` — List appointments (owner)
- `PATCH /api/appointments/:id/status` — Update status
- `POST /api/appointments` — Book appointment (public)
- `GET /api/chat/:businessId` — AI chatbot SSE stream (public)

## Libraries

- `lib/api-spec` — OpenAPI spec + Orval codegen config
- `lib/api-zod` — Generated Zod schemas (from Orval)
- `lib/api-client-react` — Generated React Query hooks (from Orval)
- `lib/db` — Drizzle schema, migrations, seed data

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Important Notes

- **Clerk**: Use `@clerk/react@^6.5.0` with `@clerk/shared@^4.9.0` override in `pnpm-workspace.yaml`. Do NOT use `@clerk/react@5.x` — it has a naming mismatch with @clerk/shared@4.x.
- **Toast**: Pages use `useToast` hook from `@/hooks/use-toast` (not `toast` from `@/components/ui/toaster`).
- **Auth**: `getAuth(req)` from `@clerk/express` for server-side auth. `useUser()` / `useClerk()` on the client.
- **Mutations**: Generated hooks take `{ data: Body }` wrapper for request bodies.
- **AI chat**: SSE endpoint at `/api/chat/:businessId` streams tokens via `text/event-stream`.
- **Widget URL**: `{origin}{basePath}/widget/{businessId}` — shown in Business Profile page.

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
