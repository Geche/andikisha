# AndikishaHR — Full Architecture Reference

> **Purpose:** A single, verified reference to the AndikishaHR system architecture, intended as a
> blueprint for building similar multi-tenant SaaS platforms. Everything below was confirmed against
> the actual codebase on **2026-07-04**, not just the design docs. Where the code diverges from the
> README/CLAUDE.md, the code wins and the divergence is called out.

---

## 1. What the system is

AndikishaHR is an enterprise **HR & payroll SaaS** for Kenyan / East African SMEs. It is a
cloud-native **microservices** backend (Spring Boot 3.4 / Java 21) with a **Next.js 15** frontend
monorepo, built for **multi-tenant** operation with per-tenant data isolation, Kenyan statutory
compliance (PAYE, NSSF, SHIF, Housing Levy), and M-Pesa salary disbursement.

The architecture rests on three communication planes:

```
                        External clients (browsers)
                                   │  HTTPS / cookie auth
                                   ▼
                       Next.js BFF (tenant-portal proxy)
                                   │  Bearer JWT
                                   ▼
                     API Gateway  (Spring Cloud Gateway :8080)
              ┌────────────────────┼─────────────────────────┐
              │ gRPC (sync)        │ REST                     │ RabbitMQ (async events)
              ▼                    ▼                          ▼
       inter-service          13 domain services        topic exchange fan-out
       request/response       (own DB each)              (audit, notify, analytics, payments)
```

- **REST** — north-south only. External traffic enters through the API Gateway.
- **gRPC** — east-west synchronous calls between services (read-heavy: "get me this employee's salary").
- **RabbitMQ** — east-west asynchronous domain events (write side-effects: "payroll approved", "employee created").

---

## 2. Technology stack (as built)

### Backend
| Concern | Choice | Version |
|---|---|---|
| Language | Java LTS | 21 |
| Framework | Spring Boot | 3.4.1 |
| Cloud | Spring Cloud | 2024.0.0 |
| Build | Gradle Kotlin DSL, multi-module | parallel + build cache on |
| Database | PostgreSQL | **18-alpine** (README says 16 — image is 18) |
| Migrations | Flyway | per-service `V{n}__{desc}.sql` |
| ORM | Spring Data JPA + Hibernate | open-in-view **off** |
| Sync RPC | gRPC via `net.devh` grpc-spring-boot-starter | grpc 1.63.0 / protobuf 4.29.2 / starter 3.1.0 |
| Async | RabbitMQ (Spring AMQP), topic exchanges | 3.13-management |
| Cache / rate-limit | Redis | 7-alpine, password-protected |
| Mapping | MapStruct | 1.6.3 |
| Boilerplate | Lombok | 1.18.36 |
| Auth tokens | JJWT | 0.12.6 |
| API docs | SpringDoc OpenAPI | 2.7.0 (aggregated at the gateway) |
| Tracing | Zipkin + Micrometer | 100% sampling |
| Resilience | Resilience4j (circuit breakers, time limiters) | via Spring Cloud Gateway |
| Testing | JUnit 5, Mockito, Testcontainers | 1.20.4 |
| Quality gate | Checkstyle 10.21 (fails build), Gitleaks | root `config/checkstyle/` |

### Frontend
| Concern | Choice | Version |
|---|---|---|
| Language | TypeScript (strict) | 5.7 |
| Framework | Next.js App Router | 15.1.0 |
| UI | React | 19 |
| Styling | Tailwind CSS **v4** (`@theme`, no `tailwind.config`) | 4.0 |
| Data fetching | TanStack Query | 5.62 |
| HTTP | Axios | 1.7 |
| Validation | Zod | 3.24 |
| JWT (edge) | jose | 5.10 |
| Icons | lucide-react (+ @tabler for brand marks only) | 0.468 |
| Charts | Recharts | 2.15 |
| Package manager | pnpm workspace | 9+ |
| Client state | **React Query + React context** (no Zustand, despite README) | — |

---

## 3. Service catalogue & implementation maturity

13 services in 4 delivery phases. **Every service has a real Spring Boot application** — none is a
bare skeleton. Maturity varies by domain breadth, gRPC exposure, and migration depth.

