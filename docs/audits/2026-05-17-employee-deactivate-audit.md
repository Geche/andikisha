# Employee Deactivate Flow Audit

**Date:** 2026-05-17  
**Scope:** `employee-service` termination endpoint + all downstream service responses  
**Purpose:** Pre-build audit answering the product questions before any UI work. No code changes made.

---

## 1. What "Deactivate" Means in the Current Backend

The system uses **status-based soft delete**. There is no separate archive table.

**Status enum (`EmploymentStatus`):**

```
ACTIVE
ON_PROBATION
ON_LEAVE
SUSPENDED
TERMINATED
```

"Deactivate" maps to `TERMINATED`. There is no `INACTIVE` or `OFFBOARDED` state. The `Employee` record stays in its originating database table forever — it is not moved, masked, or purged. All reads via `EmployeeQueryService.findAllActive()` exclude `TERMINATED` employees, so they are naturally invisible to normal HR queries but remain fully queryable when needed (historical payslips, KRA filings, audit trail).

The entity acquires two non-nullable fields on termination:
- `terminationDate` — always `LocalDate.now()` (server clock at time of API call)
- `terminationReason` — the string from `TerminateEmployeeRequest.reason`

---

## 2. The Termination Endpoint

| | |
|---|---|
| **URL** | `POST /api/v1/employees/{id}/terminate` |
| **Response** | `204 No Content` |
| **Auth** | `ADMIN`, `HR_MANAGER` |
| **Body** | `TerminateEmployeeRequest { @NotBlank @Size(max=500) String reason }` |

The endpoint can terminate from any current status (`ACTIVE`, `ON_PROBATION`, `ON_LEAVE`, `SUSPENDED`). It cannot be applied twice — a second call on an already-TERMINATED employee throws `BusinessRuleException`.

**There is no "deactivate" endpoint separate from "terminate."** They are the same operation.

---

## 3. Historical Data Preservation

### Payslips
Fully preserved. `PaySlip` rows store `employeeId` as a UUID reference with no FK constraint. `PaySlipRepository.findByEmployeeIdAndTenantId(...)` works regardless of the employee's current status. There is no purge logic. KRA P9 history is queryable indefinitely. ✅

### Leave history
`LeaveBalance` rows are frozen (not deleted) on termination — see §5. `LeaveRequest` rows are never touched. All historical leave requests remain queryable. ✅

### Employee history (`EmployeeHistory`)
All history records remain. The termination itself writes a `TERMINATED` change record. ✅

### Documents
`Document` rows reference `employeeId` by UUID. No cascade delete exists. ✅

---

## 4. What Happens to Leave Balances

**Handled.** `leave-service` consumes `EmployeeTerminatedEvent` and calls `LeaveBalanceService.freezeForTerminatedEmployee()`, which bulk-updates all `LeaveBalance` rows for the employee to `frozen = true`. 

Once frozen:
- `LeaveBalance.deduct()` no-ops or throws (depending on call site)
- Monthly accrual (`runMonthlyAccrual`) skips frozen balances
- The balances are **not zeroed or paid out** — they are frozen in place

**Implication:** There is no automatic payout of remaining annual leave balance on termination. Under Kenyan Employment Act, accrued leave that has not been taken must be paid out on termination. This requires a manual process or a future enhancement (trigger a pro-rated final payslip that includes leave payout). This is a **compliance gap**, not just a UX gap.

---

## 5. What Happens to Pending Leave Requests

**Not handled — this is a gap.**

`freezeForTerminatedEmployee` only touches `LeaveBalance` rows. It does not query or update `LeaveRequest` rows. After termination:
- PENDING requests remain in HR's approval queue indefinitely
- APPROVED future requests remain in the system with no recourse
- These orphaned requests will appear in any HR approval workflow that doesn't filter by employee status

**Resolution needed:** `leave-service EmployeeEventListener` should call a `cancelAllPendingForEmployee(tenantId, employeeId)` in addition to `freezeForTerminatedEmployee()`. This does not currently exist.

---

## 6. What Happens to Payroll

**Partially handled — log-only, no automated action.**

