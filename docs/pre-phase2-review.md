# Pre-Phase-2 Readiness Review

**Date:** 2026-05-07 | **Reviewer:** Claude Code deep-review agent

---

## Hard Stoppers (fix before any Phase 2 work)

| ID | Area | Issue |
|----|------|-------|
| TENANT-001 | Security | `POST /api/v1/tenants` has no `@PreAuthorize` — any authenticated user can create top-level tenants |
| GRPC-003 | Correctness | Unpaid-leave deduction reads cumulative YTD `used` — double-deducts every month after the first |
| SCHEMA-001 | Data | PayrollRun full UNIQUE constraint blocks retry after FAILED run — (**FIXED in V5 migration**) |
| SHARED-003 | Config | tenant-service, payroll-service, leave-service don't scan `com.andikisha.common` — GlobalExceptionHandler not registered, all errors return 500 |
| SEC-001 | Security | `POST /api/v1/auth/super-admin/provision` is wide open to internet traffic |
| SEC-002 | Observability | `userId` never written to MDC in TrustedHeaderAuthFilter across all services — `%X{userId:-}` always empty in logs |
| ROUTE-001 | Config | Gateway declares routes for expense/recruitment/performance/asset services that don't exist — all return 503 |

> **Correction (2026-07-17, Run R1 Phase A audit):** ROUTE-001 is stale — the current api-gateway/application.yml declares no recruitment/expense/performance/asset routes; Run R1 W1 adds the recruitment route (`/api/v1/recruitment/**`) as the first such route. See docs/decisions/2026-07-17-release-02-resequencing-recruitment-first.md.

## Major (fix before Phase 2 ships)

| ID | Area | Issue |
|----|------|-------|
| GRPC-002 | Resilience | `LeaveGrpcClient.getLeaveBalancesBatch` has no try/catch — payroll halts if leave-service is down |
| RABBIT-001 | Messaging | Two tenant event exchanges coexist with no migration plan |
| RABBIT-002 | Messaging | `attendance` queue declares DLX `dlx.attendance` but that exchange is never declared — dead messages silently dropped |
| DTO-003 | Contract | `PaySlipResponse` proto has payment fields (`mpesa_receipt`, `bank_*`) with no DB columns — produces empty strings |
| STARTUP-003 | Phase 2 | Compliance-service appears to be an empty scaffold |
| TENANT-002 | Auth | Tenant ADMIN cannot read their own tenant record (SUPER_ADMIN only) |
| EMP-002 | Feature | No DELETE/archive for departments — Phase 2 will create dangling department references |
| CFG-001 | Config | LeaveServiceApplication missing `scanBasePackages` and `@EnableScheduling` |
| SEC-003 | Security | `enforceAttendanceOwnership` allows null auth — dead code but risky |
| ADMIN-PROV | Correctness | `createTenantWithLicence` swallows auth-service gRPC failure silently — tenant created with no admin user |

## Minor

| ID | Issue |
|----|-------|
| SHARED-002 | `GlobalExceptionHandler` missing `ConstraintViolationException` handler — `@PathVariable @Pattern(...)` returns 500 |
| SHARED-003-NOTE | BaseEntity `hashCode()` always returns `getClass().hashCode()` for transient entities |
| PAYROLL-CTRL-001 | `@RequestHeader("X-Tenant-ID")` params in PayrollController are dead code — never used |
| ROUTE-002 | `/api/v1/tenants/**` gateway route has no SuperAdminAuthFilter |
| DTO-001 | gRPC `email` defaults to `""` instead of null — downstream blank-check risk |
| DTO-002 | `PaySlipDetail` proto (19 fields) has drifted from `PaySlipResponse` record (27 fields) |
| EMP-001 | `getById` returns full `EmployeeDetailResponse` (includes `nationalId`, `kraPin`) to self-viewing employees |
| LEAVE-001 | Leave `days` field is user-supplied — server doesn't recompute from start/end dates |
| TEST-001 | No test for `provision()` race window (save-on-duplicate) |
| TEST-002 | No test for `calculate()` with `basicPay=0` |
| SCHEMA-004 | `payslip` payrollRun join is lazy — N+1 risk on payslip history page |
| SEC-REFRESH | No stolen-refresh-token alarm (revoked token reuse doesn't trigger session wipe) |

## Already Fixed (this session)
- SCHEMA-001: V5 partial unique index deployed
- analytics/attendance SecurityConfig missing
- IDOR on attendance endpoints
- CredentialEncryptor silent plaintext fallback
- MpesaSourceIpFilter X-Forwarded-For bypass
- TenantContext ThreadLocal → InheritableThreadLocal
- NITA levy missing
- Log pattern missing tenantId/userId (yml fixed, but MDC.put("userId") still missing — SEC-002)
- RabbitMQ prefetch
- Gateway public-path drift
- Role MANAGER/LINE_MANAGER drift
- @PreAuthorize missing on Department + FeatureFlag writes
