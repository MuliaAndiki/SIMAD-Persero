# Architecture Context — SIMAD (Sistem Informasi Manajemen Magang & Administrasi Diklat)

> Source of truth for future UML / Layered Architecture diagrams.
> All conclusions are based on actual code references. No fictional layers.
> Secrets are never exposed — only service/key _names_ from config schemas are listed.
> Inspected: `be/src/**`, `be/prisma/**`, `be/package.json`, `fe/src/**`, `fe/package.json`, `docker-compose.yml`, `observability/**`.

## 1. Executive Summary

- **What:** SIMAD is a web platform digitizing the full internship cycle at PT PLN (Persero): online application → HR verification + quota allocation (concurrency-protected) → onboarding → geofenced daily attendance → supervisor corrections/evaluations → HR grading → QR-coded e-certificates. Plus dashboards, reporting/Excel export, audit trail, notifications.
- **Architecture style:** Frontend + backend separation in one repository (not npm-workspace monorepo, no shared packages). Backend is a **pragmatic layered modular monolith**: `Elysia Route → Thin Controller → Service (business logic + direct Prisma) → PostgreSQL`. There is **no Repository/DAO layer**. Frontend is **feature-based Next.js App Router** with `Page → Container (_containers) → Page Section → Organisms/Atoms → useApi Hook Facade → Service → API Client → Backend`.
- **Frontend:** Next.js 16 (App Router, Turbopack), React 19, Tailwind, Radix UI, TanStack Query v5 (all server state). See `fe/package.json`, `fe/src/app/providers.tsx`, `fe/src/hooks/useService/useApi.ts`.
- **Backend:** Bun 1.2+ runtime, Elysia.js 1.4 framework, Prisma ORM 7 (`@prisma/client@7.10.0` + `@prisma/adapter-pg` + `pg` Pool). See `be/package.json`, `be/src/app.ts`, `be/prisma/client/index.ts`.
- **Database:** PostgreSQL 17 (Docker service `db`), ~40 Prisma models, statuses as `String` (no Prisma enums), RBAC via `User/UserRole/Role` tables. See `be/prisma/schema.prisma`, `docker-compose.yml:1-20`.
- **Major infra/services:** Cloudflare R2 (S3 API) for files/certs/avatars, Resend for email, Google OAuth2 + Google Calendar holiday API + Photon/Nominatim geocoding (via Next proxy), Web Push (VAPID), OpenTelemetry → Alloy → Loki/Tempo/Prometheus → Grafana. Cron is **HTTP-triggered** (`/cron/*`), not an in-process scheduler. No WebSocket server; no Redis; Swagger deps installed but not wired.

## 2. Repository Structure

Simplified, architecture-relevant only:

```text
SIMAD/
├── be/                              # Backend (Bun + Elysia + Prisma 7)
│   ├── prisma/
│   │   ├── schema.prisma            # ~40 models, postgresql datasource
│   │   ├── migrations/              # SQL migrations
│   │   ├── seed.ts                  # Roles, permissions, institutions, quotas, admin
│   │   └── client/index.ts          # Singleton PrismaClient via pg Pool + PrismaPg adapter
│   ├── src/
│   │   ├── serve.ts                 # Bootstrap: telemetry → DB retry → app.listen
│   │   ├── app.ts                   # helmet → cors → otel → Lifecycle → cronRoutes → apiRoutes
│   │   ├── routes/                  # 23 Elysia routers (authRoutes.ts … userRoutes.ts + apiRoutes.ts)
│   │   ├── controllers/             # 22 thin singletons (AuthController.ts … UserController.ts)
│   │   ├── services/                # 24 business-logic singletons (*.service.ts, direct prisma import)
│   │   ├── dtos/                    # Runtime validation (TypeBox/Elysia schemas, *.dto.ts)
│   │   ├── types/                   # Static TS shapes only (*.types.ts + request.type.ts)
│   │   ├── middlewares/             # auth.ts, api-key.ts, rateLimit.ts, idempotency.ts
│   │   ├── validation/              # auth.validate.ts (dead code, 8 lines, unused)
│   │   ├── http/                    # error.ts (AppError) + index.ts (HttpResponse envelope)
│   │   ├── contex/index.ts          # AppContext (user, body, query, params, store)
│   │   ├── config/                  # env.config.ts (zod), databases.ts (connect/retry/health)
│   │   ├── utils/                   # auth, geofence, audit, r2, storage, pdf, email-template, cors, lifecycle
│   │   └── telemetry/otel.config.ts # OTel meters/loggers, pino bridge
│
├── fe/                              # Frontend (Next.js 16 App Router)
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx / providers.tsx / composeProvinders.tsx
│   │   │   ├── (auth)/              # login, register, forgot/reset, verify, magic-link, check-email
│   │   │   │   └── login/page.tsx + _containers/login.tsx
│   │   │   ├── (private)/           # layout.tsx guard + dashboard, hr_admin/*, intern/*, supervisor/*, receptionist/*
│   │   │   │   └── intern/attendance/_containers/attendance.tsx (representative)
│   │   │   ├── (public)/home/
│   │   │   └── api/                 # Next route handlers: geocode/route.ts, files/preview/route.ts, session/delete/route.ts
│   │   ├── components/
│   │   │   ├── atoms/               # shadcn/Radix primitives (button, input, dialog, badge …)
│   │   │   ├── organisms/           # Domain composites (LoginForm, AttendanceMap, DataTableCard …)
│   │   │   └── page/                # Full sections with {state, service} contract (LoginSection, AttendanceSection …)
│   │   ├── hooks/useService/        # useApi.ts facade → useAuth/useAttendance/… → state/{query.ts,mutate.ts}
│   │   ├── services/api/            # 21 domain services (auth.service.ts …) + props.service.ts aggregator
│   │   ├── api/
│   │   │   ├── api-entry.ts         # Api() → {client, server}
│   │   │   ├── client/client-http.ts + auth-refresh.ts   # Browser fetch wrapper + single-flight refresh
│   │   │   └── server/server-fetch.ts                    # SSR variant (next/headers cookies + redirect)
│   │   ├── configs/                 # repo, cookies, query-key, app (role paths/menus), endpoints/*, env
│   │   ├── core/providers+layouts+components/  # AuthProvider, AppShell, AppSidebar/Header …
│   │   ├── pkg/react-query/         # QueryClient factory (staleTime 60s) + provider
│   │   └── utils/                   # session-cookie, service-response, wrapApi, geofence, log, cache/* …
│
├── observability/                   # alloy/config.alloy, prometheus.yaml, loki/config.yaml, tempo.yaml, grafana/*
├── docker-compose.yml               # db (postgres:17) + alloy + prometheus + loki + tempo + grafana
└── docs/                            # 01-overview … 07-api-specification, erd.sql, prd (not architecture source)
```

No `src/repositories/`, `src/dao/`, `*Repository.ts` anywhere in `be/src` (verified by grep — zero hits). No `fe/middleware.ts` (guards are layout-level).

## 3. Technology Stack

| Area                          | Technology                                                                                                                                    | Role                                                                                                                |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Frontend framework            | Next.js 16 App Router + React 19 (`fe/package.json:48-55`)                                                                                    | Routing, SSR/SSG, server/client components                                                                          |
| UI                            | Radix Primitives, Tailwind, Lucide, Sonner, Framer Motion                                                                                     | Design system / primitives / feedback                                                                               |
| Client server-state           | TanStack Query v5 (`@tanstack/react-query ^5.101.0`)                                                                                          | All async state; keys in `fe/src/configs/query-key.ts`; client in `fe/src/pkg/react-query/query-client.pkg.tsx`     |
| Client forms/maps             | react-hook-form + zod, leaflet/react-leaflet, recharts                                                                                        | Validation, geofence map picker, charts                                                                             |
| Backend runtime/framework     | Bun 1.2+, Elysia.js 1.4 (`be/package.json:21-44`)                                                                                             | HTTP server, routing, TypeBox validation, hooks                                                                     |
| ORM / DB driver               | Prisma 7 + `@prisma/adapter-pg` + `pg Pool(max:20)` (`be/prisma/client/index.ts:29-41`)                                                       | Persistence; singleton `prisma` imported directly by services                                                       |
| Database                      | PostgreSQL 17 (`docker-compose.yml:3`)                                                                                                        | System of record; ~40 models in `be/prisma/schema.prisma`                                                           |
| Auth                          | `jsonwebtoken` + `bcryptjs` + `google-auth-library` (`be/src/utils/auth.util.ts`, `be/src/services/auth.service.ts:17-18`)                    | Bearer JWT (access 3600s, refresh 7d DB-persisted, email tokens 24h), password hash cost 10, Google ID-token verify |
| Validation                    | Elysia/TypeBox DTOs (`be/src/dtos/*.dto.ts`) + service-level `AppError`                                                                       | Shape check pre-handler; business rules in services                                                                 |
| File storage                  | Cloudflare R2 via `@aws-sdk/client-s3` (`be/src/utils/r2-utils.ts`, `be/src/services/file.service.ts`)                                        | Buckets/prefixes `simad/{sertifikat,avatars,fileuniv}`; FE preview proxy in `fe/src/app/api/files/preview/route.ts` |
| Email                         | Resend (`be/src/services/email.service.ts:1-51`)                                                                                              | Verify/magic-link/reset/start-date mails; templates in `be/src/utils/email-template.util.ts`                        |
| Push                          | `web-push` + VAPID (`be/src/services/webPush.service.ts`, `fe/src/hooks/usePushNotification.ts`)                                              | Push subscriptions, bulk send chunk 25, prune 404/410                                                               |
| Geocoding                     | Photon + Nominatim via Next proxy (`fe/src/app/api/geocode/route.ts:50-100`)                                                                  | Office map picker; coordinate-string shortcut; server-side to avoid CORS/adblock                                    |
| Calendar/holiday              | Google Calendar API via axios (`be/src/services/calendar.service.ts:12-51`)                                                                   | `getDayStatus` blocks WEEKEND/HOLIDAY in attendance                                                                 |
| Excel export                  | `exceljs` (`be/src/services/attendance.service.ts`)                                                                                           | HR attendance `.xlsx` export (raw `Response`, not envelope)                                                         |
| Observability                 | OTel SDK + pino → Alloy → Loki/Tempo/Prometheus → Grafana (`be/src/telemetry/otel.config.ts`, `observability/*`, `docker-compose.yml:22-103`) | Traces, logs, metrics, dashboards                                                                                   |
| Env validation                | zod (`be/src/config/env.config.ts`), `@t3-oss/env-nextjs` (`fe/src/configs/env.config.ts`)                                                    | Fail-fast on bad env; BE exits 1 on parse fail                                                                      |
| Installed but UNUSED in `src` | `socket.io`, `cloudinary`, `stripe`, `sharp`, `@elysiajs/cron`, `@elysiajs/swagger` (present in `be/package.json`, zero imports in `be/src`)  | Do not diagram; realtime = Web Push only, cron = HTTP routes, no `/swagger` endpoint                                |

