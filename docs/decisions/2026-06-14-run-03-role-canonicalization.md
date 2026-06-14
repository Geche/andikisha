# Role-vocabulary canonicalization (R3-0)

**Date:** 2026-06-14
**Run:** Remediation Run 03, workstream R3-0 (keystone, sequenced first)
**Status:** Decided and implemented. Browser/HTTP checkpoint passed.
**Branch:** `fix/ux-flow-remediation-03`

## Context

R3-1's IA audit surfaced that the product carried two competing names for the
HR-officer role, half-wired in opposite directions across the edge and the
backend services. A user assignable `HR_OFFICER` through the UI today was locked
out of the entire web app while holding incoherent partial backend grants. The
"Access" IA category and the R3-2 invite flow both depend on a coherent role
vocabulary, so reconciliation was pulled in as R3-0 and sequenced before any
other Run-03 work.

## Runtime evidence (pre-fix)

Assigned `HR_OFFICER` to a known-password test user and exercised every surface:

| Surface | Pre-fix result |
|---|---|
| `PATCH /auth/users/{id}/role` `HR_OFFICER` | 200 — UI offers a role the backend issues |
| JWT `role` claim | `HR_OFFICER` |
| `GET /api/v1/employees` | 200 (employee-service granted HR_OFFICER) |
| `GET /api/v1/payroll/runs` | **403** (payroll granted `HR`, not HR_OFFICER) |
| `GET /api/v1/auth/users` | 403 (ADMIN/HR_MANAGER only — correct) |
| `GET /api/v1/departments` | **403** (dept granted `HR`+EMPLOYEE, not HR_OFFICER) |
| `/andikisha-demo/admin/*` (middleware) | **307 → /access-denied** (HR_OFFICER ∉ frontend `ADMIN_ROLES`) |
| `/andikisha-demo/my/*` (middleware) | **307 → /access-denied** (no EMPLOYEE role) |

### Root cause — systemic vocabulary drift

- **Authoritative role enum** (`auth/Role.java`, the only roles a JWT can carry):
  SUPER_ADMIN, ADMIN, HR_MANAGER, **HR_OFFICER**, PAYROLL_MANAGER, PAYROLL_OFFICER,
  LINE_MANAGER, EMPLOYEE (+ FINANCE_OFFICER / CHIEF_* / AUDITOR, reserved).
  **There is no `HR` value.**
- `'HR'` was granted in `@PreAuthorize` across **9 services** — every grant **dead**
  (no JWT can carry `HR`). A V15 migration had already deprecated `HR` → `HR_OFFICER`
  at the data/scope layer (`CallerScopeResolver`), but the controller annotations
  were never updated.
- `HR_OFFICER` (the real, issued, UI-assignable role) was granted in only **2
  services** (employee partial, leave) and absent from frontend `ADMIN_ROLES`.
- `PAYROLL_MANAGER` was in the enum + `GET /roles` output + assignable via the
  role-change API, but granted by **0 services** (inert).
- Role distribution (all tenants): EMPLOYEE 29, ADMIN 4, HR_MANAGER 3, HR_OFFICER 1,
  SUPER_ADMIN 1. **`HR`-role users: 0** → removing `HR` needs no data migration.

## Decision

1. **`HR_OFFICER` is canonical; `HR` is eliminated.** Every `'HR'` grant in
   `@PreAuthorize` is rewritten to `'HR_OFFICER'`. `HR` is not a real enum value.
2. **`HR_MANAGER` and `HR_OFFICER` remain distinct roles, not aliases.** Live users
   hold each; the manager/officer privilege split is real and encoded in the enum
   and data.
3. **Canonical operational role set** (enforced + assignable):
   `ADMIN, HR_MANAGER, HR_OFFICER, PAYROLL_OFFICER, LINE_MANAGER, EMPLOYEE`
   (+ SUPER_ADMIN, platform-only). Codified as `Role.OPERATIONAL` — the single
   source of truth, consumed by both the roles-matrix projection and the
   role-assignment guard.