`payroll-service` consumes `EmployeeTerminatedEvent`. Its response:
- If an open payroll run exists in `DRAFT`, `CALCULATING`, or `CALCULATED` status: logs a `WARN` alerting the payroll officer that a terminated employee may be included
- If no open run: logs `INFO`

**No automated action is taken.** The terminated employee is not removed from an in-flight run, not flagged on their PaySlip, and no final payslip is automatically triggered.

Employees in `TERMINATED` status are excluded from `findAllActive()`, so any **new** payroll run started after termination correctly omits them. The risk is the window between termination and the end of the current open run.

**Compliance gap:** Kenyan law requires a final payslip covering the termination month (including pro-rated pay for partial month + any outstanding leave payout). No such trigger exists.

---

## 7. What Happens Across Other Services

| Service | Response to EmployeeTerminatedEvent | Gap? |
|---|---|---|
| `leave-service` | Freezes all leave balances | Pending requests not cancelled |
| `payroll-service` | Logs warning if open run exists | No automated removal or final-pay trigger |
| `notification-service` | Sends an **in-app** notification to the employee | ❌ In-app is useless if access is revoked; no email |
| `analytics-service` | Increments headcount exit counters | ✅ Fine |
| `audit-service` | Records a `DELETE` audit event | ✅ Fine |
| `document-service` | Queue declared, no listener implemented | ❌ No Certificate of Service, no P9 summary |
| `time-attendance-service` | No listener | ❌ Open shifts/sessions not cleaned up |
| `compliance-service` | No listener | Fine — no action needed at termination time |

