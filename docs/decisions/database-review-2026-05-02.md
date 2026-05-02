# AndikishaHR Database and Business Logic Review
**Date:** 2026-05-02
**Reviewer:** Claude (database-review task)
**Scope:** payroll-service, employee-service, leave-service, audit-service migrations and entities; KenyanTaxCalculator; multi-tenant query safety; cascade risks; optimistic locking.

---

## Section 1 — Flyway Migration Quality

### Migrations reviewed

| File | Service |
|------|---------|
| `V1__create_payroll_runs.sql` | payroll-service |
| `V2__create_pay_slips.sql` | payroll-service |
| `V1__create_audit_entries.sql` | audit-service |

No migration files were found for employee-service or leave-service under any filename variant tried. The services start with `ddl-auto: validate`, so migrations must exist and be running — they are simply not at any of the standard naming paths (`V1__create_employees.sql`, `V1__create_employee_tables.sql`, `V1__create_employee_schema.sql`, `V1__initial_schema.sql`). This is flagged as an investigation item below.

---

### Finding 1.1 — CRITICAL: `helb` column in V2 is nullable; entity declares it NOT NULL

**File:** `services/payroll-service/src/main/resources/db/migration/V2__create_pay_slips.sql`, line 22
**Entity:** `services/payroll-service/src/main/java/com/andikisha/payroll/domain/model/PaySlip.java`, line 74–75

Schema definition:
```sql
helb  NUMERIC(15,2) DEFAULT 0,
```
No `NOT NULL` constraint. The entity declares:
```java
@Column(nullable = false, precision = 15, scale = 2)
private BigDecimal helb;
```

Because Hibernate derives the DDL constraint from the entity annotation when `ddl-auto: validate` is in use, **this mismatch will cause a schema validation failure at startup** on any fresh environment that runs V2 migration and then boots the application. The service will not start.

In a live environment where the DB was created before `validate` mode, inserts still work because the DB column accepts NULL. But if the JPA layer produces a `NULL` for `helb` (which it cannot since the builder always passes `BigDecimal.ZERO`), the DB would accept it and the entity would then fail to read it back as a non-null field.

No V3 migration was found that converts this column to `NOT NULL`. The review prompt referenced a "V3 migration making helb NOT NULL" — that migration does not exist in the repository.

**Fix:** Add a migration that alters the column:
```sql
-- V3__make_helb_not_null.sql
ALTER TABLE pay_slips ALTER COLUMN helb SET NOT NULL;
ALTER TABLE pay_slips ALTER COLUMN helb SET DEFAULT 0;
```

---

### Finding 1.2 — MEDIUM: `total_gross` and other PayrollRun aggregate columns are nullable in schema but Hibernate will write them

**File:** `services/payroll-service/src/main/resources/db/migration/V1__create_payroll_runs.sql`, lines 8–16

Columns `total_gross`, `total_basic`, `total_allowances`, `total_paye`, `total_nssf`, `total_shif`, `total_housing_levy`, `total_other_deductions`, `total_net` are declared `NUMERIC(15,2) DEFAULT 0` with no `NOT NULL`. The entity (`PayrollRun.java`) maps them without `nullable = false`.

This is acceptable by design — these columns are populated only after `finishCalculation()` is called, and a DRAFT run legitimately has them as zero/null during its lifecycle. The `DEFAULT 0` handles both cases. No fix required for the columns themselves.

However, the entity fields having no `nullable = false` annotation means Hibernate's validate mode will not enforce that the DB columns are non-null. If the DB column is later altered to NOT NULL, the entity must be updated in sync. Document this coupling.

---

### Finding 1.3 — MEDIUM: No migration V3+ found for payroll-service; no index migration found for any service

No `V3__*.sql` file exists for payroll-service. The review prompt assumed a migration adding `helb` as NOT NULL exists — it does not. The version sequence for payroll-service is V1, V2, and then nothing. If the helb column was intended to be made NOT NULL in a V3 that was planned but not written, the entity has already been updated ahead of the migration, causing the validate-mode startup failure described in 1.1.

No dedicated index migration files were found in any service (the `find` search for `V*__*index*` / `V*__*Index*` returns nothing). Indexes for payroll-service are defined inline in V1 and V2, which is acceptable, but no secondary index migration exists for any other service.

---

### Finding 1.4 — LOW: `pay_slips.payroll_run_id` uses a same-service FK with `ON DELETE CASCADE`

**File:** `V2__create_pay_slips.sql`, line 4
```sql
payroll_run_id UUID NOT NULL REFERENCES payroll_runs (id) ON DELETE CASCADE,
```

This FK is within the same service database, so it does not violate the no-cross-service-FK rule. However, `ON DELETE CASCADE` means deleting a `PayrollRun` row will silently delete all associated `PaySlip` rows. PaySlips are financial audit records. If any operational code path can reach `DELETE FROM payroll_runs`, or if a developer runs a cleanup query, every payslip for that run is gone.

