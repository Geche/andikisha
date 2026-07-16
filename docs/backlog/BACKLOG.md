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

### EMP-BACKLOG-004 — UpdateEmployeeRequest.kraPin missing @Pattern (asymmetric with create)

**STATUS: RESOLVED 2026-06-12.** Added `@Pattern("^([A-Z]\\d{9}[A-Z])?$")` to
`UpdateEmployeeRequest.kraPin` (optional on update), mirroring PR #5 / `CreateEmployeeRequest`.
MockMvc tests: malformed→400, valid `A123456789X`→200, empty→200. **Frontend gap found &
filed separately:** the employee *edit* page does not client-validate KRA PIN — FE-BACKLOG-009
(not folded in, per the one-item cadence).

**Raised:** 2026-06-12 (TENANT-BACKLOG-004 audit) — **separate PR.**
**Priority:** Medium — asymmetric validation lets bad data in through the update path.

**Problem:** `CreateEmployeeRequest.kraPin` (and `BulkUploadService`) validate KRA PIN with
`^[A-Z]\d{9}[A-Z]$`, but `UpdateEmployeeRequest.kraPin` has **no `@Pattern`** — a malformed
KRA PIN can be written via the employee *update* path even though create rejects it. The
employee *edit* frontend page likewise doesn't regex-validate. Same class as TENANT-004.

**Fix:** add `@Pattern(regexp = "^([A-Z]\\d{9}[A-Z])?$")` to `UpdateEmployeeRequest.kraPin`
(optional on update) + the edit-form validation, mirroring TENANT-004. Quick once picked up;
kept as its own PR per the one-item-one-PR cadence.

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

### PLATFORM-BACKLOG-002 — Licence-history "changed by" shows a truncated UUID

**Raised:** 2026-06-12 (UI-BACKLOG-003 audit — platform-facing, scoped out of that tenant-facing item).
**Priority:** Low — platform-portal (SUPER_ADMIN) only; not tenant-facing.

**Problem:** In the platform tenant detail page, licence-history entries render the actor via
`formatChangedBy()` = `changedBy.slice(0, 8) + "…"` (a **truncated UUID**) in two places. Same class as
Bug 4's leave reviewer, but on a super-admin surface — which is why it's tracked separately from the
tenant-facing UI-BACKLOG-003.

**Fix:** resolve `changedBy` (a super-admin / system actor id) to an email/name, or at minimum stop
showing a raw truncated UUID (e.g. "Platform admin" + full id on hover, "System" for SYSTEM). Consider a
super-admin display-name source analogous to AUTH-006's `display_name`.

---

### PLATFORM-BACKLOG-003 — Dashboard health grid fabricates a 13-service list on empty/error response

**Raised:** 2026-06-16 (Loading-state remediation, W0 health-grid investigation).
**Priority:** Medium — correctness/honesty on a SUPER_ADMIN operational surface; misleads during a real outage.

**Problem:** `frontend/platform-portal/src/app/(platform)/dashboard/page.tsx` `ServiceHealthGrid`
renders live data from `GET /api/v1/super-admin/system/health` on success — but on **empty or errored**
response it falls back to a **hardcoded 13-service array, every row marked `UNKNOWN`**:

```ts
const rows = isLoading ? placeholder : services.length ? services : placeholder;
```

The `placeholder` is also reused for the loading state, so loading, empty, and error all resolve to the
**same** 13 grey `UNKNOWN` rows. The endpoint is real and consumed (corrected from the Phase A audit's
"ignores the endpoint" framing — it does not). The defect is the **fallback**: when the health call fails
during an actual incident, the grid invents a normal-looking, complete service list instead of saying it
couldn't load. A platform admin triaging an outage sees a plausible roster while the cluster is down. This
is a correctness defect, not a missing skeleton — filed on its own terms so a postmortem can find it, even
though the fix ships inside the W4 commit.

**Fix (lands in W4, loading-state run):** separate the three states per the run's constraint #5 —
- loading → skeleton rows matching the grid's dimensions (never the fabricated list),
- empty/error → an explicit "Couldn't load service health" state,
- success → the live `services` list.

Never render fabricated `UNKNOWN` rows as if they were data. Backend status fidelity (DOWN vs UNKNOWN) is
tracked separately in `docs/Engineering/backend/2026-06-16-system-health-up-unknown-only-status.md`.

---

### PLATFORM-BACKLOG-004 — Platform-portal profile menu never rendered (SUPER_ADMIN `/api/auth/me` 401)

**Raised:** 2026-06-17 (found from a missing top-right avatar + a `/api/auth/me` 401 in the console).
**Priority:** Medium — operator-facing; the profile menu (and logout via it) was unreachable on every
platform-portal page.

**Symptom:** no avatar in the platform masthead. `(platform)/layout.tsx` renders the profile menu only
`if (user)` where `user = useCurrentUser()` ← `/api/auth/me`; that call 401'd, so `user` was null and the
menu never rendered. The dashboard still showed data because its `/api/v1/super-admin/*` calls authenticate
fine — the asymmetry was identity-only.

