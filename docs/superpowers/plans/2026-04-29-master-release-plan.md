# AndikishaHR — Master Release Plan

> Production release of AndikishaHR HR/Payroll SaaS platform targeting Kenyan SMEs.
> This document is the execution index. Implementation details are in the phase plans below.

---

## Phase Overview

| Phase | Plan File | Duration | Milestone | Status |
|-------|-----------|----------|-----------|--------|
| **Phase 1** | `2026-04-29-phase1-critical-security-stability.md` | 5 days | All 11 critical blockers resolved | ✅ DONE — `v0.9.0-security` |
| **Phase 2** | `2026-04-29-phase2-devops-infrastructure.md` | 5 days | K8s + CI/CD + tracing + logging | ✅ DONE — `v0.9.1-devops` |
| **Phase 3** | `2026-04-29-phase3-authorization-hardening.md` | 3 days | PII access, brute-force, config fixes | ✅ DONE — `v0.9.2-auth` |
| **Phase 4** | `2026-04-29-phase4-performance-uat.md` | 4 days | Load tests pass, SIT signed off, UAT ready | ✅ DONE — `v1.0.0-rc1` |

**Total:** ~17 working days (3.5 weeks) to production-ready

---

## Phase 1: Critical Security & Stability (Week 1)

**Goal:** The system must not crash, must not expose unauthenticated financial endpoints, and the core onboarding flow must work end-to-end.

| Task | Fix | CB # |
|------|-----|------|
| Task 1 | Add Spring Security to `audit-service`, `notification-service`, `integration-hub-service` | CB-01, CB-02 |
| Task 2 | Add `TenantContext` to `employee-service` filter (fix runtime crash) | CB-06 |
| Task 3 | Strip `X-Internal-Request` from inbound requests in api-gateway global filter | CB-04 |
| Task 4 | Add `@PreAuthorize` to `PayrollController` | CB-05 |
| Task 5 | Replace `NoOpAuthServiceClient` with real gRPC call (add `ProvisionTenantAdmin` RPC) | CB-07 |
| Task 6 | Implement compliance audit logic in `PayrollEventListener` | CB-08 |
| Task 7 | KRA PIN unique DB constraint + service-level duplicate check | CB-09 |
| Task 8 | Prevent manager self-approval in `LeaveService.approve()` | CB-10 |
| Task 9 | M-Pesa callback source IP validation filter | CB-03 |

**Exit criteria:** `./gradlew build` passes. Tenant provisioned via API logs in successfully. Employee creation returns 200. Payroll approve returns 403 for EMPLOYEE role.

**Git tag:** `v0.9.0-security`

---

## Phase 2: DevOps Infrastructure (Week 2)

**Goal:** The system must be deployable to Kubernetes and observable in production.

| Task | Deliverable |
|------|-------------|
| Task 10 | K8s base namespace, ConfigMap, Secret template, kustomization |
| Task 11 | K8s Deployments + Services + HPA for all 13 services (liveness, readiness probes, resource limits) |
| Task 12 | GitHub Actions CI: build → checkstyle → test → docker-build on every PR |
| Task 13 | GitHub Actions CD: staging auto-deploy on merge to master; production manual trigger |
| Task 14 | Distributed tracing: `micrometer-tracing-bridge-brave` + Zipkin config in all 13 services |
| Task 15 | Structured JSON logging: `logback-spring.xml` in all 13 services; `format_sql` moved to dev profile |
| Task 16 | Full-stack Docker Compose + `.env.example`; hardcoded credentials replaced with env-var substitution |

**Exit criteria:** `kubectl apply --dry-run=client` succeeds. CI pipeline runs in GitHub Actions. Zipkin receives spans from running services. Logs are JSON in `prod` profile.

**Git tag:** `v0.9.1-devops`

---

## Phase 3: Authorization Hardening (Week 3, days 1–3)

**Goal:** No employee can access another employee's data. No admin account is brute-forceable.

| Task | Fix |
|------|-----|
| Task 17 | `@PreAuthorize` on `EmployeeController` — list restricted to HR; getById allows self-access |
| Task 18 | `@PreAuthorize` on `DocumentController` — payslip downloads restricted to HR or owner |
| Task 19 | Fix `@PreAuthorize` SpEL `.equals()` vs `==` in `LeaveController` |
| Task 20 | Brute-force protection on `SuperAdminAuthService.login()` |
| Task 21 | Disable Swagger/OpenAPI in production by default |
| Task 22 | Fix 3 `audit-service` config issues (port, `show-details`, `baseline-on-migrate`) |
| Task 23 | Redis password in 11 services; RabbitMQ guest fallback removed; tenant-service CRLF sanitization |
| Task 24 | Leave policy minimum day validation (Kenyan Employment Act Cap 226) |
| Task 25 | Fix payroll period deduplication to allow same period in new fiscal year |

**Exit criteria:** Employee cannot GET `/api/v1/employees` — returns 403. Employee accessing own record returns 200. Leave policy with 5 days Annual returns 400. Jan 2026 payroll runs after Jan 2025 COMPLETED.

**Git tag:** `v0.9.2-auth`

---

## Phase 4: Performance, Load Testing & UAT (Week 3 days 4–5, Week 4)

**Goal:** System handles 50 concurrent users without timeout. SIT passes end-to-end. UAT checklist signed off.

