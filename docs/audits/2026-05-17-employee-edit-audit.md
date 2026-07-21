# Employee Edit Flow Audit

**Date:** 2026-05-17  
**Scope:** `employee-service` — all update endpoints, DTOs, service methods, audit trail, events  
**Purpose:** Pre-build audit before implementing the edit UI. No code changes made.

---

## 1. What Can Be Edited (UpdateEmployeeRequest)

`PUT /api/v1/employees/{id}` accepts `UpdateEmployeeRequest`. Every field is optional — `null` means "do not change."

| Field | Type | Validation | Notes |
|---|---|---|---|
| `firstName` | `String` | `@Size(max=100)` | |
| `lastName` | `String` | `@Size(max=100)` | |
| `phoneNumber` | `String` | `@Pattern(Kenyan format)` | |
| `email` | `String` | `@Email` | |
| `dateOfBirth` | `LocalDate` | none | |
| `gender` | `String` | none | |
| `departmentId` | `UUID` | none | Triggers a department transfer + history record |
| `positionId` | `UUID` | none | **BUG: silently ignored — see §5** |
| `bankName` | `String` | none | |
| `bankAccountNumber` | `String` | none | |
| `bankBranch` | `String` | none | |

**Service behaviour:** `EmployeeService.update()` calls `employee.updatePersonalDetails()` for personal fields, handles department transfer separately (with a history record), and handles bank details if `bankName != null`. Returns `EmployeeDetailResponse`. Publishes `EmployeeUpdatedEvent` after commit.

---

## 2. What Cannot Be Edited After Creation (Immutable Fields)

These fields appear in `CreateEmployeeRequest` but are absent from `UpdateEmployeeRequest` and have no setter on the entity. They are locked at creation.

| Field | Reason Locked |
|---|---|
| `employeeNumber` | Auto-generated sequence, unique per tenant |
| `nationalId` | Identity document — legal record, unique-constrained |
| `kraPin` | KRA identity — statutory, cannot change |
| `nhifNumber` | Statutory registration number |
| `nssfNumber` | Statutory registration number |
| `employmentType` | Affects payroll and statutory calculations; changing requires termination + rehire |
| `hireDate` | Sets probation clock, statutory entitlement calculations |
| `currency` | Set at creation, inherited by all salary updates |

**UI implication:** These fields should be displayed read-only on the edit form with a lock icon or greyed treatment. Do not hide them — they are important context for the HR user.

---

## 3. Salary Changes Are a Separate Flow

Salary is NOT editable via the general `PUT /{id}` endpoint. A dedicated `PUT /api/v1/employees/{id}/salary` takes `UpdateSalaryRequest`:

| Field | Type | Required | Notes |
|---|---|---|---|
| `basicSalary` | `BigDecimal` | yes | `@NotNull @Positive` |
| `housingAllowance` | `BigDecimal` | no | Null → becomes zero |
| `transportAllowance` | `BigDecimal` | no | Null → becomes zero |
| `medicalAllowance` | `BigDecimal` | no | Null → becomes zero |
| `otherAllowances` | `BigDecimal` | no | Null → becomes zero |
| `helbMonthlyDeduction` | `BigDecimal` | no | Null → becomes zero |

**Critical behaviour:** The salary update replaces the **entire** `SalaryStructure`. If a caller sends only `basicSalary` and omits all allowances, all allowances silently become `KES 0`. The UI must pre-fill all current allowance values when the salary edit form opens, so they are not accidentally zeroed.

**Event published:** `SalaryChangedEvent` (routing key `employee.salary_changed`) carrying `oldSalary`, `newSalary`, `currency`, `changedBy`. Downstream: payroll-service can use this to flag that the next run uses updated rates.

**UI implication:** Salary edit should be a separate section or modal from the general edit form, pre-populated with all current values. Add a confirmation step showing the old vs. new amounts before submission.

---

## 4. Probation Confirmation

`POST /api/v1/employees/{id}/confirm-probation` — no body. Transitions `ON_PROBATION → ACTIVE`. Restricted to `HR_MANAGER`, `ADMIN`. Writes a history record.

**Gap:** No event is published for probation confirmation. If leave-service or any other service needs to react to an employee becoming ACTIVE (e.g. resetting leave accrual to full rate), there is no trigger. This is a backlog item.

**UI implication:** Show a "Confirm Probation" action button on the employee detail page when status is `ON_PROBATION`. Disabled for other statuses.

---

## 5. Bugs Found

### BUG-EDIT-001 — `positionId` in UpdateEmployeeRequest is silently ignored

**Severity:** Medium  
**File:** `EmployeeService.java`, `update()` method  
**Problem:** `positionId` is present in `UpdateEmployeeRequest` and validated by `@Valid`, but the `update()` service method never reads `request.positionId()`. The `Employee.promote(Position, SalaryStructure)` domain method exists but is not wired to any service or controller endpoint.  
**Effect:** An HR user submitting a position change via the API gets a 200 response and sees no error, but the employee's position is unchanged.  
**Resolution options:**
- (a) Wire `positionId` to `Employee.promote()` in the `update()` service method — but note this may interact with salary (promotion often carries a salary change). Should position change be split into its own `POST /{id}/promote` endpoint like salary has its own endpoint?
- (b) Remove `positionId` from `UpdateEmployeeRequest` and defer position change to a future `promote` endpoint with proper UX.

