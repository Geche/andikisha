# Design: admin employee self-service — "Set me up as an employee" (AUTH-BACKLOG-001)

**Status:** Implemented — W1–W5 landed 2026-08-01; W6 browser pass pending. Preconditions verified (§3).
**Date:** 2026-07-31 (v2: revised); implementation 2026-08-01
**Related:** AUTH-BACKLOG-001 (ADMIN-as-employee: no automatic employee record for tenant admins)
**Path:** `docs/superpowers/specs/2026-07-31-admin-employee-self-service-design.md`

## Changelog from draft v1

| Change | Reason |
|---|---|
| Added Section 3, Preconditions | Four load-bearing claims in v1 were unverified. "No auth-service change" is one of them. |
| Added Section 7, API contract | v1 described the endpoint in prose. A builder has to invent the body, the response, and the status codes. |
| Added Section 6, minimal record field policy | "Sensible default employment type" is not implementable. Employee number, department, and start date were unaddressed. |
| Uniqueness moved from application check to database constraint | The v1 idempotency argument does not survive a concurrent double-submit. |
| All client-side state sourced from `/api/auth/me`, never the JWT claim | Both v1 guardrails read the one claim that by design cannot be populated yet. |
| Added link confirmation before the re-login nudge | The link is asynchronous. v1 could instruct a re-login before the link exists. |
| Added Section 9, licence seats | Unaddressed in v1. An admin blocked at the seat limit with no explanation is a plausible failure. |
| Added Section 11, visibility side effects | The admin now appears in employee lists, headcount, and analytics. |
| Added audit event, observability, backout | Self-provisioning by a privileged user is an audit-relevant action. |
| Testing expanded with concurrency, seat limit, role grant, and browser verification | v1 tests would pass while the feature was broken. |

---

## 1. Problem

A tenant ADMIN (and other admin-type roles) is often also a real person who works at the company. In the SME market the founder is usually both owner and employee. Provisioning (`SuperAdminTenantService.createTenantWithLicence`) creates the ADMIN user with no employee record, so their JWT carries no `employeeId`. Self-service (leave, payslips, profile, the whole `/my/*` surface) is keyed on `employeeId`, so an admin has nothing behind it.

## 2. What already exists

The identity plumbing is largely built:

- `User.employeeId` and `User.linkEmployee(UUID)` in auth-service.
- The JWT carries an `employeeId` claim (`JwtTokenProvider`).
- The auto-link chain is wired end to end: employee-service publishes `EmployeeCreatedEvent` on create → auth-service `EmployeeCreatedListener` calls `AuthService.provisionEmployeeUser(...)` → which, finding an existing user with matching email and a null `employeeId` (and not SUPER_ADMIN), calls `linkEmployee(...)` and sets the display name.
- Frontend middleware already lets any authenticated user into `/{workspace}/my/*` and forwards `x-employee-id` from the claim. The `/my/*` pages exist.
- A minimal, statutory-incomplete employee record is already a first-class concept: bulk upload creates `pending_activation = true` records, and PAYROLL-BACKLOG-005 already excludes those from payroll runs and statutory filings.

**Caveat:** the last bullet describes the intent. Section 3 verifies it.

## 3. Preconditions (read-only, complete before any code)

No implementation starts until every row below is answered against the running repo, not against documentation. Record answers inline in this section and commit that edit before Phase B.

