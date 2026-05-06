# AndikishaHR — Production-Readiness Code Review

**Date:** 2026-05-06  
**Reviewer:** Claude Code (Sonnet 4.6)  
**Scope:** Full monorepo review across all 13 services, shared modules, infrastructure, and frontend

---

## 1. Architecture

### Critical

**C-ARCH-1: Payroll Service does not call Compliance Service for statutory rates — hardcoded constants**

- **Files:** `services/payroll-service/src/main/java/com/andikisha/payroll/application/service/KenyanTaxCalculator.java` (lines 13–39), `services/payroll-service/src/main/java/com/andikisha/payroll/infrastructure/grpc/` (only `EmployeeGrpcClient.java` and `LeaveGrpcClient.java` — no `ComplianceGrpcClient.java`)
- **Problem:** `KenyanTaxCalculator` hardcodes all statutory rates as private static constants. When the government changes a rate (e.g., SHIF was 2.75% effective October 2024, bands changed in Finance Act 2023), the fix requires a code change, CI build, and redeployment. The Compliance Service exists precisely to own these rates in the database and expose them via gRPC (`ComplianceServiceGrpc`, `GetStatutoryRatesRequest`). Payroll never calls it.
- **Why it matters:** Rate changes happen without warning (KRA gazette notices). In a multi-tenant SaaS, this means all tenants run wrong calculations until a release ships. A single wrong PAYE band costs tenant employees incorrect net pay and exposes the platform to statutory penalty liability under the Tax Procedures Act.
- **Fix:** Add a `ComplianceGrpcClient` to the payroll service (a `compliance-service` entry in `application.yml` is also missing). At the start of `calculatePayroll`, fetch `GetTaxRatesResponse` and `GetStatutoryRatesResponse` for `countryCode=KE` with an `asOf` date equal to the payroll period. Pass the returned rates into `KenyanTaxCalculator` instead of the hardcoded constants. Cache the compliance response per `(period, countryCode)` key with a TTL of 1 hour to avoid a synchronous gRPC call per payslip.

---

### Major

**M-ARCH-1: PayrollRun UNIQUE constraint prevents payroll re-runs after COMPLETED/FAILED/CANCELLED**

- **Files:** `services/payroll-service/src/main/resources/db/migration/V1__create_payroll_runs.sql` (line 26), `services/payroll-service/src/main/java/com/andikisha/payroll/domain/model/PayrollRun.java` (line 25), `services/payroll-service/src/main/java/com/andikisha/payroll/application/service/PayrollService.java` (lines 96–109)
- **Problem:** The DB has `UNIQUE (tenant_id, period, pay_frequency)`. The application-level check in `initiatePayroll` only blocks when an **active** run exists (DRAFT/CALCULATING/CALCULATED/APPROVED/PROCESSING). When a run is COMPLETED, FAILED, or CANCELLED, the application logic permits a new run — but the database unique constraint rejects the INSERT with a `DataIntegrityViolationException` regardless of status. The first completed payroll for any period permanently blocks all future payroll runs for that tenant+period+frequency combination.
- **Why it matters:** This is a data-integrity defect that makes the platform unable to issue a corrected payroll run, a re-run after a FAILED processing cycle, or a supplementary run. It will surface in production with the first real payroll cycle.
- **Fix:** Add `status` to the unique constraint scope, or remove the DB-level unique constraint and enforce uniqueness exclusively in application logic using optimistic locking. The safer path for most payroll scenarios is:
  ```sql
  -- V5__fix_payroll_unique_constraint.sql
  ALTER TABLE payroll_runs DROP CONSTRAINT payroll_runs_tenant_id_period_pay_frequency_key;
  CREATE UNIQUE INDEX uq_payroll_runs_active
      ON payroll_runs (tenant_id, period, pay_frequency)
      WHERE status NOT IN ('COMPLETED', 'FAILED', 'CANCELLED');
  ```
  The partial index enforces the business rule without blocking re-runs. Update `@UniqueConstraint` in the entity to match or remove it.

**M-ARCH-2: Analytics and Time-Attendance services have no Spring Security configuration**

