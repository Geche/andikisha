# Design: payroll → disbursement integration-test harness (PAYROLL-BACKLOG-003)

**Status:** Accepted (2026-07-31) — Scenario 1 landed; Scenarios 2–4 to follow as separate PRs.
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

## Status / remaining

- **Scenario 1 (done):** `PayrollDisbursementFlowTest` — approved → 2 transactions COMPLETED → terminal
  `PaymentsCompletedEvent` with correct counts.
- **Remaining:** (2) partial failure via `app.mpesa.sandbox.fail-phone-prefix`, run reaches COMPLETED
  with correct success/fail counts; (3) retry of FAILED transactions stays idempotent; (4) concurrent
  completion fires `PaymentsCompletedEvent` exactly once; plus the payroll-side completion + idempotency.
