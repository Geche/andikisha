# Run-04 Day-4 Verification Report

**Date:** 2026-06-30
**Plan:** `docs/superpowers/plans/2026-06-30-run-04-day4-verification.md`
**Scope:** Section D coverage gaps from the 2026-06-15 tenant-portal + landing audit.

Status key: ✅ PASS · ❌ FAIL · ⛔ BLOCKED · 🟡 finding (characterization, decision pending)

## Summary

| Track | Item | Status |
|---|---|---|
| A1 | Past-date leave submission | ✅ fixed — past dates rejected except SICK/COMPASSIONATE |
| A2 | Refresh-token rotation | ✅ already covered; ⛔ concurrent-login 409 needs integration test |
| B4-backend | Negative leave paths (API, via live gateway) | ✅ A1 verified live; ⛔ B-13 not in build |
| B1 | Empty-tenant walk | ⛔ blocked — Chrome extension unresponsive |
| B2 | Onboarding (Scenario 2) | ⛔ blocked — Chrome extension unresponsive |
| B3 | Deactivation cycle (Scenario 3) | ⛔ blocked — Chrome extension unresponsive |
| B4-UI | Negative leave error UX | ⛔ blocked — Chrome extension unresponsive |
| B5 | Bulk-upload template | ⛔ blocked — Chrome extension unresponsive |
| B6 | Departments/positions modals | ⛔ blocked — Chrome extension unresponsive |
| B7 | Terminate flow | ⛔ blocked — Chrome extension unresponsive |
| B8 | Landing mobile @375px | ⛔ blocked — Chrome extension unresponsive |

## Infra findings surfaced bringing up the stack (new)

- **INFRA-1 — `docker-compose.full.yml` is broken under `profile=dev` for most services.** The `dev` profile in `tenant/employee/leave/api-gateway` hardcodes `localhost:<hostport>` for datasource / RabbitMQ / Redis instead of honouring the injected `DB_HOST`/`REDIS_HOST` env like `auth-service` does. The compose forces `SPRING_PROFILES_ACTIVE=dev`, so those services cannot connect in-container: leave/employee/tenant crash-loop on Flyway (`Connection to localhost:5437 refused`); the gateway 500s any Redis-touching route (`TenantLicenceFilter`). Worked around with `SPRING_DATASOURCE_URL`/`SPRING_RABBITMQ_HOST`/`SPRING_DATA_REDIS_HOST` env overrides. **Fix:** parameterise the dev profile the way `auth-service` already does (`${DB_HOST:localhost}`), or add a `docker` profile. Propose **INFRA-BACKLOG**.
- **INFRA-2 — aggregate `/actuator/health` reports `OUT_OF_SERVICE` while readiness is UP**, so the docker healthcheck marks otherwise-functional services unhealthy (observed on auth/gateway during startup; recovered later). Non-blocking but noisy; worth aligning the healthcheck to the readiness group.

## SEC finding surfaced during API verification (new)

- **SEC-1 — an employee cannot cancel their own leave request.** `POST /leave/requests/{id}/cancel` for the request's own submitter returns `422 NOT_OWNER`. Submit persists `employeeId = a26e4215…` (jane's employee record) but the cancel owner-check compares against a different caller identity — the known **User-vs-Employee UUID mismatch** (SEC-BACKLOG-001, also flagged under B-5). Reproduced live. Should be folded into the B-5 grant-intent pass.

---

## Track A — automatable backend regression

### A1 · Past-date leave submission — 🟡 gap confirmed

**Flow:** Submit a leave request whose `startDate`/`endDate` are in the past.

**Observed:** `LeaveService.submit()` only rejects an early start date when `policy.getMinDaysNotice() > 0` (it checks `DAYS.between(now, startDate) < minDaysNotice`). With the default `minDaysNotice = 0`, a **backdated request is accepted**. Characterization test added: `LeaveServiceTest.submit_pastStartDate_currentlyAccepted_characterization` — it asserts the request is accepted today and **passes**, pinning the current behavior.

**Decision pending:** A blanket past-date rejection would break retroactive SICK / COMPASSIONATE leave (legitimately filed after the fact). Recommended rule: reject past `startDate` for non-retroactive types (ANNUAL, STUDY, MATERNITY, PATERNITY); keep SICK / COMPASSIONATE backdatable. Once chosen, flip the characterization test to expect a `PAST_START_DATE` exception, add a "backdated SICK still accepted" companion, and implement the guard (plan A1 Step 5).

