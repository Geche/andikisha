# Run 04 — Audit Remediation Backlog

**Source:** `docs/audits/2026-06-15-tenant-portal-landing-comprehensive-audit.md`
**Date:** 2026-06-15
**Purpose:** A single, prioritised, team-ready list of every item from the 2026-06-15
tenant-portal + landing audit — what is already fixed (for traceability) and what
remains. New items discovered during remediation are included. IDs follow the
`docs/backlog/BACKLOG.md` convention; migrate items there as they are picked up.

> This list covers the **audit-derived** work only. The pre-existing engineering
> backlog in `docs/backlog/BACKLOG.md` (~38 items) is not superseded by this doc.

Effort key: **S** ≤ ½ day · **M** ~1–2 days · **L** > 2 days / multi-service / needs design.
Status key: ✅ done (PR) · 🟡 partially done · 🔲 open.

---

## A. Already fixed in this remediation (do not redo)

| ID / item | Sev | PR | State |
|---|---|---|---|
| Finding Zero — LINE_MANAGER login → `/access-denied` (404) | Crit | #14 | ✅ merged |
| **LANDING-BACKLOG-001** — payroll calculator NSSF/PAYE/insurance-relief math | Crit | #17 | ✅ merged |
| **AUTHZ-BACKLOG-002** — PAYROLL_OFFICER denied payroll-run reads; + full operational-role `@PreAuthorize` sweep | High | #16 | ✅ merged |
| **AUTHZ-BACKLOG-003** — LINE_MANAGER denied `/employees/me` + payslip reads | High | #16 | ✅ merged |
| **PRODUCT-BACKLOG-002** — landing "filing is Live/Filed" overpromise | High | #18 | ✅ merged |
| **AUTH-BACKLOG-002 / FE-BACKLOG-014** — voluntary change-password page (404) | Med | #19 | ✅ merged |
| **FE-BACKLOG-017** — `/{workspace}/access-denied` route missing (404) | Med | #19 | ✅ merged |
| **FE-BACKLOG-016** — payroll error UX: 403-as-"check your connection" + error/empty dual state | Med | #20 | 🟡 payroll done; see B-4 |
| **LEAVE-BACKLOG-001** — approve note silently discarded | Med | #21 | ✅ merged |

**All remediation PRs merged:** #19 and #20 on 2026-06-16, #21 on 2026-06-15.

---

## B. Open — recommended Run 04 scope (prioritised)

### High

**B-1 · FE-BACKLOG-018 — LINE_MANAGER has no leave-approval surface** · 🔲 · **M** · `frontend/tenant-portal`
> ID-collision resolved 2026-06-29: this item was previously mislabelled `FE-BACKLOG-015`,
> which already belongs to the resolved attendance-proxy fix. Reassigned to `FE-BACKLOG-018`.
The approval queue lives only at `/admin/leave`, which LINE_MANAGER cannot reach
(routes through `/my/*`). The backend already grants LINE_MANAGER approve/reject and
gives DEPARTMENT scope (`CallerScopeResolver`), so the capability exists but is
unreachable — the role's primary purpose is impossible in the UI.
*Do:* build a team-approvals surface under `/my/*` (list = `GET /leave/requests`
DEPARTMENT-scoped; approve/reject actions), shown when the LINE_MANAGER role is in the
JWT. Reuse the existing Approve/Reject modals.

**B-2 · PRODUCT-BACKLOG-003 — legal documents claim statutory filing that doesn't exist** · 🔲 · **S (needs legal)** · `frontend/landing`
`app/privacy/page.tsx:13` states AndikishaHR "integrates with KRA iTax … to file
statutory returns on your behalf"; `app/dpa/page.tsx:17` names **"KRA iTax API" as a
sub-processor**. No iTax integration exists (`FilingService` transmits nothing). These
are false representations in **legally binding** documents.
*Do:* legal/business to revise the privacy policy + DPA copy and the sub-processor list.
Not an engineering-only change — owner = legal/product.

