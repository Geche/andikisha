# User deactivation (R3-2b, TENANT-005)

**Date:** 2026-06-14
**Run:** Remediation Run 03, workstream R3-2b
**Status:** Decided and implemented. Browser/HTTP checkpoint passed.
**Branch:** `fix/ux-flow-remediation-03` (depends on R3-0 `ca2e936`, R3-2a `3f506c7`)

## Context

Tenants need to revoke a user's access (departing staff, role change, mistaken account)
without losing the audit trail that user is referenced in. The `User` entity already had
`is_active` + `deactivate()`/`activate()`, and login/refresh/validate already rejected
inactive users — only an endpoint and UI were missing.

## Decision: soft-delete via `is_active`

Deactivation flips `is_active=false` (recoverable via `activate()`); the row, and every
reference to it, is retained.

- **Hard delete rejected:** it would orphan the actor references that downstream records
  hold (leave reviewer, payroll initiator/approver), and lose the audit trail.
- **Archive (separate table) rejected:** unnecessary complexity for v1; the boolean flag
  plus the existing login/refresh guards already deliver "no access, record retained."

One endpoint serves both directions: `PATCH /api/v1/auth/users/{id}/active` with
`{ "active": false|true }` (boxed `Boolean` + `@NotNull` so a malformed body can't default
to deactivation). ADMIN-only.

## Cascade behaviour — clean under soft-delete (AUTH-006 snapshots cited)

No downstream record breaks, because actor identity is snapshotted at write time and the
user row survives:

- **Leave reviewer:** `LeaveRequest` stores `reviewedBy` (UUID) **and** `reviewerName`
  (String snapshot). Old reviews keep rendering the reviewer's name — it was captured on the
  record, independent of the user's active state. This is exactly what AUTH-006's display_name
  snapshotting was designed to make safe.
- **Payroll actor:** `PayrollRun` stores `initiatedBy`/`approvedBy` as Strings (snapshots).
  Old runs render unchanged.
- **Audit/UUID lookups:** soft-delete keeps the user row, so any UUID→user resolution still
  succeeds (the user simply shows as inactive).
- **Employee record:** **employee-tie is independent.** Deactivating the login does not touch
  employment status (termination is a separate `EmployeeTerminatedEvent` flow), and an active
  employee does not block deactivating its user. Login access ≠ employment.

## Session-expiry trade-off (the load-bearing decision)

The API gateway (`JwtAuthenticationFilter`) verifies the JWT signature **locally and is
stateless** — it never re-checks `is_active` per request. Therefore, on deactivation:

- **Login is blocked immediately** (`AuthService.login` checks `is_active`).
- **Refresh is blocked immediately** (`AuthService.refresh` checks `is_active`), and we also
  **revoke all of the user's refresh tokens** on deactivation.
- **An already-issued access token stays valid until it expires.** Residual window is bounded
  by the access-token TTL: **`JWT_EXPIRATION_MS` = 3,600,000 ms = 1 hour** (refresh TTL is
  7 days but is moot — refresh is blocked).

So deactivation takes full effect within **≤ 1 hour** in the worst case (a user actively
mid-session), and immediately for any new login or token refresh.

### Why no gateway denylist in v1

Immediate revocation would require a Redis-backed token denylist checked on **every** gateway
request (write on deactivate, read on each request). That adds a per-request Redis round-trip
to the hot path and new operational surface (denylist TTL management, cleanup, failure mode
when Redis is down). For an HR/payroll product, a bounded ≤ 1-hour residual window on an
explicit admin action is an acceptable trade for not taxing every request. Login + refresh are
already blocked instantly, so a deactivated user cannot *re-establish* a session — they can
only ride out a token they already held.

### Future trigger to revisit

Add the denylist (or shorten the access-token TTL) when **either**: a paying tenant's policy
requires immediate revocation (e.g. terminating for cause with system access), **or** an
audit/compliance requirement mandates provable instant cut-off. At that point, weigh
denylist-at-gateway vs a shorter access-token TTL (cheaper, no new infra, more refreshes).

## Guards (enforced server-side — UI guards are bypassable)

1. **Last-active-admin:** deactivating an ADMIN is rejected (422, code `LAST_ACTIVE_ADMIN`)
   when no other active ADMIN exists in the tenant
   (`existsByTenantIdAndRoleAndActiveTrueAndIdNot`). Prevents locking the tenant out of
   admin.
2. **Self-deactivation:** rejected (422, code `SELF_DEACTIVATION`) when
   `targetUserId == authenticatedUserId`.
3. SUPER_ADMIN cannot be deactivated through this endpoint (422, `FORBIDDEN_TARGET`).

Both guards have unit tests; the UI also hides the actions (deactivate hidden on self;
deactivate/reactivate shown to ADMIN only) but the endpoint is the real boundary.

## Reactivation

The same endpoint with `{ "active": true }` restores access (no guards needed — there is no
self case because a deactivated user cannot authenticate to call it, and reactivating never
reduces the admin count). The deactivated user can log in again immediately once reactivated.

## UI

`/admin/users` shows **active users only by default**, with a **"Show inactive users"** toggle
that surfaces deactivated rows (dimmed, with an "Inactive" badge). Active rows get a
**Deactivate** action (ADMIN only, never on self); inactive rows get **Reactivate** (ADMIN
only). Guard rejections surface the backend message via toast.

## Checkpoint (HTTP through real middleware + backend)

| Check | Result |
|---|---|
| Deactivate non-admin → cannot log in afterwards | ✅ (login rejected) |
| Deactivated user hidden by default; visible with "Inactive" badge when toggled | ✅ |
| Prior records (leave `reviewerName`, payroll actor strings) still render | ✅ (snapshots) |
| Deactivate last active ADMIN → rejected, `LAST_ACTIVE_ADMIN` | ✅ |
| Self-deactivation → rejected, `SELF_DEACTIVATION` | ✅ |
| Reactivate → user can log in again, badge clears | ✅ |

## Follow-up

- Immediate-revocation denylist / shorter TTL — when a tenant policy or compliance
  requirement demands it (see trigger above).
- AUTHZ-BACKLOG-001 — broader role-grant intent audit (separate).
