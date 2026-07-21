# Payroll Runs Audit
**Date:** 2026-05-15  
**Scope:** payroll-service, integration-hub-service (M-Pesa), api-gateway routing, planning document  
**Purpose:** Pre-build audit before implementing payroll run UI. Identifies implementation state, statutory rate accuracy, endpoint gaps, and unresolved product decisions.

---

## Risk Classification

| Label | Meaning |
|---|---|
| 🔴 BLOCKER | Must be resolved before any payroll UI ships to users |
| 🟡 RISK | Material correctness risk — flag and decide consciously |
| 🟢 VERIFIED | Checked and correct |
| ⬜ GAP | Missing functionality — decide whether it's in scope |

---

## Audit 1: payroll-service Current State

### 1.1 State Machine

`PayrollRun.status` follows this linear path:

```
DRAFT
  │ markCalculating()  guard: status == DRAFT
  ▼
CALCULATING
  │ finishCalculation()  guard: status == CALCULATING
  ▼
CALCULATED
  │ approve()  guards: status == CALCULATED, employeeCount > 0
  ▼
APPROVED
  │ markProcessing()  guard: status == APPROVED
  ▼
PROCESSING
  │ complete()  guard: status == PROCESSING
  ▼
COMPLETED  (terminal)
```

Failure exits:
- `fail()` from DRAFT, CALCULATING, CALCULATED, PROCESSING → FAILED (terminal)
- `cancel()` from DRAFT, CALCULATING, CALCULATED, APPROVED → CANCELLED (terminal)

Guards on `cancel()`: cannot cancel PROCESSING or COMPLETED.  
Guards on `fail()`: cannot fail COMPLETED or APPROVED.

Duplicate prevention: a new run for the same `(tenantId, period, payFrequency)` is rejected if any run exists in [DRAFT, CALCULATING, CALCULATED, APPROVED, PROCESSING]. Re-runs after COMPLETED, FAILED, or CANCELLED are permitted (enforced via partial unique index, not just application logic).

### 🔴 1.2 PROCESSING and COMPLETED transitions are not wired

`markProcessing()` and `complete()` exist on the entity but are not called by any current `PayrollService` method. The HTTP controller exposes no endpoint that triggers these transitions.

The intent: after `approve()`, the integration-hub-service handles disbursement and should call back to payroll-service to mark PROCESSING → COMPLETED. But there is **no gRPC method** in payroll-service's `PayrollGrpcService` to receive that callback. There is also no RabbitMQ listener in payroll-service for a "payments completed" event from integration-hub.

**Consequence:** An approved payroll run stays in `APPROVED` indefinitely, even after all M-Pesa payments succeed. The payroll run list will never show `COMPLETED` for any run built on the current codebase.

**Decision required before UI build:** Who transitions APPROVED → PROCESSING → COMPLETED, and how?
- Option A: integration-hub publishes `PaymentsCompletedEvent`; payroll-service listens and calls `complete()`.
- Option B: payroll-service exposes a gRPC endpoint `markRunCompleted(runId, tenantId)`; integration-hub calls it after disbursement.
- Option C: Status reporting is delegated entirely to the payments service; the payroll run stays APPROVED, and "disbursed" is inferred from payment transaction summaries. The PROCESSING/COMPLETED enum values become dead code.

This affects the UI's run detail page state display and any "payment status" affordance.

### 1.3 PayrollRun Entity Fields

Database table: `payroll_runs`