**B-3 · AUTHZ-BACKLOG-004 — `GET /leave/requests/{id}` cannot be opened to EMPLOYEE without an IDOR** · 🔲 · **M** · `services/leave-service` (security)
An EMPLOYEE can submit and list their own leave but cannot open a single request by id
(the endpoint excludes EMPLOYEE). It cannot simply be granted: `LeaveService.getRequest(id)`
has **no ownership check**, so granting EMPLOYEE would let any employee read any request
by id.
*Do:* add a self-ownership guard in `getRequest` (caller's `employeeId` must match, or
caller is privileged), then add `EMPLOYEE` to the `@PreAuthorize`. Mirror
`enforcePayslipOwnership` / `enforceAttendanceOwnership`.

### Medium

**B-4 · FE-BACKLOG-016 (cont.) — apply the accurate error/empty pattern to the other list pages** · 🔲 · **M** · `frontend/tenant-portal`
#20 fixed the payroll page (status-derived message; error and empty-state mutually
exclusive; no "check your connection" for a 403). The same generic
"Could not load … check your connection" + possible error/empty dual-render pattern
likely exists on other React-Query list pages.
*Do:* sweep `admin/{leave,employees,users}` and `my/*` list pages; extract a small shared
error/empty helper so it doesn't drift again.

**B-5 · AUTHZ-BACKLOG-001 — grant-intent audit (the deferred design questions)** · 🔲 · **L** · all services
The #16 sweep fixed the unambiguous omissions; these need a product/security decision,
not a one-liner. Resolve and document the intended grant for each:
- Should **HR_OFFICER** approve/reject leave? (currently read-only on leave.)
- Should **HR_OFFICER** reach analytics **reports** (drill-downs), given they have the dashboard?
- **PAYROLL_OFFICER** on attendance `monthly-summary` — needs adding to the ownership
  privileged-set, not just the `@PreAuthorize`, to be functional.
- **Document-service** is admin-only — should EMPLOYEE/LINE_MANAGER download their own
  payslip PDFs there?
- Public **bulk-upload template** endpoints have no `@PreAuthorize` — intended?
*Do:* produce a role × endpoint intent matrix, then implement the agreed grants in one pass.

### Low

**B-6 · LEAVE-BACKLOG-002 — leave request detail: blank "Employee number" + reviewer shown as email** · 🔲 · **S** · `leave-service` + `frontend/tenant-portal`
Detail page renders an empty "Employee number" (the API never returns it) and shows the
reviewer as a raw email rather than a display name. (#21 already fixed the reviewer-note
display.)
*Do:* either populate/remove `employeeNumber`, and resolve the reviewer to `display_name`.

**B-7 · LEAVE-BACKLOG-003 — odd leave balances (fractional, ineligible types)** · 🔲 · **M** · `leave-service`
Balances show PATERNITY **9.3** and COMPASSIONATE **3.3** (fractional), and PATERNITY is
shown for a female employee.
*Do:* confirm the accrual/proration formula and add gender/eligibility filtering for
leave types.

**B-8 · UI-BACKLOG-004 — `RoleBadge` LINE_MANAGER is purple via hardcoded hex** · ✅ (2026-06-29) · **S** · `frontend/packages/ui`
`RoleBadge.tsx:20` uses `bg-[#F3E8FF] text-[#6B21A8]` — purple, hardcoded hex, arbitrary
Tailwind values; triple violation of `frontend/CLAUDE.md` (no purple / no hex / no
arbitrary values).
*Done:* whole role-colour map moved onto brand tokens (no hex, no blue/purple). The map also had
PAYROLL_OFFICER blue-hex and HR_MANAGER amber text-hex — all three fixed: HR_MANAGER→`amber-text`,
PAYROLL_OFFICER→`amber-50/700`, LINE_MANAGER→`success-bg/success`. Tradeoff accepted: roles now share
hue families (differ by shade) since the brand palette has no blue/purple.

