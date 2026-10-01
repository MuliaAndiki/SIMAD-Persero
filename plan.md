# Prisma & Query Performance Audit

**Audit date:** October 1, 2026  
**Status:** Audit, analysis, and plan only. Implementation requires explicit authorization.

**Recommended target: Prisma ORM 7.10.0, using exact version pins.** The upgrade should follow correction of the migration-history mismatch and targeted regression coverage.

The audit examined the current working tree without changing application code, dependencies, schemas, or migrations. No `.env` or credential files were inspected, and the application, tests, and database queries were not executed. This document records the audit and proposed work; it does not authorize implementation.

Findings distinguish confirmed code behavior from performance hypotheses. Actual latency, database size, production connection limits, and query plans remain unmeasured. Existing working-tree changes must be preserved during any later implementation.

## 1. Project Data Architecture

The implemented request path is:

**Next.js client components → TanStack Query hooks → frontend API services → custom fetch client → Elysia routes/middleware → controllers → services → shared Prisma Client → PostgreSQL**

There is **no repository layer in the implemented path**: backend services access Prisma directly.

Relevant characteristics:

- Frontend: Next.js 16.2.7, React 19, TanStack Query 5.101.0.
- Backend: Elysia, TypeScript, Bun.
- Responses use a shared `{ status, title, message, data, meta }` envelope.
- Protected requests generally load the authenticated user and roles before reaching the service.
- Files use object storage; database records retain file metadata and references.
- Reporting, dashboards, attendance generation, cleanup, and lifecycle jobs also access Prisma.
- The frontend contains a server-fetch helper, but the inspected API service consumers use `Api().client`.

The existing service architecture can support the proposed changes. A repository-layer rewrite is unnecessary for this work.

## 2. Current Prisma Setup

| Area | Verified configuration |
|---|---|
| Prisma CLI | `6.18.0`, pinned in manifest and lockfile |
| `@prisma/client` | `6.18.0`, pinned in manifest and lockfile |
| Database | PostgreSQL; local Compose declares PostgreSQL 17 |
| Production database | Provider, version, connection limits, and replica count not established from non-secret configuration |
| Package manager | Bun, with `be/bun.lock` |
| Local runtime | Bun `1.4.3`; Node `24.15.0` |
| Docker runtime | `oven/bun:1.1.45` |
| TypeScript | Manifest `^5.7.2`; lockfile resolves `5.9.3` |
| Module system | ESM; TypeScript uses `moduleResolution: bundler` |
| Generator | `prisma-client-js`, default output; no explicit output directory |
| Generated client location | Default `node_modules/.prisma/client`, exposed through `@prisma/client`; generated files were excluded from inspection |
| Datasource | PostgreSQL URL declared in `schema.prisma`; runtime wrapper overrides it |
| Prisma config | No `prisma.config.ts` found |
| Preview features | None declared |
| Extensions/middleware | No Prisma `$extends` or `$use` usage found |
| Transactions | Both interactive callbacks and array transactions |
| Raw SQL | Three tagged `$queryRaw` calls, all `SELECT 1` |
| Unsafe SQL | No `$queryRawUnsafe`, `$executeRawUnsafe`, or `$executeRaw` usage found |
| Initialization | Shared module-level application client; a separate client in the standalone seed |
| Migration strategy | Checked-in SQL migrations; no migration deployment job found |

The [client wrapper](be/prisma/client/index.ts) adds defaults of `connection_limit=20` and `pool_timeout=30` unless already supplied. It conditionally adds `pgbouncer=true` for a hostname pattern. This suggests pooler awareness, but does not establish the production provider.

No per-request Prisma Client construction was found. The application also disconnects during shutdown.

Deployment concerns are visible in the [Dockerfile](be/Dockerfile) and [.dockerignore](be/.dockerignore):

- Docker uses a substantially older Bun version than the local environment.
- Installation is not explicitly frozen.
- Migrations are excluded from the image.
- The visible GitHub workflow schedules HTTP jobs; it does not validate or deploy migrations.
- `build` runs `tsc` with `noEmit`, so it is a typecheck rather than a compiled production artifact.

## 3. Prisma Latest Stable Analysis

Verified on **October 1, 2026**, using official release information and public package metadata. Recheck these versions when implementation is authorized.

| Channel | Version | Interpretation |
|---|---|---|
| Current project | `6.18.0` | Installed CLI/client baseline |
| Latest stable Prisma CLI/client | **`7.10.0`** | Recommended target |
| Prisma CLI `latest` tag | `8.0.0-rc.19` | Release candidate |
| Prisma 8 PostgreSQL package | `@prisma/orm-postgres@8.0.0-rc.14` | Separate prerelease package line |
| Compatible adapter verified | `@prisma/adapter-pg@7.10.0` | Available for the proposed v7 upgrade |