The entity also has `CascadeType.ALL` on the `@OneToMany` relationship in `PayrollRun.java` (line 87). This is covered in detail in Section 7.

**Fix:** Remove `ON DELETE CASCADE` from the FK definition. Deletion of a payroll run should be blocked at the application layer by the status machine (only DRAFT/FAILED/CANCELLED can be cancelled; COMPLETED runs are immutable). The DB-level cascade is a silent bypass of that protection.

---

### Finding 1.5 — LOW: `audit_entries` table has no `updated_at` and no `version` column; no `created_at`

**File:** `V1__create_audit_entries.sql`

The table has `recorded_at` but no `created_at`, `updated_at`, or `version`. The entity does not extend `BaseEntity` — it manages its own `id`, `tenantId`, and `recordedAt` directly (line 17–18 of `AuditEntry.java`).

This is intentional: audit entries are immutable by design (no update path, no setters). `BaseEntity` adds `@Version` and `@LastModifiedDate` which would be meaningless and confusing on an append-only table. The decision not to extend `BaseEntity` is correct for an audit log.

The absence of `updated_at` and `version` is **not a defect**. Document this explicitly so reviewers do not flag it in future audits.

---

### Finding 1.6 — LOW: Missing `IF NOT EXISTS` / `IF EXISTS` guards on all DDL

None of the three migration files use `IF NOT EXISTS` on `CREATE TABLE` or `CREATE INDEX`. Flyway's checksumming prevents re-running a migration by default, so this is not a correctness issue in normal operation. It becomes a risk only if a DBA manually runs the SQL against a partial state. This is standard Flyway practice — low priority, no action required unless a decision is made to support manual partial applies.

---

## Section 2 — JPA Entity vs Schema Consistency

### 2a — PaySlip entity vs V2__create_pay_slips.sql

| Entity field | Entity annotation | Schema column | Match? |
|---|---|---|---|
| `payrollRun` | `nullable = false` (via `@JoinColumn`) | `payroll_run_id NOT NULL` | Yes |
| `employeeId` | `nullable = false` | `employee_id NOT NULL` | Yes |
| `employeeNumber` | `nullable = false, length = 20` | `VARCHAR(20) NOT NULL` | Yes |
| `employeeName` | `nullable = false, length = 200` | `VARCHAR(200) NOT NULL` | Yes |
| `basicPay` | `nullable = false, precision=15, scale=2` | `NUMERIC(15,2) NOT NULL` | Yes |
| `housingAllowance` | `nullable = false, precision=15, scale=2` | `NUMERIC(15,2) NOT NULL DEFAULT 0` | Yes |
| `transportAllowance` | `nullable = false, precision=15, scale=2` | `NUMERIC(15,2) NOT NULL DEFAULT 0` | Yes |
| `medicalAllowance` | `nullable = false, precision=15, scale=2` | `NUMERIC(15,2) NOT NULL DEFAULT 0` | Yes |
| `otherAllowances` | `nullable = false, precision=15, scale=2` | `NUMERIC(15,2) NOT NULL DEFAULT 0` | Yes |
| `totalAllowances` | `nullable = false, precision=15, scale=2` | `NUMERIC(15,2) NOT NULL DEFAULT 0` | Yes |
| `grossPay` | `nullable = false, precision=15, scale=2` | `NUMERIC(15,2) NOT NULL` | Yes |
| `paye` | `nullable = false, precision=15, scale=2` | `NUMERIC(15,2) NOT NULL` | Yes |
| `nssf` | `@Column(name="nssf_employee", nullable=false, precision=15, scale=2)` | `nssf_employee NUMERIC(15,2) NOT NULL` | Yes |
| `nssfEmployer` | `@Column(name="nssf_employer", nullable=false, precision=15, scale=2)` | `nssf_employer NUMERIC(15,2) NOT NULL` | Yes |
| `shif` | `nullable = false, precision=15, scale=2` | `NUMERIC(15,2) NOT NULL` | Yes |
| `housingLevy` | `@Column(name="housing_levy_employee", nullable=false, precision=15, scale=2)` | `housing_levy_employee NUMERIC(15,2) NOT NULL` | Yes |
| `housingLevyEmployer` | `@Column(name="housing_levy_employer", nullable=false, precision=15, scale=2)` | `housing_levy_employer NUMERIC(15,2) NOT NULL` | Yes |
| `helb` | **`nullable = false, precision=15, scale=2`** | **`NUMERIC(15,2) DEFAULT 0` — no NOT NULL** | **MISMATCH — see Finding 1.1** |
| `otherDeductions` | `nullable = false, precision=15, scale=2` | `NUMERIC(15,2) NOT NULL DEFAULT 0` | Yes |
| `personalRelief` | `nullable = false, precision=15, scale=2` | `NUMERIC(15,2) NOT NULL` | Yes |
| `insuranceRelief` | `nullable = false, precision=15, scale=2` | `NUMERIC(15,2) NOT NULL` | Yes |
| `totalDeductions` | `nullable = false, precision=15, scale=2` | `NUMERIC(15,2) NOT NULL` | Yes |
| `netPay` | `nullable = false, precision=15, scale=2` | `NUMERIC(15,2) NOT NULL` | Yes |
| `currency` | `nullable = false, length = 3` | `VARCHAR(3) NOT NULL DEFAULT 'KES'` | Yes |
| `paymentStatus` | `nullable = false, length = 20` | `VARCHAR(20) NOT NULL DEFAULT 'PENDING'` | Yes |
| `mpesaReceipt` | `length = 50` | `VARCHAR(50)` (nullable) | Yes |
| `paymentPhone` | `length = 20` | `VARCHAR(20)` (nullable) | Yes |
| `version` (BaseEntity) | `@Version` | `BIGINT NOT NULL DEFAULT 0` | Yes |