| Phase | Service | HTTP / gRPC | Ctrls | Entities | gRPC server | Migrations | Maturity |
|---|---|---|---|---|---|---|---|
| 1 Foundation | **api-gateway** | 8080 | 0 | 0 | — | 0 | Edge routing only (no domain) |
| 1 | **auth-service** | 8081/9081 | 5 | 7 | ✅ +1 client | 18 | Fully built — richest schema |
| 1 | **employee-service** | 8082/9082 | 4 | 8 | ✅ | 10 | Fully built — HR master data |
| 1 | **tenant-service** | 8083/9083 | 7 | 8 | ✅ +1 client | 11 | Fully built — control plane |
| 2 Core HR | **payroll-service** | 8084/9084 | 1 | 6 | ✅ +2 clients | 6 | Thin API, heavy calc/integration |
| 2 | **compliance-service** | 8085/9085 | 2 | 4 | ✅ +1 client | 6 | Kenyan tax rate engine |
| 2 | **time-attendance-service** | 8086/9086 | 1 | 4 | ✅ | 2 | Domain + gRPC + events |
| 2 | **leave-service** | 8087/9087 | 1 | 5 | ✅ +1 client | 4 | Full domain + gRPC + events |
| 3 Supporting | **document-service** | 8088/9088 | 1 | 4 | ⚠️ client-only (3) | 2 | No gRPC server exposed |
| 3 | **notification-service** | 8089/9089 | 1 | 5 | — | 2 | ⚠️ REST-only, no messaging pkg |
| 3 | **integration-hub-service** | 8090/9090 | 4 | 7 | — | 4 | M-Pesa/payments/filing, event-driven |
| 4 Intelligence | **analytics-service** | 8091/9091 | 2 | 4 | — | 5 | Event-sourced read models (4 listeners) |
| 4 | **audit-service** | 8092 (no gRPC) | 1 | 3 | — | 2 | Audit sink (8 event listeners) |

### Deepest services (the ones to study first)

- **auth-service** — 18 migrations, 7 entities (`User`, `Role`, `Permission`, `RolePermission`,
  `RefreshToken`, `SuperAdminSession`, `UssdSession`). Standard login, RBAC, platform super-admin
  auth, and **USSD-based auth**. Exposes `AuthGrpcService` (token/identity verification) consumed by
  every other service; consumes employee events; publishes auth events.
- **tenant-service** — the multi-tenant control plane. Entities `Tenant`, `Plan`, `TenantLicence`,
  `LicenceHistory`, `FeatureFlag`, `TenantLogo`. Tenant CRUD, plan/subscription, feature flags,
  licence lifecycle, branding, super-admin dashboard. `TenantGrpcService` + tenant/licence events.
- **employee-service** — HR master data (`Employee`, `Department`, `Position`, `SalaryStructure`,
  `EmployeeHistory`). CRUD + CSV bulk upload. `EmployeeGrpcService` feeds payroll/leave/auth;
  publishes create/update/terminate/salary events consumed widely.
- **integration-hub-service** — the *only* place external APIs are called (M-Pesa Daraja, statutory
  filing). Entities `IntegrationConfig`, `PaymentTransaction`, `FilingRecord`. Purely event-driven
  (payroll listener → payment processor → publisher). No gRPC surface.

---

## 4. Backend building blocks (shared libraries)

Three shared Gradle modules give every service a common spine. This is the pattern worth copying.

### `shared/andikisha-common`
- **`BaseEntity`** (`@MappedSuperclass`, JPA auditing): `UUID id`, `String tenantId (not null)`,
  `LocalDateTime createdAt/updatedAt`, `Long version (@Version)`. Identity-by-id equals/hashCode.
  Every entity extends this → **tenant scoping and optimistic locking are structural, not optional.**
- **`Money`** (`@Embeddable`): `BigDecimal amount (precision 15, scale 2, HALF_UP)` + `String currency
  (len 3, upper-cased)`. Factories `kes()`, `of()`, `zero()`; `add/subtract/multiply/min` all enforce
  same-currency. **No raw double/float anywhere for money.**
- **`TenantContext`** — `ThreadLocal<String>` current tenant, with `requireTenantId()` guard, paired
  with a `TenantInterceptor` (Spring `HandlerInterceptor`).
