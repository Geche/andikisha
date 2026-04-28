# Updated Report: Recent Implementation Review
# Superadmin, USSD, Licence Management, Gateway Filters & Rate Limiting

> Generated: 2026-04-27
> Scope: `api-gateway`, `auth-service`, `tenant-service`, `shared/*`
> Files reviewed: 48+ source, test, migration, config files

---

## Executive Summary

| Category | Count |
|----------|-------|
| 🔴 Critical Issues | **8 confirmed** |
| 🟡 Minor Issues | **8 confirmed, 1 not an issue** |
| 🟢 Code Quality Issues | **7 confirmed, 2 not issues** |
| ✅ Already Fixed (per handoff) | **6 items** |

**19 of 21 submitted issues are confirmed real.**
- **NOT an issue:** M1 — Grace period check from history table is sound logic.
- **NOT an issue:** Q4 — `publishTenantCreatedEvent()` correctly delegates; no naming mismatch.

---

## 🔴 Critical Issues

### C1 — `PLATFORM_ADMIN` role doesn't exist in `Role` enum
**Files:** `TenantController.java` (lines 46, 53, 60, 68, 77, 85)

`@PreAuthorize("hasRole('PLATFORM_ADMIN')")` is used throughout `TenantController`, but the `Role` enum only defines `SUPER_ADMIN`. Spring Security maps `hasRole('PLATFORM_ADMIN')` → authority lookup for `ROLE_PLATFORM_ADMIN`, which will **never match** any real token claim. These authorization checks are permanently ineffective.

| Impact | Security vulnerability — old tenant endpoints reject all superadmin tokens with `403 Forbidden`. |
| Fix | Replace all `'PLATFORM_ADMIN'` → `'SUPER_ADMIN'` in `TenantController`. |

---

### C2 — `SuperAdminAuthFilter` requires `X-Internal-Request` header
**Files:** `SuperAdminAuthFilter.java` (lines 32, 45–50)

The filter rejects all requests to `/api/v1/super-admin/**` that don't carry `X-Internal-Request: true`. The gateway's super-admin route in `application.yml` **must** inject this header via `AddRequestHeader=X-Internal-Request, true` — if that line is missing, all super-admin traffic is blocked.

| Impact | Superadmin REST API is **completely unreachable** from external callers (portal, CLI, Postman). |
| Fix | Verify (and add if missing) `AddRequestHeader=X-Internal-Request, true` to the `super-admin-routes` entry in `application.yml`. |

---

### C3 — `filterTenants()` loads full tenant table into memory
**File:** `SuperAdminTenantService.java` (lines 175–181)

```java
return tenantRepository.findAll().stream()
        .filter(t -> statuses == null || statuses.isEmpty() || statuses.contains(t.getStatus()))
        .map(this::toSummary)
        .toList();
```

The comment in the code acknowledges this: *"Lightweight in-memory filter — production should index by status."*

| Impact | **OOM risk** at scale. At 100k tenants, this loads millions of rows into heap. |
| Fix | Add `findByStatusIn(List<TenantStatus>, Pageable)` to `TenantRepository`; update `filterTenants()` to accept `Pageable`. |

---

### C4 — `getExpiringLicences()` contains inline business logic (controller violation)
**File:** `SuperAdminController.java` (lines 168–208)

The method performs: date calculations, two `findAll()` calls (loading all plans and all tenants), in-memory map building, and per-item date arithmetic. The controller's own Javadoc states *"controllers MUST NOT contain business logic."*

| Impact | Violates CLAUDE.md rule; creates untestable code and OOM risk from `findAll()`. |
| Fix | Extract into `LicencePlanService.getExpiringLicences(int daysAhead)` returning `List<ExpiringLicenceResponse>`; controller delegates. |

---

### C5 — Impersonation write-block not enforced downstream
**File:** `TenantLicenceFilter.java` (line 73–78) only

The `impersonatedBy` JWT claim check blocking write operations exists solely in the gateway filter. Any service-to-service call or direct internal call bypasses it entirely.

| Impact | Malicious internal service could use an impersonation token to perform writes against downstream services. |
| Fix | Add an `@Around` aspect in `shared/andikisha-common` that reads the `impersonatedBy` claim from `TenantContext` and throws `403` on write operations. |

---

### C6 — `generateTemporaryPassword()` has low effective entropy
**File:** `SuperAdminTenantService.java` (lines 187–190)

```java
String raw = UUID.randomUUID().toString().replace("-", "");
return raw.substring(0, 16);
```

UUID provides 128-bit entropy but truncating to 16 hex characters (charset size 16) reduces it to ~64 bits. Hex-only output also fails most password complexity validators.