**B-9 · AUTH-BACKLOG-010 — change-password wrong-current-password message is misleading** · ✅ (2026-06-29) · **S** · `services/auth-service`
A wrong **current** password on change-password returns "Invalid email or password" — no
email is involved.
*Done:* added a message-bearing `InvalidCredentialsException(String)` ctor and throw
"Current password is incorrect" only on the change-password check. Login's vague anti-enumeration
default is unchanged (it is shared across 5 call sites). Unit test asserts type, still green.

**B-10 · LANDING-BACKLOG-002 — verify remaining feature bullets are shipped, not roadmap** · ✅ (2026-06-29) · **S** · `frontend/landing`
`components/cta/JoinCTA.tsx` lists "Employee payslips via SMS or WhatsApp" and
"KRA P9 annual returns at year-end" as shipped; SMS/WhatsApp payslips were on the pricing
**roadmap** per the audit.
*Done:* verified both unshipped — zero SMS/WhatsApp code in any service; "P9" exists only as a
`DocumentType.P9_FORM` enum value with no generation wired. Both bullets removed from the CTA.
Remaining 4 bullets are real. (Bullet 3 "P10A/NSSF/SHIF returns auto-generated" is out of B-10 scope;
#18 reviewed filing copy.)

### Polish

**B-11 · payslip detail label "NHIF / SHIF" is stale** · ✅ (2026-06-29) · **S** · `frontend/tenant-portal`
NHIF was replaced by SHIF in Oct 2024; the payslip detail still labels the health line
"NHIF / SHIF". Rename to "SHIF". (Propose **PAYROLL-BACKLOG-006**.)
*Done:* `my/payslips/page.tsx` health line relabelled "SHIF" (value is `p.shif`). The remaining
"NHIF / SHIF Number" **ID-field** labels (employee form/profile) are a separate copy item, not touched.

**B-12 · COMPLIANCE-BACKLOG-002 — PAYE band-2 ceiling wrong (was 32,300, correct is 32,333)** · ✅ (2026-06-29) · **M** · `payroll-service` + `compliance-service` + docs
The original premise was inverted: `CLAUDE.md` already said 32.3K, while the **code** was the outlier.
Verified against KRA (kra.go.ke): band-2 is the next KES 8,333 after the first 24,000 (24,001–32,333 @ 25%);
annual 388,000 ÷ 12 = 32,333.33, gazetted **32,333**. The settled 32,300 (citing an unsourced "387,600 ÷ 12")
was wrong and slightly over-deducted PAYE above the band.
*Done:* `KenyanTaxCalculator.BAND_2_LIMIT` 32,300→32,333; new migration `V6__correct_paye_band2_ceiling.sql`
corrects the seeded rates (V4 left intact); test seed + regression guards in compliance & payroll flipped to
32,333 (suites green); release note corrected; `CLAUDE.md`/`README.md` made precise. Was scoped **S**, was
actually **M** (multi-service + Flyway + test fallout).

---

## C. Suggested team split (parallelisable)

- **Backend / authz pair:** B-3 (IDOR guard), B-5 (intent audit), B-9 — security mindset.
- **Frontend pair:** B-1 (LINE_MANAGER approvals — the biggest UX gap), B-4 (error-pattern sweep), B-8 (RoleBadge).
- **Leave domain:** B-6, B-7 (own the leave detail/balance correctness).
- **Marketing/legal:** B-2 (legal docs — blocks on legal), B-10, B-11, B-12 (claims + copy + docs).

**Fastest wins to merge first:** review/merge the three open PRs (#19, #20, #21), then B-8/B-9/B-11/B-12 (all **S**).

---

## D. Audit limitations still outstanding (not findings — coverage gaps to close)

From the audit's "Audit limitations": a dedicated **empty-tenant** walk, Scenarios **2**
(onboarding) and **3** (deactivation full cycle), negative leave paths (over-balance /
past-date / overlap), bulk-upload template download, departments/positions modals,
terminate flow, refresh-token rotation, and **landing mobile 375px** responsiveness were
not exercised. Also flagged for a dedicated test: the backend **trusts the client-supplied
leave `days`** (no server recompute from the date range) — an integrity risk.
