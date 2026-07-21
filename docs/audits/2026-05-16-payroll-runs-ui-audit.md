# Payroll Runs UI Audit — 2026-05-16

Audit-first discipline before any payroll UI work. This document covers what endpoints exist, what the three existing pages do and what's wrong with them, what surfaces still need to be built, the state machine in UI terms, open product questions, and template references. Nothing is built until this audit is reviewed and approved.

---

## 1. What Endpoints Exist

### 1a. Payroll runs (payroll-service, port 8084, gateway at /api/v1/payroll)

| Method | Path | Roles | Request | Response |
|---|---|---|---|---|
| POST | `/runs` | ADMIN, HR_MANAGER, PAYROLL_OFFICER | `RunPayrollRequest` | `PayrollRunResponse` 201 |
| POST | `/runs/{id}/calculate` | ADMIN, HR_MANAGER, PAYROLL_OFFICER | — | `PayrollRunResponse` |
| POST | `/runs/{id}/approve` | **ADMIN, HR_MANAGER only** | — | `PayrollRunResponse` |
| GET | `/runs` | ADMIN, HR_MANAGER, HR | pageable params | `Page<PayrollRunResponse>` |
| GET | `/runs/{id}` | ADMIN, HR_MANAGER, HR | — | `PayrollRunResponse` |
| GET | `/runs/{id}/payslips` | ADMIN, HR_MANAGER, HR | — | `List<PaySlipResponse>` |
| GET | `/payslips/{id}` | ADMIN, HR_MANAGER, HR, **EMPLOYEE** | — | `PaySlipResponse` |
| GET | `/employees/{employeeId}/payslips` | ADMIN, HR_MANAGER, HR, **EMPLOYEE** | pageable | `Page<PaySlipResponse>` |
| DELETE | `/runs/{id}` | ADMIN, HR_MANAGER | `CancelPayrollRequest` (optional) | 204 |

**Note:** There is no `/runs/{id}/disburse` endpoint in payroll-service. Disbursement lives in integration-hub (see 1b).

**`RunPayrollRequest` fields:**
```
period: String (required, YYYY-MM format)
payFrequency: String (optional — MONTHLY | WEEKLY | DAILY)
```

**`PayrollRunResponse` fields:**
```
id, period, payFrequency, status, employeeCount
totalGross, totalBasic, totalAllowances, totalPaye, totalNssf, totalShif, totalHousingLevy, totalNet
currency, initiatedBy, approvedBy, approvedAt, completedAt, createdAt
```
Note: No `totalDeductions` field (the frontend references it — it doesn't exist). No `updatedAt` field. No `notes` field returned. No `initiatedAt` field (frontend references this too — it doesn't exist; use `createdAt`).

**`PaySlipResponse` fields (all 27):**
```
id, payrollRunId, period, employeeId, employeeNumber, employeeName
basicPay, housingAllowance, transportAllowance, medicalAllowance, otherAllowances, totalAllowances, grossPay
paye, nssf, nssfEmployer, shif, housingLevy, housingLevyEmployer
helb, nita, personalRelief, insuranceRelief
totalDeductions, netPay, currency
paymentStatus, mpesaReceipt
```
Note: The actual field names are `grossPay` and `netPay` (not `grossSalary`/`netSalary` as the frontend uses). `paymentStatus` and `mpesaReceipt` are present but currently always null — payment completion events don't write back to PaySlip.

### 1b. Payment disbursement (integration-hub-service, gateway at /api/v1/payments)

All require ADMIN or HR_MANAGER.

| Method | Path | Response | What it does |
|---|---|---|---|
| POST | `/payroll-runs/{runId}/disburse` | 202 async | Triggers M-Pesa B2C or bank transfer for all PENDING transactions. Redis-locked, idempotent. |
| POST | `/payroll-runs/{runId}/retry-failed` | 202 async | Retries transactions in FAILED state that have retries remaining. |
| GET | `/payroll-runs/{runId}` | `List<PaymentTransactionResponse>` | All payment transactions for the run. |
| GET | `/payroll-runs/{runId}/summary` | `PaymentSummaryResponse` | Aggregated: total, completed, failed, pending, totalAmount, completedAmount, mpesa count, bank count. |
| GET | `/` | `Page<PaymentTransactionResponse>` | Paginated list of all transactions for this tenant. |

**`PaymentSummaryResponse` fields:**
```
total, completed, failed, pending (includes SUBMITTED + PROCESSING)
mpesa, bank
totalAmount, completedAmount
```