- **Files:** `services/analytics-service/src/main/java/com/andikisha/analytics/` (no `SecurityConfig.java`, no `TrustedHeaderAuthFilter.java`, no `@PreAuthorize` on any controller), `services/time-attendance-service/src/main/java/com/andikisha/attendance/` (same)
- **Problem:** Both services use only `TenantInterceptor` via `WebMvcConfig`, which checks that `X-Tenant-ID` is present but performs no authentication or role check. Any request with a valid `X-Tenant-ID` header returns data. Since the API Gateway forwards the header for all authenticated requests, this is partially mitigated in production — but it means any internal caller, compromised sidecar, or misconfigured route can read HR attendance and analytics data for any tenant with no authentication at all.
- **Why it matters:** Analytics endpoints expose payroll cost trends, headcount, and leave data. Attendance endpoints expose clock-in/out patterns and monthly hours. Both contain PII-adjacent operational data. No auth means zero per-tenant isolation at the service boundary.
- **Fix:** Add a `SecurityConfig` and `TrustedHeaderAuthFilter` to both services (the pattern is identical across all other services — copy from `payroll-service`). Add `@PreAuthorize` to analytics controllers:
  ```java
  @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER', 'HR')")
  ```
  Add `@PreAuthorize("isAuthenticated()")` as minimum to attendance clock-in/clock-out (employees should only clock themselves in) with employee self-service checks on the employee-id path.

**M-ARCH-3: Analytics `ReportsController` returns JPA entities directly**

- **Files:** `services/analytics-service/src/main/java/com/andikisha/analytics/presentation/controller/ReportsController.java` (lines 4–6, 32, 44–45, 51, 59), `services/analytics-service/src/main/java/com/andikisha/analytics/domain/model/HeadcountSnapshot.java`, `PayrollSummary.java`, `LeaveAnalytics.java`
- **Problem:** `ReportsController` returns `List<PayrollSummary>`, `List<HeadcountSnapshot>`, `List<LeaveAnalytics>` — all JPA entities extending `BaseEntity`. This exposes `id`, `createdAt`, `updatedAt`, `version`, and `tenantId` to HTTP clients. Adding or renaming a column in the entity immediately changes the API contract.
- **Why it matters:** Leaks internal entity fields including `tenantId`, couples HTTP API shape to the DB schema, and violates the CLAUDE.md convention of using Java records for controller responses.
- **Fix:** Create response records for each entity type (e.g., `PayrollSummaryResponse`, `HeadcountSnapshotResponse`, `LeaveAnalyticsResponse`) and map through a `AnalyticsMapper`. Three small records and one MapStruct mapper resolve this.

**M-ARCH-4: Event classes are not Java records — they are mutable classes**

- **Files:** `shared/andikisha-events/src/main/java/com/andikisha/events/payroll/PayrollCalculatedEvent.java` (representative), all event subclasses
- **Problem:** All domain events extend `BaseEvent` (an abstract class with Lombok `@Getter`) rather than using Java records. CLAUDE.md states DTOs and event classes must be Java records. The current mutable classes allow accidental field mutation after construction, require a no-arg constructor for Jackson deserialization (increasing coupling), and miss the compile-time immutability guarantee that records provide.
- **Why it matters:** Minor correctness risk, but inconsistent with the stated standard and makes refactoring harder.
- **Fix:** Converting events to records requires a different polymorphic deserialization strategy. The existing `@JsonSubTypes` on `BaseEvent` works with classes; for records, use a sealed interface hierarchy with `@JsonSubTypes` on the interface. This is a phased migration — flag for post-v1 cleanup, but do not add any new event classes as mutable classes.

---

### Minor

**m-ARCH-1: Gateway `PUBLIC_EXACT_PATHS` and `TenantValidationFilter.EXEMPT_EXACT_PATHS` are duplicated but not identical**

- **Files:** `services/api-gateway/src/main/java/com/andikisha/gateway/filter/JwtAuthenticationFilter.java` (lines 34–43), `services/api-gateway/src/main/java/com/andikisha/gateway/filter/TenantValidationFilter.java` (lines 23–29)
- **Problem:** `JwtAuthenticationFilter.PUBLIC_EXACT_PATHS` includes `/api/v1/auth/super-admin/provision` and `/api/v1/auth/ussd/validate`; `TenantValidationFilter.EXEMPT_EXACT_PATHS` does not. Both sets are maintained separately. Drift between them will cause paths to skip JWT validation but still require a tenant header, or vice versa.
- **Fix:** Extract a single `GatewayPublicPaths` constant class shared by both filters.

---

## 2. Code Quality

### Critical

_None._

### Major

**M-CQ-1: `PaySlip` entity does not have the 19 `*AsMoney()` accessor methods referenced in the review spec**

- **File:** `services/payroll-service/src/main/java/com/andikisha/payroll/domain/model/PaySlip.java`
- **Finding:** The REVIEW.md spec asks to check `helbAsMoney()` vs the other 18 `*AsMoney()` methods. These methods **do not exist** in the current codebase. `PaySlip` correctly uses raw `BigDecimal` fields at the entity level (permitted by CLAUDE.md for snapshot entities in a single known currency). There is no `helbAsMoney()` issue because the pattern was never implemented. This is clean — but the fact that a prior specification referenced these methods suggests they existed in an earlier revision and were removed. No action needed; record that the spec was based on a prior state of the code.

