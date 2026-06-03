# AndikishaHR Bug-Hunt Inventory — 2026-06-03

## Summary

**Counts:** 0 critical · 4 high · 6 medium · 5 convention violations

The inventory covers auth-service, employee-service, payroll-service, leave-service, notification-service, api-gateway, all three frontends, and all shared libraries. The highest-concentration area is the employee-service (two of the four high-severity findings are there). No cross-tenant data leaks were found. The payroll tax calculation is correct per current Kenyan statutory rates. The leave-service race condition claimed by initial analysis is incorrect — it is properly guarded by JPA optimistic locking on `LeaveBalance` with `@Version`. The most actionable finding is `provisionForActivation` returning a mismatched temporary password, which would silently break the bulk-activation workflow on any retry.

---

## High-severity findings

### H-1 — EmployeeMapper: expression-based `grossPay` mapping bypasses MapStruct null safety

- **Location:** `services/employee-service/src/main/java/com/andikisha/employee/application/mapper/EmployeeMapper.java:28` and `:45`
- **Defect:** Both `toResponse()` and `toDetailResponse()` use a raw Java expression for `grossPay`:
  ```java
  @Mapping(target = "grossPay", expression = "java(e.getSalaryStructure().grossPay().getAmount())")
  ```
  MapStruct auto-generates null guards for property-chain mappings (e.g., `source = "salaryStructure.basicSalary.amount"` produces null-safe code). It does **not** generate null guards for `expression = "java(...)"` blocks — the expression is emitted verbatim into the generated class. If `e.getSalaryStructure()` returns null (which JPA allows for `@Embedded` when all embedded columns are null), this line throws `NullPointerException`, crashing the endpoint for every caller on that request.
- **Evidence:** Static defect. `Employee.salaryStructure` is `@Embedded` with no `nullable = false` column override. JPA materializes an `@Embedded` field as null when all its mapped columns are null. The generated MapStruct implementation for property-chain mappings (visible in `src/main/generated/`) includes null guards; the expression at lines 28 and 45 is copied verbatim with none. `SalaryStructure.grossPay()` itself is not null-safe: it calls `basicSalary.add(housingAllowance...)` and would NPE at the `Money.add()` call if `basicSalary` is null.
- **Root cause hypothesis:** Property-chain mappings and expression mappings differ in how MapStruct handles null safety. The developer used an expression because `grossPay()` is a computed method, not a getter on a stored field, and assumed salaryStructure would always be non-null because `Employee.create()` always requires one. The assumption is correct for normal creation paths but not for JPA loading of a row with all-null salary columns (possible via direct SQL or a future migration).
- **Suggested fix shape:** Replace the expression with a helper method that null-checks before computing. Either a default method on the mapper interface or a utility: `java(e.getSalaryStructure() != null ? e.getSalaryStructure().grossPay().getAmount() : BigDecimal.ZERO)`. One-line change at two sites, no schema change needed.
- **Estimated effort:** Trivial (two-line patch)
- **Classification:** Static defect

---

### H-2 — `provisionForActivation` returns wrong temporary password on idempotent call

- **Location:** `services/auth-service/src/main/java/com/andikisha/auth/application/service/AuthService.java:533–538`
- **Defect:**
  ```java
  String tempPassword = PasswordGenerator.generate();       // line 535: always generates new password
  provisionEmployeeUser(tenantId, email, phone, tempPassword, employeeId.toString());
  return new ProvisionEmployeeResponse(email, tempPassword); // line 537: returns new password
  ```
  `provisionEmployeeUser()` (lines 157–172) has an idempotency path: if a user with that email already exists, it returns the existing user's ID without updating their password. However, `provisionForActivation()` generates a new random password regardless, then returns it to the caller. On a second call (e.g., HR retries activation after a timeout), the returned `tempPassword` is freshly generated but the existing user's stored `passwordHash` was set on the first call. The HR manager hands the **new** (wrong) temp password to the employee; the employee's login attempt fails because the DB holds the **original** password from the first call.
- **Evidence:** Static defect. Tracing the call chain:
  1. `provisionForActivation()` always calls `PasswordGenerator.generate()` (line 535).
  2. `provisionEmployeeUser()` at line 157 detects the existing user via `existsByEmailAndTenantId` and returns without calling `user.changePassword()`.
  3. `provisionForActivation()` then returns the newly-generated (but unused) password.
  The mismatch is confirmed by reading both methods.
