# Claude Code Prompt — Role, Permissions & Onboarding Build (Full Plan, Gated Execution)

**Companion plan:** `docs/plans/2026-05-22-role-permissions-onboarding-plan.md`. Read it before starting. This prompt is the execution document for that plan.

**Mode:** Gated execution. You will work through six steps in sequence. After each step, STOP, produce a verification report, and wait for explicit "go" from Lawrence before starting the next step. Do not proceed past a checkpoint without confirmation. Do not bundle steps. Do not skip verification.

**Discipline this prompt enforces:**
- Audit-first when behavior is unclear, before making changes.
- Be faithful to the existing design — reuse existing components, tokens, and patterns; no new colours, no raw hex, no `gray-*` classes, no inventing patterns where one already exists.
- Verify visually in the browser, not only in code, for every UI-touching step.
- Stop at every checkpoint. Report. Wait.

---

## Locked decisions (do not revisit)

1. Role model stays single-role for V1. One user, one role.
2. Five authority roles in scope: ADMIN, HR_MANAGER, HR_OFFICER, PAYROLL_OFFICER, EMPLOYEE.
3. Role assignment is ADMIN-only. Stricter than HR_MANAGER-assigns-below-self.
4. Department scope (not reporting-line scope) for management authority.
5. Null-department behavior: Option C — a department-scoped role cannot be assigned to an employee without a department, and a department-scoped read by a user with no department returns 403 with a clear message.
6. User-to-employee link must be non-null in practice for all non-SUPER_ADMIN users.
7. Path B for department propagation: per-request gRPC lookup to employee-service, extending the pattern payroll-service already uses.
8. Profile tier split: tier-1 (phone, personal email, emergency contact, avatar, password) is direct self-edit; tier-2 (bank, KRA PIN, NSSF, SHIF, legal name, DOB, national ID) is HR-edit-only — no request-and-approve workflow for V1.
9. Bulk upload validates the entire file before any commit; account activation is a separate controlled step (select-then-activate), never auto-fired on upload.
10. The full permission-with-scope engine and multi-role stay deferred to the premium tier. This plan does NOT rewire all 67 endpoints. It enforces scope only on the sensitive reads identified in step 2.
11. Backfill of null `employee_id` users is report-and-flag, never auto-link.
12. Avatar storage lives in employee-service, not document-service.

---

# Step 1 — Foundation: user-to-employee link reliability

**Goal:** Make the user-to-employee link reliable so `X-Employee-ID` is never empty for authenticated non-SUPER_ADMIN users. This is the precondition for everything downstream.

## Tasks

1.1 **Enforce link at creation time.** Update `AuthService.register` and the tenant-admin provisioning path so a non-SUPER_ADMIN user cannot be created without a populated `employeeId`. The link must be set atomically with user creation, not as a separate step that can be skipped. Reject with a clear error if no linked employee record exists or can be created in the same transaction.

1.2 **Backfill audit (report-only, no auto-fix).** Query existing users where `employee_id IS NULL`. For each, attempt to identify a likely match by email-within-tenant against the employees table. Produce a report listing:
- User ID, email, tenant, role, created date, last login.
- Best-match employee (if any): employee ID, name, department, matched-by (email/name).
- Confidence: HIGH (unique email match), MEDIUM (multiple potential matches), LOW (no match found).
- Special cases: any SUPER_ADMIN with non-null `employee_id` (should not exist by design — flag for review).

Save this report at `docs/Engineering/backfill/2026-XX-XX-null-employee-id-audit.md`. Do NOT auto-link any users.

1.3 **Add the non-null constraint going forward.** Add an application-level invariant (and a database CHECK or constraint where safe) so future users cannot be created with null `employee_id` unless they are SUPER_ADMIN. Existing legacy users with null are not blocked from logging in by this constraint — only new creates are.

1.4 **SUPER_ADMIN exclusion.** Add an explicit guard: SUPER_ADMIN users must NOT have an `employee_id` (and must not be created via the tenant-admin flow). Audit Section 7 found this isn't enforced today. Enforce it now.

1.5 **Gateway assertion.** In the API gateway's JWT filter, add a log-but-do-not-block assertion: if an authenticated user has empty `employeeId` in the JWT claims AND is not SUPER_ADMIN, log a warning with user ID and request path. This surfaces any remaining gap in production without breaking flows.

## Verification (Step 1 gate)