**Root cause:** the platform BFF `/api/auth/me` forwarded `platform_token` to the **tenant-scoped**
gateway `/api/v1/auth/me`. A SUPER_ADMIN identity has `tenantId: "SYSTEM"` and no employee/tenant record,
so the tenant identity endpoint cannot serve it. (Note: the gateway filters themselves do NOT block a valid
super-admin token — `tenantId:"SYSTEM"` is non-blank so it passes `JwtAuthenticationFilter`, and
`TenantLicenceFilter` explicitly bypasses SUPER_ADMIN; the exact rejection is at/after auth-service's tenant
identity handling, or a session-expiry surfacing through cached dashboard data. An earlier
`MISSING_TENANT_CLAIM` hypothesis was wrong — the token carries `tenantId` and `email`.)

**Fix (Option A, branch `fix/platform-portal-superadmin-me`):** the BFF `/api/auth/me` now derives the
identity from the **verified `platform_token` JWT itself** (it carries `sub`/`email`/`role`), mirroring the
decode the platform middleware already performs for route access — no backend `/me` call. Returns
`{userId, email, roles}`; invalid/expired token → 401 (client redirects to login). Frontend-only, no
gateway/auth-service change. Option B (a dedicated `/api/v1/auth/super-admin/me` backend endpoint) was
deferred as unnecessary for this fix.

---

### TENANT-BACKLOG-003 — Licence-state enforcement divergence (date reconciliation + status transition + entitlement)

**Raised:** 2026-05-19 · **Rescoped:** 2026-06-13
**Priority:** Medium — correctness of the licence state shown to operators and (eventually) enforced.

**Original symptom — FIXED.** This entry began as "`extendTrial()` updates `Tenant.trialEndsAt` but not
`TenantLicence.endDate`" (a stale `End date` on the tenant list). That was fixed in commit **`8382877`**
("extendTrial updates both Tenant.trialEndsAt and TenantLicence.endDate atomically"). The header now
reflects the **deferred enforcement work** that remains, surfaced during R2-7.

**Deferred scope (the open work):**
1. **Licence-date reconciliation** — a single source of truth for trial/licence end so
   `tenants.trial_ends_at` and `tenant_licence.end_date` cannot diverge. (Demo tenant showed `end_date`
   in the future while `trial_ends_at` was past → reads as TRIAL + "expired" + future end date at once.)
2. **Status transition** — an expiry path/job that moves a lapsed TRIAL → EXPIRED. Today nothing
   transitions a lapsed trial, so the status stays wrong and the two date sources stay unreconciled.
3. **Entitlement enforcement / plan-upgrade wiring** — R2-7's platform plan change is deliberately
   **record-only** (stores plan + price; does NOT transition status, clear the trial, or grant
   entitlements). Wiring entitlement enforcement to plan/licence state is part of this item.

**Confirmed NOT an access blocker** (R2-7): `AuthService.login` performs no licence/trial check, and an
EMPLOYEE in the same expired-trial tenant authenticates normally — a state-consistency/enforcement gap,
not a login gate. That is why R2-7 shipped the plan change as record-only.

---

### TENANT-BACKLOG-004 — No backend format validation for tenant statutory fields (KRA PIN/NSSF/SHIF)