**M-CQ-2: HELB deduction is hardcoded to `BigDecimal.ZERO` for every employee**

- **File:** `services/payroll-service/src/main/java/com/andikisha/payroll/application/service/PayrollService.java` (line 257)
- **Problem:** `.helb(BigDecimal.ZERO)` is set unconditionally on every payslip. HELB repayments are mandatory for employees with outstanding HEF/HELB loans. There is no mechanism to store, retrieve, or apply per-employee HELB amounts. The `KenyanTaxCalculator` supports a `helbDeduction` parameter but it is never sourced from data.
- **Why it matters:** For any tenant with employees who have HELB deductions, the system computes incorrect net pay and will not remit HELB amounts. This is a compliance failure under the HELB Act.
- **Fix:** Add a `helbMonthlyAmount` field to the employee salary structure in `employee-service`. Expose it on `SalaryStructureResponse` proto. Read it in `PayrollService.calculatePayroll` and pass it to `taxCalculator.calculate(grossPay, basicPay, helbDeduction)`.

**M-CQ-3: NITA (KES 50/employee/month employer levy) is not tracked on payslips**

- **Files:** `services/payroll-service/src/main/java/com/andikisha/payroll/domain/model/PaySlip.java`, `services/payroll-service/src/main/java/com/andikisha/payroll/application/service/KenyanTaxCalculator.java`
- **Problem:** NITA is a KES 50/employee/month employer levy (confirmed in `compliance-service` V4 seed data). It appears in `ComplianceGrpcService` but is absent from `KenyanTaxCalculator`, `PaySlip`, and `PayrollRun` totals. The Compliance Service correctly stores NITA; the Payroll Service ignores it.
- **Why it matters:** NITA returns are filed annually. A payroll system that does not track the monthly NITA liability per payslip cannot generate NITA returns or show employers their NITA cost per employee.
- **Fix:** Add a `nita` column (`NUMERIC(10,2) NOT NULL DEFAULT 0`) to `pay_slips` in a new Flyway migration. Add `BigDecimal nita` to `PaySlip` entity, `DeductionResult` record, `KenyanTaxCalculator`, and propagate through mapper and response DTO.

---

### Minor

**m-CQ-1: `credential-encryption-key` is set to `"dev-only-insecure-key-replace-in-prod"` in `application-dev.yml`**

- **File:** `services/integration-hub-service/src/main/resources/application-dev.yml` (line 22)
- **Problem:** The literal string `dev-only-insecure-key-replace-in-prod` is a hardcoded dev key for the integration hub's `CredentialEncryptor`. While this is acceptable for local development, it will silently start the service if `CREDENTIAL_ENCRYPTION_KEY` is not set in a staging environment that uses the dev profile.
- **Fix:** Add a startup assertion in `CredentialEncryptor` or use `@Value` with no fallback to fail fast on any non-dev profile if the key is weak/missing.

**m-CQ-2: `Role` enum contains roles not referenced in any `@PreAuthorize` expression**

- **File:** `services/auth-service/src/main/java/com/andikisha/auth/domain/model/Role.java`
- **Roles defined:** `HR_OFFICER`, `PAYROLL_MANAGER`, `PAYROLL_OFFICER`, `FINANCE_OFFICER`, `CHIEF_MANAGER`, `CHIEF_OFFICER`, `AUDITOR`, `LINE_MANAGER`
- **Roles used in `@PreAuthorize`:** `ADMIN`, `HR_MANAGER`, `HR`, `MANAGER`, `EMPLOYEE`, `SUPER_ADMIN`
- **Problem:** Eight roles exist in the enum but are never checked in any `@PreAuthorize` annotation. `PAYROLL_OFFICER` (documented in CLAUDE.md as one of the 7 RBAC roles) cannot access any endpoint. `LINE_MANAGER` cannot approve any leave. This indicates either dead code in the enum or missing access control rules in the controllers.
- **Fix:** Either wire the missing roles into `@PreAuthorize` expressions (e.g., `PAYROLL_OFFICER` should have access to payroll run endpoints) or remove the unused roles and update CLAUDE.md to reflect the actual role model.

**m-CQ-3: Leave `LeaveController` references `MANAGER` role; `Role` enum has both `LINE_MANAGER` and `MANAGER`**

- **File:** `services/leave-service/src/main/java/com/andikisha/leave/presentation/controller/LeaveController.java` (lines 57, 69, 108, 118, 127, 137)
- **Problem:** Uses `'MANAGER'` in `@PreAuthorize`, which is distinct from `LINE_MANAGER`. The CLAUDE.md documents the role as `LINE_MANAGER`. The enum has both. It is unclear which role line managers are assigned at token issuance.
- **Fix:** Decide which role name is canonical for line managers, remove the duplicate from the enum, and update all `@PreAuthorize` references consistently.