- **Exception hierarchy** (all `RuntimeException`): `ResourceNotFoundException`,
  `DuplicateResourceException`, `BusinessRuleException`, `LicenceSuspendedException`,
  `ImpersonationNotPermittedException` — all mapped by a shared `GlobalExceptionHandler`
  (`@RestControllerAdvice`) to a common `ErrorResponse`.
- **Shared DTOs**: `ErrorResponse` (error/message/timestamp/traceId/fieldErrors) and
  `PageResponse<T>` records.
- **Scoping**: `ResolvedScope` / `ScopeType` / `DepartmentScopeException` for department-level row
  scoping (a second isolation axis inside a tenant).
- **Utilities**: `KenyanIdValidator`, `PhoneNumberValidator`, `PasswordGenerator`, `RedisKeys`.

### `shared/andikisha-proto` — synchronous contracts (gRPC)
Protobuf + grpc-java generated stubs. Monetary/rate fields are **strings on the wire** to preserve
`BigDecimal` precision. Services and their RPCs:

| Proto | Service | RPCs |
|---|---|---|
| `common.proto` | — | `PaginationRequest/Meta`, `MoneyProto`, `StatusResponse` (shared messages) |
| `auth.proto` | `AuthService` | `ValidateToken`, `CheckPermission`, `GetUserByEmployeeId`, `ValidateUssdSession`, `ProvisionTenantAdmin`, `ResetTenantAdminPassword` |
| `tenant.proto` | `TenantService` | `GetTenant`, `VerifyTenantActive`, `ValidateTenantLicence`, `GetTenantLogo` |
| `employee.proto` | `EmployeeService` | `GetEmployee`, `ListEmployees`, `ListActiveByTenant`, `GetSalaryStructure`, `GetSalaryStructuresBatch`, `GetDepartment` |
| `payroll.proto` | `PayrollService` | `GetPayrollRun`, `GetPaySlip`, `GetLatestPaySlip`, `GetPaySlips` |
| `leave.proto` | `LeaveService` | `GetLeaveBalance`, `GetLeaveBalances`, `GetLeaveBalancesBatch`, `GetUnpaidLeaveDaysForPeriod` |
| `compliance.proto` | `ComplianceService` | `GetTaxRates`, `GetStatutoryRates` |
| `time_attendance.proto` | `AttendanceService` | `GetMonthlyHours` |

Note the **batch RPCs** (`GetSalaryStructuresBatch`, `GetLeaveBalancesBatch`) — deliberate N+1
avoidance for payroll runs that process many employees at once.

### `shared/andikisha-events` — asynchronous contracts (RabbitMQ)
All events extend **`BaseEvent`**: Jackson-polymorphic (`@JsonTypeInfo` `@type` discriminator +
`@JsonSubTypes` registry), carrying `eventId (auto UUID)`, `eventType`, `tenantId`, `timestamp (auto)`.
Event families and their key payloads:

- **auth** — `UserRegistered`, `UserDeactivated`, `UserRoleChanged`, `AdminPasswordReset`,
  `EmployeeUserProvisioned`, `PasswordResetRequested`.
- **employee** — `EmployeeCreated` (incl. basicSalary), `EmployeeUpdated`, `EmployeeTerminated`,
  `SalaryChanged` (old/new salary).
- **leave** — `LeaveRequested`, `LeaveApproved`, `LeaveRejected`, `LeaveReversed`.
- **payroll** — `PayrollInitiated`, `PayrollCalculated`, `PayrollApproved` (full statutory totals),
  `PayrollProcessed`, `PaymentCompleted`, `PaymentFailed`, `PaymentsCompleted` (batch summary).
- **tenant** — `TenantCreated`, `TenantSuspended`, `TenantReactivated`, `TenantCancelled`,
  `TenantPlanChanged`, `LicenceRenewed`, `LicenceUpgraded`, `LicenceExpiring`.
- **attendance** — `ClockIn`, `ClockOut`.
- **compliance** — `ComplianceRateChanged`.
- **document** — `DocumentGenerated`, `DocumentReady`.
- **notification** — `NotificationSent`.

Events are the integration seam: `analytics-service` (4 listeners) and `audit-service` (8 listeners)
are pure consumers building read models / audit trails; `integration-hub` reacts to `PayrollApproved`
to disburse pay and emits `PaymentCompleted/Failed`.

---

## 5. Per-service internal shape (DDD layout)

Every domain service follows the same package layout — this uniformity is a core design decision:

```
com.andikisha.{service}/
  domain/model/          entities (extend BaseEntity), value objects, enums
  domain/repository/     Spring Data JPA interfaces — every method filters by tenantId
  domain/exception/      domain-specific exceptions
  application/service/   business logic; @Transactional(readOnly=true) at class level,
                         overridden on writes
  application/dto/request|response/   inbound (Jakarta-validated) / outbound (Java records)
  application/mapper/    MapStruct mappers
  application/port/      outbound interfaces (event publishers, external clients)
  infrastructure/messaging/    RabbitMQ publishers + listeners
  infrastructure/grpc/         gRPC server impls (extend generated *ImplBase, @GrpcService)
                               and client wrappers
  infrastructure/config/       @Configuration
  infrastructure/persistence/  multi-tenant datasource routing
  presentation/controller/     REST controllers (delegate only, no business logic)
  presentation/advice/         @RestControllerAdvice
  presentation/filter/         servlet filters (tenant context, logging)
```

Enforced conventions: constructor injection only (no field `@Autowired`); records for DTOs/events,
never for entities; REST at `/api/v1/{resource}`; no cross-service DB foreign keys (UUID references
only); no external API calls outside integration-hub; no business logic in controllers.

---

## 6. The API Gateway (edge)

**Spring Cloud Gateway** (reactive), port 8080 — the single external entry point.

**Global filters (every route):** strip client-spoofed `X-Internal-Request`; Resilience4j
`CircuitBreaker` → `/fallback/default`; Redis-backed `RequestRateLimiter` (replenish 50 / burst 100)
keyed by a JWT-derived `plan:tenantId:sub` (falls back to `ANON:<ip>`), with a plan-aware token bucket.

**Cross-cutting custom filters:** `JwtAuthenticationFilter` + `SecurityConfig` + public-path
allowlist; `CorsConfig` (origins localhost:3000–3003 by default); `TenantLicenceFilter` (per-route
gRPC read-through to tenant-service `ValidateTenantLicence`, Redis-cached); `SuperAdminAuthFilter`;
`TenantValidationFilter`; `PayrollDisbursementLockFilter` (+ a RabbitMQ-driven lock cleaner).

**Routing (selected):**

| Path | → Service | Notable filters |
|---|---|---|
| `/api/v1/auth/**` | auth :8081 | CB |
| `/api/v1/super-admin/**` | tenant :8083 | adds `X-Internal-Request`, SuperAdminAuth |
| `/api/v1/public/**`, `/api/v1/public/compliance/**` | tenant / compliance | **public, no auth** |
| `/api/v1/tenants|plans|feature-flags/**` | tenant :8083 | CB |
| `/api/v1/employees|departments|positions/**` | employee :8082 | Licence, CB |
| `/api/v1/payroll/**` | payroll :8084 | Licence, **DisbursementLock**, financial CB |
| `/api/v1/compliance/**` | compliance :8085 | Licence, financial CB |
| `/api/v1/attendance|shifts/**` | time-attendance :8086 | Licence, CB |
| `/api/v1/leave/**` | leave :8087 | Licence, CB |
| `/api/v1/documents/**` | document :8088 | Licence, CB |
| `/api/v1/notifications/**` | notification :8089 | CB |
| `/api/v1/integrations|payments|filings/**` | integration-hub :8090 | Licence, financial CB |
| `/api/v1/callbacks/**` | integration-hub :8090 | **public (webhooks)** |
| `/api/v1/analytics/**` | analytics :8091 | Licence, CB |
| `/api/v1/audit/**` | audit :8092 | CB |
| `/services/{svc}/v3/api-docs/**` | each service | StripPrefix=2 (aggregated Swagger) |

**Resilience4j profiles:** default CB (50% failure threshold) and a stricter **`financial`** profile
(30% threshold, 60s open) bound to payroll, compliance, and integration-hub. Global 10s time limiter.

---

## 7. Data & multi-tenancy

- **Database-per-service** logically, but physically **one shared PostgreSQL 18 server** hosting 12
  databases (`andikisha_auth`, `_tenant`, `_employee`, `_payroll`, `_leave`, `_compliance`, `_time`,
  `_document`, `_notify`, `_integration`, `_analytics`, `_audit`), created idempotently by
  `infrastructure/docker/init-db.sh` on first boot.
