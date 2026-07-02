# B-5 — Grant-Intent Matrix (role × endpoint authorization)

**Status:** DRAFT — awaiting product/security sign-off. No code changes until the decisions below are made.
**Tracks:** Run-04 B-5 / AUTHZ-BACKLOG-001 (issue #27); folds in SEC-1 / SEC-BACKLOG-001 (surfaced in the Day-4 verification pass).
**Author:** engineering. **Date:** 2026-07-02.

## Purpose

The #16 sweep fixed the *unambiguous* `@PreAuthorize` omissions. The items below are **deliberate privilege decisions**, not one-liners — each needs an owner to say what the intended grant is. This doc states the **verified current grant** for each contested endpoint, the question, options with trade-offs, and a recommendation. Once the "Decision" cells are filled, engineering implements them in one pass.

## Active role taxonomy

`SUPER_ADMIN` (platform, cross-tenant), `ADMIN`, `HR_MANAGER`, `HR_OFFICER`, `PAYROLL_MANAGER`, `PAYROLL_OFFICER`, `LINE_MANAGER`, `EMPLOYEE`. (Reserved, not yet granted: `FINANCE_OFFICER`, `CHIEF_MANAGER`, `CHIEF_OFFICER`, `AUDITOR`.)

Two scoping mechanisms exist and must both be considered per endpoint:
1. **`@PreAuthorize` role gate** — can the role call the endpoint at all.
2. **Ownership / scope** — *which rows* the role may see (`CallerScopeResolver`: ALL / DEPARTMENT / OWN; and the attendance "privileged-set" for cross-employee reads). Adding a role to `@PreAuthorize` **without** adding it to the ownership set makes the endpoint callable but functionally empty (or IDOR-prone if the ownership check is missing entirely).

---

## The six decisions

### D1 — Should HR_OFFICER approve/reject leave?
- **Current (verified):** `POST /leave/requests/{id}/approve` and `/reject` → `hasAnyRole('HR_MANAGER','ADMIN','LINE_MANAGER')`. HR_OFFICER can **list/get** leave (read) but **cannot** approve/reject.
- **Options:** (a) keep HR_OFFICER read-only; (b) grant approve/reject.
- **Recommendation:** **(a) keep read-only** unless HR_OFFICER operationally processes leave in this org. Approval is a manager decision; the role name implies an administrative (non-approving) function. Low confidence — org-structure dependent.
- **Decision:** _______

### D2 — Should HR_OFFICER reach analytics reports / drill-downs?
- **Current (verified):** Dashboard (aggregate) → `ADMIN,HR_MANAGER,HR_OFFICER`. Reports (drill-downs) → `ADMIN,HR_MANAGER` only. So HR_OFFICER sees the summary but not the detail.
- **Tension:** allowing the aggregate but denying its drill-down is inconsistent **unless** reports expose more sensitive detail (individual salaries/comp) than the dashboard.
- **Options:** (a) grant HR_OFFICER on all reports; (b) grant only non-financial reports, keep comp/payroll reports to HR_MANAGER+; (c) keep as-is.
- **Recommendation:** **(b)** — needs a quick content check of each report. If a report surfaces individual pay, restrict; otherwise grant. Medium confidence.
- **Decision:** _______

### D3 — Should PAYROLL_OFFICER (and PAYROLL_MANAGER) read attendance monthly-summary?
- **Current (verified):** `GET /attendance/employees/{id}/monthly-summary` → `ADMIN,HR_MANAGER,HR_OFFICER,EMPLOYEE`. **No payroll role.** Backlog note confirmed: payroll would also need adding to the **ownership privileged-set**, not just the `@PreAuthorize`, to read *other* employees' summaries.
- **Rationale:** payroll computes pay from attendance (overtime, absence deductions). A payroll role that can't read attendance is functionally blocked.
- **Recommendation:** **grant PAYROLL_MANAGER + PAYROLL_OFFICER**, adding them to **both** the `@PreAuthorize` **and** the cross-employee ownership privileged-set. High confidence.
- **Decision:** _______

### D4 — Should EMPLOYEE / LINE_MANAGER download their own payslip PDFs from document-service?
- **Current (verified):** `DocumentController` is class-level `@PreAuthorize("hasAnyRole('ADMIN','HR_MANAGER','HR_OFFICER')")`. Employees **cannot** fetch their own payslip PDF here.
- **Risk if done naively:** adding EMPLOYEE to the role list **without a per-document ownership check is an IDOR** (same class as B-3) — any employee could pull any document by id. Requires the document to carry an owner (`employeeId`) and an ownership guard (`OWN` scope), exactly like the B-3 leave fix.
- **Options:** (a) grant EMPLOYEE/LINE_MANAGER **with** an ownership guard (own documents only); (b) leave payslip self-service to a different surface (e.g. payroll-service payslip endpoint) and keep document-service admin-only.
- **Recommendation:** **(a)** — payslip self-service is core, but it is the **largest** item here: needs a document-ownership column + `OWN`-scope guard, not a role-list edit. Confirm first whether payslip PDFs are even served from document-service or from payroll-service (avoid building it in the wrong place).
- **Decision:** _______

### D5 — Bulk-upload template endpoints have no `@PreAuthorize` — intended?
- **Current (verified):** `GET /employees/bulk-upload/template/xlsx` and `/template/csv` have **no** `@PreAuthorize` (public). The **write** endpoints (`POST` upload, `/{id}/commit`, `/pending-activation`, `/activate`) **are** correctly guarded to `ADMIN,HR_MANAGER`. So the employee-creating paths are safe; only the two blank-template downloads are open.
- **Severity:** low — the templates are static, tenant-data-free scaffolds. The concern is consistency + minor schema disclosure.
- **Recommendation:** add `@PreAuthorize("hasAnyRole('ADMIN','HR_MANAGER')")` (or at minimum `isAuthenticated()`) to the two template endpoints. Trivial. High confidence.
- **Decision:** _______

### D6 (SEC-1, not a grant — a bug) — Employee cannot cancel their own leave
- **Current (verified):** `POST /leave/requests/{id}/cancel` is `@PreAuthorize("isAuthenticated()")` and calls `leaveService.cancel(id, UUID.fromString(userId))`, passing the **X-User-ID (userId)**. But `LeaveService.cancel` compares `request.getEmployeeId().equals(employeeId)` — the stored value is the **employee-record UUID**. `userId ≠ employeeId`, so a normal employee always gets `422 NOT_OWNER`. Reproduced live in the Day-4 pass.
- **Same latent bug:** `GET /leave/employees/{employeeId}/balances` SpEL `#employeeId.toString().equals(authentication.name)` compares an employeeId to `authentication.name` (which is the userId) — also wrong; masked today only because employees use `/me/balances` instead.
- **Recommendation:** **fix** — `cancel` should receive the caller's **X-Employee-ID**, not X-User-ID; and sweep every place that compares `authentication.name` to an `employeeId` (SEC-BACKLOG-001). Not decision-gated; it's broken self-service. High confidence.
- **Decision:** _______ (recommend: approve the fix)

---

## Proposed role × endpoint matrix (contested surface only)

Legend: ✅ granted · 🔒 own-scope only (ownership guard required) · — denied · **bold** = proposed change.

| Endpoint | ADMIN | HR_MANAGER | HR_OFFICER | PAYROLL_MGR/OFF | LINE_MANAGER | EMPLOYEE |
|---|---|---|---|---|---|---|
| leave approve/reject | ✅ | ✅ | — _(D1)_ | — | ✅ (dept) | — |
| analytics dashboard | ✅ | ✅ | ✅ | — | — | — |
| analytics reports (drill-down) | ✅ | ✅ | **✅? (D2)** | — | — | — |
| attendance monthly-summary | ✅ | ✅ | ✅ | **✅ (D3)** | — | 🔒 |
| document payslip PDF | ✅ | ✅ | ✅ | — | **🔒? (D4)** | **🔒? (D4)** |
| bulk-upload template dl | **✅ (D5)** | **✅ (D5)** | — | — | — | — |
| leave cancel (own) | ✅ | ✅ | ✅ | — | ✅ | **🔒 fix (D6)** |

## Implementation plan (once decisions are filled)

One PR per service boundary, each with tests:
1. **leave-service** — D6 cancel identity fix + balances SpEL sweep (+ D1 if granted). *(Security-critical; do first.)*
2. **time-attendance-service** — D3: add payroll roles to `@PreAuthorize` **and** the ownership privileged-set.
3. **employee-service** — D5: guard the two template endpoints.
4. **analytics-service** — D2: per-report grants after a content check.
5. **document-service** — D4: only if scoped self-service is chosen; add document-ownership + `OWN` guard (largest, do last / separately).

Each change ships with an authz test asserting both the allowed and denied roles, matching the #16 sweep's test style.

## Notes
- D3, D5, D6 are high-confidence and low-risk — could ship immediately on a "yes".
- D2 needs a 10-minute report-content check. D4 is a real feature (ownership model), not a grant edit — scope it separately.
- Do **not** add any role to an endpoint without confirming the ownership/scope layer also admits it, or the grant is either empty or an IDOR.