### Document service gap
`document-service` has a `document.employee-events` queue bound to the `employee.events` exchange with routing key `employee.terminated`. The queue receives every termination event. However, there is **no `@RabbitListener` implemented** in document-service for this queue. Messages accumulate unprocessed. The intended behavior (likely: generate a Certificate of Service + archive the employee's document folder) was never implemented.

---

## 8. Can a Terminated Employee Be Reactivated?

**No. TERMINATED is a permanent, terminal state.**

The entity has no `reactivate()` domain method. The only status-reversal method is `reinstate()` which only works from `SUSPENDED`. No service method, controller endpoint, or event handler changes a TERMINATED employee back to any active status.

**Implications:**
- A contractor or employee who leaves and returns must be created as a **new employee record** with a new UUID
- Historical payslips, leave history, and documents from the previous stint are under the old UUID — they are not lost, but they are disconnected from the new record
- If re-hire is a real use case for this customer segment (common in Kenyan SMEs — casual labour, contractors), a re-hire flow with a `TERMINATED → ACTIVE` transition (with a new hire date) should be designed

---

## 9. Bugs Found

### BUG-DEACT-001 — `suspend(String reason)` silently drops the reason

**Severity:** Low (endpoint not exposed, so not user-facing yet)  
**File:** `Employee.java`, `suspend()` method  
**Problem:** The method signature accepts `reason` but the entity has no `suspensionReason` field and the value is never stored.  
**Note:** `suspend` has no controller endpoint, so this is not currently reachable through the API. Fix when `suspend` is wired up.

### BUG-DEACT-002 — `ON_LEAVE` employees excluded from payroll runs

**Severity:** High  
**File:** `EmployeeQueryService.java`, `findAllActive()` filter  
**Problem:** The method returns only employees with status `ACTIVE` or `ON_PROBATION`. Employees with status `ON_LEAVE` are excluded. Under Kenyan law, an employee on approved leave continues to receive full pay (with leave balance deducted, unpaid days deducted separately). They must be included in payroll runs.  
**Fix needed:** Add `ON_LEAVE` to the status filter in `findAllActive()` before multi-period payroll is introduced.

### BUG-DEACT-003 — `terminationDate` cannot be back-dated or forward-dated

**Severity:** Medium  
**File:** `Employee.terminate()`, `TerminateEmployeeRequest`  
**Problem:** `terminationDate = LocalDate.now()` is hardcoded. An HR admin processing termination paperwork after the effective date, or entering a notice period end date in advance, cannot set the correct date.  
**Fix:** Add `LocalDate effectiveDate` to `TerminateEmployeeRequest` with a default of today.

---

## 10. Gaps Summary

### Critical (blocking compliance)

| # | Gap | Impact |
|---|---|---|
| G-01 | Pending leave requests not cancelled on termination | Orphaned requests in HR approval queue |
| G-02 | No pro-rated final payslip triggered | Kenyan Employment Act violation — accrued leave must be paid out |
| G-03 | `ON_LEAVE` employees excluded from payroll | Employees on approved leave don't receive pay |
| G-04 | `document-service` listener never implemented | No Certificate of Service generated |

### Important (compliance and UX)

| # | Gap | Impact |
|---|---|---|
| G-05 | No termination email to employee | In-app notification useless if system access revoked |
| G-06 | `TerminateEmployeeRequest` captures only reason | No terminationType (voluntary/dismissal/redundancy), no effective date, no notice period |
| G-07 | `EmployeeTerminatedEvent` is thin | Downstream services must make extra gRPC calls for display data |
| G-08 | No reactivation/re-hire path | Former employees cannot return under existing record |

### Lower priority (operational gaps)

| # | Gap | Impact |
|---|---|---|
| G-09 | `time-attendance-service` has no termination listener | Open shifts/sessions not cleaned up |
| G-10 | `suspend/reinstate` have no controller endpoints | Status transitions modeled but unreachable |
| G-11 | `confirmProbation` publishes no event | Other services can't react to employee becoming ACTIVE |

---

## 11. Product Questions for Lawrence

These require decisions before building the deactivate UI:

**Q1 — Termination vs. deactivation vocabulary**  
The backend calls it `TERMINATED`. Should the UI use "Terminate", "Deactivate", "Offboard", or differentiate between voluntary (resignation) and involuntary (dismissal/redundancy)? This affects the form fields and email copy.

**Q2 — Termination date**  
Should the HR user be able to set an effective date that differs from today? (Yes recommended — fixes BUG-DEACT-003.) If yes, add `effectiveDate` to the backend DTO before building the form.

**Q3 — Leave balance payout**  
On termination, should the system auto-calculate outstanding annual leave days × daily rate and include it in a final payslip? Or is this handled manually outside the system for now? This is a compliance requirement under the Employment Act but adds significant complexity (needs a `FINAL_PAYSLIP` concept in payroll-service).

**Q4 — Pending leave auto-cancellation**  
Should PENDING leave requests be automatically cancelled when an employee is terminated? Or should they remain for HR to review and formally close? (Auto-cancel is simpler and cleaner — G-01 fix.)

**Q5 — Re-hire capability**  
Is rehiring a former employee (same person, new contract) a known use case for the target customers? If yes, design for it now (TERMINATED → re-hire with new hireDate under same UUID). If no, defer.

**Q6 — Notification**  
Should the system email the employee's personal email address on termination? The `Employee` entity stores `email` — this could be used for an offboarding email even after system access is revoked.

**Q7 — Certificate of Service**  
Should the document-service listener be implemented as part of the deactivate flow? The queue infrastructure already exists. A Certificate of Service PDF generated and stored in the employee's document folder would satisfy a legal requirement.

---

## 12. Deactivate UI Build Scope (Once Questions Resolved)

**Confirmed in scope (backend ready):**
- "Terminate employee" action on employee detail page — button visible to ADMIN/HR_MANAGER only
- Confirmation modal with reason field (required, max 500 chars)
- Post-termination: employee status badge updates, action buttons disappear, read-only display of `terminationDate` and `terminationReason`
- `EmployeeDetailResponse` already returns `terminationDate` and `terminationReason` — no backend change needed for the read path

**Requires backend changes before UI:**
- Effective date field (BUG-DEACT-003 fix — add `effectiveDate` to `TerminateEmployeeRequest`)
- Pending leave auto-cancel (G-01 fix — add `cancelAllPendingForEmployee` to leave-service)
- Termination type / reason categorisation (Q1 decision)

**Explicitly deferred (not blocking deactivate UI):**
- Pro-rated final payslip (G-02) — complex, separate feature
- Document-service Certificate of Service (G-04) — separate feature
- Re-hire path (G-08) — separate feature
- suspend/reinstate endpoints (G-10) — separate feature
