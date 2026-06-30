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
| B1 | Empty-tenant walk | _pending (needs stack)_ |
| B2 | Onboarding (Scenario 2) | _pending (needs stack)_ |
| B3 | Deactivation cycle (Scenario 3) | _pending (needs stack)_ |
| B4 | Negative leave paths (UI) | _pending (needs stack)_ |
| B5 | Bulk-upload template | _pending (needs stack)_ |
| B6 | Departments/positions modals | _pending (needs stack)_ |
| B7 | Terminate flow | _pending (needs stack)_ |
| B8 | Landing mobile @375px | _pending (needs stack)_ |

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

## Track B — browser-driven flow walks (require running stack)

_To be completed once the local stack is up (plan B0). Each entry will record: Flow, Steps, Expected, Observed, Screenshot, Status._