**Decision needed from Lawrence before building the edit UI.** The UI form should not show a position selector until this is resolved.

### BUG-EDIT-002 — Salary update null-allowances silently zero existing values

**Severity:** Medium  
**File:** `EmployeeService.updateSalary()`, `SalaryStructure` constructor  
**Problem:** Null allowance fields in `UpdateSalaryRequest` are converted to `Money.zero(currency)`. If the UI sends `{basicSalary: 50000}` without the other fields, all existing allowances become 0.  
**Resolution:** Pre-fill the edit form with current salary values on load. Validate in the UI that no allowance has been accidentally blanked before submission.

---

## 6. Audit Trail

### What exists

`EmployeeHistory` entity is manually written by `EmployeeService`. Repository has `findByTenantIdAndEmployeeIdOrderByCreatedAtDesc(...)` (paged). The `changeType` values currently written:

| changeType | Trigger | Fields recorded |
|---|---|---|
| `CREATED` | Employee creation | full employee data |
| `TRANSFER` | Department change via `update()` | `fieldName=department`, old/new department names |
| `SALARY_CHANGE` | `updateSalary()` | `fieldName=basicSalary`, old/new amounts |
| `TERMINATED` | `terminate()` | `fieldName=status`, reason |
| `PROBATION_CONFIRMED` | `confirmProbation()` | `fieldName=status` |

### What is NOT recorded

| Change | Status |
|---|---|
| Name change (firstName, lastName) | ❌ No history record |
| Phone number change | ❌ No history record |
| Email change | ❌ No history record |
| Date of birth change | ❌ No history record |
| Gender change | ❌ No history record |
| Bank details change | ❌ No history record |
| Position change | ❌ No endpoint exists, so no history |

**For Kenya compliance (e.g. KRA P9 / NSSF / SHIF filings):** salary and status history are recorded correctly. Personal detail history gaps are low-compliance-risk but create accountability issues internally.

### No API endpoint to read history

`GET /employees/{id}/history` does not exist in the controller despite the repository query being ready. The UI cannot show audit history without this endpoint.

**Decision needed:** Should the edit UI show a "recent changes" panel? If yes, the backend endpoint needs to be added alongside the UI. Suggest filing as a companion task to the edit UI, not a blocker.

---

## 7. Events Published on Update

| Action | Event | Routing Key | Payload |
|---|---|---|---|
| General update | `EmployeeUpdatedEvent` | `employee.updated` | tenantId, employeeId, updatedBy only |
| Salary update | `SalaryChangedEvent` | `employee.salary_changed` | tenantId, employeeId, oldSalary, newSalary, currency, changedBy |
| Probation confirm | *(none)* | — | — |

**`EmployeeUpdatedEvent` is too thin** — it carries no diff, so downstream consumers cannot tell what changed. For the current UI scope this is acceptable (no consumers depend on the diff today), but it's a technical debt item.

---

## 8. Available Backend Endpoints (Edit UI Summary)

| Intent | Method | URL | Auth |
|---|---|---|---|
| Edit personal info + department + bank | `PUT` | `/api/v1/employees/{id}` | ADMIN, HR_MANAGER |
| Edit salary + allowances + HELB | `PUT` | `/api/v1/employees/{id}/salary` | ADMIN, HR_MANAGER |
| Confirm probation | `POST` | `/api/v1/employees/{id}/confirm-probation` | ADMIN, HR_MANAGER |
| Read current employee (pre-fill) | `GET` | `/api/v1/employees/{id}` | ADMIN, HR_MANAGER, HR |
| Read history (endpoint not yet built) | — | `GET /api/v1/employees/{id}/history` | — |

---

## 9. Questions for Lawrence Before Building

1. **Position change:** Should `positionId` be editable from the general edit form (fixing BUG-EDIT-001), or should position change wait for a dedicated `POST /{id}/promote` flow (with salary linked)?

2. **Salary edit placement:** Separate "Edit Salary" button/modal vs. a unified edit form with a salary section? The pre-fill requirement (BUG-EDIT-002) and the audit event (SalaryChangedEvent) both suggest a distinct interaction.

3. **History panel:** Should the edit detail page show the `EmployeeHistory` log? If yes, the backend endpoint needs building alongside the UI.

4. **Which fields to show as locked:** UI convention — greyed out with a lock icon, or hidden entirely?

---

## 10. Edit UI Build Scope (Once Questions Resolved)

**Confirmed in scope (no backend changes needed):**
- Personal info section: firstName, lastName, phone, email, DOB, gender — pre-filled, editable
- Department selector — pre-filled, editable (triggers history record)
- Bank details section — pre-filled, editable
- Salary section (separate form/modal): basicSalary + all allowances + HELB — must pre-fill ALL current values

**Confirmed out of scope (no UI required yet):**
- nationalId, kraPin, nhifNumber, nssfNumber — display as read-only, no edit
- hireDate, employeeNumber, employmentType — display as read-only, no edit
- Position change — pending BUG-EDIT-001 decision
- History panel — pending decision on backend endpoint
