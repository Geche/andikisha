# AndikishaHR Engineering Backlog

Items that were deferred during development with clear rationale. Ordered roughly by priority within each section.

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
| `leave-service` | `GET /api/v1/leave/employees/{employeeId}/balances` | `#employeeId.equals(authentication.name)` | Not yet fixed |
| `payroll-service` | `GET /api/v1/payroll/employees/{employeeId}/payslips` (service layer) | `authentication.getName()` compared to employeeId | Fixed (credentials field in auth token) |
| `payroll-service` | `GET /api/v1/payroll/payslips/{id}` (service layer) | `authentication.getName()` compared to employeeId | Fixed (same credentials fix) |

**All other services** with employee-scoped endpoints should be audited: `time-attendance-service`, `document-service`, `compliance-service`.

**Correct fix:**  
Either:  
(a) `TrustedHeaderAuthFilter` stores `X-Employee-ID` in `authentication.credentials` consistently across all services (done for payroll-service), and all ownership checks use credentials; or  
(b) A proper B1 UserContext is introduced that carries `(userId, employeeId, tenantId, roles)` — the right long-term solution.

**Why deferred:**  
The piecemeal fix pattern (service-by-service) creates inconsistency. B1 should introduce a shared `TrustedHeaderAuthFilter` in `andikisha-common` with a proper `GatewayAuthentication` token type that carries both userId and employeeId. Then all services share the fix.

---

## API Design

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

### COMPLIANCE-BACKLOG-001 — Move statutory rate constants from code to compliance-service rate tables

**Raised:** 2026-05-15  
**Context:** PAYE bands, NSSF tier limits, SHIF rate, Housing Levy rate, NITA levy, and personal relief are all hardcoded as `private static final` constants in `KenyanTaxCalculator`. KRA amends these annually (Finance Act). Updating them requires a code deployment.

**Required:**  
Move statutory rates to a `statutory_rates` table in compliance-service, versioned by effective date. `KenyanTaxCalculator` fetches the applicable rate set for the payroll period via gRPC. This allows rate changes to be applied by data migration rather than code deployment, and supports historical re-calculation using the rates that were in effect at the time.

**Not blocking current work.** Statutory rates for FY 2024/2025 are correct. Revisit before the next Finance Act (typically June/July each year).