**Unique constraint:** Entity has no `@UniqueConstraint` on `PaySlip`. Schema has `UNIQUE(payroll_run_id, employee_id)` added via `ALTER TABLE`. This unenforced uniqueness at the entity level means Hibernate will not produce the constraint in validate mode, but the constraint will still be in the DB. No correctness issue — the constraint is correct and necessary.

**Summary:** One mismatch — `helb` nullability. All other columns match.

---

### 2b — PayrollRun entity vs V1__create_payroll_runs.sql

All columns match. `@UniqueConstraint(columnNames = {"tenant_id", "period", "pay_frequency"})` on the entity matches `UNIQUE (tenant_id, period, pay_frequency)` in the schema. `@Version` maps to `BIGINT NOT NULL DEFAULT 0`. No issues.

---

### 2c — Employee entity

No migration file was found. The entity references tables `employees`, `departments`, `positions`, `employee_history` via embedded `SalaryStructure` and `@ManyToOne` relationships. The `SalaryStructure` embeddable maps five `Money` value objects, each producing two columns (`amount` + `currency`), for a total of 10 salary columns. Flyway validate mode at startup would catch any mismatch — but without reading the migration, the column name correctness of the 10 salary columns cannot be confirmed from this review. This is an investigation gap.

**Action required:** Locate the employee-service migration files and include them in the next review pass.

---

### 2d — LeaveBalance entity

No migration file was found. The entity maps to `leave_balances` with columns: `id`, `tenant_id`, `employee_id`, `leave_type`, `year`, `accrued`, `used`, `carried_over`, `frozen`, plus BaseEntity fields. `accrued`, `used`, `carried_over` are unmapped — no `@Column(precision=..., scale=...)` annotation is present on these `BigDecimal` fields. This means Hibernate will use its default mapping, which for `BigDecimal` is `NUMERIC(19,2)` (Hibernate 6 default) rather than the project standard `NUMERIC(15,2)`. This may or may not match the actual migration schema.

**Finding 2d.1 — MEDIUM:** `LeaveBalance.accrued`, `used`, `carriedOver` fields lack `@Column(precision=15, scale=2)`. Without this annotation, Hibernate's validate mode will check the DB column type against Hibernate's default mapping, not the project standard. If the schema uses `NUMERIC(10,4)` or similar for fractional leave days, validate will fail. The `@Column` annotation should be explicit on all BigDecimal fields per project standards.

---

### 2e — AuditEntry entity vs V1__create_audit_entries.sql

| Entity field | Entity annotation | Schema column | Match? |
|---|---|---|---|
| `id` | `@GeneratedValue(UUID)` | `UUID PRIMARY KEY DEFAULT gen_random_uuid()` | Yes |
| `tenantId` | `nullable=false, length=50` | `VARCHAR(50) NOT NULL` | Yes |
| `domain` | `nullable=false, length=20` (EnumType.STRING) | `VARCHAR(20) NOT NULL` | Yes |
| `action` | `nullable=false, length=20` | `VARCHAR(20) NOT NULL` | Yes |
| `resourceType` | `nullable=false, length=50` | `VARCHAR(50) NOT NULL` | Yes |
| `resourceId` | `length=100` | `VARCHAR(100)` (nullable) | Yes |
| `actorId` | `length=100` | `VARCHAR(100)` (nullable) | Yes |
| `actorName` | `length=200` | `VARCHAR(200)` (nullable) | Yes |
| `actorRole` | `length=30` | `VARCHAR(30)` (nullable) | Yes |
| `description` | `length=500` | `VARCHAR(500)` (nullable) | Yes |
| `eventType` | `nullable=false, length=100` | `VARCHAR(100) NOT NULL` | Yes |
| `eventId` | `length=100` | `VARCHAR(100)` (nullable) | Yes |
| `eventData` | `columnDefinition="TEXT"` | `TEXT` (nullable) | Yes |
| `ipAddress` | `length=45` | `VARCHAR(45)` (nullable) | Yes |
| `occurredAt` | `nullable=false` (Instant → `TIMESTAMP WITH TIME ZONE`) | `TIMESTAMP WITH TIME ZONE NOT NULL` | Yes |
| `recordedAt` | `nullable=false` (Instant → `TIMESTAMP WITH TIME ZONE`) | `TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()` | Yes |

