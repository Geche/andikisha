# Changelog

All notable changes to AndikishaHR are documented here.

---

## [Unreleased] — 2026-06-18

### tenant-portal / @andikisha/ui — Loading-state hardening (Run W0–W2)

Coordinated loading-state remediation: accessible, reduced-motion-safe primitives rolled out across data tables and dashboards, eliminating empty-as-loading and error+empty dual renders.

#### Frontend
- Hardened the shared `Spinner` and `Skeleton`/`SkeletonText` primitives (W0): `Spinner` now wraps its arc in a `role="status"` region with a visually-hidden, configurable `label` and `aria-hidden` arc; under `prefers-reduced-motion` the spin stops and collapses to a uniform `neutral-300` ring. `Skeleton` is marked decorative (`aria-hidden`) and drops its pulse under reduced motion. Added `SkeletonRegion`, a shared `aria-busy` + `role="status"` + sr-only-label wrapper exported from `@andikisha/ui`.
- Adopted tri-state loading (loading / empty / error) across tenant-portal data tables (W1): `admin/users` (People table, Roles cards, permission matrix), `my/leave`, `my/payslips`, `my/attendance`. Replaced raw `animate-pulse` and "Loading…" text with the shared primitive, gated balance cards and tables on a unified loading flag so cards no longer render blank above a skeletoned table, and split error states out of empty states (previously rendered together on failure).
- `my/dashboard` loading states (W2): skeletoned the 4 metric cards (no more "—" flash) and added distinct loading skeletons to the Recent Payslips / Leave Requests lists before their empty/data branches.

#### Accessibility
- All migrated loading surfaces now honour `prefers-reduced-motion` and expose `role="status"`/`aria-busy` with sr-only labels.

### platform-portal — SUPER_ADMIN profile identity (PLATFORM-BACKLOG-004)

#### Bug fixes
- `/api/auth/me` now decodes the verified `platform_token` JWT locally (sub/email/role) instead of forwarding it to the tenant-scoped gateway `/api/v1/auth/me`, which returned 401 for a SUPER_ADMIN (tenantId `SYSTEM`, no tenant/employee record) and left the masthead with no avatar. Invalid/expired token → 401; response shape unchanged.

### Misc
- White-backed favicons across tenant-portal, platform-portal, and landing.

---

## [Unreleased] — 2026-06-17

### tenant-portal — Attendance proxy and admin change-password (FE-BACKLOG-014, FE-BACKLOG-015)