| # | Question | Where to look | If the answer is No |
|---|---|---|---|
| P1 | Does `provisionEmployeeUser` add the EMPLOYEE role to the user's role set, or only set `employeeId` and display name? | `AuthService.provisionEmployeeUser`, `User` role collection, role assignment on link | **Scope grows.** The role grant must be added there, because "EMPLOYEE is baseline for anyone with an employee record" is a system-wide invariant, not a property of this endpoint. auth-service is no longer unchanged. |
| P2 | Is `leave:submit:own` (or `leave:create:own`, the two names appear in different docs) granted to EMPLOYEE only? | Leave-service authorisation, permission seed migrations, gateway permission checks | If EMPLOYEE-only and P1 is No, the admin sees the leave form and gets a 403 on submit. P1 becomes blocking. |
| P3 | Is there a unique constraint on employee email within a tenant? | Employee table schema, existing Flyway migrations | A new migration is required (Section 8). Check for existing duplicate rows first: the migration will fail on them. |
| P4 | Does `/api/auth/me` return `employeeId` from the user record, or does it echo the JWT claim? | auth-service `me` endpoint | If it echoes the claim, menu visibility and the post-create poll both need a different source, and the re-login nudge cannot be confirmed. Either change `me` to read the user record or add a light `GET /api/v1/auth/me/employee-link`. |
| P5 | Do `pending_activation` employee records count toward licence seat usage or the tenant employee limit? | Licence check on employee create, seat counting query, billing surface | Decide and document in Section 9. Do not leave it implicit. |
| P6 | How does bulk upload construct a minimal record? Specifically: employee number generation, nullable department, employment type default, start date. | Bulk upload service, `Employee` entity constraints | Section 6 must be filled from the real answers, not from assumption. |
| P7 | Does `/api/v1/auth/me` permission caching (documented at 15 minutes) affect what the admin sees immediately after re-login? | Permission resolution and cache in auth-service | If yes, the nudge copy needs to set the right expectation, or the cache needs invalidating on link. |

### 3a. Verified answers (Phase A precondition pass + Phase B W0)

| # | Answer |
|---|--------|
| P1 | **No role grant.** `User` has a single `Role` field; `provisionEmployeeUser` sets `employeeId` + display name only. The admin stays `ADMIN`. |
| P2 | **Not needed.** Leave-submit is `isAuthenticated()`; payslip own-view and attendance list `ADMIN`. Self-service works for a linked ADMIN — no EMPLOYEE grant, no auth-service change. Filed AUTHZ-BACKLOG-006 (leave-submit has no permission check) and AUTHZ-BACKLOG-007 (single-role vs multi-role divergence). |
| P3 | **No unique constraint** — only a non-unique `idx_employees_email`. V12 partial unique index added (W1). |
| P4 | **`/api/auth/me` reads the DB user record** (`authService.getUser`). Poll + menu visibility work; the JWT (→ `X-Employee-ID`) updates only on re-login. |
| P5 | **No seat check on employee create.** Filed PRODUCT-BACKLOG-002. |
| P6 | `EmployeeNumberGenerator.generate()` (`EMP-%04d`); `employmentType = PERMANENT`; `hireDate` required (non-null) — using today; status defaults `ON_PROBATION`, flipped to `ACTIVE` via the pure domain transition; `department`/`salary` null. Null-department is a new case — filed FE-BACKLOG-023 (verify in W6). |
| P7 | **Moot** — the admin's role is unchanged, so permissions don't change; only `employeeId` is added (not permission-cached). |
| P8 (§16) | **No hard delete** (terminate is a soft status change); nothing unlinks `User.employeeId`. Dangling-link risk is low. |
| W0.3 (audit) | Audit is derived centrally (`EmployeeAuditListener` → `EMPLOYEE/CREATE`, **null actor**). No per-service emit pattern; `EmployeeCreatedEvent` carries no actor. W2 uses an INFO log instead; the null-actor gap is filed as AUDIT-BACKLOG-002. |

## 4. Goal and non-goals

**Goal:** a self-serve action that creates a minimal employee record for the caller, which the existing chain links back to their user, giving them the `employeeId` and the EMPLOYEE role their next session needs for self-service.

**Non-goals:**

- The self-service surface and nav entry into `/my/*` from the admin shell. Own spec, built after this. Note: if P1 confirms the EMPLOYEE role is granted on link, the documented "Switch view" toggle (rendered for users holding an admin role plus EMPLOYEE) already covers part of this. Re-scope that follow-up after P1 is answered.
- Silent token re-issue. v1 uses a confirmed re-login nudge. Silent re-issue drops in behind the same action later.
- Making the admin payroll-eligible. That happens only when they complete salary and statutory details via the existing edit-employee flow.
- Auto-relinking an orphaned employee record whose user was never linked. Separate backlog item.

## 5. Decisions

