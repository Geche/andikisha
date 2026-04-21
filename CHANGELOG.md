# Changelog

All notable changes to AndikishaHR are documented here.

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
