# Run-04 Day-4 Verification Pass — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the Section D coverage gaps from the 2026-06-15 audit — exercise the flows the Run-04 build never validated and convert the findings into regression tests plus a verification report.

**Architecture:** Two tracks. **Track A (automatable)** adds backend regression tests (and fixes only where a test exposes a real defect) — runnable now with no environment. **Track B (browser-driven)** drives the running stack via Claude-in-Chrome through each Section D UI/flow walk, capturing screenshots and pass/fail into a verification report. Track A is independent and goes first; Track B depends on a healthy local stack.

**Tech Stack:** Java 21 / Spring Boot 3.4, JUnit 5 + Mockito + Testcontainers + MockMvc (backend); Next.js 15 tenant-portal on :3000; Docker Compose local stack; Claude-in-Chrome for UI walks. No frontend E2E harness exists (deliberately not introduced here).

## Global Constraints

- **Demo tenant ID:** `1cc12430-7c3a-45b7-8973-469622778c9d` · **workspace slug:** `andikisha-demo`.
- **Redis licence cache MUST be seeded after every Docker restart** or all requests 503:
  `docker exec andikisha-redis redis-cli -a changeme SET "licence:status:1cc12430-7c3a-45b7-8973-469622778c9d" "TRIAL" EX 3600`
- **Login ONCE per user and reuse the token.** Rapid repeat logins for the same user return a transient 409 with no `accessToken` (refresh-token rotation, AUTH-BACKLOG-009) — not a credential failure.
- **Password-reset sets `mustChangePassword=true`** → middleware diverts every authed route to `/{workspace}/set-password` until the change is completed. Do not reset-and-walk-away.
- **Demo logins** (tenant-portal :3000): `admin@demo.co.ke` / `AdminDemo#2026` (ADMIN); `jane.w@demo.co.ke` / `Employee@123!` (EMPLOYEE, real employee `a26e4215-21d7-4d0d-8579-c315fb6635c4`); `hrmanager@demo.co.ke` / `HrManager#2026`; `hrofficer@demo.co.ke`, `payroll.officer@demo.co.ke`, `linemanager@demo.co.ke` all `Employee@123!`. Platform-portal (:3003): `superadmin@andikisha.com` / `SuperAdmin@123!`.
- **`linemanager@demo.co.ke` has a dangling employee_id** — its `/my/dashboard` data 403s. For a real-employee LINE_MANAGER walk use Lawrence's `chegzlaw@gmail.com` (password not stored).
- **Leave days are inclusive calendar days** (B-13). Tenant isolation: every query filters `tenant_id`.
- **Verification report output:** append results to `docs/verification/2026-06-30-run-04-day4-verification-report.md` (created in Task B0).

---

## Track A — Automatable backend regression (this session, no stack)

### Task A1: Past-date leave submission — expose, then resolve the policy question

**Files:**
- Test: `services/leave-service/src/test/java/com/andikisha/leave/unit/LeaveServiceTest.java`
- Modify (only if decision = reject): `services/leave-service/src/main/java/com/andikisha/leave/application/service/LeaveService.java`

**Context / why this is a gap:** `submit()` only rejects an early start date when `policy.getMinDaysNotice() > 0` (it compares `DAYS.between(now, startDate) < minDaysNotice`). With the default `minDaysNotice = 0`, a request whose `startDate` is in the **past** is accepted. Section D flagged "negative leave paths (past-date)" as never tested.

**DECISION GATE (surface before fixing):** A blanket "reject past start dates" is wrong for retroactive types — SICK and COMPASSIONATE leave are routinely filed after the fact ("I was sick yesterday"). Options: (a) reject past dates only for non-retroactive types (ANNUAL, STUDY, MATERNITY, PATERNITY); (b) reject for all; (c) allow but cap how far back. **Do not implement a fix until the owner picks one.** This task's first deliverable is the *characterization test* that documents today's behavior; the fix is a follow-up once the rule is chosen.

**Interfaces:**
- Consumes: `LeaveService.submit(UUID employeeId, String employeeName, SubmitLeaveRequest request)`; `BusinessRuleException.getCode()`.
- Produces: (if fix lands) a new rejection code `PAST_START_DATE` on `submit()`.

- [ ] **Step 1: Write the characterization test (documents current behavior)**