---

## 3. Security

### Critical

_No `JWT_SECRET` fallback found. All services use `${JWT_SECRET}` with no default value — Spring will fail fast on startup if the variable is absent. This is correct._

### Major

**M-SEC-1: Analytics and Time-Attendance endpoints have zero authentication**

_(Documented under Architecture M-ARCH-2 — the root cause is missing `SecurityConfig`, the security impact is zero authentication on data-returning endpoints. Listed in both sections for visibility.)_

**M-SEC-2: `application-dev.yml` across 11 services sets `DB_PASSWORD` and `RABBITMQ_PASSWORD` fallback to `"changeme"`**

- **Files:** `services/auth-service/src/main/resources/application-dev.yml` (line 21: `${DB_PASSWORD:changeme}`), identical pattern in `employee-service`, `tenant-service`, `payroll-service`, `leave-service`, `compliance-service`, `time-attendance-service`, `notification-service`, `analytics-service`, `audit-service`, `integration-hub-service`, `document-service` dev YAMLs.
- **Problem:** These are dev-profile files with hardcoded `changeme` fallbacks. The risk is a staging or CI environment that uses the dev Spring profile without explicitly setting DB/RabbitMQ credentials — the service starts silently with the fallback credential.
- **Why it matters:** Most CI pipelines and staging environments pull the dev profile. If `DB_PASSWORD` is not in the CI env, `changeme` is used and the connection succeeds against a dev database. Acceptable for local development, but the lack of a guard means staging can run with weak credentials undetected.
- **Fix:** This pattern is acceptable for **local dev only**. Add a comment in each dev YAML making it explicit that these values must be overridden via env vars in any non-laptop environment. Consider adding a `@PostConstruct` check or Spring `@Profile("!dev")` + `@Value` without fallback in production config beans.

**M-SEC-3: `TenantContext` uses `ThreadLocal` — not `InheritableThreadLocal` — with virtual-thread risk**

- **File:** `shared/andikisha-common/src/main/java/com/andikisha/common/tenant/TenantContext.java` (line 5)
- **Problem:** `ThreadLocal<String>` does not propagate to child threads. `PayrollService.calculatePayroll` uses `@Transactional(propagation = NOT_SUPPORTED)` with a `TransactionTemplate` that runs in the same calling thread — so the current payroll calculation is safe. However, any future use of `@Async`, `CompletableFuture.supplyAsync`, or virtual-thread executors will silently carry `null` tenant context, causing either `requireTenantId()` to throw or, worse, a query to run without a tenant filter if the null check is bypassed upstream.
- **Why it matters:** Silent tenant context loss in an async path is a tenant data leak waiting to happen.
- **Fix:** Replace `ThreadLocal` with `InheritableThreadLocal` to propagate context into child threads. For virtual threads (Project Loom), the thread-local inheritance model works correctly with `InheritableThreadLocal`. Add a unit test that asserts `TenantContext.getTenantId()` returns the parent value in a child `CompletableFuture`.

---

### Minor

**m-SEC-1: `REDIS_PASSWORD` has an empty-string fallback (`${REDIS_PASSWORD:}`) in several services**

- **Files:** `services/api-gateway/src/main/resources/application.yml` (line 321), `services/compliance-service` (line 35), `services/tenant-service` (line 43), `services/analytics-service` (line 44), `services/integration-hub-service` (line 48), `services/auth-service` (line 55)
- **Problem:** `${REDIS_PASSWORD:}` defaults to an empty string, which means Redis will start unauthenticated if the env var is absent. In development this is convenient (Redis without a password), but in production an operator forgetting to set `REDIS_PASSWORD` will connect to Redis without authentication.
- **Fix:** Document this explicitly. For production Kubernetes deployments, the deployment manifests should always inject this from the `andikisha-secrets` Secret. Add a comment in each production `application.yml` noting that `REDIS_PASSWORD` is required in non-dev environments.

---

## 4. Multi-Tenancy

### Critical

**C-MT-1: Schema-per-tenant isolation is not implemented — all services use a single shared schema with `tenant_id` column isolation only**