**`PaymentTransactionResponse` fields:**
```
id, payrollRunId, paySlipId, employeeId, employeeName
paymentMethod, phoneNumber, amount, currency, status
externalReference, providerReceipt, errorMessage
submittedAt, completedAt, retryCount
```

---

## 2. Existing Frontend Pages — Current State and Bugs

Three pages exist under `/admin/payroll/`. All three have bugs that must be fixed before or during the redesign pass.

### 2a. List page — `/admin/payroll/page.tsx`

**What works:**
- Paginated table of payroll runs
- Status badges with correct styling
- "Run Payroll" button navigating to `/admin/payroll/new`
- Sort by `createdAt,desc`

**Bugs requiring fixes:**

| Bug | Severity | Detail |
|---|---|---|
| Wrong type: `BIWEEKLY` | Blocking | Frontend enum has `MONTHLY \| WEEKLY \| BIWEEKLY`. Backend enum is `MONTHLY \| WEEKLY \| DAILY`. Bi-weekly doesn't exist in backend. DAILY does exist and isn't in the frontend. The `BIWEEKLY` option in the create form will send a value the backend doesn't accept. |
| Phantom status `INITIATED` | Correctness | Backend has no `INITIATED` status. Backend status set is `DRAFT, CALCULATING, CALCULATED, APPROVED, PROCESSING, COMPLETED, FAILED, CANCELLED`. `INITIATED` was an early design term. |
| Phantom status `DISBURSED` | Correctness | Backend has no `DISBURSED` status. The terminal successful state is `COMPLETED`. The badge code handles `DISBURSED` but this status will never arrive from the API. |
| Missing status `COMPLETED` | Blocking | `statusBadgeClass()` has no case for `COMPLETED` — TypeScript switch falls through to undefined. Any COMPLETED run shows no badge. Must be added as the primary success state. |
| Missing status `PROCESSING` | Missing | No case for `PROCESSING`. Currently unreachable but the state exists and will be used when the disbursement-in-flight indicator is added. |
| Wrong field: `totalDeductions` | Data | `PayrollRunResponse` has no `totalDeductions` field. The field doesn't exist. Frontend renders "—" for all rows. |
| Wrong field: `initiatedAt` | Data | `PayrollRunResponse` has no `initiatedAt`. The correct field is `createdAt`. The table renders the `createdAt` column correctly, so this is only a type mismatch. |
| Wrong route: `/payroll/{run.id}` | Broken nav | "View" link points to `/payroll/${run.id}` not `/admin/payroll/${run.id}`. The correct route group is `(admin)/admin/payroll/[runId]`. Navigation is broken. |

### 2b. Create page — `/admin/payroll/new/page.tsx`

**What works:**
- Period selection (month + year dropdowns)
- API call to `POST /api/v1/payroll/runs`
- Toast + redirect on success

**Bugs:**

| Bug | Severity | Detail |
|---|---|---|
| `BIWEEKLY` option | Blocking | Same as above — send BIWEEKLY → backend rejects or stores unknown value. Remove this option. The correct third option is `DAILY` (for casual/daily-rated payroll). |
| Redirect broken | Navigation | Redirects to `/payroll/${data.id}` — should be `/admin/payroll/${data.id}`. |
| Missing payFrequency default | UX | Backend `RunPayrollRequest.payFrequency` is optional with no documented default. If omitted, the entity uses `PayFrequency` as stored. The form should send MONTHLY explicitly when selected. |

### 2c. Detail page — `/admin/payroll/[runId]/page.tsx`

**What works:**
- Run metadata fetch with polling (5s interval while CALCULATING)
- Summary cards: totalGross, totalNet, totalDeductions (broken), employeeCount
- Payslip table for the run
- Approve modal (CALCULATED state only)

**Bugs:**

