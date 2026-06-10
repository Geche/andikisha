# AndikishaHR Engineering Backlog

Items that were deferred during development with clear rationale. Ordered roughly by priority within each section.

---

## Engineering Practice

### EMP-BACKLOG-002 — Relax NOT NULL constraints on employees.nhif_number and employees.national_id

**Raised:** 2026-06-01
**Priority:** Medium — V1 workaround in place; no functional regression, but semantic inconsistency.

**Status:** ✅ RESOLVED 2026-06-09 (UX-flow-remediation-01, W5). Migration
`V10__make_employee_optional_ids_nullable.sql` drops NOT NULL on `national_id`,
`phone_number`, `kra_pin`, `nhif_number`, `nssf_number`; the `Employee` entity
`@Column` flags were updated to match; and `BulkUploadService` now stores NULL —
not the colliding `"+254700000000"` / `"PENDING-<empNum>"` / `""` placeholders —
for absent optional fields. The placeholders had caused HTTP 409 DUPLICATE on the
second incomplete bulk row (and a NOT NULL violation on empty kra_pin); both were
masking a real defect once bulk upload was exposed in the UI (W5).
**Verified:** two fully-incomplete rows now commit (`createdCount: 2`, previously
409 on row 2), stored with NULL national_id/phone_number; single-employee creation
still requires all five via `CreateEmployeeRequest` `@NotBlank`.
**Note:** existing placeholder rows were left untouched (NULLs do not collide with
them, so no functional need to rewrite live data). An optional one-off cleanup
(`PENDING-*` / `'+254700000000'` / `''` → NULL) can land as a follow-up migration
if the semantic tidiness is wanted — tracked here, not blocking.

**Background:**
The `employees` table has `nhif_number VARCHAR(20) NOT NULL` and `national_id VARCHAR(20) NOT NULL`. These constraints date from the single-employee creation flow where both fields are required at creation time.

Bulk upload (`BulkUploadService.createFromRow()`) does not require these fields — they are listed as optional in the upload template. The V1 workaround inserts:
- `nhif_number = ""` (empty string) when the CSV row has no SHIF number
- `national_id = "PENDING-{empNum}"` when the CSV row has no national ID

This creates a semantic-versus-structural null inconsistency: the column is structurally non-null but semantically blank. A downstream query for `nhif_number IS NULL` would not match these rows even though they have no real SHIF number.

**Fix:**
```sql
-- Flyway migration V10
ALTER TABLE employees ALTER COLUMN nhif_number DROP NOT NULL;
ALTER TABLE employees ALTER COLUMN national_id DROP NOT NULL;
```

Then remove the placeholder logic from `BulkUploadService.createFromRow()`:
```java
// Remove:
if (nationalId.isEmpty()) nationalId = "PENDING-" + empNum;
// Replace nhifNum fallback with null:
nhifNum.isBlank() ? null : nhifNum,
```

The single-employee creation endpoint (`POST /api/v1/employees`) already validates `nhifNumber` and `nationalId` as required via the `CreateEmployeeRequest` Jakarta validation annotations — removing the DB constraint does not make them optional for the HR creation flow.

**Preconditions before migrating:**
1. Clean up existing `"PENDING-*"` nationalId values and `""` nhifNumber values from bulk-uploaded rows (query and update with real values or explicit NULL)
2. Confirm no application code does `nhif_number IS NOT NULL` as a meaningful business check

---

### VERIFICATION-NOTE-001 — Behavioral verification gates have caught real bugs; discipline is justified by evidence

**Raised:** 2026-05-31
**Type:** Process note — not a feature backlog item. Recorded here so the evidence is searchable alongside the work it validated.

**Finding:**
Across Steps 3 and 5, behavioral verification gates (curl tests, DB queries, live-service tests) surfaced two real defects that passed all build-level checks:

1. **Leave-service test cascade (Step 3):** Adding `EmployeeGrpcClient` to leave-service broke `contextLoads()` because the full Spring context couldn't wire the gRPC channel. This cascaded into 20 failing integration tests (`JdbcBatchUpdateException` on simple `save()` calls) due to Spring's context cache poisoning. Build reported `BUILD SUCCESSFUL` for the service JAR; tests failed only when the context was loaded against a real H2 DB in the test suite. Fixed by adding `@MockitoBean EmployeeGrpcClient` to `LeaveServiceApplicationTest`.

2. **Audit log masking defect (Step 5):** `EmployeeService.update()` was logging `"****" + fullAccountNumber` (e.g. `****1234567890`) instead of `"****" + last4` (e.g. `****7890`). The service compiled, all unit tests passed, and the endpoint returned HTTP 200. The defect was only visible when querying `employee_history` after a live PUT call. Fixed by extracting a `maskAccount()` helper and corrected the one bad row in the database (see `docs/Engineering/backfill/2026-05-31-audit-log-masking-fix.md`).

**Implication:**
Behavioral verification — running actual API calls against a live service and checking database state — is not redundant with build-level checks. It catches:
- Context wiring bugs that compile but fail at runtime
- Data formatting bugs that apply incorrect logic but return HTTP 200
- Cross-layer discrepancies between what the code does and what the DB stores

**Policy:**
Continue requiring behavioral verification on all user-touching surfaces and regulated data paths (tier-2 fields, audit log, session revocation, role enforcement). Screenshots and DB queries in the initial verification report, not as a second-pass addition after prompting.

---

## Platform

### EMP-BACKLOG-001 — Implement ListEmployees gRPC RPC (paginated + department filter)

**Raised:** 2026-05-31
**Priority:** Medium — the RPC is defined in employee.proto but unimplemented in EmployeeGrpcService.

**Background:**
`employee.proto` defines `rpc ListEmployees(ListEmployeesRequest) returns (ListEmployeesResponse)` with an optional `department_id` filter field. The gRPC server in `EmployeeGrpcService` does not implement this method.

This was discovered during Step 2 visual verification: `EmployeeGrpcClient` in leave-service initially called `stub.listEmployees()` for department-scope filtering of leave requests and received `grpc-status: UNIMPLEMENTED`.

**Workaround in place:** Leave-service's `EmployeeGrpcClient.getEmployeesByDepartment()` now calls `listActiveByTenant` and filters by `departmentId` client-side. This is acceptable at SME scale (< 1000 employees) but is inefficient at larger dataset sizes.