- **Tenant isolation** is enforced in three layers: (1) `tenant_id` column on every entity via
  `BaseEntity`; (2) repository methods that always filter by `tenantId`; (3) `TenantContext`
  ThreadLocal populated from the JWT at the edge and carried through filters.
- **No cross-service foreign keys.** Services reference each other only by UUID and resolve details
  over gRPC.
- **Migrations** are per-service Flyway scripts. ⚠️ **Known issue:** tenant-service has a Flyway
  version collision — two `V10__` files (`V10__fix_admin_email_constraint.sql` and
  `V10__create_tenant_logo.sql`) — which will fail `flyway validate` and must be reconciled before a
  clean deploy.

---

## 8. Frontend architecture

pnpm workspace (globs `frontend/*`, `frontend/packages/*`; the SmartHR template is excluded).

**Apps:** `landing` (:3002 marketing, MDX + Resend), `tenant-portal` (:3000 main app),
`platform-portal` (:3003 SUPER_ADMIN ops).

**Shared packages:** `@andikisha/ui` (design-system components + `theme.css`), `@andikisha/api-client`
(axios factory), `@andikisha/shared-types` (pure TS domain types).

### tenant-portal — routing & BFF
- All authenticated surfaces nest under a dynamic **workspace** segment: `src/app/[workspace]/`,
  split into two route groups:
  - **`(admin)/admin/*`** — dashboard, employees (+ new / detail / bulk-upload / pending-activation),
    leave, payroll (+ new / run / payslip), users, settings (departments/positions), profile.
  - **`(my)/my/*`** — dashboard, attendance, leave, payslips, team-approvals, profile.
- **BFF pattern (server-side proxy).** The browser never holds the JWT or the gateway URL:
  - `api/auth/*` route handlers do login/logout/me/password flows, decode JWT roles, and set an
    **httpOnly `tenant_token` cookie** (login rate-limited 10 / 15 min per IP).
  - `api/proxy/[...path]` is a catch-all reverse proxy: reads the cookie, enforces an
    `ALLOWED_PATH_PREFIXES` allowlist, injects `Authorization: Bearer`, and **streams raw bytes**
    both directions (preserves multipart uploads and xlsx/csv/pdf downloads).
  - Browser axios (`src/lib/api-client.ts`) points at `/api/proxy` with `withCredentials`, centralises
    error policy (retries 503 licence-unavailable with backoff; 401 → hard-navigate `/login`).
- **Edge middleware** (`jose` JWT verify) injects `x-user-*` headers and gates routes:
  `mustChangePassword` → set-password; `SUPER_ADMIN` → platform portal; `/admin/*` requires an admin
  role else redirect to the correct dashboard; `/my/*` open to any authenticated user.
- **PWA:** `manifest.json` + `sw-my.js` scoped to `/my/` only (employee self-service is installable;
  admin is not).

### @andikisha/ui — three-tier component model
- **Tier 1 primitives** (in the package): Button, Badge, Avatar, form inputs, DataTable, StatCard,
  charts (recharts wrappers), PermissionGate, Dialog/Sheet/Dropdown, etc.
- **Tier 2 patterns/chrome** (in the package): role-aware shells — `TenantAdminShell` (sidebar),
  `EmployeeShell` (bottom nav), `HorizontalShell` (platform top-bar) — plus TopBar, NavRail,
  ProfileMenu, CommandPalette, QueryProvider.
- **Tier 3 domain-coupled** (in the app, never the package): PayslipRow, LeaveRequestCard, etc.
- **Design tokens:** single `@theme` block in `packages/ui/src/theme.css` (Tailwind v4) — brand greens,
  amber accent, warm neutrals, Roboto / Roboto Mono font tokens. Apps import it; they never define
  their own tokens.

---

## 9. Infrastructure & deployment

- **Local dev:** `infrastructure/docker/docker-compose.infra.yml` (infra only) and
  `docker-compose.full.yml` (full stack). Shared `Dockerfile.service` (Java) and `Dockerfile.frontend`.
- **VPS / prod:** root `docker-compose.yml` (Dokploy profile) and `docker-stack.yml` (Swarm variant)
  pull prebuilt `ghcr.io/.../andikisha/*` images; external routing/TLS handled by **Traefik** (managed
  by Dokploy) via host labels — app services publish no host ports, only the gateway and the three
  frontends are exposed.