No `version`, `updated_at` columns in the schema; entity does not extend BaseEntity. Intentional — see Finding 1.5.

**Finding 2e.1 — LOW:** The `AuditEntry` entity does not extend `BaseEntity` and therefore has no `@Version` field. This is correct for an immutable audit log. However, Hibernate will issue an `UPDATE` if the entity were ever modified (which it cannot be — there are no setters). Annotate the entity with a comment or `@Immutable` (Hibernate annotation) to make the read-only intent explicit and prevent accidental dirty-tracking writes.

---

## Section 3 — Kenyan Payroll Calculation Correctness

**File reviewed:** `services/payroll-service/src/main/java/com/andikisha/payroll/application/service/KenyanTaxCalculator.java`

### 3.1 — PAYE Band Limits

| Band | Code constant | CLAUDE.md spec | Correct? |
|---|---|---|---|
| Band 1 upper | `BAND_1_LIMIT = 24,000` | `0–24,000 at 10%` | Yes |
| Band 2 upper | `BAND_2_LIMIT = 32,300` | `24K–32.3K at 25%` | Yes |
| Band 3 upper | `BAND_3_LIMIT = 500,000` | `32.3K–500K at 30%` | Yes |
| Band 4 upper | `BAND_4_LIMIT = 800,000` | `500K–800K at 32.5%` | Yes |
| Band 5 | above 800,000 at 35% | `800K+ at 35%` | Yes |

**Finding 3.1.1 — LOW (comment error only):** In `calculateGraduatedTax()`, Band 2 comment reads "24,001 – 32,333 at 25%" but the actual constant is `BAND_2_LIMIT = 32,300`. The constant is correct (32,300 matches KRA). The comment has a typo: 32,333 is wrong. Fix the comment, not the constant.

### 3.2 — NSSF Calculation

Code:
```java
BigDecimal nssfTier1 = basicPay.min(NSSF_TIER_1_LIMIT).multiply(NSSF_RATE);
// Tier 2: earnings above 7,000 up to (36,000 - 7,000) = 29,000 wide band
BigDecimal tier2Earnings = basicPay.subtract(NSSF_TIER_1_LIMIT)
        .min(NSSF_TIER_2_LIMIT.subtract(NSSF_TIER_1_LIMIT));
```

CLAUDE.md spec: "6% of gross, Tier I up to KES 7,000, Tier II up to KES 36,000."

The code applies NSSF to `basicPay`, not gross, and the comment at line 30 explicitly states: "Applied to pensionable pay (basic salary), not gross including allowances." This is the correct interpretation of the NSSF Act 2013 — NSSF is assessed on pensionable pay (basic salary), not total gross. The CLAUDE.md wording "6% of gross" is imprecise and conflicts with the correct implementation. The code is right; the spec text in CLAUDE.md should be corrected to "6% of basic/pensionable pay."

**Calculation verification for basicPay = 120,000 (max tier applies):**
- Tier 1: min(120000, 7000) × 0.06 = 420.00 ✓
- Tier 2: (120000 - 7000) = 113,000; min(113000, 29000) = 29,000 × 0.06 = 1,740.00 ✓
- Total = 2,160.00 ✓

### 3.3 — SHIF Calculation

Code: `shif = grossPay.multiply(SHIF_RATE)` where `SHIF_RATE = 0.0275`.
For gross = 120,000: 120,000 × 0.0275 = 3,300.00 ✓

### 3.4 — Housing Levy

Code: `housingLevyEmployee = grossPay.multiply(HOUSING_LEVY_RATE)` where `HOUSING_LEVY_RATE = 0.015`.
Employer matches employee. For gross = 120,000: 1,800.00 ✓

### 3.5 — PAYE Taxable Income

Code (line 88–91):
```java
// KRA does not permit the Affordable Housing Levy (AHL) employee contribution
// to reduce PAYE taxable income (Finance Act 2023 / KRA guidance).
BigDecimal taxableIncome = grossPay.subtract(nssfEmployee).max(BigDecimal.ZERO);
```

For gross = 120,000, nssfEmployee = 2,160: taxable = **117,840.00**.

**Finding 3.5.1 — CRITICAL (test case in review prompt is wrong):** The review prompt's John Kamau test case states:
> taxable income = 120,000 - 2,160 - 1,800 = 116,040.00