```java
@Test
void submit_pastStartDate_currentlyAccepted_characterization() {
    // Documents the gap: with minDaysNotice=0, a past start date is NOT rejected today.
    // When the policy decision lands (see plan A1 DECISION GATE), flip this to expect
    // a PAST_START_DATE BusinessRuleException for the chosen leave types.
    var dto = new SubmitLeaveRequest(
            "ANNUAL",
            LocalDate.now().minusDays(3),
            LocalDate.now().minusDays(1),
            BigDecimal.valueOf(3),
            "Backdated");

    LeavePolicy policy = LeavePolicy.create(TENANT_ID, LeaveType.ANNUAL, 21, 5, true, false);
    LeaveBalance balance = LeaveBalance.create(
            TENANT_ID, EMPLOYEE_ID, LeaveType.ANNUAL, LocalDate.now().minusDays(3).getYear(),
            BigDecimal.valueOf(21), BigDecimal.ZERO);

    when(policyRepository.findByTenantIdAndLeaveType(TENANT_ID, LeaveType.ANNUAL))
            .thenReturn(Optional.of(policy));
    when(balanceRepository.findByTenantIdAndEmployeeIdAndLeaveTypeAndYear(any(), any(), any(), anyInt()))
            .thenReturn(Optional.of(balance));
    when(requestRepository.sumDaysByStatus(any(), any(), any(), any(), any(), any()))
            .thenReturn(BigDecimal.ZERO);
    when(requestRepository.findOverlappingByEmployee(any(), any(), any(), any(), any()))
            .thenReturn(java.util.Collections.emptyList());
    when(requestRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
    when(mapper.toResponse(any(LeaveRequest.class))).thenReturn(mock(LeaveRequestResponse.class));

    // Current behavior: accepted (no throw). This assertion will change when the rule is decided.
    org.assertj.core.api.Assertions.assertThatCode(
            () -> leaveService.submit(EMPLOYEE_ID, "Jane Doe", dto)).doesNotThrowAnyException();
}
```

- [ ] **Step 2: Run it — verify it passes (proves the gap exists)**

Run: `./gradlew :services:leave-service:test --tests "com.andikisha.leave.unit.LeaveServiceTest"`
Expected: PASS (a backdated ANNUAL request is accepted today — the gap is real).

- [ ] **Step 3: Record the finding in the verification report**

Add a row to `docs/verification/2026-06-30-run-04-day4-verification-report.md`: "Past-date leave accepted for non-retroactive types — characterization test added; rule decision pending (see plan A1)."

- [ ] **Step 4: Commit**

```bash
git add services/leave-service/src/test/java/com/andikisha/leave/unit/LeaveServiceTest.java docs/verification/2026-06-30-run-04-day4-verification-report.md
git commit -m "test(leave): characterize past-date leave acceptance gap (Day-4 A1)"
```

- [ ] **Step 5 (CONDITIONAL — only after the owner picks a rule): implement + flip the test**

If decision = "reject past dates for non-retroactive types", add to `submit()` immediately after the `INVALID_DATE_RANGE` guard:

```java
boolean retroactive = leaveType == LeaveType.SICK || leaveType == LeaveType.COMPASSIONATE;
if (!retroactive && request.startDate().isBefore(LocalDate.now())) {
    throw new BusinessRuleException("PAST_START_DATE",
            "Start date cannot be in the past for " + leaveType + " leave");
}
```

Then change the Step-1 test name/body to assert the `PAST_START_DATE` code, add a companion test that a backdated **SICK** request is still accepted, run the suite green, and commit `fix(leave): reject backdated leave for non-retroactive types`.

---

### Task A2: Refresh-token rotation — characterize the concurrent-login 409

**Files:**
- Test: `services/auth-service/src/test/java/com/andikisha/auth/unit/AuthServiceTest.java` (or the e2e `AuthControllerTest.java` if rotation is only observable at the HTTP boundary — pick by where the rotation logic lives; verify first in Step 1).

**Context / why this is a gap:** Section D lists "refresh-token rotation" as never exercised, and AUTH-BACKLOG-009 documents that rapid repeated logins for the same user return a 409 with no `accessToken`. There is no test pinning this behavior, so a refactor could silently turn a deliberate rotation-conflict into a real auth break (or vice-versa).

**Interfaces:**
- Consumes: the auth login + refresh entry points (confirm exact method names in Step 1 — likely `AuthService.login(...)` and `AuthService.refresh(...)`).
- Produces: regression coverage asserting (a) a normal refresh rotates the token and returns a new `accessToken`, and (b) the documented conflict path returns 409 without a token.

- [ ] **Step 1: Locate the rotation logic and exact signatures**

Run: `grep -rniE "refresh|rotat|409|Conflict" services/auth-service/src/main/java | grep -iE "token|refresh" | head -30`
Expected: identifies the refresh method and where the 409/conflict is raised. Record the method signature to fill the test below.