| Bug | Severity | Detail |
|---|---|---|
| `BIWEEKLY` in PayFrequency type | Type mismatch | Same as above |
| `INITIATED`, `DISBURSED` phantom statuses | Correctness | Same as above |
| `COMPLETED` status missing from badge map | Blocking | No badge for COMPLETED — approved runs that finish disbursement show no status indicator. |
| `totalDeductions` doesn't exist | Data | `PayrollRunResponse` has no such field. The summary card always shows "—". |
| `initiatedAt` doesn't exist | Type | Field referenced in interface but not in API response. |
| Payslip field mismatches | Broken data | `PaySlipSummary.grossSalary` should be `grossPay`. `PaySlipSummary.netSalary` should be `netPay`. These will always be 0/undefined from the API. |
| Payslips endpoint returns `List<>` not `Page<>` | API contract | `GET /runs/{id}/payslips` returns `List<PaySlipResponse>` (not paginated). The frontend queries it as `Page<PaySlipSummary>` with `.content`. This will break at runtime — the response is a plain array, not a Spring Page. |
| Polling on wrong statuses | UX | Polls when status is `INITIATED` (doesn't exist) or `CALCULATING`. Should poll when status is `CALCULATING` only (via `DRAFT` while backend is async). |
| No "Disburse" action | Missing | No button to trigger `POST /api/v1/payments/payroll-runs/{id}/disburse` after approval. |
| No disbursement summary | Missing | No payment summary panel showing paid/failed/pending counts. |
| No retry failed action | Missing | No "Retry Failed Payments" button. |
| No COMPLETED partial-failure treatment | Missing | COMPLETED runs with payment failures are indistinguishable from clean COMPLETED runs. |

---

## 3. State Machine in UI Terms

```
DRAFT ──[calculate]──► CALCULATING ──► CALCULATED ──[approve]──► APPROVED
                                                                      │
                                                                  [disburse]
                                                                      │
                                                              integration-hub
                                                           processes payments
                                                                      │
                                                         PaymentsCompletedEvent
                                                                      │
                                                                  COMPLETED
                                                                  (clean or
                                                                with failures)
                         FAILED ◄──(calculation or disbursement error)
                        CANCELLED ◄──(admin or HR_MANAGER action from non-COMPLETED)
```

**State → available actions (UI):**

| State | UI actions | Visible to |
|---|---|---|
| DRAFT | Calculate (button) | ADMIN, HR_MANAGER, PAYROLL_OFFICER |
| CALCULATING | None (show spinner/poll) | ADMIN, HR_MANAGER, PAYROLL_OFFICER, HR |
| CALCULATED | Approve (modal confirm) | ADMIN, HR_MANAGER only |
| APPROVED | Disburse (button → 202 async) | ADMIN, HR_MANAGER |
| PROCESSING | None (reserved, currently unreachable) | — |
| COMPLETED (clean) | View payslips only | All HR roles, EMPLOYEE (own) |
| COMPLETED (with failures) | View payslips + "Retry Failed" | ADMIN, HR_MANAGER |
| FAILED | No recovery action yet | ADMIN, HR_MANAGER |
| CANCELLED | No actions | All HR roles |

**COMPLETED with partial failures — must be first-class, not an edge case:**

- A run that paid 95% of employees and failed 3% is not complete from the tenant's perspective
- KRA filings and accounting reconciliation require knowing the paid vs. failed split
- COMPLETED + failures must be visually distinct from COMPLETED + clean
- Visual treatment: amber/orange "Completed with failures" instead of green "Completed"
- The run detail page must surface a prominent "X of Y paid" banner when `failed > 0`
- "Retry Failed Payments" must be visible on runs with failures — not buried in `/admin/payments`
- Reporting must be able to filter "fully successful" runs from "completed with failures"
- Data for this comes from `GET /api/v1/payments/payroll-runs/{id}/summary` (countFailed, total)

---

## 4. What UI Surfaces Are Needed

### 4a. Already scaffolded (need correctness fixes before shipping)
- **Payroll runs list** — fix status enum, field names, navigation links
- **Create payroll run** — fix BIWEEKLY → DAILY, fix redirect
- **Run detail + payslip table** — fix field names, fix payslips endpoint contract, add COMPLETED badge, add disburse/retry buttons

### 4b. Missing — must be built before payroll is usable

**Individual payslip detail page** (`/admin/payroll/[runId]/payslips/[payslipId]`)
- Full payslip breakdown: all earnings, all deductions (PAYE, NSSF, SHIF, Housing Levy, HELB, NITA)
- Relief amounts (personal relief, insurance relief)
- Payment status (mpesaReceipt if paid, pending if not)
- Template reference: `template/smarthr-html/payslip.html`

**Payment summary panel** (embedded in run detail)
- Shows counts: total, paid, failed, pending
- Shows amounts: totalAmount, completedAmount
- Shows channel split: M-Pesa vs bank
- "Disburse All" button (triggers POST /api/v1/payments/payroll-runs/{id}/disburse)
- "Retry Failed" button (visible when failed > 0, triggers POST /api/v1/payments/payroll-runs/{id}/retry-failed)
- Template reference: no direct SmartHR analogue — design from AndikishaHR brand patterns

**Employee payslip history** (`/admin/employees/[employeeId]/payslips` or linked from employee detail)
- Paginated list of payslips for a specific employee
- Uses `GET /api/v1/payroll/employees/{employeeId}/payslips`
- Already accessible to EMPLOYEE role on the `/my/` side — admin-side view needed

### 4c. Not yet building (backlogged or product decisions pending)

- Payroll calendar
- Dry-run cost intelligence / projections
- Salary grade structure management
- Allowances and deductions library
- KRA P10 filing (compliance-service, not payroll-service)
- Payslip PDF download

---

## 5. Product Questions Still Open

**Q1 — Disburse is a separate step from approve. Is this intentional for the MVP?**
The current backend requires: CALCULATED → (approve) → APPROVED → (disburse) → COMPLETED. The approve button already exists. A separate "Disburse" button must be added. Is there a business reason to keep approve and disburse as two separate admin actions, or should approval auto-trigger disbursement?

Recommendation: Keep separate. Approval is a financial control gate (HR_MANAGER or ADMIN). Disbursement is an operational trigger that runs async and can fail. They serve different purposes and are performed by potentially different people.

**Q2 — What happens when a payroll run FAILS (calculation error, not payment failure)?**
The backend has a FAILED state from calculation errors. There is no recovery path defined. Can a FAILED run be restarted (new run for same period)? The backend currently allows creating multiple runs per period — is that intentional?

**Q3 — DAILY payroll frequency: what does the period field represent?**
`RunPayrollRequest.period` is validated as `YYYY-MM`. For DAILY payroll, a month-level period doesn't match the intent of daily-rated casual workers. This needs a design decision before DAILY is surfaced in the UI.

**Q4 — Payroll run pagination on payslips is currently unbounded.**
`GET /runs/{id}/payslips` returns `List<PaySlipResponse>` — no pagination. At 100+ employees this becomes a large payload. Consider: should the payslip table in run detail paginate client-side from this list, or should a pagination parameter be added to the endpoint?

**Q5 — What does the EMPLOYEE see on their dashboard payslips?**
The employee-facing payslip access (`GET /payroll/employees/{employeeId}/payslips`) is already wired in the employee dashboard. Does the admin payroll detail page link to individual employee payslip detail, or is that a separate employee-facing route?

---

## 6. Template References (Policy-Compliant)

Per `docs/design/system/template-usage.md`: visual structure reference only. No Bootstrap classes, no template imports, no SCSS.

| UI Surface | SmartHR Reference | Notes |
|---|---|---|
| Payroll runs list | `template/smarthr-html/payroll.html` | Table layout, status badge placement |
| Run detail + summary cards | `template/smarthr-html/payroll-dashboard.html` | KPI card grid, totals breakdown |
| Individual payslip | `template/smarthr-html/payslip.html` | Two-column earnings/deductions breakdown layout |
| Payslip report / history | `template/smarthr-html/payslip-report.html` | Table with filter bar |
| Payment summary | `template/smarthr-html/payment-report.html` | Payment transaction table |

Screens not in SmartHR (design from scratch using AndikishaHR brand patterns):
- Disbursement summary panel with partial-failure treatment
- Retry failed payments action and confirmation

---

## 7. Scope for the Build Phase

Before writing any code, this audit needs to be reviewed. The work can then be organised into two passes:

**Pass 1 — Fix existing pages (correctness, no new surfaces):**
1. Fix status enums in all three pages: remove INITIATED, DISBURSED, BIWEEKLY; add COMPLETED (green), COMPLETED_WITH_FAILURES (amber), PROCESSING (gray)
2. Fix field names: `grossSalary → grossPay`, `netSalary → netPay`, remove `totalDeductions` and `initiatedAt` from interface
3. Fix navigation links: `/payroll/` → `/admin/payroll/`
4. Fix payslips endpoint consumption: it returns `List<>` not `Page<>`, remove `pageable` params
5. Fix `PayFrequency` enum: MONTHLY, WEEKLY, DAILY (not BIWEEKLY)
6. Wire COMPLETED badge (green) and add the COMPLETED_WITH_FAILURES visual variant
7. Poll only on `CALCULATING` status
8. Add "Disburse" button for APPROVED runs

**Pass 2 — Build missing surfaces:**
1. Payment summary panel (embedded in run detail, above payslip table)
2. Individual payslip detail page
3. Retry failed payments action with confirmation

Stop here. Payroll UI design begins after audit review.
