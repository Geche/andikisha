# Comprehensive Tenant-Portal and Landing Site Audit
Date: 2026-06-15
Master commit: 908a80c (audit run on post-hotfix master `cd7c5a7`, which is `908a80c` + the Finding-Zero fix #14)
Scope: frontend/tenant-portal, frontend/landing
Method: Browser-driven (Claude Preview / Chromium against the live dev stack on :3000 and :3002), DevTools console + network, plus curl for authz matrix confirmation and read-only code tracing. All six personas exercised.

## Executive summary
- Total findings: 14 (excluding Finding Zero, which is fixed and merged)
- Critical: 1 | High: 4 | Medium: 4 | Low: 3 | Polish: 2
- New backlog items proposed: 10
- Existing backlog items confirmed: 4 (LEAVE-BACKLOG-001, FE-BACKLOG-014, AUTH-BACKLOG-002, AUTHZ-BACKLOG-001)
- Decision doc conflicts found: 1 (the audit's "compliance service is the sole authority, no recalculation" principle is violated by the landing calculator)

**Headline:** The product's day-to-day surfaces are largely healthy — login (post-hotfix), employees, leave apply/approve, users/roles, settings, and the real payroll engine all work and resolve names correctly. The serious problems cluster at two seams: (1) the **marketing site overstates the product** — a prospect-facing payroll calculator that miscalculates statutory deductions while claiming to be "calculated to the cent," and a product page claiming statutory filings are "Live"/"Filed" when nothing is transmitted to any authority; and (2) **two roles cannot do their jobs** — PAYROLL_OFFICER can create a payroll run but is forbidden from listing/viewing it (so the payroll page errors on load), and LINE_MANAGER has no UI to approve leave despite that being the role's entire purpose.

---

## Finding zero: known login failures

**Status: FIXED and merged (PR #14, commit `c05b943`) before this audit. Documented here for completeness.**

### Reported vs. reproduced
Lawrence reported login broken for LINE_MANAGER, HR_OFFICER, and HR_MANAGER. Browser reproduction on master `908a80c` showed only **LINE_MANAGER** actually broken:

| Persona | Reported | Reproduced (browser, pre-fix) | Landing |
|---|---|---|---|
| HR_MANAGER | broken | **works** | `/admin/dashboard` |
| HR_OFFICER | broken | **works** | `/admin/dashboard` |
| LINE_MANAGER | broken | **broken** | `/access-denied` → **404** |

### Reproduction (LINE_MANAGER)
1. Persona LINE_MANAGER (`linemanager@demo.co.ke`), URL `/andikisha-demo/login`, submit valid credentials.
2. **Observed:** login succeeds (BFF sets `tenant_token`), then `window.location.assign` sends the browser to `/andikisha-demo/access-denied`, which renders **"404 — This page could not be found."**
3. **Expected:** LINE_MANAGER lands on `/my/dashboard` (frontend CLAUDE.md: "LINE_MANAGER routes through `/my/*` only").

### Root cause
`findCorrectDashboard()` (`frontend/packages/ui/src/lib/auth.ts`) routed `ADMIN_ROLES → /admin`, `EMPLOYEE → /my`, else `/access-denied`. A LINE_MANAGER JWT carries the single role `{"LINE_MANAGER"}` — not admin-tier, not EMPLOYEE — so it had no branch and fell through. Latent because the R3-0 role census had **zero** LINE_MANAGER users; it surfaced once a LINE_MANAGER account existed. Fix added `|| roles.has("LINE_MANAGER")` to the `/my/dashboard` branch. Verified in-browser post-fix: LINE_MANAGER → `/my/dashboard`; HR_MANAGER and HR_OFFICER unaffected.

### Carried into Phase A from Finding Zero
- **M4** (`/{workspace}/access-denied` is itself a 404) — see Medium findings.
- **L3** (LINE_MANAGER RoleBadge purple) — see Low findings.

---

## Findings by severity

### Critical (1)

#### C1 — Landing payroll calculator miscalculates statutory deductions (prospect-facing)
- **What I did:** Browser, landing home `:3002`, the "LIVE PAYROLL ENGINE" calculator. Entered gross 100,000 KES (pension 0, HELB 0).
- **What happened (browser-confirmed):**
  | Line | Calculator shows | Correct (KRA / backend engine) | Error |
  |---|---|---|---|
  | NSSF Tier II | −2,160.00 | −1,740.00 | **+420 overcharge** |
  | PAYE | −22,385.00 | −21,324.50 | **+1,060 overstated** |
  | SHIF | −2,750.00 | −2,750.00 | ok |
  | Housing Levy | −1,500.00 | −1,500.00 | ok |
  | Net pay | **70,785.00** | **72,265.50** | **−1,480 too low** |

  The page headline is "Kenyan HR and payroll, **calculated correctly**"; the calculator says "calculated to the cent using current KRA rates" and "Live KRA rates from our Compliance engine."
- **What I expected:** The displayed figures to match the engine that actually runs payroll. They do not.
- **Root cause:** The public endpoint `GET /api/v1/public/compliance/KE/rates` returns **rate data only**; `frontend/landing/lib/compute-payslip.ts` does its own arithmetic with two bugs: (A) line 58 treats NSSF `secondaryLimit` (36,000, an absolute Tier II ceiling) as an *increment* over Tier I, computing Tier II on a 36,000-wide band instead of 29,000 (surfaces for any gross ≥ 43,000); (B) line 73 sets `taxableIncome = gross − pension`, never subtracting NSSF before PAYE, contrary to KRA rules and the backend (`KenyanTaxCalculator.java:90-97`). The real backend engine is **correct** — employees' actual payslips are fine; only the marketing calculator is wrong.
- **Severity:** Critical. Statutory miscalculation visible to every prospect, directly contradicting the site's central credibility claim.
- **Category:** Bug.
- **Backlog:** New (proposed AUDIT/LANDING). Note this also conflicts with the audit's stated principle that the compliance service is the sole authority and the frontend must not recalculate.
- **Evidence:** Browser values above (reproduced live); `compute-payslip.ts:58,73`; backend `KenyanTaxCalculator.java`.

---

### High (4)

#### H1 — PAYROLL_OFFICER can create a payroll run but is forbidden from listing/viewing it (payroll page errors on load)
- **What I did:** Persona PAYROLL_OFFICER (`payroll.officer@demo.co.ke`), URL `/andikisha-demo/admin/payroll`. Then confirmed via curl authz matrix.
- **What happened:** Page renders, then its mount call to list runs returns **403** (DevTools console: `AxiosError: Request failed with status code 403`), and the UI shows "Could not load payroll runs. Check your connection." (see M3). Authz matrix on `GET /api/v1/payroll/runs`: ADMIN 200, HR_MANAGER 200, HR_OFFICER 200, **PAYROLL_OFFICER 403**.
- **What I expected:** PAYROLL_OFFICER — an admin-tier role in `ADMIN_ROLES`, invitable and assignable, whose persona spec says it "should access payroll surfaces" — to read the payroll runs it is allowed to create.
- **Root cause — an internally inconsistent grant set, not a deliberate policy.** Reading `PayrollController.java` line by line, PAYROLL_OFFICER **is** granted the write/read endpoints around runs but **not** the three that list or open a run:
  | Endpoint | `@PreAuthorize` | PAYROLL_OFFICER |
  |---|---|---|
  | `POST /runs` (create) | ADMIN, HR_MANAGER, **PAYROLL_OFFICER** | ✅ |
  | `POST /runs/{id}/calculate` | ADMIN, HR_MANAGER, **PAYROLL_OFFICER** | ✅ |
  | `POST /runs/{id}/approve` | ADMIN, HR_MANAGER | — (higher-tier, plausibly intentional) |
  | **`GET /runs`** (list — the page's first call) | ADMIN, HR_MANAGER, HR_OFFICER | ❌ |
  | **`GET /runs/{id}`** (view a run) | ADMIN, HR_MANAGER, HR_OFFICER | ❌ |
  | **`GET /runs/{id}/payslips`** | ADMIN, HR_MANAGER, HR_OFFICER | ❌ |
  | `GET /payslips/{id}` | …, HR_OFFICER, **PAYROLL_OFFICER**, EMPLOYEE | ✅ |
  | `GET /employees/{id}/payslips` | …, HR_OFFICER, **PAYROLL_OFFICER**, EMPLOYEE | ✅ |

  So the role can **create and calculate** a payroll run and read individual payslips, but cannot **list or open** the runs — it can produce a run it is then forbidden to see. The three `GET /runs*` endpoints received HR_OFFICER in R3-0's `HR → HR_OFFICER` rewrite but were never given PAYROLL_OFFICER, even though the sibling `POST /runs` and `POST /runs/{id}/calculate` already have it. This reads as a copy/omission oversight on those three lines, not an intent decision.
- **Severity:** High. The payroll role's primary screen errors on load; admin can't delegate payroll management to a payroll officer.
- **Category:** Security / Bug (authorization).
- **Fix shape:** add `'PAYROLL_OFFICER'` to the `@PreAuthorize` on `GET /runs`, `GET /runs/{id}`, and `GET /runs/{id}/payslips` (matching the create/calculate endpoints). Approve is a separate intent question.
- **Backlog:** Cross-references **AUTHZ-BACKLOG-001** (grant-intent audit) but is a concrete functional defect, not just an intent question. Proposed new payroll-authz item.
- **Evidence:** curl matrix above; `PayrollController.java` `@PreAuthorize` grants (POST `/runs` + `/runs/{id}/calculate` include PAYROLL_OFFICER; the three `GET /runs*` do not); console 403.

#### H2 — LINE_MANAGER has no leave-approval surface in the UI (canonical workflow impossible)
- **What I did:** Scenario 1, Step 2. Persona LINE_MANAGER. Inspected `/my/*` nav; attempted `/andikisha-demo/admin/leave`.
- **What happened:** LINE_MANAGER's sidenav is identical to a plain EMPLOYEE's (Home / Payslips / Leave / Attendance / Profile) — no Team, no Approvals. Navigating to `/admin/leave` redirects to `/my/dashboard` (the middleware admin guard). There is **no route by which a LINE_MANAGER can see or approve their team's leave**.
- **What I expected:** Per the persona spec ("LINE_MANAGER should access team views and approval surfaces"), the backend grants (`@PreAuthorize` on leave approve/reject *includes* LINE_MANAGER; `CallerScopeResolver` gives LINE_MANAGER DEPARTMENT scope), and Scenario 1 Step 2 itself ("as LINE_MANAGER, find the approval queue"), there should be an approval surface.
- **Root cause:** The approval queue is built only at `/admin/leave` (admin-tier); LINE_MANAGER routes through `/my/*` only (frontend CLAUDE.md). No `/my` team-approval surface exists. The backend capability is fully present but unreachable from the role's UI.
- **Severity:** High. The defining workflow of the role is impossible through the product.
- **Category:** Missing feature.
- **Backlog:** New (proposed FE/LEAVE). Related but distinct from the now-fixed Finding Zero (both stem from LINE_MANAGER being a late-added operational role the `/my` surfaces never fully accounted for).
- **Evidence:** LINE_MANAGER nav capture; `/admin/leave` → `/my/dashboard` redirect; leave-controller grants include LINE_MANAGER; `CallerScopeResolver` DEPARTMENT branch.

#### H3 — Landing product page overstates statutory filing as "Live"/"Filed"
- **What I did:** Read landing `/product` and home copy; confirmed against backend; home hero mock visible in browser.
- **What happened:** `app/product/page.tsx:56-60` marks **KRA iTax ("Direct PAYE and WHT filing"), NSSF Portal, SHIF Portal** as `status: "Live"`. The home hero mock displays "P10A — PAYE return / NSSF contribution / SHIF remittance" each as **"Filed"**; `FeatureComplianceGrid.tsx:9-10` and `ProductWalkthrough.tsx:121-135` say filings are "submitted to the respective authorities … No separate login to iTax required."
- **What I expected:** Claims to match capability. `integration-hub-service/FilingService.java` only writes local `FilingRecord` rows (status `SUBMITTED`) and makes **zero external HTTP calls** to any authority. WHT has no backend at all. The pricing page itself correctly lists filing as **roadmap** — so the product page contradicts the pricing page.
- **Severity:** High. Overpromising a regulated capability (tax filing) to prospects; the prospect believes filings reach KRA/NSSF/SHIF when nothing is transmitted.
- **Category:** Missing feature / accuracy (copy).
- **Backlog:** New (proposed PRODUCT). M-Pesa "Live" (`SandboxMpesaClient` stub) is a softer instance of the same overstatement.
- **Evidence:** `product/page.tsx:56-60`; `FilingService.java` (no RestClient/WebClient); pricing roadmap array; home hero "Filed" mock (browser).

#### H4 — LINE_MANAGER cannot view their own payslips (403 at the role gate)
- **What I did:** Persona LINE_MANAGER, `/andikisha-demo/my/payslips`; then isolated the cause with a curl comparison.
- **What happened:** The page calls `GET /api/v1/payroll/employees/{employeeId}/payslips` and gets **403** (DevTools console: `AxiosError 403`); the UI shows "Could not load payslips. Please try again later." Curl, same employee_id: **LINE_MANAGER → 403, ADMIN → 200**. So the data/id is fine; the rejection is at the role gate.
- **What I expected:** A LINE_MANAGER is always employee-linked and should read their own payslips exactly as an EMPLOYEE does.
- **Root cause:** `PayrollController` `@PreAuthorize` on `GET /employees/{employeeId}/payslips` (and `GET /payslips/{id}`) is `hasAnyRole('ADMIN','HR_MANAGER','HR_OFFICER','PAYROLL_OFFICER','EMPLOYEE')` — **`LINE_MANAGER` is omitted.** Same omission pattern as H1/H2: an operational role dropped from a grant list. (Distinct from this demo account's dangling `employee_id`, which only affects the dashboard "Could not load your profile" message — ADMIN reading the same id returns 200, proving the payslip 403 is the role, not the data.)
- **Severity:** High (borderline High/Medium — a core self-service surface is fully unusable for the role, but it is one sub-surface rather than the role's primary function).
- **Category:** Security / Bug (authorization).
- **Fix shape:** add `'LINE_MANAGER'` to the `@PreAuthorize` on `GET /employees/{employeeId}/payslips` and `GET /payslips/{id}` (the service already enforces self-ownership for non-admin callers).
- **Backlog:** New (proposed AUTHZ-BACKLOG-003); same WS-B workstream as H1/H2.
- **Evidence:** curl LINE_MANAGER 403 vs ADMIN 200 (same employee_id); `PayrollController.java` payslip-read `@PreAuthorize` lists (EMPLOYEE present, LINE_MANAGER absent); console 403; `/my/payslips` "Could not load payslips" (browser).

---

### Medium (4)

#### M1 — Voluntary password change is a broken link (404)
- **What I did:** Persona ADMIN, `/admin/profile`, clicked the "Change password" affordance.
- **What happened:** The link points to `/andikisha-demo/my/change-password`, which renders **"404 — This page could not be found."** The backend endpoint `POST /api/v1/auth/change-password` exists; only the frontend page is missing.
- **What I expected:** A working change-password page.
- **Severity:** Medium. A presented affordance on a core page dead-ends; worse than a silently-absent feature. Workaround: the login "Forgot Password?" flow.
- **Category:** Bug / missing feature.
- **Backlog:** **Confirms FE-BACKLOG-014** ("Change password links to a non-existent `/my/change-password` page") and **AUTH-BACKLOG-002** ("No voluntary password change page for ADMIN").
- **Evidence:** `/admin/profile` link href; `/my/change-password` → 404 (browser).

#### M2 — Leave approval note is collected then silently discarded
- **What I did:** Scenario 1, Step 2. Persona HR_MANAGER, `/admin/leave`, approved jane's request entering note "AUDIT-NOTE-PERSIST-CHECK-7788" in the modal's "Notes (optional)" field. Then opened the request detail.
- **What happened:** The note appears nowhere on the detail page (or anywhere else). The Approve modal posts no body; the backend `approve` path has no field for an approval note.
- **What I expected:** Either the note persists and displays, or the field is not shown. Presenting a "Notes (optional)" input that is silently dropped is misleading.
- **Severity:** Medium. Data-entry that vanishes without warning on a core HR action.
- **Category:** Bug.
- **Backlog:** **Confirms LEAVE-BACKLOG-001** ("Approve does not persist reviewer notes"). The user-facing harm is the dead input, not just the missing column.
- **Evidence:** browser; `ApproveModal.tsx` posts no body; `LeaveRequest` entity has no approval-note field (only `rejection_reason`).

#### M3 — Payroll error UX: a 403 is shown as "Check your connection," alongside a contradictory empty state
- **What I did:** Persona PAYROLL_OFFICER, `/admin/payroll` (the H1 403).
- **What happened:** The page renders **both** an error banner "Could not load payroll runs. Check your connection." **and** the empty state "No payroll runs yet. Click Run Payroll to get started." simultaneously. The error misattributes an authorization failure to a network problem.
- **What I expected:** A single, accurate state. A 403 is not a connectivity issue, and an error + "nothing here yet" should not both render.
- **Severity:** Medium. Misleading error messaging on a core surface; would send a user debugging their network instead of their permissions.
- **Category:** Bug / design inconsistency.
- **Backlog:** New (proposed FE). Generic "check your connection" copy for non-network failures likely recurs on other React-Query surfaces.
- **Evidence:** browser dual-state capture; console 403.

#### M4 — `/{workspace}/access-denied` is a 404 (workspace-scoped route missing)
- **What I did:** Observed during Finding Zero; LINE_MANAGER pre-fix landed on `/andikisha-demo/access-denied`.
- **What happened:** That path renders **"404 — This page could not be found."** A bare `/access-denied` may exist, but the workspace-scoped variant the code redirects to does not.
- **What I expected:** A real access-denied page. `findCorrectDashboard` returns `/access-denied` for SUPER_ADMIN-without-`NEXT_PUBLIC_PLATFORM_PORTAL_URL` and for any unrecognised role; the middleware and `useRoleGuard` prepend the workspace, so any such user hits a 404 rather than a styled denial.
- **Severity:** Medium. Latent now that LINE_MANAGER is fixed, but the fallback for genuinely-unauthorised users is a broken page.
- **Category:** Bug.
- **Backlog:** New (proposed FE/TENANT).
- **Evidence:** browser 404 at `/andikisha-demo/access-denied`.

---

### Low (3)

#### L1 — Leave request detail shows a blank "Employee number" and a raw email for "Reviewed by"
- **What I did:** Scenario 1, leave request detail page (HR_MANAGER).
- **What happened:** "EMPLOYEE NUMBER" renders with no value; "REVIEWED BY" shows `hrmanager@demo.co.ke` (raw email) rather than a display name.
- **What I expected:** Either a populated employee number or no label; a human-readable reviewer name.
- **Root cause:** The detail page's type carries fields the API never returns (`employeeNumber`), and stores/renders the reviewer as email (the gateway sets no name claim; reviewer name is the email).
- **Severity:** Low. Cosmetic but visible on a detail surface; the blank labelled field reads as a defect.
- **Category:** Bug / polish.
- **Backlog:** New (proposed LEAVE/FE), or fold into the LEAVE-BACKLOG-001 cluster.

#### L2 — Leave balances show odd fractional values and an irrelevant leave type
- **What I did:** Persona EMPLOYEE (jane), `/my/leave`.
- **What happened:** Balances render PATERNITY **9.3** and COMPASSIONATE **3.3** (oddly fractional), and PATERNITY is shown at all for a female employee (Jane Wanjiru).
- **What I expected:** Sensible whole-day allocations, and leave types relevant to the employee (or a clear accrual explanation).
- **Severity:** Low. Confusing but not blocking; balances otherwise function (Run-03 500 fix confirmed working).
- **Category:** Bug / design.
- **Backlog:** New (proposed LEAVE). Worth confirming the accrual/proration formula and gender/eligibility filtering.

#### L3 — LINE_MANAGER role badge is purple via hardcoded hex
- **What I did:** Code observation while tracing Finding Zero; the role-colour map applies to badges across users/leave/employee surfaces.
- **What happened:** `RoleBadge.tsx:20` sets LINE_MANAGER to `"bg-[#F3E8FF] text-[#6B21A8]"` (purple), using hardcoded hex and Tailwind arbitrary values.
- **What I expected:** A theme token in the brand palette. Frontend CLAUDE.md: "No blue, no purple," "No hardcoded hex/rgb in components," "No Tailwind arbitrary values."
- **Severity:** Low. Off-brand colour on a visible chip; triple convention violation.
- **Category:** Design inconsistency.
- **Backlog:** New (proposed UI). Audit the rest of the role-colour map for the same pattern.

---

### Polish (2)

#### P1 — Payslip detail uses the stale label "NHIF / SHIF"
- The tenant-portal payslip detail (`(my)/my/payslips`) labels the health line "NHIF / SHIF". NHIF was replaced by SHIF in October 2024; the slash label is stale wording (not a calculation error). Category: Polish. New backlog (UI/copy).

#### P2 — PAYE band-2 upper bound disagrees between CLAUDE.md and live data
- CLAUDE.md states the second PAYE band ends at **32,333**; the seeded compliance data and `KenyanTaxCalculator.java:14` use **32,300** (justified as 387,600 ÷ 12). The live data and engine agree with each other; CLAUDE.md is the outlier (~8 KES PAYE difference). Reconcile the doc to the data. Category: Polish / docs. New backlog (COMPLIANCE/docs).

---

## Findings grouped by root cause (workstream candidates)

**WS-A — Marketing accuracy (prospect-facing trust):** C1 (calculator miscalc), H3 (filing "Live"/"Filed" overpromise), P1 (NHIF/SHIF label), P2 (band doc mismatch). One coherent "make the public claims true" workstream; C1 and H3 are the credibility risks.

**WS-B — Role-grant completeness (authorization):** H1 (PAYROLL_OFFICER can create but not list/view payroll runs), H2 (LINE_MANAGER has no approval UI), H4 (LINE_MANAGER omitted from payslip-read grants, so can't see own payslips). All three are "an operational role dropped from a grant/surface" — H1 and H4 are backend `@PreAuthorize` omissions, H2 is a missing frontend surface; all trace to roles added/renamed in R3-0 without completing the grant set. Tie to AUTHZ-BACKLOG-001. **This is now a three-instance pattern — the whole `@PreAuthorize` matrix for LINE_MANAGER and PAYROLL_OFFICER should be swept, not patched endpoint-by-endpoint.**

**WS-C — Broken/again-missing pages and error states:** M1 (change-password 404), M4 (access-denied 404), M3 (payroll error misattribution + dual state). "Pages and error states that dead-end or mislead."

**WS-D — Leave detail/data hygiene:** M2 (dropped approval note), L1 (blank employee number, email reviewer), L2 (odd balances). The leave domain's display/response contract has several gaps.

---

## New backlog items proposed

1. **LANDING-BACKLOG-001** (Critical) — Landing payroll calculator NSSF Tier-II and PAYE-base bugs in `compute-payslip.ts`; reconcile to the backend engine.
2. **AUTHZ-BACKLOG-002** (High) — PAYROLL_OFFICER missing from the `GET /runs`, `GET /runs/{id}`, `GET /runs/{id}/payslips` `@PreAuthorize` grants (though present on `POST /runs` + `/calculate`); can create a run but not list/view it.
3. **FE-BACKLOG-015** (High) — No LINE_MANAGER leave-approval surface under `/my/*`; backend capability is unreachable.
4. **PRODUCT-BACKLOG-002** (High) — Product/home copy claims statutory filing is "Live"/"Filed" (and WHT) with no transmission; reconcile to pricing-page roadmap framing.
5. **AUTHZ-BACKLOG-003** (High) — LINE_MANAGER omitted from `GET /employees/{employeeId}/payslips` and `GET /payslips/{id}` `@PreAuthorize`; line managers can't view their own payslips. Sweep the full `@PreAuthorize` matrix for LINE_MANAGER + PAYROLL_OFFICER (covers H1, H4) rather than patching per-endpoint.
6. **FE-BACKLOG-016** (Medium) — React-Query failures render generic "Check your connection" for non-network errors (e.g. 403), and error + empty-state can render together (payroll).
7. **FE-BACKLOG-017** (Medium) — `/{workspace}/access-denied` route is missing (404); add a workspace-scoped access-denied page.
8. **LEAVE-BACKLOG-002** (Low) — Leave request detail: response/type contract gaps (`employeeNumber` blank, reviewer shown as email).
9. **LEAVE-BACKLOG-003** (Low) — Leave balances show fractional values (paternity 9.3, compassionate 3.3) and surface ineligible types (paternity for a female employee); confirm accrual/eligibility.
10. **UI-BACKLOG-004** (Low) — `RoleBadge` LINE_MANAGER purple via hardcoded hex / arbitrary Tailwind values; move to brand tokens and audit the colour map.

(Plus P1/P2 polish items, optionally folded into LANDING/COMPLIANCE docs cleanup.)

## Existing backlog items confirmed

- **LEAVE-BACKLOG-001** — confirmed live (M2): approve note not persisted; the UI presents a dead "Notes (optional)" field.
- **FE-BACKLOG-014** — confirmed live (M1): "Change password" → `/my/change-password` 404.
- **AUTH-BACKLOG-002** — confirmed live (M1): no voluntary password-change page for ADMIN.
- **AUTHZ-BACKLOG-001** — confirmed relevant (H1): the PAYROLL_OFFICER payroll gap is exactly the kind of grant-intent gap this item exists to resolve; H1 makes it concrete and user-visible.

## Decision doc conflicts

- **Audit principle vs. landing calculator (C1):** The audit states "The Compliance Service is the sole authority; the frontend should display whatever it returns without recalculation." The landing calculator (`compute-payslip.ts`) **recalculates client-side** from rate data and gets it wrong. This violates the stated architecture and is the proximate cause of C1.
- **`2026-06-14-run-03-ia-reorganization.md` (benign):** the R3-1 doc describes the user-menu chip's "My profile" linking to `/my/profile`; the shipped chip links to `/admin/profile`. This is a benign supersession by the Run-03-close work (the prompt itself documents "Admin sees `/admin/profile`" as the intended end-state), not a defect. Noted, not filed.
- No conflicts found with the licence-read-through, gate-2, display-name, role-canonicalization, user-deactivation, or tenant-006-invite decisions. R3-0's "strict rename, not re-privilege" is internally consistent with H1 (it explicitly deferred privilege intent to AUTHZ-BACKLOG-001).

## Audit limitations

Honest accounting of what was **not** fully exercised:

- **Empty-state walk on a dedicated clean tenant was not performed.** Tenant creation is not a supported operation (PLATFORM-BACKLOG-001), and hand-inserting a tenant across 13 service databases risked destabilising the shared audit environment. Empty states were instead observed incidentally where they occur (e.g. payroll "No payroll runs yet…" renders sensibly, though marred by M3's concurrent error banner). A dedicated empty-tenant pass remains outstanding.
- **Scenario 2 (onboarding) and Scenario 3 (deactivation full cycle) were not run end-to-end.** The self-deactivation / last-admin guard was verified at the UI level (admin's own row exposes no Deactivate/Change-role control) and the "Show inactive users" toggle is present, but the invite→temp-password→first-login flow and a full deactivate→hide→toggle→reactivate cycle were not exercised (to avoid churning demo accounts and for time).
- **Negative leave paths not exercised:** over-balance application, past-date application, and overlapping-date application were not driven in the browser. (Code shows apply is `isAuthenticated()` with policy checks server-side, and that the backend **trusts the client-supplied `days`** without recomputing from the date range — a data-integrity risk worth a dedicated test.)
- **LINE_MANAGER team-scoped approval data could not be tested with realistic data.** The synthetic `linemanager@demo.co.ke` has a dangling `employee_id` (no real department), so its `/my` data endpoints 403 and department-scoped queues can't resolve. The H2 structural finding (no approval UI at all) stands independently of this.
- **Secondary surfaces given only light coverage:** departments/positions create/edit modals (FE-BACKLOG-007/-013), bulk-upload template download (R2-6), terminate flow, attendance deep-dive, refresh-token rotation (AUTH-BACKLOG-009), session-expiry-mid-action, DevTools network throttling, and landing mobile 375px responsiveness. These are candidates for a follow-up pass; no findings are asserted about them here.
- **Tooling:** browser evidence was gathered via Claude Preview (Chromium) driving the live dev servers; the app uses axios (XHR), so network bodies were confirmed via console error codes and curl rather than a fetch hook. Finding Zero's three personas and all six audit personas were logged in and exercised in the browser.

### Demo accounts created for this audit (test data)
`hrofficer@`, `payroll.officer@`, `linemanager@demo.co.ke` were created (credentials recorded out-of-band, not in this doc) so the HR_OFFICER, PAYROLL_OFFICER, and LINE_MANAGER personas could be tested; one annual-leave request was applied as jane and approved as HR_MANAGER (now Approved). These are demo-tenant test artifacts, not product changes.