**Fix:** Implement `listEmployees()` in `EmployeeGrpcService` with the optional `department_id` and `status` filter parameters, and proper pagination support. Then update leave-service's `EmployeeGrpcClient.getEmployeesByDepartment()` to call it directly.

---

### EMP-BACKLOG-003 — No update endpoint for positions (asymmetric with departments)

**Raised:** 2026-06-09 (UX-flow-remediation-01, R2-5)
**Priority:** Low–Medium — UX asymmetry; no data risk.

**Background:**
`DepartmentController` has `PUT /api/v1/departments/{id}` (update name/description), but
`PositionController` has **no equivalent** — only list (GET), create (POST), and
seed-defaults. The R2-5 settings pages reflect this faithfully: departments are
editable, positions are add-only (no edit affordance is shown, so nothing implies
editing is coming). But users who edit a department will reasonably expect to edit a
position too and can't.

**Fix:** Add `PUT /api/v1/positions/{id}` (update title/description/gradeLevel) in
`PositionController` + `PositionService`, mirroring the department update path
(`@PreAuthorize("hasAnyRole('ADMIN','HR_MANAGER')")`), then add an edit affordance to
`/admin/settings/positions` to match the departments page. Not built speculatively in
R2-5 — tracked here so the asymmetry isn't silently shipped.

---

### AUTH-BACKLOG-005 — Migrate hardcoded scope mapping in CallerScopeResolver to read from role_permissions

**Raised:** 2026-05-31
**Priority:** Deferred — only relevant when the premium per-tenant custom-roles tier is built.

**Background:**
`CallerScopeResolver` in both services hardcodes the role → scope mapping:

- `services/employee-service/src/main/java/com/andikisha/employee/application/service/CallerScopeResolver.java`
- `services/leave-service/src/main/java/com/andikisha/leave/application/service/CallerScopeResolver.java`

The mapping matches the `SYSTEM`-tenant seed data in `role_permissions` exactly and is correct for V1. It is acceptable as long as all tenants share the same fixed role definitions.

**2026-06-05 update (M-3 fix):** HR_OFFICER has been added to the hardcoded mapping (ALL scope on employee:read/update and leave:read). The legacy `HR` role has been removed from the mapping and deprecated (V15 migration). When this backlog item is eventually implemented, the DB-driven query must include HR_OFFICER with `employee:read:all`, `employee:update:all`, and `leave:read:all`.

**When this becomes load-bearing:**
The premium per-tenant role customization feature (deferred per `docs/Engineering/2026-05-22-role-permissions-onboarding-plan.md`) makes `role_permissions` tenant-specific. At that point, a hardcoded mapping would silently ignore per-tenant configuration.

**Fix:**
Replace the `switch` statement in each resolver with a call to auth-service via gRPC:
```
authService.getScope(tenantId, role, resource, action) → ScopeType
```
Or add a `GetRoleScope(tenantId, role, resource, action)` RPC to `auth.proto` that queries `role_permissions` directly.

**IMPORTANT — deletion rule:** The hardcoded constants must be **deleted**, not retained as fallbacks. A fallback to hardcoded values defeats per-tenant configuration; if the gRPC call fails, the right behavior is to deny access (fail-closed), not silently fall back to a default.

**Scope:** 2 files, 1 new gRPC RPC in auth.proto, 1 new handler in AuthGrpcService.

---

### AUTH-BACKLOG-004 — Upgrade V14 NOT VALID constraints to VALIDATE after backfill remediation

**Raised:** 2026-05-31
**Priority:** Medium — correctness gap: existing rows with null `employee_id` on operational roles are not caught by the V14 constraints until manually validated.

**Background:**
Migration `V14__enforce_employee_id_invariants.sql` adds two CHECK constraints with `NOT VALID`:
- `chk_superadmin_no_employee_id` — SUPER_ADMIN must have null `employee_id`
- `chk_operational_role_requires_employee_id` — non-ADMIN, non-SUPER_ADMIN must have non-null `employee_id`

`NOT VALID` means new INSERTs and UPDATEs are enforced immediately, but existing rows in violation are not checked. This was intentional to avoid blocking the migration on legacy dev data.

The backfill audit (`docs/Engineering/backfill/2026-05-31-null-employee-id-audit.md`) identified 25 HIGH-confidence EMPLOYEE users with null `employee_id` (all dev seed data) and 1 LOW-confidence orphan. Once those rows are manually remediated, the constraints can be promoted to full validation.

**Fix:**
After all violating rows are remediated:
```sql
ALTER TABLE users VALIDATE CONSTRAINT chk_superadmin_no_employee_id;
ALTER TABLE users VALIDATE CONSTRAINT chk_operational_role_requires_employee_id;
```

This upgrades both constraints from `NOT VALID` to fully enforced, closing the gap for existing rows.

**Preconditions:**
1. All HIGH-confidence backfill rows manually linked (see backfill audit)
2. LOW-confidence row (`hr@acmekenya.co.ke`) investigated and either linked or deactivated
3. Verified no other nulls remain: `SELECT COUNT(*) FROM users WHERE role NOT IN ('SUPER_ADMIN','ADMIN') AND employee_id IS NULL` → must return 0

---

### AUTH-BACKLOG-002 — No voluntary password change page for ADMIN role

**Raised:** 2026-05-19  
**Priority:** Medium — ADMIN users currently have no self-service path to change their password except by logging out and using forgot-password.

**Problem:**  
The change-password page at `/my/change-password` is the only password-change surface in tenant-portal. It is restricted to users with the EMPLOYEE role. ADMIN users without `mustChangePassword=true` are redirected away from `/my/change-password` to `/admin/dashboard` by the role check in middleware.

The `mustChangePassword=true` path (after provisioning or SUPER_ADMIN reset) correctly allows any role through to `/my/change-password` by skipping role checks. But a voluntary password change by an ADMIN user has no path.

**Fix:** Add `/admin/settings/password` page in the `(admin)` route group. Wire it to the same `POST /api/v1/auth/change-password` BFF endpoint. The change-password form logic is identical — only the route and surrounding chrome differ.

---

### PLATFORM-POLISH-001 — Trial widget sub-label copy is redundant when 7-day and 14-day counts are equal

**Raised:** 2026-05-19  
**Priority:** Low — cosmetic copy issue.

