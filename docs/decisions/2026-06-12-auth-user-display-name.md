# Decision — auth user display name (AUTH-BACKLOG-006)

**Date:** 2026-06-12 · **Status:** Accepted · **Scope:** standalone backlog clear (not a declared run).
**Surfaced by:** Bug 4 (leave reviewer showed a UUID) — the system identifies people by email everywhere
because auth users have no name.

## Context
`users` (auth-service) has `email`, `phone_number`, `employee_id`, but **no name**. `/api/auth/me` returns
`fullName: undefined`; `/admin/users` and the leave reviewer show email. Employee records
(employee-service) hold `first_name` / `last_name`. 33 of 38 users have an `employee_id`; 5 (admin,
super-admin, standalone HR) do not.

## Decision: store a `display_name` column (Option A), do **not** resolve names via gRPC on read.

`/api/auth/me` is a **hot path** — the tenant-portal `CurrentUserProvider` calls it on essentially every
page load. Resolving the name with a synchronous gRPC call to employee-service on every `/me` would add
cross-service latency + coupling to a hot path, which the architecture rules explicitly warn against
(no synchronous gRPC in hot paths). So the name is **stored** on the user record and travels with `/me`
and `/users` as a plain local read. gRPC to employee-service is used only at **write time**
(provisioning) and a **one-time backfill** — both cold paths.

### NULL semantics
`display_name` is **nullable**. For users with no linked employee (admin / super-admin / standalone), it
is stored as **NULL**, and callers **fall back to email at read time**. We deliberately do **not** copy
the email into the column — this keeps "no name set" (NULL) distinct from "name happens to equal email".

### Population / write path (today)
1. **Provisioning** (`AuthService.provisionForActivation`): resolve the employee's name via the existing
   `EmployeeGrpcClient.getEmployee` (cold path) and store `"firstName lastName"`.
2. **One-time backfill** for existing users. auth and employee are **separate databases**, so this is
   **not** a Flyway SQL join — it is an app/gRPC (or, in dev, a cross-DB data script) that maps
   `employee_id → employee name` and sets `display_name`. Production: run an equivalent one-time job.

There is **no name-override UI**. The **employee record is the source of truth** for a person's name.
If a future design lets users set/override their displayed name independently, that is a **separate
decision** — whoever adds it must reconcile it with the employee-record source of truth rather than
introducing a competing field. This note exists to prevent that conflict.

### Surfaces updated
`/api/auth/me` (`UserResponse.displayName` → BFF `fullName`), `/admin/users`
(`TenantUserResponse.displayName`). Both display **`displayName ?? email`**. The leave reviewer is
**out of scope** — it lives in leave-service and Bug 4 already captures the reviewer's email at write
time; giving it a real name is part of the deferred follow-ups below.

## Why not Option B (resolve via gRPC at read)
Cleaner on paper (no migration, always fresh), but it puts a synchronous employee-service call on the
`/me` hot path. Rejected for that reason. The trade-off accepted with Option A is **staleness**: if an
employee is renamed, the stored `display_name` lags until re-synced — addressed by the deferred listener
below.

## Deferred follow-ups (filed, not built)
- **AUTH-BACKLOG-007** — `EmployeeUpdated` event → `display_name` rename sync. Rare event; a listener is
  the right pattern; build when it matters or as part of the identity workstream.
- **UI-BACKLOG-003** — audit of other "who-performed-this-action" UUID display surfaces (audit log,
  documents, etc.), the same class as Bug 4's leave reviewer.

## Related
If the user-lifecycle/identity items (this, AUTH-BACKLOG-007, TENANT-BACKLOG-005 deactivation,
TENANT-BACKLOG-006 standalone invite, UI-BACKLOG-003) are later sequenced as a run, this doc is R3-1's
input. Not building them here.
