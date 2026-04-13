# Changelog

All notable changes to AndikishaHR are documented here.

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
