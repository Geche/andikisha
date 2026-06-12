# Decision — auth user display name (AUTH-BACKLOG-006)

**Date:** 2026-06-12 · **Status:** Accepted · **Scope:** standalone backlog clear (not a declared run).
**Surfaced by:** Bug 4 (leave reviewer showed a UUID) — the system identifies people by email everywhere
because auth users have no name.

**Working mode (cadence):** the team is in **backlog-cleaning mode** — one backlog item per PR off
`master`, each with its own small audit → scope → verify → merge cycle (not a full gated run). This holds
until a coherent Run 03 scope is decided. This item follows that cadence.

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
2. **Automated startup backfill** for existing users (`DisplayNameBackfillRunner`, `ApplicationRunner`).
   auth and employee are **separate databases**, so this is **not** a Flyway SQL join — the runner finds
   users with an `employee_id` and no `display_name`, resolves each via `EmployeeGrpcClient` (cold path,
   startup), and saves. It is **idempotent and guarded**: a no-op once populated (logs "no backfill
   needed"); unresolvable users (employee-service down, or a dangling `employee_id`) keep `display_name`
   null and are retried next start. This removes the "remember to run a script per tenant" onboarding
   cost. (Dev data was also backfilled manually via a one-off cross-DB script while building this.)

### Backfill test plan
- **No-op:** when no users have `employee_id`-without-`display_name`, the runner makes no DB writes and
  logs "no backfill needed". (unit: `noBackfill_whenNoneNeeding`)
- **Resolves + saves:** a linked user whose employee resolves gets `display_name = "First Last"` and is
  saved. (unit: `backfills_resolvedNames`)
- **Skips unresolvable:** when the employee can't be resolved (gRPC empty / service down), the user is
  left null and **not** saved — no error thrown. (unit: `skips_whenEmployeeUnresolvable`)
- **Idempotent second run:** after a successful backfill, the candidate query returns empty → no-op.
  (covered by the guard query `findByDisplayNameIsNullAndEmployeeIdIsNotNull`)
- **Integration (manual):** restart auth-service against the demo tenant → log shows
  "backfilled N of M"; `GET /api/v1/auth/users` shows names; the 5 employee-less users stay email.

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