1. **Minimal record, full self-service access.** Setup creates a record with name, email, phone only. This does not limit `/my/*` visibility: profile, leave, and attendance all work. Only payslips require completed salary and statutory details, because a payslip inherently needs a salary and a payroll run. **Conditional on P1 and P2.** If the EMPLOYEE role is not granted on link, this decision is not achievable and the role grant is in scope.
2. **Eligibility by state, not role list.** Available to any authenticated non-SUPER_ADMIN user whose account has no linked `employeeId`. Naturally covers ADMIN, HR_MANAGER, HR_OFFICER, PAYROLL_OFFICER.
3. **Confirmed re-login nudge for token timing.** After creation the current JWT still lacks `employeeId`. The UI polls until the link is confirmed, then shows a non-forced nudge. Chosen for zero token plumbing. The action is one-time, so the friction is one-time.
4. **Uniqueness is enforced by the database, not by an application read-then-write.** See Section 8.
5. **All client-side state for this feature comes from `/api/auth/me`, never from the JWT claim.** The claim cannot reflect the new link until re-login, so using it for menu visibility or guard logic is blind exactly when it matters.

## 6. Minimal record field policy

Fill from P6. Every field the `Employee` entity requires needs a stated source. Placeholder table to complete:

| Field | Value on self-setup | Notes |
|---|---|---|
| `firstName`, `lastName` | From request body, pre-filled from `/api/auth/me` | Editable in the modal. |
| `email` | From `X-User-Email`. Never from the body. | See Section 12 on email lock-in. |
| `phoneNumber` | From request body, optional | |
| `employeeNumber` | `EmployeeNumberGenerator.generate(tenantId)` → `EMP-%04d` | Reuses the bulk-upload generator; unique per tenant (`UNIQUE(tenant_id, employee_number)`, V3). |
| `departmentId` | `null` | New case — bulk always sets one. Downstream null-tolerance verified in W6 / FE-BACKLOG-023. |
| `employmentType` | `PERMANENT` | The bulk-upload default. |
| `employmentStartDate` (`hireDate`) | **today** | Required non-null — `Employee.create` computes `hireDate.plusMonths(3)`. Inaccurate for a founder but harmless for a non-payroll record; correctable via the edit flow. |
| `status` | `ACTIVE` | Created `ON_PROBATION`, flipped via the **pure** domain `confirmProbation()` inside the create tx (no history row, no extra event) — so a founder never lands in a probation-ending workflow. |
| `pendingActivation` | `true` | Reuses the bulk-upload semantics: excluded from payroll runs and statutory filings. |
| `nationalId`, `kraPin`, `nssfNumber`, `shifNumber`, salary | null | Completed later via the existing edit-employee flow. |

## 7. API contract

### `POST /api/v1/employees/self`

Guard: `@PreAuthorize("isAuthenticated()")`.

Headers, all gateway-supplied, all mandatory:

```
X-Tenant-ID    tenant scope
X-User-ID      actor, for audit
X-User-Email   becomes the employee email
X-Employee-ID  present only if already linked; triggers 409
```

Request:

```json
{ "firstName": "string", "lastName": "string", "phoneNumber": "string|null" }
```

Body email and body tenant are never read. If present, ignore them silently or reject with 400. Pick one and state it.

Success, 201:

```json
{ "employeeId": "uuid", "employeeNumber": "string", "pendingActivation": true }
```

Returning `employeeId` lets the frontend confirm the link against `/api/auth/me` by value rather than by presence.

| Status | Condition | Client behaviour |
|---|---|---|
| 201 | Record created | Begin link confirmation poll |
| 400 | Missing `X-User-Email` or `X-Tenant-ID`, or invalid body | Generic error, no nudge. Defensive only, should not occur behind the gateway. |
| 403 | Caller is SUPER_ADMIN, or tenant is SYSTEM | Hide the action entirely, so this is defensive |
| 409 `ALREADY_LINKED` | `X-Employee-ID` present | "You already have an employee record." Refresh from `/api/auth/me` and hide the action. |
| 409 `EMAIL_IN_USE` | An employee with this email already exists in the tenant, whether detected by pre-check or by constraint violation | "An employee record already exists for your email. Ask your HR administrator to link it." Do not create. Do not show the nudge. |
| 429 | Rate limit, see Section 13 | Retry hint |

Distinguish the two 409s by an error code in the body. The client shows different copy and takes different action.

### BFF `POST /api/employee/self-setup` (tenant-portal)

Forwards to the employee-service endpoint with the caller's headers. Passes through the status code and error code unchanged. No business logic.

## 8. Uniqueness and idempotency

The v1 argument that the two 409s cover the races is incorrect. Two concurrent submits carry the same token with no `X-Employee-ID`, both run the matching-email lookup, neither sees the other's uncommitted insert under read committed, and both insert.

