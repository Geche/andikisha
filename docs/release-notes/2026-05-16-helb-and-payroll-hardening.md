# Release Notes — 2026-05-16: HELB Deduction + Payroll Hardening

## Summary

Five changes ship in this release. Two are new features; three are pre-existing bug fixes discovered during smoke testing.

---

## New Features

### HELB Monthly Deduction (employee-service, payroll-service)

Higher Education Loans Board (HELB) repayment is now a first-class field on every employee record.

**What changed:**
- Employee create form: new optional "HELB Monthly Deduction (KES)" field in the Statutory Identifiers section.
- Employee detail page: HELB deduction displays in the Statutory Numbers card.
- Payroll calculation: HELB is deducted post-tax from net pay on every payslip. Previously hardcoded to zero.
- gRPC salary response includes HELB in `SalaryStructureResponse.helb_monthly_deduction` (proto field 8).

**Migration note — REQUIRED admin action before next payroll run:**
The schema migration (`V7__add_helb_deduction.sql`) sets `helb_monthly_deduction_amount = 0` for all existing employees. This is correct for employees with no HELB obligation. However, any employee currently repaying a HELB loan will have an incorrect payslip until their deduction amount is entered.

**Recommended action:**
1. Before the next payroll cycle, HR admin should identify all employees with active HELB loans.
2. Navigate to each employee's detail page → Edit → Statutory section → enter the monthly HELB repayment amount as confirmed by HELB statement.
3. Recalculate payroll only after all HELB amounts are entered.

Failure to update HELB amounts before running payroll will produce payslips that overstate net pay for affected employees. The difference will need to be corrected in the following month.

**Statutory context:** HELB deductions are post-tax (they do not reduce PAYE taxable income). They appear on the payslip as a separate line item below the statutory deductions block.

---

### PaymentsCompletedEvent — Payroll Run State Machine Wired (payroll-service, integration-hub)

Payroll runs now transition from APPROVED to COMPLETED automatically when all payment transactions finish.

**Flow:**
1. HR approves payroll run → status: APPROVED
2. Integration Hub disburses all payments (M-Pesa B2C or bank transfer)
3. After each payment transaction reaches a terminal state (COMPLETED or FAILED), integration-hub checks if all transactions for the run are terminal
4. When all are terminal, integration-hub publishes `PaymentsCompletedEvent` with a summary (countSuccessful, countFailed, totalDisbursed)
5. Payroll-service listener marks the run COMPLETED and publishes `payroll.processed`

**Partial payment failures:** If some transactions fail, the run still transitions to COMPLETED. The `countFailed` value is logged. The UI should surface this in the disbursement detail view (not yet built).

**Idempotency:** Duplicate events are no-ops — if a run is already COMPLETED, the listener logs and returns without state change.

---

## Bug Fixes (Pre-Existing)

### PAYROLL_OFFICER removed from payroll approval

`PAYROLL_OFFICER` could previously approve their own payroll run — a self-approval risk. The `POST /api/v1/payroll/runs/{id}/approve` endpoint now requires `ADMIN` or `HR_MANAGER`. `PAYROLL_OFFICER` retains the ability to initiate and calculate payroll runs, but not to approve them.

### @EnableJpaAuditing missing from payroll-service

All payroll run creation attempts were failing with a `NOT NULL` constraint violation on `created_at`. `BaseEntity.createdAt` (annotated `@CreatedDate`) was never populated because `@EnableJpaAuditing` was absent from the Spring context. No payroll run could be created. Fixed.

### ON_PROBATION employees excluded from payroll

`EmployeeQueryService.findAllActive()` — the method called by payroll-service via gRPC to fetch all payroll-eligible employees — only returned employees with status `ACTIVE`. Employees on probation (`ON_PROBATION`) were silently excluded, resulting in zero employees on every payroll calculation.

All 26 seed employees have status `ON_PROBATION`, so this bug made payroll completely non-functional in the dev environment. Fixed to include both `ACTIVE` and `ON_PROBATION`.

---

## PAYE Band 2 — Correction to Prior Audit Finding

A prior audit flagged the `KenyanTaxCalculator` Band 2 ceiling (32,300) as incorrect, citing a figure of 32,333. Investigation confirmed the constant is correct: KRA's annual Band 2 ceiling is 387,600 ÷ 12 = 32,300 exactly. Only the code comment was wrong; the comment has been updated. The constant was not changed.

This is documented as an audit learning moment: the audit can be wrong, and the investigation step is what makes it safe.