This is incorrect. The Affordable Housing Levy is NOT deductible from PAYE taxable income per Finance Act 2023 and KRA guidance dated 2023. The code is correct. The test case in the review prompt uses an outdated assumption (pre-Finance Act 2023 treatment). Any test asserting `taxableIncome = 116,040` for this input would be wrong and should not be added to the test suite.

### 3.6 — PAYE Graduated Tax on 117,840

Manual calculation:
- Band 1: 24,000 × 0.10 = 2,400.00
- Band 2: 8,300 × 0.25 = 2,075.00 (band width = 32,300 - 24,000 = 8,300)
- Band 3: remaining after Band 2 = 117,840 - 24,000 - 8,300 = 85,540; min(85,540, 467,700) × 0.30 = 25,662.00
- Bands 4 and 5: zero (117,840 < 500,000)
- `payeBeforeRelief` = 2,400 + 2,075 + 25,662 = **30,137.00**

### 3.7 — Insurance Relief and Net PAYE

SHIF = 3,300.00; insurance relief = 3,300 × 0.15 = 495.00 (capped at 5,000, so 495.00)
Total relief = 2,400 + 495 = 2,895.00
`netPaye` = 30,137 - 2,895 = **27,242.00**

The review prompt says netPaye = 27,195.05. This would only be correct if taxable income were 116,040 and insurance relief were computed from a different SHIF base. The prompt's figure is wrong.

### 3.8 — Net Pay (John Kamau, gross = 120,000, single-arg form)

- NSSF employee = 2,160.00
- Housing levy employee = 1,800.00
- SHIF = 3,300.00
- PAYE = 27,242.00
- totalDeductions = 27,242 + 2,160 + 3,300 + 1,800 = 34,502.00
- **netPay = 120,000 - 34,502 = 85,498.00**

The review prompt says net = 85,544.95. This is also wrong (it was derived from the incorrect taxable income of 116,040).

**Accounting identity check (gross = net + totalDeductions):**
120,000 = 85,498 + 34,502 ✓ The identity holds.

### 3.9 — NSSF Tier 2 Cap Verification

`NSSF_TIER_2_LIMIT = 36,000`. Band width = 36,000 - 7,000 = 29,000.
Max contribution = 420 + (29,000 × 0.06) = 420 + 1,740 = 2,160. ✓

### 3.10 — Summary of Calculator Findings

The KenyanTaxCalculator is **correct** for all five tax rules. The only defect is a comment typo (Band 2 upper: "32,333" should be "32,300"). The review prompt's test values for John Kamau are arithmetically inconsistent with current KRA rules and should not be used to drive test assertions.

---

## Section 4 — PayrollService Calculation Flow

**File reviewed:** `services/payroll-service/src/main/java/com/andikisha/payroll/application/service/PayrollService.java`

### 4.1 — CRITICAL: No accounting identity check on PaySlip

**Lines 228–231 of PayrollService.java:**
```java
BigDecimal totalDeductions = deductions.totalDeductions().add(unpaidLeaveDeduction);
BigDecimal netPay = deductions.netPay().subtract(unpaidLeaveDeduction).max(BigDecimal.ZERO);
```

The `DeductionResult.totalDeductions()` is computed inside `KenyanTaxCalculator` as:
```java
BigDecimal totalDeductions = netPaye.add(nssfEmployee).add(shif)
        .add(housingLevyEmployee).add(helb);
```

Then `PayrollService` adds `unpaidLeaveDeduction` to `totalDeductions` and subtracts it from `netPay`. So far so good — the identity `gross = net + totalDeductions` holds at the `DeductionResult` level (verified by test `calculate_grossEqualsNetPlusTotalDeductions`).

However, the PaySlip builder sets:
```java
.totalDeductions(totalDeductions)   // deductions.totalDeductions() + unpaidLeaveDeduction
.netPay(netPay)                     // deductions.netPay() - unpaidLeaveDeduction
```

**The identity `grossPay = netPay + totalDeductions` is never asserted before persisting the PaySlip.**

In the happy path, the math is consistent. But there is a `.max(BigDecimal.ZERO)` on `netPay` (line 230). If `unpaidLeaveDeduction > deductions.netPay()`, `netPay` is clamped to 0 while `totalDeductions` is not clamped. In that scenario:
- `netPay = 0` (clamped)
- `totalDeductions = deductions.totalDeductions() + unpaidLeaveDeduction` (not clamped)
- The persisted PaySlip has `netPay + totalDeductions > grossPay`

This will produce a silent arithmetic error in the ledger. For any employee with large unpaid leave days relative to their net pay, the payslip numbers will not balance.

**Fix:** Assert the identity before persisting:
```java
BigDecimal expectedGross = netPay.add(totalDeductions);
if (expectedGross.compareTo(grossPay) != 0) {
    // Clamp totalDeductions to match, or throw and skip this payslip
    log.error("Payslip arithmetic error for employee {}: gross={}, net+deductions={}",
              employee.getId(), grossPay, expectedGross);
    // adjust totalDeductions to = grossPay - netPay
    totalDeductions = grossPay.subtract(netPay);
}
```