| Task | Deliverable |
|------|-------------|
| Task 26 | Batch gRPC calls in payroll calculation (N×2000 calls → 2 calls for 1000 employees) |
| Task 27 | Redis caching for compliance data (tax brackets, statutory rates — 24h TTL) |
| Task 28 | Composite DB indexes for audit and analytics tables |
| Task 29 | k6 load tests: payroll flow + leave concurrent submission; p95 < 2s threshold |
| Task 30 | Full SIT using Postman collection; Newman CLI regression; UAT preparation checklist |

**Exit criteria:** k6 load test passes all thresholds. Newman SIT reports 0 failures. UAT checklist 10/10 items verified. Manual payroll calculation cross-check passes within KES 1.00 tolerance.

**Git tag:** `v1.0.0-rc1`

---

## Critical Path Dependencies

```
Phase 1 → Phase 2 (DevOps needs stable app)
Phase 1 → Phase 3 (Auth hardening builds on Spring Security from Phase 1)
Phase 2 → Phase 4 (Load tests need full-stack compose from Phase 2)
Phase 3 → Phase 4 (SIT tests authorization from Phase 3)

Tasks that can run in parallel:
- Task 2 (TenantContext fix) and Task 9 (M-Pesa IP) — independent services
- Tasks 10+11 (K8s) and Tasks 12+13 (CI/CD) — independent
- Tasks 26+27+28 (performance) all independent
```

---

## Issue Tracker — All Open Items

### Critical (Phase 1)
| ID | Service | Issue | Task |
|----|---------|-------|------|
| CB-01 | audit-service, notification-service | No Spring Security | Task 1 |
| CB-02 | integration-hub-service | No Spring Security, salary disbursement unauthenticated | Task 1 |
| CB-03 | integration-hub-service | M-Pesa callback no source IP validation | Task 9 |
| CB-04 | api-gateway | X-Internal-Request header forgeable | Task 3 |
| CB-05 | payroll-service | PayrollController no @PreAuthorize | Task 4 |
| CB-06 | employee-service | TenantContext not set — runtime crash | Task 2 |
| CB-07 | tenant-service | NoOpAuthServiceClient — broken onboarding | Task 5 |
| CB-08 | compliance-service | PayrollEventListener compliance audit is TODO stub | Task 6 |
| CB-09 | employee-service | KRA PIN uniqueness not enforced | Task 7 |
| CB-10 | leave-service | Manager self-approval not prevented | Task 8 |
| CB-11 | infrastructure | Zero K8s manifests, zero CI/CD pipeline | Tasks 10-13 |

### High (Phase 1 & 2)
| ID | Issue | Task |
|----|-------|------|
| H-01 | format_sql in base config (dev-only setting in all profiles) | Task 15 |
| H-02 | Hardcoded credentials in docker-compose | Task 16 |
| H-03 | Redis unauthenticated in all services | Task 23 |
| H-04 | Distributed tracing unconfigured (Zipkin running, no spans) | Task 14 |
| H-05 | No structured logging (plain text not queryable in CloudWatch) | Task 15 |
| H-06 | SuperAdmin login no brute-force protection | Task 20 |
| H-07 | Payroll period dedup blocks same month in new year | Task 25 |

### Medium (Phase 3)
| ID | Issue | Task |
|----|-------|------|
| M-01 | Employee PII (salary, KRA PIN) exposed to all roles | Task 17 |
| M-02 | Document download no access control | Task 18 |
| M-03 | LeaveController @PreAuthorize SpEL broken (== vs .equals) | Task 19 |
| M-04 | Swagger/OpenAPI public in production | Task 21 |
| M-05 | audit-service 3 config issues (port, show-details, baseline-on-migrate) | Task 22 |
| M-06 | tenant-service filter CRLF sanitization missing | Task 23 |
| M-07 | Leave policy minimum days not enforced | Task 24 |
| M-08 | Duplicate SuperAdminAuthFilter beans in api-gateway | Task 1 |

### Performance (Phase 4)
| ID | Issue | Task |
|----|-------|------|
| P-01 | N+1 gRPC calls in payroll calculation (2000 calls for 1000 employees) | Task 26 |
| P-02 | Compliance data fetched from DB on every payroll calculation | Task 27 |
| P-03 | No composite indexes on audit/analytics tables | Task 28 |
| P-04 | No load tests | Task 29 |

---

## Definition of Done

Before the first production customer goes live, all of the following must be true:

- [ ] `./gradlew build` passes with zero failures
- [ ] All 11 critical blockers (CB-01 through CB-11) resolved and verified by tests
- [ ] `kubectl apply --dry-run=client -R -f infrastructure/k8s/` succeeds
- [ ] GitHub Actions CI pipeline runs green on master
- [ ] Zipkin receives spans from at least 3 services in the staging environment
- [ ] k6 load test passes all thresholds (p95 < 2s, error rate < 1%)
- [ ] Newman SIT reports 0 failures against the full Postman collection
- [ ] Manual payroll calculation for gross KES 120,000 matches system output within KES 1.00
- [ ] UAT checklist 10/10 items verified and signed off
- [ ] No CRITICAL or HIGH security findings unresolved
- [ ] Git tag `v1.0.0-rc1` created

---

*Plan created: 2026-04-29*  
*Based on: Pre-Production Review Report (`docs/Engineering/pre-production-review-2026-04-29.md`)*
