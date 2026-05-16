# Payroll → Disbursement E2E Testing Guide

Verified 2026-05-16. Run this test sequence before merging any change to payroll-service or integration-hub-service.

---

## Services required

| Service | Port | Start command |
|---|---|---|
| andikisha-postgres-payroll | 5436 | `docker-compose up -d` |
| andikisha-postgres-integration | 5442 | `docker-compose up -d` |
| andikisha-rabbitmq | 5672 / 15672 | `docker-compose up -d` |
| payroll-service | 8084 | `./gradlew :services:payroll-service:bootRun --args='--spring.profiles.active=dev'` |
| integration-hub-service | 8090 | see below |

Redis licence cache must be seeded after each Docker restart:

```bash
docker exec andikisha-redis redis-cli -a changeme \
  SET "licence:status:1cc12430-7c3a-45b7-8973-469622778c9d" "TRIAL" EX 3600
```

### Starting integration-hub for testing

**Normal mode** (all payments succeed):
```bash
SPRING_PROFILES_ACTIVE=dev SPRING_DEVTOOLS_RESTART_ENABLED=false \
  ./gradlew :services:integration-hub-service:bootRun
```

**Partial failure mode** (payments with `+254` prefix fail):
```bash
SPRING_PROFILES_ACTIVE=dev SPRING_DEVTOOLS_RESTART_ENABLED=false \
  APP_MPESA_SANDBOX_FAIL_PHONE_PREFIX=+254 \
  ./gradlew :services:integration-hub-service:bootRun
```

`SPRING_DEVTOOLS_RESTART_ENABLED=false` is mandatory. DevTools triggers two JVM restarts during `compileJava` (one for class deletions, one for class additions). If the approval event lands between restarts it is consumed without being processed, silently disappearing.

---

## Auth: calling services directly

payroll-service and integration-hub-service authenticate via trusted headers set by the API gateway. In dev, pass headers directly:

```bash
TENANT="1cc12430-7c3a-45b7-8973-469622778c9d"

curl -X POST "http://localhost:8084/api/v1/payroll/runs" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: test-admin" \
  -H "X-User-Role: ADMIN" \
  -H "X-Tenant-ID: $TENANT" \
  -d '{"period":"YYYY-MM","payFrequency":"MONTHLY"}'
```

---

## Sandbox M-Pesa behaviour

`SandboxMpesaClient` routes on `app.mpesa.sandbox.fail-phone-prefix`:

| Phone format | Behaviour |
|---|---|
| `07XXXXXXXX` (local Safaricom) | **COMPLETED** — returns `AG_<uuid>` conversation ID, status `0 / Success` |
| `+254XXXXXXXXX` (international) | **FAILED** when prefix matches `APP_MPESA_SANDBOX_FAIL_PHONE_PREFIX` — returns code `F2 / Insufficient funds - test failure` |

The demo dataset has:
- **24 employees** with `07xx` local format → always succeed
- **4 employees** with `+254` international format → fail when prefix is `+254`:
  - Brian Ochieng: `+254722100200`
  - Jane Wanjiru (3 records): `+254711222333`, `+254711222334`, `+254711222335`

This allows testing partial failure without modifying any data.

---

## Full E2E test: all payments succeed

```bash
TENANT="1cc12430-7c3a-45b7-8973-469622778c9d"
H="-H X-User-ID:test-admin -H X-User-Role:ADMIN -H X-Tenant-ID:$TENANT"

# 1. Create run
RUN_ID=$(curl -s -X POST http://localhost:8084/api/v1/payroll/runs \
  -H "Content-Type: application/json" $H \
  -d '{"period":"2028-02","payFrequency":"MONTHLY"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")

# 2. Calculate
curl -s -X POST "http://localhost:8084/api/v1/payroll/runs/$RUN_ID/calculate" $H

# 3. Approve
curl -s -X POST "http://localhost:8084/api/v1/payroll/runs/$RUN_ID/approve" $H

# 4. Disburse
curl -s -X POST "http://localhost:8090/api/v1/payments/payroll-runs/$RUN_ID/disburse" $H

# 5. Wait ~5s, then verify
sleep 5
curl -s "http://localhost:8090/api/v1/payments/payroll-runs/$RUN_ID/summary" $H
# Expected: {"totalTransactions":28,"completed":28,"failed":0,...}

curl -s "http://localhost:8084/api/v1/payroll/runs/$RUN_ID" $H | python3 -c \
  "import sys,json; r=json.load(sys.stdin); print(r['status'], r.get('completedAt'))"
# Expected: COMPLETED <timestamp>
```

---

## Full E2E test: partial failure + retry