---

### 4.2 — MEDIUM: Zero-pay check skips employee silently; no skip reason recorded

**Lines 214–217 of PayrollService.java:**
```java
if (basicPay.compareTo(BigDecimal.ZERO) == 0) {
    log.warn("Employee {} has zero basic pay, skipping", employee.getId());
    continue;
}
```

This skips the employee from the payroll run without recording why. `skipped` counter only counts employees with missing salary structures (line 182). An employee with a salary structure that has `basicSalary = 0` is silently excluded and not counted in the `skipped` warning. The `employeeCount` in the `PayrollRun` will be lower than the actual active employee count with no traceable reason.

Also, the zero check fires after `parseSalary()` — which returns `BigDecimal.ZERO` for null/blank/malformed values. A misconfigured salary structure (e.g., empty string in proto field) would silently skip the employee as if they had zero salary. This is the same silent skip as a genuinely zero salary, making them indistinguishable in logs.

**Fix:** Increment and log the skipped counter separately for zero-pay employees, and include the reason in the payroll run's notes or a separate warnings field.

---

### 4.3 — Confirmed: Payroll run is locked against concurrent modification via `@Version`

`PayrollRun` extends `BaseEntity`, which has `@Version private Long version`. The three-phase calculation flow uses `transactionTemplate.execute()` for both Phase 1 (mark CALCULATING) and Phase 3 (persist payslips). If two concurrent calls attempt to calculate the same run:
- Phase 1 TX: one succeeds, marks CALCULATING; the other's `markCalculating()` throws `BusinessRuleException("Can only start calculating from DRAFT status")` because the first TX changed the status.
- The `@Version` column provides an additional safety net for the `payrollRunRepository.save(run)` call in Phase 3 — if another process modified the run between Phase 1 and Phase 3, Hibernate throws `ObjectOptimisticLockingFailureException`.

`ObjectOptimisticLockingFailureException` is not explicitly caught in `calculatePayroll`. It would propagate as an unchecked exception, get caught by the outer `catch (Exception e)` block at line 272, and cause `persistFailure()` to be called. This is acceptable behaviour — the run will be marked FAILED, which is recoverable. No issue.

---

### 4.4 — Confirmed: `helb` is always set in the PaySlip builder

**Line 250 of PayrollService.java:**
```java
.helb(BigDecimal.ZERO)
```

`helb` is always explicitly set to `BigDecimal.ZERO` in the builder call. Given the `HELB` parameter is not yet passed into `calculatePayroll()`, this is correct. When HELB support is added (the `calculate(grossPay, basicPay, helbDeduction)` form already exists in the calculator), the builder call will need to be updated.

---

### 4.5 — MEDIUM: `findAllActive()` in EmployeeQueryService returns an unbounded list

**File:** `services/employee-service/src/main/java/com/andikisha/employee/application/service/EmployeeQueryService.java`, line 66
```java
return repository.findByTenantIdAndStatus(tenantId, EmploymentStatus.ACTIVE)
        .stream().map(mapper::toDetailResponse).toList();
```

This method is called by `EmployeeGrpcService.listActiveByTenant()`, which is in turn called by `PayrollService.calculatePayroll()` (Phase 2). For a tenant with 5,000+ employees, this loads all employee entities into memory simultaneously. There is no pagination. At scale, this is a JVM heap pressure issue and a slow gRPC call that extends the no-DB-connection window.

The CLAUDE.md rule "Pagination uses Spring Pageable. Never load unbounded result sets" is violated. This is architecturally necessary for batch payroll (you need all employees), but the implementation should use cursor-based streaming or batched page fetching, not `findAll`.

---

## Section 5 — Multi-Tenant Query Safety

All repository methods reviewed for the five key repositories:

### PayrollRunRepository
All methods include `tenantId` parameter or filter by `tenantId` in JPQL. `existsByTenantIdAndStatusIn` includes tenantId. **Safe.**

### PaySlipRepository
All four methods filter by `tenantId`. **Safe.**

### EmployeeRepository
All methods filter by `tenantId`. One potential issue: `findMaxEmployeeNumber(String tenantId)` is parameterised but the JPQL `SELECT MAX(e.employeeNumber)...` uses a `String` max on `VARCHAR` data. For employee numbers with format `EMP-0001`, lexicographic max is the same as numeric max only while the count stays below 10 digits. For very large tenants, this will break (e.g., `EMP-10000` < `EMP-9999` lexicographically). Not a tenant isolation issue, but a correctness bug.

### LeaveBalanceRepository
All methods filter by `tenantId`. `findActiveBalancesForYear` uses JPQL with `lb.tenantId = :tenantId`. **Safe.**

### LeaveRequestRepository
All methods include `tenantId`. **Safe.**