- Create a new user via registration → confirm `employee_id` is populated.
- Attempt to create a non-SUPER_ADMIN user without an employee context → confirm clean rejection with clear error.
- Run the backfill report → confirm it produces a valid markdown report at the documented path.
- Confirm SUPER_ADMIN users have `employee_id = null` and an attempt to set it is rejected.
- Confirm gateway logs (but does not block) for any authenticated request with empty employeeId.

## Step 1 STOP

Produce a verification report covering all of the above. List the count of null-employee-id users found by the backfill audit and confidence breakdown. Wait for "go" before starting step 2. Do not begin step 2 until Lawrence has reviewed the backfill report and confirmed.

---

# Step 2 — Scope enforcement on sensitive reads

**Goal:** Close the confidentiality hole. Department-scoped reads actually filter by department. Order: employee list → payslip → leave list.

## Tasks

2.1 **Add `EmployeeGrpcClient` to leave-service** following the pattern in payroll-service. Audit Section 4 confirmed payroll has one; leave does not. The client calls `employee-service.getEmployee(tenantId, employeeId)` and returns the employee including `departmentId`.

2.2 **Add a per-request department-context resolver.** In `andikisha-common` (or per-service if cleaner), add a small component that, given the request's `X-Employee-ID` and `X-Tenant-ID`, returns the caller's `departmentId`. Cache the result per-request (request-scoped bean) so a single request lifecycle makes at most one gRPC call to employee-service.

2.3 **Scope enforcement on the employee list (employee-service first).**
- Read the caller's role-permission mapping from the existing `role_permissions` table (this data is seeded already; it just hasn't been read by code).
- If the caller has `employee:read:all` → no filter.
- If the caller has `employee:read:department` → filter `WHERE department_id = <caller's departmentId>`.
- If the caller has `employee:read:own` → filter `WHERE id = <caller's employeeId>`.
- If the caller has a department-scoped permission but their own `departmentId` is null → return 403 with the body: `{ "error": "department_required", "message": "Your account does not have a department assigned. Contact your administrator." }`. This is Option C.

2.4 **Scope enforcement on payslip endpoints (payroll-service).** Same logic, applied to payslip list and payslip detail. The `:own` case is the most common — employees seeing only their own payslips. Confirm an EMPLOYEE with `payroll:read:own` can fetch only their own payslips and gets 403 attempting to fetch another employee's.

2.5 **Scope enforcement on leave list (leave-service).** Same logic, applied to the leave-requests list endpoint. LINE_MANAGER with `leave:read:department` sees only their department's leave; EMPLOYEE with `leave:read:own` sees only their own.

2.6 **Do NOT rewire other endpoints.** All other endpoints across all services keep their existing `@PreAuthorize("hasAnyRole(...)")` coarse checks. The full migration from coarse to fine-grained is out of scope for this plan.

## Verification (Step 2 gate)

Seed test data for verification (if not present): create a few employees across two departments (e.g. "Engineering" and "Operations"), assign a user the LINE_MANAGER role with department = Engineering, and another user the HR_MANAGER role with no department restriction.

- LINE_MANAGER (Engineering) GET /employees → returns only Engineering employees. Verify count.
- LINE_MANAGER (Engineering) GET /employees/{operationsEmployeeId} → 403 or filtered out.
- HR_MANAGER GET /employees → returns all employees in tenant.
- EMPLOYEE GET /employees → 403 or returns only themselves depending on permission row.
- EMPLOYEE GET /payslips → returns only own payslips.
- EMPLOYEE GET /payslips/{otherEmployeePayslipId} → 403.
- LINE_MANAGER (Engineering) GET /leave → returns only Engineering leave requests.
- Assign a user LINE_MANAGER but with no department → GET /employees returns the Option C 403 with the documented message.
- HR_MANAGER (no department) GET /employees → still works because permission is `:all`, not `:department`.
- Verify in the browser using actual UI screens, not just curl. Confirm the network requests fire and the UI reflects the filtered data correctly.

## Step 2 STOP

Verification report. Include test scenarios run, counts observed, and screenshots of the UI showing filtered data for at least the LINE_MANAGER case. Wait for "go" before step 3.

---

# Step 3 — Role assignment

**Goal:** ADMIN can change an employee's role. Audit Section 6 found `User.changeRole()` exists with zero callers, no endpoint, no UI. Wire it up.

## Tasks

3.1 **Add the endpoint.** `PATCH /api/v1/users/{userId}/role` in auth-service, accepting `{ "role": "HR_MANAGER" }` in the body. Gate with `@PreAuthorize("hasRole('ADMIN')")`.