## 4. High-Level Architecture

Actual implementation (do not simplify to textbook MVC):

```text
User
 ↓ interaction
Next.js Web App (App Router)
 ├─ Page (server, metadata) → Container (_containers/*.tsx, 'use client')
 │    → Page Section (components/page/*, {state, service} props)
 │    → Organisms + Atoms
 ↓
Hook Facade (hooks/useService/useApi.ts → useX query/mutate, TanStack Query)
 ↓
Frontend Service (services/api/*.service.ts → Api().client.*Response + toServiceResponse)
 ↓
API Client (api/client/client-http.ts: Bearer + x-internal-api-key, 401 → single-flight refresh → retry once)
 ↓ HTTPS (NEXT_PUBLIC_BACKEND_URL + GATE + VERSION, e.g. http://localhost:5000/api/v1)
Backend Elysia App (app.ts: helmet → cors → otel → Lifecycle → cronRoutes → apiRoutes)
 ↓
API Router (routes/apiRoutes.ts prefix /api/v1 + InternalApiKey) → Feature Router (routes/*Routes.ts: prefix + DTO schema + beforeHandle chain)
 ↓
Middleware chain (verifyToken → requireRole → rateLimit → idempotency; DTO VALIDATION failure → 400)
 ↓
Thin Controller (controllers/*Controller.ts: cast body/query/params/user → await Service → HttpResponse envelope)
 ↓
Service (services/*.service.ts: business rules + direct `import prisma from '../../prisma/client'` + $transaction + pg_advisory_xact_lock + cross-service calls)
 ↓
Prisma Client singleton (prisma/client/index.ts: pg Pool max20 → PrismaPg adapter)
 ↓
PostgreSQL 17 (+ side effects: R2 / Resend / WebPush / Google Calendar inside services)
```

Return path mirrors it: `DB → Prisma → Service → Controller (HttpResponse envelope) → HTTP JSON → API Client → Service (toServiceResponse → TResponse) → React Query cache → Container state → Section/Organisms → User`. The one exception is binary export (`AttendanceController.exportAttendance` returns raw `Response` with `xlsx` headers, consumed by `client.DownloadResponse → blob → <a download>`).

Deployment view: two app containers/processes (`be` Bun :5000, `fe` Next :3000) + `db` Postgres :5432 + observability stack (Alloy :4317/4318, Prometheus :9090, Loki :3100, Tempo :3200, Grafana :3001). No Redis, no queue, no WS server.

## 5. Architecture Layers

### 5.1 Presentation Layer (FE: Pages + Containers + Components)

- **Responsibility:** Route segments, metadata, role-grouped screens, local UI state, render only. No direct `fetch` in components; all data via hooks.
- **Dirs/files:** `fe/src/app/(auth)/*/page.tsx` + `_containers/*.tsx` (e.g. `fe/src/app/(auth)/login/page.tsx`, `fe/src/app/(auth)/login/_containers/login.tsx`); `fe/src/app/(private)/**/page.tsx` + `_containers/*.tsx` (e.g. `fe/src/app/(private)/intern/attendance/_containers/attendance.tsx`); `fe/src/components/page/*` (e.g. `auth/login/LoginSection.tsx`, `attendance/AttendanceSection.tsx`); `fe/src/components/organisms/*` (e.g. `LoginForm.tsx`, `attendance/AttendanceLocationDialog.tsx`); `fe/src/components/atoms/*` (button, input, dialog …); `fe/src/core/layouts/app-shell.layout.tsx`, `fe/src/core/components/app-sidebar.tsx`.
- **Called by:** User interaction / Next router.
- **Calls:** Hook facade (`useApi()`).
- **Notes:** Strict `page.tsx (server) → _containers (client) → Section ({state, service}) → organisms/atoms` pattern. Role segments `hr_admin/intern/supervisor/receptionist` + `(auth)/(private)/(public)` groups. Guards are `fe/src/app/(private)/layout.tsx` (redirect `/login` if no `simad_session` cookie) and `fe/src/app/(auth)/layout.tsx` (reverse), plus `fe/src/core/providers/auth.provider.tsx` SPA guard. No `middleware.ts`.

### 5.2 Application / State Layer (FE: Hooks + React Query + Configs)

- **Responsibility:** Server-state cache, mutations with toasts + invalidation, query keys, role routing, session cookies.
- **Dirs/files:** `fe/src/hooks/useService/useApi.ts` (single entry: `api.auth.query.me()`, `api.attendance.mutate.checkIn()`); `fe/src/hooks/useService/*/{use*.ts,state/query.ts,state/mutate.ts}` (e.g. `auth/state/mutate.ts:36-66 useRegister`, `attendance/state/query.ts`, `attendance/state/mutate.ts`); `fe/src/hooks/useService/_shared/useAppMutation.ts` (standard toast+invalidate wrapper); `fe/src/hooks/useAppNameSpace.ts` (queryClient+alert+router); `fe/src/configs/query-key.ts`, `fe/src/configs/app.config.ts` (`ROLE_DASHBOARD_PATH`, `ROLE_SIDEBAR_MENU`), `fe/src/pkg/react-query/query-client.pkg.tsx` (`staleTime:60s`, `refetchOnWindowFocus:false`); `fe/src/utils/session-cookie.ts`, `fe/src/utils/cache/*.cache.ts` (optimistic snapshots).
- **Called by:** Containers.
- **Calls:** Frontend services (`services/api/*`).
- **Notes:** Redux Toolkit + redux-persist are in `fe/package.json` but **zero references** in `fe/src` — do not diagram. Real store = React Query cache + cookies (`simad_session/simad_refres/simad_role`) + `localStorage` (remembered account, `simad-device-id`) + local `useState`.

### 5.3 Frontend Service / API-Client Layer

- **Responsibility:** 1:1 mapping to backend endpoints, envelope normalization, transport (headers, refresh, download).
- **Dirs/files:** `fe/src/services/api/*.service.ts` (21 files; e.g. `auth.service.ts:40-53 Register → client.PublicPostResponse(AUTH_ENDPOINTS.REGISTER) → toServiceResponse`); `fe/src/services/props.service.ts` (`WrapApi` throws on `status==='error'` so React Query `onError` fires); `fe/src/api/api-entry.ts` (`Api() → {client, server}`); `fe/src/api/client/client-http.ts` (`buildApiUrl` from `configs/repo.config.ts`, `buildBaseHeaders` injects `x-internal-api-key` + `Authorization: Bearer`, 401 → `auth-refresh.ts` single-flight retry-once, else redirect `/login`); `fe/src/api/client/auth-refresh.ts` (`POST /auth/refresh-token`, updates access cookie only); `fe/src/api/server/server-fetch.ts` (same via `next/headers` httpOnly cookies, `redirect('/login')` on fail, `proxyGatewayRequest` for route handlers); `fe/src/configs/endpoints/*.endpoints.ts` (relative paths mirroring BE); `fe/src/utils/service-response.ts`, `fe/src/utils/wrapApi.ts`.
- **Called by:** Hooks.
- **Calls:** Backend over HTTPS; Next internal routes (`/api/geocode`, `/api/files/preview`) for browser-safe proxying.
- **Notes:** Dual client/server split is explicit in `api-entry.ts` docstring. `DownloadResponse` returns raw `Response` for Excel blobs.

### 5.4 Transport / Route Layer (BE: Elysia Routers + DTOs)

- **Responsibility:** Path prefixes, runtime schema validation, per-route middleware composition, OpenAPI `detail` metadata (swagger-ready but unserved).
- **Dirs/files:** `fe/src/app/api/*/route.ts` (Next handlers — see 5.4b) ; `be/src/routes/apiRoutes.ts:26-68` (prefix `/api/v1`, global `InternalApiKey`, mounts 20 routers → final paths `/api/v1/auth/*`, `/api/v1/attendance/*`, `/api/v1/internship-quotas/*` …); `be/src/routes/authRoutes.ts:27-243` (16 auth endpoints), `be/src/routes/attendanceRoutes.ts:33-138` (10 endpoints, `check-in/out` add `rateLimit+idempotency`), `be/src/routes/applicationRoutes.ts`, `quotaRoutes.ts`, etc.; `be/src/dtos/*.dto.ts` (e.g. `auth.dto.ts:10-108 Register/Login/GoogleLogin`, `attendance.dto.ts:5-70 CheckInDto{latitude,longitude,accuracy…}` via `elysia`/`@sinclair/typebox`); `be/src/app.ts:33-41` (global order).
- **Called by:** API Client / HTTP.
- **Calls:** Controller methods.
- **Notes (5.4b Next internal routes):** `fe/src/app/api/geocode/route.ts` (coord-parse → Photon → Nominatim fallback); `fe/src/app/api/files/preview/route.ts` (R2 `GetObjectCommand` stream with `Content-Disposition`/`Cache-Control`); `fe/src/app/api/session/delete/route.ts` (clears 3 cookies). These call third-party/R2/BE, never Postgres directly.

