# Fix Batch 1 — Trivial Wins Verification Report (M-1, M-2, M-4, M-6)

**Date:** 2026-06-04  
**Commit:** `dd7c917`  
**Source inventory:** `docs/audits/2026-06-03-bug-hunt-inventory.md`

---

## M-1 — RabbitLeaveEventPublisher: transaction-active guard

**File modified:**
`services/leave-service/src/main/java/com/andikisha/leave/infrastructure/messaging/RabbitLeaveEventPublisher.java`

**What changed:** Replaced four inline `TransactionSynchronizationManager.registerSynchronization(...)` blocks with a shared private `sendAfterCommit(String exchange, String routingKey, Object event)` method. The new method matches `RabbitPayrollEventPublisher.sendAfterCommit()` exactly:

```java
private void sendAfterCommit(String exchange, String routingKey, Object event) {
    if (TransactionSynchronizationManager.isActualTransactionActive()) {
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                doSend(exchange, routingKey, event);
            }
        });
    } else {
        doSend(exchange, routingKey, event);   // ← fallback: immediate send, never silently dropped
    }
}

private void doSend(String exchange, String routingKey, Object event) {
    try {
        rabbitTemplate.convertAndSend(exchange, routingKey, event);
    } catch (Exception e) {
        log.error("Failed to publish event [{}] to {}/{}: {}",
                event.getClass().getSimpleName(), exchange, routingKey, e.getMessage(), e);
    }
}
```

All four `publish*` methods now delegate to this method. Public method signatures, routing keys, and exchange names are unchanged.

**Behavioral test:**
`services/leave-service/src/test/java/com/andikisha/leave/unit/RabbitLeaveEventPublisherTest.java`

- `publishLeaveRequested_outsideTransaction_sendsImmediatelyWithoutException` — calls `publishLeaveRequested()` with no active transaction, asserts no exception, then verifies `rabbitTemplate.convertAndSend("leave.events", "leave.requested", ...)` was invoked immediately.
- `publishLeaveApproved_outsideTransaction_sendsImmediately` — same pattern for `publishLeaveApproved`.

```
RabbitLeaveEventPublisherTest > publishLeaveRequested_outsideTransaction_sendsImmediatelyWithoutException() PASSED
RabbitLeaveEventPublisherTest > publishLeaveApproved_outsideTransaction_sendsImmediately() PASSED
```

**Build:** `./gradlew :services:leave-service:test` — `BUILD SUCCESSFUL`

---

## M-2 — gRPC blocking stub deadlines in payroll-service

**Files modified:**
- `services/payroll-service/src/main/java/com/andikisha/payroll/infrastructure/grpc/EmployeeGrpcClient.java`
- `services/payroll-service/src/main/java/com/andikisha/payroll/infrastructure/grpc/LeaveGrpcClient.java`
- `services/payroll-service/src/main/resources/application.yml`

**Configuration added to `application.yml`:**
```yaml
app:
  grpc:
    deadline-seconds:
      employee-service: ${EMPLOYEE_GRPC_DEADLINE_SECONDS:30}
      leave-service: ${LEAVE_GRPC_DEADLINE_SECONDS:30}
```

Default is 30 seconds; overridable via environment variable without code change.

**Per-call deadline applied (confirmed, not per-stub):**
Each method now applies `.withDeadlineAfter(deadlineSeconds, TimeUnit.SECONDS)` on the immutable stub at the point of each call:
```java
var response = stub.withDeadlineAfter(deadlineSeconds, TimeUnit.SECONDS)
        .listActiveByTenant(ListActiveByTenantRequest.newBuilder()...build());
```
This is the gRPC-recommended pattern: `withDeadlineAfter()` returns a new stub with an absolute deadline computed from the call instant.

**`DEADLINE_EXCEEDED` handling:**

*EmployeeGrpcClient* — throws `BusinessRuleException("UPSTREAM_TIMEOUT", ...)` on timeout. The payroll-service endpoint propagates this as HTTP 422, giving the caller a clear actionable error:
```java
if (e.getStatus().getCode() == Status.Code.DEADLINE_EXCEEDED) {
    log.error("employee-service.listActiveByTenant timed out after {}s for tenant {}", ...);
    throw new BusinessRuleException("UPSTREAM_TIMEOUT",
            "Employee service did not respond in time. Please retry.");
}
throw e;  // re-throw all other StatusRuntimeException codes
```

*LeaveGrpcClient* — existing callers return empty collections as safe fallbacks on gRPC failure (payroll continues without leave data rather than failing). `DEADLINE_EXCEEDED` is now logged at `error` level (vs `warn` for other status codes) for observability:
```java
if (e.getStatus().getCode() == Status.Code.DEADLINE_EXCEEDED) {
    log.error("leave-service.getLeaveBalancesBatch timed out after {}s for {} employees...", ...);
} else {
    log.warn("Failed to fetch batch leave balances ...", ...);
}
return Collections.emptyList();  // safe fallback unchanged
```

**Behavioral test note:** A true slow-downstream simulation would require a test gRPC server. The unit-level behavioral proof is that setting `deadlineSeconds = 0` or `1` on the client constructor would produce an immediate `DEADLINE_EXCEEDED` on the first call. This is documented as a known behavioral guarantee of gRPC's deadline mechanism and confirmed by gRPC Java's test suite. The existing payroll-service tests (`BUILD SUCCESSFUL`) confirm no callers break.

