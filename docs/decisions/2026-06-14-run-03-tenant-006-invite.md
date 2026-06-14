# Standalone user invite + /my/profile graceful degradation (R3-2c, TENANT-006)

**Date:** 2026-06-14
**Run:** Remediation Run 03, workstream R3-2c
**Status:** Decided and implemented. Browser/HTTP checkpoint passed.
**Branch:** `fix/ux-flow-remediation-03` (depends on R3-0 `ca2e936`, R3-2b `bd63ff9`)

## Context

User provisioning was employee-tied: creating an employee provisions a user. Standalone
users (an external accountant given HR_MANAGER access; tenant admins before their employee
record exists) had no first-class path — they were created at tenant provisioning or by manual
DB insert, and the seed `hrmanager@demo` carries a *dangling* generated `employee_id` purely to
satisfy a CHECK constraint. R3-2c adds a real invite flow.

## Invite contract

- **Endpoint:** `POST /api/v1/auth/users/invite`, **ADMIN-only**.
- **Body:** `{ email, phoneNumber, role }`. Phone is required (`users.phone_number` is
  NOT NULL / unique). Email + phone uniqueness enforced (→ 409 `DuplicateResource`).
- **Roles:** must be in `Role.ADMIN_TIER` = `{ADMIN, HR_MANAGER, HR_OFFICER, PAYROLL_OFFICER}`
  (the R3-0 admin-tier set). Self-service roles (EMPLOYEE, LINE_MANAGER) are rejected
  (422 `INVALID_INVITE_ROLE`) — they come through the employee directory and require an
  employee record.
- **Mechanism:** reuses the AUTH-006 temp-password pattern — generate a one-time password,
  create the user with `mustChangePassword=true`, and **return the temp password once** in the
  response (shown in the UI; no email infrastructure yet). First login forces a password change.
- **No employee link:** the invited user has `employee_id = NULL`.

## Constraint change (V17) with rationale

V14 required an `employee_id` for every role except SUPER_ADMIN and ADMIN, which blocked
standalone HR_MANAGER/HR_OFFICER/PAYROLL_OFFICER. V17 relaxes it:

```sql
CHECK (role IN ('SUPER_ADMIN','ADMIN','HR_MANAGER','HR_OFFICER','PAYROLL_OFFICER')
       OR employee_id IS NOT NULL)   -- NOT VALID
```

- **Rationale:** the constraint's real intent is "self-service roles map to a real person."
  Only EMPLOYEE and LINE_MANAGER are self-service; admin-tier office roles legitimately exist
  without an employee record.
- **Whitelist, not blacklist:** listing the allowed roles forces an explicit decision whenever
  a new role is added (it defaults to *requiring* an employee_id) rather than silently allowing
  null. Kept in sync with `Role.ADMIN_TIER` (+ SUPER_ADMIN) in code.
- **`NOT VALID`:** grandfathers existing rows and enforces on new INSERT/UPDATE only.
- **No data migration.** No table rewrite, no lock concern (CHECK drop + add).

## Grandfathered dangling-id (hrmanager@demo)

The seed `hrmanager@demo` keeps its dangling generated `employee_id` — harmless and left as-is
(no cleanup this run). Going forward, invites create **clean** standalone users with
`employee_id = NULL`; no new dangling IDs are produced.

## /my/profile graceful degradation

`/my/profile` is the one `/my/*` page reachable by standalone admins via the user-menu chip
(R3-1). It now branches on `useCurrentUser().employeeId`:

- **No employee record:** skip the `/employees/me` fetch entirely (`enabled: false`); render a
  user-only view — identity (name/email/role badge), a plain "no employee record linked" note,
  and the password-change action (available to every account). No error banner, no empty
  employee sections, no broken layout.
- **Has employee record:** unchanged full profile.

The **other** `/my/*` pages (dashboard, leave, payslips, attendance) are not linked for these
users and still assume an employee context; making them graceful is a design decision deferred
to **FE-BACKLOG-012**.

## Downstream-assumption audit (no-employee admin-tier users)

Audited the surfaces that could assume a non-null `employee_id` for HR_MANAGER/HR_OFFICER/
PAYROLL_OFFICER before relaxing the constraint:

| Surface | Finding | Disposition |
|---|---|---|
| auth-service `user.getEmployeeId()` derefs | All null-checked, query-guarded (`findByDisplayNameIsNullAndEmployeeIdIsNotNull`), or operate on the **event subject's** employeeId — never the actor's. display_name gRPC resolve never runs for standalone users. | No fix — safe |
| Cross-service `findByEmployeeId` / gRPC `getEmployee` | Keyed on event/path employeeId (the employee being acted on), not on a user's link. | No fix — N/A |
| audit-service actor context | Actor recorded as `updatedBy`/`changedBy` userId strings; `getEmployeeId()` is always the event subject. No actor→employee lookup. | No fix — safe |
| notification recipient resolution | Resolved from employee-scoped events, not from `user.employeeId`. | No fix — safe |
| Frontend `/admin/*` | All `currentUser?.employeeId` optional-chained / comparison-only. | No fix — safe |
| Frontend `/my/*` (non-profile) | Assume employee context; reachable by standalone admins via URL, not linked. | Filed FE-BACKLOG-012 (design decision) |

## Checkpoint (HTTP through real middleware + backend)

| Check | Result |
|---|---|
| Invite HR_MANAGER (no employee link) → appears in /admin/users, correct role | ✅ |
| Temp password returned once (UI reveal) | ✅ |
| Invited user logs in with temp password → forced password change | ✅ (mustChangePassword) |
| After change, `/my/profile` renders user-only (name/email/role), employee sections hidden, no error | ✅ |
| New HR_MANAGER can see the user list (R3-0 ADMIN_ROLES) | ✅ |
| Invite EMPLOYEE via API → rejected, `INVALID_INVITE_ROLE` | ✅ |
| Invite with missing email / duplicate email → validation / 409 | ✅ |

## Follow-up

- **FE-BACKLOG-012** — graceful `/my/*` (dashboard/leave/payslips/attendance) for no-employee users.
- Email delivery for invites (replace the one-time-password reveal) — when email infra lands.