Required:

- A new Flyway migration adding a unique index on `(tenant_id, lower(email))` for non-deleted employee rows. New migration only. Existing migrations are immutable.
- Before writing it, query for existing duplicates in every environment. If any exist, the duplicate cleanup is a separate, prior change with its own decision record, not a silent part of this one.
- The application pre-check on matching email stays, as a fast friendly path, not as the guarantee.
- Map the constraint violation to `409 EMAIL_IN_USE`.

If P3 shows the constraint already exists, this section collapses to the mapping.

## 9. Licence seats

**Resolved (P5): collapses.** There is **no seat/licence check on employee create**, so self-setup cannot be blocked at the limit and needs no seat handling. The billing surface still *displays* seat usage, so the count ticks up by one — filed as PRODUCT-BACKLOG-002. The outcomes below are retained only as the record of what was checked:

- Pending-activation records do not consume seats. Nothing further needed. State it so nobody assumes otherwise later.
- They consume a seat and the tenant has room. Nothing further needed at the endpoint, but the billing surface will tick up by one and the admin should not be surprised. Consider a line in the modal.
- They consume a seat and the tenant is at its limit. The endpoint must return a specific error, and the modal must explain it rather than showing a generic failure. An admin who cannot add themselves, with no reason given, will open a support ticket.

## 10. Flow

```
1. Admin whose /api/auth/me shows no employeeId opens the profile menu
   → "Set me up as an employee".
2. Confirmation modal, pre-filled from /api/auth/me: name and phone editable,
   email read-only.
3. Submit → BFF POST /api/employee/self-setup
   → employee-service POST /api/v1/employees/self
   (email and tenant from gateway headers, never the body).
4. employee-service creates a MINIMAL Employee (pending_activation = true,
   statutory and salary null), emits an audit event, publishes
   EmployeeCreatedEvent after commit.
5. auth-service EmployeeCreatedListener → provisionEmployeeUser → links
   employeeId (and grants EMPLOYEE, subject to P1) to the admin user.
6. UI polls /api/auth/me until employeeId matches the returned value.
   On match → re-login nudge. On timeout → "still activating" state.
7. Next login → JWT carries employeeId → /my/* works.
```

## 11. Frontend behaviour

- Menu entry "Set me up as an employee" renders only when `/api/auth/me` shows no `employeeId` and the user is not SUPER_ADMIN. Not the JWT claim. After a successful setup the entry disappears without a reload, because the `me` payload has changed.
- Modal pre-fills name and phone from `/api/auth/me`, email read-only.
- After 201, poll `/api/auth/me` with backoff (suggested: 500ms, 1s, 2s, 4s, giving roughly 8 seconds total). On `employeeId` match, show the nudge: "You're set up. Log out and back in once to activate your self-service."
- On poll timeout, show a neutral state: the record was created, activation is still in progress, check back shortly. Not an error. The broker retries and the link will land.
- Never show the nudge before the link is confirmed. A user who re-logs in during the gap gets a token still lacking `employeeId` and concludes the feature is broken.

## 12. Email

The auto-link matches on email equality, so the employee record's email is bound to the login email at creation.

Two consequences to decide:

- SME admins often log in as a shared address such as `admin@company.co.ke` rather than a personal one. That address becomes the employee record's email and later the payslip destination. Decide whether the modal allows correcting it. Allowing it breaks the auto-link, since the link matches on email, so if you allow it you need a synchronous link path instead. Recommended for v1: keep it read-only, document the limitation, and let them change it later through the edit-employee flow.
- Confirm that changing the employee email later does not break the existing link. The link should be by id once set, but verify rather than assume.

## 13. Guardrails and edge cases

- **Already linked:** `X-Employee-ID` present → `409 ALREADY_LINKED`.
- **SUPER_ADMIN or SYSTEM tenant:** `403`. No tenant to attach to.
- **Existing matching-email employee:** `409 EMAIL_IN_USE`, never a second record. The un-linked-orphan case (record exists, user not linked) is real but rare. v1's job is only to never create a duplicate. Auto-relink is a tracked follow-up.
- **Double submit:** covered by the database constraint, not by the read check.
- **Rate limit:** a low per-user limit on this endpoint (for example 5 per hour). It is a one-time action, so anything more is either a bug or abuse.