- [ ] **Step 2: Write the failing/again test for the happy-path rotation**

Write a test that a valid refresh token yields a new `accessToken` distinct from the old one and invalidates the old refresh token. (Fill signatures from Step 1; mock the token store/repo as the existing auth tests do — match their mocking style.)

- [ ] **Step 3: Run it**

Run: `./gradlew :services:auth-service:test --tests "*AuthServiceTest"` (or `*AuthControllerTest` if e2e)
Expected: PASS if behavior already correct; if it FAILS, that itself is a Day-4 finding — record it and stop for a decision before "fixing".

- [ ] **Step 4: Add the conflict-path test**

Assert the documented behavior: a second concurrent rotation against an already-rotated token returns 409 (HTTP) / the conflict exception (service) and carries no `accessToken`. This pins AUTH-BACKLOG-009 so it can't silently regress.

- [ ] **Step 5: Run the auth suite green and record + commit**

```bash
./gradlew :services:auth-service:test
git add services/auth-service/src/test docs/verification/2026-06-30-run-04-day4-verification-report.md
git commit -m "test(auth): pin refresh-token rotation + concurrent-login 409 (Day-4 A2)"
```

---

## Track B — Browser-driven flow walks (Claude-in-Chrome, needs stack)

> Each Track B task = navigate, act, observe, screenshot, record pass/fail in the report. These do not commit code; they produce evidence. Run them in order; B0 is the precondition for all.

### Task B0: Bring up the stack and create the verification report

**Files:**
- Create: `docs/verification/2026-06-30-run-04-day4-verification-report.md`

- [ ] **Step 1: Start infra + services**

```bash
docker compose -f infrastructure/docker/docker-compose.full.yml up -d
```
Expected: postgres, redis, rabbitmq, and the 13 services reach healthy.

- [ ] **Step 2: Seed the Redis licence key** (else every request 503s)

```bash
docker exec andikisha-redis redis-cli -a changeme SET "licence:status:1cc12430-7c3a-45b7-8973-469622778c9d" "TRIAL" EX 3600
```
Expected: `OK`.

- [ ] **Step 3: Start the tenant-portal dev server**

```bash
cd frontend/tenant-portal && npm run dev
```
Expected: ready on http://localhost:3000.

- [ ] **Step 4: Health-check the login path in Chrome**

Load core browser tools, open `http://localhost:3000/andikisha-demo/login`, log in ONCE as `admin@demo.co.ke` / `AdminDemo#2026`, confirm you land on `/andikisha-demo/admin/dashboard` (not diverted to `/set-password`). If diverted, complete the set-password flow once, then continue.

- [ ] **Step 5: Create the report skeleton**

Create `docs/verification/2026-06-30-run-04-day4-verification-report.md` with a section per task below (B1–B8 + A1/A2 findings), each with: Flow, Steps run, Expected, Observed, Screenshot, **PASS/FAIL/BLOCKED**.

### Task B1: Empty-tenant walk

- [ ] **Step 1:** Provision a fresh empty tenant via platform-portal (:3003, `superadmin@andikisha.com`) — the demo tenant has data, so empty-state rendering can only be seen on a zero-data tenant. If provisioning is out of reach, mark this task **BLOCKED** and note the dependency rather than testing against the seeded tenant.
- [ ] **Step 2:** Log in to the new tenant; visit every list page: `admin/employees`, `admin/leave`, `admin/users`, `admin/payroll`, `my/leave`, `my/payslips`, `my/attendance`.
- [ ] **Step 3:** Expected (per B-4): each shows a clean empty state — never a spinner-forever, never an error banner, never error+empty double-render, pagination hidden.
- [ ] **Step 4:** Screenshot each; record PASS/FAIL per page.

### Task B2: Onboarding (audit Scenario 2)

- [ ] **Step 1:** As ADMIN, create a new employee (`admin/employees` → create), then issue a standalone invite (`POST /api/v1/auth/users/invite` flow / UI) to a fresh email.
- [ ] **Step 2:** Open the invite, complete first login, complete the forced set-password.
- [ ] **Step 3:** Expected: new user reaches their `/my/dashboard`; the employee record links correctly; no dangling-employee 403 on profile.
- [ ] **Step 4:** Screenshot the journey; record PASS/FAIL.

### Task B3: Deactivation full cycle (audit Scenario 3)