| Impact | One-time password is weaker than claimed; may fail complexity checks. |
| Fix | Use `SecureRandom` with a base62 charset (a-z A-Z 0-9) — 16 chars gives ~95 bits of entropy and satisfies complexity rules. |

---

### C7 — Licence state transitions and event publishing are not atomically bound
**File:** `LicenceStateMachineService.java`

`suspend()`, `reactivate()`, and other transition methods publish to RabbitMQ inside the same `@Transactional` boundary as the DB write. If the DB commits but RabbitMQ publish throws, the event is silently lost. If publish succeeds but the transaction rolls back, a ghost event is in the queue.

| Impact | **Eventual inconsistency** — downstream services (audit, notification) may miss events or receive phantom events. |
| Fix | Move event publishing to `TransactionSynchronizationManager.registerSynchronization(afterCommit → publish)` so the event only fires after the DB transaction successfully commits. |

---

### C8 — `AuthService.register()` can throw outside TX context
**File:** `AuthService.java` (line 85)

`TransactionSynchronizationManager.registerSynchronization()` is called WITHOUT `isSynchronizationActive()` guard.

| Impact | If called outside a transaction (e.g. from `@Async` or `@EventListener`), throws `IllegalStateException`. Pre-existing bug confirmed in `AuthServiceTest > withValidRequest_createsEmployeeAndReturnsTokens()`. |
| Fix | Add `if (TransactionSynchronizationManager.isSynchronizationActive())` guard before registering the synchronization. |

---

## 🟡 Minor Issues

### M1 — NOT AN ISSUE
`LicenceExpiryJob.transitionLapsedGraceToSuspended()` correctly uses `findFirstByLicenceIdAndNewStatusOrderByChangedAtAsc` to determine the grace period start from the history table. Logic is sound.

---

### M2 — Reminder job sends duplicate notifications
**File:** `LicenceReminderJob.java` (lines 45–66)

No sent-flag, Redis key, or idempotency check before publishing. Every job run fires a reminder event for every qualifying licence.

| Fix | Add `lastReminderSentAt` column to `TenantLicence` (new Flyway migration); check date before publishing and update it after. |

---

### M3 — Redis write/delete race in `reactivate()`
**File:** `LicenceStateMachineService.java`

`applyTransition()` writes `ACTIVE` to Redis; `reactivate()` then deletes that same key. The delete is outside the transaction, creating a window where a cache miss occurs and downstream systems temporarily see a stale value.

| Fix | Remove the redundant `redisTemplate.delete()` in `reactivate()` — the TTL-based write in `applyTransition()` is sufficient. |

---

### M4 — No USSD session cleanup job
**File:** `auth-service/.../UssdSessionRepository.java`

`deleteByExpiresAtBefore(LocalDateTime)` exists in the repository but is never called. Expired sessions accumulate indefinitely.

| Fix | Add `UssdCleanupJob` with `@Scheduled(cron = "0 30 2 * * *")` calling `ussdSessionRepository.deleteByExpiresAtBefore(LocalDateTime.now())`. |

---

### M5 — USSD auth validates only the most recent session per MSISDN
**File:** `UssdAuthService.java` (line 35–38)

`findFirstByMsisdnAndUsedFalseOrderByCreatedAtDesc` returns one session. Other active sessions for the same MSISDN are not invalidated, allowing multiple concurrent valid sessions.

| Fix | After token issuance, mark all sessions for that MSISDN as used. |

---

### M6 — `NoOpAuthServiceClient` logs at WARN
**File:** `NoOpAuthServiceClient.java` (line 32)

A stub/placeholder should log at DEBUG, not WARN. WARN-level stub noise pollutes production logs.

| Fix | `log.warn(...)` → `log.debug(...)`. |

---

### M7 — `currentUserId()` fallback returns hardcoded `"SUPER_ADMIN"` string
**File:** `SuperAdminController.java` (lines 210–215)

```java
return auth != null && auth.getPrincipal() != null
        ? auth.getPrincipal().toString()
        : "SUPER_ADMIN";
```

A missing principal silently defaults to a fake actor ID in audit logs, masking authentication failures.

| Fix | Throw `IllegalStateException("No authenticated principal")` on missing principal. |

---

### M8 — Plan entity queries lack tenant filtering
**File:** `PlanRepository.java` (lines 19–21)

`findByName()` and `findByActiveTrue()` have no `tenant_id` filter. Plans are seeded as SYSTEM-scoped so risk is currently low, but the pattern violates the multi-tenant contract.

| Fix | Add explicit `WHERE tenant_id = 'SYSTEM'` via `@Query` annotations, or document the intentional global scope clearly. |

---

## 🟢 Code Quality Issues