- **File:** `services/employee-service/src/main/java/com/andikisha/employee/infrastructure/persistence/MultiTenantDataSourceConfig.java` (full file — it is an empty placeholder with a Javadoc TODO)
- **No equivalent file exists in any of the other 12 services.**
- **Problem:** The architecture document and REVIEW.md describe "database-per-service and schema-per-tenant multi-tenancy." The actual implementation is single-schema per service with `tenant_id` column row filtering. `TenantSchemaRoutingDataSource` has never been implemented. While column-based isolation is a valid pattern, it must be **intentional and enforced at every query**. Currently the enforcement relies entirely on developers remembering to include `tenantId` in every repository method. A forgotten filter silently returns all tenants' data.
- **Why it matters:** This is not yet a live exploit (queries appear to filter by `tenantId` consistently in the reviewed repositories), but the architectural claim in the spec does not match reality. More importantly, there is no compile-time or framework-level safety net — a missing `tenantId` predicate in any new repository method will silently leak cross-tenant data.
- **Fix:** Either (a) formally adopt column-based isolation as the permanent design and document it — update the REVIEW.md/CLAUDE.md spec to reflect this — and add Hibernate Filter integration (`@Filter` + `@FilterDef`) to enforce `tenant_id = :tenantId` at the Hibernate session level automatically, eliminating the need to manually include it in every query; or (b) implement the `AbstractRoutingDataSource` approach as described in the Javadoc TODO. Option (a) is significantly cheaper to implement and safer to maintain.

---

### Major

**M-MT-1: Flyway migrations run at the shared schema level — no per-tenant schema provisioning on `TenantCreatedEvent`**

- **Files:** All `src/main/resources/db/migration/` directories — all migrations target the service's single database, not per-tenant schemas.
- **Problem:** Since schema-per-tenant is not implemented (see C-MT-1), this is consistent with the current reality. However, if schema-per-tenant is ever implemented, the current Flyway setup will need a complete rework. Current migrations create tables once, not per-tenant.
- **Finding:** Consistent with the single-schema approach. Not a defect in isolation, but documents the gap if schema-per-tenant is desired.

---

### Minor

_All reviewed repository interfaces (`PaySlipRepository`, `PayrollRunRepository`, `EmployeeRepository`, `LeaveRequestRepository`, etc.) consistently filter by `tenantId` in every method. The column-isolation pattern is applied correctly in all reviewed repositories._

---

## 5. Kenyan Statutory Compliance

### Critical

**C-KC-1: HELB deductions are hardcoded to zero for every employee — see M-CQ-2 above**

_(Cross-referenced — this is both a code quality and compliance finding.)_

### Major

**M-KC-1: NITA employer levy is not tracked — see M-CQ-3 above**

_(Cross-referenced — structural gap in payroll output.)_

**M-KC-2: PAYE band 2 upper boundary differs by KES 1 between the seed data and the calculator**

- **Files:** `services/payroll-service/src/main/java/com/andikisha/payroll/application/service/KenyanTaxCalculator.java` (line 14: `BAND_2_LIMIT = bd(32300)`), `services/compliance-service/src/main/resources/db/migration/V4__seed_kenya_rates.sql` (line 3: `upper_bound = 32300`), `services/compliance-service/src/main/resources/db/migration/V4__seed_kenya_rates.sql` (line 4: `lower_bound = 32300.01`)
- **Finding:** The calculator uses `BAND_2_LIMIT = 32300` and computes `band2Width = BAND_2_LIMIT.subtract(BAND_1_LIMIT) = 32300 - 24000 = 8300`. Band 3 picks up the remainder. The seed data uses `lower_bound = 32300.01` for band 3. This is consistent — the calculator applies band 2 up to 32,300 inclusive and band 3 from 32,300.01. **No calculation error** — the boundary is handled correctly by the `remaining.min(bandWidth)` logic. This is a documentation/verification note only.

---

### Minor

**m-KC-1: Payroll state machine allows `fail()` to be called on a `CALCULATED` run — partial gap**

- **File:** `services/payroll-service/src/main/java/com/andikisha/payroll/domain/model/PayrollRun.java` (lines 178–184)
- **Problem:** `fail()` throws `BusinessRuleException` if status is `COMPLETED` or `APPROVED`, but **not** if status is `CALCULATED`. A `CALCULATED` run that has not been approved can be failed. This is probably fine (a calculation might be rejected), but the guard should be explicit rather than implicit.
- **Finding:** The PAYE bands, NSSF tiers, SHIF rate (2.75%), Housing Levy (1.5% employee + 1.5% employer), and personal relief (KES 2,400/month) all match current KRA rates. The payroll state machine transitions `DRAFT → CALCULATING → CALCULATED → APPROVED → PROCESSING → COMPLETED` and enforces correct sequencing. The `finishCalculation()` zero-employee guard is missing but is covered upstream in `PayrollService`.

---

## 6. Scalability and Performance

### Critical

_None._

### Major

**M-PERF-1: Payroll service has no Spring Batch — large tenants will exhaust JVM heap**