- **Kubernetes:** Kustomize under `infrastructure/k8s/` — `base/` (namespace, configmap, secret
  template, aggregating all 13 services) and `services/<svc>/` (deployment, service, PDB,
  kustomization; HPAs for api-gateway/auth/analytics/payroll). Gateway runs 3 replicas with pod
  anti-affinity and `prometheus.io/scrape` annotations. Scaffold dirs exist for future
  asset/expense/performance/recruitment services (not yet wired into base). Network policies are a
  documented TODO.
- **Observability:** **Zipkin only** in-repo (tracing, 100% sampling; trace/span/tenant/user IDs woven
  into logs). Services expose `/actuator/prometheus` and K8s carries scrape annotations, implying an
  **external** Prometheus/Grafana — but no Prometheus/Grafana/Loki manifest ships in the repo.
- **Load tests:** k6 scripts (`infrastructure/load-tests/k6/`) for payroll and leave flows.
- **Quality gates:** Checkstyle (build-failing) + Gitleaks secret scanning; per-service `.env` files
  under `config/env/`.

---

## 10. Kenyan compliance rules (domain-specific, baked into payroll/compliance)

| Deduction | Rule |
|---|---|
| **PAYE** (monthly) | 0–24,000 @ 10%; 24,001–32,333 @ 25%; 32,334–500,000 @ 30%; 500,001–800,000 @ 32.5%; 800,000+ @ 35%. Band-2 ceiling is the KRA-gazetted **32,333** (388,000 ÷ 12). Personal relief KES 2,400/mo; insurance relief 15% of NHIF capped KES 5,000. |
| **NSSF** | 6% of gross — Tier I up to KES 7,000, Tier II up to KES 36,000. |
| **SHIF** | 2.75% of gross (replaced NHIF, Oct 2024). |
| **Housing Levy** | 1.5% employee + 1.5% employer. |
| **Leave** | Annual 21, Sick 30, Maternity 90, Paternity 14 days. |

Compliance rates live in `compliance-service` (exposed via `GetTaxRates` / `GetStatutoryRates` gRPC)
so payroll reads them rather than hardcoding — rate changes are a config/data change, not a redeploy.

---

## 11. Design decisions worth carrying to another project

1. **A shared "spine" library** (`BaseEntity` + `Money` + `TenantContext` + exception hierarchy +
   `GlobalExceptionHandler`) makes tenant isolation, optimistic locking, money-correctness, and error
   shape *structural* — a service can't accidentally opt out.
2. **Three communication planes with clear rules:** REST at the edge only, gRPC for sync reads, events
   for async write side-effects. Batch gRPC RPCs where fan-out would cause N+1.
3. **One external-integration service** (integration-hub). Domain services never call third parties;
   they emit events and integration-hub reacts. Keeps M-Pesa/Daraja blast radius contained.
4. **Gateway as policy layer:** auth, per-plan rate limiting, licence enforcement, circuit breaking
   (with a stricter `financial` profile for money routes), and a payroll disbursement lock all live at
   the edge, not smeared across services.
5. **BFF over direct-to-gateway on the browser:** the SPA holds no JWT and no backend URL; a
   server-side proxy owns the cookie, the allowlist, and byte streaming.
6. **Uniform DDD package layout** across all services — onboarding and codegen (scaffold skills) both
   rely on the predictability.
7. **Compliance as data, not code** — statutory rates served over gRPC so legal changes don't force
   redeploys.

## 12. Gaps / caveats flagged during this audit

- **tenant-service Flyway `V10__` collision** — two files share version 10; will fail validation.
- **notification-service has no messaging package** — it is REST-only today, though it's the natural
  consumer of alert events. Confirm how notifications are actually triggered.
- **document-service exposes gRPC clients but no gRPC server** — other services can't call it
  synchronously.
- **Observability is trace-only in-repo** — no bundled metrics/logs stack; production must supply
  Prometheus/Grafana externally.
- **README drift:** README states PostgreSQL 16, Zustand for state, and PostgreSQL-per-service; the
  code runs PostgreSQL 18, uses React Query + context (no Zustand), and co-locates 12 DBs on one
  Postgres server. Trust the code.

---

*Generated 2026-07-04 from a direct read of the codebase. Section 3 maturity counts are point-in-time.*