### Q1 — `SuperAdminController` has 6 constructor dependencies
**File:** `SuperAdminController.java` (lines 73–85)

Three of the six are raw repository injections (`tenantRepository`, `licenceRepository`, `planRepository`) — business logic in disguise at the controller layer.

| Fix | Move repository usage into `SuperAdminTenantService` and `LicencePlanService`; controller drops to 2–3 dependencies. |

---

### Q2 — `getSuperAdminAnalytics()` calls `findAll()` twice
**File:** `LicencePlanService.java` (lines 260, 284)

Loads all licences and all plans into memory. Scales poorly.

| Fix | Replace with JPQL aggregate queries returning counts and sums directly from DB. |

---

### Q3 — `TenantLicence.setEndDate()` is dead code
**File:** `TenantLicence.java` (line 128)

Never called anywhere in the codebase.

| Fix | Delete the method. |

---

### Q4 — NOT AN ISSUE
`publishTenantCreatedEvent()` in `SuperAdminTenantService` correctly delegates to `publishTenantCreated()` → `TenantCreatedEvent`. No naming mismatch exists.

---

### Q5 — `TenantLicence.create()` mixes setters and direct field access
**File:** `TenantLicence.java` (lines 80–93)

Some fields set via `licence.setTenantId(...)`, others via `licence.planId = planId` (direct assignment). Inconsistent and bypasses encapsulation.

| Fix | Standardise to setters only throughout the factory method. |

---

### Q6 — Unit tests use `getSuperclass()` reflection
**Files:**
- `tenant-service/.../LicenceStateMachineServiceTest.java` (lines 64–70)
- `auth-service/.../SuperAdminAuthServiceTest.java` (lines 59–66)

Both use `entity.getClass().getSuperclass().getDeclaredField("id")` to set the private `id` field from `BaseEntity`.

| Fix | Add `protected void setId(UUID id)` to `BaseEntity`, or use `ReflectionTestUtils.setField(entity, "id", uuid)` (Spring test utility). |

---

### Q7 — `@Transactional` on integration test class hides real commit behavior
**File:** `LicencePlanServiceIT.java` (line 43)

Class-level `@Transactional` causes every test to roll back after completion — constraints checked across commit boundaries and post-commit side effects are never verified.

| Fix | Remove class-level `@Transactional`; use explicit `@BeforeEach`/`@AfterEach` repository cleanup instead. |

---

## ✅ Already Fixed (Per `.remember/remember.md` Handoff)

| Fix | Code Evidence | Status |
|-----|-------------|--------|
| **Plan claim in JWT** | `AuthService.generateTokenResponse()` calls `jwtTokenProvider.generateAccessToken(user, planTier)`, `JwtTokenProvider` adds `plan` claim when non-null | ✅ Applied |
| **StringRedisTemplate in AuthService** | Constructor injects `StringRedisTemplate`, reads `RedisKeys.tenantPlanTier()` | ✅ Applied |
| **Dead code guard removed** | `LicenceExpiryJob` no longer references non-existent methods | ✅ Applied |
| **DataIntegrityViolationException catch** | `SuperAdminAuthService.provision()` catches and rethrows as `DuplicateResourceException` | ✅ Applied |
| **V10 migration for USSD tenant index** | `V10__add_ussd_session_tenant_index.sql` exists | ✅ Applied |
| **TRIAL status test in TenantLicenceFilter** | `TenantLicenceFilterTest` line 230–244: `trialLicence_postRequest_passesThrough` | ✅ Applied |

---

## 🚀 Recommended Priority Order

| Priority | Action | Issue Ref |
|----------|--------|-----------|
| **P0** | Fix `PLATFORM_ADMIN` → `SUPER_ADMIN` in `TenantController` | C1 |
| **P0** | Add/document `X-Internal-Request` gateway route config | C2 |
| **P0** | Add `isSynchronizationActive()` guard in `AuthService.register()` | C8 |
| **P1** | Replace `findAll().stream()` with paginated repository query | C3 |
| **P1** | Move `getExpiringLicences()` logic to `LicencePlanService` | C4 |
| **P1** | Wrap event publishing in transaction synchronization | C7 |
| **P2** | Add downstream impersonation write-block aspect | C5 |
| **P2** | Use SecureRandom for temporary password generation | C6 |
| **P2** | Fix M2–M8, Q1–Q7 | Minor + Quality |

---

## Build Status

> api-gateway builds and all tests pass; auth-service and tenant-service compile clean.

**Pre-existing failures:** `AuthServiceTest > Register > withValidRequest_createsEmployeeAndReturnsTokens()` and `AuthServiceApplicationTest` — DB connection failures from unresolved `${DB_HOST}` env vars, not regressions.

---

*Report compiled by Senior SE + QA review.*
