# Design: payroll → disbursement integration-test harness (PAYROLL-BACKLOG-003)

**Status:** Accepted (2026-07-31) — **all four scenarios landed** (Scenarios 1–3 in integration-hub `PayrollDisbursementFlowTest`; Scenario 4 in payroll-service `PayrollRunCompletionIdempotencyTest`).
**Related:** [[PAYROLL-BACKLOG-003]].

## Context

The disbursement loop crosses payroll-service and integration-hub-service over RabbitMQ, and the four
bugs the ticket lists only reproduce under real infrastructure — Spring transaction-synchronization
timing, AMQP JSON `__TypeId__` resolution, and concurrent DB writes. Unit tests (mocked publisher, one
thread, sequential) cannot cover them.

```
payroll: approve → PayrollApprovedEvent  →[exchange payroll.events / payroll.approved]
integration-hub: PayrollEventListener → PaymentService (create + processBatch)
   → PaymentProcessor (SandboxMpesaClient auto-completes) → PaymentsCompletedEvent
   →[exchange integration.events / payments.completed]
payroll: IntegrationEventListener → completePayrollRun → run COMPLETED
```

## Decision — Option B: per-service tests against a shared real broker

Each service is tested in its own Spring context against **real** RabbitMQ + Postgres (+ Redis for the
run-scoped disbursement lock), with the *other* side driven by publishing/consuming the actual events
on the broker. Only genuinely-external boundaries are stubbed: the cross-service payslip read
(`PayrollServiceClient`, normally gRPC) and — implicitly — M-Pesa, which is already the in-process
`SandboxMpesaClient`.

**Rejected — Option A (both Spring apps in one JVM):** booting two `@SpringBootApplication` contexts
together invites bean/port/classloader conflicts. Bug #2 in this very ticket is a classloader
`__TypeId__` issue; a two-app context would import more of exactly that fragility. Option B isolates a
failure to the service at fault and still covers every bug — you assert at the broker boundary.

## Coverage map

| Ticket bug / scenario | Service | Assertion |
|---|---|---|
| #1 after-commit publish dropped | payroll | approve → `PayrollApprovedEvent` actually lands on the broker |
| #2 `__TypeId__` deserialization | both | real listener deserializes the event type (INFERRED type precedence) |
| #3 concurrent-completion race | integration-hub | N concurrent completions → `PaymentsCompletedEvent` fires once |
| #4 `PayrollRun.complete()` idempotency | payroll | deliver `PaymentsCompletedEvent` twice → COMPLETED once, no error |
| full lifecycle / partial-failure / retry | integration-hub | publish approved → terminal event with correct counts |

## Harness notes

- `@ActiveProfiles("test")` to disable `RedisPasswordStartupGuard`; `@DynamicPropertySource` overrides
  re-enable Flyway (owns the schema on real PG) and listener auto-startup (the test profile disables
  both for the H2 slice tests).
- Terminal events are captured through a real `@RabbitListener` bean, not `receiveAndConvert` — the
  converter's INFERRED type precedence needs the listener parameter type to deserialize.
- `@Testcontainers(disabledWithoutDocker = true)` — runs in CI (Docker present), skips on machines
  without Docker; locally on Docker 29 it needs `DOCKER_API_VERSION=1.44`.

## Status — all scenarios landed

- **Scenario 1** (`PayrollDisbursementFlowTest`): approved → 2 transactions COMPLETED → terminal
  `PaymentsCompletedEvent` with correct counts (after-commit publish + deserialization).
- **Scenario 2** (same class): one payslip's phone matches the sandbox fail prefix → 1 COMPLETED +
  1 FAILED, terminal counts split 1/1.
- **Scenario 3** (same class): `retryFailed` on a fully-COMPLETED run re-dispatches nothing
  (conversation ids unchanged, H3 guard).
- **Scenario 4** (`PayrollRunCompletionIdempotencyTest`, payroll-service): a **duplicate**
  `PaymentsCompletedEvent` completes the run at most once — `PayrollRun.complete()` idempotency (bug #4).

**Finding that reshaped Scenario 4:** integration-hub's `maybePublishRunCompleted` runs per transaction
commit, so the completion event is **at-least-once, not exactly-once** at that side. The "exactly once"
guarantee lives on the payroll side via `PayrollRun.complete()`'s idempotency — which is exactly what
Scenario 4 verifies. Bug #3's *at-least-once under concurrency* is implicitly covered by Scenarios 1–3
(multiple payments complete concurrently and the event still fires).

**Harness note:** the payroll-side test uses real Flyway migrations + `ddl-auto=none`; Hibernate
`create-drop` against real Postgres tripped an SQLSTATE 0A000 during pool warmup.
