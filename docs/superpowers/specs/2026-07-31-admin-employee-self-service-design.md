# Design: admin employee self-service — "Set me up as an employee" (AUTH-BACKLOG-001)

**Status:** Draft for review
**Date:** 2026-07-31
**Related:** [[AUTH-BACKLOG-001]] (ADMIN-as-employee: no automatic employee record for tenant admins); `project_admin_self_service` memory.

## Problem

A tenant ADMIN (and other admin-type roles) is often also a real person who works at the company — in the SME market, the founder is usually both owner and employee. But provisioning (`SuperAdminTenantService.createTenantWithLicence`) creates the ADMIN **user** with no **employee record**, so their JWT has no `employeeId`. Self-service (leave, payslips, profile — the whole `/my/*` surface) is keyed on `employeeId`, so an admin has nothing behind it.

## What already exists (so this is small)

The identity plumbing is almost entirely built:

- `User.employeeId` + `User.linkEmployee(UUID)` (auth-service).
- The JWT carries an `employeeId` claim (`JwtTokenProvider`).
- **The auto-link chain is wired end-to-end:** employee-service publishes `EmployeeCreatedEvent` on create (`EmployeeService`) → auth-service `EmployeeCreatedListener` calls `AuthService.provisionEmployeeUser(...)` → which, finding an existing user with a **matching email and a null `employeeId`** (and not SUPER_ADMIN), calls `linkEmployee(...)` and sets the display name.
- The frontend middleware already lets **any authenticated user** into `/{workspace}/my/*` and forwards `x-employee-id` from the claim. The `/my/*` pages already exist.
- A minimal, statutory-incomplete employee record is already a first-class concept: bulk upload creates `pending_activation = true` records, and PAYROLL-BACKLOG-005 already **excludes** those from payroll runs and statutory filings.

So the **only missing piece is a low-friction way for an admin to create their own minimal employee record.** No new linking code, no auth-service change, no middleware change.

## Goal / non-goals

**Goal (this spec — the *identity* half of AUTH-BACKLOG-001):** a self-serve "Set me up as an employee" action that creates a minimal employee record for the caller, which the existing chain links back to their user, giving them the `employeeId` their next session needs for full self-service.

**Non-goals (deliberate follow-ups):**
- The self-service **surface/nav** (a clear entry into `/my/*` from the admin shell) — its own spec, built after this.
- **Silent token re-issue** — v1 uses a re-login nudge (below); silent re-issue can drop in behind the same action later.
- Making the admin **payroll-eligible** — that happens only when they complete salary/statutory details and join payroll, via the existing edit-employee flow.

## Decisions (from brainstorming)

1. **Minimal record, full access.** Setup creates a minimal record (name/email/phone only). This does **not** limit self-service visibility — `/my/*` shows the admin everything a normal employee sees about themselves (profile, leave, attendance). Only **payslips** require completing salary/statutory details, because a payslip inherently needs a salary and a payroll run.
2. **Eligibility by state, not role list.** Available to **any authenticated non-SUPER_ADMIN user whose account has no linked `employeeId`** — naturally covers ADMIN, HR_MANAGER, HR_OFFICER, PAYROLL_OFFICER, etc.
3. **Re-login nudge for token timing.** After setup the current JWT still lacks `employeeId`. v1 shows a reassuring, non-forced nudge: "You're set up — log out and back in once to activate your self-service." Next login mints a token with `employeeId`. Chosen for zero token plumbing; the action is one-time, so the friction is one-time. Clean upgrade path to silent re-issue later.

## Flow

```
1. Admin (no employeeId) opens the profile menu → "Set me up as an employee".
2. Confirmation modal, pre-filled from /api/auth/me: name + phone (editable), email (read-only).
3. Submit → BFF POST /api/employee/self-setup → employee-service POST /api/v1/employees/self
   (email + tenant from gateway headers, never the body).
4. employee-service creates a MINIMAL Employee (pending_activation=true; national_id / kra_pin /
   nssf / shif / salary all null) and publishes EmployeeCreatedEvent.
5. auth-service EmployeeCreatedListener → provisionEmployeeUser → links employeeId to the admin user
   (matching email, null employeeId). [existing chain — no new code]
6. UI shows the re-login nudge. Next login → JWT has employeeId → /my/* works.
```

## Components

**employee-service (the only backend change):**
- `POST /api/v1/employees/self`, `@PreAuthorize("isAuthenticated()")`. Body `{ firstName, lastName, phoneNumber? }`. `email` from `X-User-Email`, `tenantId` from `X-Tenant-ID`, actor from `X-User-ID` (audit). Never trust body email/tenant.
- Creates a minimal `Employee` reusing the existing bulk pending-activation construction (`pending_activation = true`, statutory/salary null, sensible default employment type). Publishes the existing `EmployeeCreatedEvent`.

**auth-service:** no changes.

**tenant-portal (frontend):**
- BFF route `POST /api/employee/self-setup` — forwards to the employee-service endpoint with the caller's headers.
- Profile-menu entry "Set me up as an employee", rendered only when the user has **no `employeeId` claim** and isn't SUPER_ADMIN.
- Confirmation modal: name/phone pre-filled from `/api/auth/me` (editable), email read-only. On success → re-login nudge.

## Guardrails & edge cases

- **Already set up:** if the request carries `X-Employee-ID` → `409 CONFLICT` ("You already have an employee record"). This is also why the menu entry hides itself.
- **SUPER_ADMIN / SYSTEM tenant:** rejected — no tenant to attach to.
- **Existing matching-email employee** (HR already added them): look up an in-tenant employee by the caller's email; if one exists, **do not create a duplicate** — return `409 CONFLICT` with guidance ("An employee record already exists for your email"). Note: normally that record's own `EmployeeCreatedEvent` would already have linked the user; the un-linked-orphan case (record exists but user isn't linked) is rare and its **auto-relink is a follow-up**, not v1. v1's job is only to never create a second record.
- **Idempotency:** a double-submit must not create two records — the "already has `employeeId`" `409` plus the matching-email `409` cover the common races.

## Error handling

- Missing `X-User-Email` / `X-Tenant-ID` → `400` (should never happen behind the gateway; defensive).
- Downstream event publish failure is after-commit (existing pattern); the record is created and the link retries via the broker — the UI still shows the nudge. If creation itself fails, surface a clear error and do not show the nudge.

## Testing

- **employee-service e2e:** self-endpoint creates a minimal `pending_activation` record from headers + body; rejects a caller who already has `X-Employee-ID` (`409`); rejects SUPER_ADMIN / SYSTEM tenant; does not duplicate when a matching-email employee exists.
- **Link chain:** assert `EmployeeCreatedEvent` for a minimal record results in the pre-existing admin user gaining `employeeId` (verify existing `provisionEmployeeUser` coverage; add a focused test if missing).
- **Frontend:** menu entry visibility gated on the `employeeId` claim (hidden once present, hidden for SUPER_ADMIN); modal pre-fill from `/api/auth/me`; BFF route forwards headers and surfaces the `409`/success states; the re-login nudge renders on success.

## Open follow-ups (tracked, not in this spec)

- **Surface/nav spec:** a first-class entry into `/my/*` for admins (beyond the existing "My profile" link) — the second half of AUTH-BACKLOG-001.
- **Silent token re-issue:** replace the re-login nudge with an in-action token swap (mirrors the change-password re-issue), once we decide the nudge is worth removing.
- **Join payroll:** the "complete your statutory details + salary" path (existing edit-employee flow) that moves the admin from self-service-only to payroll-eligible.