3.2 **Assignment rules.**
- Reject if the new role is SUPER_ADMIN — SUPER_ADMIN cannot be assigned through this endpoint.
- Reject if the target user is SUPER_ADMIN.
- Reject if the target user is ADMIN and the caller is not also ADMIN (defensive: caller is already ADMIN per the @PreAuthorize, but be explicit).
- Apply Option C: if the new role uses department-scoped permissions (e.g. has any `:department` permission in the role_permissions table) AND the target's linked employee has no `department_id`, reject with: `{ "error": "department_required", "message": "Cannot assign {ROLE} — the employee must be assigned to a department first." }`.

3.3 **Audit log.** On successful role change, emit an event to audit-service: changer user ID, target user ID, old role, new role, timestamp.

3.4 **Revoke active sessions.** On role change, revoke the target user's refresh tokens (same Redis pattern used for admin password reset). The existing access token continues to work until its TTL expires (~1 hour) — this is the same accepted window documented in SEC-BACKLOG-003. The user re-authenticates and receives a JWT with the new role.

3.5 **Tenant-portal UI.** On the employee detail page in the admin area (`/admin/employees/{id}`), add a "Role" section showing the current role and a "Change role" action visible only to users with ADMIN role.
- Action opens a modal with a role dropdown (EMPLOYEE, HR_OFFICER, PAYROLL_OFFICER, HR_MANAGER — explicitly not ADMIN, SUPER_ADMIN, or any deprecated role).
- Confirmation step before submission.
- On Option C error from the backend, display the message clearly in the modal with a "Go to employee profile" link to set the department.
- On success, show a toast and refresh the page.
- Use existing UI tokens and the existing modal/button components. No new patterns.

3.6 **Hide the action where it doesn't apply.** The "Change role" action must NOT appear:
- On the SUPER_ADMIN's own profile (not viewable in tenant portal anyway).
- On the caller's own profile (admin cannot demote themselves through this UI — prevents accidental lockout).

## Verification (Step 3 gate)

- ADMIN changes EMPLOYEE → HR_OFFICER. Verify role updated, audit log entry exists, refresh tokens revoked.
- ADMIN attempts to change an EMPLOYEE → LINE_MANAGER for an employee with null department → Option C error displays with clear copy.
- HR_MANAGER cannot see the "Change role" action.
- Non-admin attempts to call the endpoint directly → 403.
- Affected user's existing browser session continues working until access token expiry (~1 hour) — verify by leaving a session open and observing behavior. After re-login, new role's permissions apply.
- Verify visually: take screenshots of the Change Role modal, the success state, and the Option C error state.

## Step 3 STOP

Verification report. Wait for "go" before step 4.

---

# Step 4 — Admin-initiated password reset in tenant portal

**Goal:** HR_MANAGER (and ADMIN) can reset an employee's password from the tenant portal, reusing the platform-portal mechanism.

## Tasks

4.1 **Add the endpoint.** `POST /api/v1/users/{userId}/admin-password-reset` in auth-service. Gate with `@PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")`.

4.2 **Reset rules.**
- Reject if target is SUPER_ADMIN.
- Reject if caller is HR_MANAGER and target is ADMIN (HR_MANAGER cannot reset an admin).
- Generate a temp password (reuse existing util from the platform-portal admin reset).
- Set `must_change_password = true` on the target user.
- Revoke all refresh tokens for the target user.
- Return the temp password in the response (the caller — HR — will hand it to the employee).

4.3 **Audit log.** Emit an event: caller user ID, target user ID, action ("admin_password_reset"), timestamp.