- **File:** `services/payroll-service/src/main/java/com/andikisha/payroll/application/service/PayrollService.java` (lines 143–200)
- **Problem:** `calculatePayroll` fetches all active employees in a single gRPC call (`getActiveEmployees`), all salary structures in a single batch call, all leave balances in a single batch call, then builds all payslips in memory before a single `transactionTemplate.execute` saves them all at once. For a tenant with 5,000 employees, this holds 5,000 `EmployeeResponse` proto objects, 5,000 `SalaryStructureResponse` objects, 5,000 `LeaveBalanceResponse` lists, and 5,000 `PaySlip` JPA entities in memory simultaneously. With Hibernate batch insert configured (`jdbc.batch_size: 25`) and 5,000 entities, the single transaction must manage 200 batch flushes before commit.
- **Why it matters:** Memory pressure is proportional to headcount. A 500-employee tenant at ~1KB per employee object means roughly 3–5 MB in-flight — fine. A 5,000-employee enterprise tenant at the same average means 30–50 MB — still manageable but the single-transaction approach means a failure at employee 4,999 rolls back all 4,999 and restarts from zero.
- **Fix for the current scale (SMEs under 500 employees):** The existing approach is adequate for the stated Kenyan/East African SME target market. Add a comment documenting the in-memory limit and the threshold at which Spring Batch should be introduced. For future enterprise tiers: chunk the payroll calculation into pages of 100 employees using Spring Batch `ItemReader/ItemProcessor/ItemWriter` with chunk size 50.

**M-PERF-2: RabbitMQ prefetch count is not configured in any service**

- **Files:** `services/payroll-service/src/main/java/com/andikisha/payroll/infrastructure/config/RabbitMqConfig.java`, all other service `RabbitMqConfig.java` files — none call `factory.setPrefetchCount()`
- **Problem:** Without a prefetch limit, RabbitMQ's default behavior allows Spring AMQP to pre-fetch an unlimited number of messages per consumer. If a listener becomes slow (e.g., payroll event triggers a compliance audit which takes 500ms), hundreds of messages pile up in the consumer thread pool, causing memory pressure and masking backpressure.
- **Exception:** `compliance-service` has a `SimpleRabbitListenerContainerFactory` bean (line 66) but does not call `setPrefetchCount` either.
- **Fix:** Set `factory.setPrefetchCount(10)` (or tune per service) in every `RabbitMqConfig` that registers a `SimpleRabbitListenerContainerFactory`. For the payroll event listener, a prefetch of 1–5 is appropriate given the write-heavy nature of compliance audit processing.

---

### Minor

**m-PERF-1: gRPC channels use `plaintext` negotiation — no TLS between services**

- **Files:** `services/payroll-service/src/main/resources/application.yml` (lines 50, 55: `negotiation-type: plaintext`)
- **Problem:** All inter-service gRPC calls use plaintext. For in-cluster Kubernetes traffic, this is a common trade-off when mTLS is handled at the service mesh layer (Istio/Linkerd). If no service mesh is in use, inter-service gRPC traffic is unencrypted on the internal network.
- **Fix:** If a service mesh is deployed, document this explicitly. If no service mesh, upgrade to `TLS` negotiation with mutual certificates.

**m-PERF-2: Compliance `@Cacheable` cache keys do not include tenant context**

- **File:** `services/compliance-service/src/main/java/com/andikisha/compliance/application/service/ComplianceService.java` (lines 64, 75, 86)
- **Finding:** Cache key is `#countryCode + ':' + #asOf`. This is correct — compliance rates are not tenant-specific. No defect.

---

## 7. Observability

### Major

**M-OBS-1: Logging pattern does not include `tenantId` or `userId` — they are set in MDC but never emitted**

- **Files:** All 13 `application.yml` files — logging pattern is `"%5p [${spring.application.name},%X{traceId:-},%X{spanId:-}]"` uniformly. Notably, `%X{tenantId:-}` and `%X{userId:-}` are absent.
- **Problem:** Filters in `payroll-service`, `employee-service`, `compliance-service`, and others correctly call `MDC.put("tenantId", tenantId)` and `MDC.put("requestId", requestId)`. But the configured log pattern only emits `traceId` and `spanId`. The `tenantId` is populated in MDC but never appears in log output. When debugging a tenant-specific incident, engineers cannot filter logs by `tenantId` without pattern matching on unstructured log body text.
- **Why it matters:** In a multi-tenant SaaS, the single most important correlation field in a log line is `tenantId`. Without it in the pattern, log aggregation tools (ELK, Grafana Loki) cannot trivially filter to a single tenant's log stream.
- **Fix:** Update the log pattern in all services to:
  ```yaml
  logging:
    pattern:
      level: "%5p [${spring.application.name},%X{traceId:-},%X{spanId:-},%X{tenantId:-},%X{userId:-}]"
  ```
  This requires no code changes — the MDC values are already being set.

**M-OBS-2: Zipkin container has no healthcheck in `docker-compose.infra.yml`**

