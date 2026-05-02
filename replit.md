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
- `/whatsapp` — WhatsApp inbox + settings (protected)
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
- `POST /api/appointments` — Book appointment (public); triggers WhatsApp confirmation if customerPhone provided
- `GET /api/chat/:businessId` — AI chatbot SSE stream (public)
- `GET/PUT /api/businesses/me/whatsapp/settings` — WhatsApp settings (auth)
- `GET /api/businesses/me/whatsapp/conversations` — List conversations (auth)
- `GET /api/businesses/me/whatsapp/conversations/:id/messages` — List messages (auth)
- `POST /api/businesses/me/whatsapp/conversations/:id/send` — Send message (auth)
- `GET/POST /api/whatsapp/webhook` — Meta/Twilio webhook (public)

## Libraries

- `lib/api-spec` — OpenAPI spec + Orval codegen config
- `lib/api-zod` — Generated Zod schemas (from Orval). `src/index.ts` exports ONLY from `./generated/api` — the codegen script post-processes this file to remove the duplicate `./generated/types` export that Orval adds (would cause TS2308 ambiguity).
- `lib/api-client-react` — Generated React Query hooks (from Orval)
- `lib/db` — Drizzle schema, migrations, seed data

## WhatsApp Integration

Provider layer at `artifacts/api-server/src/lib/whatsapp/`:
- `types.ts` — Provider interface
- `providers/twilio.ts` — Twilio WhatsApp provider
- `providers/cloudApi.ts` — Meta Cloud API provider
- `service.ts` — Business logic (send messages, process inbound, confirmations)
- `scheduler.ts` — 15-min cron for appointment reminders

DB tables: `whatsapp_settings`, `whatsapp_conversations`, `whatsapp_messages`, `whatsapp_notifications` (in `lib/db/src/schema/whatsapp.ts`).

Webhook at `POST /api/whatsapp/webhook` handles inbound from both Twilio and Meta. Routes to business by phone number ID. Webhook token checked via `WHATSAPP_WEBHOOK_TOKEN` env var.

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Important Notes

- **Clerk**: Use `@clerk/react@^6.5.0` with `@clerk/shared@^4.9.0` override in `pnpm-workspace.yaml`. Do NOT use `@clerk/react@5.x` — naming mismatch with @clerk/shared@4.x.
- **Toast**: Pages use `useToast` hook from `@/hooks/use-toast` (not `toast` from `@/components/ui/toaster`).
- **Auth guards**: Use `useAuth()` with `isLoaded` check — NOT `<Show when="signed-in">`. The `Show` component does not handle the loading state and causes redirect flashes on every page refresh.
- **API token**: `setAuthTokenGetter` from `@workspace/api-client-react` is called inside `ClerkAuthTokenSync` (in App.tsx) with `getToken()` from `useAuth()`. This attaches `Authorization: Bearer <token>` to all generated fetch hooks. Required in Replit dev mode because Clerk session cookies are not forwarded to the /api server.
- **requireAuth middleware**: Single shared middleware at `artifacts/api-server/src/middlewares/requireAuth.ts`. Import from there in all route files — do NOT re-declare inline.
- **Mutations**: Generated hooks take `{ data: Body }` wrapper for request bodies. Param keys match OpenAPI names — e.g. `slotId`, `appointmentId` (not `id`).
- **Logout**: Use `signOut({ redirectUrl: ... })` — without `redirectUrl`, Clerk signs out but stays on the current (protected) page.
- **Redirect after login**: `fallbackRedirectUrl` on `<SignIn>`/`<SignUp>` handles default post-auth redirect. `AuthGuard` passes `?redirect_url=<path>` so Clerk returns the user to the page they originally requested.
- **AI chat**: SSE endpoint at `/api/chat/:businessId` streams tokens via `text/event-stream`.
- **Widget URL**: `{origin}{basePath}/widget/{businessId}` — shown in Business Profile page.

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