### 5.5 Middleware / Cross-Cutting Layer (BE)

- **Responsibility:** AuthN/Z, abuse protection, exactly-once semantics, observability envelope.
- **Files:** `be/src/middlewares/auth.ts:16-134` (`verifyToken`: Bearer → `verifyJwtToken` → `prisma.user.findUnique(include userRoles/avatar/office/department)` → `c.user:AuthUser`, default role `intern` from `be/src/utils/auth.util.ts:9`; `requireRole`: case-insensitive subset → 403; `optionalAuth`: best-effort); `be/src/middlewares/api-key.ts:3-53` (`x-internal-api-key` timing-safe vs `INTERNAL_API_SECRET`, applied globally in `apiRoutes.ts:43` — every `/api/v1/*` needs it **plus** JWT); `be/src/middlewares/rateLimit.ts:25-120` (in-memory fixed window, rules `LOGIN 5/min, FORGOT 3/h, MAGIC 5/h, REGISTER 10/h, ATTENDANCE 1/10s, UPLOAD 10/min`, 429 + `RATE_LIMIT_001`); `be/src/middlewares/idempotency.ts:23-119` (in-memory `Idempotency-Key`, 24h TTL, `pending→409 IDEM_001`, cache only 2xx); `be/src/utils/lifecycle.ts` (`onRequest` requestId/metrics, `onAfterHandle` timing, `onError` maps `VALIDATION→400` with field errors); `be/src/utils/cors.ts`, `elysia-helmet`, `be/src/telemetry/otel.config.ts`.
- **Order:** `helmet → cors → otel → Lifecycle.onRequest → cronRoutes (CRON_SECRET, outside /api/v1) → apiRoutes(InternalApiKey → DTO validation → verifyToken → requireRole → rateLimit → idempotency) → handler → idempotency.afterHandle → Lifecycle.onAfterHandle/onError`.
- **Notes:** Rate-limit + idempotency are single-process `Map`s with code comments warning they need Redis for multi-instance. `validation/auth.validate.ts` is dead code (8 lines, never imported) — real validation is DTOs + services.

### 5.6 Controller / Handler Layer (BE — thin)

- **Responsibility:** Extract `c.body/query/params/user/headers`, call one service method, map to `HttpResponse` envelope, `catch → handleAppError`. No business logic, no Prisma.
- **Files:** `be/src/controllers/AuthController.ts:24-247` (header comment “thin… all logic in Service”; e.g. `login: body → AuthService.login → ok(data)`), `be/src/controllers/AttendanceController.ts:30-50` (`checkIn(c.user!.id, body, getMeta(ip/user-agent))`), plus `ApplicationController.ts`, `QuotaController.ts:17-82`, `CertificateController.ts`, etc.; `be/src/contex/index.ts:6-18` (`AppContext` type all handlers use); `be/src/http/index.ts:58-222` (`HttpResponse(c).ok/created/…`, `handleAppError` maps `AppError` + Prisma `P2002→409, P2025→404, P1001/P2024→503`); `be/src/http/error.ts:9-49` (`AppError`, `BadRequest/Unauthorized/…`).
- **Called by:** Routes.
- **Calls:** Exactly one service (plus `HttpResponse`/`handleAppError`).
- **Notes:** Single exception to envelope: `AttendanceController.exportAttendance` returns raw `Response` (xlsx). Ownership checks occasionally in controller (e.g. `getById` restricts `intern` to own rows) but bulk of authZ is middleware.

### 5.7 Business / Domain Layer (BE — Services + Utils)

- **Responsibility:** All business rules, transactions, concurrency control, cross-service orchestration, external calls.
- **Files:** `be/src/services/auth.service.ts:28-748` (`bcryptjs.hash/compare`, `signAccessToken/Refresh/EmailToken`, `OAuth2Client.verifyIdToken`, `prisma.user/refreshToken/role`, `sendEmail`); `be/src/services/attendance.service.ts:248-1257` (Haversine via `utils/geofence.util.ts`, `calendar.service.getDayStatus`, 08:00 late logic, ExcelJS export); `be/src/services/application.service.ts:113-901` (state machine `DRAFT→SUBMITTED→APPROVED/REJECTED`, `generateApplicationNumber`, `$transaction` + advisory lock + best-effort `sendStartDateEmail`); `be/src/services/quota.service.ts:16-497` (capacity math, `groupBy` occupancy); `be/src/services/certificate.service.ts` (advisory `cert_number_*` + `FileService.upload` PDF + compensating `deleteFromR2` on fail); `be/src/services/{internship,evaluation,correction,reporting,dashboard,notification,file,email,webPush,calendar,cleanup,…}.service.ts`; helpers `be/src/utils/auth.util.ts` (password policy 8+upper/lower/digit/symbol), `geofence.util.ts` (`haversineDistance`, `checkInsideGeofence`), `audit.util.ts` (`createAuditLog(tx,…)`), `r2-utils.ts`/`storage.util.ts`, `pdf.util.ts`, `email-template.util.ts`.
- **Called by:** Controllers (and other services: `application→email`, `attendance→calendar`, `certificate→file/notification`, `notification→webPush` fire-and-forget `.catch()`).
- **Calls:** Prisma directly (`import prisma from '../../prisma/client'` in every service + `middlewares/auth.ts`), plus external SDKs.
- **Notes:** No service calls controllers/routes. Transactions: `prisma.$transaction([…])` (e.g. `auth.service.ts:50-62`) and `prisma.$transaction(async tx=>…)` (e.g. `application.service.ts:688`, `attendance.service.ts:325`). Advisory locks: `application.service.ts:693`, `internship.service.ts:601,698,896` (`quota_<officeId>`), `certificate.service.ts:223` (`cert_number_<OFFICE>_<YEAR>`).

### 5.8 Persistence Layer (Prisma Singleton + Connection)

- **Responsibility:** Single PrismaClient construction, connection retry/health, pool tuning.
- **Files:** `be/prisma/client/index.ts:1-44` (`formatDatabaseUrl` injects `pool_timeout=30, connection_limit=20, pgbouncer=true` for `-pooler.`; `new Pool({max:20,…}) → new PrismaPg(pool) → new PrismaClient({adapter})`; exports `{pool, adapter, prisma}`); `be/src/config/databases.ts:1-53` (`connectWithRetry(30×3s)` with `SELECT 1`, `disconnectDatabase`, `checkDatabaseHealth/pingDatabase` used by `HealthController`/`CronController`).
- **Called by:** Every service + `middlewares/auth.ts` + `serve.ts` bootstrap.
- **Calls:** PostgreSQL over `DATABASE_URL`.
- **Notes:** No repository abstraction — grep confirms 29 `from…prisma/client` imports across services/middleware and zero `*Repository*` files. Pagination pattern is `prisma.$transaction([count, findMany])` (e.g. `notification.service.ts:83`).

### 5.9 Database Layer

- **Responsibility:** System of record.
- **Files:** `be/prisma/schema.prisma` (801 lines, `provider postgresql`, `generator prisma-client-js`, ~40 models — see §14 evidence for entity groups); `be/prisma/migrations/*`; `be/prisma/seed.ts` (1071 lines, idempotent `upsert`: 4 roles, ~33 permissions, education/institutions/majors/skills, notification types, departments/offices/attendance-settings, admin user via `bcrypt`, per-office quotas + certificate settings, guides); `be/prisma.config.ts` (schema/migrations/seed paths, `DATABASE_URL`).
- **Notes:** No Prisma enums — statuses are `String @db.VarChar(50)` enforced in TS (e.g. `InternshipStatus` in service code). Key constraints: `Attendance @@unique(internshipId+attendanceDate)`, `Certificate @@unique(internshipId/certificateNumber)`, `InternshipQuota @@unique(officeLocationId)`.

### 5.10 Infrastructure / External-Service Layer

| Component                | BE caller → External                                                                                                                                       | FE caller                                                                       |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| PostgreSQL 17            | `prisma/*` → `db:5432` (`docker-compose.yml:1-20`)                                                                                                         | —                                                                               |
| Cloudflare R2 (S3 API)   | `services/file.service.ts` + `utils/r2-utils.ts` (`PutObject/GetObject/Delete`, bucket `simad`)                                                            | `app/api/files/preview/route.ts` (stream proxy)                                 |
| Resend email             | `services/email.service.ts` (`new Resend(RESEND_API_KEY)`, dev-mode log if missing)                                                                        | —                                                                               |
| Google OAuth             | `services/auth.service.ts:292-301 verifyIdToken`                                                                                                           | `@react-oauth/google` button in `organisms/LoginForm.tsx`                       |
| Google Calendar holidays | `services/calendar.service.ts` → `googleapis.com/calendar/v3/…indonesian#holiday`                                                                          | —                                                                               |
| Photon/Nominatim geocode | — (BE never calls them)                                                                                                                                    | `app/api/geocode/route.ts` → `photon.komoot.io` → `nominatim.openstreetmap.org` |
| Web Push                 | `services/webPush.service.ts` (VAPID, chunk 25, prune 404/410)                                                                                             | `hooks/usePushNotification.ts`, `public/sw.js`                                  |
| Observability            | `telemetry/otel.config.ts` OTLP → Alloy `:4317/4318` → Tempo/Loki/Prometheus → Grafana `:3001`                                                             | `core/providers/health-ping.provider.tsx` (backend ping)                        |
| Cron trigger             | `routes/cronRoutes.ts` + `controllers/CronController.ts` + `services/{internship,cleanup}.service.ts` (external scheduler hits HTTP; `CRON_SECRET` Bearer) | —                                                                               |

## 6. Frontend Architecture

