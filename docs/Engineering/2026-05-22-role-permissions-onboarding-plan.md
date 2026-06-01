# AndikishaHR — Role, Permissions, and Onboarding Build Plan

**Date:** 2026-05-22
**Status:** Plan, ready for review then sequenced execution.
**Grounding:** Both audits (permission system audit, department-propagation audit) and the role-model decisions reached in conversation on 2026-05-22.

---

## What this plan is

A sequenced plan to close the highest-risk gap in the current role and permission system (no scope enforcement on sensitive reads), make role assignment operable (currently impossible through the product), and ship the four user-facing onboarding features (admin password reset, profile self-service, bulk employee upload) on the existing single-role architecture.

The full multi-role permission-with-scope engine and a UI for per-tenant role customization are deliberately deferred to a separate, later project tied to the premium configuration tier. The audits established that the existing permission entities and methods are inert (zero callers), so leaving them inert harms nothing.

---

## What we're NOT building in this plan

These are deliberately deferred, with reasoning:

- **Full multi-role stacking.** The system is cleanly single-role at every layer (audit Section 1). Multi-role is a meaningful architectural change to JWT, gateway, entity, and schema. It serves the premium custom-roles tier, which is its own project.
- **Connecting the full `resource:action:scope` permission engine to all 67 endpoints.** Coarse `hasAnyRole` works today. Replacing it wholesale serves the premium tier, not the current features.
- **Per-tenant role customization UI.** Premium-tier feature, not now.
- **Reporting-line-based scope.** Department scope is the documented model and matches existing wiring. Reporting line stays available for the future (the field is employee-to-employee, audit Section 5, so it's reachable later without cross-service work).

---

## Locked decisions feeding this plan

1. **Role model stays single-role for V1.** One user, one role.
2. **Five authority roles:** ADMIN, HR_MANAGER, HR_OFFICER, PAYROLL_OFFICER, EMPLOYEE. (Existing system already has these and others; we use the documented set and treat extras as deprecated for V1.)
3. **Role assignment is ADMIN-only.** Stricter than the conversation's "HR_MANAGER assigns below itself" — matches the permission matrix doc and is the safer privilege boundary.
4. **Department scope, not reporting-line scope, for management authority.** Matches existing permission strings and wiring. Reporting line deferred.
5. **Null-department behavior: Option C.** A role that uses department-scoped permissions requires the assignee to have a department assigned first. The admin sees a clear prompt at assignment time. This surfaces missing data at the right moment.
6. **User-to-employee link must be non-nullable in practice.** Currently nullable and not enforced at creation (audit Section 1). Step one closes this.
7. **Path B for department propagation.** Per-request gRPC lookup to employee-service, extending the pattern payroll already uses. Audit Section 4 confirms this is the existing-pattern path.
8. **Tier split on profile self-service.** Tier 1 (phone, personal email, emergency contact, avatar, password) is direct self-edit. Tier 2 (bank, KRA PIN, NSSF, SHIF, legal name) is HR-edit-only — no employee request-and-approve workflow for V1.
9. **Bulk upload validates entire file before any commit.** Row-by-row error report. Account activation is a separate controlled step, not auto-fired.

---

## The plan, in sequence

### Step 1 — Foundation: user-to-employee link and department-scope readiness

**Goal:** Make the user-to-employee link reliable and prepare the request context so per-request department lookup will work.

This is the precondition for everything downstream. Currently `users.employee_id` is nullable and not enforced at creation (audit Section 1), and the gateway forwards `X-Employee-ID` which may be empty for legacy users. Scope enforcement built on top of an unreliable link silently fails — worse than no enforcement.

**Tasks:**

1.1 Enforce the user-to-employee link at creation time. Every User created in a tenant context (i.e. not SUPER_ADMIN) must have a populated `employeeId`. Reject creation if no linked employee record exists. Update `AuthService.register` and the tenant-admin provisioning path so the link is set atomically with user creation, not as a separate step that can be skipped.

1.2 Backfill: identify any existing users in dev/demo data with `employeeId = null`, and either link them to their employee record (by email match within tenant) or flag them for cleanup. Report findings. Do not delete data.

1.3 Add a database constraint or application-level invariant making `employee_id` non-null for non-SUPER_ADMIN users going forward. SUPER_ADMIN remains explicitly excluded from having an employee record.

1.4 Confirm `X-Employee-ID` is never empty for authenticated requests after this step. Add a gateway-level assertion that logs (does not block) if an authenticated user has no `employeeId` — surfaces any remaining gap without breaking flows.

**Verification:** Create a new user via registration; confirm `employee_id` is populated. Try to create a user without an employee context; confirm it's rejected with a clear error. Check existing users: zero have null `employee_id` after backfill (or those that do are explicitly excluded/flagged).

**Risk:** Backfill could conflict with users that genuinely have no employee record by intent (e.g. a SUPER_ADMIN seeded into a tenant by mistake). Audit Section 7 noted SUPER_ADMIN exclusion isn't enforced. Address case-by-case during backfill.

---

### Step 2 — Scope enforcement on sensitive reads (Path B, per-request department lookup)

**Goal:** Close the confidentiality hole. Department-scoped reads actually filter by department.

This is the priority-one fix from the conversation. Today, any role that can read employees can read all employees in the tenant; LINE_MANAGER does not actually narrow to their department despite the permission string saying so. We fix this for the three services where it matters: employee, payroll, leave.

**Tasks:**

2.1 Add an `EmployeeGrpcClient` to leave-service following the pattern from payroll-service (audit Section 4 confirms payroll has one; leave does not). This client calls `employee-service.getEmployee(tenantId, employeeId)` and returns the employee record including department.

2.2 Add a small reusable component (in `andikisha-common` or per-service) that, given the request's `X-Employee-ID` and `X-Tenant-ID`, returns the caller's `departmentId`. Cache per-request to avoid repeated gRPC calls within one request lifecycle.

2.3 For each scope-enforcing read endpoint in employee-service, payroll-service, and leave-service, add department-scope filtering. Concretely:
- If the caller's role has the corresponding permission with `:department` scope (e.g. LINE_MANAGER with `leave:read:department`), filter the query by the caller's `departmentId`.
- If the caller's role has `:all` scope (e.g. HR_MANAGER), no department filter.
- If the caller's role has `:own` scope (e.g. EMPLOYEE), filter to `employee_id = caller's employeeId`.
- The decision of which scope to apply per role is read from the existing seeded `role_permissions` table — this is the first time that data actually drives behavior.

2.4 Apply Option C for the null-department case: at the point of scope enforcement, if the caller has a department-scoped permission but their own `departmentId` is null, return a clear 403 with a message like "Your account does not have a department assigned. Contact your administrator." This makes the data gap visible at the moment it matters, rather than silently returning empty results.

2.5 Add scope enforcement to the highest-risk endpoints first, in this priority order:
- Employee list (employee-service) — the salary-and-bank-detail leak
- Payslip list and detail (payroll-service) — the most sensitive data
- Leave list (leave-service) — manager approval workflow

Other endpoints can keep coarse `hasAnyRole` for now; we are not rewiring all 67 endpoints in this step. Scope enforcement targets sensitive reads only.

**Verification:** Create test users with department assignments. A LINE_MANAGER in Department A sees only Department A employees/payslips/leave; cannot see Department B. A HR_MANAGER sees all. An EMPLOYEE sees only their own. A LINE_MANAGER with no department gets a clear 403 with the Option C message. Verify in the browser, not just the API.

**Risk:** Performance — the per-request gRPC call to employee-service adds latency. Mitigate with the per-request cache (2.2). If it becomes a real issue later, the JWT-claim path (Path A from the audit) is the upgrade, but that's a separate project and the audit confirmed it's not currently feasible without a new auth-service dependency.

---

### Step 3 — Role assignment

**Goal:** Make the platform operable. An ADMIN can change an employee's role.

Audit Section 6 found that `User.changeRole()` exists with zero callers, no endpoint, no UI. This is the cheapest real feature we have. We connect it.

**Tasks:**

3.1 Add an endpoint in auth-service: `PATCH /api/v1/users/{userId}/role` accepting a new role. Gate it with `@PreAuthorize("hasRole('ADMIN')")`. Reject if the caller tries to assign SUPER_ADMIN or if the target user is a SUPER_ADMIN.

3.2 Apply Option C at assignment time: if the new role uses department-scoped permissions (e.g. LINE_MANAGER) and the target user's linked employee has no department, return a clear error: "Cannot assign LINE_MANAGER role — the employee must be assigned to a department first." Surface the data gap at the right moment.

3.3 Log role changes to the audit-service event stream (existing audit infrastructure). Each change records the changer, target, old role, new role, and timestamp.

3.4 Build a role-assignment UI in the tenant-portal admin area: an employee detail page or employee list shows current role and offers a "Change role" action to ADMINs only. The UI calls the endpoint, shows the Option C error if applicable, and refreshes on success.

3.5 Revoke active sessions on role change. The current JWT carries the old role; once role changes, the existing token should not continue to grant the old permissions. Revoke the user's refresh tokens (same pattern used for password reset). The user will re-authenticate and get a JWT with the new role.

**Verification:** ADMIN can change an EMPLOYEE to HR_OFFICER. Non-ADMIN cannot access the endpoint or the UI. Attempting to assign LINE_MANAGER to an employee with no department fails with the Option C message. Role change appears in the audit log. After role change, the affected user's existing session no longer grants old-role access.

---

### Step 4 — Admin-initiated password reset in tenant portal

**Goal:** HR can reset an employee's password from the tenant-portal, reusing the existing platform-portal mechanism.

Same plumbing you already built for SUPER_ADMIN resetting tenant admins — temp password generation, `mustChangePassword` gate, refresh-token revocation — now scoped to in-tenant employees.

**Tasks:**

4.1 Add an endpoint in auth-service: `POST /api/v1/users/{userId}/admin-password-reset`. Gate with `@PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")`. Reject if the target is a SUPER_ADMIN or an ADMIN being reset by a non-ADMIN (HR_MANAGER cannot reset an ADMIN).

4.2 Reuse the existing temp-password generation, `mustChangePassword` flag set, and refresh-token revocation logic from the platform-portal admin reset.

4.3 Return the generated temp password to the caller (so HR can hand it to the employee). Surface in a modal in the UI, same pattern as the platform-portal flow.

4.4 Build the UI: on the employee detail page or list, add a "Reset password" action visible only to ADMIN and HR_MANAGER. Confirmation dialog before action.

4.5 Log to audit-service.

**Verification:** HR_MANAGER resets an employee's password; sees the temp password in a modal. Employee logs in with temp password and is forced through the existing change-password gate. HR_MANAGER cannot reset an ADMIN; gets a clear error. Non-ADMIN/non-HR_MANAGER cannot see the action.

---

### Step 5 — Profile self-service with the tier split

**Goal:** Employees manage their own safe profile data. Sensitive fields stay HR-edit-only.

**Tasks:**

5.1 Define the two tiers in code as explicit field lists.
- **Tier 1 (employee self-edit):** phone, personal email, emergency contact (name + phone), profile photo, password.
- **Tier 2 (HR-edit-only):** bank account details, KRA PIN, NSSF number, SHIF number, legal name on file, date of birth, national ID.

5.2 Build the employee profile page (tenant-portal /my/profile) with two sections: editable tier-one fields with inline edit-and-save, and a read-only tier-two section with a note: "To change these details, contact your HR administrator."

5.3 The HR-side employee edit screen (existing) can edit tier-two fields. Gate this with the existing role permissions — only ADMIN, HR_MANAGER, HR_OFFICER (whoever has `employee:write` capability). Don't add a request-and-approve workflow; HR edits directly.

5.4 Log every change to tier-two fields to audit-service (bank details and statutory numbers are exactly the kind of fields that need an audit trail for disputes).

5.5 Avatar upload: small new feature. Reuse the document-service for storage if it handles images, or add a simple image upload to employee-service. Limit file size, accept standard image formats.

5.6 Password change is already partially built (the change-password flow exists). Surface a "Change password" action on the profile page that uses the existing endpoint.

**Verification:** Employee can update phone, email, emergency contact, avatar, and password from /my/profile. Tier-two fields are visible but read-only, with the contact-HR note. HR can edit tier-two fields from the admin-side employee edit screen. Audit log shows entries for tier-two changes.

---

### Step 6 — Bulk employee upload

**Goal:** HR uploads a CSV/Excel of new employees with full validation before any commit.

This is last because it depends on everything above being settled: the field tiers tell us what's in the template and what's sensitive, role assignment exists so the template can include a role column, and the user-to-employee link is reliable.

**Tasks:**

6.1 Define the template columns. Required: first name, last name, work email, role, department (department name, resolved to ID), position (resolved to ID), date of joining, basic salary. Optional but recommended: phone, national ID, KRA PIN, NSSF, SHIF, bank, branch, account number. Provide an Excel template download with header row, format hints, and a sample row.

6.2 Add an upload endpoint in employee-service: `POST /api/v1/employees/bulk-upload`. Accepts CSV or Excel. Gate to ADMIN and HR_MANAGER only.

6.3 Validate the entire file before any commit. Validation rules:
- All required fields present per row.
- Email format valid; email globally unique within tenant (per the locked unique constraint).
- Department and position names resolve to existing records (prerequisite per the onboarding checklist pattern); unknown names produce row-level errors with a suggestion if the closest match is within edit distance 2 (e.g. "Logisitcs" → suggest "Logistics").
- Role is one of the allowed values (EMPLOYEE, HR_OFFICER, PAYROLL_OFFICER, HR_MANAGER). Bulk uploads cannot create ADMINs.
- Statutory field formats validated where present (KRA PIN format, NSSF format).
- Apply Option C precondition: if the row has role = LINE_MANAGER (if we ever add that) or any department-scoped role, the row must have a department.

6.4 Return a row-by-row validation report:
- Total rows: 200.
- Valid rows: 187.
- Errors: 13, listed with row number, field, and clear message.
- Action options: download error report, fix and reupload, or proceed with valid rows only.

6.5 On commit (after explicit confirmation), create employee records but do NOT auto-create user accounts or send welcome emails. Account activation is a separate controlled step.

6.6 Add a separate "Activate accounts" action: HR selects employees from the list (those without linked user accounts) and triggers account creation in batches. This creates the User records, links them to employees, generates temp passwords, and queues welcome emails. HR controls the timing — no 200 emails at once on upload.

6.7 Log the upload event and the activation event to audit-service.

**Verification:** Upload a file with deliberate errors (bad emails, missing fields, unknown departments). Confirm the validation report shows every error clearly. Fix and reupload; confirm clean run shows expected counts. Upload then activate accounts in batches; confirm welcome emails fire only on activation. Confirm bulk-uploaded employees with tier-two data are saved correctly. Confirm role column works and assigns roles at creation.

---

## Sequencing and gates

Build in order. Each step has an explicit verification gate before the next begins.

- Step 1 → verify user-to-employee link is reliable and `X-Employee-ID` is never empty for authenticated users.
- Step 2 → verify scope enforcement filters correctly across roles and applies Option C cleanly.
- Step 3 → verify role assignment works end-to-end with audit logging and session revocation.
- Step 4 → verify password reset works for HR_MANAGER targets and is blocked for protected targets.
- Step 5 → verify tier split is respected; tier-two changes are audited.
- Step 6 → verify full validation, separate activation, and complete audit trail.

If any step's verification fails, fix before proceeding. Do not stack unverified work.

---

## What's left for the premium tier (out of scope for this plan)

When the time comes to build the premium per-tenant configuration feature, the following pick up from where this plan leaves off:

- Multi-role stacking (move from single `role` column to a role set).
- Wiring all 67 endpoints from coarse `hasAnyRole` to fine-grained `checkPermission` calls.
- A tenant-admin UI to customize which permissions each role holds, with the existing `role_permissions` table's `tenant_id` column finally becoming load-bearing.
- The full permission engine becomes active across the system, not just on the sensitive reads we wire in step 2.
- Optional: reporting-line scope as an alternative to department scope, using the existing `reportingTo` field once populated.

This separation is deliberate. The current plan delivers a safe, operable, single-role product. The premium tier is a deliberate later upgrade tied to a real revenue feature, not speculative engineering today.

---

## Open questions for Lawrence before execution

These are calls only you can make, and the plan needs them locked before step one starts:

1. **Backfill in step 1.2 — what to do with existing users that have null `employee_id`?** Email-match within tenant where possible, but some may not link cleanly. Are you comfortable with "flag and report, do not auto-link ambiguous cases"? Or do you want a different policy?

2. **Step 2.5 — is the priority order (employee list → payslip → leave) correct?** Or is there a specific endpoint you'd want scope enforcement on first because of a known customer concern?

3. **Step 5.5 — avatar storage.** Reuse document-service, or add a small storage path in employee-service? Document-service is the cleaner answer if it already handles images; if it doesn't, this is a minor add either way.

4. **Step 6.6 — account activation in batches.** Is "HR selects which employees to activate" the right control, or would you rather a single "activate all uploaded employees" action with a confirmation? The select-then-activate model is more cautious; activate-all is faster but commits to 200 emails at once.

Answer those four and execution can begin at step 1. Each step lands with a verification report before the next starts.
