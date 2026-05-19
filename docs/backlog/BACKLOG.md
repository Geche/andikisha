# AndikishaHR Engineering Backlog

Items that were deferred during development with clear rationale. Ordered roughly by priority within each section.

---

## Platform

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