- **Routing (App Router groups):** `(auth)` public + reverse guard (`fe/src/app/(auth)/layout.tsx`: redirect `/dashboard` if `simad_session` exists) — `login/register/forgot-password/reset-password/verify-email/magic-link/check-email`; `(private)` authed guard (`fe/src/app/(private)/layout.tsx`: server `cookies().get('simad_session')` → `redirect('/login')`, wraps `AppShell`) — `dashboard` dispatcher + `hr_admin/*` (applications, quotas, offices, departments, evaluations, certificates/approvals, reports, audit-logs …), `intern/*` (dashboard, application, attendance, history, onboarding, certificate, guide, profile), `supervisor/*` (dashboard, attendance, attendance-corrections, evaluations, interns), `receptionist/*` (dashboard, applications, availability, interns); `(public)/home`; dynamic `[id]/[attendanceId]` details; `[...not-found]`.
- **Page → Container contract:** `page.tsx` (server, `metadata`) renders one `_containers/*.tsx` (`'use client'`) that owns `useState` + `useApi()` + `useAppNameSpace()` and passes `{state, service}` to `components/page/*Section.tsx`, which composes `organisms/*` + `atoms/*`. Examples: `fe/src/app/(auth)/login/page.tsx` → `fe/src/app/(auth)/login/_containers/login.tsx:13-63` (`formLogin`, `rememberedAccount` from `localStorage`, `api.auth.mutate.login()`, `login.mutate(formLogin)`) → `components/page/auth/login/LoginSection` → `organisms/LoginForm.tsx`; `fe/src/app/(private)/intern/attendance/_containers/attendance.tsx` (parallel `auth.query.me()`, `attendance.query.today/summary/my()`, `internship.query.my()`; `attendance.mutate.checkIn/checkOut()`; `deviceId` from `localStorage simad-device-id`/`crypto.randomUUID()`; geolocation → `checkIn.mutate({latitude,longitude,accuracy,deviceId,…})`) → `components/page/attendance/AttendanceSection` + `organisms/attendance/AttendanceLocationDialog`.
- **State:** TanStack Query only (no Redux — installed but unreferenced). `fe/src/pkg/react-query/query-client.pkg.tsx` singleton browser client; `fe/src/configs/query-key.ts` centralizes all keys (`authRoot/attendanceRoot/…`); `fe/src/hooks/useService/_shared/useAppMutation.ts` standardizes `cancelQueries → optimistic snapshot (utils/cache/*) → toast → invalidateQueries onSettled`.
- **API communication:** Services are 1:1 with BE routes (`fe/src/services/api/auth.service.ts` docstring cites `be/src/routes/authRoutes.ts`; `attendance.service.ts` cites `attendanceRoutes.ts`). Every method: `client.*Response(ENDPOINT, body) → toServiceResponse → TResponse{statusCode, status:'success'|'error', title, message, data, meta, errors}` (`fe/src/api/types/response.types.ts`, `fe/src/utils/service-response.ts`), wrapped by `WrapApi` (`fe/src/utils/wrapApi.ts`) to throw on error for React Query. Transport (`fe/src/api/client/client-http.ts:59-77`) always sends `x-internal-api-key` + optional `Bearer`; 401 triggers `auth-refresh.ts` single-flight `POST /auth/refresh-token` → `setSessionCookies` → retry once → else `clearSessionCookies` + `/login`. Server twin (`fe/src/api/server/server-fetch.ts`) uses `next/headers` httpOnly cookies + `redirect('/login')` + per-request `Logger`.
- **Auth state:** BE returns tokens in JSON body (never `Set-Cookie`). FE persists `simad_session` (~1h/`expiresIn`), `simad_refres` (24h), `simad_role` (24h) via `fe/src/utils/session-cookie.ts` (browser `document.cookie`, non-httpOnly) and server `cookies().set(httpOnly, 15m)` in `server-fetch.ts`. Writes on login/google/magic-link/refresh (`fe/src/hooks/useService/auth/state/mutate.ts`), reads in `client-http.ts`/`AuthProvider`/`(private)/layout.tsx`, deletes on logout/401 (`clearSessionCookies` + `queryClient.clear()` + `router.push('/login')`). Role drives `getRoleDashboardPath` (`fe/src/configs/app.config.ts`) and `ROLE_SIDEBAR_MENU`.
- **Providers:** `fe/src/app/providers.tsx:18-33` outer→inner: `StyledComponentsRegistry > SidebarProvider > GoogleOAuthProvider > AuthProvider > ThemeProvider > AlertProvinder > LenisProvider > ReactQueryClientProvider`, inner `HealthPingProvider + PWAUpdatePrompt + NextTopLoader + Devtools`.

## 7. Backend Architecture

- **Bootstrap:** `be/src/serve.ts:11-69` (`initTelemetry → connectWithRetry → app.listen(env.PORT)`, graceful `SIGINT/SIGTERM` drains `pendingRequests` 10s → `disconnectDatabase → shutdownTelemetry`). `be/src/app.ts:33-41` wires `helmet → cors(resolveCorsOrigins) → otel (if OTEL_ENABLED) → Lifecycle → cronRoutes → apiRoutes`; `routes()` only adds `GET /, /health, /ping → HealthController.check`.
- **Routes:** `be/src/routes/apiRoutes.ts:30-66` (`prefix /api/v1` + `derive json()` + global `InternalApiKey` + 20 routers). Each feature router is a class exposing a singleton Elysia instance with `prefix` (e.g. `/auth`, `/attendance`, `/internship-quotas`, `/applications`), per-endpoint `body/query/params` DTO + `beforeHandle` array + `detail{summary,tags}`. Representative: `authRoutes.ts:68-78 POST /login {body:LoginDto, beforeHandle:[rateLimit(LOGIN)]}`, `attendanceRoutes.ts:37-46 POST /check-in {beforeHandle:[verifyToken, requireRole(['intern']), rateLimit(ATTENDANCE,keyByUser), idempotency], afterHandle:[idempotency], body:CheckInDto}`.
- **Middleware:** See §5.5. Auth is stateless Bearer + DB lookup per request (roles lowercased, default `intern`). Public auth endpoints use only `rateLimit`; authed endpoints add `verifyToken (+ requireRole)`; mutating hot paths add `idempotency` (attendance check-in/out, application approve/reject, certificate issue).
- **Controllers/Handlers:** Singletons, thin by documented convention (header comments in `AuthController.ts:17-23`, `AttendanceController.ts:13-17`, `ApplicationController.ts:12-16`). Pattern: `cast c.body/query/params/user → await Service.* → HttpResponse(c).ok/created → catch handleAppError`. No Prisma imports in controllers.
- **Services/Use cases:** Singletons holding all rules + Prisma + transactions + external calls (see §5.7). Cross-service: `AuthService → email.service`; `ApplicationService.approve → quota check (advisory lock) + internship + supervisor assignment + sendStartDateEmail (best-effort try/catch)`; `AttendanceService → calendar.service + geofence.util + audit.util`; `CertificateService → FileService (R2) + pdf.util + notification.service`; `NotificationService → webPush.service.sendBulkPush().catch()` (non-blocking).
- **ORM/DB:** Singleton `prisma` (`be/prisma/client/index.ts`) via `pg Pool`; `databases.ts` retry/health. No repository; services call `prisma.<model>.*` directly (29 import sites). Migrations via `prisma migrate`, seeds via `prisma/seed.ts`.
- **Cron/Infra:** `be/src/routes/cronRoutes.ts:1-80` (`prefix /cron`, own `CRON_SECRET` Bearer check — not `verifyToken`/`InternalApiKey`; `GET+POST /ping|warmup|internship|cleanup/*`) mounted twice (`app.ts:39` as `/cron` and `apiRoutes.ts:65` as `/api/v1/cron`). `CronController` delegates to `pingDatabase`, `internship.service.runInternshipCronAutomations` (PENDING→ACTIVE, ACTIVE→COMPLETED), `cleanup.service` (delete inactive users 30d grace in tx + audit; orphaned files 60d; R2 delete marked TODO). `@elysiajs/cron` never imported — external scheduler expected.

## 8. Request Lifecycle (Generic — Adjusted to Reality)

1. User triggers action in a `_containers/*.tsx` component (e.g. submits `LoginForm`, taps Check-In).
2. Container calls hook facade (`api.auth.mutate.login()`, `api.attendance.mutate.checkIn()`, or `api.x.query.*()` for reads).
3. Hook invokes frontend service (`AuthService.Login`, `AttendanceService.CheckIn`) which calls `Api().client.*Response(ENDPOINT, payload)`.
4. API client builds URL (`repo.config.ts` base + `endpoints/*.endpoints.ts` path), attaches `x-internal-api-key` + `Authorization: Bearer <simad_session>` (`client-http.ts:59-77`), `fetch(..., {credentials:'same-origin', cache:'no-store'})`.
5. Request hits BE `app.ts` globals: `helmet → cors → otel → Lifecycle.onRequest (requestId, metrics)`.
6. `apiRoutes` runs `InternalApiKey` (401/403/500); failure short-circuits with envelope.
7. Feature router validates `body/query/params` against TypeBox DTO; mismatch throws `VALIDATION` → `Lifecycle.onError` returns `400 {errors:[{field,message}]}` without reaching controller.
8. `beforeHandle` chain: `verifyToken` (Bearer → JWT verify → `prisma.user` lookup → `c.user`) → `requireRole` (403 if missing) → `rateLimit` (429 if over) → `idempotency` (replay cached 2xx or 409 if pending).
9. Thin controller extracts typed input, calls exactly one service method with plain args + `getMeta(ip,user-agent)` where relevant.
10. Service enforces business rules (throw `AppError` on violation), opens `prisma.$transaction` and/or `pg_advisory_xact_lock` for racy paths, runs `prisma.<model>` queries, calls side-effect services (email/R2/push/calendar) — email/push failures are logged/swallowed or fire-and-forget, never roll back the tx (except certificate compensates R2 on DB fail).
11. PostgreSQL returns rows; Prisma maps to objects.
12. Service returns plain data (or `{data, meta}` for paginated lists).
13. Controller wraps in `HttpResponse(c).ok/created(data, meta?, message)` envelope `{status,title,message,data,meta}` (binary export bypasses envelope).
14. `afterHandle` (idempotency cache 2xx) + `Lifecycle.onAfterHandle` (duration log + metrics) complete; errors funnel via `handleAppError` (Prisma-code mapping + `getLogger`).
15. FE client parses JSON; `!ok || success===false` → 401 triggers single-flight refresh + one retry, else `throw ApiError` → `toServiceResponse` → `WrapApi` throws for React Query `onError`.
16. Hook `onSuccess/onError` toasts (`AlertProvinder`), invalidates `queryKey.*Root()`; query hooks write React Query cache.
17. Container re-renders `Section → organisms/atoms` from cache; mutations navigate (`getRoleDashboardPath(role)`) or close dialogs on success.
18. User sees result (toast + updated UI; Excel flow downloads blob instead).