## 14. Audit and observability

- Emit a distinct audit action, `EMPLOYEE_SELF_PROVISIONED`, carrying actor user id, tenant id, resulting employee id, and timestamp. Do not rely on the generic employee-created audit. A privileged user creating a record for themselves is exactly what an auditor filters for.
- Log at INFO on success with tenant and user id. Log at WARN on both 409 paths.
- Counter metric on attempts and outcomes, so an unexpected volume is visible.

## 15. Visibility side effects

Once the record exists, the admin appears in the employee list, in headcount tiles, in department rosters if a department is assigned, and in analytics. That is correct behaviour, but state it so nobody files it as a bug.

One decision to make: are `pending_activation` records excluded from headcount metrics the way they are already excluded from payroll runs? If not, a tenant's reported headcount will differ from its payroll headcount, which is confusing in a compliance product. Either exclude them consistently or label them in the UI.

## 16. Backout

**Resolved (P8): low risk.** There is **no hard delete** — terminate is a soft status change, and nothing unlinks `User.employeeId`, so the "dangling link to a deleted row" case does not occur; the row persists (terminated). A hard-delete path, if ever added, would need to clear the link — note it there.

If a record is created in error, the admin removes it through the existing employee delete or terminate flow. Confirm what that does to `User.employeeId`: a dangling link to a deleted employee would leave the user in a worse state than before, with the menu entry hidden and `/my/*` broken. If the link is not cleared on employee deletion, that is a pre-existing bug this feature makes reachable, and it needs a backlog item.

## 17. Testing

**employee-service:**

- Creates a minimal `pending_activation` record from headers plus body.
- Rejects a caller carrying `X-Employee-ID` with `409 ALREADY_LINKED`.
- Rejects SUPER_ADMIN and SYSTEM tenant with `403`.
- Returns `409 EMAIL_IN_USE` when a matching-email employee exists.
- **Concurrency:** two simultaneous requests for the same user produce exactly one record and one `409`.
- **Seat limit:** behaviour at the tenant employee limit matches the Section 9 decision.
- Employee number uniqueness holds when self-setup and bulk upload run against the same tenant.

**Link chain:**

- `EmployeeCreatedEvent` for a minimal record results in the pre-existing admin user gaining `employeeId`.
- **And the EMPLOYEE role**, if P1 requires the grant. Assert the role set, not just the id.

**Frontend:**

- Menu entry visibility driven by `/api/auth/me`, not the claim. Hidden once linked, hidden for SUPER_ADMIN, disappears without reload after success.
- Modal pre-fill, email read-only.
- BFF forwards headers and surfaces both 409 codes with distinct copy.
- Nudge appears only after link confirmation. Timeout renders the neutral "still activating" state.

**Browser verification (mandatory):** the full path, admin with no record through to `/my/*` working after re-login, observed in the browser under Slow 3G throttle with screenshots. Includes the poll and timeout states. curl evidence is not sufficient for any of the frontend items.

## 18. Commit plan

One conventional commit per workstream:

1. `chore(employee): add unique index on tenant email` (only if P3 requires it, with the duplicate pre-check evidence in the commit body)
2. `feat(employee): add self-setup endpoint for unlinked users`
3. `feat(auth): grant EMPLOYEE role on employee link` (only if P1 requires it)
4. `feat(tenant-portal): add set-me-up-as-employee action`

## 19. Open follow-ups (tracked, not in this spec)

- Surface and nav spec: a first-class entry into `/my/*` for admins. Re-scope after P1. **Hard gate (FE-BACKLOG-022):** a linked ADMIN stays `role = ADMIN`, so role-scoped `/my/*` list endpoints leak tenant-wide data on "my" pages — confirmed for `/my/leave` (`GET /leave/requests`). Every `/my/*` page must call explicit-`employeeId` (own) endpoints before admins are invited in. The AESS nudge copy is deliberately minimal until this is fixed.
- Silent token re-issue, replacing the nudge. Check whether the documented "permission changes force a token refresh" mechanism already gives you most of this before scoping it as new work.
- Auto-relink for orphaned employee records.
- Join payroll: the complete-your-statutory-details path that moves the admin from self-service-only to payroll-eligible.
- Permission naming inconsistency: `leave:submit:own` in the permission matrix versus `leave:create:own` in the role seed. Confirm which is live and file it if both exist.