**Problem:**  
The "Trials Expiring (14 days)" `StatCard` on the platform-portal dashboard shows both the 14-day count as the primary value and "N expiring in 7 days" as the sub-label. When all expiring trials also fall within the 7-day window, the two numbers are the same (e.g., value = 2, sub-label = "2 expiring in 7 days"), which looks redundant without explanation.

**Fix:**  
Make the sub-label context-aware:
- When 7-day count equals 14-day count: "All {n} expiring within 7 days"  
- When 7-day count is less: "{n} expiring within 7 days"  
- When 7-day count is 0: omit the sub-label entirely or show "None expiring within 7 days"

**File:** `frontend/platform-portal/src/app/(platform)/dashboard/page.tsx` — `trialsCardVariant` and sub-label logic.

---

### PLATFORM-BACKLOG-001 — Tenant creation UI in platform-portal

**Raised:** 2026-05-18  
**Priority:** High — blocks real demos and first paying customers. Currently a new tenant can only be provisioned via direct API call.

**Context:** `SuperAdminTenantService.createTenantWithLicence` exists and works at the API level. The backend endpoint `POST /api/v1/super-admin/tenants` is complete and tested. Credential email delivery to the new admin is already wired in `notification-service`. There is no UI in platform-portal to invoke any of this.

**What to build:** `/tenants/new` page in `platform-portal` with a form covering:
- Company / organisation name
- Contact details (admin email, admin first name, admin last name, admin phone)
- Subscription tier select: Starter / Professional / Enterprise (maps to `planId`)
- Billing cycle (monthly / annual)
- Seat count
- Agreed price (KES)
- Trial days (default 14)

On submit:
1. Calls `POST /api/v1/super-admin/tenants` with the form data
2. Backend returns `ProvisionedTenantResponse` including `temporaryPassword`
3. UI displays the temp password to the SUPER_ADMIN in a one-time modal with a copy button ("This password will not be shown again")
4. Credential email is already sent to the admin automatically by notification-service — no additional action needed

**Not blocking current work.** Build after Phase 2 workspace setup checklist ships.

---

### TENANT-BACKLOG-003 — extendTrial() updates Tenant.trialEndsAt but not TenantLicence.endDate

**Raised:** 2026-05-19  
**Priority:** Low — cosmetic inconsistency in the list page `End date` column after a trial extension.

**Problem:**  
`SuperAdminTenantService.extendTrial()` calls `tenant.extendTrial(additionalDays)` which extends `Tenant.trialEndsAt`. It does NOT update `TenantLicence.endDate`. The dashboard metrics use `tenantRepository.countByStatusAndTrialEndsAtBetween(...)` which reads `Tenant.trialEndsAt` — so expiry alerts are correct. But the `/tenants` list table shows `licence.endDate` (from `TenantSummaryResponse`) which stays stale after an extension.

**Fix:** In `extendTrial()`, also call `licencePlanService.extendLicenceEndDate(tenantId, additionalDays)` or equivalent to update `TenantLicence.endDate` in the same transaction.

**Update (2026-06-10, UX-flow-remediation-01 R2-7) — full diagnosis attached; deferred deliberately.**
This is the **enforcement-side licence-state divergence** flagged during R2-7. It is broader than the
list-page cosmetic note above and has two coupled symptoms:

1. **Date divergence.** For the demo tenant: `tenant_licence.end_date = 2026-06-13` (future) while
   `tenants.trial_ends_at = 2026-05-28` (past). The platform tenant view shows status **TRIAL** (from
   the licence), **"trial expired"** (computed from `trial_ends_at` being past), and **end date 13 Jun**
   (from `tenant_licence.end_date`) — all at once, which reads as contradictory.