## 9. Real Use-Case Traces (File Evidence per Step)

### Flow 1 — Authentication (Login with email+password)

1. User submits form in `fe/src/components/organisms/LoginForm.tsx` rendered by `fe/src/components/page/auth/login/LoginSection.tsx`.
2. `fe/src/app/(auth)/login/_containers/login.tsx:48-63` — `login = api.auth.mutate.login()`, `handleSubmit → login.mutate(formLogin)`.
3. `fe/src/hooks/useService/auth/state/mutate.ts:useLogin` — `mutationFn: AuthService.Login`, on success `setSessionCookies({accessToken,refreshToken,role,expiresIn})` + `localStorage` + `router.push(getRoleDashboardPath(role))` (same pattern for `useGoogleLogin/useVerifyMagicLink`).
4. `fe/src/services/api/auth.service.ts:Login` — `client.PostResponse(AUTH_ENDPOINTS.LOGIN /* /auth/login */, body)` → `toServiceResponse`.
5. `fe/src/api/client/client-http.ts:buildBaseHeaders` — sends `x-internal-api-key` (public env) without `Bearer` (`PublicPostResponse` → `withAuth:false`); `fe/src/configs/endpoints/auth.endpoints.ts:LOGIN = /auth/login`; base from `fe/src/configs/repo.config.ts`.
6. `POST /api/v1/auth/login` — registered `be/src/routes/authRoutes.ts:69-78` (`body:LoginDto`, `beforeHandle:[rateLimit(LOGIN)]`), mounted via `be/src/routes/apiRoutes.ts:45` under prefix `/api/v1`; global `InternalApiKey` (`apiRoutes.ts:43`) checked first.
7. `be/src/controllers/AuthController.ts:71-79 login` — `body as LoginBody → AuthService.login(email,password) → HttpResponse(c).ok(data,'Login successful')`.
8. `be/src/services/auth.service.ts:236-278 login` — `prisma.user.findUnique(include userRoles)` → `bcryptjs.compare` → `validatePasswordPolicy`-adjacent checks → `createSession` (`auth.service.ts:45-62`: `prisma.$transaction([refreshToken.create, user.update lastLoginAt])`, `signAccessToken(3600s)+signRefreshToken(7d)` via `be/src/utils/auth.util.ts:87-111`) → returns `{accessToken, refreshToken, user, role}`.
9. Prisma (`be/prisma/client/index.ts`) → PostgreSQL `users`, `refresh_tokens`, `user_roles×roles`.
10. Return: `Service → Controller envelope → HTTP 200 → client-http parses → toServiceResponse → React Query onSuccess → cookies set → push to `/intern|hr_admin|supervisor|receptionist/dashboard` → User sees dashboard.

Related: `POST /auth/oauth` (`authRoutes.ts:81-90` → `AuthController.googleLogin` → `auth.service.ts:287-372 googleLoginService` via `google-auth-library OAuth2Client.verifyIdToken`), `POST /auth/refresh-token` (`authRoutes.ts:139-146` → `AuthController.refreshToken` → `auth.service refreshToken`), `GET /auth/me` (`authRoutes.ts:170-177` + `verifyToken` → `AuthController.me` → `AuthService.me(user)`), all mirrored in `fe/src/services/api/auth.service.ts` (17 methods) + `fe/src/hooks/useService/auth/state/{query,mutate}.ts`.

### Flow 2 — Read Data (Intern “Today + Summary + My History”)

1. User opens Attendance page `fe/src/app/(private)/intern/attendance/page.tsx`.
2. `fe/src/app/(private)/intern/attendance/_containers/attendance.tsx` — parallel `api.auth.query.me()`, `api.attendance.query.today()`, `api.attendance.query.summary({month,year})`, `api.attendance.query.my({page:1,limit:10})`, `api.internship.query.my()`.
3. e.g. `fe/src/hooks/useService/attendance/state/query.ts:useAttendanceToday` — `useQuery({queryKey: queryKey.attendance.today(), queryFn: () => Api.Attendance.Today()})` (aggregator `fe/src/services/props.service.ts: Api.Attendance = WrapApi(attendanceService)`).
4. `fe/src/services/api/attendance.service.ts:Today/Summary/My` — `client.GetResponse(ATTENDANCE_ENDPOINTS.TODAY|SUMMARY|MY)` → `toServiceResponse`.
5. `GET /api/v1/attendance/today|/summary|/me` — registered `be/src/routes/attendanceRoutes.ts:61-75` (`beforeHandle:[verifyToken, requireRole(['intern'])]`, `query:AttendanceListQuery` for list/summary).
6. `be/src/controllers/AttendanceController.ts:52-61 getMyAttendance` (and `getToday/getSummary`) — `c.user!.id + c.query → attendanceService.* → HttpResponse(c).ok(data, meta)`.
7. `be/src/services/attendance.service.ts` — `prisma.attendance/attendanceLog/internship/attendanceSetting` reads (often `prisma.$transaction([count, findMany])` for pagination), `calendar.service.getDayStatus` for holiday/weekend flags, Haversine not needed for reads.
8. Return: envelope → client → React Query cache (`staleTime 60s`) → `AttendanceSection(state{today,summary,history,…})` → User sees status cards + logs table.

Supervisor/HR variant: `GET /attendance/supervisor` (`attendanceRoutes.ts:80-87`, `requireRole(['supervisor'])` → `getSupervisorDashboard`) and `GET /attendance/history` (`:92-98`, `hr_admin+supervisor`) use same chain with different service queries + `meta{page,limit,total}`.

### Flow 3 — Create/Update Data (Check-In — Geofenced, Rate-Limited, Idempotent)

1. User taps Check-In in `AttendanceSection` → `AttendanceLocationDialog` captures GPS.
2. `_containers/attendance.tsx:handleSubmitAttendance(coords)` — `checkIn.mutate({latitude,longitude,accuracy,deviceId,fakeGpsDetected:false})` (`deviceId` from `localStorage simad-device-id`).
3. `fe/src/hooks/useService/attendance/state/mutate.ts:useCheckIn` — `useAppMutation({mutationFn: Api.Attendance.CheckIn, invalidateKeys:[queryKey.attendanceRoot()]})` (toast + invalidate on settle).
4. `fe/src/services/api/attendance.service.ts:CheckIn` — `client.PostResponse('/attendance/check-in', body)` with `Bearer + x-internal-api-key`.
5. `POST /api/v1/attendance/check-in` — `be/src/routes/attendanceRoutes.ts:37-46` (full chain: `verifyToken → requireRole(['intern']) → rateLimit(ATTENDANCE 1/10s, keyByUser) → idempotency.beforeHandle`, `body:CheckInDto`, `afterHandle:[idempotency]`).
6. `be/src/controllers/AttendanceController.ts:31-39 checkIn` — `attendanceService.checkIn(c.user!.id, body, getMeta(ip,user-agent)) → HttpResponse(c).ok(data,'Check In berhasil.')`.
7. `be/src/services/attendance.service.ts:checkIn` — validates time window/override ranges, `calendar.service.getDayStatus` (reject HOLIDAY/WEEKEND), `geofence.util.haversineDistance/checkInsideGeofence` vs office `latitude/longitude/radiusMeter` (reject outside → violation/correction path), then `prisma.$transaction(async tx => … attendance.upsert/create + attendanceLog + violation? + auditLog via audit.util)`; export path uses `ExcelJS` elsewhere.
8. Return: updated attendance → envelope → `useAppMutation onSuccess` toast + `invalidateQueries(attendanceRoot)` → `today/summary/my` refetch → dialog closes → User sees HADIR/TERLAMBAT badge. 429 (rate) / 409 (idempotent replay `IDEM_001`) / 400 (outside geofence) surface as error toasts via `extractErrorMessage`.

Check-Out (`/check-out`, `attendanceRoutes.ts:49-58`, same guards) and Supervisor Override (`PATCH /:attendanceId/override`, `:129-137`, `requireRole(['supervisor'])` → `AttendanceController.override` → `attendance.service override`) follow the identical chain.

### Flow 4 — Major Feature A: Application Approval with Quota Advisory Lock

1. HR opens `fe/src/app/(private)/hr_admin/applications/[id]/_containers/applications-detail.tsx` → `api.application.query.detail(id)` + approve dialog.
2. `fe/src/hooks/useService/application/state/mutate.ts:useApprove` → `Api.Application.Approve(id, {actualStartDate, actualEndDate, departmentId…})`.
3. `fe/src/services/api/application.service.ts:Approve` → `client.PostResponse('/applications/:id/approve', body)` (+ `Idempotency-Key` header where wired).
4. `POST /api/v1/applications/:id/approve` — `be/src/routes/applicationRoutes.ts` (`verifyToken + requireRole(['hr_admin']) + idempotency`), `body/query/params` DTOs in `be/src/dtos/application.dto.ts`.
5. `be/src/controllers/ApplicationController.ts:approve` → `application.service.approve(id, input, reviewerId=c.user!.id)`.
6. `be/src/services/application.service.ts:688-760+ approve` — `prisma.$transaction(async tx => { await tx.$executeRaw pg_advisory_xact_lock(hashtext('quota_'+officeLocationId)) (:693); quota = tx.internshipQuota.findUnique(include allocations); count occupied internships overlapping period; throw AppError 400 if office/dept full; update application APPROVED + create internship + supervisorAssignment + statusHistory + auditLog })`, then best-effort `sendStartDateEmail` (`:812-826`, swallowed on fail).
7. Return: internship created → envelope → FE invalidates `application + internship + quota` keys → HR sees APPROVED + quota occupancy increments; concurrent approvers are serialized by the advisory lock (same key in `internship.service.ts:601,698,896`).

### Flow 5 — Major Feature B: E-Certificate Issuance (Number Lock + R2 PDF + Compensation)

1. Supervisor submits evaluation → HR opens `hr_admin/certificates/approvals/_containers/approval.tsx` → `api.certificate.mutate.issue({internshipId})`.
2. `fe/src/services/api/certificate.service.ts:Issue` → `client.PostResponse('/certificates/issue', …)`.
3. `POST /api/v1/certificates/issue` — `be/src/routes/certificateRoutes.ts` (`verifyToken + requireRole(['hr_admin']) + idempotency`), DTO in `be/src/dtos/certificate.dto.ts`.
4. `be/src/controllers/CertificateController.ts:issue` → `certificate.service.issue(...)`.
5. `be/src/services/certificate.service.ts:190-271 + 621-664` — outside tx: `generateCertificatePdf({…signerName, signatureUrl}, config/certificate.template.config.ts)` via `utils/pdf.util.ts`; inside `prisma.$transaction`: `pg_advisory_xact_lock(hashtext('cert_number_'+officeCode+'_'+year)) (:223)` → `allocateCertificateNumber` (upsert reservation) → `FileService.upload` PDF to R2 (`utils/r2-utils.ts: uploadCertifikat → simad/sertifikat/…`, public URL via `PUBLIC_R2_URL`) → `prisma.certificate.create + file.create(storageProvider='r2')`; on DB error compensates with `deleteFromR2` (`:657-664`); success triggers `notification.service` → `webPush.service.sendBulkPush` (fire-and-forget).
6. Return: `{certificateNumber, url, qr}` → FE `certificate-builder.tsx` preview + intern `certificate.tsx` claim with `qrcode.react` → public QR verification path.

## 10. Component Dependency Map

Only code-evidenced edges (no invented Repository):

```text
[User]
   |
   v