- **File:** `infrastructure/docker/docker-compose.infra.yml` (lines 315–321)
- **Problem:** All 12 PostgreSQL databases, RabbitMQ, and Redis have `healthcheck` blocks. The `zipkin` container has no healthcheck. A service waiting for Zipkin to be ready (e.g., in CI integration tests) has no `depends_on: zipkin: condition: service_healthy` to use.
- **Fix:**
  ```yaml
  zipkin:
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://localhost:9411/health || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 20s
  ```

---

### Minor

**m-OBS-1: gRPC tracing propagation relies on `grpc-spring-boot-starter`'s built-in Micrometer bridge — not explicitly verified**

- **Finding:** The services use `net.devh.boot.grpc` stubs with `@GrpcClient`. `grpc-spring-boot-starter` 3.x integrates with Micrometer's tracing API and propagates B3 headers automatically. No explicit custom `ClientInterceptor` for tracing is needed. This is working correctly by library convention. No action needed — but a smoke test verifying that a `traceId` from an HTTP request appears in a downstream gRPC call's span would confirm this is wired.

---

## 8. Testing

### Major

**M-TEST-1: gRPC service tests use direct constructor instantiation and Mockito — no in-process gRPC server**

- **Files:** `services/payroll-service/src/test/java/com/andikisha/payroll/unit/PayrollGrpcServiceTest.java` (lines 40–44)
- **Problem:** `PayrollGrpcService` is instantiated directly via `new PayrollGrpcService(...)` with mocked repositories. This tests the service logic but not the gRPC plumbing: proto serialization/deserialization, error status codes (e.g., `NOT_FOUND` → `Status.NOT_FOUND`), deadline propagation, and metadata handling are all bypassed.
- **Why it matters:** A gRPC server that compiles and passes unit tests can still fail at the transport layer if proto field names or message types change. In-process server tests catch these errors before deployment.
- **Fix:** Wrap gRPC service tests with an in-process server:
  ```java
  @BeforeEach void setUp() throws IOException {
      String serverName = InProcessServerBuilder.generateName();
      grpcCleanup.register(InProcessServerBuilder.forName(serverName)
          .directExecutor()
          .addService(new PayrollGrpcService(mockRunRepo, mockSlipRepo))
          .build().start());
      ManagedChannel channel = grpcCleanup.register(
          InProcessChannelBuilder.forName(serverName).directExecutor().build());
      stub = PayrollServiceGrpc.newBlockingStub(channel);
  }
  ```

**M-TEST-2: No test coverage for multi-tenant data isolation at the repository layer**

- **Finding:** Repository integration tests (e.g., `PayrollRunRepositoryTest`, `EmployeeRepositoryTest`) use Testcontainers and test correct tenant data retrieval. None of them assert that a query using `tenantId=A` does **not** return data belonging to `tenantId=B`. This "negative isolation" test is the most important test for multi-tenant correctness.
- **Fix:** Add one test to each repository integration test that inserts two records with different `tenantId` values and asserts that a query by `tenantId=A` returns exactly one result and zero results for `tenantId=B`.

---

### Minor

**m-TEST-1: RabbitMQ message publishing is not tested with a real broker in any service**

- **Finding:** Integration tests use Testcontainers for PostgreSQL but not for RabbitMQ. Event publishers are tested with mocks only (`verify(eventPublisher).publishPayrollCalculated(...)`). The actual AMQP serialization, exchange routing, and DLX routing are untested.
- **Fix:** Add a `RabbitMQContainer` (Testcontainers) in the payroll and employee service integration tests, configure the test context to use it, and assert that publishing a `PayrollCalculatedEvent` results in a message appearing on the expected queue.

---

## 9. Frontend

### Major

**M-FE-1: `superadmin-portal` reads the JWT from `document.cookie` using a manual cookie parse — not `HttpOnly`**

- **File:** `frontend/superadmin-portal/src/lib/api-client.ts` (lines 11–18)
- **Problem:** The auth token is read from a cookie named `superadmin_token` via manual `document.cookie` parsing. This means the cookie is **not** `HttpOnly` — it is readable by JavaScript. Any XSS vulnerability in the portal would expose the super-admin JWT.
- **Why it matters:** `SUPER_ADMIN` has platform-wide access to all tenants. Exfiltrating this token is the highest-severity breach possible in this system.
- **Fix:** Store the super-admin token in an `HttpOnly; Secure; SameSite=Strict` cookie set by the server. Use Next.js API routes to act as a BFF (backend-for-frontend) that attaches the token to outbound requests server-side, so the token is never accessible to browser JavaScript.

---

### Minor

**m-FE-1: Employee portal has no PWA configuration**