- [ ] **Step 1:** As ADMIN, deactivate the employee created in B2 (or a disposable one — do NOT deactivate `jane.w` or seed personas).
- [ ] **Step 2:** Attempt to log in as the deactivated user; attempt an authed API call with any still-valid token.
- [ ] **Step 3:** Expected: login refused; existing sessions/tokens no longer authorize; the employee disappears from active lists but historical records (payslips/leave) remain intact.
- [ ] **Step 4:** Screenshot; record PASS/FAIL. Note any window where a cached token still works (security finding).

### Task B4: Negative leave paths in the UI

- [ ] **Step 1:** As `jane.w@demo.co.ke` (real employee), submit on `my/leave`: (a) more days than balance (over-balance), (b) a backdated ANNUAL request (past-date), (c) a range overlapping existing approved leave.
- [ ] **Step 2:** Expected: each is rejected with the correct, specific message (B-4 error UX — not "check your connection"); the B-13 server recompute means the day count shown matches the date range regardless of any client value.
- [ ] **Step 3:** Cross-check (b) against Track A1's finding — if the backend currently *accepts* past dates, the UI will too; record this consistently in both places.
- [ ] **Step 4:** Screenshot each rejection; record PASS/FAIL.

### Task B5: Bulk-upload template download + upload

- [ ] **Step 1:** As ADMIN, on the employees bulk-upload surface, download the template.
- [ ] **Step 2:** Expected: the file downloads (not corrupted — recall the prior xlsx-corruption proxy bug); columns match the importer.
- [ ] **Step 3:** Fill 2 rows, upload; verify fuzzy-dept validation + nationalId constraints behave; the new employees appear.
- [ ] **Step 4:** Screenshot; record PASS/FAIL.

### Task B6: Departments / positions modals

- [ ] **Step 1:** As ADMIN, open the departments modal and the positions modal (settings/employees area).
- [ ] **Step 2:** Create, edit, and validate-error each (e.g. duplicate name, empty required field).
- [ ] **Step 3:** Expected: modals open/close cleanly, validation fires, changes persist and reflect in dependent dropdowns.
- [ ] **Step 4:** Screenshot; record PASS/FAIL.

### Task B7: Terminate flow

- [ ] **Step 1:** As ADMIN, run the terminate flow on a disposable employee (distinct from B3 deactivation — terminate is the HR lifecycle action, confirm it is a separate path).
- [ ] **Step 2:** Expected: termination captured with date/reason; final-pay / leave-balance handling behaves; status reflects across employee list and any payroll eligibility.
- [ ] **Step 3:** Screenshot; record PASS/FAIL. If terminate and deactivate are the same underlying action, record that as a finding.

### Task B8: Landing mobile responsiveness @375px

- [ ] **Step 1:** Point Chrome at the landing app (`frontend/landing`, start it if needed) and resize the window to 375px width.
- [ ] **Step 2:** Walk the primary landing pages (home, /product, /pricing, /about, /contact, /demo); check nav (hamburger), hero, grids, forms, footer.
- [ ] **Step 3:** Expected: no horizontal scroll, no overlap/clipping, tap targets reachable, forms usable.
- [ ] **Step 4:** Screenshot each page @375px; record PASS/FAIL.

### Task B9: Finalize the report

- [ ] **Step 1:** Summarize PASS/FAIL/BLOCKED counts at the top of the report.
- [ ] **Step 2:** For each FAIL, file or update a backlog entry / GitHub issue (follow whichever the user designated as system of record) and link it.
- [ ] **Step 3:** Commit the report.

```bash
git add docs/verification/2026-06-30-run-04-day4-verification-report.md
git commit -m "docs(audit): Run-04 Day-4 verification report"
```

---

## Self-Review — Section D coverage check

| Section D gap | Covered by |
|---|---|
| empty-tenant walk | B1 |
| Scenario 2 (onboarding) | B2 |
| Scenario 3 (deactivation cycle) | B3 |
| negative leave — over-balance | B4 (UI) — backend already unit-tested |
| negative leave — past-date | A1 (backend, with decision gate) + B4 (UI) |
| negative leave — overlap | B4 (UI) — backend already unit-tested |
| bulk-upload template download | B5 |
| departments/positions modals | B6 |
| terminate flow | B7 |
| refresh-token rotation | A2 |
| landing mobile 375px | B8 |
| client-trusted leave `days` (integrity) | already resolved by B-13 (PR #30); re-verified in B4 |

**Note on scope honesty:** B1 (empty-tenant) and B7 (terminate) may surface as **BLOCKED** if tenant provisioning or a distinct terminate path isn't reachable in the demo environment — the plan records the blocker rather than faking a pass. A1 and B4's past-date checks are *characterization-first*: they document current behavior and gate any fix on a product decision (retroactive SICK/COMPASSIONATE must stay allowed).