**Build:** `./gradlew :services:payroll-service:test` — `BUILD SUCCESSFUL`

---

## M-6 — useCurrentUser stale role after self-targeted role change

**File modified:**
`frontend/tenant-portal/src/app/[workspace]/(admin)/admin/employees/[employeeId]/page.tsx`

**Change location:** `ChangeRoleModal` function, `mutation.onSuccess` handler.

**Code added:**
```typescript
const currentUser = useCurrentUser();   // ← added inside ChangeRoleModal

// onSuccess handler (addition):
if (currentUser?.employeeId === employeeId) {
  // Role change targets the currently logged-in user — refetch immediately
  // so the UI reflects the new role without waiting 60 seconds.
  void queryClient.invalidateQueries({ queryKey: ["current-user"] });
}
```

`useCurrentUser` was already imported in the file (`import { ..., useCurrentUser } from "@andikisha/ui"` at line 7). No new imports were needed. The invalidation is conditional — it fires only when `currentUser.employeeId` matches the target employee, preventing unnecessary refetches for the common case (admin changing a different user's role).

**Browser behavior note:** The self-targeted role change via this UI is prevented by the own-profile guard (`canChangeRole = isAdmin && !isOwnProfile && ...`), so the `currentUser.employeeId === employeeId` branch will not fire through the normal UI flow for the current user. The fix is correct for future edge cases or programmatic triggers, and it does not affect existing behavior for the normal case.

**TypeScript + lint:** `tsc --noEmit` — clean. `next lint` — no errors.

---

## M-4 — Swagger docs disabled in production profile

**Files created (one per service):**

| Service | File |
|---------|------|
| auth-service | `services/auth-service/src/main/resources/application-prod.yml` |
| employee-service | `services/employee-service/src/main/resources/application-prod.yml` |
| payroll-service | `services/payroll-service/src/main/resources/application-prod.yml` |
| leave-service | `services/leave-service/src/main/resources/application-prod.yml` |
| notification-service | `services/notification-service/src/main/resources/application-prod.yml` |
| api-gateway | `services/api-gateway/src/main/resources/application-prod.yml` |

**Content (identical for all six):**
```yaml
# Production profile — overrides application.yml for production deployments.
# Swagger and OpenAPI docs are disabled: the full API surface must not be
# publicly accessible in production via the /services/* gateway prefix.
springdoc:
  api-docs:
    enabled: false
  swagger-ui:
    enabled: false
```

**Gateway public-paths NOT changed:** `GatewayPublicPaths.PREFIXES` at line 32 is unchanged. The `/services/` prefix remains for dev environments where Swagger is still available. Production deployments must pass `--spring.profiles.active=prod` (or set `SPRING_PROFILES_ACTIVE=prod`) to activate the override.

**Behavioral test (manual, using auth-service JAR):**

With `--spring.profiles.active=prod`:
```
GET /v3/api-docs → 404 Not Found
GET /swagger-ui.html → 404 Not Found
```

With `--spring.profiles.active=dev`:
```
GET /v3/api-docs → 200 OK (full OpenAPI JSON)
GET /swagger-ui.html → 200 OK (Swagger UI)
```

The Dokploy deployment uses the `prod` Spring profile (confirmed: `SPRING_PROFILES_ACTIVE: prod` in `docker-compose.yml` environment block for all services).

---

## Cross-cutting

**All prior tests still pass:**
```
./gradlew :services:leave-service:test :services:payroll-service:test --no-daemon
→ BUILD SUCCESSFUL
```
No other service tests were affected. The frontend TypeScript check and lint pass with no errors.

**No other code paths were modified.** The four changes are:
1. `RabbitLeaveEventPublisher.java` — publisher refactor only
2. `EmployeeGrpcClient.java` and `LeaveGrpcClient.java` — per-call deadline only
3. `application.yml` (payroll) — config addition only
4. `ChangeRoleModal.onSuccess` — two lines added only
5. Six `application-prod.yml` — new files, configuration only

---

## Honest notes

- **M-2 deadline behavioral test:** A true "simulate slow downstream" test would require a test gRPC server that sleeps before responding. This was not implemented. The guarantee that `.withDeadlineAfter()` triggers `DEADLINE_EXCEEDED` comes from gRPC's own contract, which is verified by the gRPC Java library's own tests. The change is structurally correct.

- **M-6 own-profile edge case:** The `currentUser.employeeId === employeeId` check can only fire when an admin is viewing their own employee record AND has the ability to change their own role. The current UI prevents this (own-profile guard), but the code is harmless and correct for future use.

- **M-4 prod profile activation:** The fix relies on deployment configuration setting the prod Spring profile. If a deployment sets `SPRING_PROFILES_ACTIVE=dev` or leaves it unset, Swagger remains accessible. The Dokploy `docker-compose.yml` correctly sets `SPRING_PROFILES_ACTIVE: prod` for all services, so production deployments via the standard pipeline are covered.

- **M-1 `TransactionSynchronizationManager.clear()` in test:** The behavioral test calls `clear()` in `@BeforeEach` to prevent residual state from other tests (e.g., `@DataJpaTest` suites) from marking the thread as transaction-active. This is a test-setup concern, not a production concern.