**Resolution (2026-06-30, owner-approved):** added a guard in `submit()` — `PAST_START_DATE` is thrown when `startDate` is before today for any non-retroactive type; SICK and COMPASSIONATE remain backdatable. Tests: `submit_pastStartDate_nonRetroactiveType_rejected` (ANNUAL → rejected) and `submit_pastStartDate_retroactiveType_accepted` (SICK → accepted). Leave suite green (130 tests).

**Status:** ✅ fixed.

### A2 · Refresh-token rotation — ✅ covered (rotation) · ⛔ partial (concurrent 409)

**Flow:** Exchange a refresh token for a new pair; verify rotation and conflict handling.

**Observed:** `AuthService.refresh()` rotates correctly — it loads the stored token, rejects `!isValid()`, **revokes the used token**, then issues a new pair. This is already pinned by three green unit tests in `AuthServiceTest.Refresh`:
- `withValidToken_rotatesTokenAndReturnsNewTokens` — asserts a new `accessToken` AND that the old token is revoked + saved (true rotation).
- `withTokenNotFound_throwsTokenExpiredException` — unknown token rejected.
- `withRevokedToken_throwsTokenExpiredException` — **reusing an already-rotated token is rejected** (the rotation-conflict case).

No new tests added — adding more would duplicate existing coverage (DRY/YAGNI).

**Gap (⛔):** The documented **concurrent-login 409** (AUTH-BACKLOG-009 — rapid repeat logins for the same user return 409 with no `accessToken`) is a race / DB-constraint behavior that mock-based unit tests cannot reproduce deterministically. It needs a **Testcontainers concurrency integration test** (two simultaneous `login()` calls against a real datasource, asserting the loser surfaces a clean 409 rather than a 500). Recorded as a follow-up; not implemented in this pass.

**Status:** ✅ rotation verified · ⛔ concurrent-login 409 deferred to an integration test.

---

## Track B-backend — negative leave paths verified via the live gateway (API)

The Chrome extension would not respond (three attempts) and the dev server was repeatedly stopped, so the *visual* walks are blocked. As a substitute for the backend-observable behaviour, the negative leave paths were exercised end-to-end through the running api-gateway (`localhost:8080`, ADMIN login and jane/EMPLOYEE login both succeeded), against a 5-service subset (auth, tenant, employee, leave, gateway) + infra.

| Check | Request | Result | Status |
|---|---|---|---|
| A1 past-date, non-retroactive | backdated ANNUAL `2026-06-25→27` | `422 PAST_START_DATE` "Start date cannot be in the past for ANNUAL leave" | ✅ |
| A1 past-date, retroactive | backdated SICK `2026-06-25→26` | `201` created, PENDING (then cleaned up) | ✅ |
| over-balance | ANNUAL `2026-08-01→30` | `422 INSUFFICIENT_BALANCE` "Available: 6.0, Requested: 30" | ✅ |
| overlap | ANNUAL over existing approved leave | `422 OVERLAPPING_LEAVE` | ✅ |
| **B-13 recompute** | ANNUAL `2026-09-07→09` with client `days=99` | `422 INSUFFICIENT_BALANCE` **"Requested: 99"** — client value **trusted** | ⛔ |

**A1 is verified live.** **B-13 is NOT verifiable against this build**: the running leave-service was built from the Day-4 branch (off `master`), and B-13's server-side day recompute lives on the **unmerged** `fix/leave-service-server-recompute-days` (PR #30). The `"Requested: 99"` above is the *pre-B-13* behaviour — i.e. this run independently **reconfirms the client-trusted-`days` vulnerability is still live on `master`**, reinforcing that PR #30 should merge. Re-run this B-13 row after #30 lands.

## Track B-UI — blocked

B1, B2, B3, B4-UI, B5, B6, B7, B8 require the browser driver. The Claude Chrome extension was unresponsive across three attempts (connected but timing out — likely a pending side-panel permission or stale tab access), and the tenant-portal dev server was stopped twice mid-session. These walks remain **BLOCKED**, not failed. Options to close them: retry after resetting the extension, or run them from a manual checklist (plan Track B steps) against the stack (which is up and healthy).