#### Bug fixes
- Fixed the BFF proxy allowlist prefix in `src/app/api/proxy/[...path]/route.ts`: it listed `/api/v1/time-attendance` but the page calls `/api/v1/attendance/**` (the gateway's actual route), so the BFF returned 403 "Path not allowed" and `my/attendance` was broken for every employee. Replaced the dead prefix (no other caller).
- Added an `/admin/change-password` route that re-uses the existing change-password form body inside the admin shell, so admins are no longer dropped into the employee shell. `ProfileView` "Change password" and the form's "Back to profile" links are now role-aware (admin → `/admin/*`), removing reliance on the racy `/my/profile` bounce.

---

## [Unreleased] — 2026-06-15

### Audit remediation (Run 04, PRs #14–#22) — tenant-portal + landing

Remediation of the 2026-06-15 comprehensive tenant-portal + landing audit. Backlog filed under `docs/backlog/BACKLOG.md`.

#### Security fixes
- **LINE_MANAGER login (Finding Zero):** `findCorrectDashboard()` had no branch for a LINE_MANAGER-only JWT, so successful logins redirected to `/access-denied` (itself a 404). Now routes LINE_MANAGER to `/my/dashboard` (per frontend CLAUDE.md, LINE_MANAGER routes through `/my/*` only). Used by both the login page and Edge middleware.
- **Authz self-service grants (H2/H4):** added `LINE_MANAGER` to the `@PreAuthorize` on employee-service `GET /employees/me` and payroll-service `GET /payslips/{id}` and `GET /employees/{employeeId}/payslips` — a line manager (always employee-linked) was getting 403 on their own profile and payslips. `enforcePayslipOwnership()` still restricts non-privileged callers to their own `employeeId`. The PAYROLL_OFFICER `GET /runs` gap (H1) is documented, not fixed.

#### Backend
- **leave-service reviewer notes (LEAVE-BACKLOG-001 / audit M2):** reviewer's approval note was silently discarded (collected in the UI, never sent or stored). Added **Flyway `V4__add_review_notes_to_leave_requests.sql`** (nullable `review_notes` column); new `reviewNotes` field on `LeaveRequest` with an overloaded `approve(note)` (2-arg delegate keeps existing domain tests intact); `reject()` now writes the reason into `reviewNotes`. New optional `ApproveLeaveRequest` body (`@Size 1000`); `LeaveController.approve` reads it, `LeaveService` persists it, and `LeaveRequestResponse` exposes it (MapStruct). Frontend `ApproveModal` now POSTs `{ notes }`.

#### Frontend
- **Missing pages (M1/M4):** added the `/{workspace}/my/change-password` page (current/new/confirm + strength meter) — the backend `POST /api/v1/auth/change-password` and BFF route already existed, only the page 404'd; added a styled `/{workspace}/access-denied` page for unrecognised-role and SUPER_ADMIN-no-env redirects.
- **Payroll error state (M3):** error banner and table/empty-state are now mutually-exclusive ternary branches (no more error+empty dual render); message is derived from HTTP status — 403 → permission copy with Retry hidden, otherwise a generic retryable error.

#### Landing
- **Payroll calculator math (audit, `compute-payslip.ts`):** corrected three deviations from the payroll engine — NSSF Tier II ceiling now treats 36,000 as the absolute pensionable cap (was an increment → 43,000, overcharging ~420 above gross 43,000); PAYE now computed on gross minus NSSF (allowable deduction; housing levy is not, per Finance Act 2023); insurance relief (15% of SHIF, capped 5,000) now applied. Together these had understated net by ~1,480 at gross 100,000. Now mirrors `KenyanTaxCalculator` to the cent (verified: gross 100,000 → PAYE 21,324.50, NSSF 2,160, net 72,265.50).
- **Honest filing claims (H3):** integration-hub `FilingService` only generates/stores `FilingRecord` rows and transmits nothing, so "Live"/"submitted to the authorities"/"Filed" claims were reframed to "generated automatically … ready to file"; KRA iTax / NSSF / SHIF integration status Live → Coming; dropped the fabricated "WHT"; status pills "Filed" → "Ready". M-Pesa left as Live. Privacy policy / DPA filing language flagged for legal review, not changed.

---

## [Unreleased] — 2026-06-14

### Authz / platform-wide — Role vocabulary canonicalization (Run 03 keystone)

The product carried two competing names for the HR-officer role, half-wired in opposite directions: auth assigned `HR_OFFICER` while 9 services granted a non-existent `HR`, locking assignable HR_OFFICER users out of the entire portal. Strict rename, not a privilege-policy change.

#### Breaking changes
- Rewrote `HR` → `HR_OFFICER` in `@PreAuthorize` across 10 controllers / 16 grant sites (analytics, audit, document, employee dept+position, integration-hub, notification, payroll, tenant, time-attendance). No data migration (0 users held `HR`).
- auth-service: added `Role.OPERATIONAL` as the single source of truth for enforced/assignable roles (drops inert `PAYROLL_MANAGER`); `changeUserRole` now rejects reserved roles (422). `/roles` lists only the 6 operational roles.
- Frontend `ADMIN_ROLES` now `{ADMIN, HR_MANAGER, HR_OFFICER, PAYROLL_OFFICER}`; fixed `UserRole` union and `RoleBadge` label/colour map.
- Note: the rename grants HR_OFFICER payroll approve/run access; the officer-vs-manager boundary is deferred to AUTHZ-BACKLOG-001. Decision: `docs/decisions/2026-06-14-run-03-role-canonicalization.md`.

### auth-service — Standalone admin-tier users, deactivation, and name sync

Round out user lifecycle: standalone (no-employee) admin-tier accounts, soft-delete, and keeping `display_name` fresh on employee rename.

#### Migrations
- **V17** (`V17__allow_standalone_admin_tier_users.sql`): relaxed `chk_operational_role_requires_employee_id` to allow null `employee_id` for the admin-tier whitelist (SUPER_ADMIN, ADMIN, HR_MANAGER, HR_OFFICER, PAYROLL_OFFICER); only EMPLOYEE and LINE_MANAGER still require an employee. Added `NOT VALID` — grandfathers existing rows (incl. the `hrmanager@demo` dangling id), enforces on new inserts only.
- **V18** (`V18__seed_demo_admin_display_name.sql`): seeds `display_name = 'Andikisha Admin'` for `admin@demo.co.ke` only when still null; scoped by email, no-op in production.

#### New endpoints
- `PATCH /api/v1/auth/users/{id}/active` (ADMIN-only) — soft deactivate/reactivate via `is_active`. On deactivate, revokes refresh tokens; login + refresh blocked immediately, already-issued access tokens lapse within TTL (1h). Server-side guards: last-active-admin (422 `LAST_ACTIVE_ADMIN`), self-deactivation (422 `SELF_DEACTIVATION`), SUPER_ADMIN protected. `TenantUserResponse` gains `active`.
- `POST /api/v1/auth/users/invite` (ADMIN-only) — creates a standalone admin-tier user with a one-time temp password and `mustChangePassword=true`; returns the password once. Non-admin-tier rejected (422 `INVALID_INVITE_ROLE`), duplicate 409. `Role.ADMIN_TIER` kept in sync with the V17 whitelist.

#### Backend
- New `EmployeeUpdatedListener` binds `auth.employee.updated` queue to `employee.events` / `employee.updated`; on `employee.updated` it re-resolves the name via gRPC and updates the linked user's `display_name` (idempotent, swallow-and-log, self-heals on next event). No event-contract change. Decisions: `docs/decisions/2026-06-14-run-03-tenant-006-invite.md`, `...-user-deactivation.md`.

### tenant-portal — Admin IA regroup, position update, profile chip

Reorganised admin sidenav around the approved Access / Workspace / Settings model. Cosmetic regroup only — every URL unchanged (rename filed TENANT-BACKLOG-010). Decision: `docs/decisions/2026-06-14-run-03-ia-reorganization.md`.

#### New endpoints
- `PUT /api/v1/positions/{id}` (ADMIN | HR_MANAGER) — positions previously had no update path while departments did (R3-3, EMP-BACKLOG-003); adds `PositionService.update` + `UpdatePositionRequest`.

#### Frontend
- New "Workspace" group surfaces Departments + Positions; "Administration" → "Access" group with "Users & roles". Settings hub stripped of dept/position/roles cards; deleted the `/admin/settings/roles` redirect stub (now 404).
- Sidebar footer replaced by a user chip (avatar + `display_name`, email fallback) that links to `/my/profile` with Sign out below; removed redundant standalone "My profile" link and the duplicate desktop-rail Profile link.
- `/admin/users`: "Invite user" and Deactivate/Reactivate actions; active-only default with "Show inactive" toggle and dimmed inactive rows.
- `/my/profile`: branches on `employeeId` so standalone admin-tier users get a user-only view (identity + password change) instead of an error state.
- Relaxed `/my/*` from EMPLOYEE-only to any authenticated user (edge middleware + `useRoleGuard`) so the new chip link doesn't trap standalone admins.

#### Fixes
- `/my/leave` balances called the non-existent `/api/v1/leave/balances` (masked as 500 by the shared handler); corrected to `/api/v1/leave/me/balances` and fixed the `LeaveBalance` shape (`available`/`used`).
- Admin leave list/detail now resolve `employeeId` → `display_name` via `/api/v1/auth/users` and map the API's `days` field → `totalDays` (requester name and DAYS were blank).

---

## [Unreleased] — 2026-06-13

### landing — Audit remediation (security, SEO, content, mobile)

Swept audit findings across the marketing site.

#### Security fixes
- Added shared `lib/validation.ts` (stricter email, length caps, honeypot, CRLF sanitization) applied across demo/contact/newsletter routes; wired honeypots into all three forms.
- Stopped silently dropping leads — logs loudly and returns 500 in production when `RESEND_API_KEY` is absent; surfaces previously-swallowed send errors. Added a 5s `AbortController` timeout to the compliance-rates upstream fetch.
- Added security headers (CSP, X-Frame-Options, nosniff, Referrer-Policy, HSTS, Permissions-Policy) and a permanent `/features` → `/product` redirect.

#### SEO
- Emit `BlogPosting` JSON-LD + author/modifiedTime/canonical/OG image on posts; added author frontmatter. Fixed sitemap routes (added product/partners/early-access, dropped features) with stable `lastModified`.

#### Content
- Replaced a fabricated "2026 PAYE bracket changes" post with an accurate evergreen PAYE explainer (bands attributed to Finance Act 2023, relief KES 2,400).
- Responsive fixes: replaced inline `gridTemplateColumns` with classes that stack below `lg`. Deleted unused components (ThreePillars, ComplianceAuthority, Testimonials).

---

## [Unreleased] — 2026-06-12

### auth-service — User display name resolved from employee (AUTH-006)

Users had no name, so `/me`, `/admin/users`, and leave reviewer all showed email. Name now travels with the record rather than via synchronous gRPC on the hot `/me` path. Decision: `docs/decisions/2026-06-12-auth-user-display-name.md`.

#### Migrations
- **V16** (`V16__add_user_display_name.sql`): adds nullable `users.display_name`. NULL = "no name set" — readers fall back to email; email is never copied into the column.

#### Backend
- `provisionEmployeeUser` resolves "firstName lastName" via `EmployeeGrpcClient` at provisioning (cold path) and stores it; `UserResponse` + `TenantUserResponse` carry `displayName`, `/me` BFF maps it to `fullName`.
- Added an idempotent `DisplayNameBackfillRunner` (`ApplicationRunner`): at startup backfills users with an `employee_id` and no `display_name`; no-op once populated, retries unresolvable users next start.

### tenant-service / employee-service — KRA PIN format validation

- Applied `@Pattern("^([A-Z]\\d{9}[A-Z])?$")` (optional: empty clears, non-empty must match `A123456789X`) to `UpdateStatutoryRequest.kraPin`, `UpdateTenantRequest.kraPin` (TENANT-BACKLOG-004) and employee update (EMP-BACKLOG-004) — backend previously trusted client-side validation only.
- Added inline KRA PIN validation to the employee edit form (FE-BACKLOG-009).

---

## [Unreleased] — 2026-06-11

### common / leave-service — Surface 405 instead of masking as 500

- The shared `GlobalExceptionHandler` had a catch-all `Exception` → 500 and no `HttpRequestMethodNotSupportedException` handler, hiding two real bugs (W3 terminate, leave approve/reject) behind opaque 500s. Added a 405 handler (with `Allow` header) before the catch-all in both the shared advice and the shadowing `LeaveExceptionHandler`. Other services pick up the shared fix on next rebuild.

---

## [Unreleased] — 2026-06-10

### compliance-service / landing — Calculator wired to a single source of truth (R2-3)

#### New endpoints
- `GET /api/v1/public/compliance/{country}/rates` — **public, unauthenticated** endpoint returning rate data (PAYE bands, NSSF/SHIF/Housing rates, reliefs), `Cache-Control: public, max-age=21600`. Permitted in `SecurityConfig`, excluded from the tenant interceptor, routed through the gateway.
- Landing `PayrollCalculator` now fetches rates (proxied with SWR cache) and computes via `lib/compute-payslip`; **deleted** the drifting second source of truth (`lib/kenya-tax-rates-2025.ts`, `lib/payroll-calculations.ts`) and dead `HeroPayslipCard`.

### tenant-service / platform-portal — Statutory edit + record-only plan change (R2-7)

#### New endpoints
- `PATCH /api/v1/super-admin/tenants/{id}/statutory` (SUPER_ADMIN) — edit KRA PIN / NSSF / SHIF via `Tenant.updateStatutoryRegistrations`.
- Plan change reuses the existing status-preserving `POST /licences/upgrade` as record-only (updates plan/seats/price; does not transition licence status or clear the trial).

### auth-service / tenant-portal — Discoverable RBAC-gated User management (R2-10)

- Moved the buried roles/users screen to a top-level `/admin/users` (people list + roles overview + read-only permission matrix), nav-gated ADMIN | HR_MANAGER to match the backend `hasAnyRole`. `/admin/settings/roles` 307-redirects there. Change-role stays ADMIN-only (visible-but-disabled for HR_MANAGER).
- `TenantUserResponse` gains `lastLogin`; per-user Reset password reuses the existing admin reset (shows temp password once).

#### Fixes
- Leave approve/reject use POST with the correct reject field; reviewer now stored from `X-User-Email` (gateway never injects the `X-User-Name` the code expected) and rendered via `reviewerName` instead of the raw UUID. Leave "View" links now include the `workspace/admin` prefix (was 404). User-management, Departments, and Positions modals got the white-card surface wrapper.

---

## [Unreleased] — 2026-06-09

### Release Run 02 — landing launch-prep, tenant-portal admin surfaces, licence read-through

Unblocked tenant write paths, fixed the gateway licence cache, and shipped the first admin settings/permissions surfaces. The W-series (W0–W5) and R2-series (R2-5/6/8) close Run 01 backlog.

#### Backend
- **Gateway licence read-through (W0, breaking behaviour fix):** `TenantLicenceFilter` previously failed closed with `503 LICENCE_CHECK_UNAVAILABLE` on every Redis cache miss because the intended gRPC read-through was never wired — once the TTL lapsed, all tenant-scoped requests 503'd permanently. The filter now reads through to tenant-service `ValidateTenantLicence` on a miss (offloaded to `boundedElastic`) and repopulates Redis with a single 30-min TTL. Asymmetric fail policy when tenant-service is unreachable: **reads fail open** (with audit log), **writes fail closed**; the `NONE`/no-licence status gap is now blocked, not passed. Disabled Spring Cloud Gateway's JSON-to-gRPC bridge (we use the net.devh client) to fix a boot failure. Decision: `docs/decisions/2026-06-08-licence-read-through.md`.
- **Employee single + bulk create (W5):** Single create now returns 201 (was blocked solely by W0). **Migration V10 (employee-service)** drops `NOT NULL` on `national_id`, `phone_number`, `kra_pin`, `nhif_number`, `nssf_number` (catalog-only; unique indexes already permit multiple NULLs). `BulkUploadService` now stores `NULL` for absent optional fields instead of colliding placeholders (`+254700000000`, `PENDING-<empNum>`, empty statutory numbers) that caused `409 DUPLICATE` on the second incomplete row. Single create still requires all five fields via `@NotBlank`.

#### New endpoints
- `GET /api/v1/auth/roles` — role→permissions matrix, projected from the `role_permissions` table that services actually enforce (ADMIN/HR_MANAGER; read-only, cannot drift from enforcement).
- `GET /api/v1/auth/users` — tenant users with current role, for central assignment (ADMIN/HR_MANAGER).
- New DTOs `RolePermissionsResponse`, `TenantUserResponse`; `RolePermissionQueryService`.

#### Frontend (tenant-portal + landing)
- **Logout token revocation (W4, security):** BFF logout now calls backend `/api/v1/auth/logout` to revoke all refresh tokens before clearing the `tenant_token` cookie (best-effort) — previously refresh tokens stayed valid for up to 7 days after logout.
- **Terminate employee verb fix (W3):** Terminate modal called `apiClient.patch` against a `@PostMapping` endpoint, failing every termination as a gateway 500. Switched to `apiClient.post` (verified end-to-end: 204, status → TERMINATED, `EmployeeTerminated` reaching the audit consumer).
- **BFF binary proxy fix (R2-6):** Proxy decoded every request/response as UTF-8 text while forcing `Content-Type: application/json`, corrupting binary payloads — xlsx template downloads arrived as broken zips (U+FFFD bytes) and multipart uploads lost their boundary. Now forwards request bodies as raw bytes preserving `Content-Type` (keeps multipart boundary) and returns non-JSON responses as raw bytes preserving `Content-Disposition`.
- **Admin settings (R2-5):** New `/admin/settings` index plus `/admin/settings/departments` (list/add/edit) and `/admin/settings/positions` (list/add, seed defaults) — fixes dead nav/onboarding links that 404'd. Existing endpoints, no backend change.
- **Permissions UI (R2-8):** New `/admin/settings/roles` read-only permission matrix plus a people-and-roles list with central Change Role (legacy `HR` excluded; ADMIN-only guard, default-deny).
- **Landing launch-prep (W1/W2):** Gated both "Log in" links behind `NEXT_PUBLIC_SHOW_LOGIN` (default off, pre-launch); removed all price/billing elements from the pricing page (per-employee KES figures, monthly/annual toggle, "Save 15%" badge, VAT subline) in favour of "Talk to us for a quote"; enhanced the contact form (danger semantic tokens, helper text, Lucide `Send` icon).

#### Required manual steps
- Set `NEXT_PUBLIC_SHOW_LOGIN` to enable the landing login links post-launch (default off).
- Apply employee-service **V10** before relying on null-stored bulk imports.

---

## [Unreleased] — 2026-06-08

### Platform — Redis readiness hardening + CI stabilisation

Resolved the cascade where unauthenticated Redis connections 503'd all tenant-scoped traffic, and defined a degrade-not-unready readiness contract.

#### Backend
- **Redis auth + readiness contract:** Services defaulted `spring.data.redis.password` to empty; started without `REDIS_PASSWORD` they connected unauthenticated to a password-protected Redis, producing health 503 and `LICENCE_CHECK_UNAVAILABLE` on every tenant request. Final fix (after reverting an interim `:changeme` default that re-masked the bug) uses bare `${REDIS_PASSWORD}` plus a `RedisPasswordStartupGuard` (one per Redis service) asserting a non-blank resolved password at startup — config-presence only, no Redis ping, preserving the degrade-not-unready contract. Redis-down now degrades per-request (self-healing 503), and Redis is excluded from the explicit readiness group (DB retained); k8s probes already target `/actuator/health/readiness`. Adds `scripts/smoke-redis-readiness.sh`.
- **CI green post-merge:** Scoped the Redis startup guard out of tests and re-enabled JPA auditing in `@DataJpaTest` slices.

#### Required manual steps
- **`REDIS_PASSWORD` is now a required infra var** for the 6 Redis services (api-gateway + 5 others) — services abort at startup if it is unset or blank. Redeploy clears the bug for all six.

---

## [Unreleased] — 2026-06-07

### Design system — token consolidation (Roboto + Lucide, Tailwind v4)

Multi-step migration to a single shared `@theme` token source across all three frontends, finishing the Roboto/Roboto Mono + Lucide brand stack and cutting per-app token duplication.

#### Design system
- **Shared `@theme` source (Steps 1–2):** New `@andikisha/ui` `theme.css` export — single source of truth for green/amber 25–900 ramps, warm neutrals, semantic + role tokens, green-tinted shadows, motion, and fonts mapped to Roboto/Roboto Mono. Legacy tokens (`brand-*`, `amber-*`, `surface*`, `near-black`, `ink-*`) retained as deprecated aliases (alias-then-migrate). tenant-portal and platform-portal adopted it with zero visual change.
- **Landing → Tailwind v4 (Step 3):** Migrated landing from Tailwind v3 to v4 (`@import "tailwindcss"` + shared `theme.css`, deleted `tailwind.config.ts`, `@tailwindcss/postcss`, autoprefixer removed). Home + pricing pixel-identical before/after; zero Tailwind arbitrary values in `globals.css`.
- **Focus halo + Button hover (Step 4):** Replaced amber focus outlines with a named green `--shadow-focus` halo across `@andikisha/ui` primitives, landing, and the platform tenants page; fixed Button primary hover to darken (`green-800`); added `prefers-reduced-motion` to both portals.
- **Roboto Mono + stray-hex cleanup (Step 5):** Wired `Roboto_Mono` via `next/font` in all three layouts; removed all `dm-mono` references; migrated real-UI stray hex to tokens (WhatsApp `#25d366` → `bg-whatsapp`, leave/auth gradients, leave badges). Marketing mockup-chrome files marked token-exempt. `text-ui`/`text-ui-sm` marked deprecated transitional tokens.
- **Canonical bundle:** Added self-hosted Roboto Mono, brand assets, preview specimens, and app/marketing UI kits; excluded stale Inter fonts.

---

## [Unreleased] — 2026-06-05

### auth/employee — HR_OFFICER role completion + bug-hunt batch

Completed the partial `HR` → `HR_OFFICER` rename and cleared HIGH/MEDIUM findings from the 2026-06-03 bug-hunt inventory.

#### Migrations
- **V15 (auth-service):** Seeds `HR_OFFICER` into `role_permissions` (`employee:read:all`, `employee:update:all`, `leave:read:all`; excludes create, leave:approve, payroll); deletes the 6 legacy `HR` rows; migrates any `role='HR'` users to `HR_OFFICER`.

#### Backend (security/authz)
- **HR_OFFICER operationalised (M-3):** The legacy `HR` role existed in seed data and `@PreAuthorize` expressions but was absent from the `Role` enum, while `HR_OFFICER` had no seed data and silently resolved to `OWN` scope in `CallerScopeResolver`. Removed the deprecated `HR` case, added `HR_OFFICER` to the ALL bucket, added a `log.warn` on unknown-role default, and updated `EmployeeController`/`LeaveController` `@PreAuthorize` expressions (HR_OFFICER does not approve leave).
- **Bulk activation idempotency (H-2):** Activation always issued a fresh temp password even when the employee already had a linked user account, so HR received credentials that were never set. New `UserAlreadyActivatedException` → HTTP 422 with machine-readable `{ error, message, employeeId }` for frontend deep-linking.
- **nationalId uniqueness at validate time (H-3):** Duplicate `nationalId` values were only caught at commit as a generic 409 rollback. `BulkUploadService.validate()` now pre-builds an in-file duplicate map and `validateRow()` runs cross-file (`existsByTenantIdAndNationalId`) + in-file checks with row-level reporting.
- **EmployeeMapper NPE guard (H-1):** Both `grossPay` expression mappings dereferenced `getSalaryStructure()` without a null guard (MapStruct emits expressions verbatim), producing a silent NPE. Extracted `computeGrossPay(Employee)` that throws `BusinessRuleException("INCOMPLETE_SALARY_STRUCTURE", ...)` at the mapping boundary.

#### Frontend
- **useRoleGuard default-deny (M-5):** Hook returned "authorized" while the user was still loading (null), briefly flashing protected content. Added a `"loading"` `AuthStatus` returned when `authorized === null`.

---

## [Unreleased] — 2026-06-04

### Cross-service — bug-hunt batch-1 (resilience + prod hardening)

Trivial-to-medium wins from the 2026-06-03 inventory.

#### Backend
- **Leave event publisher transaction guard (M-1):** `RabbitLeaveEventPublisher` now has `sendAfterCommit()` with an `isActualTransactionActive()` guard (matching `RabbitPayrollEventPublisher`), removing the `IllegalStateException` risk when publishing outside a transaction. Adds `RabbitLeaveEventPublisherTest`.
- **Payroll gRPC deadlines (M-2):** `EmployeeGrpcClient` + `LeaveGrpcClient` (payroll-service) apply per-call `.withDeadlineAfter()` on every blocking stub call (configurable via `app.grpc.deadline-seconds.*`, default 30s); `DEADLINE_EXCEEDED` is logged with the timeout and `EmployeeGrpcClient` throws `BusinessRuleException` so payroll fails fast instead of hanging the thread pool.
- **Swagger disabled in prod (M-4):** Added `application-prod.yml` to all six services (auth, employee, payroll, leave, notification, api-gateway) disabling `springdoc.api-docs` and `swagger-ui`; dev unchanged.

#### Frontend
- **Self role-change cache invalidation (M-6):** `ChangeRoleModal.onSuccess` now conditionally invalidates `["current-user"]` when the changed employee is the logged-in admin, closing a 60-second stale-role window.

---

## [Unreleased] — 2026-06-01

### auth/employee/leave/payroll — Roles, Permissions & Onboarding (Steps 1–6)

Major feature build implementing invite-only registration, per-request scope enforcement, role assignment, admin password reset, profile self-service, and bulk employee upload.

#### Migrations
- **V14 (auth-service):** `NOT VALID CHECK` constraints enforcing `employee_id` invariants (invite-only registration link).
- **V8 (employee-service):** `personal_email`, `emergency_contact_name`, `emergency_contact_phone`, `avatar_url`.
- **V9 (employee-service):** `bulk_upload_batches` table + `pending_activation` column on employees.

#### Backend (security/authz)
- **Invite-only registration (Step 1):** `RegisterRequest` now requires `employeeId`; `User.linkEmployee()` rejects `SUPER_ADMIN`; `AuthService` enforces the link at creation and fixes `provisionEmployeeUser` idempotency. Gateway logs a warning for authenticated non-SUPER_ADMIN with empty `employeeId`. Backfill: 25 HIGH-confidence rows linked, 1 LOW-confidence orphan deleted.
- **Per-request scope enforcement (Step 2):** New `ScopeType`, `ResolvedScope`, `DepartmentScopeException` in andikisha-common; `CallerScopeResolver` in employee-service (DB lookup) and leave-service (gRPC, via new `EmployeeGrpcClient`). `GET /employees`, `GET /leave/requests`, `GET /payslips` now scope by role: LINE_MANAGER → department, EMPLOYEE → own, HR/ADMIN/PAYROLL_OFFICER → all.

#### New endpoints
- `PATCH /api/v1/auth/users/{userId}/role` (ADMIN) — gRPC dept check for department-scoped roles; revokes refresh tokens; publishes `UserRoleChangedEvent`.
- `GET /api/v1/auth/users/by-employee/{employeeId}` (ADMIN, HR_MANAGER).
- `POST /api/v1/auth/users/{userId}/admin-password-reset` (ADMIN, HR_MANAGER) — HR_MANAGER cannot reset ADMIN; SUPER_ADMIN always blocked; sets `mustChangePassword=true`, revokes refresh tokens, publishes `AdminPasswordResetEvent`.
- `PATCH /api/v1/employees/me/profile` — tier-1 self-service (phone, personalEmail, emergencyContact); tier-2 statutory fields remain HR-only.
- `POST /api/v1/employees/me/avatar` — JPEG/PNG/WEBP ≤2MB, local storage; `MaxUploadSizeExceededException` → 422 `FILE_TOO_LARGE`.
- Bulk upload suite: `GET /bulk-upload/template.{xlsx,csv}` (Apache POI), `POST /bulk-upload` (full-file validation: email uniqueness, role allowlist, dept/position fuzzy match via Levenshtein ≤2, date/salary/KRA-PIN/NSSF/SHIF format), `POST /bulk-upload/{id}/commit` (sets `pending_activation=true`, does NOT auto-provision users), `GET /bulk-upload/pending-activation`, `POST /bulk-upload/activate`, and `POST /auth/employees/provision` (batch activation returning temp passwords).

#### New events
- `UserRoleChangedEvent`, `AdminPasswordResetEvent` (RabbitMQ).

#### Frontend (tenant-portal)
- System Role card + `ChangeRoleModal` and a two-step admin password-reset modal on employee detail; `/my/profile` inline-edit tier-1 with read-only tier-2 (amber HR notice); `/admin/employees/bulk-upload` (upload + validation report + commit) and `/admin/employees/pending-activation` (multi-select + activation result modal).

#### Required manual steps / breaking changes
- **Registration now requires `employeeId`** — self-serve (non-invite) registration no longer works.
- Apply auth-service **V14** and employee-service **V8/V9** before deploying.
- Known follow-up: `EMP-BACKLOG-001` — `ListEmployees` gRPC unimplemented (workaround: `listActiveByTenant` + filter).

---

## [Unreleased] — 2026-05-29

### Deployment — Dokploy / GHCR delivery path

Stood up a Dokploy-based deployment pipeline for all 13 services and 3 frontends alongside the existing K8s path.

#### Backend / infra
- Added Dokploy compose deployment pulling `ghcr.io` images for the 13 services and shipping Dockerfiles for the 3 frontends (tenant-portal, platform-portal, landing).
- Hardened the frontend Docker build: copy a pre-built JAR instead of rebuilding, create `public/` if missing, skip platform-portal lint during image builds.
- Split the `protoc-gen-grpc-java` chmod into its own Docker layer and made the plugin executable under Alpine so gRPC codegen runs in-image.
- Lowercased `ghcr.io` owner in image tags; gated the Dokploy webhook trigger to skip when the deploy secret is unset.
- Fixed Postgres healthcheck and removed the `x-required-env` compose block incompatible with the Dokploy parser.
- Allowlisted `.env.example` in gitleaks to stop false-positive secret detection.
- Added a Dokploy environment setup guide (`docs/`).

---

## [Unreleased] — 2026-05-26

### CI/CD & tests — pipeline stabilization

Reworked the image promotion flow and stabilized the test suite for CI.

#### CI/CD
- CI now pushes verified Docker images to ECR on `master`; staging/production **promote** the CI-tested image rather than rebuilding it.
- Kustomize image tags are committed back to the repo (GitOps-lite); added an ECR image preflight before production deploy.
- Replaced swallowed/silent-skip failures: staging rollout check no longer eats failures, smoke test replaced with a retry-loop health check, and a post-rollout health check added to production.
- Pinned staging checkout to the `workflow_run` head SHA; corrected kustomize path to `infrastructure/k8s/base`; added pnpm store cache, pnpm version pin, and full git history for gitleaks.

#### Tests
- Switched Testcontainers `@DataJpaTest`/`@SpringBootTest` from Flyway+validate to create-drop, and converted most `@DataJpaTest` classes from PostgreSQL to H2 to cut Docker load (tenant-service integration tests also moved to H2).
- Fixed JPA auditing duplicate `@EnableJpaAuditing` imports (compliance, analytics, tenant), reactive Redis mock, random gRPC test port binding, and a 32-byte test key for `CredentialEncryptor`.
- leave-service: unquoted reserved keyword `YEAR` in the H2 test URL; cleared JPA cache after the bulk freeze update.

---

## [Unreleased] — 2026-05-21

### Platform — Kubernetes resilience & deploy hardening

Added availability and scaling primitives to the Release 01 manifests.

#### K8s
- Added PodDisruptionBudgets for all 17 services, soft pod anti-affinity to every Release 01 deployment, and HPAs for `api-gateway` and `auth-service`.
- Documented a NetworkPolicy prerequisite with stubs.

#### Frontend
- Replaced underline tabs with a segmented control across all filter locations; added a `PaginationBar` primitive; removed the browser-default focus ring and unified the leave table header background.

---

## [Unreleased] — 2026-05-20

### Tenant / Auth — workspace-in-URL routing

Introduced a human-readable `workspace` identifier per tenant and restructured login around it, so users log in via `/{workspace}/login` instead of carrying a hardcoded `TENANT_ID`.

#### Migrations (tenant-service)
- **V8** — added nullable `workspace_slug` (VARCHAR 50), backfilled unique kebab-case slugs from `company_name`, pinned the demo tenant to `demo`, then set NOT NULL + UNIQUE + index.
- **V9** — replaced `workspace_slug` with `workspace` (VARCHAR 20): backfilled from the slug, enforced UNIQUE, a CHECK constraint (`^[a-z0-9]([a-z0-9-]*[a-z0-9])?$`, must start/end alphanumeric), and an index; dropped the old column, constraint, and index. **Breaking:** column rename `workspace_slug` → `workspace`, new format max 20 chars.
- **V10** — dropped the global `UNIQUE(admin_email)` and added composite `UNIQUE(admin_email, tenant_id)`, with a pre-flight duplicate guard that aborts the migration. **Behavior change:** the same email may now administer multiple tenants (consultant-as-admin pattern); the service-level global uniqueness check was removed.

#### New endpoints
- `GET /api/v1/public/tenants/resolve?slug=` (later `workspace`) — unauthenticated slug→tenantId resolution for the BFF, with a matching first-wins gateway route.
- Added a workspace availability endpoint plus a work-email check on `SuperAdminController`.
- `PublicTenantController` routed through `TenantService` to respect the DDD layering.

#### Security / gateway
- Added `/api/v1/public/**` to the JWT bypass list (`GatewayPublicPaths`), `SecurityConfig`, and the tenant-service `TenantInterceptor`/`WebMvcConfig` exclusions so public resolution skips auth and tenant filters.

#### Events
- Added the `workspace` field to `TenantCreatedEvent` (published via `RabbitTenantEventPublisher`); the notification-service welcome email now includes the workspace identifier and `/{workspace}/login` URL with null-safe handling.

#### Frontend (tenant-portal / platform-portal)
- Phase 3: routes restructured under a `[workspace]` dynamic segment — `/login` asks for the workspace when missing, `/{workspace}/login` takes only email+password.
- Login now resolves the workspace before auth and no longer depends on a `TENANT_ID` env var (fixes Issue 2).
- Phase 2 hard gate: standalone `/set-password` route moved out of the `(my)` layout; middleware redirects all `mustChangePassword=true` sessions before any authenticated layout renders, with BFF auto-re-login landing the user on the dashboard.
- platform-portal provision form/success modal and tenant detail strip now surface the workspace slug and login URL.

---

## [Unreleased] — 2026-05-19

### platform-portal — internal staff portal (scaffold → tenant management)

New internal Andikisha-staff portal (port 3003), built across the week and completed here.

#### Frontend
- Minimal scaffold with CSS/Tailwind v4 config, root layout + providers, and a SUPER_ADMIN-only middleware guard.
- BFF auth routes (`GET /api/auth/me`) + real login page; nav config, `HorizontalShell` layout, dashboard with 5 widgets backed by new backend endpoints, and 10 stub pages.
- Full tenant detail page (all 6 sections + action modals), provision form + detail stub, and a tenant list with `comingSoon` nav entries.

### auth / tenant-portal — session timeout + portal-aware routing

#### Frontend
- Session idle timeout with a `returnTo` redirect.
- Login role-aware redirect; the tenant login BFF rejects SUPER_ADMIN with `WRONG_PORTAL` 403; `CurrentUserProvider` hybrid (SSR hydration + React Query revalidation); edge-safe `auth.ts` with `findCorrectDashboard` + unit tests; root layout reads `x-user-*` headers and passes `initialUser` to the provider.

---

## [Unreleased] — 2026-05-18

### auth-service — provisioning, password lifecycle, must-change gate

#### Migrations
- **V13 (auth-service):** `must_change_password` column on `users`.

#### Backend
- Forgot-password + reset-password flow (Redis token, 1h TTL).
- Random temp password for employee provisioning + `EmployeeUserProvisionedEvent`; `provisionEmployeeUser` now links `employeeId`.
- `mustChangePassword` JWT claim + middleware redirect to `/my/change-password`; `changePassword` clears `must_change_password`.
- notification-service: credential welcome email via `AuthEventListener` on `EmployeeUserProvisionedEvent`.

### employee-service — edit flow + onboarding seeds

- Employee edit flow: personal info, position, bank, salary, statutory IDs.
- Idempotent seed-defaults endpoints for departments and positions.

### tenant-portal — workspace setup

- `WorkspaceSetupChecklist` replaces the empty admin dashboard.

---

## [Unreleased] — 2026-05-16

### payroll-service / payroll-ui — disbursement loop + payslip surfaces

#### Backend
- `PaymentsCompletedEvent` wires the APPROVED → COMPLETED payroll-run state transition; payslip payment-status updates + leave-balance self-heal.
- **HELB:** full monthly HELB deduction across all layers (**V7 employee-service migration**: `add_helb_deduction`).

#### Frontend
- Payroll UI surfaces 1–9: list page with correct status enum and paths, create-page redirect fix (`/admin/payroll/{id}`), run-detail page with payment-summary panel, partial-failure indicator on the list page, and employee/dashboard field corrections.

### employee-service — positions

- Position controller + seed script; fixed create/detail forms.

---

## [Unreleased] — 2026-05-13

### tenant-portal — unified portal scaffold (route groups + PWA)

Consolidated the separate admin/employee portals into a single tenant-portal app.

#### Frontend
- Scaffolded tenant-portal from the admin-portal base (step 2.1); employee routes nested under `(my)/my/*` (2.2) and admin routes under `(admin)/admin/*` (2.3).
- Steps 2.5–2.8: service worker scoped to `/my/`, PWA manifest (`start_url`/`scope` = `/my/`), intentionally-permissive middleware, and root redirect.

---

## [Unreleased] — 2026-05-12

### @andikisha/ui + portals — design-system consolidation

#### Frontend
- Plan A Sprint 1 primitives + `/preview` route; Plan B unified shell layouts wired into all three portals.
- Sprint 3 data components + canonical dashboards + a `Cmd+K` command palette; removed the double-header (TopBar eliminated from the main column).
- Added the read-only `template/` reference folder (SmartHR).

---

## [Unreleased] — 2026-05-11

### portals — consolidation + Figma-aligned redesign

#### Frontend
- Full employee-portal self-service (auth, dashboard, payslips, leave, attendance, profile); split-screen login pages across all three portals; redesigned admin/employee UI to the Figma design system; sidebar active-state cleanup (neutral active background, flat nav configs).

#### Backend
- auth-service: auto-create an EMPLOYEE user on the `employee.created` event + fixed a ghost (pre-commit) publish.
- tenant-service: increased the licence-status Redis TTL from 60s to 30m.

---

## [Unreleased] — 2026-05-10

### Full-repo security, correctness, and performance hardening (pre-deployment audit)

14 commits resolving every Critical and High finding from a full-repo code review, plus Medium/Low/Nit fixes throughout.

#### CI/CD

- CD staging now gates on CI passing — uses `workflow_run` trigger so broken code can no longer auto-deploy to staging
- Frontend typecheck (`pnpm -r type-check`) and lint (scoped to app packages) added to CI as a parallel job; Docker build requires both Java and frontend jobs to pass
- ESLint config added to `frontend/superadmin-portal/` (was missing; landing site had one)
- Gitleaks secret scanning added as the second step of the CI build job
- Production rollout monitor expanded from 4 to all 13 services
- `workflow_run` concurrency group fixed to use `head_branch` (was always resolving to `master`)
- `timeout-minutes: 60` added to the production deploy job (was unbounded)

#### Critical security fixes

- **api-gateway:** `POST /api/v1/tenants` was in the gateway public-path bypass list — any unauthenticated caller could create a tenant. Removed from `GatewayPublicPaths.EXACT`.
- **api-gateway:** Licence status cache miss defaulted to `"ACTIVE"` (fail-open). Now uses `switchIfEmpty` to return 503 with `licence_check_unavailable` — fail-closed.
- **api-gateway:** `/api/v1/super-admin/**` wildcard was in `GatewayPublicPaths.PREFIXES`, making the global JWT filter skip validation for all super-admin paths. Narrowed to the two exact paths that must be public (`/login`, `/provision`).
- **api-gateway:** `JwtException` in `TenantLicenceFilter` fell through silently to `chain.filter(exchange)`. Now returns 401 and logs a warning.
- **api-gateway:** `Base64.getDecoder()` with manual character substitution replaced with `Base64.getUrlDecoder()` (padding-tolerant) in all 4 filter classes.
- **api-gateway:** Null `tenantId` claim in a non-SUPER_ADMIN token previously passed through to downstream services with no tenant header. Now returns 401 `MISSING_TENANT_CLAIM`.
- **api-gateway:** Error response body shape standardised across all 3 filters (`status`, `code`, `message`, `timestamp`); `setContentType` replaces `headers().add`; `SuperAdminAuthFilter` now returns 401 (not 403) for authentication failures.
- **auth-service:** `provisionTenantAdmin` gRPC error passed `e.getMessage()` into the status description, leaking stack trace fragments and internal IDs. Replaced with a generic message; full exception logged server-side.
- **superadmin-portal BFF:** Proxy forwarded any caller-supplied path with no validation — an authenticated session could reach `actuator/shutdown` or internal endpoints. Added `ALLOWED_PATH_PREFIXES` allowlist; returns 403 for anything outside it.
- **superadmin-portal BFF:** `/api/proxy/` removed from middleware `PUBLIC_PREFIXES` — defence-in-depth restored; middleware and proxy handler both verify the cookie independently.
- **superadmin-portal login:** Cookie `maxAge` was derived from `body.remember` (client-controlled). Now uses only `data.expiresIn` from the upstream response with a 3600s fallback and a positive-integer type guard.
- **superadmin-portal login:** `data.accessToken` from upstream was used without runtime validation — could set cookie to `"undefined"`. Returns 502 if the value is not a non-empty string.
- **superadmin-portal login:** Added in-memory rate limiter (10 attempts / 15-minute window per IP) checked before any upstream call.

#### Ghost events (Critical correctness)

Events were being published inside `@Transactional` methods without an afterCommit guard. If the transaction rolled back, downstream services (notification, analytics, leave) received events for operations that never committed.

Fixed in 6 locations across 3 services:
- **tenant-service** — `LicencePlanService.renew()`, `LicencePlanService.upgrade()`, `SuperAdminTenantService.createTenantWithLicence()`
- **payroll-service** — `PayrollService.initiatePayroll()`, `PayrollService.calculatePayroll()`, `PayrollService.approvePayroll()`
- **employee-service** — `EmployeeService.create()`, `update()`, `updateSalary()`, `terminate()`

All event publishes now go through a `publishAfterCommit(Runnable)` helper using `TransactionSynchronizationManager.registerSynchronization`. Guard corrected to `isActualTransactionActive()` (was `isSynchronizationActive()` in payroll and employee).

Also added: `SuperAdminTenantService.cancelTenant()` previously published no event — other services were never notified of cancellations. Added `TenantCancelledEvent` (new event class in `andikisha-events`) published on `tenant.cancelled` routing key.

#### Shared library

- **`TenantContext`** switched from `InheritableThreadLocal` to `ThreadLocal`. InheritableThreadLocal propagates parent values to child threads at creation time in thread pools, risking stale cross-request tenant IDs. All entry points (filters, gRPC interceptors, listeners) already set the value explicitly.
- **`BaseEntity.setTenantId`** reduced from `public` to `protected`. External code can no longer accidentally overwrite the tenant ID of any entity after construction.

#### Performance (tenant-service)

- **`getSuperAdminAnalytics()`** — replaced unbounded `licenceRepository.findAll()` and `planRepository.findAll()` (full heap loads) with SQL `GROUP BY` aggregation queries. Also fixed a JPQL bug: `IN ('CANCELLED', 'EXPIRED')` string literals replaced with typed `List<LicenceStatus>` parameters.
- **`getExpiringLicences()`** — replaced `tenantRepository.findAll()` with a scoped `findByTenantIdIn` keyed to only the tenants referenced by expiring licences.
- **`LicenceExpiryJob.transitionLapsedGraceToSuspended()`** — eliminated N+1 history lookup (one query per grace-period licence). Added `grace_period_entered_at TIMESTAMP` column to `tenant_licence` (Flyway `V7`); nightly job now filters directly by this column with a partial index on `status = 'GRACE_PERIOD'`.
- **`batchGetCurrentLicences()`** — eliminated N+1 plan lookups. Batch callers now pre-fetch all plan IDs in one `findAllById` call and pass a Map to the DTO mapper.

#### Backend correctness

- **`TenantGrpcService.verifyTenantActive()`** — caught all exceptions and returned `active=false`. DB outages were indistinguishable from missing tenants. Split into `TenantNotFoundException` → `active=false` and `Exception` → `onError(Status.INTERNAL)`.
- **`LicencePlanService.upgrade()`** — removed dead guard (status check after repository query that already guaranteed the same statuses).
- **`SuperAdminTenantService`** — `extendTrial` and `cancelTenant` now use `findByIdAndTenantId` instead of bare `findById`, consistent with every other service method.
- **`CancelPayrollRequest`** — new DTO record with `@Size(max=500)` on `reason`; replaces unvalidated `Map<String, String>` on the `DELETE /api/v1/payroll/runs/{id}` endpoint.
- **`KenyanTaxCalculator.applyBand()`** — intermediate `BigDecimal` multiplications now apply `setScale(4, HALF_UP)` before accumulation; final `setScale(2, HALF_UP)` applied once on the total. Prevents sub-cent rounding drift on multi-million KES payrolls.
- **`Tenant.updatePaySchedule()`** — `BusinessRuleException` now uses code `"INVALID_PAY_DAY"` instead of the generic default.
- **`PasswordGenerator`** extracted from `SuperAdminTenantService` into a dedicated `@Component`.
- **`AuthService.provisionTenantAdmin`** — `TenantContext` afterCommit race: event payload now captures `tenantId` as a final local before the try block, not from `TenantContext` at callback time.

#### Frontend correctness and accessibility

- **Modals** — all 5 (`ConfirmModal`, `SuspendModal`, `ExtendTrialModal`, `RenewModal`, `UpgradeModal`) now use a shared `BaseModal` wrapper with `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, Escape key handling, and focus-on-mount. Previously none had any ARIA dialog contract.
- **`TenantTable`** — removed non-functional checkboxes (select-all and per-row) and inert `Trash2`/`Pencil` icon buttons that had no onClick handlers. Removed the duplicate `<a href="/tenants/new">` anchor inside the table component (navigation belongs at the page level).
- **`SortHeader`** moved from inside `TenantTable` to module scope — was causing re-mount on every parent render.
- **`ApiError`** — new `class ApiError extends Error` with a typed `data` field. Replaces thrown plain objects from `auth.ts` which broke `instanceof Error` guards in catch blocks.
- **`FeatureFlagsTab`** — added `onSettled` to the toggle mutation so the cache re-invalidates from the server after both successful and failed mutations.
- **`TenantsPage`** — `<a href="/tenants/new">` replaced with `<Link href="/tenants/new">` for client-side navigation.
- **`AlertBanner`** — dismiss key now scoped to the current alert count; re-appears when the count changes.
- **Dashboard layout** — fallback email changed from `"superadmin@andikisha.com"` to `""` so a missing middleware header is visible rather than silently hidden.
- **`NEXT_PUBLIC_API_URL`** renamed to `API_GATEWAY_URL` — the `NEXT_PUBLIC_` prefix was embedding the backend gateway URL in the client bundle at build time. **Manual step required:** rename the variable in `frontend/superadmin-portal/.env.local` and in your AWS deployment environment before the next build.

---

## [Unreleased] — 2026-05-09

### superadmin-portal + tenant-service — Tenants section (Plan 2)

Full Tenants section of the superadmin portal backed by 5 new backend endpoints.

#### tenant-service — New backend endpoints

- `PATCH /api/v1/super-admin/tenants/{id}/extend-trial` — extend trial period by 1–90 days; guarded by `BusinessRuleException` if tenant is not in TRIAL status
- `DELETE /api/v1/super-admin/tenants/{id}` — soft-cancel a tenant (returns 204); rejects if already CANCELLED
- `GET /api/v1/super-admin/tenants/{id}/feature-flags` — list all feature flags for a specific tenant
- `PUT /api/v1/super-admin/tenants/{id}/feature-flags/{key}/enable` — enable a named flag; creates it if absent
- `PUT /api/v1/super-admin/tenants/{id}/feature-flags/{key}/disable` — disable a named flag; creates it if absent; `{key}` validated with `@Pattern` + `@Size`

#### tenant-service — Domain changes

- `Tenant.extendTrial(int additionalDays)` — new domain method; throws `BusinessRuleException("INVALID_STATE")` for non-TRIAL tenants
- `ExtendTrialRequest` record — `@Min(1)` / `@Max(90)` validated DTO
- `TenantDetailResponse` enriched with `adminPhone`, `kraPin`, `nssfNumber`, `shifNumber`, `payFrequency`, `payDay`, `suspensionReason`, `trialEndsAt`
- `SuperAdminTenantService` — added `extendTrial()` and `cancelTenant()` service methods
- `FeatureFlagService` — added `getAllForTenantById()`, `enableForTenant()`, `disableForTenant()` (tenant-scoped, no reliance on `TenantContext`)
- `SuperAdminController` — `FeatureFlagService` injected; all 5 new endpoints wired; 9 new `@WebMvcTest` e2e tests

#### superadmin-portal — Frontend

- `types/tenant.ts` — expanded with `TenantDetail`, `LicenceDetail`, `LicenceHistory`, `FeatureFlag`, `Plan`, `ProvisionedTenant`, `PagedResponse<T>`
- `components/ui/Toaster.tsx` — new: context-based toast system (`ToastProvider`, `useToast` hook); three variants (success/error/warning) with 4-second auto-dismiss
- `app/layout.tsx` — `ToastProvider` wraps children inside `QueryProvider`
- `app/tenants/page.tsx` — replaced stub: status filter tabs (All/Active/Trial/Suspended/Cancelled), `TenantTable` reuse, pagination, error state
- `app/tenants/new/page.tsx` — new: tenant provisioning form (organisation, admin contact, licence sections); on success switches to credentials reveal card with eye-toggle and clipboard copy for the temporary password
- `app/tenants/[tenantId]/page.tsx` — replaced stub: 6-tab shell (Overview / Onboarding† / Employees† / Licence / Feature Flags / Audit†); loading skeleton and error state; `TenantActionMenu` in header
- `components/tenants/detail/OverviewTab.tsx` — 2-column grid: Organisation (status pill, suspension reason, trial end), Admin Contact, Statutory Registrations (KRA/NSSF/SHIF), Pay Schedule
- `components/tenants/detail/LicenceTab.tsx` — current licence card (plan, status, billing, seats, price, dates, licence key) + history table; Renew and Upgrade action buttons
- `components/tenants/detail/RenewModal.tsx` — plan picker, billing cycle, seats, price, end date; posts to `/licences/renew`
- `components/tenants/detail/UpgradeModal.tsx` — plan picker, seats, price; posts to `/licences/upgrade`
- `components/tenants/detail/FeatureFlagsTab.tsx` — toggle switches with optimistic UI; rollback on error; loading skeleton
- `components/tenants/detail/TenantActionMenu.tsx` — dropdown gated by tenant status: Suspend (ACTIVE/TRIAL), Reactivate (SUSPENDED), Extend Trial (TRIAL), Cancel Tenant (not CANCELLED/DELETED)
- `components/tenants/detail/ConfirmModal.tsx` — reusable confirm dialog (danger/amber/primary variants)
- `components/tenants/detail/SuspendModal.tsx` — reason textarea, submit disabled until non-empty
- `components/tenants/detail/ExtendTrialModal.tsx` — numeric input 1–90 days with live button label

† Placeholder — Phase 2

---

### frontend/landing — /pricing page enhancement

Structural cleanup and UX upgrade across all pricing page components.

#### New components
- `components/pricing/PricingComparisonTable.tsx` — extracted comparison table (AndikishaHR vs spreadsheet); added `scope="col"` on all `<th>` headers (WCAG 1.3.1)
- `components/pricing/PricingTestimonials.tsx` — extracted testimonials with "What customers say" Eyebrow heading and "Businesses that switched. Numbers that changed." h2

#### Rebuilt components
- `components/pricing/PricingTable.tsx` — full rebuild:
  - Billing toggle: Monthly / Annual switch; annual prices auto-calculated at 15% discount (Starter KES 298, Growth KES 238, Scale KES 187)
  - Separated plan cards: full-width 3-column grid above feature grid; Growth card uses `bg-brand-900` featured treatment; highlights list with "Everything in X, plus:" inheritance labels
  - Trust strip: 4 signals (30-day free trial, No credit card, Cancel any time, Annual saves 15%) between cards and grid
  - Feature grid: Check/X icons replace "Yes"/"-" text; rows grouped into 3 collapsible sections (Core / Growth & Scale only / Scale only); expand/collapse toggle
  - CTA links fixed: Starter and Growth → `/early-access`, Scale → `/contact` (previously all self-linked to `/pricing`)
  - `type="button"` added to both interactive buttons; `aria-expanded` on expand toggle; `role="switch"` + `aria-checked` on billing toggle

#### Modified components
- `components/faq/FaqList.tsx` — added optional `columns?: 1 | 2` prop (default `2`; home page unaffected); single-column mode removes left/right border separators

#### Page
- `app/pricing/page.tsx` — reduced from ~138 lines to 52 lines; all inline comparison table and testimonials data removed; `<FaqList columns={1} />` for single-column FAQ layout on pricing page

#### Bug fixes
- Navbar: removed dark-hero transparent mode (`DARK_HERO_PAGES`) that made nav links invisible on the white-background home page; removed `ChevronDown` icons from all nav links

---

## [Unreleased] — 2026-05-08

### frontend/landing — Secondary pages full redesign

All 8 secondary pages updated to match home page visual language (Bricolage Grotesque headlines, brand-900/950 hero backgrounds, amber accents, single primary CTA, JoinCTA or NewsletterSection closing every page).

#### Wave 1 — Form pages
- `/contact`: two hero stat chips (2hr response time, Mon–Fri 8am–6pm EAT); `NewsletterSection` at bottom
- `/demo`: social proof chip in hero ("240+ companies onboarded"); `LogosRow` trust strip; `JoinCTA` at bottom
- `/early-access`: amber urgency counter ("42 of 50 spots remaining"); Lucide icons on perks (Lock/Database/UserCircle/Map/LayoutGrid); testimonial quote section

#### Wave 2 — Content pages
- `/product`: `StatsBand` with product stats (9 modules, 6 obligations, <1d setup, 100% accuracy); colored status dots on dark mockup panels; monogram integration tiles with status badge; `JoinCTA` replaces old CTA band
- `/about`: `StatsBand` (platform stats) below hero; partners stub section removed; `JoinCTA` at bottom
- `/pricing`: "30-day free trial" and "No credit card required" chips in hero; spreadsheet vs AndikishaHR comparison table; two ROI testimonial quotes; `JoinCTA` replaces old CTA band

#### Wave 3 — New builds
- `/partners`: full new page — hero, who-qualifies (3 partner types with icons), benefits grid (4 cards), 3-step how-it-works, dark apply CTA section
- `/blog`: PostCard upgraded to dark gradient header with amber category badge; active category pill changed to amber; inline newsletter replaced with shared `NewsletterSection`; `line-clamp-2` handles title truncation
- `/blog/[slug]`: `ReadingProgress` bar (amber, fixed top); `ShareBar` (LinkedIn/Twitter/WhatsApp); related posts now filtered by category with recency fallback; `NewsletterSection` between article CTA and related posts; related posts heading shows category name

#### Shared component updates
- `StatsBand`: extended to accept optional `stats` prop; existing home page stats become the default — no breaking change
- New components: `components/blog/ReadingProgress.tsx` (with initial-position sync on mount), `components/blog/ShareBar.tsx` (links memoized, WhatsApp inline SVG)

---

## [Unreleased] — 2026-04-21

### document-service — 100% complete (Phase 3)

#### shared/andikisha-proto
- Added `GetPaySlips` RPC to `PayrollService` with `GetPaySlipsRequest`, `GetPaySlipsResponse`, and `PaySlipDetail` message types — covers all 19 payslip fields (gross, net, basic pay, allowances, all statutory deductions, and reliefs) needed by document-service to build PDF payslips without a separate database query

#### document-service
- `build.gradle.kts`: changed `grpc-server-spring-boot-starter` → `grpc-spring-boot-starter` — the server-only starter does not include the gRPC client stubs required by `PayrollGrpcClient`; the unified starter bundles both server and client
- `application.yml`: added `app.grpc.payroll.deadline-seconds` config property (default 10, overridable via `PAYROLL_GRPC_DEADLINE_SECONDS` env var)
- `V1__create_documents.sql` and `V2__create_document_templates.sql`: fixed column indentation from parenthesis-aligned to consistent 4-space indented style

**Test suite — 4 test classes, 45 cases — BUILD SUCCESSFUL**
- `DocumentServiceTest` (10 unit tests) — getById happy path, NOT_FOUND tenant isolation guard, download single-DB-trip regression guard (I5), invalid document type → `BusinessRuleException` with code `INVALID_DOCUMENT_TYPE`, valid type filter, case-insensitive type resolution
- `PayslipHtmlBuilderTest` (8 unit tests) — employee details rendering, earnings/deductions tables, net pay, tax reliefs section, empty reliefs omits section, HTML escaping (`&` → `&amp;`, `<` → `&lt;`), null net pay → `KES 0.00`, valid HTML structure
- `DocumentRepositoryTest` (13 integration tests, Testcontainers/PostgreSQL 16) — tenant isolation via `findByIdAndTenantId` cross-tenant guard, employee filtering, type filtering, payroll run isolation, period uniqueness, `markReady`/`markFailed` status transitions
- `DocumentControllerTest` (14 e2e tests, `@WebMvcTest`) — all 6 endpoints; missing `X-Tenant-ID` → 400, unknown document → 404 with `$.error = "NOT_FOUND"`, invalid type → 422 with `$.error = "INVALID_DOCUMENT_TYPE"`, download with correct `Content-Disposition` header

---

### frontend/landing — Full audit fix + MDX blog CMS

#### API routes (new)
- `app/api/contact/route.ts` — validates required fields, sends via Resend when `RESEND_API_KEY` is set, returns `{ ok: true }` without the key for local dev (graceful degradation)
- `app/api/demo/route.ts` — validates name/email/company/employees, email subject includes company name and team size
- `app/api/newsletter/route.ts` — validates email, sends two emails via Resend: internal team notification + subscriber welcome confirmation with unsubscribe instructions

#### Blog CMS (MDX file-based)
- `lib/blog.ts` — `PostMeta` and `Post` TypeScript interfaces; `getAllPosts()` reads all `.mdx` files from `content/blog/`, parses frontmatter with `gray-matter`, sorts by date descending; `getPost(slug)` reads single post and returns frontmatter + body content
- `content/blog/` — 6 MDX articles with frontmatter (`title`, `excerpt`, `date`, `category`, `readTime`):
  - `paye-2026-bracket-changes.mdx` — 2026 PAYE bracket changes with rate table
  - `spreadsheet-payroll-cost.mdx` — cost analysis with Markdown table
  - `nssf-tier-explainer.mdx` — NSSF Tier I & II breakdown
  - `onboarding-kenya-sme.mdx` — Kenya employee onboarding checklist
  - `shif-vs-nhif.mdx` — SHIF transition guide
  - `housing-levy-guide.mdx` — Housing Levy employer obligations
- `app/blog/BlogClient.tsx` — client component receiving `posts: PostMeta[]`; `activeCategory` state with client-side filtering; category buttons with `aria-pressed` accessibility attribute; `PostCard` sub-component; `NewsletterForm` sub-component calling `/api/newsletter` with success/error states
- `app/blog/page.tsx` — converted to server component using `getAllPosts()`, passes posts to `BlogClient`; hero section remains server-rendered
- `app/blog/[slug]/page.tsx` — rewrote to use `getPost(slug)` and `<MDXRemote source={post.content} />` for full MDX rendering; `generateStaticParams` from `getAllPosts()`; `generateMetadata` adds `openGraph` article metadata; removed inline `ARTICLE_BODY` placeholder map

#### Bug and link fixes
- `components/layout/Navbar.tsx`: Sign In link changed from `href="#"` to `process.env.NEXT_PUBLIC_APP_URL ?? "https://app.andikishahr.com"`
- `components/layout/Footer.tsx`: `/features#time` corrected to `/features#integrations` — the features page has no `id="time"` section
- `app/dpa/page.tsx` (new): Data Processing Agreement page with 12 sections covering Kenya DPA 2019 compliance, data subject rights, sub-processors, and retention obligations — resolves the 404 on the footer `/dpa` link
- `lib/data.ts`: removed `BLOG_POSTS` export (replaced by MDX files and `lib/blog.ts`)
- `app/contact/ContactForm.tsx`: removed `console.log("Contact form:", data)`; form now calls `/api/contact`; added `submitError` state with `AlertCircle` error display block; added `aria-describedby` to all fields
- `app/demo/DemoForm.tsx`: removed `console.log("Demo request:", data)`; form now calls `/api/demo`; added `submitError` state; extracted magic number `300` to `SUBMIT_DELAY_MS` constant; added `aria-describedby` to all fields

#### Dependencies and tooling
- Added `next-mdx-remote ^5.0.0`, `gray-matter ^4.0.3`, `resend ^4.0.0` to dependencies
- Added `@tailwindcss/typography ^0.5.15` to devDependencies
- Removed non-existent `@types/gray-matter` (not in npm registry) from devDependencies
- `tailwind.config.ts`: added `@tailwindcss/typography` plugin with custom `prose` theme matching brand fonts and colors; added `content/blog` to content paths; removed broken `count-up` and `progress-bar` animation keyframes that were declared but never defined
- `.env.example` (new): documents all required environment variables — `RESEND_API_KEY`, `RESEND_FROM`, `CONTACT_TO`, `NEXT_PUBLIC_APP_URL`
- `pnpm install` run — all packages resolved; TypeScript passes with zero errors

---

## [Unreleased] — 2026-04-13

### Security hardening and bug fixes — all Phase 1 & 2 services at 100%

#### shared/andikisha-events
- Changed `BaseEvent` from `@JsonTypeInfo(use = Id.CLASS)` to `@JsonTypeInfo(use = Id.NAME, property = "@type")` with an explicit `@JsonSubTypes` allowlist of all 25 concrete event types — eliminates the polymorphic deserialization gadget-chain attack vector that `Id.CLASS` enables

#### shared/andikisha-common
- `GlobalExceptionHandler`: `handleIllegalArgument` now returns the generic message `"Invalid request argument"` instead of `ex.getMessage()`, preventing internal exception detail leakage; added `handleIllegalState` handler returning `"Request cannot be processed in the current state"`

#### auth-service
- Added `scanBasePackages = {"com.andikisha.auth", "com.andikisha.common"}` and `@EnableJpaAuditing` to `AuthServiceApplication` — common beans (interceptors, exception handlers) are now correctly picked up by component scan and `@CreatedDate`/`@LastModifiedDate` auditing works
- `AuthExceptionHandler`: sanitized `IllegalArgumentException` message (was leaking internal class names and stack trace fragments); added `IllegalStateException` handler
- `AuthGrpcService`: `checkPermission` and `getUserByEmployeeId` now catch `IllegalArgumentException` from `UUID.fromString` separately and return `INVALID_ARGUMENT` instead of silently returning `allowed=false` or `INTERNAL`
- Added `V7__add_audit_columns_to_refresh_tokens.sql` — adds `updated_at TIMESTAMP` and `version BIGINT` columns that `BaseEntity` requires but were absent from the original V3 migration
- `AuthServiceApplicationTest`: added `@MockitoBean ConnectionFactory` to prevent RabbitMQ TCP connection attempt in CI
- New: `AuthControllerTest` — full e2e coverage (`@WebMvcTest`) of all 6 endpoints: register (201/400/409), login (200/401/429), refresh (200/401), change-password (204/401), logout (204/401), me (200/401), missing-tenant-header 400

#### tenant-service
- `TenantGrpcService`: added blank `tenant_id` input guards (returns `INVALID_ARGUMENT`); added separate `IllegalArgumentException` catch for malformed UUID; added `TenantContext` set/clear lifecycle (try/finally) to both `getTenant` and `verifyTenantActive` handlers
- `TenantService`: removed misplaced `@PreAuthorize("hasRole('PLATFORM_ADMIN')")` from `listAll` service method (authorization is enforced at the controller layer — mixing strategies creates false confidence); added inline comment documenting the intentional cross-tenant `findAll` usage for platform admin
- `TenantControllerTest`: fixed `getTenant_whenExists_returns200` — was sending `TENANT_ADMIN` role to a `PLATFORM_ADMIN`-only endpoint and expecting 200 (false-passing test); now sends `PLATFORM_ADMIN`; added `getTenant_withNonPlatformAdmin_returns403` regression guard
- `TenantServiceApplicationTest`: added `@MockitoBean ConnectionFactory` alongside existing `RabbitTemplate` mock

#### compliance-service
- Added `Spring Security` (`TrustedHeaderAuthFilter` + `SecurityConfig`) — trusts `X-User-ID`/`X-User-Role` headers set by the API Gateway
- Added `InvalidCountryCodeException extends IllegalArgumentException` — maps cleanly to HTTP 400 via `GlobalExceptionHandler` without requiring shared-library changes
- Fixed `ComplianceGrpcService` and `PayrollEventListener` — `TenantContext.setTenantId()` moved inside `try` block so `finally { TenantContext.clear() }` fires on all exit paths
- `ComplianceControllerTest`: added `X-User-ID` and `X-User-Role` headers to all requests; fixed one test that was missing auth headers

#### leave-service
- `LeaveController`: added `@PreAuthorize("hasAnyRole('HR_MANAGER','HR','ADMIN','MANAGER')")` to `GET /api/v1/leave/requests` and `GET /api/v1/leave/requests/{id}` — these were open to all authenticated users, allowing any employee to read the entire tenant's leave history
- `RabbitMqConfig`: declared the `dlx.leave` `DirectExchange` bean, DLQ queues (`leave.employee-events.dlq`, `leave.tenant-events.dlq`), and their bindings — previously the DLX exchange was referenced in queue arguments but never declared, which causes queue declaration failures in strict RabbitMQ environments
- `WebMvcConfig`: `TenantInterceptor` is now a Spring-managed `@Bean` (was `new TenantInterceptor()`) — future Spring-managed dependencies will be injected correctly
- `LeaveControllerTest`: added `SecurityConfig` and `TrustedHeaderAuthFilter` to `@Import` so the full security filter chain runs in the web slice and ownership `@PreAuthorize` SpEL expressions are genuinely exercised; updated `listRequests` and `getRequest` tests to use `HR_MANAGER` role; added `listRequests_withEmployeeRole_returns403` and `getRequest_withEmployeeRole_returns403` regression guards

#### employee-service
- `EmployeeController`: added `@PreAuthorize("hasAnyRole('HR_MANAGER','ADMIN')")` to all five write endpoints: `create`, `update`, `updateSalary`, `confirmProbation`, `terminate` — these were completely unprotected, allowing any authenticated user to modify or terminate employees
- `EmployeeGrpcService`: added blank `tenant_id` input guards (returns `INVALID_ARGUMENT`) to all three handlers; moved `TenantContext.setTenantId()` inside `try` blocks; `getEmployee` and `getSalaryStructure` now catch `ResourceNotFoundException` specifically for `NOT_FOUND` — unexpected errors now return `INTERNAL` instead of being masked as `NOT_FOUND`
- `TrustedHeaderAuthFilter`: added CR/LF sanitization on `X-User-ID` and `X-User-Role` headers (same as existing fix in `TenantLoggingFilter`) — prevents log injection via crafted headers
- `EmployeeServiceApplicationTest`: added `@MockitoBean ConnectionFactory` to prevent broker connection in CI
- `EmployeeControllerTest`: added `create_withUnauthorizedRole_returns403` and `terminate_withUnauthorizedRole_returns403` to verify new `@PreAuthorize` guards

---

## [Unreleased] — 2026-04-11

### Phase 1 — Foundation Services

#### auth-service
- Built to 100%: JWT token issuance and validation, unit tests, RabbitMQ event publishing verified

#### tenant-service
- Built to 100%: tenant provisioning, lifecycle management (create/suspend/reactivate), unit and integration tests passing

#### employee-service
- Domain models, repositories, DTOs, and services scaffolded (in progress)

---

### Phase 2 — Core HR: leave-service brought to 100%

**Critical bug fixes**
- Replaced all `double`/`float` day-count fields with `BigDecimal` across `LeaveBalance`, `LeaveRequest`, `LeaveBalanceService`, `SubmitLeaveRequest`, and `LeaveApprovedEvent` — prevents floating-point rounding errors in leave accounting
- Fixed `LeaveService.approve()` ordering: state guard (`request.approve()`) now runs before `balance.deduct()`, preventing concurrent approvals from double-deducting the balance; the losing thread receives HTTP 409 via the new `ObjectOptimisticLockingFailureException` handler in `GlobalExceptionHandler`
- Removed unfiltered `findOverlappingApprovedLeave` repository method (missing `employeeId` filter — cross-employee data exposure risk); replaced with `findOverlappingByEmployee` requiring `tenantId + employeeId + status`
- Fixed JPQL overlap query to use named `:status` parameter instead of the non-portable Hibernate string literal `'APPROVED'`
- Removed all `TenantContext.setTenantId()` calls from `LeaveController` — tenant lifecycle is owned exclusively by `TenantInterceptor`
- Fixed `LeavePolicyService` self-invocation proxy bypass: extracted `savePolicyIfNotExists` into a dedicated `@Service` bean (`LeavePolicyInitializer`) so `@Transactional(REQUIRES_NEW)` is applied via the Spring AOP proxy; duplicate `TenantCreatedEvent` delivery no longer rolls back all five policy inserts

**Code quality fixes**
- Fixed `LeaveBalanceService` pro-ration and monthly accrual arithmetic to use `BigDecimal` with `RoundingMode.HALF_UP` (was raw `double`)
- Replaced O(n²) policy lookup in `runMonthlyAccrual` with a `Map<LeaveType, LeavePolicy>`
- Eliminated duplicate `LocalDate.now()` call to avoid midnight-rollover race
- Changed sick leave policy default to `requiresApproval = false` per Kenya Employment Act (self-certified sick leave)

**New features**
- Added pending balance reservation at submit time: `sumDaysByStatus` JPQL aggregate deducts in-flight PENDING request days from available balance, preventing concurrent submissions from exhausting the same allowance
- Implemented HR reversal workflow end-to-end:
  - `LeaveRequest.reverse()` domain method (APPROVED → CANCELLED)
  - `LeaveService.hrReverse()` — state guard first, then balance restore, then event publish
  - `LeaveReversedEvent` added to `andikisha-events` (with `BigDecimal days`)
  - `POST /api/v1/leave/requests/{id}/reverse` controller endpoint
  - `publishLeaveReversed` added to `LeaveEventPublisher` port and `RabbitLeaveEventPublisher`

**Shared library additions**
- `GlobalExceptionHandler`: added `ObjectOptimisticLockingFailureException` → HTTP 409 and `MissingRequestHeaderException` → HTTP 400 handlers
- `LeaveApprovedEvent`: `days` field changed from `double` to `BigDecimal`
- `LeaveReversedEvent`: new event (`leaveRequestId`, `employeeId`, `leaveType`, `BigDecimal days`, `reason`, `reversedBy`)

**Test suite — 8 test classes, 90+ cases**
- `LeaveServiceApplicationTest` — context loads; mocks `ConnectionFactory` + `RabbitTemplate` to prevent broker TCP connection in CI
- `LeaveRequestDomainTest` — 15 unit tests: factory guards, approve/reject/cancel state machine, `reverse()` guards, `attachMedicalCert`
- `LeaveBalanceDomainTest` — 12 unit tests: deduct/restore/accrue/freeze and all guards
- `LeaveServiceTest` — 22 unit tests: all submit paths (balance, policy, overlap, pending reservation), approve, reject, cancel, `hrReverse` (4 cases), list and get
- `LeaveBalanceServiceTest` — 6 unit tests: pro-ration, policy-not-found skip, freeze, monthly accrual
- `LeaveRequestRepositoryTest` — 16 integration tests (Testcontainers/PostgreSQL): tenant isolation, status filter, overlap detection (4 cases), `sumDaysByStatus` (4 cases)
- `LeaveBalanceRepositoryTest` — 10 integration tests: tenant isolation, bulk freeze, frozen exclusion
- `LeaveControllerTest` — 23 e2e tests (`@WebMvcTest`): all endpoints including `/reverse` (5 cases), missing-header 400, validation 422, not-found 404, business-rule 422

---

## [Unreleased] — 2026-04-03

### Shared Modules — Proto & Common Library

#### Fixed
- **`andikisha-proto` — Java 21 stub compilation failure** — The gRPC Java codegen emits `@javax.annotation.Generated` on all stub classes. On Java 9+, `javax.annotation` was removed from the JDK, causing `cannot find symbol` errors across all 7 generated `*ServiceGrpc.java` files. Fixed by adding `compileOnly("javax.annotation:javax.annotation-api:1.3.2")` to `shared/andikisha-proto/build.gradle.kts`.
- **`andikisha-common` — missing `spring-data-jpa` dependency** — `BaseEntity` uses `AuditingEntityListener` from `org.springframework.data.jpa.domain.support`, which is in `spring-data-jpa`, not `spring-data-commons`. Added `api("org.springframework.data:spring-data-jpa")` to resolve compilation failure.
- **`andikisha-common` — missing `spring-webmvc` dependency** — `TenantInterceptor` implements `HandlerInterceptor` from `org.springframework.web.servlet`, which lives in `spring-webmvc`, not `spring-web`. Added `api("org.springframework:spring-webmvc")` to resolve compilation failure.
- **`andikisha-common` — duplicate dependency declarations** — `build.gradle.kts` had the same artifacts declared twice: once managed by the Spring Boot BOM and once with hardcoded version strings. Removed all duplicates; BOM-managed versions now apply consistently.

#### Added
- **`docs/architecture/implementation-order.md`** — Recommended phase-by-phase implementation order for all 13 services, from shared foundations through intelligence services and infrastructure.

---

## [Unreleased] — 2026-04-01

### Frontend — pnpm Workspace Bootstrap

#### Fixed
- **pnpm workspace resolution error** — `ERR_PNPM_WORKSPACE_PKG_NOT_FOUND` for `@andikisha/api-client`, `@andikisha/shared-types`, and `@andikisha/ui`. All three shared packages were missing their `package.json` files. The `@andikisha/shared-types` manifest was misplaced at `frontend/packages/package.json` instead of inside its own subdirectory.
  - Created `frontend/packages/api-client/package.json`
  - Created `frontend/packages/shared-types/package.json` (moved from wrong location)
  - Created `frontend/packages/ui/package.json`
  - Removed the misplaced `frontend/packages/package.json`
  - `pnpm install` now resolves all 6 workspace packages cleanly

#### Added
- **`@andikisha/shared-types`** (`frontend/packages/shared-types/src/index.ts`) — TypeScript interfaces for `Employee`, `EmploymentStatus`, `LoginRequest`, `TokenResponse`, `UserProfile`, `PageResponse`, `ApiError`, and `FieldError`
- **`@andikisha/api-client`** (`frontend/packages/api-client/index.ts`) — Axios client with:
  - JWT `Authorization` header injection from `localStorage`
  - `X-Tenant-ID` header injection per request
  - Automatic silent token refresh on HTTP 401 using the refresh token
  - Redirect to `/auth/login` on refresh failure
  - Typed `RetryableConfig` interface extending `InternalAxiosRequestConfig` to safely carry the `_retry` flag
- **`@andikisha/ui`** (`frontend/packages/ui/src/`) — Shared component library with:
  - `cn()` utility — `clsx` + `tailwind-merge` class name helper
  - `Button` component — `forwardRef` component with `variant` (primary, secondary, outline, danger, ghost) and `size` (sm, md, lg) props, built on Tailwind CSS v4

#### Added — employee-portal Bootstrap
The `employee-portal` `src/` directory was empty and had no `tsconfig.json` or `next.config.ts`. The portal is now fully bootstrapped:
- `src/app/layout.tsx` — root layout with metadata and `suppressHydrationWarning`
- `src/app/page.tsx` — placeholder home page
- `src/app/globals.css` — Tailwind CSS v4 import
- `next.config.ts` — mirrors admin-portal config with shared package transpilation and `output: "standalone"`
- `tsconfig.json` — strict TypeScript config matching admin-portal with path aliases for all three shared packages

---

### TypeScript — Type Safety Fixes

#### Fixed
- **`api-client` — `process` not found (TS2580)** — `tsconfig.json` was missing `"types": ["node"]` and `@types/node` was absent from `devDependencies`. Both now added; `process.env.NEXT_PUBLIC_API_URL` resolves correctly.
- **`api-client` — unused `ApiError` import** — Removed unused `ApiError` from the import in `index.ts`.
- **`api-client` — implicit `any` on interceptor error** — The Axios response interceptor error callback was untyped (`any`). Changed to `error: AxiosError` with a `RetryableConfig` interface extending `InternalAxiosRequestConfig` for the `_retry` flag. Added `null` check on `originalRequest` before access.
- **`ui` — missing return type on exported function** — Added explicit `: string` return type to the exported `cn()` function in `utils.ts`.
- **`ui/Button` — missing `displayName`** — Added `Button.displayName = "Button"` to the `forwardRef` component for correct React DevTools labelling.

#### Added
- **`api-client/tsconfig.json`** — New TypeScript config (`target: ES2017`, `lib: ES2017 + DOM`, `types: node`, `moduleResolution: Bundler`, `strict: true`) covering both `src/` and root `index.ts`.

---

### Hydration

#### Fixed
- **React hydration mismatch on `<html>` element** — Browser extensions (e.g. accessibility/highlighting tools) inject CSS custom properties (`--ra-highlight-*`) onto the `<html>` tag before React hydrates, causing a server/client attribute mismatch. Added `suppressHydrationWarning` to the `<html>` element in:
  - `admin-portal/src/app/layout.tsx`
  - `employee-portal/src/app/layout.tsx`

---

### Tooling

#### Added
- **`.nvmrc`** — Pinned Node.js runtime to `20.19.0` (Node 20 LTS "Iron"), consistent with the `"node": ">=20.0.0"` engine constraint in `package.json`.

---

### Skills (Claude Code)

#### Added
- **`typesafety` skill** (`~/.claude/skills/typesafety/SKILL.md`) — 8-phase TypeScript type safety audit skill:
  - Phase 1: Environment detection (tsconfig, ESLint, package manager)
  - Phase 2: TypeScript compiler scan with error code classification
  - Phase 3: ESLint type-aware scan (`@typescript-eslint` integration) with fallback grep patterns; explicitly avoids unreliable `!` grep in favour of ESLint's `no-non-null-assertion` rule
  - Phase 4: `tsconfig` strict flag audit (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noImplicitOverride`)
  - Phase 5: Severity classification (High/Medium/Low/Advisory)
  - Phase 6: Fix patterns for `as any`, non-null assertions, implicit `any`, floating promises, `@ts-ignore`, missing return types
  - Phase 7: Verification (tsc + ESLint re-run, test suite)
  - Phase 8: Structured audit report