2. **No status transition.** The trial lapsed (28 May) but the licence status was never transitioned
   TRIAL → EXPIRED (no expiry job ran / the two date sources aren't reconciled).

**Confirmed NOT an access blocker.** `AuthService.login` performs no licence/trial check, and an
EMPLOYEE in the same expired-trial tenant authenticates normally — so this is a display/state-consistency
issue, not a login gate. (This is why R2-7's plan change was scoped **record-only**: it deliberately does
**not** transition status or clear the trial state. Fixing this divergence is the deferred enforcement work.)

**Fix (when picked up):** single source of truth for trial/licence end (reconcile `trial_ends_at` and
`tenant_licence.end_date`), and a status-transition path (expiry job) that moves a lapsed TRIAL to EXPIRED.
Priority is **Medium** (correctness of the licence-state shown to operators), not the original "Low/cosmetic".

---

### TENANT-BACKLOG-004 — No backend format validation for tenant statutory fields (KRA PIN/NSSF/SHIF)

**Raised:** 2026-06-10 (UX-flow-remediation-01, R2-7)
**Priority:** Low–Medium — client-validated today; backend accepts any string.

**Problem:**
Tenant statutory fields (`kra_pin`, `nssf_number`, `shif_number`) have no backend format validation.
The R2-7 statutory-edit form validates KRA PIN against `^[A-Z]\d{9}[A-Z]$` (A123456789X) client-side,
and the new `PATCH /api/v1/super-admin/tenants/{id}/statutory` endpoint only enforces `@Size(max=20)` —
a non-form client could store a malformed KRA PIN. (Per the R2-7 directive, the backend gap was filed
rather than fixed in-run, to avoid diverging from the rest of tenant statutory handling unilaterally.)

**Fix:** Add `@Pattern(regexp = "^[A-Z]\\d{9}[A-Z]$")` to `UpdateStatutoryRequest.kraPin` (and the
tenant create request's KRA PIN), mirroring `CreateEmployeeRequest.kraPin`.

---

### TENANT-BACKLOG-005 — User deactivation (no endpoint)

**Raised:** 2026-06-10 (UX-flow-remediation-01, R2-10)
**Priority:** Medium — needed for offboarding / revoking access without deleting history.

**Problem:**
The `User` entity has an `active` flag, but auth-service exposes **no endpoint** to
deactivate/reactivate a tenant user. The R2-10 User Management screen therefore cannot
offer deactivation (correctly excluded rather than faked). Today the only way to cut
access is a password reset, which doesn't disable the account.

**Fix:** Add `PATCH /api/v1/auth/users/{id}/status` (or `/deactivate` + `/reactivate`),
`@PreAuthorize("hasAnyRole('ADMIN','HR_MANAGER')")`, toggling `User.active`; ensure the
JWT/auth path rejects inactive users at login and token refresh. Then surface a
deactivate action on the User Management screen.

---

### TENANT-BACKLOG-006 — Standalone user invite (separate from employee-tied provisioning)

**Raised:** 2026-06-10 (UX-flow-remediation-01, R2-10)
**Priority:** Medium — onboarding admins/officers who are not employee records.

**Problem:**
The only way to create a tenant user today is `POST /employees/provision`, which is
**tied to an employee record**. There is no way to invite a standalone user (e.g. an
external HR/payroll admin) with a role but no employee profile. R2-10 excluded an invite
action for this reason.

**Fix:** Add an invite flow — `POST /api/v1/auth/users/invite` (email + role,
`hasAnyRole('ADMIN','HR_MANAGER')`) issuing a set-password/activation link, decoupled
from employee provisioning. Surface an "Invite user" action on the User Management screen.

---

### TENANT-BACKLOG-007 — Delete actions on Departments, Positions, and Roles screens

**Raised:** 2026-06-10 (UX-flow-remediation-01, browser pass) — **Run 03 candidate**
**Priority:** Medium — list+add+edit shipped (R2-5, R2-8) without delete; delete is new work, not a bug.

**Problem:** No delete affordance on Departments, Positions, or Roles/Permissions. Deletion
is not a trivial add — it has data-integrity implications that need a decision:
- Deleting a **department** with active employees assigned.
- Deleting a **position** referenced by employees / payroll history.
- Deleting/disabling a **role** with users currently assigned.

**Decide in Run 03:** soft-delete vs hard-delete vs archive; block-if-referenced vs reassign-on-delete;
whether roles are deletable at all (they're a fixed enum + SYSTEM-seeded grants). Needs design, not a
quick add.

---

### TENANT-BACKLOG-008 — Settings IA reorganization

**Raised:** 2026-06-10 (UX-flow-remediation-01, browser pass) — **Run 03 candidate**
**Priority:** Low/Medium — IA polish, not a defect.

**Problem/proposal:** Consider moving Departments, Positions, and Roles & Permissions under
User management, leaving Settings as "coming soon". **Open tension:** Departments and Positions are
**org-structure**, not users — filing them under "User management" trades one IA problem for another.
The right grouping (org structure vs people vs tenant settings) needs more thought than a quick move.

**Decide in Run 03.** Do not reorganize in this run. Resolve the taxonomy first (likely: Settings hub
with sub-sections for Organisation [depts/positions], People [user management], and Tenant config).

---

### LEAVE-BACKLOG-001 — Approve does not persist reviewer notes

**Raised:** 2026-06-10 (UX-flow-remediation-01, Bug 1 fix)
**Priority:** Low — minor; reject reasons ARE persisted, approve notes are not.

**Problem:** `POST /api/v1/leave/requests/{id}/approve` takes **no body** — `leaveService.approve(id,
userId, userName)` has no notes parameter. The Approve modal still shows an optional "notes" textarea;
after the Bug 1 method fix (PATCH→POST) approve succeeds, but any text entered is silently dropped.

**Fix (pick one):** either add an optional `notes` field to the approve endpoint + persist on the
leave request's review record (mirroring how `rejectionReason` is stored), or remove the notes textarea
from the Approve modal so the UI doesn't collect data it discards.

---

### TENANT-BACKLOG-002 — Server-side search and plan filter for SUPER_ADMIN tenant list

**Raised:** 2026-05-19  
**Priority:** Low — V1 uses client-side filter on the visible page; only matters at scale.

**Problem:**  
`SuperAdminController.listTenants()` accepts `search` (free-text) and `planId` (UUID) query params but the service layer silently ignores them. `TenantRepository` does not extend `JpaSpecificationExecutor` and has no search-capable query methods. The `filterTenants()` service method only branches on `status`.

**V1 workaround:** Client-side filter on the visible page (whatever Spring Pageable returns). Accurate up to the page size.

**Implement when:** Tenant count exceeds ~200, at which point a single page no longer covers the working set and the SUPER_ADMIN needs server-side filtering.

**What to build:**
1. `TenantRepository extends JpaSpecificationExecutor<Tenant>`
2. `TenantSpecification` — predicates for `companyName ILIKE %search%` and `plan_id = :planId`
3. Wire into `SuperAdminTenantService.filterTenants()` and `listTenants()`
4. Add `search` and `planId` as first-class filter params in service method signatures

---

## Notifications

### NOTIFICATION-BACKLOG-001 — notification-service ignores all lifecycle events except TenantCreated

**Raised:** 2026-05-19  
**Priority:** High — required before the platform serves real paying customers.

**Problem:**  
`TenantEventListener` in `notification-service` handles exactly one event: `TenantCreatedEvent` (welcome email). The following events are published to RabbitMQ but produce no email notification:

| Event | Published by | Missing notification |
|---|---|---|
| `TenantSuspendedEvent` | `LicenceStateMachineService` | Suspension notice to tenant admin |
| `TenantReactivatedEvent` | `LicenceStateMachineService` | Reactivation confirmation to tenant admin |
| `TenantCancelledEvent` | `SuperAdminTenantService` | Cancellation confirmation (required for legal/audit) |
| `LicenceRenewedEvent` | `LicencePlanService` | Renewal confirmation to tenant admin |
| `LicenceUpgradedEvent` | `LicencePlanService` | Upgrade confirmation to tenant admin |

**Impact:** A suspended tenant has no way of knowing their account was suspended. A cancelled tenant receives no formal notification — this is a legal/audit risk for KDPA compliance.

**What to build:**  
Add cases to `TenantEventListener` for each event above. Write email templates for: suspension (with reason), reactivation, cancellation, renewal, upgrade. Use the existing `EmailService` / `NotificationService` pattern from `TenantCreatedEvent` handling.

Also wire `audit-service` `TenantAuditListener` to handle `TenantCancelledEvent`, `TenantReactivatedEvent`, `LicenceRenewedEvent`, and `LicenceUpgradedEvent` (currently only handles `TenantCreatedEvent` and `TenantSuspendedEvent`).

---

## Product

### PRODUCT-BACKLOG-001 — Bank EFT prominence in payroll disbursement UX

**Raised:** 2026-05-15  
**Context:** The create form removes the bank account fields (correct — not in `CreateEmployeeRequest`). Bank details are edit-only via `UpdateEmployeeRequest`. M-Pesa (via phone number) is the implicit default disbursement channel.

**Question for product:** Do a meaningful proportion of Kenyan SMEs — particularly those in formal sectors (manufacturing, construction, professional services) — use bank EFT as their *primary* payroll disbursement method rather than M-Pesa? If yes, the edit-form bank capture flow needs to be surfaced more prominently than a buried optional field, and the payroll disbursement UI should make the channel selection explicit rather than defaulting silently to M-Pesa.

**Options to evaluate:**
1. Bank account is a recommended (not optional) step during onboarding, surfaced as a wizard step after employee creation
2. First payroll run for an employee without a bank account prompts: "This employee has no bank account. Payroll will be disbursed via M-Pesa to {phoneNumber}. Is that correct?"
3. No change — M-Pesa default is correct for the SME target market

**Not blocking current work.** Decide before building the payroll disbursement UI.

---

## Security

### SEC-BACKLOG-001 — Audit @PreAuthorize SpEL expressions across all services for User-vs-Employee UUID mismatches

**Found:** 2026-05-15 during dashboard data-loading investigation  
**Milestone:** B1 (multi-role JWT + UserContext)

**Problem:**  
`TrustedHeaderAuthFilter` sets `authentication.name` to the User entity UUID (from `X-User-ID` header). Several `@PreAuthorize` SpEL expressions check employee ownership by comparing the `{employeeId}` path variable against `authentication.name`, expecting them to be equal. They are not — User UUID and Employee UUID are different entities.

**Known instances:**

| Service | Endpoint | Expression | Status |
|---|---|---|---|
| `leave-service` | `GET /api/v1/leave/employees/{employeeId}/requests` | `#employeeId.equals(authentication.name)` | Fixed (workaround: added EMPLOYEE to hasAnyRole) |
| `leave-service` | `GET /api/v1/leave/employees/{employeeId}/balances` | `#employeeId.equals(authentication.name)` | Workaround: `/leave/me/balances` added 2026-05-16 (root cause unfixed) |
| `payroll-service` | `GET /api/v1/payroll/employees/{employeeId}/payslips` (service layer) | `authentication.getName()` compared to employeeId | Fixed (credentials field in auth token) |
| `payroll-service` | `GET /api/v1/payroll/payslips/{id}` (service layer) | `authentication.getName()` compared to employeeId | Fixed (same credentials fix) |

**All other services** with employee-scoped endpoints should be audited: `time-attendance-service`, `document-service`, `compliance-service`.

**Correct fix:**  
Either:  
(a) `TrustedHeaderAuthFilter` stores `X-Employee-ID` in `authentication.credentials` consistently across all services (done for payroll-service), and all ownership checks use credentials; or  
(b) A proper B1 UserContext is introduced that carries `(userId, employeeId, tenantId, roles)` — the right long-term solution.

**Why deferred:**  
The piecemeal fix pattern (service-by-service) creates inconsistency. B1 should introduce a shared `TrustedHeaderAuthFilter` in `andikisha-common` with a proper `GatewayAuthentication` token type that carries both userId and employeeId. Then all services share the fix.

**2026-05-16 update:** This pattern is widespread. The leave balances 403 fix
(2026-05-16) added `GET /leave/me/balances` as a workaround because
`@PreAuthorize` on `/employees/{employeeId}/balances` uses `authentication.name`
(user UUID from X-User-ID) vs the path param (employee UUID from JWT employeeId
claim) — different namespaces, always 403 for EMPLOYEE role. The underlying SpEL
ownership pattern needs auditing across every employee-scoped resource in
leave-service, payroll-service, and any other service with similar patterns.
Workaround (a /me/* endpoint) does not fix the root cause.

---

### SEC-BACKLOG-003 — Access-token window after password reset

**Raised:** 2026-05-20  
**Priority:** Low — V1 deliberate risk acceptance; documented for future re-evaluation.  
**Decision:** Accept for V1. No code change.

**Problem:**  
When a tenant admin's password is reset (e.g., suspected account compromise), refresh tokens are revoked immediately by `AuthService.changePassword()` which calls `refreshTokenRepository.revokeAllByUserIdAndTenantId()`. This prevents session extension. However, the existing access token (JWT) remains valid until its TTL expires — up to 1 hour. During that window, an attacker with the stolen access token can continue making authenticated API calls even after the password reset.

**Scenarios where this matters:**

| Scenario | Impact |
|---|---|
| Admin forgot password, calls support for reset | Not logged in; mid-session case does not apply. No exposure. |
| Admin account suspected compromised, SUPER_ADMIN resets password | Attacker may hold an active access token. It survives the reset for up to the remaining TTL. |

**Current mitigation:**  
Refresh-token revocation caps exposure to the remaining access-token lifetime (at most the configured TTL, typically 1 hour from issuance). The attacker cannot extend the session past that window.

**Why accepted for V1:**  
Full immediate invalidation requires one of:  
(a) Middleware checking `token.iat` against `user.password_changed_at` on every request — adds a DB read (or Redis lookup) to the hot path.  
(b) A Redis token denylist checked per request — same per-request overhead, plus operational complexity.  

The threat model for V1 (Kenyan SME HR product, low-frequency admin operations, no bulk-payment or PII-extraction API) does not justify the added latency and infrastructure complexity. The refresh-token revocation already in place provides meaningful containment.

**If full immediate invalidation is needed later:**  
Preferred option: add `password_changed_at TIMESTAMP` to the `users` table. `JwtVerificationFilter` reads this once per request (Redis-cached with a short TTL, e.g. 60s) and rejects tokens issued before the timestamp. This is stateless-friendly and adds one cache read per request.  
Alternative: Redis token denylist — higher operational cost, same result.

**Note:** This is a deliberate documented acceptance, not an undiscovered assumption.

---

### SEC-BACKLOG-002 — useRoleGuard fails open when user is null

**Raised:** 2026-05-20  
**Priority:** Medium — the specific security bug is fixed (Phase 2 mustChangePassword gate routes around it), but the underlying fail-open pattern remains.  
**Found during:** Phase 0 investigation of the mustChangePassword sidebar rendering bug.

**Problem:**  
`useRoleGuard` in `frontend/tenant-portal/src/hooks/useRoleGuard.ts` is permissive when `useCurrentUser()` returns `null`:

```typescript
const roles = user
  ? new Set<string>(user.roles.flatMap((r) => (r ? [r] : [])))
  : null;

const authorized = roles ? checkAuthorized(roles, area) : null;
// ...
if (authorized === false) return "redirecting";
return "authorized";  // null authorized → permissive
```

When `user` is null (React Query hasn't resolved yet, or returned null after a 401), `authorized` is null and the guard returns `"authorized"` — granting access without confirming the user has the required role. This is fail-open.

**Observed consequence:**  
When a user with `mustChangePassword=true` logged in, `CurrentUserProvider` had a stale `user=null` in its React Query cache (from a 401 before login). The guard passed them through `EmployeeClientShell`, rendering the full employee sidebar inside the change-password gate. The user could see authenticated app chrome with a temporary password.

**Why the Phase 2 fix routes around it (not through it):**  
The middleware now intercepts `mustChangePassword=true` before any layout renders, redirecting to `/set-password` — a standalone route outside `(my)/` and `(admin)/` layouts. `useRoleGuard` is never invoked for users who need to set their password. The specific security bug is fixed. The fail-open guard itself still exists.

**Risk of recurrence:**  
Any scenario where:  
1. A component renders inside a role-guarded layout, AND  
2. `useCurrentUser()` returns null (slow network, cache miss, race condition between cookie being set and the first `GET /api/auth/me` refetch), AND  
3. The middleware does not gate the route beforehand  

...will silently grant access. Race conditions are hard to reproduce consistently, which makes them hard to catch in tests.

**Fix:**  
Change `useRoleGuard` to fail closed:

```typescript
// Fail closed: if user is unknown (null), deny access and wait.
// Only render when role is positively confirmed.
if (authorized !== true) return "loading";  // or "redirecting" with a spinner
return "authorized";
```

This may require adding a loading state to `EmployeeClientShell` and `AdminRoleGuard` so the UI shows a spinner (or nothing) while the role resolves, rather than either rendering the full shell or immediately redirecting.

**Trade-off:**  
Fail-closed adds a visible flash (spinner or blank) during the 100–300ms before the background `/api/auth/me` refetch resolves. The alternative — a stale null state granting access — is a security bug. Accept the flash.

**Coordinate with:** B1 UserContext work (SEC-BACKLOG-001). A proper `GatewayAuthentication` token with server-side headers would eliminate the race entirely (role known at SSR time, no client-side uncertainty). Until then, fail-closed is the safer default.

---

## API Design

### API-BACKLOG-002 — SalaryStructure update should use PATCH semantics (null = no change, not zero)

**Raised:** 2026-05-17  
**Found during:** Employee edit flow audit  
**Priority:** Medium

**Problem:**  
`PUT /api/v1/employees/{id}/salary` accepts `UpdateSalaryRequest` where optional allowance fields default to `null`. The service converts `null` to `Money.zero(currency)` via the `SalaryStructure` constructor. A caller who sends only `basicSalary` without re-sending existing allowances silently zeros all allowances. This is a data-loss footgun.

**Current workaround:**  
The UI must pre-fill every allowance field from the current `SalaryStructure` before submitting. This is fragile — any client (mobile app, API integration, future admin tool) that doesn't know to pre-fill will silently destroy allowance data.

**Correct fix:**  
Change the endpoint to use true PATCH semantics: `null` in `UpdateSalaryRequest` means "leave this field unchanged," not "set to zero." Requires explicit zero-sending (e.g. `0.00`) to actually clear an allowance.

**Impact:** Existing UI workaround (pre-fill) remains safe after the fix — it still works correctly because all values are explicit. New clients benefit immediately.

---

### API-BACKLOG-001 — Add `/me` convenience endpoints for all employee-scoped resources

**Found:** 2026-05-15 during employee dashboard data-loading investigation  
**Milestone:** B2 or dedicated API consistency pass

**Problem:**  
Employee-facing endpoints currently require `{employeeId}` as a path parameter. This forces the frontend to:
1. Know the employeeId before the query fires (`enabled: !!employeeId`)
2. Use a different URL pattern than admin-facing queries

The pattern needs to be applied consistently across every employee-scoped resource before any one service adopts it:
- `GET /api/v1/payroll/me/payslips`
- `GET /api/v1/leave/me/requests`
- `GET /api/v1/leave/me/balances`
- `GET /api/v1/time-attendance/me/records`
- `GET /api/v1/documents/me`
- `GET /api/v1/employees/me` (already exists ✅)

**Why deferred:**  
Piecemeal adoption creates API drift. Save for a dedicated backend API consistency pass that touches all services at once.

---

## Auth / Identity

### AUTH-BACKLOG-001 — ADMIN-as-employee: no automatic employee record for tenant admins

**Found:** 2026-05-15 during ADMIN-as-employee investigation  
**Affects:** B1 sequencing for EMPLOYEE baseline role

**Finding:**  
The tenant provisioning flow (`SuperAdminTenantService.createTenantWithLicence`) creates:
1. Tenant aggregate
2. Licence record
3. Admin user in auth-service (role = ADMIN)

**No employee record is created for the admin.**

`admin@demo.co.ke` has zero rows in the employee-service DB.

**Is this intentional?**  
Partially. The initial design treats the tenant ADMIN as a system administrator, not necessarily a payroll employee. In a large company, the HR admin may not be on the payroll at all. In a small SME (the core target market), the founder is often both the business owner and an employee.

**Impact on B1:**  
When B1 introduces the EMPLOYEE baseline role (every user who is on payroll gets EMPLOYEE in addition to their primary role), the provisioning flow will need a flag: `isAlsoEmployee: boolean`. If true, an employee record is created alongside the admin user, and the admin's `employee_id` is linked in auth-service.

Until then, an admin who needs payslips must have their employee record created manually via the employee creation flow and linked via a future "link employee to user" endpoint.

**Action for B1:**  
- Add `isAlsoEmployee` field to `CreateTenantWithLicenceRequest`
- If true, provisioning creates an employee record via employee-service gRPC and links it to the admin user

---

## Payroll

### PAYROLL-BACKLOG-001 — Replace hardcoded 22 working days with calendar-aware calculation

**Raised:** 2026-05-15  
**Context:** `PayrollService.STANDARD_WORKING_DAYS_PER_MONTH = 22` is used to compute unpaid-leave daily deductions. 22 is a reasonable approximation for a 5-day-week, 4.33-week month but is wrong for: weekly payroll periods, bi-weekly periods, months with public holidays, and daily-rated casual workers.

**Required for multi-period payroll:**  
Replace the constant with a `CalendarService.getWorkingDaysInPeriod(LocalDate from, LocalDate to, String tenantId)` call that accounts for weekends and KE public holidays from a `public_holidays` table.

**Not blocking current work.** Revisit when multi-period payroll (weekly, bi-weekly, casual daily) is introduced.

---

## Compliance

### PAYROLL-BACKLOG-002 — Audit all services for missing @EnableJpaAuditing

**Raised:** 2026-05-16  
**Context:** payroll-service was discovered missing `@EnableJpaAuditing` during the 2026-05-16 smoke test. `BaseEntity` uses `@CreatedDate` and `@LastModifiedDate` via `AuditingEntityListener`, but without `@EnableJpaAuditing` in the Spring context these fields are never populated. In payroll-service, this silently broke all payroll run creation with a `NOT NULL` constraint violation on `created_at`. The same bug class may exist in other services.

**Services to audit:**  
employee-service (confirmed OK — has it on `EmployeeServiceApplication.java`), tenant-service, compliance-service, leave-service, time-attendance-service, document-service, notification-service, integration-hub-service, analytics-service, audit-service.

**Method:**  
`grep -r "@EnableJpaAuditing" services/*/src/main --include="*.java"` — any service with JPA entities that lacks the annotation is a potential silent failure.

**Not blocking current work.** Run the grep before any service integration test cycle to catch failures early.

---

### PAYROLL-BACKLOG-003 — Testcontainers integration tests for the full payroll → disbursement flow

**Raised:** 2026-05-16  
**Context:** During the 2026-05-16 end-to-end verification of the payroll disbursement loop, four bugs were discovered that unit tests had not caught:

1. `publishAfterCommit()` in PayrollService was double-wrapping a publish action in `TransactionSynchronization.afterCommit()`. Spring's snapshot-based dispatch silently drops synchronizations registered during an active afterCommit callback — the inner registration was never fired. Unit tests mock the publisher and don't exercise the transaction synchronization mechanism.

2. `TypePrecedence.INFERRED` was needed in `RabbitMqConfig` because the Spring DevTools restart classloader resolves the `__TypeId__` AMQP header to a different classloader instance than the consuming context. Unit tests don't run DevTools and don't test actual RabbitMQ deserialization.

3. `maybePublishRunCompleted()` in `PaymentProcessor` had a race condition: concurrent payment threads each counted in their own uncommitted transaction and saw (n-1) completed rows, so none triggered the `PaymentsCompletedEvent`. Unit tests run sequentially against mocked repositories.

4. `PayrollRun.complete()` needed an idempotency guard because the same `PaymentsCompletedEvent` can arrive more than once under concurrent sandbox conditions. Unit tests exercise the domain method once.

**What to build:**  
An integration test module (or test class in payroll-service + integration-hub-service) using Testcontainers (PostgreSQL + RabbitMQ) that covers:
- Full lifecycle: create run → calculate → approve → publish `PayrollApprovedEvent` → integration-hub receives → creates payment transactions → publishes `PaymentsCompletedEvent` → payroll-service transitions run to COMPLETED
- Partial failure: configure sandbox to fail N of M transactions, assert run reaches COMPLETED with correct counts
- Retry: assert retried FAILED transactions complete and run stays COMPLETED (idempotent guard)
- Concurrent payment completion: inject concurrent payment saves and assert `PaymentsCompletedEvent` fires exactly once

**Priority:** High. These are production-path bugs in an async, multi-transaction flow. The unit test suite provides no coverage for the interaction between Spring transaction lifecycle hooks, RabbitMQ message routing, and concurrent database writes.

**Estimate:** 3-5 days to build the test harness and cover the four scenarios above.

---

### COMPLIANCE-BACKLOG-001 — Move statutory rate constants from code to compliance-service rate tables

**Raised:** 2026-05-15  
**Context:** PAYE bands, NSSF tier limits, SHIF rate, Housing Levy rate, NITA levy, and personal relief are all hardcoded as `private static final` constants in `KenyanTaxCalculator`. KRA amends these annually (Finance Act). Updating them requires a code deployment.

**Required:**  
Move statutory rates to a `statutory_rates` table in compliance-service, versioned by effective date. `KenyanTaxCalculator` fetches the applicable rate set for the payroll period via gRPC. This allows rate changes to be applied by data migration rather than code deployment, and supports historical re-calculation using the rates that were in effect at the time.

**Not blocking current work.** Statutory rates for FY 2024/2025 are correct. Revisit before the next Finance Act (typically June/July each year).

---

## Infrastructure

### INFRA-BACKLOG-001: YAML schema validation for application-*.yml across all services

**Reported:** 2026-05-16
**Priority:** Medium
**Status:** Open

The `api-gateway/application-dev.yml` had a broken YAML structure — the `rabbitmq` block
was indented under a top-level `JWT_SECRET` key instead of under `spring`. This caused a
`ParserException` on every gateway startup and was only caught during dashboard verification,
not CI.

Add either:
- A YAML schema validator step in CI (e.g., yamllint with a Spring Boot-aware schema)
- A "service must boot" integration test that starts each service in isolation and asserts
  the health endpoint responds 200 within 30s

This class of bug (wrong YAML indentation) causes silent failures that are invisible until
manual testing.

---

## Audit / Observability

### AUDIT-BACKLOG-001 — Employee change history endpoint and field-level diff UI

**Raised:** 2026-05-17  
**Found during:** Employee edit flow audit  
**Priority:** Medium

**Problem:**  
`EmployeeHistory` records are written by `EmployeeService` for department transfers, salary changes, and status transitions, but:
1. Personal detail changes (name, phone, email, DOB, gender) are NOT recorded — audit gaps.
2. Bank detail changes are NOT recorded.
3. No controller endpoint exposes the history — `GET /api/v1/employees/{id}/history` does not exist despite the repository query being ready.
4. The UI has no way to show an HR admin when a record was last changed, by whom, and what changed.

**What to build:**
- Fix `EmployeeService.update()` to write `EmployeeHistory` records for personal detail and bank detail changes (field-level old/new values).
- Add `GET /api/v1/employees/{id}/history` endpoint returning paged `EmployeeHistoryResponse` (changeType, fieldName, oldValue, newValue, changedBy, changedAt).
- Add a "Recent changes" panel to the employee detail page showing the last N changes.

**Why deferred:**  
Not a compliance blocker for current Kenya statutory requirements. Salary and status history (the compliance-sensitive changes) are already recorded. Personal detail history is an internal audit concern. Prioritise after the edit and deactivate UI flows are stable.

---

## Payroll

### PAYROLL-BACKLOG-004 — Final payslip flow for terminated employees with accrued leave payout

**Raised:** 2026-05-17  
**Found during:** Employee deactivate flow audit  
**Priority:** High — Kenya Employment Act compliance

**Legal basis:**  
Kenya Employment Act, 2007 §28(2): on termination, the employer must pay out all accrued but untaken annual leave at the daily rate. Failure to do so is an Employment Act violation.

**Current state:**  
Termination has no payroll trigger. The terminated employee is excluded from future payroll runs. No pro-rated final payslip is generated. Accrued leave balance exists in leave-service but is frozen (not paid out).

**What to build:**
1. A `FINAL_PAYSLIP` payroll run type or a dedicated endpoint `POST /api/v1/payroll/employees/{id}/final-payslip` that:
   - Fetches the employee's accrued, unused annual leave balance from leave-service via gRPC
   - Calculates the payout: `unusedDays × (basicSalary ÷ 22)`
   - Generates a payslip for the current month (pro-rated to the termination effective date)
   - Applies all normal statutory deductions (PAYE on final pay including leave payout, NSSF, SHIF, Housing Levy)
   - Includes the leave payout as a separate line item
2. Trigger this automatically from `EmployeeService.terminate()` after the status transition, or from the `EmployeeTerminatedEvent` consumer in payroll-service.
3. The final payslip must be disbursed within the period required by the employment contract (typically not more than 30 days after termination).

**Recommended pattern:**  
Immediate special payroll run triggered by the termination event, rather than waiting for the next regular run. Waiting for the regular cycle may violate the 30-day window.

**Not blocking deactivate UI ship:** The UI can ship the termination flow without this. The final payslip should be calculated and displayed in the termination confirmation step, but disbursement can be manually initiated by the payroll officer for the initial implementation.

---

## Documents

### DOCUMENT-BACKLOG-001 — Certificate of Service generation on employee termination

**Raised:** 2026-05-17  
**Found during:** Employee deactivate flow audit  
**Priority:** High — Kenya Employment Act compliance

**Legal basis:**  
Kenya Employment Act, 2007 §52: the employer must provide a Certificate of Service to every employee whose employment is terminated, on request or automatically within 30 days.

**Current state:**  
`document-service` has a `document.employee-events` queue declared and bound to `employee.events` with routing key `employee.terminated`. The queue receives every termination event. There is **no `@RabbitListener` implemented** in document-service for this queue. Messages accumulate unprocessed indefinitely. This is a half-built infrastructure that does nothing.

**What to build:**
1. Implement `EmployeeTerminatedEventListener` in document-service consuming `document.employee-events`.
2. On receiving `EmployeeTerminatedEvent`, fetch full employee details via gRPC from employee-service (name, employee number, hire date, termination date, department, position, termination reason).
3. Generate a Certificate of Service PDF using the existing document generation infrastructure.
4. Store the document in the employee's document folder with a `CERTIFICATE_OF_SERVICE` document type.
5. Notify the employee (via notification-service or directly) that their Certificate of Service is available for download.

**Alternatively:** If the document generation infrastructure is not ready, remove the queue declaration and replace with a TODO comment. Half-built infrastructure (queue with no consumer) is an operational hazard — messages pile up, queue grows, alerting fires. Either build it or remove the scaffolding.

**Decision:** Build the listener. The queue infrastructure is already correct. Document generation for the Certificate of Service follows the same pattern as payslip PDF generation.

---

## Frontend

### UI-BACKLOG-002 — Consolidate custom tables onto the DataTable primitive

**Raised:** 2026-05-20  
**Priority:** Low — cosmetic inconsistency; no functional impact.

**Problem:**  
Five tenant-portal tables use bespoke `<table>` implementations while platform-portal uses the `<DataTable>` primitive from `@andikisha/ui`. This is two patterns for the same job.

**Affected tables:**
- `[workspace]/(admin)/admin/employees/page.tsx`
- `[workspace]/(admin)/admin/payroll/page.tsx`
- `[workspace]/(admin)/admin/leave/page.tsx`
- `[workspace]/(my)/my/attendance/page.tsx`
- `[workspace]/(my)/my/payslips/page.tsx`

**Current state after 2026-05-20:**  
Pagination duplication is resolved — all five tables now use the shared `<PaginationBar>` primitive. The remaining inconsistency is the table-body implementation only.

**Recommended approach:**  
Migrate each custom table to `<DataTable>` incrementally — when each is next touched for a feature or bug fix — rather than in one big refactor that risks regressions across five working surfaces. Do not migrate tables solely for consistency; wait until there is another reason to touch the file.

**Long-term target:** All tables use `<DataTable>`.

---

## Infrastructure

### INFRA-BACKLOG-002 — Remove orphaned employee-portal and admin-portal directories

**Raised:** 2026-05-18  
**Priority:** Low — no impact on builds, CI, or deployments

Source code cleaned up in commit `dcd6905` (2026-05-17): the single tracked file in each directory (`shell-preview/page.tsx`) was deleted. The directories remain on disk with gitignored `node_modules/` and `.next/` artifacts from pre-consolidation development.

**Before deleting:**
1. Confirm neither directory is referenced in `pnpm-workspace.yaml` (currently they are — check whether removal is needed)
2. Confirm no CI/CD scripts, Dockerfiles, or deployment configs reference these paths
3. Confirm root `package.json` scripts do not reference them

**Then:** `rm -rf frontend/employee-portal frontend/admin-portal`

**Why deferred:** Gitignored artifacts don't affect builds or test runs. Risk of breaking something if references remain. Low urgency.