| Java field | Column | Type | Nullable |
|---|---|---|---|
| `period` | `period` | VARCHAR(7) `YYYY-MM` | NOT NULL |
| `payFrequency` | `pay_frequency` | VARCHAR(10) `MONTHLY\|WEEKLY\|DAILY` | NOT NULL |
| `status` | `status` | VARCHAR(20) | NOT NULL |
| `employeeCount` | `employee_count` | INTEGER | NOT NULL, default 0 |
| `totalGross` | `total_gross` | NUMERIC(15,2) | nullable until CALCULATED |
| `totalBasic` | `total_basic` | NUMERIC(15,2) | nullable |
| `totalAllowances` | `total_allowances` | NUMERIC(15,2) | nullable |
| `totalPaye` | `total_paye` | NUMERIC(15,2) | nullable |
| `totalNssf` | `total_nssf` | NUMERIC(15,2) | nullable |
| `totalShif` | `total_shif` | NUMERIC(15,2) | nullable |
| `totalHousingLevy` | `total_housing_levy` | NUMERIC(15,2) | nullable |
| `totalOtherDeductions` | `total_other_deductions` | NUMERIC(15,2) | nullable |
| `totalNet` | `total_net` | NUMERIC(15,2) | nullable |
| `currency` | `currency` | VARCHAR(3) | NOT NULL, always "KES" |
| `initiatedBy` | `initiated_by` | VARCHAR(100) | nullable |
| `approvedBy` | `approved_by` | VARCHAR(100) | nullable |
| `approvedAt` | `approved_at` | TIMESTAMP | nullable |
| `completedAt` | `completed_at` | TIMESTAMP | nullable |
| `notes` | `notes` | VARCHAR(500) | append-only audit log |

`PayFrequency` enum: `MONTHLY`, `WEEKLY`, `DAILY`. No `BI_WEEKLY` despite the planning document listing bi-weekly as a target pay frequency.

### 1.4 PaySlip Entity Fields

Database table: `pay_slips`. One row per employee per payroll run.

| Java field | Column | Notes |
|---|---|---|
| `employeeId` | `employee_id` | UUID reference to employee-service |
| `employeeNumber` | `employee_number` | Denormalized at calculation time |
| `employeeName` | `employee_name` | Denormalized at calculation time |
| `basicPay` | `basic_pay` | Pensionable pay (NSSF basis) |
| `housingAllowance` | `housing_allowance` | |
| `transportAllowance` | `transport_allowance` | |
| `medicalAllowance` | `medical_allowance` | |
| `otherAllowances` | `other_allowances` | |
| `totalAllowances` | `total_allowances` | Sum of four above |
| `grossPay` | `gross_pay` | basicPay + totalAllowances |
| `paye` | `paye` | Net PAYE after reliefs |
| `nssf` | `nssf_employee` | Employee NSSF contribution |
| `nssfEmployer` | `nssf_employer` | Employer match |
| `shif` | `shif` | Employee SHIF |
| `housingLevy` | `housing_levy_employee` | Employee Housing Levy |
| `housingLevyEmployer` | `housing_levy_employer` | Employer Housing Levy |
| `helb` | `helb` | HELB loan repayment |
| `nita` | `nita` | KES 50 NITA levy (employer, not deducted from employee) |
| `otherDeductions` | `other_deductions` | Unpaid leave deductions |
| `totalDeductions` | `total_deductions` | paye + nssf + shif + housingLevy + helb + otherDeductions |
| `personalRelief` | `personal_relief` | Stored for transparency |
| `insuranceRelief` | `insurance_relief` | Stored for transparency |
| `netPay` | `net_pay` | grossPay - totalDeductions |
| `paymentStatus` | `payment_status` | `PENDING\|PROCESSING\|PAID\|FAILED\|REVERSED` |
| `mpesaReceipt` | `mpesa_receipt` | Set on successful M-Pesa callback |
| `paymentPhone` | `payment_phone` | Phone number used for M-Pesa payment |

`paymentPhone` is populated at calculation time from the employee's `phoneNumber` (M-Pesa = phone). This field is how integration-hub knows where to send the payment.

**No PayrollItem entity.** PaySlip is the line-item entity. Each payslip is one employee's full gross-to-net calculation for the period.

### 1.5 Three-Phase Calculation Design

`PayrollService.calculatePayroll()` uses `@Transactional(propagation = NOT_SUPPORTED)` on the outer method and two nested `TransactionTemplate` calls:

```
Phase 1 (short write TX):
  → mark CALCULATING
  → validate status == DRAFT
  → return period string

Phase 2 (no TX — gRPC calls):
  → getActiveEmployees(tenantId)          [employee-service, fails hard]
  → getSalaryStructuresBatch(...)          [employee-service, fails hard]
  → getLeaveBalancesBatch(...)             [leave-service, fails soft → empty]
  → getUnpaidLeaveDaysForPeriod(...)       [leave-service, fails soft → 0]

Phase 3 (write TX):
  → for each employee: calculate deductions via KenyanTaxCalculator
  → compute unpaidLeaveDeduction = (basicPay / 22) × unpaidDays
  → netPay = max(0, deductions.netPay - unpaidLeaveDeduction)
  → build PaySlip via builder
  → run.addPaySlip(slip)
  → run.finishCalculation() → CALCULATED
  → persist
  → publish PayrollCalculated event
```

Rationale: Phase 2 can take seconds with many employees. Holding a DB connection during gRPC calls would starve the connection pool at scale. The design isolates the long-running I/O from transaction boundaries.

**22 working days** is a hardcoded constant for unpaid leave per-day deduction. This is an assumption — some months have 20 days, some 23. This affects payslip accuracy for employees with unpaid leave.

### 1.6 gRPC Integration

**Calls from payroll-service:**

| Client | Method | Used for |
|---|---|---|
| `EmployeeGrpcClient` | `getActiveEmployees(tenantId)` | List of employees to include in run |
| `EmployeeGrpcClient` | `getSalaryStructuresBatch(tenantId, ids)` | Salary + allowance data per employee |
| `LeaveGrpcClient` | `getLeaveBalancesBatch(tenantId, ids, year)` | YTD leave balances (informational) |
| `LeaveGrpcClient` | `getUnpaidLeaveDaysForPeriod(tenantId, ids, year, month)` | Unpaid leave deduction for this period |

Salary fields in `SalaryStructureResponse` are **strings**, not decimals. PayrollService parses them via `parseSalary()` which returns `ZERO` for null/blank/malformed input. An employee with a corrupted salary record silently gets `basicPay = 0` and is skipped (logged warn).

**gRPC methods exposed by payroll-service** (read-only, for other services):
- `GetPayrollRun` — fetch run by ID
- `GetPaySlip` — fetch single payslip
- `GetLatestPaySlip` — fetch most recent payslip for employee
- `GetPaySlips` — fetch all payslips for a run

### 1.7 Events Published

| Event | Trigger | Payload |
|---|---|---|
| `PayrollInitiated` | After `initiatePayroll()` commit | run ID, period, tenantId |
| `PayrollCalculated` | After `calculatePayroll()` commit | run ID, period, employeeCount, totals |
| `PayrollApproved` | After `approvePayroll()` commit | run ID, period, approvedBy, totalNet |
| `PayrollProcessed` | Not currently triggered | (would be after disbursement) |

`PayrollApproved` is consumed by `notification-service.PayrollEventListener` which sends IN_APP notification to the approving user. It is **not currently consumed** by integration-hub to trigger automatic disbursement — disbursement is manually initiated via `POST /api/v1/payments/payroll-runs/{id}/disburse`.

### 🟡 1.8 M-Pesa Integration State