### AuditEntryRepository
All methods include `tenantId`. `countByTenantId` includes it. The unbounded `findByTenantIdDomainAndDateRange` returns a `List` — for a high-volume tenant with many audit events in a wide date range, this is an unbounded query. Should return `Page`.

---

## Section 6 — Index Coverage

### payroll-service
**Existing indexes (from V1, V2):**
- `idx_payroll_runs_tenant` ON `payroll_runs(tenant_id)` ✓
- `idx_payroll_runs_tenant_period` ON `payroll_runs(tenant_id, period)` ✓
- `idx_payroll_runs_status` ON `payroll_runs(tenant_id, status)` ✓
- `idx_payslips_run` ON `pay_slips(payroll_run_id)` ✓
- `idx_payslips_tenant` ON `pay_slips(tenant_id)` ✓
- `idx_payslips_employee` ON `pay_slips(tenant_id, employee_id)` ✓
- `idx_payslips_payment` ON `pay_slips(payment_status)` — missing `tenant_id` prefix

**Finding 6.1 — LOW:** `idx_payslips_payment` indexes only `payment_status`. The most likely query pattern for payment processing is filtering by `payment_status = 'PENDING'` AND `tenant_id`, but the index does not include `tenant_id`. A composite `(tenant_id, payment_status)` index would serve both the tenant-filtered count and the multi-tenant payment processor queries. In a multi-tenant DB with many tenants, a `payment_status`-only index leads to scanning all tenants' payslips to find one tenant's PENDING rows.

**Fix:** Add:
```sql
CREATE INDEX idx_payslips_tenant_payment ON pay_slips (tenant_id, payment_status);
DROP INDEX idx_payslips_payment;
```

### audit-service
Six composite indexes covering all main query patterns. **Well-covered.**

### No index migrations found for employee-service or leave-service (migration files not located). Investigation gap.

---

## Section 7 — Cascade and Orphan Removal Risks

### Finding 7.1 — HIGH: `CascadeType.ALL` on PayrollRun → PaySlip relationship

**File:** `services/payroll-service/src/main/java/com/andikisha/payroll/domain/model/PayrollRun.java`, line 87
```java
@OneToMany(mappedBy = "payrollRun", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
private List<PaySlip> paySlips = new ArrayList<>();
```

`CascadeType.ALL` includes `CascadeType.REMOVE`. Combined with the `ON DELETE CASCADE` FK in V2, there are now **two independent delete propagation paths** that will delete all PaySlips when a PayrollRun is deleted:

1. Hibernate `CascadeType.REMOVE` — if `payrollRunRepository.delete(run)` is called, Hibernate will issue `DELETE FROM pay_slips WHERE payroll_run_id = ?` before deleting the run.
2. Database-level `ON DELETE CASCADE` — a raw `DELETE FROM payroll_runs WHERE id = ?` will cascade-delete all pay_slips at the DB level, bypassing Hibernate entirely.

PaySlips are permanent financial records. A `COMPLETED` payroll run's payslips must never be deleted. The `PayrollRun.cancel()` method correctly rejects cancellation of COMPLETED or PROCESSING runs. But `CascadeType.ALL` bypasses this domain guard entirely — calling `payrollRunRepository.delete(run)` from any code path will remove all payslips regardless of run status.

There is no `delete` call in `PayrollService`, so the immediate risk is low. However, this is a latent correctness bomb. Any future admin endpoint, cleanup job, or test teardown that calls `payrollRunRepository.deleteAll()` will silently erase financial records.

**Fix:**
1. Replace `CascadeType.ALL` with `{CascadeType.PERSIST, CascadeType.MERGE}` on the `@OneToMany`.
2. Remove `ON DELETE CASCADE` from the FK in V2 (requires a new migration to drop and recreate the constraint).
3. Deleting a payroll run should go through a soft-delete or an archive path, not a hard delete.

---

### Finding 7.2 — Confirmed safe: No other CascadeType.ALL found on financial entities

No other `CascadeType.ALL` or `orphanRemoval = true` was found on financial entities in the services reviewed. LeaveBalance, LeaveRequest, Employee, AuditEntry — none use cascade delete.

---

## Section 8 — Optimistic Locking

### Entities with `@Version` (from BaseEntity)

All entities extending `BaseEntity` have `@Version private Long version` at line 37 of `BaseEntity.java`. The field is inherited — no per-entity override is needed.

| Entity | Extends BaseEntity | @Version present |
|---|---|---|
| `PayrollRun` | Yes | Yes (inherited) |
| `PaySlip` | Yes | Yes (inherited) |
| `Employee` | Yes | Yes (inherited) |
| `LeaveBalance` | Yes | Yes (inherited) |
| `LeaveRequest` | Yes | Yes (inherited) |
| `Department` | Yes | Yes (inherited) |
| `Position` | Yes | Yes (inherited) |
| `EmployeeHistory` | Yes | Yes (inherited) |
| `LeavePolicy` | Yes | Yes (inherited) |
| `AuditEntry` | **No** (does not extend BaseEntity) | **No** |