```bash
# Start integration-hub with: APP_MPESA_SANDBOX_FAIL_PHONE_PREFIX=+254

TENANT="1cc12430-7c3a-45b7-8973-469622778c9d"

# Steps 1-4 same as above (create, calculate, approve, disburse)

# After disbursement completes (~5s):
curl -s "http://localhost:8090/api/v1/payments/payroll-runs/$RUN_ID/summary" \
  -H "X-User-ID: test-admin" -H "X-User-Role: ADMIN" -H "X-Tenant-ID: $TENANT"
# Expected: {"totalTransactions":28,"completed":24,"failed":4,"pending":0,...}

# Payroll run still reaches COMPLETED (partial failures do not block run completion)
curl -s "http://localhost:8084/api/v1/payroll/runs/$RUN_ID" \
  -H "X-User-ID: test-admin" -H "X-User-Role: ADMIN" -H "X-Tenant-ID: $TENANT" | \
  python3 -c "import sys,json; r=json.load(sys.stdin); print(r['status'])"
# Expected: COMPLETED

# View failed transactions
curl -s "http://localhost:8090/api/v1/payments/payroll-runs/$RUN_ID" \
  -H "X-User-ID: test-admin" -H "X-User-Role: ADMIN" -H "X-Tenant-ID: $TENANT" | \
  python3 -c "
import sys,json
txns=json.load(sys.stdin)
for t in txns:
  if t['status']=='FAILED':
    print(t['employeeName'], t['phoneNumber'], t['errorCode'])
"
# Expected: Brian Ochieng +254722100200 F2, 3× Jane Wanjiru +254711222xxx F2

# Retry (restart integration-hub WITHOUT the fail prefix first)
curl -s -X POST "http://localhost:8090/api/v1/payments/payroll-runs/$RUN_ID/retry-failed" \
  -H "X-User-ID: test-admin" -H "X-User-Role: ADMIN" -H "X-Tenant-ID: $TENANT"
sleep 5

# Verify all 28 completed, run still COMPLETED (idempotent guard)
curl -s "http://localhost:8090/api/v1/payments/payroll-runs/$RUN_ID/summary" \
  -H "X-User-ID: test-admin" -H "X-User-Role: ADMIN" -H "X-Tenant-ID: $TENANT"
# Expected: {"totalTransactions":28,"completed":28,"failed":0,...}
```

---

## What to verify

| Assertion | Why it matters |
|---|---|
| Run reaches COMPLETED even when N of M payments fail | `maybePublishRunCompleted()` fires when `completed + failed == total`, not only when all succeed |
| `PaymentsCompletedEvent` fires exactly once despite concurrent threads | `TransactionSynchronization.afterCommit()` + `PROPAGATION_REQUIRES_NEW` count query |
| Run stays COMPLETED after retry (completedAt not overwritten) | `PayrollRun.complete()` idempotency guard |
| Retry changes FAILED → COMPLETED, leaves COMPLETED untouched | `retryFailed()` only re-queues FAILED transactions |

---

## Bugs found during 2026-05-16 verification

These were production-path bugs that unit tests did not catch. The integration test coverage task is tracked in `docs/backlog/BACKLOG.md` as PAYROLL-BACKLOG-003.

### 1. `publishAfterCommit()` double-registration (payroll-service)

**File:** `PayrollService.java`  
**Symptom:** `PayrollApprovedEvent` was never published to RabbitMQ after `approve()`.  
**Root cause:** `publishAfterCommit()` wrapped the publisher call in `TransactionSynchronizationManager.registerSynchronization()`. The publisher's own `sendAfterCommit()` also registers a synchronization. Spring's `triggerAfterCommit()` takes an immutable snapshot of the synchronization list before iterating — any synchronization registered *during* an `afterCommit()` callback goes into the live set but not the snapshot, so it is silently never called.  
**Fix:** `publishAfterCommit()` now calls `publishAction.run()` directly; the publisher handles its own deferral.

### 2. `TypePrecedence.INFERRED` — classloader mismatch (integration-hub)

**File:** `RabbitMqConfig.java`  
**Symptom:** `PayrollEventListener.onPayrollApproved()` never executed even though RabbitMQ showed the message consumed.  
**Root cause:** Spring DevTools uses two classloaders (base + restart). When payroll-service published `PayrollApprovedEvent`, it set the `__TypeId__` AMQP header to the fully qualified class name. Integration-hub's `Jackson2JsonMessageConverter` tried to resolve that class name using the *restart* classloader, which loaded a different instance of the class than the one in the listener's parameter type. The type check failed silently and the message was not delivered to the method.  
**Fix:** `TypePrecedence.INFERRED` tells the converter to use the listener method's parameter type rather than the header. Safe in production because every queue in this system receives a single message type.

### 3. Race condition in `maybePublishRunCompleted()` (integration-hub)

**File:** `PaymentProcessor.java`  
**Symptom:** With 28 concurrent payment threads, run stayed APPROVED — `PaymentsCompletedEvent` was never published.  
**Root cause:** Each payment thread called `countByTenantIdAndPayrollRunIdAndStatus()` within its own `@Transactional` method before committing. Each thread saw its own row as committed, but not the other 27. Every thread counted (n-1) completed rows, none reached the threshold of `completed + failed == total`.  
**Fix:** Register a `TransactionSynchronization.afterCommit()` hook that runs the count in a `PROPAGATION_REQUIRES_NEW` transaction. By the time `afterCommit()` fires, all concurrent saves are committed and visible.

### 4. `PayrollRun.complete()` not idempotent (payroll-service)

**File:** `PayrollRun.java`  
**Symptom:** `BusinessRuleException: Can only complete an APPROVED or PROCESSING payroll` thrown when retrying payments on an already-COMPLETED run.  
**Root cause:** Under concurrent sandbox conditions, `PaymentsCompletedEvent` can be published more than once (two payment threads both reach the count threshold within the same commit window despite the `afterCommit` deferral). The `complete()` method threw on the second call.  
**Fix:** Added an early return if `status == COMPLETED`.