In `integration-hub-service`:
- `MPESA_ENABLED` defaults to `false` via `${MPESA_ENABLED:false}` in application.yml
- Dev profile: `consumer-key: ""`, `consumer-secret: ""` (explicitly disabled)
- `SandboxMpesaClient` is the active implementation in dev — logs payment attempts, no real API call
- `MpesaSourceIpFilter` validates callback IPs from Safaricom CIDR range; disabled in dev via `mpesa.callback.ip-validation-disabled: false` (IP validation is active by default, but Safaricom can't reach localhost)

**Disbursement flow:** `POST /api/v1/payments/payroll-runs/{id}/disburse` → `PaymentProcessor` (async via RabbitMQ listener) → `MpesaClient.sendB2C(phoneNumber, ...)`. Each employee's `paymentPhone` from the payslip is used. Failed payments are retried via `POST /api/v1/payments/payroll-runs/{id}/retry-failed`.

**No bank EFT implementation.** `BANK_TRANSFER_ENABLED` defaults to false. The integration-hub has a `PaymentMethod.BANK_TRANSFER` enum value but no implementation beyond the placeholder.

---

## Audit 2: Statutory Rates Verification

### 2.1 PAYE — 🟡 One discrepancy, rest verified

Code constants (in `KenyanTaxCalculator.java`):

| Band | Range (monthly) | Rate | Code constant | 2025/26 KRA published |
|---|---|---|---|---|
| 1 | 0 – 24,000 | 10% | `BAND_1_LIMIT = 24000` | ✅ KES 24,000 |
| 2 | 24,001 – 32,300 | 25% | `BAND_2_LIMIT = 32300` | 🟡 **KES 32,333** (see note) |
| 3 | 32,301 – 500,000 | 30% | `BAND_3_LIMIT = 500000` | ✅ |
| 4 | 500,001 – 800,000 | 32.5% | `BAND_4_LIMIT = 800000` | ✅ |
| 5 | > 800,000 | 35% | `RATE_5 = 0.35` | ✅ |

**Band 2 discrepancy:** The KRA income tax annual limit for Band 2 is KES 388,000 / 12 = KES 32,333/month. The code uses KES 32,300. This is a KES 33 rounding error. At 25% rate, the maximum monthly over-deduction is KES 8.25 per employee in Band 2. The error does not compound across bands because Band 3 starts at the correct relative position — but the absolute boundary is wrong.

**Recommended action:** Change `BAND_2_LIMIT = bd(32300)` to `bd(32333)`. Rerun existing test suite — one or more boundary tests may need to be updated to reflect the correct KRA limit.

**Personal relief:** `PERSONAL_RELIEF = bd(2400)` → KES 2,400/month. ✅ Matches KRA published personal relief.

**Insurance relief:** 15% of SHIF, capped at KES 5,000/month. `INSURANCE_RELIEF_RATE = bd("0.15")`, `MAX_INSURANCE_RELIEF = bd(5000)`. ✅

**Code comment says "FY 2024/2025":** This audit is being run in May 2026, which is FY 2025/2026. If Kenya's Finance Act 2025 (effective July 2025) changed any bracket or rate, the code would be outdated. **Verify with KRA's current P10 tax tables before the first real payroll run.** The brackets have been stable since Finance Act 2023, but confirmation is required.

### 2.2 NSSF — 🟢 Verified

| Item | Code value | 2025 NSSF Act | Status |
|---|---|---|---|
| Tier I ceiling | `NSSF_TIER_1_LIMIT = 7000` | KES 7,000 | ✅ |
| Tier II ceiling | `NSSF_TIER_2_LIMIT = 36000` | KES 36,000 | ✅ |
| Rate | `NSSF_RATE = 0.06` | 6% employee, 6% employer | ✅ |
| Maximum employee contribution | KES 2,160 (calculated) | KES 420 Tier I + KES 1,740 Tier II | ✅ |
| Employer match | Equals employee | Mirrors employee contribution | ✅ |
| Applied to | `basicPay` (pensionable) | Pensionable pay, not allowances | ✅ |

NSSF is correctly applied to basic pay only, not gross (which includes non-pensionable allowances). This is the correct interpretation of "upper earnings limit" under the NSSF Act 2013.

### 2.3 SHIF — 🟢 Verified

| Item | Code value | SHIF Act 2023 | Status |
|---|---|---|---|
| Rate | `SHIF_RATE = 0.0275` | 2.75% of gross | ✅ |
| Cap | None in code | Uncapped | ✅ |
| Effective date | October 2024 (comment in code) | October 2024 | ✅ |
| Applied to | `grossPay` | Gross monthly income | ✅ |

SHIF replaced NHIF in October 2024. The code correctly uses the SHIF rate and applies it to gross pay. The NHIF field naming in the database (`nhif_number` on Employee entity) is a transitional artifact and does not affect calculation correctness.

### 2.4 Housing Levy — 🟢 Verified

| Item | Code value | Finance Act 2023 | Status |
|---|---|---|---|
| Employee rate | `HOUSING_LEVY_RATE = 0.015` | 1.5% | ✅ |
| Employer rate | Equals employee | 1.5% | ✅ |
| Cap | None in code | KRA guidance: uncapped | ✅ |
| PAYE deductibility | NOT deductible (code comment) | KRA guidance: not deductible | ✅ |
| Applied to | `grossPay` | Gross | ✅ |

The code correctly implements the KRA clarification that Housing Levy is not deductible from PAYE taxable income. Taxable income = `grossPay - nssfEmployee` only.

### 2.5 NITA — 🟢 Verified (with note)

`NITA_LEVY = BigDecimal("50.00")` — KES 50 per employee per month.

This is the employer's NITA levy, not an employee deduction. The code correctly includes it in `DeductionResult` but **does not subtract it from net pay** — it is tracked for employer cost reporting only. This is correct.

**Note:** NITA levy is stored in the payslip (`nita` field, `nita_employer` column) but `totalDeductions` excludes it. The payslip UI should render NITA clearly as an employer cost, not an employee deduction, to avoid confusion.

### 2.6 HELB — ⬜ Functional but not yet wired to employee data

`helbDeduction` is passed as a parameter to `KenyanTaxCalculator.calculate(grossPay, basicPay, helbDeduction)`. The PayrollService currently calls the two-argument form, passing `null` → HELB defaults to `BigDecimal.ZERO` for every employee.

HELB deductions require a per-employee monthly repayment amount stored somewhere in the system. Currently, no HELB data is captured on the employee record or retrieved via gRPC. Every employee gets zero HELB deduction.

**Impact:** Employees with active HELB loans will have incorrect net pay (too high). HELB expects repayment via payroll deduction — missing it puts the employer at compliance risk.

**Decision required:** Where does HELB repayment amount live? Options:
- Add `helbMonthlyDeduction` field to Employee entity (employee-service) — simplest
- Separate HELB deduction configuration endpoint in payroll or compliance service
- Salary structure amendment via existing allowance/deduction extension point

### 2.7 Taxable Income Formula — 🟢 Correct

```
taxableIncome = grossPay - nssfEmployee
```

KRA does not allow SHIF or Housing Levy to reduce PAYE taxable income (documented in code comment, matches KRA guidance). Only NSSF employee contribution reduces taxable income. Verified ✅.

### 2.8 Net Pay Identity — 🟢 Verified

Test assertion in `KenyanTaxCalculatorTest`:
```java
assertThat(result.netPay().add(result.totalDeductions()))
    .isEqualByComparingTo(result.grossPay());
```

Gross = Net + Total Deductions is enforced. ✅

---

## Audit 3: HTTP Endpoints and Gateway Routing

### 3.1 Existing payroll-service endpoints

Base path: `/api/v1/payroll`

| Method | Path | Roles | Request | Response |
|---|---|---|---|---|
| POST | `/runs` | ADMIN, HR_MANAGER, PAYROLL_OFFICER | `{period, payFrequency?}` | `PayrollRunResponse` |
| GET | `/runs` | ADMIN, HR_MANAGER, HR | pageable | `Page<PayrollRunResponse>` |
| GET | `/runs/{id}` | ADMIN, HR_MANAGER, HR | — | `PayrollRunResponse` |
| POST | `/runs/{id}/calculate` | ADMIN, HR_MANAGER, PAYROLL_OFFICER | — | `PayrollRunResponse` |
| POST | `/runs/{id}/approve` | ADMIN, HR_MANAGER, PAYROLL_OFFICER | — | `PayrollRunResponse` |
| DELETE | `/runs/{id}` | ADMIN, HR_MANAGER | `{reason?}` | 204 |
| GET | `/runs/{id}/payslips` | ADMIN, HR_MANAGER, HR | — | `List<PaySlipResponse>` |
| GET | `/payslips/{id}` | ADMIN, HR_MANAGER, HR, EMPLOYEE | — | `PaySlipResponse` |
| GET | `/employees/{id}/payslips` | ADMIN, HR_MANAGER, HR, EMPLOYEE | pageable | `Page<PaySlipResponse>` |

**Gateway:** route `payroll-service` matches `Path=/api/v1/payroll/**`. Filters: `TenantLicenceFilter`, `PayrollDisbursementLockFilter`, `CircuitBreaker(financial)` — stricter circuit breaker (30% failure threshold, 60s open-state window vs default 50%/30s).

**Frontend proxy:** `/api/v1/payroll` is in the allowed prefix list. ✅

### 3.2 Disbursement endpoints (integration-hub-service)

Base path: `/api/v1/payments`

| Method | Path | Roles | Description |
|---|---|---|---|
| POST | `/payroll-runs/{id}/disburse` | ADMIN, HR_MANAGER | Trigger disbursement (202 Accepted, async) |
| POST | `/payroll-runs/{id}/retry-failed` | ADMIN, HR_MANAGER | Retry failed payments (202 Accepted) |
| GET | `/payroll-runs/{id}` | ADMIN, HR_MANAGER | Payment transaction list for run |
| GET | `/payroll-runs/{id}/summary` | ADMIN, HR_MANAGER | Payment summary (success/fail counts, totals) |
| GET | `/` | ADMIN, HR_MANAGER | All payment transactions (paginated) |

**Gateway:** route `integration-hub-service` matches `Path=/api/v1/integrations/**, /api/v1/payments/**, /api/v1/filings/**`.

### 🔴 3.3 `/api/v1/payments` not in frontend proxy allowlist

The proxy at `frontend/tenant-portal/src/app/api/proxy/[...path]/route.ts` does not include `/api/v1/payments` or `/api/v1/integrations` in `ALLOWED_PATH_PREFIXES`.

Any UI call to `POST /api/proxy/api/v1/payments/payroll-runs/{id}/disburse` will return HTTP 403 `FORBIDDEN: Path not allowed`.

**Fix required before building disbursement UI:** Add `/api/v1/payments` and `/api/v1/filings` to `ALLOWED_PATH_PREFIXES`.

### 3.4 Endpoint gap analysis for payroll UI

| UI need | Endpoint | Status |
|---|---|---|
| Create payroll run | `POST /runs` | ✅ exists |
| List payroll runs | `GET /runs` | ✅ exists |
| View run detail + totals | `GET /runs/{id}` | ✅ exists |
| Calculate payroll | `POST /runs/{id}/calculate` | ✅ exists |
| Approve payroll | `POST /runs/{id}/approve` | ✅ exists |
| Cancel payroll | `DELETE /runs/{id}` | ✅ exists |
| List payslips for run | `GET /runs/{id}/payslips` | ✅ exists |
| View single payslip | `GET /payslips/{id}` | ✅ exists |
| Employee payslip history | `GET /employees/{id}/payslips` | ✅ exists |
| Disburse payments | `POST /payments/payroll-runs/{id}/disburse` | ✅ exists, ❌ not in proxy |
| Retry failed payments | `POST /payments/payroll-runs/{id}/retry-failed` | ✅ exists, ❌ not in proxy |
| Payment transaction statuses | `GET /payments/payroll-runs/{id}` | ✅ exists, ❌ not in proxy |
| Payment summary | `GET /payments/payroll-runs/{id}/summary` | ✅ exists, ❌ not in proxy |
| Payslip PDF download | — | ❌ does not exist |
| Bulk payslip export (CSV) | — | ❌ does not exist |
| Exception report (anomalies) | — | ❌ does not exist |
| Dry-run preview before calculation | — | ❌ does not exist |
| Adjust individual payslip pre-approval | — | ❌ does not exist |
| KRA P10 PAYE return | `POST /api/v1/filings/paye` (assumed) | ⬜ not verified |

**In scope for first UI build (what exists):** Create, calculate, approve, cancel, view runs, view payslips, disburse (pending proxy fix).

**Out of scope for first build:** PDF download, bulk export, exception report, dry-run, individual payslip adjustment, P10 filing.

---

## Audit 4: Planning Document Analysis

Source: `docs/product/AndikishaHR_Product_Planning_Document.md`

### 4.1 MVP Payroll Scope (Per Planning Doc)

The planning doc defines these as MVP:

| Feature | Implementation Status |
|---|---|
| Payroll engine (PAYE, NSSF, SHIF, Housing Levy, NITA, HELB) | ✅ Implemented (HELB wired to zero — see 2.6) |
| Casual payroll (daily, weekly) | 🟡 `PayFrequency.DAILY` and `WEEKLY` exist but not tested or validated |
| KRA iTax PAYE return generation | ❌ Not implemented |
| M-Pesa salary disbursement | 🟡 Sandbox only; real credentials not configured |
| HR dashboard and basic payroll reports | ⬜ Analytics service exists; payroll-specific reports not audited |
| Multi-period payroll (monthly, bi-weekly, weekly, daily) | 🟡 `BI_WEEKLY` not in `PayFrequency` enum |

### 4.2 Payroll Approval Workflow

Planning doc describes: **prepare → review → approve → disburse**.

Current implementation:
- **Prepare:** `POST /runs` (DRAFT)
- **Calculate:** `POST /runs/{id}/calculate` (CALCULATED) — no "review" step
- **Approve:** `POST /runs/{id}/approve` (APPROVED)
- **Disburse:** `POST /payments/payroll-runs/{id}/disburse` (manual trigger, async)

The planning doc's "review" step between calculate and approve is not a distinct API state — the CALCULATED payroll run serves as the reviewable artifact. The `PayrollRunResponse` totals (gross, net, PAYE, NSSF, etc.) are the review surface. This is acceptable for an MVP.

**Unresolved product question:** Who can approve? The planning doc says "approval requires HR_MANAGER or ADMIN sign-off. Cannot approve unilaterally by PAYROLL_OFFICER." But the endpoint's `@PreAuthorize` allows `PAYROLL_OFFICER`:

```java
@PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER', 'PAYROLL_OFFICER')")
```

This contradicts the planning doc. If PAYROLL_OFFICER can both calculate and approve, self-approval is possible — no segregation of duties. This is a **product decision** that needs to be settled before the UI builds any approval affordance.

### 4.3 Payroll Run UX (Planning Doc Description)

From the planning doc, the intended payroll officer UX:
> *"Officer initiates run. System pre-fills period dates, pulls all active employees, applies attendance data and approved leaves. Officer reviews summary: total gross, total deductions by type, net pay, headcount changes since last run. Exception report flags anomalies (zero-hour employees, new joiners, leavers). Officer approves. System generates payslips, sends notifications, initiates payment."*

**What's missing from current backend:**
1. **Attendance data integration:** Time-attendance service data is not pulled during calculation. Overtime is not calculated. Attendance-driven pay adjustments do not exist in `PayrollService.calculatePayroll()`.
2. **"Headcount changes since last run":** No comparison to previous run is exposed by any endpoint.
3. **Exception report:** No endpoint surfaces anomalies — employees with zero salary, new joiners mid-period, employees terminated during the period. These are identified informally by examining individual payslips.
4. **Automated payslip notifications:** `PayrollApproved` event is published, but notification-service does not currently send payslip notifications to employees on approval. The `handleProcessed()` in `PayrollEventListener` is a no-op (just logs).

### 4.4 Casual Payroll (Daily/Weekly)

Planning doc explicitly calls out casual workers (daily-rated, piece-rate) as an immediate differentiator.

`PayFrequency.DAILY` and `.WEEKLY` exist in the enum. The `createPayrollRun` endpoint accepts `payFrequency` as an optional string. But:

- The calculation logic uses a **fixed 22-day month** for unpaid leave deduction regardless of pay frequency.
- For a DAILY run, the concept of "22 working days" is meaningless — a daily run might cover 1 or 5 days.
- No validation prevents creating a MONTHLY run with `DAILY` frequency or creating two overlapping runs for the same period.
- The planning doc mentions daily-rated and piece-rate workers — piece-rate pay is not modeled at all.

**This is a product definition gap.** Casual payroll needs a separate design pass before building UI for it.

### 4.5 Bi-Weekly Pay Frequency Gap

Planning doc: "Multi-period payroll runs (monthly, bi-weekly, weekly, daily for casual workers)"

`PayFrequency` enum: `MONTHLY, WEEKLY, DAILY` — no `BI_WEEKLY`.

Bi-weekly payroll (every two weeks) is common in construction and NGO sectors in Kenya. This is a missing enum value that will require a schema migration to add.

### 4.6 Dry-Run / Cost Intelligence Preview

Planning doc mentions: "cost intelligence" and the scenario where "Officer reviews calculation summary." The current implementation requires creating a real payroll run (which persists a DRAFT) before seeing any numbers. There is no preview-without-commit endpoint.

**Impact:** An officer who initiates a run, doesn't like the numbers, and cancels leaves a CANCELLED run in the history. This is noisy but not incorrect — CANCELLED runs don't block future runs for the same period.

A future `POST /runs/preview` endpoint (non-persisting) would address this cleanly.

---

## Risk Summary

### 🔴 Blockers (must resolve before UI ships)

1. **PROCESSING/COMPLETED transitions not wired:** Disbursement completes but payroll run status stays APPROVED. Decide which service is responsible for transitioning to COMPLETED and implement the mechanism.

2. **`/api/v1/payments` not in frontend proxy allowlist:** Disbursement, retry, and payment status calls will all return 403 from the proxy. Add to `ALLOWED_PATH_PREFIXES` before building disbursement UI.

3. **PAYE Band 2 limit wrong:** Code uses KES 32,300; KRA published limit is KES 32,333. Over-deducts PAYE by up to KES 8.25/month for employees earning KES 32,300–32,333. Fix before any real payroll runs.

### 🟡 Risks (material compliance — decide consciously)

4. **HELB defaulting to zero:** Every employee with an active HELB loan will have incorrect net pay. Severity depends on employee population. Requires a data model decision — where does HELB repayment amount live?

5. **Self-approval possible for PAYROLL_OFFICER:** Contradicts planning doc segregation of duties. Fix the `@PreAuthorize` on the approve endpoint before exposing approval to PAYROLL_OFFICER in the UI.

6. **22-day hardcoded working days for unpaid leave:** Affects accuracy for months with unusual working day counts and is meaningless for DAILY/WEEKLY pay frequencies. Acceptable for monthly payroll MVP if documented; not acceptable for casual payroll.

7. **"FY 2024/2025" comment in KenyanTaxCalculator:** Verify PAYE brackets against current KRA P10 tables before first production payroll run. Rates have been stable since Finance Act 2023 but confirmation is required.

8. **M-Pesa in sandbox only:** No real disbursement is possible without Safaricom Daraja API credentials and a valid shortcode. Disbursement UI can be built, but live testing requires production credentials or Safaricom's sandbox environment accessible from a public URL.

### ⬜ Gaps (scope decisions required)

9. **Attendance data not integrated in calculation:** Overtime, attendance deductions, and shift differentials are not fed into payroll. Building the payroll UI without attendance integration means the "correct" payroll number is salary + allowances only — not clock-derived gross. Acceptable for MVP if clearly scoped.

10. **Exception report:** No anomaly detection endpoint. Payroll officers cannot see "zero-salary employees, new joiners this period, pending terminations" before approving. High-value feature but not blocking.

11. **Casual payroll (DAILY/WEEKLY) needs separate design:** The pay frequency enum values exist but the calculation logic doesn't account for the shorter period. Do not expose casual payroll in the UI until the product definition is settled.

12. **KRA iTax P10 filing not implemented:** In scope for MVP per planning doc but not built. Needs integration-hub filing endpoints verified separately.

13. **Payslip PDF download missing:** Common payroll UI requirement. Requires document-service integration or server-side HTML-to-PDF generation.

14. **Payslip employee notifications:** `PayrollEventListener.handleProcessed()` is a no-op. Employees don't currently receive payslip notifications after approval. The notification channel exists; it just needs to be wired.

---

## What's Ready for UI Build Now

The following flow can be built immediately without any backend changes (beyond the proxy fix):

```
Create run → Calculate → Review summary → Approve → Disburse
```

Specifically:
- `/admin/payroll/runs` — list page (runs with status, period, totals, headcount)
- `/admin/payroll/runs/new` — create run form (period, pay frequency)
- `/admin/payroll/runs/{id}` — run detail (status, totals breakdown, approve/cancel actions)
- `/admin/payroll/runs/{id}/payslips` — payslip list for a run
- `/admin/payroll/payslips/{id}` — individual payslip detail

Payment disbursement flow can be added after the proxy allowlist fix.

Everything else (casual payroll, attendance integration, PDF, P10 filing, exception report) should be deferred to later milestones as described in the risk summary.