4.4 **Tenant-portal UI.** On the employee detail page, add a "Reset password" action visible only to ADMIN and HR_MANAGER (and never on the caller's own profile).
- Confirmation dialog before action: "Reset password for {employee name}? They will be required to set a new password on next login."
- On success, display the temp password in a modal with: monospace font, copy button, amber warning ("Share this with the employee directly. They will be required to change it on first login."), no auto-close.
- Match the existing platform-portal admin-reset modal pattern — same structure, same fidelity. Reuse components.

4.5 **Reuse the existing forced-password-change gate.** The employee logs in with the temp password and goes through the existing `/set-password` full-page gate built earlier. No new code needed there.

## Verification (Step 4 gate)

- HR_MANAGER resets an EMPLOYEE's password → temp password appears in modal.
- The employee logs in with the temp password → forced into the existing `/set-password` gate, cannot reach the app until password is changed.
- HR_MANAGER attempts to reset an ADMIN → clean 403 with a clear message.
- Non-HR_MANAGER/non-ADMIN does not see the action.
- Caller does not see the action on their own profile.
- Audit log entry present.

## Step 4 STOP

Verification report including screenshots of the reset modal and the forced gate. Wait for "go" before step 5.

---

# Step 5 — Profile self-service with the tier split

**Goal:** Employees manage their tier-1 profile fields. Tier-2 stays HR-edit-only.

## Tasks

5.1 **Define the tiers explicitly in code.** A constant or config in employee-service:
- Tier 1: `phone`, `personalEmail`, `emergencyContactName`, `emergencyContactPhone`, `avatar`, `password`.
- Tier 2: `bankName`, `bankAccountNumber`, `bankBranch`, `kraPin`, `nssfNumber`, `shifNumber`, `legalName`, `dateOfBirth`, `nationalId`.

5.2 **Tier-1 self-edit endpoints.** `PATCH /api/v1/employees/me/profile` accepting tier-1 fields only. Reject any tier-2 fields in the body. Caller must be authenticated; uses `X-Employee-ID` to identify the record. No additional role check needed — employees can always edit their own tier-1.

5.3 **Tier-2 stays on the existing HR-side employee edit endpoint.** Confirm the existing `PATCH /api/v1/employees/{id}` is correctly gated to roles with `employee:write` capability (ADMIN, HR_MANAGER, HR_OFFICER). If not, fix the gate.

5.4 **Audit log on tier-2 changes.** Every successful tier-2 field change emits an audit event with: changer, target, field name, old value, new value, timestamp. Bank details and statutory numbers specifically need an audit trail for dispute resolution.

5.5 **Avatar upload.** Add a small image-upload endpoint in employee-service: `POST /api/v1/employees/me/avatar`. Accept JPEG, PNG, WEBP. Max size 2MB. Store in employee-service-managed storage (S3 or local for dev, following existing project patterns). Return the URL. Do NOT reuse document-service — profile photos and HR documents have different access patterns.

5.6 **Tenant-portal UI: `/my/profile`.** Build the employee profile page with two clearly separated sections:
- **Editable** (tier-1): inline edit-and-save controls for phone, personal email, emergency contact, avatar upload, plus a "Change password" button that opens the existing change-password flow.
- **Read-only** (tier-2): displayed clearly with a note at the top: "To update these details, contact your HR administrator." Show the values (bank account masked to last 4 digits), but no edit controls.
- Use existing form components, existing tokens. Faithful to the design system.

5.7 **The HR-side employee edit screen** (already exists, likely at `/admin/employees/{id}/edit`) should be the path for tier-2 edits. Confirm that page already covers tier-2 fields; if any are missing, add them. Same role gating as today.

## Verification (Step 5 gate)

- Employee at `/my/profile` can edit phone, personal email, emergency contact, upload an avatar, change password. All save and persist.
- Employee cannot edit tier-2 fields from `/my/profile` — controls are absent; values display masked.
- Employee attempts to PATCH a tier-2 field via the `/me/profile` API → rejected with clear error.
- HR_MANAGER at `/admin/employees/{id}/edit` can edit tier-2 fields. Save persists.
- Audit log shows entries for every tier-2 field change.
- Avatar upload works for JPEG, PNG, WEBP; rejects oversized files with clear error.
- Bank account number displays as `****1234` on the read-only profile view.
- Visual verification: screenshots of `/my/profile` showing editable and read-only sections distinct, and the HR-side edit screen.

## Step 5 STOP

Verification report. Wait for "go" before step 6.

---

# Step 6 — Bulk employee upload

**Goal:** HR uploads a CSV/Excel of new employees. Full validation before any commit. Account activation is a separate controlled step.

## Tasks

6.1 **Template.** Generate a downloadable Excel template at `/api/v1/employees/bulk-upload/template`. Required columns: `firstName`, `lastName`, `workEmail`, `role`, `departmentName`, `positionName`, `dateOfJoining`, `basicSalary`. Optional: `phone`, `nationalId`, `kraPin`, `nssfNumber`, `shifNumber`, `bankName`, `bankBranch`, `bankAccountNumber`. Include a header row, a sample row, and a hidden sheet with format hints (date format, phone format, role enum values). Provide both `.xlsx` and `.csv` versions.

6.2 **Upload endpoint.** `POST /api/v1/employees/bulk-upload` accepting multipart file (CSV or Excel). Gate to `@PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")`. Bulk upload cannot create ADMINs — reject any row where `role = ADMIN` or `SUPER_ADMIN`.

6.3 **Validate the entire file before any commit.** For each row, check:
- All required fields present.
- `workEmail` valid format and globally unique within tenant (per the locked `(email, tenant_id)` constraint).
- `role` is one of: EMPLOYEE, HR_OFFICER, PAYROLL_OFFICER, HR_MANAGER.
- `departmentName` and `positionName` resolve to existing records in the tenant. Unknown names produce row-level errors; if the closest match is within edit distance 2, include the suggestion: e.g. "Department 'Logisitcs' not found, did you mean 'Logistics'?"
- `dateOfJoining` is a valid date.
- `basicSalary` is a positive number.
- `kraPin` matches format if present (validate the standard KRA PIN regex).
- `nssfNumber`, `shifNumber` follow expected formats if present.
- Apply Option C: any row with a department-scoped role (none in V1, but check) must have a department.

6.4 **Return the validation report.** Response body:
```json
{
  "totalRows": 200,
  "validRows": 187,
  "errors": [
    { "row": 14, "field": "kraPin", "value": "A12345", "message": "Invalid KRA PIN format" },
    { "row": 27, "field": "workEmail", "value": "duplicate@x.com", "message": "Email already exists" },
    { "row": 33, "field": "departmentName", "value": "Logisitcs", "message": "Department 'Logisitcs' not found, did you mean 'Logistics'?" }
  ],
  "uploadId": "uuid-for-confirmation-step"
}
```
On the frontend, present this as a clear, actionable report. If errors exist, offer: "Download error report" and "Fix and reupload" — do NOT proceed to commit. If errors are zero, offer "Proceed with all rows."

If errors exist AND the user explicitly chooses "Proceed with valid rows only", the upload can commit only the valid rows. Default behavior is fix-and-reupload.

6.5 **Commit step.** `POST /api/v1/employees/bulk-upload/{uploadId}/commit` creates the employee records. Does NOT create user accounts. Does NOT send welcome emails. Returns the count of created employees and their IDs.

6.6 **Separate activation step.** A new page or section in the admin area: `/admin/employees/pending-activation`. Lists employees who exist as records but have no linked user account. HR selects which to activate (multi-select with "Select all on page"). Click "Activate selected" triggers:
- For each selected employee: create User record, link via `employee_id`, generate temp password, set `must_change_password`, queue welcome email.
- Display the temp passwords in a downloadable list (or send to HR's email — but show in-app for safe handling).
- Confirmation dialog before action: "Activate {N} accounts? Welcome emails will be sent to each employee."

6.7 **Audit log.** Emit events for: bulk upload initiated, validation completed (with error count), commit completed (with employee count), activation triggered (with user count).

## Verification (Step 6 gate)

- Download the template; confirm columns and sample row.
- Upload a file with deliberate errors (bad emails, missing required fields, unknown departments, invalid KRA PINs) → confirm the validation report shows every error with row number and clear message.
- Fix the errors and reupload → confirm clean validation report.
- Commit; confirm employees exist as records but no user accounts created yet.
- Go to pending-activation page; confirm the bulk-uploaded employees appear.
- Select a subset; activate; confirm user accounts are created, temp passwords displayed, welcome emails queued.
- Activated employees can log in with their temp password and are forced through the change-password gate.
- Bulk upload with `role = ADMIN` in any row → rejected with clear error.
- Non-ADMIN/non-HR_MANAGER cannot access the upload endpoint or page.
- Audit log entries present for upload, commit, and activation events.
- Visual verification: screenshots of the upload UI, the validation report (with errors), and the pending-activation page.

## Step 6 STOP

Final verification report. List all six steps' verification results in a summary table at the end. Confirm the plan is complete.

---

# Across all steps

- Reuse existing components, tokens, and patterns. No raw hex, no `gray-*`, no inventing new design language.
- Verify visually in the browser, not only in code.
- Audit before edit when behavior is unclear.
- Log significant actions to audit-service.
- Apply Option C consistently wherever department-scoped roles or permissions are involved.
- If a step surfaces something unexpected — a schema gap, an inconsistency, a contradiction with the existing system — stop and report it before working around it. Don't paper over surprises.

The companion plan document has the full reasoning for every decision. When in doubt, follow it. When the code conflicts with the plan, surface the conflict and wait for direction — don't silently override either.

Begin with Step 1.