**STATUS: RESOLVED 2026-06-12.** Three-source audit (frontend forms, backend authority
`CreateEmployeeRequest`/`BulkUploadService`, KRA spec) agreed on `^[A-Z]\d{9}[A-Z]$`.
Added `@Pattern(regexp = "^([A-Z]\\d{9}[A-Z])?$")` (optional: null/empty clears) to
`UpdateStatutoryRequest.kraPin` and `UpdateTenantRequest.kraPin` + MockMvc tests
(malformed→400, valid→204, empty→204). Note: tenant *creation* has no KRA PIN field, so
those were the actual targets, not a "create payload".
**Adjacent gap (not fixed here, same class):** employee-service `UpdateEmployeeRequest.kraPin`
has no `@Pattern` (create validates, update doesn't), and the employee *edit* page doesn't
regex-validate — candidate for a follow-up.

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

**Update (2026-06-12, browser review):** Create and Edit are confirmed working for Departments and
Positions on screen — **only Delete is missing**. The data-integrity decision below is the real work:
deleting a department/position with assigned employees (block vs reassign vs soft-delete), and whether
roles are deletable at all (fixed enum + SYSTEM-seeded grants). Decide before building.

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

### TENANT-BACKLOG-009 — Tighten KRA PIN leading letter to [AP]

**Raised:** 2026-06-12 (TENANT-BACKLOG-004 audit).
**Priority:** Low — current validation is structurally correct; this is stricter conformance.

**Problem:** The codebase standardizes on `^[A-Z]\d{9}[A-Z]$` (permissive leading letter). The KRA spec
restricts the leading letter to **A (individual) or P (company/non-individual)** — so the strict pattern
is `^[AP]\d{9}[A-Z]$`. Today a PIN like `Z123456789X` passes validation but is not a real KRA format.

**Why deferred / what it needs:** tightening must be **coordinated** across all patterns at once —
`CreateEmployeeRequest`, `BulkUploadService`, `UpdateStatutoryRequest`, `UpdateTenantRequest`,
`UpdateEmployeeRequest` (EMP-BACKLOG-004), and both frontend forms — plus a **decision on existing
records** whose stored KRA PIN has a non-A/P leading letter (reject on next edit? data-fix migration?
grandfather?). That data question is the real work, not the regex. File and decide deliberately.

---

### TENANT-BACKLOG-010 — Admin IA: rename URLs to match the Access/Workspace/Settings model

**Raised:** 2026-06-14 (Run 03 R3-1). **Priority:** Low — purely cosmetic; current URLs work.

R3-1 reorganised the tenant-portal admin sidenav into Access / Workspace / Settings but kept all
URLs unchanged (cosmetic regroup, no redirect debt — see
`docs/decisions/2026-06-14-run-03-ia-reorganization.md`). A future pass *could* align the paths with
the new vocabulary, e.g. `/admin/users` → `/admin/access`, `/admin/settings/{departments,positions}`
→ `/admin/workspace/*`. That requires redirects from the old paths + breadcrumb/deep-link review.
Deferred deliberately: the URL semantics add no functional value and the regroup already delivered the
IA benefit. Decide if/when the URL drift becomes worth the redirect maintenance.

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

### AUTH-BACKLOG-006 — No user display-name field (UI shows email everywhere)

**STATUS: RESOLVED 2026-06-12** (PR #4). Added a stored `users.display_name`, resolved from the linked
employee record at provisioning + an idempotent startup backfill; exposed on `/api/auth/me` (→ `fullName`)
and `/admin/users`, falling back to email when absent. Chosen over read-time gRPC because `/me` is a hot
path. See `docs/decisions/2026-06-12-auth-user-display-name.md`. (Leave-reviewer name resolution shipped
separately in PR #6 / UI-BACKLOG-003.)

**Raised:** 2026-06-10 (UX-flow-remediation-01, Bug 4)
**Priority:** Low/Medium — affects every surface that identifies a user.

**Problem:** `users` has no display-name (first/last) field; `/api/auth/me` returns
`fullName: undefined`. So `/admin/users`, the leave "Reviewed by", and similar surfaces
identify people by **email**, not name. Bug 4 made leave reviewer show the reviewer's
email (correct, person-identifying) rather than the UUID/position — but a true name is
not yet possible.

**Fix:** add a display-name to the auth user (or resolve via the linked employee record's
first/last name when `employeeId` is present), expose it on `/api/auth/me`, `/users`, and
leave `reviewerName`, falling back to email when absent. *(See STATUS above — shipped.)*

---

### AUTH-BACKLOG-007 — EmployeeUpdated → display_name rename sync

**Raised:** 2026-06-12 (deferred from AUTH-006).
**Priority:** Low — rare event; cosmetic staleness only.

**Problem:** AUTH-006 stores `users.display_name` (populated at provision + backfill from employee
records). If an employee is later renamed, the stored `display_name` goes stale until re-synced.

**Fix:** add an `EmployeeUpdated` event listener in auth-service that refreshes `display_name` for the
linked user. A listener is the right pattern (don't poll, don't resolve on the hot path). Build when it
actually matters, or as part of the user-lifecycle/identity workstream.

---

### UI-BACKLOG-003 — Audit "who-performed-this-action" UUID display surfaces

**STATUS: SCOPED-DOWN-RESOLVED 2026-06-12.** The audit was run; the original premise (a systematic
UUID-display problem across many tenant surfaces) **did not hold** — most candidate surfaces don't exist
(no tenant audit-log UI, no documents UI, no actor IDs rendered in payroll runs; the leave reviewer
already showed email after Bug 4). The one genuine in-scope improvement — **leave reviewer email→name** —
shipped via **PR #6** (resolves the reviewer UUID via `/api/v1/auth/users` → AUTH-006 `display_name`,
falling back to email). The remaining real actor-UUID offender is **platform-facing** (licence-history
"changed by") and is tracked separately as **PLATFORM-BACKLOG-002**. Nothing further to do under this
(tenant-facing) item.

**Raised:** 2026-06-12 (deferred from AUTH-006 / Bug 4).
**Priority:** Medium — correctness/clarity of audit trails.

**Original problem (for history):** Bug 4 fixed the leave reviewer showing a raw UUID; this item proposed
a systematic pass over other actor surfaces — which the audit found largely don't exist as tenant UIs.

---

### FE-BACKLOG-007 — BaseModal silent-empty-modal trap

**Raised:** 2026-06-10 (UX-flow-remediation-01, Bug 2)
**Priority:** Low/Medium — ergonomics; prevents a recurring "broken-but-plausible" render.

**Problem:** `BaseModal` renders only the backdrop + centering wrapper; the caller must supply the
white-card surface (`bg-white rounded-xl shadow-xl border …`). If a caller forgets it, the modal still
"works" (opens, traps focus, closes) but renders as bare content floating over the dim backdrop with the
page bleeding through — a wrong-looking render that passes code review and only fails on a screenshot
(exactly Bug 2). The R2-8/R2-10 modals hit this; the leave modals happen to include the surface.

**Fix (pick one):** have `BaseModal` **default-provide** the surface wrapper (a `surface` prop, default
true, that wraps children in the standard card), or make the surface a required structural part so
omitting it is a type/visual error rather than a silently-degraded render. Then audit existing callers.

---

### FE-BACKLOG-008 — Departments/Positions Add/Edit forms render without backdrop surface

**STATUS: RESOLVED 2026-06-12.** Added the white-card wrapper to both modals' content div
(`bg-white rounded-xl shadow-xl border border-neutral-200`), the exact Bug-2 fix (082dd02).
Full BaseModal-caller audit confirmed these were the **only** two trapped instances — every
other caller (users ×3, leave ×2, employees ×2) already had the surface. The systemic
prevention (BaseModal default/required surface) stays as **FE-BACKLOG-007**: the safe version
must touch all ~7 callers to de-duplicate surfaces, which would expand this mechanical PR, so
it's kept separate per the one-item cadence.

**Raised:** 2026-06-12 (browser review).
**Priority:** Medium — visible to tenant admin/HR; forms look broken (table bleeds through).

**Problem:** The Add position, Add department, and Edit department forms render inline next to the table
with the table at full opacity outside the form area. **Confirmed same root cause as Bug 2 (commit
082dd02):** both `settings/departments/page.tsx` and `settings/positions/page.tsx` use `BaseModal` with a
content div of `p-6 w-full max-w-md` and **no white-card surface** (`bg-white rounded-xl shadow-xl border`)
— so content floats over the backdrop. (This is exactly the FE-BACKLOG-007 BaseModal trap, instantiated.)

**Fix:** add the white-card wrapper to both modals' content div, matching the leave modals / the R2-10
fix. Trivial; own PR per the one-item cadence (or fold into the FE-BACKLOG-007 BaseModal surface fix).

---

### FE-BACKLOG-009 — Employee edit form does not client-validate KRA PIN

**STATUS: RESOLVED 2026-06-12** (PR #9). Added inline KRA validation to the edit form mirroring
the create form, and extracted the shared patterns to `@/lib/employee-validation`
(`KRA_RE`/`PHONE_RE`/`NATIONAL_RE`/`KRA_PIN_MESSAGE`) so the two forms can't drift.

**Raised:** 2026-06-12 (EMP-BACKLOG-004 fix).
**Priority:** Low — backend now rejects malformed KRA PIN on update (EMP-004); this is the UX nicety.

**Problem:** The employee *edit* page (`employees/[employeeId]`) has a KRA PIN input (placeholder
`A123456789X`) but **no client-side regex validation** — unlike the Add Employee form (`employees/new`,
`KRA_RE = /^[A-Z]\d{9}[A-Z]$/`). After EMP-004 a bad PIN is rejected by the backend (400), but the user
only finds out on submit instead of inline.

**Fix:** mirror the Add Employee form's `KRA_RE` inline validation on the edit form. Small; kept separate
from EMP-004 (backend) per the one-item-one-PR cadence.

---

### FE-BACKLOG-010 — Employee edit form does not client-validate phone number

**Raised:** 2026-06-12 (FE-BACKLOG-009 asymmetry audit).
**Priority:** Low — same class as FE-009; the create form validates, the edit form doesn't.

**Problem:** The Add Employee form validates phone with `PHONE_RE = /^(\+254|0)7\d{8}$/`, but the employee
*edit* page has no client-side phone validation. (NSSF/SHIF have no format regex even on create —
required-only — and national ID isn't editable on the edit form, so phone is the only remaining
format asymmetry.)

**Fix:** mirror the create form's `PHONE_RE` inline validation on the edit form, reusing the shared
`PHONE_RE` from `@/lib/employee-validation` (already extracted in PR #9). Small frontend-only change.

---

### FE-BACKLOG-011 — Consolidate FE-BACKLOG-001…006 into BACKLOG.md (single source for ID scans)

**Raised:** 2026-06-13 (pre-Run-03 hygiene).
**Priority:** Low — bookkeeping; the items are tracked, just not here.

**Problem:** FE-BACKLOG-001…006 (design-system gap items — accent bar / Card primitive, StatCard chip +
delta + Badge/Avatar dots + Badge semantic tones, type-scale tokens + table/sidebar alignment +
`KES`→`KSh`, shared-primitive adoption) are tracked **only** in `docs/Engineering/frontend/`
(`2026-06-05-gap-audit-correction.md` is the authoritative reconciled list; also referenced in
`design-system-gap-audit.md`, `token-consolidation-plan.md`). They don't appear in BACKLOG.md, so an
ID-based scan of BACKLOG.md misses them.

**Fix:** copy FE-001…006 in as stub entries (one-line summary + status + cross-ref to the frontend Eng
doc), preserving the detailed write-ups in that doc. Verify each item's current status against the
landed token-consolidation work (Steps 1–5) before marking — some may already be resolved. Kept out of
the 2026-06-13 hygiene PR to avoid expanding it; do as its own small docs PR.

### FE-BACKLOG-012 — `/my/*` pages (dashboard, leave, payslips, attendance) don't gracefully handle no-employee users

**Raised:** 2026-06-14 (Run 03 R3-2c downstream-assumption audit). **Priority:** Low–Medium.

R3-1 relaxed the `/my/*` gate to any authenticated user (so the admin "My profile" link works for
standalone admins), and R3-2c made **`/my/profile`** degrade gracefully for users with no linked
employee record. The other `/my/*` pages — **dashboard, leave, payslips, attendance** — still assume an
employee context (they query `/employees/me` or employee-scoped `/me/*` endpoints) and will show
error/empty states for a standalone admin-tier user who reaches them by direct URL. They are **not
linked** from the admin user-menu chip (only `/my/profile` is), so this is not a broken-link defect —
but the surface isn't clean. **Why deferred (not folded into R3-2c):** it needs a design decision —
what *should* a standalone admin see on an employee self-service dashboard? Hide each page, redirect to
`/admin`, or show a "no employee record" empty state per page. Decide deliberately, then apply the same
`hasEmployee` guard pattern used in `/my/profile`.

**2026-06-14 post-merge review note (Image 3):** Lawrence's review confirmed `/my/dashboard` renders
employee-specific sections for a standalone admin — exactly this gap (not a new finding). It raises the
**design question to settle when this item is taken up:** should `/my/*` be reachable at all for
non-employee users, or should the entire `/my` section be hidden/redirected for them (vs per-page
graceful empty states)? Decide during the future audit; do not decide now.

### TENANT-BACKLOG-011 — Change-role UX for roles with an unmet prerequisite

**Raised:** 2026-06-14 (post-merge review, Image 8). **Priority:** Low–Medium — UX, not correctness.

Assigning a role that requires department scope (e.g. **LINE_MANAGER**) to an employee with no
department fails server-side with `DepartmentScopeException` ("the employee must be assigned to a
department first"). The message is accurate but only appears **after** the user submits the change-role
modal — poor flow. Improve to either (a) disable the ineligible role in the dropdown with a hover
tooltip explaining the prerequisite, or (b) surface the prerequisite inline before submission. Backend
guard stays as the authority; this is presentation only.

### FE-BACKLOG-013 — Department/Position edit modal form quality

**Raised:** 2026-06-14 (post-merge review, Image 7). **Priority:** Low — polish.

The department and position edit modals render correctly (post the FE-008 BaseModal fix and the R3-1
position-edit work), but the forms are minimal: plain inputs, no helper text, no validation-state
styling (error/focus affordances beyond the default ring), no visual field hierarchy. Polish item for a
future frontend refinement run — align with the design-system form-field patterns
(`frontend/packages/ui` inputs, helper/error text, labels).

### FE-BACKLOG-014 — "Change password" links to a non-existent `/my/change-password` page

**Raised:** 2026-06-14 (found during the R3-1 profile-chip routing fix). **Priority:** Medium — broken link on a profile both employees and admins reach.

The profile Security section ("Change password") links to `/${workspace}/my/change-password`, but **no
`change-password` page exists** under either route group (only `set-password` — the forced-change gate —
and the `/api/auth/change-password` BFF route). The link 404s for everyone (pre-existing; the R3-2c
checkpoint changed passwords via the API directly, not this page). **When built:** make it shell-aware
like the profile (`ProfileView`) — an admin must not be dropped into the employee shell — i.e. either a
shared component rendered by both `/admin/change-password` and `/my/change-password`, or a
role-conditional link. The BFF endpoint already exists, so this is a UI page + wiring.

**Update 2026-06-17:** the `/my/change-password` page now exists, but was built **without** the
shell-awareness this item prescribed — an admin reaching it from `/admin/profile` is dropped into the
employee shell, and the "Back to profile" link points to `/my/profile` (it bounces back via the
`isAdmin → /admin/profile` redirect, but that bounce is racy — R2-9). The shell-awareness half of this
item is therefore still open; tracked for a standalone fix outside the loading-states run.

**Resolved 2026-06-17** (branch `fix/change-password-admin-shell`, pending merge) — Option A (minimal,
no component extraction): added an `/admin/change-password` route that re-uses the existing form body in
the admin shell; made `ProfileView`'s "Change password" link and the form's "Back to profile" link
role-aware (admin → `/admin/*`, else → `/my/*`). Admins now stay in the admin shell, and their back-link
goes straight to `/admin/profile` — **removing the dependence on the racy `/my/profile` bounce (R2-9 is
no longer load-bearing for admins)**. Verified in-browser: admin path renders in the admin shell with no
employee-nav leak; employee path unchanged. Extraction to a shared component (Option B) was deliberately
deferred to the "My HR" feature, which would be the real second call site.

---

### FE-BACKLOG-015 — Attendance 403s for every employee: BFF proxy allowlist prefix mismatch

**STATUS: RESOLVED 2026-06-29** (commit `4ab385b`, "correct attendance BFF proxy allowlist prefix").
The allowlist prefix was corrected `/api/v1/time-attendance` → `/api/v1/attendance`; `my/attendance`
now reaches the gateway instead of 403ing at the proxy.
**Note — ID collision (resolved 2026-06-29):** the Run-04 remediation backlog
(`docs/backlog/2026-06-15-run-04-remediation-backlog.md`, item B-1) originally reused `FE-BACKLOG-015`
for an unrelated item ("LINE_MANAGER has no leave-approval surface"). That item has been reassigned to
`FE-BACKLOG-018`; this entry (attendance) is the sole owner of `FE-BACKLOG-015`.

**Raised:** 2026-06-17 (found during loading-state W1 behavioural verification of `my/attendance`).
**Priority:** High — `my/attendance` is non-functional for **every** employee, not a single account.

**Problem:** The tenant-portal BFF proxy allowlist
(`frontend/tenant-portal/src/app/api/proxy/[...path]/route.ts`) lists the prefix
`/api/v1/time-attendance`, but the attendance page requests `/api/v1/attendance/employees/{id}` and the
api-gateway routes `/api/v1/attendance/**` (+ `/api/v1/shifts/**`) to attendance-service
(`application.yml` route `attendance-service`). The allowlist prefix therefore never matches, and the
proxy returns `403 {"error":"FORBIDDEN","message":"Path not allowed"}` before the request ever reaches
the gateway.

**Blast radius:** every user, every request. The allowlist is a static prefix check with no per-user or
per-role logic — so this is **not** account-specific (not a `jane.w` quirk). `my/attendance` has never
successfully loaded data through the portal for anyone; it currently always renders its error state.

**Fix:** correct the allowlist prefix `/api/v1/time-attendance` → `/api/v1/attendance` (and add
`/api/v1/shifts` if/when the shifts UI lands). One-line change; verify `my/attendance` then loads records
for an employee with attendance data. No backend change required — the gateway route and service are
correct; only the BFF allowlist prefix is wrong.

**Note:** the loading-state W1 work added a correct tri-state (skeleton / empty / **error**) to
`my/attendance`; this finding is why the *error* branch is what employees see today. Fixing the prefix is
what makes the *data* branch reachable. The two are independent — W1 did not introduce or depend on this.

### DEV-BACKLOG-001 — jane.w@demo.co.ke password reverts between sessions

**Raised:** 2026-06-14 (recurring during Run-03 verification). **Priority:** Low — dev/test only, not a product defect.

**Symptom:** the demo employee `jane.w@demo.co.ke` repeatedly stops authenticating with the documented
password `Employee@123!` (login → 401 `INVALID_CREDENTIALS`). Her row's `updated_at` shows the password
hash being changed out-of-band; `is_active=true`, not locked. Each time it's restored (admin
password-reset → set-password back to `Employee@123!`) login works, then later reverts.

**Hypothesised causes (unconfirmed):** a seed/reset job or test fixture that re-seeds demo users; leftover
state from an integration/e2e suite that resets credentials; or a scheduled demo-refresh. **Also note**
(separate, AUTH-BACKLOG-009): rapid repeated logins for the same user return a transient refresh-rotation
409 with no token — that's a different symptom (empty token, not 401) but compounds the confusion.

**What it needs:** find what writes `users.password_hash` for jane outside an explicit admin action
(grep seed scripts, CI fixtures, scheduled jobs), then either stop it touching the demo account or make
the documented password the seeded one. Not blocking; affects only local verification.

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

### NOTIFICATION-BACKLOG-001 — Tenant/licence lifecycle events produce no notification (suspend/reactivate/cancel/renew/upgrade)

**Raised:** 2026-05-19 · **Rescoped:** 2026-06-13
**Priority:** High — required before the platform serves real paying customers.

**Status note (2026-06-13, verified):** the original blanket title — "ignores **all** lifecycle events
except TenantCreated" — is now **stale**. notification-service has since gained four working listeners:
`AuthEventListener` (EmployeeUserProvisioned, PasswordResetRequested), `EmployeeEventListener`
(EmployeeCreated, EmployeeTerminated), `LeaveEventListener` (LeaveApproved, LeaveRejected), and
`PayrollEventListener` (PayrollApproved, PayrollProcessed). **However, the original concern remains OPEN
and unchanged:** `TenantEventListener` still handles **only** `TenantCreatedEvent` (verified — its
`handle()` is a single `instanceof TenantCreatedEvent`), so the five tenant/licence-lifecycle
notifications below are still not produced.

**Problem (still open):**
`TenantEventListener` handles exactly one event: `TenantCreatedEvent` (welcome email). The following events are published to RabbitMQ but produce no email notification:

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

### AUTHZ-BACKLOG-001 — Audit @PreAuthorize role-grant *intent* across all 9 services

**Raised:** 2026-06-14 during Run 03 R3-0 (role-vocabulary canonicalization). **Priority:** Medium–High — privilege-boundary correctness.

R3-0 reconciled the role *vocabulary* (`HR` → `HR_OFFICER`, single `Role.OPERATIONAL` source, reserved roles dropped from the assignable surface — see `docs/decisions/2026-06-14-run-03-role-canonicalization.md`). It was explicitly scoped as a **rename, not a privilege-policy decision** (Gate 1 option (a)). The strict rewrite restored the originally-intended grants but left three *intent* ambiguities unresolved, which this item must settle:

1. **Should `HR_OFFICER` approve/run payroll?** The `HR` → `HR_OFFICER` rewrite gave officer-tier users payroll approve/run access (payroll `ADMIN, HR_MANAGER, HR` → `…, HR_OFFICER`). Officer-vs-manager approval boundary needs a decision. (Live demo user `david.ochieng@demo.co.ke` now has this access.)
2. **Should `HR_OFFICER` reach integration-hub, tenant config (`FeatureFlagController`), and other sensitive-config surfaces?** These got the blanket `HR` → `HR_OFFICER` rewrite at class level.
3. **Documented `HR_OFFICER` vs `HR_MANAGER` split per service** — currently implicit; needs to be written down for every service that grants both.

**Deliverable:** a decision doc mapping every `@PreAuthorize` role grant (all 9 services) to its intended privilege, with the three resolutions above. Sibling to [[SEC-BACKLOG-001]] (which audits the *SpEL ownership* pattern; this audits the *role-set* intent). Run in a future remediation run, not R3.

---

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

---

## Backend engineering backlog (detailed write-ups in `docs/Engineering/backend/`)

Formalized 2026-06-13 from standalone backend backlog docs that had no IDs. One-line summaries here;
full diagnoses + fixes live in the linked docs (single source of truth for the detail).

### INFRA-BACKLOG-003 — Redis connectivity 503s: readiness restart-loop + tenant-data outage

**Raised:** 2026-06-07 · **Priority:** High — deployment-blocking.
On Redis unavailability the service readiness flaps and tenant-data requests 503. Full write-up:
`docs/Engineering/backend/2026-06-07-redis-readiness-503-backlog.md`.

---

### INFRA-BACKLOG-004 — Audit `@DataJpaTest` slices for the JPA-auditing gap

**Raised:** 2026-06-08 · **Priority:** Medium — latent broken tests, not a production defect.
`@DataJpaTest` slices don't load `@EnableJpaAuditing`, so auditing-dependent persistence can fail in those
slices. Full write-up: `docs/Engineering/backend/2026-06-08-datajpatest-auditing-gap-backlog.md`.
(Related: PAYROLL-BACKLOG-002, audit `@EnableJpaAuditing` across services.)

---

### AUTH-BACKLOG-008 — Super-admin tenant impersonation returns 500 INTERNAL_ERROR

**Raised:** 2026-06-08 · **Priority:** High / support-critical.
SUPER_ADMIN cannot impersonate a tenant (impersonation endpoint 500s). Full write-up:
`docs/Engineering/backend/2026-06-08-superadmin-impersonation-500-backlog.md`.

---

### AUTH-BACKLOG-009 — `POST /api/v1/auth/refresh` returns 409 on token rotation

**Raised:** 2026-06-08 · **Priority:** Low–Medium — endpoint currently unused by the tenant-portal BFF.
Concurrent/rotated refresh returns 409 (seen transiently after change-password re-auth). Full write-up:
`docs/Engineering/backend/2026-06-09-refresh-token-409-rotation-backlog.md`.

---

### API-BACKLOG-003 — Framework 4xx (405/415/406) masked as 500 by the shared exception handler

**STATUS: RESOLVED 2026-06-11** (PR #3, commit `341423e`). Added a 405 handler to the shared
`GlobalExceptionHandler` (+ leave-service's local advice that shadowed it); a wrong HTTP method now
surfaces as 405, not a generic 500. Broader 4xx (415/406) hardening left as a reopen-if-needed note.
**Raised:** 2026-06-09. Full write-up: `docs/Engineering/backend/2026-06-09-method-not-allowed-masked-500-backlog.md`.

---

### PAYROLL-BACKLOG-005 — Pending-activation employees are payroll/filing-eligible despite incomplete statutory IDs

**Raised:** 2026-06-09 · **Priority:** Medium — compliance/payment correctness (pre-existing; not introduced by W5).
Placeholder/pending-activation rows (NULL statutory IDs after V10) must be excluded from payroll runs and
statutory filings. Full write-up: `docs/Engineering/backend/2026-06-09-pending-activation-payroll-eligibility-backlog.md`.

---

## Lifecycle Workflows (Run L1)

Filed 2026-07-15 during Run L1 Phase A (Employee Lifecycle Workflows). See
`docs/decisions/0003-lifecycle-workflows-phase-a.md`. All explicitly out of Run L1 scope.

### LIFECYCLE-BACKLOG-001 — `CreateEmployeeFromCandidate` gRPC RPC / recruitment integration

**Raised:** 2026-07-15 · **Priority:** Deferred — no caller. The Recruitment Service does not exist.
An onboarding workflow initiated from a hired candidate would need a `CreateEmployeeFromCandidate`
RPC on employee-service. Build only when Recruitment ships and has a concrete caller.

### LIFECYCLE-BACKLOG-002 — Asset-return automation for offboarding

**Raised:** 2026-07-15 · **Priority:** Deferred — Asset Service does not exist. Offboarding "company
property return" ships as a MANUAL checklist task. When an Asset Service exists, wire asset-return
tasks to real asset records (auto-complete on return check-in).

### LIFECYCLE-BACKLOG-003 — Final-pay computation integration for offboarding

**Raised:** 2026-07-15 · **Priority:** Deferred — payroll owns money; the offboarding workflow only
links. The "final pay" offboarding task is a manual link that computes nothing. A future integration
could surface the final-pay run status/amount inline (read-only) from payroll-service.

### LIFECYCLE-BACKLOG-004 — Employee document-upload flow for DOCUMENT_UPLOAD onboarding tasks

**Raised:** 2026-07-16 (Run L1 W3) · **Priority:** Medium. The default onboarding template
includes a DOCUMENT_UPLOAD task ("Upload national ID"), but tenant-portal has no employee-facing
document-upload UI and document-service exposes no employee upload endpoint (only GET/list/issue on
existing documents). W3 therefore renders DOCUMENT_UPLOAD tasks with a "coming soon" hint and lets
the employee confirm-complete without attaching a file (the backend does not require a documentId).
Build: an employee upload endpoint (document-service) + an upload control on the `/my` onboarding
card that captures the returned documentId and passes it to the task-complete call.

### LIFECYCLE-BACKLOG-005 — Role-matched task completion (LINE_MANAGER cannot complete assigned tasks)

**Raised:** 2026-07-16 (Run L1 W1 review) · **Priority:** Medium — offboarding UX/authz. The default
offboarding template assigns tasks by role (LINE_MANAGER handover, ADMIN access revocation, HR_OFFICER
property return, HR_MANAGER final pay). But the task-completion endpoint authorises only EMPLOYEE
(own EMPLOYEE-assigned task, via X-Employee-ID) and HR_MANAGER/ADMIN (any task). So a **LINE_MANAGER
or HR_OFFICER assigned a task cannot complete it themselves** — HR_MANAGER/ADMIN tick those off from
the admin board. That is acceptable for v1 (offboarding is an admin-driven board), but role-matched
completion (each assignee completes their own assigned tasks) is a deliberate follow-up: decide whether
to grant per-assignee-role completion (LINE_MANAGER completes LINE_MANAGER tasks, etc.) and whether
LINE_MANAGER reaches these tasks through `/my/*` (they route there, not `/admin/*`). Decide later.

### FE-BACKLOG-019 — No dedicated "Archived employees" view (reachable only via the Terminated status filter)

**Raised:** 2026-07-16 (Run L1 live verification) · **Priority:** Medium — archived employees ARE
reachable, so this is discoverability/UX, not data loss.

D2 assumed "the existing Archived employees view surfaces them". **There is no such view.** What exists
is the employees-list **status filter tab "Terminated"**
(`admin/employees/page.tsx:47,195` → `?status=TERMINATED`), which the backend does NOT archive-filter —
so it returns archived rows. Verified live 2026-07-16: default roster returned 33 employees with **0
TERMINATED** (archived correctly excluded), while `?status=TERMINATED` returned **all 7** archived
employees. So archived employees are reachable, just not via anything labelled "archived", and the
`archived_at` distinction is invisible in the UI (a TERMINATED-but-not-archived row would look identical
to an archived one).

**Fix (when picked up):** either (a) label the affordance honestly — an "Archived" filter/section driven
by `archived_at` (needs a backend `archived` filter param + a `findByTenantIdAndArchivedAtIsNotNull`
query), or (b) accept the Terminated tab as the archived surface and drop the "Archived employees view"
language from the D2 decision record. Option (a) is the more truthful model now that `archived_at` and
`status` are separate concepts.

### DOCUMENT-BACKLOG-002 — Synchronous "generate Certificate of Service" endpoint

**Raised:** 2026-07-15 · **Priority:** Medium. Today the Certificate of Service draft is generated
ONLY event-driven, on `EmployeeTerminatedEvent` (document-service `EmployeeTerminatedEventListener`).
There is no synchronous REST endpoint to generate a draft on demand — the only sync action is
`POST /api/v1/documents/{id}/issue` on an already-existing draft. An offboarding checklist cannot
therefore have a pre-completion "generate certificate" task (the draft doesn't exist yet). A sync
`POST /api/v1/documents/certificates/generate` (employeeId, tenant) would let a workflow request the
draft on demand. Until then, Run L1 renders a post-completion hint (see D3).

### NOTIFICATION-BACKLOG-002 — Generic "task-assigned / action-required" notification type + template

**Raised:** 2026-07-15 · **Priority:** Medium. notification-service has no generic task/action-required
notification type — every notification is a domain-specific listener with hard-coded copy, and there is
no template engine. A lifecycle workflow that wants to alert an assignee ("You have an onboarding task
due") needs a new event + listener + type string + (ideally) a template mechanism. Run L1 ships without
task-assignment alerts (D4); the in-app pipeline board and `/my/dashboard` card are the v1 surfaces.