4. **Reserved/future roles** (PAYROLL_MANAGER, FINANCE_OFFICER, CHIEF_*, AUDITOR)
   stay in the enum but are removed from the assignable/displayed surface
   (`GET /roles`) and rejected by the role-change endpoint — no surface for a role
   nothing enforces.
5. **"Admin-tier"** (frontend `ADMIN_ROLES`, and the invite-able set for R3-2 TENANT-006):
   `{ADMIN, HR_MANAGER, HR_OFFICER, PAYROLL_OFFICER}`.

### Scope discipline: rename, not re-privilege

R3-0 is a **vocabulary fix, not a privilege-policy decision** (Gate 1 option (a),
strict rename). The `'HR'` → `'HR_OFFICER'` rewrite restores the *originally
intended* grants. One consequence is accepted deliberately: the rewrite gives
`HR_OFFICER` payroll **approve/run** access (payroll's grant was
`ADMIN, HR_MANAGER, HR` → now `…, HR_OFFICER`). Whether officer-tier *should* approve
payroll is a privilege-intent question, explicitly **deferred to AUTHZ-BACKLOG-001**
and not folded in here.

## Migration (this commit)

- **10 controllers**, `'HR'` → `'HR_OFFICER'` in `@PreAuthorize` (16 grant sites):
  analytics `DashboardController`, audit `AuditController`, document
  `DocumentController`, employee `Department`/`Position` controllers, integration-hub
  `FilingController`, notification `NotificationController`, payroll `PayrollController`
  (×5), tenant `FeatureFlagController`, time-attendance `AttendanceController` (×3).
- **auth-service** — `Role.OPERATIONAL` added; `RolePermissionQueryService` matrix
  sourced from it (drops inert PAYROLL_MANAGER); `AuthService.changeUserRole` rejects
  non-operational roles.
- **frontend** — `ADMIN_ROLES` and the `UserRole` union corrected (`HR` → `HR_OFFICER`);
  `RoleBadge` label/colour map; `auth.test.ts` assertions; `preview` RoleBadge demo.
- **Data migration: none.** Zero users held `HR`.

## Checkpoint (post-fix, HTTP through real middleware + backend)

| Check | Result |
|---|---|
| `PATCH role PAYROLL_MANAGER` (reserved) | **422** "reserved role and cannot be assigned" |
| `GET /roles` | `[ADMIN, HR_MANAGER, HR_OFFICER, PAYROLL_OFFICER, LINE_MANAGER, EMPLOYEE]` — no PAYROLL_MANAGER |
| HR_OFFICER `GET /employees` / `/departments` / `/positions` | 200 / 200 / 200 (departments+positions were 403 pre-fix) |
| HR_OFFICER `GET /payroll/runs` | 200 (newly granted — flagged for AUTHZ-BACKLOG-001) |
| HR_OFFICER `/admin/{dashboard,users,employees,settings/departments,settings/positions}` | **200** (was 307 → /access-denied) |

## Demo-data note

`david.ochieng@demo.co.ke` is a seed `HR_OFFICER` (created 2026-05-15, not a test
artifact). After R3-0 he can access the admin portal and — per the accepted scope
trade-off — approve payroll runs. Acceptable for the demo tenant; flagged for
AUTHZ-BACKLOG-001 to revisit the officer/manager payroll boundary.

## Follow-up

- **AUTHZ-BACKLOG-001** — audit and document the *intent* of every `@PreAuthorize`
  grant across all 9 services, resolving three ambiguities R3-0 surfaces: (1) should
  HR_OFFICER approve payroll runs; (2) should HR_OFFICER reach integration-hub / tenant
  config / other sensitive-config surfaces; (3) the documented HR_OFFICER vs HR_MANAGER
  split per service. Separate remediation run, not R3.
