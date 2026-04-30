# AndikishaHR — Pre-Production Review Report
**Date:** 2026-04-29  
**Prepared by:** Engineering Review (6 specialist agents)  
**Scope:** All 13 microservices, shared libraries, infrastructure, deployment  
**Verdict:** ⛔ NO-GO — 11 critical blockers must be resolved before production deployment

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Architecture Review](#2-architecture-review)
3. [Codebase & Quality Review](#3-codebase--quality-review)
4. [Environment & Deployment Readiness](#4-environment--deployment-readiness)
5. [SIT Readiness Assessment](#5-sit-readiness-assessment)
6. [UAT Readiness Assessment](#6-uat-readiness-assessment)
7. [Security, Compliance & Data Integrity](#7-security-compliance--data-integrity)
8. [Performance & Scalability](#8-performance--scalability)
9. [Release Readiness Summary](#9-release-readiness-summary)
10. [Remediation Plan](#10-remediation-plan)

---

## 1. Executive Summary

AndikishaHR is an architecturally mature Spring Boot microservices platform with strong domain-driven design, a comprehensive event system, correct Kenyan statutory payroll calculations, and 573 tests across all 13 services. The application layer is **production-quality code**. However, the system cannot be deployed to production in its current state due to a combination of critical security vulnerabilities, an absent deployment layer, and two uncompleted core business features.

### Overall Scorecard

| Domain | Score | Status |
|--------|-------|--------|
| Architecture & Design | 85/100 | ✅ STRONG |
| Kenyan Payroll Compliance | 90/100 | ✅ STRONG |
| Test Coverage | 78/100 | ⚠️ PARTIAL |
| Security & Authorization | 42/100 | ❌ CRITICAL GAPS |
| Business Logic Integrity | 72/100 | ⚠️ 2 BLOCKERS |
| Deployment & DevOps | 18/100 | ❌ NOT READY |
| Observability & Monitoring | 30/100 | ❌ NOT READY |

### Critical Blockers (11 total — must fix before production)

| # | Area | Issue |
|---|------|-------|
| CB-01 | Security | `audit-service` and `notification-service` have no Spring Security dependency — APIs are fully unauthenticated |
| CB-02 | Security | `integration-hub-service` has no Spring Security — salary disbursement endpoint is unauthenticated |
| CB-03 | Security | M-Pesa callback has no source-IP validation — fabricated payment confirmations possible |
| CB-04 | Security | `X-Internal-Request` header is forgeable by any external client, bypassing gateway sentinel |
| CB-05 | Security | `PayrollController` has no `@PreAuthorize` — any authenticated user can approve and disburse payroll |
| CB-06 | Security | `TenantContext` not populated in `employee-service` — every request throws `IllegalStateException` (runtime crash) |
| CB-07 | Architecture | `NoOpAuthServiceClient` in `tenant-service` — provisioning new tenants does NOT create auth-service users |
| CB-08 | Architecture | Compliance audit logic in `PayrollEventListener` is a stubbed `TODO` — statutory deductions never verified |
| CB-09 | Business Logic | KRA PIN duplicate validation missing — same PIN can be registered for multiple employees |
| CB-10 | Business Logic | Managers can approve their own leave requests — segregation of duties violated |
| CB-11 | DevOps | Zero Kubernetes manifests and zero CI/CD pipeline — no deployment infrastructure exists |

---

## 2. Architecture Review

### 2.1 System Design

**All 13 microservices are confirmed present and structurally complete.**

| Phase | Services | Status |
|-------|----------|--------|
| Phase 1 — Foundation | api-gateway, auth-service, employee-service, tenant-service | ✅ Complete |
| Phase 2 — Core HR | payroll-service, compliance-service, time-attendance-service, leave-service | ✅ Complete |
| Phase 3 — Supporting | document-service, notification-service, integration-hub-service | ✅ Complete |
| Phase 4 — Intelligence | analytics-service, audit-service | ✅ Complete |

**Communication topology is correct:**  
REST (external) → API Gateway → gRPC (synchronous inter-service) → RabbitMQ (async events)

**Event system is comprehensive:**  
30 domain events defined across payroll, employee, tenant, leave, attendance, auth, document, and compliance lifecycles. 8 services publish events; 8+ services consume them via topic exchanges with DLQ configuration.

**gRPC service mesh:**  
8 proto-defined gRPC services covering payroll, compliance, employee, auth, tenant, leave, attendance, and document queries. All implement proper gRPC error codes.

### 2.2 DDD Package Compliance

All services follow the mandated DDD layout exactly:
`domain/model → domain/repository → application/service → application/dto → application/port → infrastructure/messaging → infrastructure/grpc → infrastructure/config → presentation/controller → presentation/advice → presentation/filter`

No deviations found.

### 2.3 Shared Library Health

| Component | Location | Status |
|-----------|----------|--------|
| `BaseEntity` | `shared/andikisha-common` | ✅ UUID PK, tenant_id @Column, @Version optimistic lock, audit timestamps |
| `Money` | `shared/andikisha-common` | ✅ BigDecimal(15,2), currency string, HALF_UP arithmetic, factory methods |
| `TenantContext` | `shared/andikisha-common` | ✅ ThreadLocal, requireTenantId(), clear() in finally blocks |
| `andikisha-proto` | `shared/andikisha-proto` | ✅ 8 proto files, all gRPC services defined |
| `andikisha-events` | `shared/andikisha-events` | ✅ 30 event classes, all extend BaseEvent |

### 2.4 Architectural Risks

| Risk | Severity | Detail |
|------|----------|--------|
| `NoOpAuthServiceClient` in tenant-service | **CRITICAL** | Tenant provisioning calls `NoOpAuthServiceClient.registerUser()` which only logs and returns. New tenants get a database record but no auth-service user. The first login will fail. File: `services/tenant-service/.../grpc/NoOpAuthServiceClient.java` |
| `PayrollEventListener` compliance TODO | **CRITICAL** | `compliance-service/.../messaging/PayrollEventListener.java` lines 36-38 contain a TODO. Payroll runs are never audited against statutory deduction bounds. |
| No centralized config server | **LOW** | 13 individual `application.yml` files — config drift risk at scale |
| gRPC plaintext with no service mesh | **LOW** | `payroll-service` and `document-service` use `negotiation-type: plaintext`. Acceptable only with cluster-level mTLS. |

### 2.5 Build System

Checkstyle is enforced with `isIgnoreFailures = false`. Java 21 LTS. Spring Boot 3.4.1. Gradle Kotlin DSL. Reproducible builds confirmed. No `@Autowired` field injection detected in production code. No `double`/`float` monetary fields found. `spring.jpa.open-in-view: false` confirmed in all services.

---

## 3. Codebase & Quality Review

### 3.1 Code Standards

| Standard | Status | Notes |
|----------|--------|-------|
| Constructor injection | ✅ PASS | No field injection in `src/main/java` |
| Money handling (BigDecimal) | ✅ PASS | All monetary fields use `BigDecimal` with scale 2 |
| No double/float for money | ✅ PASS | Zero violations found |
| `open-in-view: false` | ✅ PASS | Confirmed across 12 services |
| Flyway migrations naming | ✅ PASS | All `V{n}__{description}.sql` |
| DTO as Java records | ✅ PASS | Request/Response DTOs are records; entities extend BaseEntity |
| Repository tenantId filtering | ✅ PASS (spot check) | All checked methods include tenantId filter |

### 3.2 Technical Debt Inventory

| Debt Item | Severity | Location |
|-----------|----------|----------|
| `NoOpAuthServiceClient` | CRITICAL | `tenant-service/.../grpc/NoOpAuthServiceClient.java` |
| Compliance audit TODO | CRITICAL | `compliance-service/.../messaging/PayrollEventListener.java:36` |
| `format_sql: true` in base configs | MEDIUM | 10 of 13 `application.yml` files (should be dev-only) |
| No shared test utility library | LOW | TenantContext setup duplicated in 10+ test classes |
| `audit-service` hardcoded port 8092 | MEDIUM | `audit-service/application.yml:57` |
| `audit-service baseline-on-migrate: true` | MEDIUM | `audit-service/application.yml:41` — masks migration failures |
| `audit-service show-details: always` | MEDIUM | `audit-service/application.yml:68` — exposes health details unauthenticated |
| Duplicate `SuperAdminAuthFilter` beans | MEDIUM | Two `@Component` instances in different packages in api-gateway |
| CRLF sanitization missing in tenant-service filter | MEDIUM | `tenant-service/.../filter/TrustedHeaderAuthFilter.java:29-30` |

### 3.3 Documentation

- SpringDoc OpenAPI endpoints are configured on all services — API docs are auto-generated
- No ADRs (Architecture Decision Records) found for key decisions (event patterns, gRPC vs REST)
- No runbook for Flyway migration repair/rollback
- No `.env.example` for new developer onboarding

### 3.4 Test Coverage

**573 tests across 108 test files — all active, none disabled.**

| Service | Test Files | ~Tests | Unit | Integration | E2E | Rating |
|---------|-----------|--------|------|-------------|-----|--------|
| api-gateway | 9 | ~35 | ✅ | ✅ | ✅ | GOOD |
| auth-service | 5 | ~25 | ✅ | ✅ | ✅ | GOOD |
| tenant-service | 9 | ~45 | ✅ | ✅ | ✅ | GOOD |
| employee-service | 6 | ~40 | ✅ | ✅ | ✅ | GOOD |
| payroll-service | 6 | 58 | ✅ | ✅ | ✅ | **EXCELLENT** |
| compliance-service | 4 | ~18 | ✅ | ✅ | ✅ | MINIMAL |
| time-attendance-service | 4 | ~22 | ✅ | ✅ | ✅ | MINIMAL |
| leave-service | 9 | 112 | ✅ | ✅ | ✅ | **EXCELLENT** |
| document-service | 4 | ~18 | ✅ | ✅ | ✅ | MINIMAL |
| notification-service | 3 | ~12 | ✅ | ✅ | ✅ | MINIMAL |
| integration-hub-service | 10 | ~45 | ✅ | ✅ | ✅ | GOOD |
| analytics-service | 16 | 101 | ✅ | ✅ | ✅ | **EXCELLENT** |
| audit-service | 4 | ~18 | ✅ | ✅ | ✅ | MINIMAL |

**Critical path coverage:**
- ✅ PAYE/NSSF/SHIF/Housing Levy calculations — 9 salary bands tested with accounting identity assertion
- ✅ Leave lifecycle (submit → approve/reject → balance deduction)
- ✅ Tenant data isolation (cross-tenant access denied)
- ✅ JWT validation (expiry, claims, signature)
- ✅ M-Pesa callback handling (success, failure, malformed payload)
- ⚠️ Cross-service event chains (employee creation → payroll roster inclusion — NOT end-to-end tested)
- ⚠️ gRPC inter-service calls tested in isolation only, not end-to-end
- ❌ No load or stress tests of any kind

---

## 4. Environment & Deployment Readiness

**Overall verdict: NOT READY**

### 4.1 Docker Compose

| Item | Status | Detail |
|------|--------|--------|
| Infra-only compose exists | ✅ | `infrastructure/docker/docker-compose.infra.yml` — 12 Postgres instances, RabbitMQ, Redis, Zipkin |
| Full-stack compose exists | ❌ | No compose file brings up all 13 services together |
| Hardcoded credentials | ⚠️ HIGH | 13 occurrences of `POSTGRES_PASSWORD: changeme` and `RABBITMQ_DEFAULT_PASS: changeme` committed to git |
| Redis authentication | ❌ | No password on Redis container — any process on the Docker network has full read/write access to session tokens and rate-limit counters |
| Zipkin healthcheck | ⚠️ LOW | Zipkin container has no `healthcheck` block |
| `.env.example` | ❌ | No documentation of required environment variables for new developers |

### 4.2 Dockerfiles

| Item | Status | Detail |
|------|--------|--------|
| Multi-stage build | ✅ | JDK (builder) → JRE (runtime) — production images do not ship JDK |
| Non-root user | ✅ | `appgroup`/`appuser` created and switched to before `ENTRYPOINT` |
| JVM container awareness | ✅ | `-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0` |
| Per-service Dockerfiles | ⚠️ | Single shared `Dockerfile.service` parameterized by `ARG SERVICE_NAME` — operator error risk |
| HEALTHCHECK instruction | ⚠️ LOW | Not present in Dockerfile — relies entirely on K8s probes which don't exist yet |

### 4.3 Kubernetes Manifests

**CRITICAL: Zero manifests exist.**

The directory tree `/infrastructure/k8s/base/` and `/infrastructure/k8s/services/{13 directories}` exists but is entirely empty. The following are all absent:

- Deployment manifests (replicas, image tags, env-from-secret wiring)
- Service manifests (ClusterIP for internal, LoadBalancer/Ingress for api-gateway)
- ConfigMaps and Secrets
- Resource requests and limits (CPU/memory)
- Liveness probes (`/actuator/health/liveness`) and readiness probes (`/actuator/health/readiness`)
- HorizontalPodAutoscalers
- NetworkPolicy for port isolation
- PodDisruptionBudgets

Spring Boot side is ready (readiness/liveness probe endpoints are enabled in 12/13 services; Prometheus metrics enabled on all 13). The Kubernetes side is not.

### 4.4 CI/CD Pipeline

**CRITICAL: No pipeline exists.**

No `.github/workflows/`, no `Jenkinsfile`, no `.gitlab-ci.yml`, no CircleCI config. There is:
- No automated build on pull request
- No automated test gate
- No Checkstyle enforcement in CI (only local)
- No Docker image build/push automation
- No staging → pre-prod → prod promotion flow
- No secrets injection strategy for any environment

### 4.5 Observability

| Item | Status | Detail |
|------|--------|--------|
| Prometheus metrics | ✅ | Micrometer/Prometheus configured and exposed on all 13 services |
| Readiness/liveness endpoints | ✅ | Enabled in 12/13 services (`audit-service` missing `probes.enabled`) |
| Distributed tracing | ❌ CRITICAL | Zipkin is running but **no service has micrometer-tracing configured**. Zero spans sent. Cross-service request correlation is impossible. |
| Structured logging | ❌ | No `logback-spring.xml` in any service — plain-text logs, not queryable in ELK/CloudWatch |
| Grafana / alerting | ❌ | No dashboards or alerts defined |

### 4.6 Configuration Issues

| Issue | Severity | Location |
|-------|----------|----------|
| `format_sql: true` in base config (not dev-only) | MEDIUM | 10 services' `application.yml` |
| `audit-service` hardcoded port `8092` | MEDIUM | `audit-service/application.yml:57` |
| Redis password missing in 11 of 13 services | MEDIUM | Only `integration-hub-service` sets `spring.data.redis.password` |
| `show-details: always` in audit-service | MEDIUM | `audit-service/application.yml:68` |
| `baseline-on-migrate: true` in audit-service | MEDIUM | `audit-service/application.yml:41` |
| RabbitMQ `guest/guest` fallback in api-gateway | LOW | `api-gateway/application.yml:322-325` |
| No Spring Cloud Config | LOW | 13 independent `application.yml` files — config drift risk |

---

## 5. SIT Readiness Assessment

### 5.1 Service-to-Service Communication Map

| Integration | Type | Status | Blocker |
|-------------|------|--------|---------|
| api-gateway → all services | REST → REST (gateway routing) | ✅ Routes configured, circuit breakers in place | None |
| tenant-service → auth-service | gRPC (user provisioning) | ❌ **STUBBED** | `NoOpAuthServiceClient` — tenant creation creates no auth user |
| payroll-service → employee-service | gRPC (employee data) | ✅ `EmployeeGrpcClient` implemented | None |
| payroll-service → leave-service | gRPC (leave balance) | ✅ `LeaveGrpcClient` implemented | None |
| payroll-service → compliance-service | gRPC (tax calculation) | ✅ `ComplianceGrpcService` implemented | None |
| document-service → payroll-service | gRPC (payslip retrieval) | ✅ `PayrollGrpcClient` implemented | None |
| employee-service → payroll-service | Events (employee lifecycle) | ✅ `RabbitEmployeeEventPublisher` → `EmployeeEventListener` | None |
| payroll-service → analytics/notifications | Events (`PayrollApprovedEvent`) | ✅ Published and consumed | None |
| leave-service → analytics/notifications | Events (`LeaveApprovedEvent`) | ✅ Published and consumed | None |
| compliance-service audit of payroll | Events (`PayrollProcessedEvent`) | ❌ **TODO** | Listener exists but audit logic is stub |
| tenant → all services | Events (`TenantCreatedEvent`) | ⚠️ | Published; downstream initialization not fully verified |

### 5.2 Failing/Incomplete Integrations (Prioritized)

**P0 — Blocks all SIT:**
1. **Tenant provisioning does not create auth users** — The core onboarding flow is broken. Every new tenant provisioned via `POST /api/v1/super-admin/tenants` will result in a tenant record with no ability to log in. No SIT scenario can proceed until `NoOpAuthServiceClient` is replaced with a real gRPC call to `auth-service:9081`.

2. **`TenantContext` not set in employee-service** — Every `GET /api/v1/employees` request will throw `IllegalStateException` at runtime. The employee service is effectively non-functional.

**P1 — Blocks payroll SIT:**
3. **Compliance audit never runs** — The `PayrollEventListener` in compliance-service is a no-op. Payroll runs process without statutory validation.

4. **PayrollController authorization absent** — Any test user of any role can approve and disburse payroll in SIT — test results will not represent production behavior.

**P2 — Blocks financial SIT:**
5. **integration-hub-service unauthenticated** — The disbursement endpoint has no access control. SIT tests cannot validate authorization behavior.

### 5.3 SIT Environment Requirements

- Docker Compose full-stack file is required before any SIT can begin
- All 13 services must start successfully (currently employee-service crashes on first request)
- Tenant provisioning flow must be functional end-to-end before any business-flow SIT

---

## 6. UAT Readiness Assessment

### 6.1 Feature Completeness

| Feature Area | Status | Notes |
|---|---|---|
| Super Admin: Tenant Provisioning | ❌ INCOMPLETE | Tenant DB record created; auth user NOT created (CB-07) |
| Tenant User Authentication (login/logout/refresh) | ✅ Complete | JWT flow correct, lockout at 5 failures |
| Employee CRUD | ⚠️ RUNTIME CRASH | Crashes on `TenantContext.requireTenantId()` (CB-06) |
| Department Management | ⚠️ | Same crash risk as employee-service |
| Payroll Run (initiate → calculate → approve) | ✅ Complete | State machine enforced, correct calculations |
| Kenyan Payroll Calculations | ✅ Verified | PAYE, NSSF, SHIF, Housing Levy all correct |
| Leave Request Lifecycle | ⚠️ | Self-approval not blocked (CB-10) |
| Leave Balances & Policies | ✅ Complete | Pro-rata accrual, policy defaults correct |
| Time & Attendance (clock in/out) | ✅ Complete | Functional |
| Statutory Filing (PAYE, NSSF, SHIF) | ✅ Complete | Filing records created correctly |
| M-Pesa Salary Disbursement | ⚠️ | Flow works; callback validation missing (CB-03) |
| Analytics Dashboard & Reports | ✅ Complete | Event-driven, 101 tests passing |
| Audit Trail | ✅ Functional | Events captured; service unauthenticated (CB-01) |
| Notifications | ✅ Functional | Created via events; service unauthenticated (CB-01) |
| Document Download (payslips) | ✅ Functional | No access control on downloads (see Medium issues) |

### 6.2 User Flow Gaps

**HR Manager flow — blocked by:**
- Cannot complete new employee onboarding (employee-service crash)
- Cannot run payroll and see compliance validation results
- Cannot enforce manager ≠ approver on leave

**Employee self-service flow — blocked by:**
- Any authenticated user can view all other employees' PII (salary, KRA PIN, national ID)
- Any employee can download any other employee's payslip

**Super Admin flow — blocked by:**
- Provisioning a new tenant does not result in a working tenant login

### 6.3 Business Rule Gaps

| Rule | Kenyan Law / Policy | Current Status |
|------|--------------------|-|
| KRA PIN must be unique per employer | KRA compliance | ❌ No DB constraint, no service check |
| Manager cannot approve own leave | Segregation of duties | ❌ Not enforced |
| Annual leave minimum 21 days | Employment Act Cap 226 | ⚠️ Correct default but not validated on policy creation |
| Sick leave minimum 30 days | Employment Act Cap 226 | ⚠️ Same — no min validation |
| Maternity leave 90 days | Employment Act Cap 226 | ⚠️ Same |

---

## 7. Security, Compliance & Data Integrity

### 7.1 Critical Security Findings

**CB-01/CB-02/CB-03: Three services lack Spring Security**

`audit-service`, `notification-service`, and `integration-hub-service` have no `spring-boot-starter-security` dependency. Their REST APIs accept requests from anyone who can reach the port:
- Full audit trail readable by any process on the network
- `POST /api/v1/payments/payroll-runs/{id}/disburse` — unauthenticated salary disbursement
- Any employee's notification history readable

Fix: Add `spring-boot-starter-security` + `TrustedHeaderAuthFilter` to all three services. Add `@PreAuthorize` to all controller endpoints.

**CB-04: `X-Internal-Request` sentinel header is forgeable**

`super-admin-routes` in the gateway's routes config defines its own `filters` list, which overrides `default-filters`. The `RemoveRequestHeader=X-Internal-Request` stripping only applies to routes that do NOT define their own filters list. Any external client can send `X-Internal-Request: true` and the header is not stripped before `SuperAdminAuthFilter` reads it.

Fix: Strip `X-Internal-Request` from all inbound requests inside the global `JwtAuthenticationFilter` (order -100), before any route filter runs.

**CB-05: `PayrollController` has no `@PreAuthorize`**

`POST /api/v1/payroll/runs/{id}/approve` is accessible to any authenticated user including `EMPLOYEE` role. A malicious employee who discovers a payroll run UUID can approve and trigger M-Pesa disbursement for the entire company payroll.

Fix: Add `@PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")` to `initiate`, `calculate`, `approve`, and `cancel`. Add `@PreAuthorize("hasAnyRole('HR_MANAGER', 'ADMIN', 'HR')")` to list endpoints.

**CB-06: `TenantContext` not set in `employee-service`**

`employee-service` has a `TrustedHeaderAuthFilter` that sets the Spring `SecurityContext` but never calls `TenantContext.setTenantId()`. Every service call to `TenantContext.requireTenantId()` — which is in all service methods — throws `IllegalStateException`. The employee service crashes on every authenticated request.

Fix: Add a `TenantContextFilter` (matching the pattern in `payroll-service`) to `employee-service`. Audit all other services for the same gap.

**CB-03: M-Pesa callback has no source validation**

`/api/v1/callbacks/mpesa/b2c/result` accepts any POST from any IP. A fabricated callback with `ResultCode: 0` and a known `conversationId` will mark a payment as completed without any actual M-Pesa transaction having occurred.

Fix: Implement a `MpesaSourceIpFilter` enforcing Safaricom's published B2C callback IP ranges. Add as a secondary check alongside the existing gateway bypass for `/api/v1/callbacks/**`.

### 7.2 High Security Findings

| ID | Issue | File | Fix |
|----|-------|------|-----|
| HIGH-1 | `PayrollController` no `@PreAuthorize` | `payroll-service/.../PayrollController.java` | Add role annotations |
| HIGH-2 | `SuperAdmin` login has no brute-force protection | `auth-service/.../SuperAdminAuthService.java:73-91` | Apply same `recordFailedLogin()` pattern as regular `User` |
| HIGH-3 | `TenantContext` missing in `employee-service` | `employee-service/.../filter/TrustedHeaderAuthFilter.java` | Add `TenantContextFilter` |
| HIGH-4 | `POST /api/v1/tenants` fully public — self-registration abuse | `tenant-service` + gateway public paths | Add rate limiting for registration endpoint |
| HIGH-5 | `SUPER_ADMIN` provision race condition — 2 concurrent requests can both succeed | `auth-service/.../SuperAdminAuthService.java:48-70` | Add unique DB constraint on `(role, tenant_id)` |

### 7.3 Medium Security Findings

| ID | Issue | Impact |
|----|-------|--------|
| MED-01 | `EmployeeController.list/getById` expose full PII (salary, KRA PIN, NHIF, NSSF) to all roles | PII leak to employees |
| MED-02 | `DocumentController` — any authenticated user can download any employee's payslip | Financial data leak |
| MED-03 | `NotificationController` — cross-employee notification access | PII leak |
| MED-04 | Swagger/OpenAPI endpoints public on all services in production | API enumeration |
| MED-05 | Duplicate `SuperAdminAuthFilter` `@Component` beans in api-gateway | Silent filter shadowing |
| MED-06 | `tenant-service TrustedHeaderAuthFilter` missing CRLF sanitization | Log injection |
| MED-07 | `LeaveController.submit` accepts forged `X-Employee-ID` for non-HR roles | Unauthorized leave submission |
| MED-08 | `@PreAuthorize` SpEL compares `userId` against `employeeId` path variable — always false | Employees denied own leave history |

### 7.4 Data Integrity

**Kenyan Statutory Calculations — VERIFIED CORRECT:**
- PAYE: 5 bands, 0-24K@10%, 24K-32.3K@25%, 32.3K-500K@30%, 500K-800K@32.5%, 800K+@35% ✅
- Personal relief: KES 2,400/month ✅
- NSSF: 6% gross, Tier I cap KES 7,000, Tier II cap KES 36,000 ✅
- SHIF: 2.75% (correctly replaced NHIF Oct 2024) ✅
- Housing Levy: 1.5% employee + 1.5% employer ✅
- All calculations use `BigDecimal` with `HALF_UP` rounding, `compareTo()` for comparisons ✅

**Data Integrity Issues:**
- KRA PIN uniqueness not enforced at DB or service layer (CB-09)
- Payroll period deduplication query excludes only `CANCELLED` — `COMPLETED` runs for a past year will block the same period next year
- Leave balance deduction uses optimistic locking (`@Version`) but `OptimisticLockException` not explicitly caught in the approval flow — concurrent approvals may oversell balance
- Leave policy minimum days not validated against Kenyan Employment Act minimums

**Audit Trail:**
- Audit service captures system-wide events ✅
- Impersonation sessions generate no audit event ❌
- `audit-service` API is unauthenticated (CB-01) ❌

---

## 8. Performance & Scalability

### 8.1 Potential Bottlenecks

| Area | Risk | Detail |
|------|------|--------|
| Payroll calculation (N+1 gRPC calls) | HIGH | For each employee in a payroll run, a gRPC call is made to `employee-service` and `leave-service`. For 1,000 employees, this is 2,000 serial gRPC calls per payroll run. No batching observed. |
| Redis rate limiter - single instance | MEDIUM | The gateway rate limiter uses a single Redis instance. No Redis Sentinel or Cluster configuration defined. A Redis failure disables rate limiting entirely. |
| `analytics-service` full-table aggregations | MEDIUM | Dashboard and trend reports aggregate over unbounded time ranges with no pagination or date limit. At scale, these queries will time out. |
| `audit-service` unbounded list query | MEDIUM | `GET /api/v1/audit` with default pagination queries all audit entries. At 1M+ rows (expected in a multi-tenant payroll system), this will be slow without composite indexes on `(tenant_id, created_at)`. |
| Distributed tracing absent | HIGH | Without tracing, identifying the slowest service in a 5-hop payroll calculation chain is impossible in production. |

### 8.2 What Is NOT Present

- No load tests (JMeter, Gatling, k6)
- No performance benchmarks for payroll calculation at scale (100, 1,000, 10,000 employees)
- No connection pool tuning documented (HikariCP defaults)
- No async/reactive processing for high-volume operations (payroll calculation is fully synchronous)
- No caching layer on compliance data (tax brackets fetched per calculation — good candidate for Redis caching)

### 8.3 Recommendations

1. **Batch gRPC calls in payroll calculation** — replace N individual `GetEmployee` calls with a `GetEmployeesBatch` RPC accepting a list of IDs.
2. **Cache compliance data** — tax brackets and statutory rates change infrequently; cache them in Redis with a 24-hour TTL.
3. **Add composite indexes** on `(tenant_id, created_at DESC)` in `audit-service` and `analytics-service`.
4. **Configure readiness probe** with a higher `initialDelaySeconds` for payroll-service (Spring Boot + Flyway startup is ~8-10s).
5. **Run k6 load test** against the full payroll approval flow before any production load.

---

## 9. Release Readiness Summary

### 9.1 Go/No-Go Recommendation

## ⛔ NO-GO

The application is not safe for production deployment. **11 critical blockers** must be resolved. The most dangerous are:
- Unauthenticated salary disbursement endpoint (CB-02)
- Unauthenticated audit trail (CB-01)
- Forgeable M-Pesa callback allowing fraudulent payment confirmation (CB-03)
- Runtime crash in employee-service (CB-06)
- Broken tenant onboarding (CB-07)
- Absent Kubernetes manifests and CI/CD pipeline (CB-11)

### 9.2 Issue Registry

**Critical (11) — Must fix before any production deployment:**

| # | Issue | Owner Area |
|---|-------|------------|
| CB-01 | `audit-service` + `notification-service` have no Spring Security | Backend Security |
| CB-02 | `integration-hub-service` salary disbursement unauthenticated | Backend Security |
| CB-03 | M-Pesa callback no source IP validation | Integration/Security |
| CB-04 | `X-Internal-Request` header forgeable | API Gateway |
| CB-05 | `PayrollController` no `@PreAuthorize` | Payroll Service |
| CB-06 | `TenantContext` not set in `employee-service` — runtime crash | Employee Service |
| CB-07 | `NoOpAuthServiceClient` — tenant provisioning broken | Tenant/Auth |
| CB-08 | Compliance audit TODO — statutory verification never runs | Compliance Service |
| CB-09 | KRA PIN duplicate validation missing | Employee Service |
| CB-10 | Manager self-approval of leave not prevented | Leave Service |
| CB-11 | Zero K8s manifests, zero CI/CD pipeline | DevOps |

**High (12) — Fix before first customer goes live:**
- SuperAdmin brute-force protection, `PayrollController` authorization, `TenantContext` gap in other services, Redis password in 11 services, hardcoded docker credentials, distributed tracing, structured logging, full-stack docker-compose, payroll period dedup fix, concurrent leave balance race, leave policy minimum validation, impersonation audit event

**Medium (14) — Fix within sprint 2 post-launch:**
- Employee PII access control, document download access control, notification cross-employee access, `format_sql` in base configs, `audit-service` config issues (port, baseline, show-details), Swagger public in prod, duplicate gateway filter bean, CRLF sanitization, payroll period year-conflict, `@PreAuthorize` SpEL fix, SwaggerUI in prod

**Low (8) — Fix before scale:**
- Centralized config server, gRPC mTLS, load tests, caching for compliance data, database indexes for audit/analytics, payslip download access control for employees, `.env.example`, no runbook for Flyway repair

---

## 10. Remediation Plan

### Sprint 1 — Critical Security & Stability (Week 1, ~5 days)

| Day | Task | Effort |
|-----|------|--------|
| 1 | Add Spring Security + `TrustedHeaderAuthFilter` to `audit-service`, `notification-service`, `integration-hub-service` | 4h |
| 1 | Add `@PreAuthorize` to all controllers in these 3 services | 2h |
| 1 | Add `TenantContextFilter` to `employee-service` (and audit `leave-service`, `document-service` for same gap) | 3h |
| 2 | Fix `X-Internal-Request` stripping in `JwtAuthenticationFilter` global filter | 2h |
| 2 | Add `@PreAuthorize` to `PayrollController` (all endpoints) | 2h |
| 2 | Implement M-Pesa source IP validation filter | 4h |
| 3 | Replace `NoOpAuthServiceClient` with real gRPC call to `auth-service` for user provisioning | 6h |
| 3 | Implement compliance audit logic in `PayrollEventListener` | 4h |
| 4 | Add KRA PIN uniqueness DB constraint + `existsByTenantIdAndKraPin` service check | 3h |
| 4 | Add manager self-approval prevention in `LeaveService.approve()` | 2h |
| 4 | Delete duplicate `SuperAdminAuthFilter` bean | 30m |
| 5 | Full regression test run — all 573 tests must pass | — |

### Sprint 2 — DevOps Foundation (Week 2, ~5 days)

| Day | Task | Effort |
|-----|------|--------|
| 1-2 | Write Kubernetes Deployments, Services, ConfigMaps for all 13 services | 2 days |
| 2 | Write resource limits, liveness/readiness probes, HPA for all services | 1 day |
| 3 | Create GitHub Actions CI pipeline: build → test → Checkstyle → Docker build/push | 4h |
| 3 | Add staging environment pipeline: CI → staging deploy on merge to main | 4h |
| 4 | Add `micrometer-tracing-bridge-brave` + `zipkin-reporter-brave` to all 13 services | 3h |
| 4 | Add `logback-spring.xml` with JSON (ECS/Logstash) encoder to all services | 4h |
| 5 | Fix all Medium config issues (format_sql, audit-service port/baseline/show-details, Redis passwords) | 3h |

### Sprint 3 — Authorization Hardening (Week 3, ~3 days)

| Task | Effort |
|------|--------|
| Add `@PreAuthorize` to `EmployeeController` (restrict PII to HR roles; employees see only own record) | 3h |
| Add `@PreAuthorize` to `DocumentController` (payslip download restricted to owner or HR) | 3h |
| Fix `@PreAuthorize` SpEL expression in `LeaveController` (`userId` vs `employeeId`) | 2h |
| Add brute-force protection to `SuperAdminAuthService.login()` | 3h |
| Disable Swagger/OpenAPI on production profile | 1h |
| Add CRLF sanitization to `tenant-service TrustedHeaderAuthFilter` | 1h |
| Add leave policy minimum validation (Kenyan Employment Act) | 3h |
| Fix payroll period deduplication to allow same period in new fiscal year | 2h |

### Sprint 4 — Performance & UAT Prep (Week 4, ~3 days)

| Task | Effort |
|------|--------|
| Add batched gRPC call for employee data in payroll calculation | 4h |
| Add Redis caching for compliance data (tax brackets, statutory rates) | 3h |
| Add composite indexes on `(tenant_id, created_at)` for audit and analytics | 2h |
| Write k6 load test for payroll approval flow | 4h |
| Full SIT execution (use Postman collection) | 1 day |
| UAT dry-run with stakeholders | 1 day |

### Estimated Total: 4 weeks to production-ready

With a focused engineering effort, the system can reach production readiness in 4 sprints. The application code quality is high — the work is primarily in security hardening, DevOps infrastructure, and two architecture stubs.

---

*Report generated: 2026-04-29 | AndikishaHR Pre-Production Review*  
*Coverage: 13 microservices, 573 tests, 40+ configuration files, all infrastructure definitions*