- **Root cause hypothesis:** `provisionEmployeeUser()` was written to be idempotent for existence (don't create a duplicate), but the caller `provisionForActivation()` was written without considering the idempotency path. The caller assumes password generation and user creation are always coupled.
- **Suggested fix shape:** `provisionEmployeeUser()` should return a flag or wrapper indicating whether the user was newly created. `provisionForActivation()` should only generate and return a temp password when the user was actually created. If the user already existed, return a sentinel indicating "already activated" or fetch the real password by doing a reset. Medium-sized change (modify both methods, update the return type or add a wrapper).
- **Estimated effort:** Small (single-file change in AuthService with a new return type)
- **Classification:** Static defect

---

### H-3 — `BulkUploadService.commit()`: nationalId uniqueness not validated before commit

- **Location:** `services/employee-service/src/main/java/com/andikisha/employee/application/service/BulkUploadService.java:199–295` (validateRow) and `:324–328` (commit loop)
- **Defect:** `validateRow()` checks email uniqueness against the DB (line 221: `employeeRepository.existsByTenantIdAndEmail`), but does not check `nationalId` uniqueness. The `employees` table has a unique constraint on `(tenant_id, national_id)` (Employee entity lines 23-25). If a CSV row contains a `nationalId` that already exists for the tenant — or two rows in the same CSV share a `nationalId` — `commit()` throws `ConstraintViolationException` at the `employeeRepository.save()` call (line 326). Because `commit()` is `@Transactional`, the entire batch rolls back. All rows processed before the offending row are also undone. The user receives HTTP 409 DUPLICATE with no row-level information indicating which `nationalId` conflicted or which rows were otherwise valid.
- **Evidence:** Static defect. Confirmed by reading:
  1. `validateRow()` — email check at line 221 exists, no equivalent for `nationalId`.
  2. `Employee.java` — `@UniqueConstraint(columnNames = {"tenant_id", "national_id"})` at line 25.
  3. `commit()` — no try/catch inside the loop; any save failure propagates and rolls back the `@Transactional` method.
  4. `GlobalExceptionHandler` maps `DataIntegrityViolationException` to HTTP 409 DUPLICATE with a generic message.
- **Root cause hypothesis:** The email uniqueness check was added explicitly because emails are user-visible identifiers. The nationalId uniqueness was overlooked, probably because nationalId is optional in the bulk template (lines 131 of BulkUploadService) and was not treated as a key field.
- **Suggested fix shape:** Add `existsByTenantIdAndNationalId(tenantId, nationalId)` check in `validateRow()`, parallel to the email check at line 221. One-line addition for each provided nationalId. Alternatively, implement row-level exception handling in the commit loop to isolate constraint failures. Either approach; the validation-time check is simpler and gives a better user experience.
- **Estimated effort:** Small (one check added to validateRow; no schema change)
- **Classification:** Static defect

---

### H-4 — `AuthGrpcService.provisionTenantAdmin`: no authentication on the gRPC caller

- **Location:** `services/auth-service/src/main/java/com/andikisha/auth/infrastructure/grpc/AuthGrpcService.java:200–227`
- **Defect:** The gRPC method `provisionTenantAdmin()` creates an ADMIN-role user account. It performs no authentication or authorization check on the caller. Any service (or anything that can reach the gRPC port 9081 on the auth-service pod) can call this method and create admin accounts for any tenant.
  ```java
  @Override
  public void provisionTenantAdmin(ProvisionTenantAdminRequest request, ...) {
      // No auth check — directly provisions
      String userId = authService.provisionTenantAdmin(...);
  ```
- **Evidence:** Static defect. Comparing to the HTTP admin endpoints in auth-service (`AuthController`), which all carry `@PreAuthorize` annotations. The gRPC service has no equivalent interceptor for authentication. The gRPC port is also listed in `docker-compose.yml` as a service port; its network exposure depends entirely on the deployment topology.
- **Root cause hypothesis:** gRPC inter-service calls are treated as implicitly trusted ("internal network means trusted caller"), which is a common pattern. However, a compromised internal service, a misconfigured network policy, or a developer mistake in routing could allow unauthorized account creation.
- **Suggested fix shape:** Add a gRPC interceptor that validates a service-to-service JWT in the request metadata, or add a shared secret to the request proto. The least-invasive approach: add a `caller_secret` string field to `ProvisionTenantAdminRequest` (matched against an environment variable in auth-service). A fully correct approach would use mutual TLS or a signed service token. This is a cross-service contract change requiring coordinated deployment.
- **Estimated effort:** Medium (proto change + interceptor or per-call validation, coordinated with tenant-service)
- **Classification:** Static defect

---

## Medium-severity findings

### M-1 — `RabbitLeaveEventPublisher`: missing `isActualTransactionActive` guard

- **Location:** `services/leave-service/src/main/java/com/andikisha/leave/infrastructure/messaging/RabbitLeaveEventPublisher.java:38, 59, 78, 98`
- **Defect:** All four `publish*` methods unconditionally call `TransactionSynchronizationManager.registerSynchronization()`:
  ```java
  TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
      @Override
      public void afterCommit() { ... }
  });
  ```
  If called outside an active transaction (e.g., from a test without `@Transactional`, from a scheduled job, or from a compensating handler), `registerSynchronization()` throws `IllegalStateException: Transaction synchronization is not active`. The exception propagates uncaught from the publisher, silently failing to send the event.
- **Evidence:** Static defect. Confirmed by comparing with `RabbitPayrollEventPublisher.sendAfterCommit()` (lines 72–82), which explicitly guards:
  ```java
  if (TransactionSynchronizationManager.isActualTransactionActive()) {
      // register sync
  } else {
      doSend(...);  // fallback: send immediately
  }
  ```
  The leave publisher has no such fallback. The comment in the payroll publisher explains the intent: "If no transaction is active (e.g. called from a test or non-transactional context), sends immediately so the event is never silently dropped." The leave publisher silently drops events in the same scenario.
- **Root cause hypothesis:** Inconsistent implementation across services. The leave publisher was written without the defensive guard that the payroll publisher has. Currently harmless in production because all callers are `@Transactional`, but will silently break if any non-transactional caller is added (e.g., a batch job or a compensation path).
- **Suggested fix shape:** Copy the `sendAfterCommit` pattern from `RabbitPayrollEventPublisher` into `RabbitLeaveEventPublisher`. Add a private `sendAfterCommit(String exchange, String key, Object event)` method with the `isActualTransactionActive()` check, and call it from each `publish*` method. Small, single-file change with no schema impact.
- **Estimated effort:** Small (single-file refactor of four methods, same pattern as payroll)
- **Classification:** Static defect

---

### M-2 — gRPC blocking stubs in payroll-service: no deadline configured

- **Location:**
  - `services/payroll-service/src/main/java/com/andikisha/payroll/infrastructure/grpc/EmployeeGrpcClient.java:22`
  - `services/payroll-service/src/main/java/com/andikisha/payroll/infrastructure/grpc/LeaveGrpcClient.java:33`
- **Defect:** Both clients create blocking stubs with no deadline:
  ```java
  this.stub = EmployeeServiceGrpc.newBlockingStub(channel);   // no withDeadlineAfter()
  this.stub = LeaveServiceGrpc.newBlockingStub(channel);      // no withDeadlineAfter()
  ```
  If the downstream service (employee-service or leave-service) hangs or is slow, `stub.listActiveByTenant()`, `stub.getSalaryStructuresBatch()`, and all other blocking calls will wait indefinitely. Payroll calculation (`calculatePayroll()`) runs with `@Transactional(propagation = NOT_SUPPORTED)` specifically to avoid holding DB connections during gRPC calls — but the thread is still held. A slow downstream will exhaust the web server thread pool, making the entire payroll-service unavailable.
- **Evidence:** Static defect. No `withDeadlineAfter()`, `withDeadline()`, or channel-level `max_call_duration` found in either client. `PayrollService.calculatePayroll()` (line 146) blocks on `employeeClient.getActiveEmployees(tenantId)` with no timeout path.
- **Root cause hypothesis:** Defensive programming not applied to gRPC stubs. The channel injection via `@GrpcClient` may have default timeouts from application.yml, but no explicit stub-level deadline is set, and the application.yml gRPC client config was not examined for default deadlines.
- **Suggested fix shape:** Add `.withDeadlineAfter(30, TimeUnit.SECONDS)` (or configured value) to each blocking stub creation. Or configure a channel-level default deadline in `application.yml` under `grpc.client.{service-name}.deadline`. Wrap critical gRPC calls in try-catch for `StatusRuntimeException` with `Status.DEADLINE_EXCEEDED` to produce a clear error response.
- **Estimated effort:** Trivial to small (one-line change per client, plus error handling)
- **Classification:** Static defect

---

### M-3 — `CallerScopeResolver`: `HR_OFFICER` silently defaults to `OWN` scope with no warning

- **Location:**
  - `services/employee-service/src/main/java/com/andikisha/employee/application/service/CallerScopeResolver.java:42–46`
  - `services/leave-service/src/main/java/com/andikisha/leave/application/service/CallerScopeResolver.java:41–45`
- **Defect:** Both resolvers have a switch statement mapping roles to scopes. `HR_OFFICER` exists in the `Role` enum (auth-service `Role.java:11`) and is listed as an assignable role in `BulkUploadService.ALLOWED_ROLES`. Both switch statements fall through to `default -> ScopeType.OWN`. No log warning is emitted. An HR_OFFICER who opens the employee list endpoint will see only their own record — the same as EMPLOYEE scope — which is likely not the intended behavior for a role called "HR Officer." There is no signal to the administrator that the scope mapping is unspecified.
  ```java
  ScopeType scopeType = switch (role == null ? "" : role) {
      case "HR_MANAGER", "HR", "PAYROLL_OFFICER" -> ScopeType.ALL;
      case "LINE_MANAGER" -> ScopeType.DEPARTMENT;
      default -> ScopeType.OWN;  // HR_OFFICER, AUDITOR, etc. fall here silently
  };
  ```
- **Evidence:** Static defect. Confirmed by checking `Role.java` (line 11: `HR_OFFICER`), `BulkUploadService.ALLOWED_ROLES` (line 56: `"HR_OFFICER"` in the list), and the absence of `"HR_OFFICER"` in either resolver's switch. The seeded `role_permissions` table has no entries for `HR_OFFICER` (confirmed earlier in the session). The net effect: any HR_OFFICER user assigned via bulk upload or role change can only see their own employee record.
- **Root cause hypothesis:** The scope mapping was written for the V1 five authority roles (ADMIN, HR_MANAGER, HR_OFFICER, PAYROLL_OFFICER, EMPLOYEE) but `HR_OFFICER` was missed in the switch, and the silent default hides the omission. AUTH-BACKLOG-005 documents that the hardcoded switch will need to be replaced when per-tenant role customization ships — the HR_OFFICER gap is a symptom of the same structural problem.
- **Suggested fix shape:** Explicitly add `HR_OFFICER` to the switch with the intended scope (likely `ALL`, matching the pattern of HR-related roles). Add a `log.warn("Unknown role '{}' defaulting to OWN scope", role)` to the default case. Single-file change at both sites.
- **Estimated effort:** Trivial (two-line change per file)
- **Classification:** Static defect

---

### M-4 — API Gateway: `/services/` public path prefix exposes unauthenticated Swagger docs

- **Location:** `services/api-gateway/src/main/java/com/andikisha/gateway/config/GatewayPublicPaths.java:32`
- **Defect:** The `/services/` prefix is listed as a public path (no JWT required):
  ```java
  public static final List<String> PREFIXES = List.of(
      ...
      "/services/"   // line 32
  );
  ```
  The gateway routes matching this prefix are the Swagger/OpenAPI doc endpoints (`/services/{service}/v3/api-docs/**`). In production, these endpoints expose the complete API surface of all 13 microservices — every endpoint URL, HTTP method, request body schema, response schema, and parameter definition — without requiring authentication. Any actor who discovers the gateway hostname can enumerate the full internal API.
- **Evidence:** Confirmed by reading `application.yml` (lines 196–260): all `/services/{service}/v3/api-docs/**` routes use the `/services/` prefix. These are real API documentation routes that include request/response shapes for sensitive endpoints (payroll runs, payslips, tenant provisioning).
- **Root cause hypothesis:** Swagger routes were added as convenient developer tools and marked public to avoid token management during development. The prefix was never scoped to dev environments or removed for production.
- **Suggested fix shape:** Either (a) restrict Swagger endpoints to authenticated users only — add `/services/` to the JWT-required paths and exclude from PREFIXES — or (b) conditionally expose them only when `spring.profiles.active=dev` using a conditional configuration bean. The safest production posture is to disable Swagger entirely via `springdoc.api-docs.enabled=false` in the prod profile. No code change needed; configuration change only.
- **Estimated effort:** Trivial (one configuration property change per service in prod profile)
- **Classification:** Static defect

---

### M-5 — `useRoleGuard`: returns `"authorized"` during user-loading phase (soft gating only)

- **Location:** `frontend/tenant-portal/src/hooks/useRoleGuard.ts:35–36`
- **Defect:**
  ```typescript
  const authorized = roles ? checkAuthorized(roles, area) : null;
  if (authorized === false) return "redirecting";
  return "authorized";   // returns "authorized" when authorized === null (loading)
  ```
  When `user` is null (before the initial React Query fetch resolves), `roles` is null and `authorized` is null. The hook returns `"authorized"` — not `"redirecting"` and not a loading state. Pages that call `useRoleGuard("admin")` render their content briefly before the redirect fires. This is a **flash of unauthorized content** for users who are authenticated but have the wrong role.
- **Evidence:** Static defect. `useCurrentUser()` returns `null` during the window between initial render and the `/api/auth/me` response. The `type AuthStatus = "authorized" | "redirecting"` at line 8 has no loading state, so the implementation collapses null→authorized. Mitigated in practice by: (1) SSR passes `initialUser` from server headers, so the window is narrow; (2) middleware enforces real auth on every request; (3) the component is documented as "soft UI gating only." However, the hook's return type does not express the loading case, and any consumer that uses the return value for rendering decisions (not just redirect decisions) will briefly show unauthorized content.
- **Root cause hypothesis:** `AuthStatus` was designed as a two-state enum before the loading state was considered a distinct concern. The middleware handles real security; useRoleGuard was scoped to UI display only. The gap is the missing third state that prevents flash-of-content.
- **Suggested fix shape:** Add `"loading"` to `AuthStatus`. Return `"loading"` when `authorized === null`. Page guards that show content conditionally should render a skeleton while status is `"loading"`, not the full page content.
- **Estimated effort:** Small (type change + two-line change in hook + update all call sites to handle the loading case)
- **Classification:** Static defect (soft-gating only; backend enforcement is correct)

---

### M-6 — `useCurrentUser`: 60-second stale time; role changes not reflected until refresh or window focus

- **Location:** `frontend/packages/ui/src/lib/useCurrentUser.tsx:75`
- **Defect:**
  ```typescript
  staleTime: 60_000,
  refetchOnWindowFocus: true,
  ```
  The current user's role is cached for 60 seconds. After an admin changes a user's role via the `ChangeRoleModal`, the affected user's frontend continues to show old role-based UI for up to 60 seconds (or until they switch tabs). The backend enforces the new role immediately via JWT revocation (refresh tokens are revoked on role change), but the UI does not re-fetch `useCurrentUser` after the role change completes. This produces a confusing state where the UI says "Employee" but API calls return 403 for employee-level actions.
- **Evidence:** Static defect. `ChangeRoleModal.onSuccess()` (employee detail page) invalidates `["employee-user", employeeId]` but does not invalidate `["current-user"]`. The role change affects the target user's session — after they're redirected to login (refresh token is revoked), their new login produces the correct role in `useCurrentUser`. The 60-second window is only relevant if the affected user happens to be logged in during the change, which is a real scenario.
- **Root cause hypothesis:** The role change flow correctly handles the authentication side (revokes tokens) but doesn't propagate the stale-cache concern to the UI side. The `useCurrentUser` stale time was set at 60 seconds as a reasonable performance trade-off, without considering that it also controls how quickly role changes are visible.
- **Suggested fix shape:** Option A: reduce `staleTime` to 0 (always refetch on use — lowest latency, higher network load). Option B: after a successful role change, call `queryClient.invalidateQueries({ queryKey: ["current-user"] })` if the changed userId matches the current user. Option B is targeted and correct; Option A is simpler. Either resolves the 60-second window.
- **Estimated effort:** Trivial (one-line addition to ChangeRoleModal onSuccess handler)
- **Classification:** Static defect

---

## Convention violations (separate section)

### CV-1 — `PayrollService.publishAfterCommit()` name does not match behavior

- **Location:** `services/payroll-service/src/main/java/com/andikisha/payroll/application/service/PayrollService.java:505–507`
- `publishAfterCommit()` calls `publishAction.run()` directly. The actual after-commit deferral is inside `RabbitPayrollEventPublisher.sendAfterCommit()`. The helper method name implies it defers, but it calls immediately; the deferral is a side-effect of the publisher it calls. Any future caller that wraps a non-publisher action in this helper will publish inside the transaction.
- **Fix shape:** Rename to `callPublisher()` or inline the call. Zero behavior change.

### CV-2 — Auth-service event publication: some methods use `isActualTransactionActive` guard, some do not

- **Location:** `services/auth-service/src/main/java/com/andikisha/auth/application/service/AuthService.java:101, 141, 179, 464, 511`
- Some `TransactionSynchronizationManager.registerSynchronization()` calls in AuthService have the `isActualTransactionActive()` guard; others do not. Unlike leave-service (M-1), AuthService methods are always called from `@Transactional` contexts, so the missing guards are not currently harmful. But the inconsistency is a future maintenance trap.
- **Fix shape:** Standardize all event publication in auth-service to use the same pattern with guard.

### CV-3 — `BulkUploadService` `PENDING-{empNum}` placeholder violates NOT NULL intent (tracked as EMP-BACKLOG-002)

- **Location:** `services/employee-service/src/main/java/com/andikisha/employee/application/service/BulkUploadService.java:356–357`
- Tracked in backlog. Documented convention deviation, not a runtime defect.

### CV-4 — `CallerScopeResolver` hardcoded scope mapping (tracked as AUTH-BACKLOG-005)

- **Location:** Both CallerScopeResolver files, switch statement
- Tracked in backlog. Will need to be replaced with a DB-driven lookup when per-tenant role customization ships.

### CV-5 — `GatewayPublicPaths` comment says "no JWT and no tenant header" but some public paths still need tenant header at service level

- **Location:** `services/api-gateway/src/main/java/com/andikisha/gateway/config/GatewayPublicPaths.java:11`
- Comment says paths require "no JWT and no tenant header." But `/api/v1/auth/login` (an EXACT public path) is served by auth-service, which uses `TenantInterceptor` requiring `X-Tenant-ID`. The gateway strips neither. The comment is incorrect — the public paths still require `X-Tenant-ID` at the service level; the gateway just doesn't validate the JWT. Not a defect in behavior (the frontend always sends `X-Tenant-ID`), but the comment misleads future developers about what "public" means.
- **Fix shape:** Update the comment to "no JWT required (but X-Tenant-ID still required by individual services)."

---

## Areas investigated and found clean

- **PayrollCalculation (KenyanTaxCalculator):** PAYE brackets, NSSF tiers, SHIF rate, Housing Levy rate, personal relief, and insurance relief all match CLAUDE.md documented statutory values for FY 2024/2025. Rounding uses `HALF_UP` consistently. No off-by-one on bracket boundaries.
- **Tenant isolation — employee-service repositories:** All repository methods are tenant-scoped. `DepartmentService.findAll()` and `PositionService.findAll()` both call `TenantContext.requireTenantId()` and filter by tenant. No unconstrained `findAll()` on tenant-owned tables found.
- **Tenant isolation — payroll-service repositories:** `PaySlipRepository` and `PayrollRunRepository` all filter by `tenantId`. No cross-tenant query found.
- **Tenant isolation — leave-service repositories:** All repository methods filter by `tenantId`. The `findRetryableNotifications` cross-tenant query in notification-service is documented as intentional (system scheduler, dispatches IDs only, never exposes content).
- **Flyway migration ordering:** Each service has migrations V1, V2, ... Vn with no gaps, no branching, and no cross-service table conflicts. Employee-service V8 and V9 migrations correctly add columns to the employees table and the new bulk_upload_batches table respectively.
- **Leave balance race condition (H-2 from agent report, corrected):** `LeaveBalance` extends `BaseEntity` which carries `@Version`. The `approve()` method wraps the balance deduct + save in a try-catch for `OptimisticLockingFailureException`. Two concurrent approvals of different requests for the same employee will result in a proper optimistic locking failure on the second, not a double-deduction. The comment at line 163 ("guards against concurrent approvals deducting the balance twice") is imprecise but the mechanism is correct.
- **PayrollService event ordering (suspected from agent report, not a defect):** `publishAfterCommit()` is a thin wrapper that calls the publisher directly; the actual after-commit deferral lives in `RabbitPayrollEventPublisher.sendAfterCommit()` which correctly uses `TransactionSynchronizationManager`. Events are not published before transaction commit.
- **PermissionGate fail-open (corrected from agent report):** `if (!user || user.roles.length === 0) return <>{fallback}</>` — when user is null (loading), it returns `fallback` (default null), which renders nothing. This is fail-**closed**, not fail-open. Not a defect.
- **Money value object:** `Money.of()` validates null amount and blank currency. The `add()` method checks same-currency. `subtract()` can produce negative values, which is correct for deduction contexts. No rounding inconsistency found; all operations use `HALF_UP` to 2 decimal places.
- **BaseEvent @JsonSubTypes registration:** All 35 event class files have a corresponding `@JsonSubTypes.Type` entry. No missing registration found as of this audit (this is a maintenance concern, not a current defect).
- **`AuthService.register()` — forced-password gate:** `mustChangePassword = true` is correctly set on user creation and on admin password reset. `clearMustChangePassword()` is only called on explicit `changePassword()` completion.
- **Authentication bypass via public paths:** Exact public paths in `GatewayPublicPaths.EXACT` are specific endpoint strings, not prefixes. They cannot be used to bypass auth on protected endpoints.

---

## Areas NOT investigated

- **Compliance-service:** Out of scope (Phase 2 service with substantive payroll compliance logic — warrants its own targeted audit of PAYE filing, statutory submission formats).
- **Integration-hub-service (M-Pesa):** Not investigated. M-Pesa callback signature validation and B2C payment flows carry unique security requirements; left for a dedicated payment-security audit.
- **Time-attendance-service:** Scaffolded; no substantive business logic found. Skipped.
- **Analytics-service, Audit-service:** Phase 4 services with consumer-only logic (event listeners, read models). Not investigated.
- **Frontend form validation completeness:** Verifying that every form field with backend validation also has client-side validation is a large surface and was not fully enumerated. A targeted UX audit is recommended.
- **gRPC TLS and mTLS configuration:** Whether gRPC inter-service traffic is encrypted was not verified from config alone. Requires checking the deployment environment.
- **Session token expiry edge cases:** The exact interaction between access token TTL (~1 hour), refresh token revocation, and the forced-password gate was not exhaustively traced for all mutation paths.

---

## Honest notes

- **H-1 (EmployeeMapper grossPay NPE):** The practical risk is low because `Employee.create()` always requires a non-null `SalaryStructure`, and the constructor defaults null sub-fields to `Money.zero`. The NPE path requires all salary columns to be null in the DB, which the normal code path never produces. The defect is real but unlikely to surface unless rows are manually manipulated.

- **H-4 (gRPC auth):** Whether the gRPC port (9081) is actually reachable from outside the internal network depends on deployment topology (Kubernetes network policy, Docker Compose network, etc.). If the gRPC ports are not exposed externally and inter-service networking is correctly isolated, the practical risk is lower than the theoretical risk. Verification requires reading the infrastructure configuration, which is outside this audit's scope.

- **M-4 (Swagger docs unauthenticated):** The Swagger endpoints expose API schemas, not data. Whether this is acceptable depends on the threat model. For a B2B SaaS with paying enterprise customers, API documentation exposure is usually acceptable. The finding is included because the CLAUDE.md does not explicitly designate these as intentionally public.

- **M-5 (useRoleGuard flash):** This was described as "CRITICAL fail-open" by the initial analysis agent. After direct code reading, it is MEDIUM at most. The middleware enforces real authentication; the flash of content is visible to a wrong-role user for a fraction of a second before redirect fires. Not exploitable for data access.

- **Leave balance race condition:** The initial analysis agent incorrectly classified this as HIGH severity. Direct code reading confirms the `@Version` field on `LeaveBalance` (inherited via `BaseEntity`) and the `catch (OptimisticLockingFailureException)` in `approve()` provide correct protection. No defect exists there.

- One finding from the agent reports was explicitly dropped after investigation: the claim that `PayrollService.publishAfterCommit()` publishes events before transaction commit. The method name is misleading, but the behavior is correct because the publisher's own `sendAfterCommit()` handles deferral. This was labeled as a convention violation (CV-1) rather than a defect.