The official release-status page explicitly identifies Prisma 8 as a release candidate. Therefore, an unversioned Prisma installation could select an inappropriate channel for this project. [Release status](https://www.prisma.io/docs/orm/release-status), [CLI package versions](https://www.npmjs.com/package/prisma?activeTab=versions), [7.10.0 release](https://github.com/prisma/orm/releases/tag/7.10.0).

Prisma 7.10.0 declares Node support as `^20.19 || ^22.12 || >=24.0` and TypeScript `>=5.4`. The inspected local Node and locked TypeScript versions satisfy those requirements. Bun has an official integration guide, but the repository’s older Docker runtime still needs direct verification. [Package metadata](https://registry.npmjs.org/prisma/7.10.0), [Bun guide](https://www.prisma.io/docs/guides/v7/runtimes/bun).

PostgreSQL 17 is supported by Prisma 7. [Supported databases](https://www.prisma.io/docs/orm/v7/reference/supported-databases).

Relevant upgrade changes:

- Driver-adapter-based client initialization.
- Driver-managed pooling and different connection/TLS behavior.
- Prisma CLI configuration and seed configuration changes.
- Recommended migration to the `prisma-client` generator with explicit output.
- Generated-client import changes.

The existing `prisma-client-js` generator is **deprecated**, rather than evidence by itself that the application immediately becomes unsupported. [Upgrade guide](https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7), [Generator reference](https://www.prisma.io/docs/orm/v7/prisma-schema/overview/generators).

Prisma 6 receives security patches until November 19, 2026. This supports scheduling the upgrade promptly, while retaining the verification gates below. [Support policy](https://www.prisma.io/docs/orm/release-status).

## 4. Prisma Upgrade Risk

**Overall risk: High until migration consistency and integration coverage are addressed; manageable afterward.**

| Area | Actual project exposure | Required handling |
|---|---|---|
| Migration history | Current quota models differ from checked-in migrations | Resolve independently before treating an upgrade as deployable |
| Client construction | Wrapper uses `datasources.db.url` | Introduce the PostgreSQL adapter while preserving the shared wrapper |
| Connection settings | Wrapper injects Prisma engine URL parameters | Configure the driver pool explicitly; do not assume those parameters preserve behavior |
| Generator/imports | Default generated output and direct `@prisma/client` imports | Choose explicit output and update constructor/type imports |
| Internal import | Attendance imports `Decimal` from `@prisma/client/runtime/library` | Replace with a supported generated-client export |
| CLI configuration | No Prisma config; seed configured in `package.json` | Add backend-root config and explicit generation/seeding workflow |
| Docker | Bun version differs; image excludes migrations | Align tested runtime and define a migration deployment artifact/job |
| Error handling | Middleware and HTTP helpers recognize Prisma error codes | Verify adapter connection errors, unique/FK errors, and timeout responses |
| Serialization | Decimal, dates, JSON and file-related values cross service/API boundaries | Compare response contracts before and after upgrade |
| Tests | Existing tests largely reimplement rules locally | Add tests exercising actual services/routes against disposable PostgreSQL |

Prisma 7 uses the underlying driver’s pool. For `pg`, defaults include a pool size of 10 and no connection timeout. The current application’s configured 20 connections and 30-second pool wait therefore require an explicit, tested translation—not a mechanical parameter rename. [Connection-pool reference](https://www.prisma.io/docs/orm/v7/prisma-client/setup-and-configuration/databases-connections/connection-pool).

Retain TLS verification and configure the appropriate trust chain if the deployed database requires it.

Existing ESM configuration is favorable. There is no demonstrated need to convert the project to CommonJS, replace Bun, or change the database engine.

## 5. Critical Query Findings

These are **P0 correctness or data-protection findings**, not claims of measured critical performance degradation.

**1. Record-level authorization checks can be skipped.**

[Authentication middleware](be/src/middlewares/auth.ts) lowercases role codes. However:

- [Application detail](be/src/services/application.service.ts), around line 587, checks `roles.includes("INTERN")`.
- [Correction detail](be/src/services/correction.service.ts), around line 182, performs the same uppercase check.
- [Evaluation detail](be/src/services/evaluation.service.ts), around line 124, also checks uppercase roles.
- Evaluation’s “no evaluation exists” branch returns internship details before reaching that authorization check.
- Correction approval/rejection checks the request’s status but does not verify that the acting supervisor is assigned to it.

The routes permit the affected roles, so route-level role checks do not close these gaps. Normalize role handling and enforce ownership/assignment in the resource lookup.

**2. Broad queries expose sensitive fields.**

[InternshipService.getMyInternship](be/src/services/internship.service.ts), around line 243, selects `user: true`, then spreads the returned object into the response. That includes the schema’s password field. The controller and response helper do not remove it.

Supervisor and receptionist updates also pass password-containing `updateData` into audit logs. See [supervisor update](be/src/services/supervisor.service.ts), around line 412, and [receptionist update](be/src/services/receptionist.service.ts), around line 183. Audit responses return `newData` unchanged.

Use explicit response selections and audit-field allowlists. Existing stored audit payloads would require a separately reviewed remediation plan.

**3. Checked-in migrations do not represent the current quota schema.**

The [current schema](be/prisma/schema.prisma), around line 348, expects:

- One quota per office.
- `total_capacity`.
- A separate `quota_department_allocations` table.

The [migration](be/prisma/migrations/20260925124758_v1_0_1_schema_expansion/migration.sql), around line 44, creates the older department/date-based quota structure with `capacity`, `department_id`, `start_date`, and `end_date`. No subsequent checked-in migration supplies the redesign.

This is a confirmed **repository schema/history mismatch**. Whether the live database has corresponding drift is unknown.

**4. Capacity checks are vulnerable to concurrent approvals.**

[ApplicationService.approve](be/src/services/application.service.ts), around line 687, reads occupancy and creates an internship inside a transaction, but has no explicit serialization mechanism or retry strategy. Different applications can concurrently observe the same remaining slot.

Rescheduling checks capacity before its write transaction. Extension and department changes do not consistently enforce the same capacity rules.

Centralize these rules and perform validation plus placement changes under a shared concurrency strategy. Preserve the existing date-overlap semantics.

**5. Status checks and writes are not consistently conditional.**

Attendance check-in/out, correction decisions, and lifecycle transitions commonly:

1. Read the current state.
2. Validate it in application code.
3. Update by ID alone.

Concurrent requests can pass the same check. The attendance uniqueness constraint prevents duplicate rows, but does not prevent duplicate operations against an existing pre-created attendance row.

Use conditional writes against the expected state, verify affected-row counts, and keep dependent history/audit writes atomic.

**6. Some multi-table changes can partially commit.**

[OfficeService.remove](be/src/services/office.service.ts), around line 261, deletes attendance settings before deleting the office. If the office deletion fails on a foreign key, its settings have already been removed.

Other examples:

- Office settings update followed by office update.
- Quota allocation replacement followed by quota update outside that transaction.
- Profile phone update followed by user update.
- Skill-relation deletion followed by skill deletion.

These operations need appropriately scoped transactions.

**7. Certificate numbering is not concurrency-safe.**

[generateCertificateNumber](be/src/services/certificate.service.ts), around line 191, uses total certificate count plus one. Concurrent generation can allocate identical numbers. Updating existing placeholder certificates also does not advance that count.

PDF/file upload happens before the certificate transaction; a later failure can leave orphaned artifacts.

Use an atomic database-backed number allocator, a generation idempotency/concurrency guard, and failure compensation. Keep PDF generation and storage network calls outside database transactions.

## 6. Backend / Prisma Findings

**HIGH — Quota availability has an explicit N+1 pattern.**

[QuotaService.checkAvailability](be/src/services/quota.service.ts), around line 295, performs:

- One quota lookup.
- One occupancy count per office.
- One additional count per department allocation.

For `O` offices and `D` total allocations, this is **`1 + O + D` Prisma operations**, excluding any extra SQL used to load relations.

The nested `Promise.all` reduces sequential waiting but increases simultaneous pool demand. Fetch quotas and grouped occupancy in bounded operations. Include unallocated/null departments when deriving office totals.

**HIGH — Internship lists load attendance history for every row.**

[InternshipService.list](be/src/services/internship.service.ts), around line 149, includes up to 60 attendance rows per internship and allows a limit of 500: an upper bound of **30,000 related attendance rows**.

The reports page requests 200 internships for a selector, potentially loading 12,000 attendance rows it does not need.

Receptionist screens do consume attendance data, so removing the relation globally would break behavior. Introduce purpose-specific projections or a date-scoped attendance summary.

**HIGH — Reports and exports materialize unbounded results.**

[ReportingService](be/src/services/reporting.service.ts), around line 48, loads complete matching attendance, internship, and certificate reports without pagination. Attendance date filtering is optional.

Attendance export loads matching rows and builds the workbook in memory. Growth affects database work, response size, heap usage, and serialization.

Separate paginated interactive reports from complete exports. Export in bounded batches/streaming form while preserving all requested records.

**HIGH — Dashboard charts aggregate raw records in JavaScript.**

[DashboardService.getCharts](be/src/services/dashboard.service.ts), around line 438, fetches raw attendance and internship records to produce monthly totals. Its attendance lower bound lacks a corresponding upper bound, so future pre-created attendance rows can also be fetched.

Compare database aggregation against the existing implementation, preserving Jakarta date boundaries and zero-filled chart buckets.

**MEDIUM — HR dashboard repeats five counts.**

`getHrDashboard()` performs five counts; `getStatistics()` performs thirteen, including those same five. The frontend calls both.

Using the statistics result for both views removes one HTTP request and **five redundant count operations** from that page load.

**MEDIUM — Transactions hold connections during avoidable work.**

- Supervisor/receptionist account flows hash passwords inside interactive transactions.
- `ApplicationService.updateDraft()` calls a helper using the root Prisma client from inside a transaction.

Move hashing before the transaction. Make transaction-dependent helpers accept the transaction client. The latter avoids a second connection and inconsistent transaction context.

**MEDIUM — Notification flows duplicate operations.**

[markAsRead](be/src/services/notification.service.ts), around line 128, performs a lookup/upsert, then calls `getById()`, which performs another lookup/upsert.

`send()` creates notification and recipient records separately, then reads the notification as the sender. When the sender is not a recipient, this can report failure after successful writes.

Return an appropriately serialized result from the completed operation and create parent/recipient records atomically.

**MEDIUM — Calendar requests and maintenance loops need bounded work.**

- Attendance paths repeatedly request holiday information.
- Lifecycle generation can repeat calendar requests for overlapping ranges.
- Cleanup loads eligible users/files and performs per-record deletion work.

Consider a bounded calendar cache with explicit failure behavior, and cursor-based cleanup batches. Preserve deletion order, audit behavior, and eligibility rules.

**Raw SQL assessment**

The three raw calls in [database initialization/health checks](be/src/config/databases.ts) execute static, tagged `SELECT 1`. They are appropriate connectivity checks, contain no interpolated user SQL, and do not need replacement.

A parameterized monthly aggregation query may be appropriate later if measurements favor it over Prisma aggregation.

**Patterns worth retaining**

- Shared application Prisma Client.
- Existing bulk attendance creation.
- Targeted selections already present in many services.
- Existing department aggregation using `groupBy`.
- External email/PDF/storage work generally occurring outside transaction callbacks.
- Small per-intern monthly calculations, which are bounded and are not established bottlenecks.

## 7. Database & Index Findings

These are **candidate indexes**, not approved schema changes. Validate against the actual database definition, representative data, and query plans first.

| Candidate | Query benefiting / reason | Expected effect | Write/storage cost and caution |
|---|---|---|---|
| `RefreshToken(token)` | `AuthService.refreshToken()` searches by token; current declared index covers `userId` only | Avoid scanning growing session history | Additional entry per issued token; do not impose uniqueness without checking token semantics |
| `Attendance(attendanceDate, attendanceStatus)` | Global daily statistics and date-range reporting cannot use the leading column of `(internshipId, attendanceDate)` effectively | Narrow date-oriented scans | Attendance creation and status changes update the index; compare date-only variant |
| `Internship(officeLocationId, status, actualStartDate)` | Office occupancy/date-overlap queries | Reduce candidate placements examined | End-date overlap remains a residual condition; department variant only if justified |
| `Internship(status, actualStartDate)` / `(status, actualEndDate)` | Start/completion jobs | Reduce eligible-record scans | Two separate candidates; do not add both without workload evidence |
| `SupervisorAssignment(supervisorId, isActive)` | Supervisor dashboard/list assignment lookups | More selective assignment retrieval | Updated during reassignment; may supersede the existing supervisor-only index |
| `Certificate(verificationToken)` | Certificate verification also searches by token; certificate number already has a unique index | Indexed token lookup | One additional index per certificate; assess uniqueness separately |
| `AuditLog(createdAt, id)`; potentially `(userId, createdAt, id)` | Recent activity and user-filtered history | Support stable ordering and deeper pagination | Append-heavy table; choose variants based on actual filters |
| Equivalent time/order index for `ActivityLog` | Recent activity queries | Reduce sorting/scanning | Same append/storage tradeoff |
| `AttendanceCorrectionRequest(attendanceId, status)` | Pending-correction lookup by attendance | Reduce per-attendance searches | Additional write cost; current internship/supervisor indexes serve different queries |
| Selective `User(officeId)` / `User(departmentId)` | Scoped staff lists and relation lookups | Help where membership is selective | Likely lower priority for small user tables |
| Trigram indexes on proven hot search columns | `contains` plus case-insensitive searches across names, email, student numbers, institutions | Potentially improve substring searches | Larger indexes and write cost; test short terms and relational OR predicates |

PostgreSQL trigram indexes support `LIKE`/`ILIKE`; an ordinary B-tree should not be assumed to accelerate `%term%` searches. [PostgreSQL 17 `pg_trgm` documentation](https://www.postgresql.org/docs/17/pgtrgm.html).

Additional conclusions:

- Existing unique constraints already index user email, profile user ID, certificate number, and certificate internship ID. Do not duplicate them.
- Existing join-table indexes on the second foreign key are not automatically redundant with a composite primary key.
- No obvious exact duplicate declared index requires immediate removal.
- Composite indexes might make some existing single-column indexes redundant, but removal requires usage and plan evidence.
- A partial unique constraint for one active supervisor assignment, or one pending correction per attendance, would enforce correctness. These require invariant confirmation and existing-data checks before migration.

## 8. Frontend Data Fetching Findings

**HIGH — QueryClient lifetime is unstable.**

[ReactQueryClientProvider](fe/src/pkg/react-query/query-client.pkg.tsx) constructs `new QueryClient()` inside its render function. A provider rerender creates a new cache.

Create the client once per provider lifetime. Pair this with explicit session-cache isolation: logout currently invalidates auth queries and performs client navigation, rather than clearing all user-scoped cached data.

**HIGH — Pagination metadata is discarded.**

For example, [useApplicationList](fe/src/hooks/useService/application/state/query.ts) returns only `res.data`. Similar patterns appear in attendance, audit, supervisor, quota, correction, and evaluation hooks.

Several screens request the first 100 records without exposing server pagination. This is both a completeness problem and an obstacle to efficient fetching. Internship list hooks already retaining the envelope provide an existing pattern to follow.

**MEDIUM — Hidden report tabs fetch immediately.**

The [reports container](<fe/src/app/(private)/hr_admin/reports/_containers/reports.tsx>) fetches internship, certificate, and dashboard reports on mount, although attendance is initially active.

Attendance already waits for a selected internship; preserve that guard and add active-tab conditions.

**MEDIUM — Dashboard requests overlap.**

The [HR dashboard](<fe/src/app/(private)/hr_admin/dashboard/_containers/dashboard.tsx>) requests both HR totals and statistics.

Supervisor dashboard trend requests also fetch overlapping 7-day and 30-day datasets. Where their filters and date anchor agree, derive the shorter view from the longer result.

**MEDIUM — Mutations trigger avoidable follow-up requests.**

The [corrections container](<fe/src/app/(private)/supervisor/attendance-corrections/_containers/corrections.tsx>) explicitly refetches after mutations whose hooks already invalidate the same query family.

The [shared mutation helper](fe/src/hooks/useService/_shared/useAppMutation.ts) also awaits independent invalidations sequentially. Narrow affected keys where possible and run independent invalidations concurrently. Inactive queries are generally marked stale; this should not be described as every cached query immediately issuing a request.

**MEDIUM — Availability fetching begins before scope is settled.**

The [receptionist availability container](<fe/src/app/(private)/receptionist/availability/_containers/availability.tsx>):

- Loads several datasets immediately.
- Falls back to the first office while user data is unresolved.
- Starts internship loading without an `enabled` scope guard.
- Uses an uncached effect-driven availability request.
- Uses default-sized office/department lists, which can omit records.

Resolve the authenticated office first, enable dependent queries afterward, and reuse the quota query hook.

**MEDIUM — Query cancellation does not reach fetch.**

Query functions ignore the supplied signal, and [ClientRequestConfig](fe/src/api/client/client-http.ts) has no signal field. Cancelled or superseded searches can therefore continue using network/backend resources.

Pass the cancellation signal through hooks, services, and both initial/retried fetches. TanStack cancellation requires consuming that signal in the transport. [Cancellation documentation](https://tanstack.com/query/latest/docs/framework/react/guides/query-cancellation).

**No demonstrated issue requiring change**

- The existing 60-second stale time is a reasonable baseline.
- Window-focus refetching is disabled.
- No polling or unnecessary prefetch pattern was found.
- Object-valued query keys are not inherently unstable.
- There is no evidence that globally increasing `gcTime` would solve the identified problems.

## 9. API Findings

- **Authentication is a repeated cost on protected requests.** Narrow `verifyToken()` to fields needed for identity, roles, active/deleted state, avatar URL, and scope. Retain every security check.
- **Some handlers reload identity already available in request context.** Profile retrieval, receptionist dashboard scope, and internship scope offer opportunities to reuse `c.user` and fetch only missing information.
- **Lookup consumers use heavyweight list contracts.** Office lists include settings, departments, quotas, and allocation relations. Several dropdowns need much less. Introduce explicit lookup projections while retaining consumers that need the expanded response.
- **Report endpoints need bounded interactive contracts.** Apply validated filters, pagination, and stable ordering. Complete exports need a separate bounded processing path.
- **Skill listing lacks a service-level limit clamp.** `getSkillAll()` directly uses the supplied page/limit. Validate positive integers and enforce a maximum.
- **Exact totals should remain where the UI uses them.** Do not remove every count or replace every offset-paginated list. Cursor pagination is most relevant to growing logs and exports.
- **A latent server-helper risk exists.** `server-fetch.ts` shares one module-level refresh promise across requests. If used concurrently by different users, refresh results could cross request boundaries. No active consumers were found, so this is not an established current request-load problem; isolate refresh state before activating that path.

## 10. Planlist

Priorities reflect source-supported impact. **HIGH correctness findings belong to P0 even where their direct performance benefit is secondary.** No performance issue is labeled CRITICAL without production-volume or incident evidence.

Locations below use the actual filenames/functions; service paths are under `be/src/services` unless stated otherwise. Risk means implementation/regression risk; effort is relative.

| ID | Priority | Layer | Location | Problem | Evidence | Proposed Optimization | Expected Impact | Risk | Effort |
|---|---|---|---|---|---|---|---|---|---|
| OPT-001 | HIGH | Backend / API | `middlewares/auth.ts`; application/correction/evaluation detail and decisions | Missing effective resource scope | Lowercase roles versus uppercase checks; unguarded fallback/decisions | Normalize roles; scope queries by owner/assignment | Correct access control | Medium | Medium |
| OPT-002 | HIGH | API / Backend | `internship.service.ts:getMyInternship`; staff update audits | Sensitive fields returned/stored | `user: true`; password-bearing audit payload | Response selects and audit allowlists | Remove exposure; smaller payloads | Low | Small |
| OPT-003 | HIGH | Database | `schema.prisma`; quota migrations | Schema/history mismatch | Current quota redesign absent from migrations | Compare history/schema/clone; plan data-preserving reconciliation | Reproducible deployment | High | Large |
| OPT-004 | HIGH | Backend / Database | `application.service.ts:approve`; internship placement changes | Concurrent quota oversubscription | Read-count-write without serialization | Shared capacity rules; serialization/locking and bounded retries | Preserve capacity invariants | High | Large |
| OPT-005 | HIGH | Backend | Attendance, correction, internship transitions; supervisor assignment | Concurrent state changes | Prechecks followed by ID-only writes | Conditional writes; atomic histories; enforce confirmed uniqueness | Prevent duplicate/conflicting outcomes | Medium | Medium |
| OPT-006 | HIGH | Backend | Office/quota/profile/skill updates and deletes | Partial commits | Related writes use separate transaction scopes | Group dependent writes atomically | Prevent inconsistent state | Medium | Medium |
| OPT-007 | HIGH | Backend / Database | `certificate.service.ts:generateCertificateNumber`, generation | Number collisions and orphan uploads | `count()+1`; upload before persistence | Atomic allocator, generation guard, compensation | Reliable certificate generation | High | Large |
| OPT-008 | HIGH | Prisma | `quota.service.ts:checkAvailability` | N+1 occupancy counts | `1 + O + D` Prisma operations | Batch grouped occupancy | Query count stops growing per allocation | Medium | Medium |
| OPT-009 | HIGH | API / Prisma | `internship.service.ts:list` | Excess attendance relation loading | Up to 60 rows per internship | Purpose-specific list projection/date summary | Lower DB transfer and payload | Medium | Medium |
| OPT-010 | HIGH | API / Backend | `reporting.service.ts`; attendance export | Unbounded materialization | No `take`; whole workbook buffered | Paginated reports; bounded complete export | Bound memory and request work | Medium | Large |
| OPT-011 | HIGH | Prisma | `dashboard.service.ts:getCharts` | Raw-row aggregation | Attendance/internships bucketed in JS | Bounded date predicates; database aggregation | Lower transfer and heap usage | Medium | Medium |
| OPT-012 | MEDIUM | Frontend / API | HR and supervisor dashboard containers | Overlapping requests | Duplicate five counts; overlapping trends | Reuse statistics and longer trend result | Fewer API/DB operations | Low | Small |
| OPT-013 | MEDIUM | Backend / Auth | `verifyToken`; user/dashboard/internship services | Broad/repeated identity reads | Full relations; repeated current-user lookup | Narrow selects; reuse request identity | Less work per protected request | Medium | Medium |
| OPT-014 | HIGH | TanStack Query | `query-client.pkg.tsx`; auth mutations | Cache recreated on rerender; session boundaries incomplete | Client constructed during render; logout only invalidates auth | Stable client plus user-cache reset/isolation | Reliable caching and account separation | Medium | Medium |
| OPT-015 | MEDIUM | Frontend | Reports and modal lookup containers | Eager unused data | Inactive tabs and closed dialogs fetch | Add visibility/dependency guards | Fewer initial requests | Low | Small |
| OPT-016 | HIGH | Frontend / API | List query hooks and applications/audit/report selectors | First-page-only UI | Metadata discarded; fixed limits | Preserve envelope; real server pagination/search | Complete results with bounded payloads | Medium | Large |
| OPT-017 | MEDIUM | TanStack Query | `useAppMutation`; corrections container | Duplicate/sequential refetch work | Invalidation followed by explicit refetch | Remove redundant refetch; narrow/concurrent invalidations | Fewer requests; faster mutation completion | Low | Small |
| OPT-018 | MEDIUM | Frontend | Receptionist availability container | Premature and uncached requests | Unresolved office scope; effect fetching | Resolve scope first; use query cache | Fewer transient requests | Medium | Medium |
| OPT-019 | MEDIUM | Frontend / API | Query hooks; `client-http.ts` | Cancellation ignored | No signal plumbing | Forward signal through all fetch attempts | Less obsolete in-flight work | Low | Medium |
| OPT-020 | MEDIUM | Backend | `notification.service.ts` | Duplicate reads/writes and partial creation | Double upsert; separate recipients; sender lookup | Single read-mark flow; atomic creation | Fewer operations; accurate success responses | Medium | Medium |
| OPT-021 | MEDIUM | Prisma | Staff account transactions; application draft helper | Avoidable connection occupancy | Hashing inside tx; root client inside tx | Pre-hash; pass transaction client | Shorter transactions; less pool contention | Low | Medium |
| OPT-022 | MEDIUM | Backend | `calendar.service.ts`; attendance/lifecycle callers | Repeated external lookups | Reused date ranges requested separately | Bounded cache and in-flight deduplication | Lower external-call latency/load | Medium | Medium |
| OPT-023 | MEDIUM | Backend | `cleanup.service.ts` | Unbounded maintenance work | Full candidate lists and deletion loops | Cursor batches; safe per-batch bulk operations | Bounded memory/transaction duration | Medium | Medium |
| OPT-024 | MEDIUM | API / Prisma | `office.service.ts:list`; lookup consumers | Heavy lookup responses | Expanded relation trees for selectors | Small explicit lookup projection | Smaller responses and DB reads | Low | Medium |
| OPT-025 | MEDIUM | API | `internship.service.ts:getSkillAll`; route DTO | Unbounded/invalid limit input | Direct caller limit usage | Validate and clamp pagination | Predictable request bounds | Low | Small |
| OPT-026 | MEDIUM | Database | Auth, attendance, placement, verification, logs | Query/index mismatch candidates | Section 7 predicate/index comparison | Benchmark and add only justified indexes | Potentially fewer scans/sorts | Medium | Medium |
| OPT-027 | MEDIUM | Database | Application/internship substring search | Potential expensive relational search | Case-insensitive `contains` across relations | EXPLAIN; selective trigram indexes if warranted | Conditional search improvement | Medium | Medium |
| OPT-028 | HIGH | Verification / Infrastructure | `src/tests`; telemetry; deployment checks | No adequate upgrade/performance baseline | Tests duplicate rules; no SQL/pool baseline | Actual service/DB tests and measurements | Detect regressions and validate gains | Medium | Large |
| OPT-029 | LOW | Frontend server helper | `api/server/server-fetch.ts` | Cross-request refresh promise | Module-global promise; no active callers found | Request/session isolation before use | Prevent future account crossover | Medium | Small |

Connection/runtime changes are tracked separately in the Prisma upgrade plan.

## 11. Prisma Upgrade Plan

**Current:** `prisma@6.18.0`, `@prisma/client@6.18.0`  
**Target stable:** `prisma@7.10.0`, `@prisma/client@7.10.0`  
**Adapter:** `@prisma/adapter-pg@7.10.0`  
**Prerelease excluded:** Prisma CLI `8.0.0-rc.19`

Recheck release metadata when execution is authorized; do not automatically substitute a newer major release.

| ID | Change and affected files | Breaking-change consideration | Required migration | Risk | Verification |
|---|---|---|---|---|---|
| PRISMA-001 | Establish baseline and reconcile quota history: `be/prisma/schema.prisma`, migration history, tests | Existing mismatch predates upgrade | Likely separate data migration; exact SQL depends on actual schema/data | High | Replay history on disposable PostgreSQL; compare with intended schema and representative restored data |
| PRISMA-002 | Pin CLI/client/adapter; add compatible driver dependencies: `be/package.json`, `be/bun.lock` | New driver dependency and package requirements | None | Medium | Inspect resolved versions; deterministic clean installation |
| PRISMA-003 | Add `be/prisma.config.ts`; move CLI datasource and seed configuration; update scripts | CLI configuration/environment loading and explicit seed/generate workflow | None for configuration itself | Medium | Validate/generate from backend root and CI; verify seed only on disposable data |
| PRISMA-004 | Adopt `prisma-client`, explicit `../src/generated/prisma` output and Bun/ESM settings: schema generator | Generated location/import contract changes | None; generator-only changes are not DB DDL | Medium | Regenerate; typecheck; verify generated output enters deployment artifact |
| PRISMA-005 | Update direct imports in wrapper, seed, audit utility, model types, attendance service | Remove reliance on runtime internals; use supported Decimal/type exports | None | Medium | Typecheck and Decimal/JSON/date response-contract tests |
| PRISMA-006 | Initialize PostgreSQL adapter in shared wrapper and seed client; retain shutdown lifecycle | `datasources` constructor setup replaced; pool/TLS behavior changes | None | High | Connection, exhaustion, timeout, reconnect, shutdown, TLS and concurrent-transaction tests |
| PRISMA-007 | Align/pin tested Bun runtime; update Docker generation and migration delivery: Dockerfile, ignore rules, CI | Existing Docker runtime/build sequence not verified for target | Delivery of existing/reconciled migrations | Medium | Clean container build/start; frozen lock installation; migration job against disposable DB |
| PRISMA-008 | Exercise actual service and API contracts: `be/src/tests`, HTTP error mapping as needed | Driver/runtime may alter error surfaces or serialization | None beyond disposable test setup | High | Auth scope, CRUD, rollback, FK/unique errors, quota races, attendance races, reports and certificate failures |
| PRISMA-009 | Compare baseline and target in staging; deploy in a controlled rollout | Pool budget and workload behavior must remain acceptable | Apply only independently reviewed DB changes | Medium | Compare p50/p95/p99, errors, DB CPU, connections, memory, payloads; retain previous application artifact |

The explicit output/runtime configuration is supported by the [generator reference](https://www.prisma.io/docs/orm/v7/prisma-schema/overview/generators). CLI schema/migration/seed settings belong in [Prisma configuration](https://www.prisma.io/docs/orm/v7/reference/prisma-config-reference).

Implementation constraints:

- Preserve the shared wrapper so most services do not need import changes.
- Use the installed, pinned CLI under the intended Bun runtime; avoid commands that silently download `latest`.
- Budget connections across **all application processes/replicas**, plus migration and administrative connections.
- Verify whether migration connectivity requires a separate direct endpoint without printing connection strings.
- Do not rewrite already-applied migration history or use destructive reset commands to conceal drift.
- Keep ORM upgrade changes separate from business-rule fixes and performance migrations.
- The Prisma version upgrade alone should not require a business-data migration; the existing quota mismatch is a separate issue.

## 12. Quick Wins

1. **Remove the redundant HR totals request.** Reuse statistics for the five shared fields.
2. **Gate inactive report tabs.** Avoid three unrelated report requests on the initial attendance view.
3. **Remove corrections’ explicit post-mutation refetch.** The existing mutation invalidation already covers it.
4. **Eliminate duplicate notification read/upsert work.** Return the already-loaded notification with the recorded read time.
5. **Move password hashing before interactive transactions.** Keep dependent database writes inside.
6. **Use safe, narrow selections for internship user details and audit payloads.** Verify required UI fields remain available.
7. **Validate and cap skill pagination.**
8. **Run independent cache invalidations concurrently.** Retain required affected query families.

Index creation, quota concurrency changes, migration repair, export redesign, and the Prisma upgrade are **not** quick wins.

## 13. Needs Benchmark / EXPLAIN ANALYZE

| Workload | Measurements needed | Decision informed |
|---|---|---|
| Quota availability | Prisma/SQL query count, pool wait, office/allocation scale, overlap-query plan | Grouped occupancy implementation and placement index |
| Internship list | Related-row count, response bytes, DB duration, serialization time for limits 10/100/500 | Appropriate projections and page limits |
| Attendance reports/export | Rows scanned/returned, heap peak, workbook generation time, response size | Batch size, streaming strategy, useful date indexes |
| Dashboard charts/statistics | SQL time, application CPU/heap, date-range plan | Database aggregation and any further consolidation |
| Auth/refresh | Per-request query count, token lookup plan, session-table size | Narrow selections, request reuse, token index |
| Search | Plans for short/common/selective terms, joins, buffers, rows removed by filters | Trigram index selection and search behavior |
| Audit/activity pagination | Shallow versus deep offsets, sort/spill behavior | Composite indexes and cursor pagination |
| Prisma 6 versus 7 | Latency percentiles, throughput, errors, pool wait, active connections, memory | Driver pool configuration and rollout readiness |
| Concurrent writes | Parallel last-slot approvals, duplicate check-ins, approve/reject races, certificate generation | Correct serialization, retry and idempotency behavior |

Use representative disposable/staging data and parameterized queries. `EXPLAIN ANALYZE` executes the statement, so mutation analysis belongs in an isolated test environment.

Capture query duration/count and pool behavior without logging credentials, tokens, password hashes, or unrestricted parameters.

The current tests do not provide this assurance: for example, [evaluation tests](be/src/tests/evaluation.test.ts) implement their own grading function with a different boundary from the service. Passing those tests would not establish that the actual service or Prisma upgrade works.

## 14. Recommended Implementation Order

1. **P0 — Correctness and data protection:** OPT-001–007. Address access scope, sensitive fields, migration history, transaction races, partial writes, and numbering.
2. **Verification baseline:** OPT-028. Capture representative behavior and add tests around actual services and database operations.
3. **Controlled Prisma upgrade:** PRISMA-001–009 in an isolated change sequence. Complete deployment/runtime verification before broader query rewrites.
4. **P1 — Bound major workloads:** OPT-009–011. Fix unnecessary relation loading, unbounded reports/exports, and raw-row chart aggregation.
5. **P2 — Remove query multiplication:** OPT-008, OPT-012, OPT-020–021. Batch quota counts, reuse dashboard results, and shorten transaction work.
6. **P3 — Add measured indexes:** OPT-026–027, after the intended query shapes are established.
7. **P4/P5 — Refine contracts and pagination:** OPT-013, OPT-016, OPT-024–025.
8. **P6 — Stabilize frontend fetching:** OPT-014–019. Pair stable cache lifetime with session isolation.
9. **P7 — Add selective caching:** OPT-022 and measured master-data cache improvements.
10. **P8 — Bound maintenance and address dormant helpers:** OPT-023 and OPT-029.

Small frontend request reductions can proceed alongside backend work once authorized, but should remain independently reviewable.

## 15. Files Likely To Change

- **Prisma and deployment:** [be/package.json](be/package.json), [be/bun.lock](be/bun.lock), [schema.prisma](be/prisma/schema.prisma), [client wrapper](be/prisma/client/index.ts), [seed.ts](be/prisma/seed.ts), [Dockerfile](be/Dockerfile), [.dockerignore](be/.dockerignore). Planned additions: `be/prisma.config.ts`, generated-client output, reviewed migrations, and deployment checks.
- **Backend services:** `application.service.ts`, `internship.service.ts`, `attendance.service.ts`, `quota.service.ts`, `reporting.service.ts`, `dashboard.service.ts`, `certificate.service.ts`, `correction.service.ts`, `evaluation.service.ts`, `notification.service.ts`, `office.service.ts`, `supervisor.service.ts`, `receptionist.service.ts`, `user.service.ts`, `calendar.service.ts`, and `cleanup.service.ts`, all under [be/src/services](be/src/services).
- **Backend supporting code:** [authentication middleware](be/src/middlewares/auth.ts), [audit utility](be/src/utils/audit.util.ts), [model types](be/src/types/models.types.ts), affected route DTOs/controllers, [HTTP error mapping](be/src/http/index.ts), and [tests](be/src/tests).
- **Frontend fetching infrastructure:** [QueryClient provider](fe/src/pkg/react-query/query-client.pkg.tsx), [shared mutation helper](fe/src/hooks/useService/_shared/useAppMutation.ts), [client transport](fe/src/api/client/client-http.ts), auth mutations, affected query hooks/services, query keys, and response types.
- **Frontend screens:** HR dashboard, reports, applications, audit logs and internship selectors; supervisor dashboard/corrections; receptionist availability/intern lists.
- **Contract documentation:** [API specification](docs/07-api-specification.md) where pagination, projection, or response contracts change.

Implementation remains paused until explicitly authorized. Do not upgrade Prisma, install packages, change application code, modify the schema, or create migrations as part of this audit-only plan.