`AuditEntry` has no `@Version` — correct, as it is immutable append-only.

### Concurrent approval race condition on LeaveBalance

**File:** `services/payroll-service/src/main/java/com/andikisha/leave/application/service/LeaveService.java` (approve method, lines 138–173)

The approve flow:
1. Loads `LeaveRequest` by id+tenantId
2. Calls `request.approve(...)` which transitions status PENDING → APPROVED
3. Loads `LeaveBalance` and calls `balance.deduct(request.getDays())`
4. Saves both

`LeaveBalance` has `@Version` via BaseEntity. If two concurrent approvals load the same `LeaveBalance`, one will succeed and the other will throw `ObjectOptimisticLockingFailureException` on `balanceRepository.save(balance)`. This is the correct behaviour.

**However**, `ObjectOptimisticLockingFailureException` is not caught in `approve()`. The `@Transactional` annotation will roll back the transaction, but the caller (the REST controller or gRPC handler) will receive an unhandled Spring Data exception. This should be caught at the service boundary and translated to a `BusinessRuleException("CONCURRENT_APPROVAL", "Another approver just approved or modified this request — please retry")`.

**Finding 8.1 — MEDIUM:** `LeaveService.approve()` does not handle `ObjectOptimisticLockingFailureException`. The exception will propagate as a 500 to the API client instead of a meaningful 409 Conflict response. Add a catch block around the balance deduction + save.

### PayrollRun concurrent calculation

Covered in 4.3. The three-phase design with status state machine and `@Version` provides adequate protection. `ObjectOptimisticLockingFailureException` results in a FAILED run, which is recoverable. No issue.

---

## Summary of Findings by Severity

| # | Severity | File | Issue |
|---|---|---|---|
| 1.1 | **CRITICAL** | `V2__create_pay_slips.sql:22` + `PaySlip.java:74` | `helb` column is nullable in schema, NOT NULL in entity. Breaks `ddl-auto: validate` on startup. Missing V3 migration. |
| 4.1 | **CRITICAL** | `PayrollService.java:228–231` | No accounting identity check before persisting PaySlip. When unpaid leave exceeds net pay and `netPay` is clamped to 0, `totalDeductions > gross`, producing a silent ledger error. |
| 7.1 | **HIGH** | `PayrollRun.java:87` + `V2__create_pay_slips.sql:4` | `CascadeType.ALL` on PayrollRun→PaySlip plus DB-level `ON DELETE CASCADE` creates two independent paths to permanently delete financial records. |
| 3.5.1 | **HIGH** | Review prompt test case | The John Kamau expected values in the review prompt are wrong. The prompt assumes Housing Levy is PAYE-deductible (it is not per Finance Act 2023). The code is correct; do not add test assertions based on the prompt's figures. |
| 4.5 | **MEDIUM** | `EmployeeQueryService.java:66` | Unbounded list load of all active employees for payroll calculation. Violates CLAUDE.md pagination rule. Will cause heap pressure and slow gRPC at scale (5,000+ employee tenants). |
| 2d.1 | **MEDIUM** | `LeaveBalance.java:36–42` | `accrued`, `used`, `carriedOver` BigDecimal fields have no `@Column(precision=15, scale=2)`. Hibernate will use default mapping. Mismatch with actual schema unknown (migration not found). |
| 4.2 | **MEDIUM** | `PayrollService.java:214–217` | Zero-pay employee skip is silent and not counted in the `skipped` warning. A malformed salary proto (empty string) is indistinguishable from a genuinely zero-salary employee. |
| 8.1 | **MEDIUM** | `LeaveService.java:139–173` | `ObjectOptimisticLockingFailureException` from concurrent leave approval is not caught. Propagates as unhandled 500 instead of 409 Conflict. |
| 6.1 | **LOW** | `V2__create_pay_slips.sql:42` | `idx_payslips_payment` indexes only `payment_status` without `tenant_id` prefix. Multi-tenant scan for pending payments will scan all tenants' rows. |
| 3.1.1 | **LOW** | `KenyanTaxCalculator.java:145` | Band 2 comment says "32,333" but constant is correctly 32,300. Typo only. |
| 2e.1 | **LOW** | `AuditEntry.java` | No `@Immutable` annotation. Hibernate dirty-tracking is active on an entity with no update path. |
| 1.5 | **INFO** | `V1__create_audit_entries.sql` | No `created_at`/`updated_at`/`version` columns — intentional for immutable audit log. Document to prevent re-flagging. |
| — | **INVESTIGATION** | employee-service, leave-service | Migration files not found at any tried path. Schema consistency for Employee, LeaveBalance, LeaveRequest, Department, Position cannot be verified. |