[Next.js Web App: Page + _containers + Section/Organisms/Atoms]
   |  fe/src/app/**/page.tsx + _containers/*.tsx + components/page/* + components/organisms/*
   v
[Hook Facade useApi + TanStack Query]  (+ cookies/localStorage/local state)
   |  fe/src/hooks/useService/useApi.ts, */state/{query,mutate}.ts, query-key.ts, session-cookie.ts
   v
[Frontend Service + API Client (browser) / Server Fetch (SSR)]
   |  fe/src/services/api/*.service.ts, api/client/client-http.ts (+auth-refresh.ts) / api/server/server-fetch.ts
   v
[Next Internal Routes (proxy only, no DB)]
   |  fe/src/app/api/geocode/route.ts → Photon/Nominatim
   |  fe/src/app/api/files/preview/route.ts → R2 S3 GetObject
   v
[Backend Elysia App + Lifecycle/Helmet/CORS/OTel]
   |  be/src/app.ts, utils/lifecycle.ts, utils/cors.ts, telemetry/otel.config.ts
   v
[API Router /api/v1 + InternalApiKey]
   |  be/src/routes/apiRoutes.ts + middlewares/api-key.ts
   v
[Feature Route + DTO validation]
   |  be/src/routes/*Routes.ts + dtos/*.dto.ts
   v
[AuthN/Z + Abuse Middleware]
   |  middlewares/auth.ts (verifyToken/requireRole) → rateLimit.ts → idempotency.ts
   v
[Thin Controller]
   |  be/src/controllers/*Controller.ts → http/index.ts (HttpResponse envelope)
   v
[Service (business logic)]
   |  be/src/services/*.service.ts (+ utils: auth/geofence/audit/pdf/r2/email-template)
   +---> [PostgreSQL via Prisma singleton]  be/prisma/client/index.ts →5432
   +---> [R2 Object Storage]  utils/r2-utils.ts + services/file.service.ts
   +---> [Resend Email]  services/email.service.ts
   +---> [Web Push]  services/webPush.service.ts (+ notification.service fan-out)
   +---> [Google Calendar holidays]  services/calendar.service.ts
   +---> [Google OAuth verify]  services/auth.service.ts (google-auth-library)
   v
[External observers: Alloy → Loki/Tempo/Prometheus → Grafana]  observability/* + telemetry/otel.config.ts
[Cron trigger (external scheduler) → /cron/* (CRON_SECRET)]  routes/cronRoutes.ts → CronController → internship/cleanup services
```

Notable non-edges (important for diagram honesty): Controller ↛ Prisma (never imports it); Route ↛ Prisma; Service ↛ Controller; FE ↛ PostgreSQL/R2-direct (R2 only via BE or Next preview proxy); no Service → Service HTTP (only in-process imports); no queue/cache/WS edges (none exist).

## 11. UML Component Candidates

| Component                                                                          | Layer               | Responsibility                                                        | Communicates With                               |
| ---------------------------------------------------------------------------------- | ------------------- | --------------------------------------------------------------------- | ----------------------------------------------- |
| User                                                                               | Actor               | Triggers UI actions, views results                                    | Web Frontend                                    |
| Web Frontend (Next.js Pages/Containers/Components)                                 | Presentation        | Routing, role screens, local state, render                            | Hook Facade                                     |
| Hook Facade + React Query (`useApi`, `queryKey`)                                   | Application (FE)    | Cache, mutations, toasts, invalidation                                | Frontend Service                                |
| Frontend Service (`services/api/*`)                                                | Application (FE)    | 1:1 endpoint mapping, `TResponse` normalize                           | API Client                                      |
| API Client browser (`client-http`+`auth-refresh`) / Server (`server-fetch`)        | Transport (FE)      | Headers (`Bearer`+`x-internal-api-key`), 401 refresh-retry, downloads | Backend API Router; Next Internal Routes        |
| Next Internal Routes (`/api/geocode`, `/api/files/preview`, `/api/session/delete`) | Edge proxy (FE)     | CORS/adblock-safe proxy, R2 stream, cookie clear                      | Photon/Nominatim, R2, Backend API               |
| Backend App (`Elysia`+Lifecycle/Helmet/CORS/OTel)                                  | Transport (BE)      | Global pipeline, requestId/metrics/logs                               | API Router                                      |
| API Router (`/api/v1`+`InternalApiKey`)                                            | Transport (BE)      | Prefix mount, internal-key gate                                       | Feature Routes                                  |
| Feature Route + DTO (`*Routes`+`*.dto`)                                            | Transport (BE)      | Path, schema validation, per-route guards                             | Middleware chain, Controller                    |
| Auth Middleware (`verifyToken`/`requireRole`/`optionalAuth`)                       | Cross-cutting (BE)  | JWT verify, DB user+roles load, RBAC                                  | PostgreSQL (via Prisma), Controller gate        |
| RateLimit + Idempotency                                                            | Cross-cutting (BE)  | Fixed-window 429, `Idempotency-Key` replay/409                        | Controller gate (in-memory only)                |
| Controller (`*Controller`+`HttpResponse`)                                          | Handler (BE)        | Input extract → Service → envelope                                    | Service                                         |
| Service (`*.service`+`utils/*`)                                                    | Business logic (BE) | Rules, tx, locks, orchestration, externals                            | Prisma Client, R2, Resend, WebPush, GCal, OAuth |
| Prisma Client singleton (`pg Pool`+`PrismaPg`)                                     | Persistence (BE)    | Connection pool (max 20), query translation                           | PostgreSQL                                      |
| PostgreSQL 17                                                                      | Database            | ~40 tables, tx + advisory locks                                       | —                                               |
| R2 Storage (S3 API)                                                                | External            | PDFs, avatars, university files                                       | Service; Next preview proxy                     |
| Resend Email                                                                       | External            | Verify/magic/reset/start-date mails                                   | Service                                         |
| Web Push (VAPID)                                                                   | External            | Push to `pushSubscriptions`                                           | Service (via Notification fan-out)              |
| Google (OAuth2 verify + Calendar holidays) / Photon+Nominatim                      | External            | Identity verify; holiday block; geocode search                        | Service (BE) / Next proxy (FE)                  |
| Observability (Alloy/Loki/Tempo/Prometheus/Grafana)                                | External            | OTLP traces/logs/metrics, dashboards                                  | Backend App (OTel), HealthPing                  |
| Cron Trigger (external scheduler, `CRON_SECRET`)                                   | External            | Fires `/cron/*` (internship automation, cleanup)                      | Cron Routes → Services                          |

Excluded (installed but no `src` usage — must NOT appear in UML): `socket.io` server, Cloudinary, Stripe, `@elysiajs/cron` scheduler, Swagger endpoint, Redis/queue, Repository/DAO.

## 12. UML Interaction Candidates

Numbered arrows for a layered request-response diagram (login + check-in share the same backbone; check-in adds bracketed steps):

1. User → Web Frontend: Submit action (login form / tap Check-In with GPS) — `fe/.../LoginForm.tsx`, `fe/.../attendance.tsx`.
2. Web Frontend → Hook Facade: `login.mutate(form)` / `checkIn.mutate(coords)` — `login.tsx:62`, `attendance.tsx:handleSubmitAttendance`.
3. Hook Facade → Frontend Service: `AuthService.Login(body)` / `AttendanceService.CheckIn(body)` — `fe/src/services/api/auth.service.ts:45`, `attendance.service.ts`.
4. Frontend Service → API Client: `client.PostResponse('/auth/login')` / `client.PostResponse('/attendance/check-in')` — `client-http.ts:buildApiUrl+buildBaseHeaders`.
5. API Client → Backend API Router: `POST {base}/api/v1/auth/login` (public key only) / `POST {base}/api/v1/attendance/check-in` (`Bearer`+`x-internal-api-key`) — `repo.config.ts`, `auth.endpoints.ts`, `attendance.endpoints.ts`.
6. API Router → Feature Route: prefix dispatch + `InternalApiKey` check — `be/src/routes/apiRoutes.ts:43`, `authRoutes.ts:69`, `attendanceRoutes.ts:37`.
7. Feature Route → Middleware: DTO validation (`LoginDto`/`CheckInDto`) → [`verifyToken` → `requireRole(['intern'])` (check-in only)] → `rateLimit` → `idempotency` — `middlewares/auth.ts:16,121`, `rateLimit.ts`, `idempotency.ts`.
8. Middleware → Auth DB (when gated): `prisma.user.findUnique(include userRoles…)` → attach `c.user` — `middlewares/auth.ts:28-63`.
9. Route → Controller: `AuthController.login(c)` / `AttendanceController.checkIn(c)` — `AuthController.ts:71`, `AttendanceController.ts:31`.
10. Controller → Service: `AuthService.login(email,pw)` / `attendanceService.checkIn(userId, body, meta{ip,ua})` — `AuthController.ts:74`, `AttendanceController.ts:34`.
11. Service → Database (Prisma): `prisma.user/refreshToken` (+`$transaction`) / `prisma.attendance/...` inside `$transaction` + `calendar.getDayStatus` + `haversine/checkInsideGeofence` — `auth.service.ts:50-62,236`, `attendance.service.ts:325`, `calendar.service.ts`, `geofence.util.ts`.
12. [Check-in only] Service → External: holiday check (GCal), R2/email/push where applicable — `calendar.service.ts:12-51`.
13. Database → Service: rows → entities.
14. Service → Controller: plain data / `{data,meta}`.
15. Controller → API Client: `HttpResponse(c).ok(data,…)` envelope `{status,title,message,data,meta}` — `http/index.ts:58-222`.
16. API Client → Frontend Service: parse → `toServiceResponse` → `TResponse` (401 path: refresh once + retry) — `service-response.ts`, `auth-refresh.ts`, `server-fetch.ts`.
17. Frontend Service → Hook Facade: resolve (or throw via `WrapApi` → `onError`) — `wrapApi.ts`, `useAppMutation.ts`.
18. Hook Facade → Web Frontend: toast + `invalidateQueries` + cache update + `router.push(rolePath)` / close dialog — `mutate.ts:51-64`, `app.config.ts:getRoleDashboardPath`.
19. Web Frontend → User: render result (dashboard / HADIR badge / error toast; Excel = blob download via `DownloadResponse`).

Cron variant (separate arrow set): Scheduler → `GET/POST /cron/internship` (`CRON_SECRET`) → `CronController` → `internship.runInternshipCronAutomations` / `cleanup.*` → Prisma (+audit) → envelope.

## 13. External Systems

- **PostgreSQL 17** (`docker-compose.yml:1-20`, `be/prisma/schema.prisma`, `be/prisma/client/index.ts`): reached only from BE via Prisma singleton (`pg Pool max 20`). Health via `SELECT 1` (`config/databases.ts:37-51`). FE never connects directly.
- **Cloudflare R2 (S3-compatible)** (`be/src/utils/r2-utils.ts:1-128`, `be/src/services/file.service.ts:1-195`, env names `CLOUDFLARE_ACCOUNT_ID/ACCESS_KEY_ID/SECRET_ACCESS_KEY/PUBLIC_R2_URL`): reached from `FileService`/`CertificateService` (`uploadToR2/uploadCertifikat/getR2Object/deleteFromR2`) storing only URLs (`storageProvider='r2'`); FE streams via `fe/src/app/api/files/preview/route.ts` (`GetObjectCommand`, `Cache-Control: max-age=86400`). Local `utils/storage.util.ts` uploader is legacy.
- **Resend SMTP/API** (`be/src/services/email.service.ts`, env `RESEND_API_KEY/RESEND_FROM_EMAIL`): reached from `AuthService` (verify/magic/reset) and `ApplicationService.sendStartDateEmail`; dev-mode logs + swallows when key missing. Templates in `utils/email-template.util.ts`.
- **Google OAuth2** (`google-auth-library`, `be/src/services/auth.service.ts:32-35,292-301`, env `GOOGLE_CLIENT_ID/SECRET`): BE verifies `credential` ID-token; FE renders GIS button (`@react-oauth/google`, `GoogleOAuthProvider` in `providers.tsx:24`).
- **Google Calendar holiday API** (`be/src/services/calendar.service.ts:12-51`, env `GOOGLE_CALENDER_API` sic): BE `GET …/calendars/id.indonesian%23holiday…` with `timeMin/Max`; failure returns `{}` (fail-open); consumed by `attendance.service` day-status.
- **Photon + Nominatim geocoders** (`fe/src/app/api/geocode/route.ts:50-100`): reached only from FE proxy (browser → `/api/geocode?q=` → Photon with `revalidate:3600` → Nominatim fallback with `User-Agent: SIMAD-App/1.0`); BE never calls them — BE only validates submitted lat/lng via Haversine.
- **Web Push (VAPID)** (`be/src/services/webPush.service.ts:1-207`, env `VAPID_PUBLIC/PRIVATE_KEY/SUBJECT`; FE `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `hooks/usePushNotification.ts`, `public/sw.js`): BE `subscribe/unsubscribe/sendBulkPush(chunk 25, TTL 24h, prune 404/410)` on `pushSubscriptions`; `NotificationService:206-260` fans out DB notification then fire-and-forget push.
- **OpenTelemetry stack** (`be/src/telemetry/otel.config.ts`, `observability/alloy/config.alloy`, `prometheus.yaml`, `loki/config.yaml`, `tempo.yaml`, `grafana/provisioning/*`, `docker-compose.yml:22-103`): BE emits OTLP traces/metrics/logs to Alloy `:4317/4318` → Tempo `:3200`/Loki `:3100`/Prometheus `:9090` → Grafana `:3001` (anonymous Admin). Toggled by `OTEL_ENABLED/OTEL_ENDPOINT` (`app.ts:44`).
- **Cron scheduler (external, e.g. cron-job.org / K8s CronJob):** hits `be/src/routes/cronRoutes.ts` (`/cron/ping|warmup|internship|cleanup/*`, `CRON_SECRET` Bearer, dual-mounted `/cron` + `/api/v1/cron`) → `CronController` → `internship.service` automation + `cleanup.service` retention. No in-process scheduler.

## 14. Architecture Pattern Assessment

- **Primary pattern: Pragmatic Layered Architecture (feature-modular monolith).** The BE chain `Route → Controller → Service → Prisma → PostgreSQL` is uniform across all 23 routers and explicitly documented in controller headers (“thin… all logic in Service”). FE mirrors it with `Page → Container → Hook → Service → API Client`.
- **Supporting patterns:** Service Layer (all rules in `services/*.service.ts`); DTO validation (TypeBox schemas as Elysia `body/query/params`); Envelope/Responder (`HttpResponse` + `handleAppError` + `TResponse`/`toServiceResponse`/`WrapApi`); Facade (`useApi()`, `Api()`); Singleton services/controllers/Prisma; Advisory-lock concurrency (quota/cert numbers); Proxy (Next geocode/file-preview); Single-flight refresh; Fire-and-forget fan-out (notification→push, approval→email).
- **What it is NOT:** Not MVC (no models/views separation — Prisma models are persistence, React components are FE-only); not strict Clean/Hexagonal (no repository/port abstractions, no use-case/interactor layer, services import Prisma + SDKs directly); not microservices (single BE deployable, shared DB); not a workspace monorepo (two independent `package.json`/`bun.lock`, no shared lib).
- **Deviations / weak boundaries (document, don’t fix):** No repository — services embed queries (29 direct `prisma/client` imports; controllers correctly avoid Prisma but services freely mix rules + SQL + S3/email/push). Auth middleware queries DB per request (fine at this scale, but it is a persistence call outside the service layer). A few controllers hold minor ownership checks (e.g. `AttendanceController.getById` intern scoping). Rate-limit/idempotency are in-memory (correct single-instance, wrong multi-instance — code comments admit Redis needed). `CRON_SECRET` + seed admin envs bypass the zod schema; `middlewares/api-key.ts:6` checks a stray `'.'` header; `cronRoutes` mounted twice. FE carries dead weight (`@reduxjs/toolkit/react-redux/redux-persist` unreferenced; `private.provider.tsx` stub; BE `cloudinary/stripe/sharp/socket.io/@elysiajs/cron/swagger` installed but unimported).
- **Hybrid verdict:** Layered + feature-based (vertical slices per domain: `auth/attendance/application/quota/…` each owning route+controller+service+dto+types+endpoints+hooks) with pragmatic shortcuts. Diagram it as layers; annotate bypasses (middleware→DB, service→externals) rather than forcing Clean Architecture boxes.

## 15. Architecture Evidence

| Architectural Finding                                | Evidence                                                                                                                                                                                                                                                                                                         |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------------- |
| FE+BE separation, one repo                           | `fe/package.json` (next 16), `be/package.json` (elysia 1.4), `docker-compose.yml`, `README.md:115-134`                                                                                                                                                                                                           |
| No Repository/DAO layer                              | grep `Repository` in `be/src` → 0 hits; no `*Repository.ts`/`*Dao.ts`; `glob be/src/**` lists only routes/controllers/services/dtos/types/middlewares/utils/config/http/telemetry                                                                                                                                |
| Services access Prisma directly                      | `be/src/services/auth.service.ts:19`, `attendance.service.ts:24`, `application.service.ts:16`, `quota.service.ts:1` + 25 more `import prisma from '../../prisma/client'`; `middlewares/auth.ts:5`                                                                                                                |
| Thin controllers, logic in services                  | `be/src/controllers/AuthController.ts:17-23`, `AttendanceController.ts:13-17` header comments; `AuthController.ts:71-79`, `AttendanceController.ts:31-39` delegate to services + `HttpResponse`                                                                                                                  |
| Route→Controller wiring + DTO validation             | `be/src/routes/authRoutes.ts:69-78` (`body:LoginDto`, `rateLimit`), `attendanceRoutes.ts:37-46` (`verifyToken, requireRole, rateLimit, idempotency`, `body:CheckInDto`), `apiRoutes.ts:30-66` (prefix `/api/v1` + `InternalApiKey`)                                                                              |
| Global pipeline order                                | `be/src/app.ts:33-41` (`helmet → cors → otel → Lifecycle → cronRoutes → apiRoutes`)                                                                                                                                                                                                                              |
| JWT Bearer + RBAC in middleware                      | `be/src/middlewares/auth.ts:16-80 verifyToken` (Bearer → `verifyJwtToken` → `prisma.user` → `c.user`), `:121-134 requireRole`, `be/src/utils/auth.util.ts:87-111` (TTL 3600s/7d/24h), `bcryptjs` in `auth.service.ts:122,253`                                                                                    |
| Internal API key gate on all `/api/v1/*`             | `be/src/middlewares/api-key.ts:3-53`, `apiRoutes.ts:43`; FE sends it in `fe/src/api/client/client-http.ts:59-70` + `server-fetch.ts`                                                                                                                                                                             |
| Rate-limit + idempotency (in-memory)                 | `be/src/middlewares/rateLimit.ts:25-120` (rules LOGIN 5/min … ATTENDANCE 1/10s), `idempotency.ts:23-119` (24h TTL, 409 `IDEM_001`); applied `authRoutes.ts:36,71`, `attendanceRoutes.ts:41,53`                                                                                                                   |
| Envelope + error mapping                             | `be/src/http/index.ts:58-222` (`HttpResponse`, Prisma `P2002→409`…), `http/error.ts:9-49` (`AppError`), `utils/lifecycle.ts` (`VALIDATION→400` field errors)                                                                                                                                                     |
| Singleton Prisma via adapter-pg Pool                 | `be/prisma/client/index.ts:27-44` (`Pool max:20` → `PrismaPg` → `PrismaClient`), `src/config/databases.ts:4-30` (`connectWithRetry`), `prisma.config.ts`                                                                                                                                                         |
| Transactions + advisory locks                        | `auth.service.ts:50-62 $transaction([...])`; `application.service.ts:688-693 $transaction(tx)+pg_advisory_xact_lock('quota_…')`; `internship.service.ts:601,698,896`; `certificate.service.ts:223 cert_number_…`                                                                                                 |
| FE Page→Container→Section→Hook→Service→Client chain  | `fe/src/app/(auth)/login/page.tsx` → `_containers/login.tsx:13-63` → `components/page/auth/login/LoginSection` → `useApi()` (`hooks/useService/useApi.ts:38-62`) → `services/api/auth.service.ts:40-53` → `api/client/client-http.ts`                                                                            |
| FE server-state = React Query, no Redux usage        | `pkg/react-query/query-client.pkg.tsx` (`staleTime:60s`), `configs/query-key.ts`, `hooks/useService/_shared/useAppMutation.ts`; grep `useSelector                                                                                                                                                                | createSlice`in`fe/src`→ 0 hits despite deps in`package.json:29,64-66` |
| FE dual transport + single-flight refresh            | `api/api-entry.ts` (client vs server), `client/client-http.ts:401→refreshAccessToken→retry-once`, `client/auth-refresh.ts` (`_refreshInFlight`), `server/server-fetch.ts` (httpOnly cookies + `redirect('/login')`)                                                                                              |
| FE proxies (no direct third-party from browser)      | `fe/src/app/api/geocode/route.ts:50-100` (Photon→Nominatim), `files/preview/route.ts` (R2 `GetObjectCommand` stream), `session/delete/route.ts`                                                                                                                                                                  |
| Layout guards, no edge middleware                    | `fe/src/app/(private)/layout.tsx` (require `simad_session` else `/login`), `(auth)/layout.tsx` (reverse), `core/providers/auth.provider.tsx` (SPA guard); no `fe/middleware.ts`                                                                                                                                  |
| R2 / Resend / Push / GCal externals                  | `be/src/utils/r2-utils.ts` + `services/file.service.ts:66,98` (R2), `services/email.service.ts:1-51` (Resend), `services/webPush.service.ts:1-207` (VAPID), `services/calendar.service.ts:12-51` (GCal holidays)                                                                                                 |
| Cron = HTTP routes, no scheduler/WS/Swagger endpoint | `routes/cronRoutes.ts:1-80` + `controllers/CronController.ts` + `services/cleanup.service.ts`; grep `from '@elysiajs/cron'                                                                                                                                                                                       | from 'socket.io'                                                      | swagger()`in`be/src` → 0 hits |
| DB models + seed + dosage                            | `be/prisma/schema.prisma:1-100…801` (User/Role/UserRole/RefreshToken, Office/Dept/Quota/Allocation, Application/Internship/SupervisorAssignment, Attendance/Log/Correction/Override/Violation, Evaluation/Certificate/File/Notification/PushSubscription, AuditLog…), `prisma/seed.ts:38-63` roles, `:901` admin |
| Observability wiring                                 | `be/src/telemetry/otel.config.ts`, `observability/alloy/config.alloy`, `docker-compose.yml:22-103` (alloy 4317/4318, prometheus 9090, loki 3100, tempo 3200, grafana 3001)                                                                                                                                       |

## 16. Recommended UML Abstraction

Show this (top→bottom request, bottom→top response) — each box is a real code unit, no invented Repository:

```text
User
 ↕
Presentation Layer — Next.js Pages + Containers + Sections/Organisms/Atoms
   (fe/src/app/**/page.tsx, _containers/*.tsx, components/page/*, components/organisms/*, atoms/*)
 ↕
Application Layer (FE) — Hook Facade + React Query + Frontend Services
   (fe/src/hooks/useService/useApi.ts, */state/{query,mutate}.ts, services/api/*.service.ts, query-key.ts)
 ↕
API Client — Browser (client-http + auth-refresh) / Server (server-fetch) + Next Proxies
   (fe/src/api/client/*, api/server/server-fetch.ts, app/api/{geocode,files/preview}/route.ts)
 ↕
Transport — Elysia App + /api/v1 Router + Feature Routes + DTOs
   (be/src/app.ts, routes/apiRoutes.ts, routes/*Routes.ts, dtos/*.dto.ts)
 ↕
Middleware — InternalApiKey + verifyToken/requireRole + rateLimit + idempotency + Lifecycle/OTel
   (be/src/middlewares/*.ts, utils/lifecycle.ts, telemetry/otel.config.ts)
 ↕
Controller Layer — Thin handlers + HttpResponse envelope
   (be/src/controllers/*Controller.ts, http/index.ts, contex/index.ts)
 ↕
Service Layer — Business logic + tx + advisory locks + external fan-out
   (be/src/services/*.service.ts, utils/{auth,geofence,audit,r2-utils,pdf,email-template}.ts)
 ↕
Persistence — Prisma singleton (pg Pool → PrismaPg adapter)
   (be/prisma/client/index.ts, src/config/databases.ts)
 ↕
Database — PostgreSQL 17 (+ side: R2 / Resend / WebPush / Google APIs / OTel stack / Cron trigger)
```

- **Show:** the 9 boxes above + external lane (R2, Resend, WebPush, Google OAuth/Calendar, Photon/Nominatim, OTel→Grafana, Cron scheduler). Annotate the two honest bypasses: `Middleware → Prisma (user lookup)` and `Service → Externals (R2/email/push/calendar)`.
- **Hide:** file-level detail (23 routers, 22 controllers, 21 FE services, ~40 tables), DTO/type files, dead code (`validation/auth.validate.ts`, `private.provider` stub), installed-but-unused deps (`socket.io/cloudinary/stripe/@elysiajs/cron/swagger`, Redux), env values, migration/seed internals, per-office geofence math, PDF coordinates. Those belong in sequence/class diagrams, not the layered overview.
- **Arrows:** use §12 numbering (19 backbone arrows + cron variant). One diagram with the generic backbone + callouts for login (public route, no `c.user`), check-in (full guard chain + geofence), approval (advisory lock), certificate (R2 + compensation) keeps it to a single page.

---

### Validation Checklist

- [x] Entire relevant repo inspected (`be/src`, `be/prisma`, `fe/src`, compose, observability) via direct reads + targeted greps
- [x] No `.env` values read or exposed (only key _names_ from `env.config.ts` schemas; `.env.example` files don’t exist)
- [x] Architecture from code evidence (every claim cites `path:line`)
- [x] FE↔BE interaction understood (dual client/server fetch, internal-key + Bearer, refresh-retry, proxies)
- [x] Main lifecycle understood (generic 18-step + middleware order)
- [x] 5 real flows traced (login, reads, check-in, approval, certificate)
- [x] DB access path understood (services → singleton Prisma → PG; tx + advisory locks; no repository)
- [x] External systems identified (PG, R2, Resend, Google, Photon/Nominatim, Push, OTel, Cron)
- [x] Layer dependencies mapped (incl. non-edges)
- [x] No fictional layers added (Repository/Queue/Redis/WS/Swagger-endpoint explicitly excluded with grep proof)
- [x] UML component + interaction candidates ready (§11–§12)
- [x] Every major conclusion has file-level evidence (§15)
