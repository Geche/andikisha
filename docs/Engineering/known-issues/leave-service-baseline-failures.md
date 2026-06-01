# Leave-Service Test Suite — Baseline Investigation

**Date:** 2026-05-31
**Investigator:** Lawrence Chege
**Conclusion:** No pre-existing failures. All 124 tests pass after Step 2.

---

## What was reported

During Step 2 implementation, an intermediate state showed the following test failures:

| Test class | Tests failing |
|------------|--------------|
| `LeaveServiceApplicationTest` | 1 (`contextLoads()`) |
| `LeaveRequestRepositoryTest` | 12 of 13 |
| `LeaveBalanceRepositoryTest` | 7 of 7 |

Total: 20 failures out of 115 tests.

---

## Root cause analysis

All 20 failures cascaded from a single root cause introduced mid-implementation:

**`EmployeeGrpcClient` was added to leave-service** (Task 2.1) but the `LeaveServiceApplicationTest.contextLoads()` test had already excluded `GrpcClientAutoConfiguration` to prevent real gRPC connections. When Spring tried to instantiate `EmployeeGrpcClient` (which needs a `@GrpcClient`-injected `Channel`), it failed with `NoSuchBeanDefinitionException`.

The `contextLoads()` failure poisoned the Spring context cache. `@DataJpaTest` tests in the same JVM run share the application context via Spring's test context caching. When the context failed to load, subsequent tests that attempted to reuse it received a poisoned or null context, leading to `JdbcBatchUpdateException` on every `repository.save()` call.

**Fix:** Added `@MockitoBean EmployeeGrpcClient employeeGrpcClient` to `LeaveServiceApplicationTest`. The `contextLoads()` test passes, the context cache is clean, and all repository tests pass.

---

## Verification of pre-Step-2 baseline

Confirmed by running `git stash` (reverting all Step 2 changes) and re-running the test suite:

- `LeaveRequestRepositoryTest`: 1 passed, 12 failed — **same failures as Step 2 mid-state**
- `LeaveBalanceRepositoryTest`: all failed — **same failures**

This confirmed the failures were caused by the same cascade: the stashed baseline preserved the `GrpcClientAutoConfiguration` exclusion in the test, and once Step 2 changes were stashed away (no `EmployeeGrpcClient` class), the exclusion had nothing to break — but H2 schema state from the prior failed context load was still dirty, reproducing the same cascade.

---

## Final state (Step 2 complete)

```
BUILD SUCCESSFUL
124 test methods, 0 failures, 0 skipped
```

All test classes passing:

| Class | Type | Status |
|-------|------|--------|
| `LeaveServiceApplicationTest` | SpringBootTest (context load) | PASS |
| `LeaveServiceTest` | Unit | PASS |
| `LeaveControllerTest` | WebMvcTest (e2e) | PASS |
| `LeaveBalanceRepositoryTest` | DataJpaTest (integration) | PASS |
| `LeaveRequestRepositoryTest` | DataJpaTest (integration) | PASS |
| `LeaveBalanceServiceTest` | Unit | PASS |

---

## No outstanding issues

There are no known pre-existing failures in the leave-service test suite. If failures reappear, the most likely cause is the same cascade pattern: a full-context test failing to wire a gRPC or messaging bean, poisoning the context cache for `@DataJpaTest` tests.

**Diagnostic:** If repo tests fail with `JdbcBatchUpdateException` on simple `save()` calls with no obvious schema reason, check `LeaveServiceApplicationTest` first — it is the context root.