- **File:** `frontend/employee-portal/next.config.js` (full file) — no `next-pwa` or service worker configuration
- **Problem:** The REVIEW.md spec asks whether the employee portal is correctly configured as a PWA with a service worker and offline route caching. It is not. No `manifest.json`, no service worker registration, no `next-pwa` dependency.
- **Why it matters:** The stated product targets Kenyan SMEs where mobile network reliability is inconsistent. Offline access to payslips and attendance records is a meaningful feature for field workers.
- **Fix:** Add `next-pwa` to the employee portal, configure a service worker that caches the payslip and leave balance routes. This is a product gap, not a defect — but worth flagging.

**m-FE-2: API base URLs are correctly environment-variable driven — no hardcoded service addresses found**

- **Files:** `frontend/packages/api-client/src/index.ts` (line 18: `process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'`), `frontend/superadmin-portal/src/lib/api-client.ts` (line 3: `process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'`)
- **Finding:** Both frontends correctly default to the API Gateway on port 8080 and override via `NEXT_PUBLIC_API_URL`. No direct service addresses found in frontend code. Clean.

---

## 10. Infrastructure

### Major

**M-INFRA-1: `docker-compose.infra.yml` Zipkin container has no healthcheck — see M-OBS-2 above**

_(Cross-referenced.)_

---

### Minor

**m-INFRA-1: Dockerfile does not pin the base image by digest for the runtime stage**

- **File:** `infrastructure/docker/Dockerfile.service` (lines 17, 39)
- **Problem:** Builder stage: `eclipse-temurin:21-jdk-alpine` (floating tag). Runtime stage: `eclipse-temurin:21-jre-alpine` (floating tag). The `zipkin` container in `docker-compose.infra.yml` is pinned by digest (correct); the service Dockerfile is not. A floating tag means a `docker build` on a different date can pull a different JRE patch, producing a non-reproducible build artifact.
- **Fix:** Pin to a specific digest:
  ```dockerfile
  FROM eclipse-temurin:21-jre-alpine@sha256:<current-digest>
  ```
  Or pin the minor version: `eclipse-temurin:21.0.5_11-jre-alpine`.

**m-INFRA-2: Kubernetes probes use `IfNotPresent` image pull policy — will not update in staging if image tag is reused**

- **Files:** `infrastructure/k8s/services/payroll-service/deployment.yaml` (line 30: `imagePullPolicy: IfNotPresent`), all other service deployments.
- **Problem:** `IfNotPresent` is correct for production with immutable tags. If staging reuses the `latest` tag, `IfNotPresent` prevents the cluster from pulling updated images. The manifest uses `image: andikisha/payroll-service:latest`.
- **Fix:** Use immutable version tags (`v1.2.3`) in production deployments and remove `IfNotPresent` (it is the default for non-`latest` tags). For staging, use `Always` if the `latest` tag is reused.

---

## Summary

**What is working well:**

The API Gateway JWT validation is correctly implemented — it strips all identity headers before setting them from the validated token payload, preventing header spoofing. All JWT secrets are properly env-var gated with no fallbacks. The `KenyanTaxCalculator` correctly implements the 2024 PAYE bands, SHIF at 2.75%, Housing Levy at 1.5%, and the NSSF two-tier structure. The `PayrollRun` state machine enforces correct transitions with domain exceptions. `DeductionResult` uses a Java record. All 13 service databases have healthchecks in `docker-compose.infra.yml`. The Dockerfile uses a proper multi-stage build with a non-root user. Testcontainers is used for PostgreSQL integration tests across all Phase 1–3 services. RabbitMQ DLX/DLQ configuration is present in every service that consumes events. Constructor injection is used consistently throughout production code (`@Autowired` only appears in test classes, where Spring field injection is acceptable). `BaseEntity` implements `equals`/`hashCode` correctly for JPA (identity-based, null-safe UUID comparison).

**What needs the most attention before production:**

1. **C-ARCH-1 (Payroll / Compliance coupling):** The tax calculator must pull rates from the Compliance Service, not from static constants. A rate change without a redeployment is not survivable otherwise.
2. **M-ARCH-1 (UNIQUE constraint defect):** The database unique constraint on `(tenant_id, period, pay_frequency)` makes it impossible to run a payroll correction or re-run after a completed cycle. This will fail in production on the second pay cycle.
3. **M-ARCH-2 (Analytics and Attendance have no authentication):** Two services serving sensitive operational data are fully unauthenticated. This must be fixed before any tenant data reaches those endpoints.
4. **M-CQ-2 (HELB always zero):** Every employee with a HELB loan will have incorrect net pay. This is a statutory compliance failure.
5. **C-MT-1 (Schema-per-tenant is not implemented):** The stated architecture does not match the implementation. The current column-based approach must be acknowledged as the design and enforced at the Hibernate filter layer, or the schema-per-tenant implementation must be completed.

Items 1, 2, and 4 carry statutory liability. Item 3 is a data security gap. Item 5 is a correctness and marketing-claim risk. Address these five before accepting any paying tenants.
