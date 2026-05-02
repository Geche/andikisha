# Money Value Object Audit Report

Date: 2026-05-02
Scope: AndikishaHR monorepo — all services, shared libraries, proto definitions, event classes, and frontend packages

---

## 1. Inventory of monetary fields

### 1.1 Domain entities using `Money` (embedded value object)

| Service | Class | Field | Type | Notes |
|---------|-------|-------|------|-------|
| employee-service | `SalaryStructure` | `basicSalary` | `Money` | `@Embedded`, required |
| employee-service | `SalaryStructure` | `housingAllowance` | `Money` | `@Embedded`, defaults to zero |
| employee-service | `SalaryStructure` | `transportAllowance` | `Money` | `@Embedded`, defaults to zero |
| employee-service | `SalaryStructure` | `medicalAllowance` | `Money` | `@Embedded`, defaults to zero |
| employee-service | `SalaryStructure` | `otherAllowances` | `Money` | `@Embedded`, defaults to zero |
| tenant-service | `Plan` | `monthlyPrice` | `Money` | `@Embedded` |

### 1.2 Snapshot entity fields using `BigDecimal` (permitted exception per CLAUDE.md)

**PaySlip entity** (`payroll-service`) — all `NOT NULL`, `NUMERIC(15,2)`:

| Field | Nullable (entity) | Nullable (DB) |
|-------|-------------------|---------------|
| `basicPay` | No | No |
| `housingAllowance` | No | No |
| `transportAllowance` | No | No |
| `medicalAllowance` | No | No |
| `otherAllowances` | No | No |
| `totalAllowances` | No | No |
| `grossPay` | No | No |
| `paye` | No | No |
| `nssf` (`nssf_employee`) | No | No |
| `nssfEmployer` (`nssf_employer`) | No | No |
| `shif` | No | No |
| `housingLevy` (`housing_levy_employee`) | No | No |
| `housingLevyEmployer` | No | No |
| `helb` | **Yes** | Yes (`DEFAULT 0`) |
| `otherDeductions` | No | No |
| `totalDeductions` | No | No |
| `personalRelief` | No | No |
| `insuranceRelief` | No | No |
| `netPay` | No | No |

**PayrollRun entity** (`payroll-service`) — aggregated totals, all nullable (entity has no `nullable=false` on totals, DB has `DEFAULT 0` without `NOT NULL`):

Fields: `totalGross`, `totalBasic`, `totalAllowances`, `totalPaye`, `totalNssf`, `totalShif`, `totalHousingLevy`, `totalOtherDeductions`, `totalNet` — all `BigDecimal`, `NUMERIC(15,2)`, nullable in both entity and DB.

**PayrollSummary entity** (`analytics-service`) — totals nullable:

Fields: `totalGross`, `totalNet`, `totalPaye`, `totalNssf`, `totalShif`, `totalHousingLevy`, `averageGross`, `averageNet` — all `BigDecimal`, `NUMERIC(15,2)`, nullable in both entity and DB. In practice `create()` always assigns them, but callers can pass `null`.

**PaymentTransaction entity** (`integration-hub-service`):

| Field | Type | Nullable |
|-------|------|----------|
| `amount` | `BigDecimal` | No (`NOT NULL`, `NUMERIC(15,2)`) |

### 1.3 Other `BigDecimal` monetary fields

| Service | Class | Field | Type | Context |
|---------|-------|-------|------|---------|
| tenant-service | `TenantLicence` | `agreedPriceKes` | `BigDecimal` | `NUMERIC(19,4)`, `NOT NULL` |
| analytics-service | `PayrollSummary` | see 1.2 above | `BigDecimal` | snapshot |
| compliance-service | `TaxBracket` (entity) | `lowerBound`, `upperBound`, `rate` | `BigDecimal` | `NUMERIC(15,2)`, `NUMERIC(5,4)` |
| compliance-service | `StatutoryRate` (entity) | `rateValue`, `limitAmount`, `secondaryLimit`, `fixedAmount` | `BigDecimal` | mixed nullable |
| compliance-service | `TaxRelief` (entity) | `monthlyAmount`, `rate`, `maxAmount` | `BigDecimal` | mixed nullable |

### 1.4 Event classes with monetary fields

| Event | Field | Type |
|-------|-------|------|
| `PayrollCalculatedEvent` | `totalGross`, `totalNet` | `BigDecimal` |
| `PayrollApprovedEvent` | `totalGross`, `totalNet`, `totalPaye`, `totalNssf`, `totalShif`, `totalHousingLevy` | `BigDecimal` |
| `PaymentCompletedEvent` | `amount` | `BigDecimal` |
| `PaymentFailedEvent` | `amount` | `BigDecimal` |
| `SalaryChangedEvent` | `oldSalary`, `newSalary` | `BigDecimal` |
| `LicenceRenewedEvent` | `agreedPriceKes` | `BigDecimal` |
| `LicenceUpgradedEvent` | `newAgreedPriceKes` | `BigDecimal` |

---

## 2. Violations of forbidden patterns

### 2a. `double`/`float` fields in monetary contexts

**None found.** The only `Double`/`Float` fields in the codebase are `clockInLatitude`, `clockInLongitude`, `clockOutLatitude`, `clockOutLongitude` in `AttendanceRecord` — these are GPS coordinates, not monetary values.

### 2b. `Double`/`Float` boxed types in monetary contexts

**None found.**

### 2c. `new BigDecimal(double/float literal)` pattern

**None found in production code.** All `new BigDecimal(...)` calls in production code use string literals (e.g., `new BigDecimal("0.0275")`) or `BigDecimal.valueOf(long)`. The compliance-service test files do use `new BigDecimal(lower)` where `lower` is a `String` method argument — this is correct.

### 2d. `BigDecimal.divide()` calls without `RoundingMode`

**None found.** Every `.divide()` call in the codebase provides both a scale and `RoundingMode`. Specifically verified:

- `KenyanTaxCalculator`: `percent.divide(BigDecimal.valueOf(100), 10, RoundingMode.HALF_UP)` ✓
- `PayrollService`: `basicPay.divide(BigDecimal.valueOf(22), 4, RoundingMode.HALF_UP)` ✓
- `LicencePlanService`: `price.divide(MONTHS_PER_YEAR, 4, RoundingMode.HALF_UP)` ✓
- `LeaveBalanceService`: `divide(BigDecimal.valueOf(12), 1, RoundingMode.HALF_UP)` ✓
- `AttendanceRecord`: `divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP)` ✓
- `PayrollSummary`: `divide(BigDecimal.valueOf(employeeCount), 2, RoundingMode.HALF_UP)` ✓

### 2e. `BigDecimal.setScale()` calls missing `RoundingMode`

**Two instances found in non-monetary context** (leave day counts, not money):

- `LeaveAnalytics.java:52`: `BigDecimal.ZERO.setScale(1)` — for day counts, scale 1
- `LeaveAnalytics.java:54`: `BigDecimal.ZERO.setScale(1)` — for day counts, scale 1

These are not monetary amounts. `BigDecimal.ZERO.setScale(1)` is safe because `ZERO` has no fractional part that requires rounding. Not a defect.

### 2f. `.equals()` on `BigDecimal` values

**None found** in production code. No `BigDecimal.equals()` calls exist. All comparisons use `.compareTo()`. Clean.

### 2g. Money arithmetic in controllers or mappers

**None found.** Controllers contain no arithmetic. Mappers contain only field mappings.

---

### 2h. Additional violations not in the original checklist

#### VIOLATION H-1 (CRITICAL): `String.format("%.2f", BigDecimal)` in `ComplianceAuditService` — implicit `doubleValue()` conversion

**File:** `services/compliance-service/src/main/java/com/andikisha/compliance/application/service/ComplianceAuditService.java`, lines 57 and 66

```java
anomalies.add(String.format(
    "SHIF_MISMATCH employeeId=%s gross=%.2f expected=%.2f actual=%.2f",
    slip.getEmployeeId(), gross, expectedShif, actualShif));
```

`%.2f` applied to a `BigDecimal` argument causes Java to call `BigDecimal.doubleValue()` internally before formatting. This loses BigDecimal precision for the anomaly log message. For payroll amounts in the KES range this is unlikely to produce wrong audit output, but it is a code smell that should not be present in payroll audit logic. The fix is `gross.toPlainString()` with `SHIF_MISMATCH` format using `%s`.

#### VIOLATION H-2 (CONVENTION): `ComplianceAuditService` uses gRPC field injection

**File:** `services/compliance-service/src/main/java/com/andikisha/compliance/application/service/ComplianceAuditService.java`, line 27–28

```java
@GrpcClient("payroll-service")
private PayrollServiceGrpc.PayrollServiceBlockingStub payrollStub;
```

This is `@GrpcClient` field injection, which violates the constructor injection rule in CLAUDE.md. The document-service's `PayrollGrpcClient` shows the correct pattern: inject the `Channel` via constructor parameter `@GrpcClient("payroll-service") Channel channel` and construct the stub inside the constructor.

---

## 3. PaySlip accessor situation

The `PaySlip` entity (`services/payroll-service/src/main/java/com/andikisha/payroll/domain/model/PaySlip.java`) has **zero `*AsMoney()` methods**. It is a snapshot entity that holds `BigDecimal` fields per-amount plus a single `String currency` field. This is correct per CLAUDE.md: "denormalised snapshot entities holding many amounts in a single known currency may store currency once at the entity level and use BigDecimal per amount."

There are no `*AsMoney()` methods to audit for callers. Section 3 finding: **Not applicable — no such methods exist on PaySlip.**

---

## 4. Money value object review

**File:** `shared/andikisha-common/src/main/java/com/andikisha/common/domain/Money.java`

### Fields

| Field | Column definition |
|-------|-------------------|
| `amount` | `@Column(nullable=false, precision=15, scale=2)` |
| `currency` | `@Column(nullable=false, length=3)` |

### Factory methods

| Method | Signature | Notes |
|--------|-----------|-------|
| `kes(BigDecimal)` | `static Money kes(BigDecimal)` | KES-specific factory |
| `kes(long)` | `static Money kes(long)` | Convenience; uses `BigDecimal.valueOf(long)` — safe |
| `of(BigDecimal, String)` | `static Money of(BigDecimal, String)` | General factory |
| `zero(String)` | `static Money zero(String)` | Returns zero for given currency |

Constructor normalises `amount` to `setScale(2, RoundingMode.HALF_UP)` — correct.

### Arithmetic methods

| Method | Currency enforcement | Rounding |
|--------|---------------------|---------|
| `add(Money)` | `assertSameCurrency` ✓ | Delegates to `new Money()` constructor (scale 2 HALF_UP) ✓ |
| `subtract(Money)` | `assertSameCurrency` ✓ | Delegates to `new Money()` constructor ✓ |
| `multiply(BigDecimal)` | N/A (factor has no currency) | `setScale(2, HALF_UP)` then `new Money()` (double setScale, harmless) ✓ |
| `percentage(BigDecimal)` | N/A | Divides by 100 to 10 decimal places, then `multiply()` ✓ |
| `min(Money)` | `assertSameCurrency` ✓ | Returns existing object, no new calculation |
| `max(Money)` | `assertSameCurrency` ✓ | Returns existing object, no new calculation |

### `equals` / `hashCode`

- `equals`: uses `amount.compareTo(money.amount) == 0` — scale-normalised, correct.
- `hashCode`: uses `amount.stripTrailingZeros()` — because the constructor always sets scale to 2, `stripTrailingZeros()` will consistently map e.g. `10.00` to `1E+1` for both objects being compared. This is consistent with `equals`. No bug.

### JPA mapping

`Money` is `@Embeddable`. The column annotations (`@Column` on `amount` and `currency`) provide defaults. When embedded, `@AttributeOverrides` in the host entity renames the columns. No `AttributeConverter` exists or is needed — the `@Embeddable` approach is correct.

### Unused public methods (zero production callers)

The following public methods have **zero callers in production code**:

| Method | Production callers | Test callers | Verdict |
|--------|-------------------|--------------|---------|
| `percentage(BigDecimal)` | 0 | 0 | Dead code — violates CLAUDE.md "no accessor methods with no current caller" |
| `max(Money)` | 0 | 0 | Dead code |
| `isZero()` | 0 | 34 (AssertJ `.isZero()` — **not Money.isZero()**) | Dead code. The test hits are AssertJ's own method, not `Money.isZero()` |
| `isGreaterThan(Money)` | 0 | 0 (2 test hits are AssertJ `.isGreaterThan()`) | Dead code |
| `isLessThan(Money)` | 0 | 0 | Dead code |
| `kes(long)` | 0 | 2 (PlanServiceTest) | Dead in production; used in one test |

Methods with production callers: `of`, `zero`, `add`, `subtract`, `multiply`, `min`, `isPositive`, `kes(BigDecimal)` (via `of`).

**`isZero()` clarification:** The 34 "test hits" for `.isZero()` are AssertJ's `AbstractIntegerAssert.isZero()` or `AbstractBigDecimalAssert.isZero()` — not `Money.isZero()`. Confirmed by context (the test fields are `int` or `BigDecimal`, not `Money`).

---

## 5. Database schema check

### pay_slips (payroll-service, V2)

All monetary columns: `NUMERIC(15,2) NOT NULL`. No FLOAT, REAL, DOUBLE PRECISION, or untyped NUMERIC. Explicit precision and scale on all monetary columns.

`helb NUMERIC(15,2) DEFAULT 0` — nullable (no NOT NULL). Entity field `helb` is also nullable. **Consistent.**

### payroll_runs (payroll-service, V1)

Aggregate totals: `NUMERIC(15,2) DEFAULT 0` without `NOT NULL` — nullable in DB. Entity totals have `@Column(precision=15, scale=2)` without `nullable=false` — nullable in JPA. **Consistent, but see issue below.**

**Issue:** All total columns (`total_gross`, etc.) have `DEFAULT 0` in the DB but no `NOT NULL`. This means a new row in DRAFT state will have NULLs if the application doesn't set them. The `PayrollRun.create()` factory does initialise them to `BigDecimal.ZERO`, so in practice NULLs won't appear. However, the DB schema does not enforce this. A direct SQL insert without these columns would produce NULLs, which would then throw a `NullPointerException` when `sumField()` is called. Low risk in practice, no immediate action needed, but worth hardening.

### employees (employee-service, V3)

All salary/allowance columns: `NUMERIC(15,2) NOT NULL`. Currency columns alongside amounts: `VARCHAR(3) NOT NULL DEFAULT 'KES'`. Clean. These columns back the `@Embedded Money` fields in `SalaryStructure`.

### tax_brackets (compliance-service, V1)

`lower_bound NUMERIC(15,2) NOT NULL`, `upper_bound NUMERIC(15,2)` (nullable — correct, Band 5 has no upper bound), `rate NUMERIC(5,4) NOT NULL`. Clean.

### statutory_rates (compliance-service, V2)

`rate_value NUMERIC(10,6) NOT NULL`, `limit_amount NUMERIC(15,2)`, `secondary_limit NUMERIC(15,2)`, `fixed_amount NUMERIC(15,2)`. All monetary amounts have explicit precision and scale. Nullable columns are intentional (not all rate types use limits). Clean.

### tax_reliefs (compliance-service, V3)

`monthly_amount NUMERIC(15,2)`, `rate NUMERIC(5,4)`, `max_amount NUMERIC(15,2)`. Nullable as not all relief types use all columns. Clean.

### payroll_summaries (analytics-service, V1)

Totals: `NUMERIC(15,2) DEFAULT 0` without `NOT NULL` — nullable in DB. Entity has no `nullable=false`. **Consistent but same latent issue as `payroll_runs`.**

**Issue:** `PayrollSummary.create()` receives `BigDecimal totalGross` etc. with no null check. If a caller passes `null`, `s.totalGross = null` will be set, and then `totalGross.divide(...)` on line 79 will throw `NullPointerException`. Currently the only caller in `analytics-service` always passes non-null values, but there is no guard.

### payment_transactions (integration-hub-service, V2)

`amount NUMERIC(15,2) NOT NULL`. Clean.

### tenant_licence (tenant-service, V6)

`agreed_price_kes NUMERIC(19,4) NOT NULL` — note the higher precision (19,4) vs the standard (15,2). This is intentional for pro-rated billing calculations. Entity field `agreedPriceKes @Column(nullable=false, precision=19, scale=4)`. **Consistent.**

### tenant_ewa_config (tenant-service, V6)

`monthly_float_limit NUMERIC(19,4) NOT NULL DEFAULT 0`, `max_advance_percent NUMERIC(5,2) NOT NULL DEFAULT 50.00`, `transaction_fee_percent NUMERIC(5,2) NOT NULL DEFAULT 1.00`. All explicit precision/scale, `NOT NULL`. Clean.

### plans (tenant-service, V1)

`monthly_price_amount NUMERIC(15,2) NOT NULL`, `monthly_price_currency VARCHAR(3) NOT NULL DEFAULT 'KES'`. Clean.

**Flag:** No FLOAT, REAL, DOUBLE PRECISION, MONEY, or untyped NUMERIC columns found anywhere in the schema. All monetary columns are `NUMERIC(p,s)` with explicit precision and scale.

---

## 6. Proto and event contracts

### Proto files

All monetary fields in the project's proto definitions use `string` type. This is the correct pattern — it preserves `BigDecimal` precision across the gRPC boundary.

| Proto file | Monetary fields | Type | Status |
|-----------|-----------------|------|--------|
| `payroll.proto` | `total_gross`, `total_net`, `total_paye`, `total_nssf`, `total_shif`, `total_housing_levy` (PayrollRunResponse) | `string` | ✓ |
| `payroll.proto` | All PaySlipDetail amounts (`gross_pay`, `net_pay`, `paye`, `nssf`, `shif`, `housing_levy`, etc.) | `string` | ✓ |
| `payroll.proto` | All PaySlipResponse amounts | `string` | ✓ |
| `employee.proto` | `basic_salary`, `housing_allowance`, `transport_allowance`, `medical_allowance`, `other_allowances` in SalaryStructureResponse | `string` | ✓ |
| `employee.proto` | `basic_salary` in EmployeeResponse | `string` | ✓ |
| `compliance.proto` | All TaxBracket amounts and rates, TaxRatesResponse, StatutoryRatesResponse | `string` | ✓ |
| `leave.proto` | `accrued`, `used`, `carried_over`, `available` in LeaveBalanceResponse | `string` | ✓ (leave days, not money) |
| `tenant.proto` | No monetary fields | — | ✓ |
| `time_attendance.proto` | No monetary fields | — | ✓ |

No `double`, `float`, `int32`, or `int64` used for monetary values anywhere in the proto definitions.

### Event classes

All event classes use `BigDecimal` for monetary amounts. No `double`, `float`, `String`, or other type is used for money in events.

| Event | Monetary fields | Type | Status |
|-------|-----------------|------|--------|
| `PayrollCalculatedEvent` | `totalGross`, `totalNet` | `BigDecimal` | ✓ |
| `PayrollApprovedEvent` | `totalGross`, `totalNet`, `totalPaye`, `totalNssf`, `totalShif`, `totalHousingLevy` | `BigDecimal` | ✓ |
| `PaymentCompletedEvent` | `amount` | `BigDecimal` | ✓ |
| `PaymentFailedEvent` | `amount` | `BigDecimal` | ✓ |
| `SalaryChangedEvent` | `oldSalary`, `newSalary` | `BigDecimal` | ✓ |
| `LicenceRenewedEvent` | `agreedPriceKes` | `BigDecimal` | ✓ |
| `LicenceUpgradedEvent` | `newAgreedPriceKes` | `BigDecimal` | ✓ |

**Note:** `BigDecimal` is not safe across RabbitMQ serialisation without a configured `ObjectMapper` that handles it correctly (Jackson serialises `BigDecimal` as a JSON number by default, which can lose precision). Verify the RabbitMQ `ObjectMapper` configuration uses `JsonGenerator.Feature.WRITE_BIGDECIMAL_AS_PLAIN` or `DeserializationFeature.USE_BIG_DECIMAL_FOR_FLOATS`. This was not in scope for this audit but is a latent risk.

---

## 7. Frontend serialisation surface

The only TypeScript type file with monetary fields is `frontend/packages/shared-types/src/index.ts`.

**VIOLATION FOUND:**

```typescript
export interface Employee {
  ...
  basicSalary: number;   // LINE 15 — IEEE 754 double, precision bug risk
  ...
}
```

`basicSalary: number` uses JavaScript's `number` type, which is IEEE 754 double precision. For KES amounts up to ~9 quadrillion this will not lose integer precision, but fractional KES amounts (e.g., `12500.50`) can be misrepresented as `12500.499999999998` after serialisation/deserialisation through JSON. Since the backend serialises salary as a string in the gRPC proto (`string basic_salary`) but returns it as a `BigDecimal` over REST (serialised as a JSON number by default), this is a risk. The correct type is `string` (parsed only when arithmetic is needed) or a structured type `{ amount: string; currency: string }`.

The landing page data (`frontend/landing/lib/data.ts`) uses `string` for display prices (`"KES 500"`, `"KES 750"`, `"Custom"`). No violation there.

The admin and employee portals (`frontend/admin-portal`, `frontend/employee-portal`) contain only layout stubs with no typed monetary interfaces.

---

## 8. Test coverage gaps

### Money arithmetic tests

**No `MoneyTest` exists anywhere in the monorepo.** The `shared/andikisha-common` module has no test directory or test files. The `Money` class has zero unit test coverage.

### Currency mismatch behaviour

No test covers what happens when `Money.add()` is called with mismatched currencies. The production code throws `IllegalArgumentException` — correct, but untested.

### KenyanTaxCalculator PAYE band edges

`KenyanTaxCalculatorTest.java` exists at `services/payroll-service/src/test/java/com/andikisha/payroll/unit/KenyanTaxCalculatorTest.java`.

| Edge case | Tested? | Detail |
|-----------|---------|--------|
| 0–24,000 boundary (Band 1 top) | Partial | `25,000` tested, not exactly `24,000` or `24,001` |
| 24,001–32,300 boundary (Band 2) | Not tested | No salary at exactly `32,300` or `32,301` |
| 32,301–500,000 boundary (Band 3 top) | Tested via `500,000` in identity test | No band boundary test |
| 500,001–800,000 boundary (Band 4) | Tested via `800,000` in identity test | No value at `500,001` |
| 800,001+ boundary (Band 5) | `1,000,000` tested | ✓ sufficient |
| Zero salary | Not tested | |

The `calculate_grossEqualsNetPlusTotalDeductions` test uses salaries at `500,000` and `800,000` but only verifies the accounting identity, not the correct band amounts.

### NSSF Tier I and Tier II ceilings

`KenyanTaxCalculatorTest` tests:
- `nssfCappedAtTier2`: salary `1,000,000` → NSSF = `2160.00` ✓
- `calculate_withMinimumWage_returnsCorrectDeductions`: `15,201` → `912.06` ✓

**Missing:** Test for salary exactly at Tier I ceiling (`7,000`), Tier II ceiling (`36,000`), and one KES above each.

### SHIF calculations

`KenyanTaxCalculatorTest` tests SHIF implicitly via the `150,000` gross test: `150,000 × 2.75% = 4,125.00` ✓.

Missing: Test verifying SHIF insurance relief cap at KES 5,000 (requires gross ≥ `121,212.12` where `gross × 2.75% × 15% = 5,000`).

### Housing Levy calculations

`KenyanTaxCalculatorTest` tests Housing Levy via `150,000` case: `150,000 × 1.5% = 2,250.00` ✓.

Missing: No test for employer matching (`nssfEmployer == nssfEmployee` and `housingLevyEmployer == housingLevyEmployee`).

### PaySlip null handling

No explicit test for `PaySlip.getHelb()` returning `null` in the mapper or anywhere that processes PaySlip fields. The `helb` field is nullable (entity and DB). `PayrollRun.sumField(paySlips, PaySlip::getHelb)` will throw `NullPointerException` if `helb` is null on any PaySlip, because `BigDecimal::add` cannot add null. This is **not** currently triggered because `PayrollService` always sets `helb(BigDecimal.ZERO)` in the builder. But there is no null guard in `sumField()`.

---

## Summary of findings

### Critical issues: 3

1. **Missing payroll gRPC server** — `payroll-service` has no `@GrpcService` implementation of `PayrollService` proto. `ComplianceAuditService` calls `payrollStub.getPaySlips()` which will always fail with a connection error at runtime, returning `AUDIT_SKIPPED`. The compliance audit feature is entirely non-functional. This means KRA filing anomaly detection does not work.

2. **`PaySlip.helb` nullable + `sumField()` NPE risk** — `PaySlip.helb` is nullable (entity and DB). `PayrollRun.finishCalculation()` calls `sumField(paySlips, PaySlip::getHelb)` which will throw `NullPointerException` if any PaySlip has `helb = null`. Currently prevented only by the PayrollService builder always passing `BigDecimal.ZERO`, but no contract or null guard enforces this. If any code path creates a PaySlip without setting `helb`, the entire payroll run fails at aggregation.

3. **`basicSalary: number` in TypeScript `Employee` interface** — `frontend/packages/shared-types/src/index.ts` line 15. IEEE 754 double precision. When the REST API returns salary as a JSON number (`12500.50`), JavaScript may represent it as `12500.499999999998`. If the admin portal ever renders or submits this value back, salary data can be silently corrupted. Risk increases once payroll portal UI is built and salary edit flows are wired up.

### Latent bugs: 4

4. **`String.format("%.2f", BigDecimal)` in `ComplianceAuditService`** — lines 57 and 66. Calls `BigDecimal.doubleValue()` implicitly. Audit log messages may have imprecise values. Not a calculation bug (only affects the log string, not the actual comparison), but misleading in audit context.

5. **PAYE Band 2 boundary: 32,300 vs 32,333** — `KenyanTaxCalculator` uses `BAND_2_LIMIT = 32300`. KRA's published FY2024/25 schedule sets Band 2 upper at KES 32,333. The compliance seed migration also uses 32,300. Code and seed are internally consistent but may be wrong against official KRA rates. For an employee earning exactly KES 32,301–32,333, this produces KES 8.25/month excess tax (KES 99/year). Requires verification against the KRA gazette — this cannot be resolved unilaterally.

6. **`PayrollSummary.create()` does not null-check totalGross/totalNet before dividing** — lines 79–81. If `employeeCount > 0` but `totalGross` is `null` (possible via direct SQL insert or future code path), `totalGross.divide(...)` throws `NullPointerException`. Low probability but absent guard.

7. **`PayrollRun` total columns nullable in DB without `NOT NULL`** — `payroll_runs.total_gross` etc. have `DEFAULT 0` but no `NOT NULL`. A direct SQL insert without specifying these columns produces `NULL`, not zero. `PayrollRun.finishCalculation()` would then produce NPE. Not triggered in normal application flow.

### Convention violations: 3

8. **`ComplianceAuditService` uses `@GrpcClient` field injection** — `services/compliance-service/src/main/java/com/andikisha/compliance/application/service/ComplianceAuditService.java`, line 27. Violates CLAUDE.md constructor injection rule. `document-service`'s `PayrollGrpcClient` shows the correct pattern.

9. **Five dead methods on `Money`** — `percentage()`, `max()`, `isZero()`, `isGreaterThan()`, `isLessThan()`. Zero callers in production code, zero in tests for most. CLAUDE.md explicitly prohibits "accessor methods that have no current caller."

10. **`Money.kes(long)` has zero production callers** — only called in `PlanServiceTest`. If `Plan.create()` in production passes a `BigDecimal` (which it does via `Money.kes(BigDecimal amount)` or `Money.of()`), the `long` overload is dead production code.

### Speculative or dead code: 2

11. **`Money.percentage()` and `Money.max()`** — zero callers anywhere (production or test). These are anticipatory methods added with no current consumer. Should be removed per CLAUDE.md.

12. **`PaySlipResponse` record has fields not populated by the mapper** — `PaySlipResponse` includes `taxableIncome`, `nssf_tier1`, `nssf_tier2`, `kra_pin`, `loan_deductions`, `bank_name`, `bank_account`, `bank_transaction_id`, `payment_method`, `payment_date`, `payment_reference`, `approver_id`, `approver_name`, `remarks` — these appear in the proto definition but are not present in the `PaySlip` domain entity. MapStruct will generate null for all of them. These are spec-ahead fields with no data source and no current consumer; they bloat the response contract.

---

## Proposed remediation plan

### Finding 1: Missing payroll gRPC server

**Fix:** Implement `PayrollGrpcServiceImpl extends PayrollServiceImplBase` in `payroll-service`, annotated `@GrpcService`. Implement `getPaySlips()`, `getPaySlip()`, `getPayrollRun()`, `getLatestPaySlip()`. Serialise all `BigDecimal` amounts to `String` using `.toPlainString()`. Also refactor `ComplianceAuditService` to use the constructor-injected `Channel` pattern (aligns with Finding 8).

**Files affected:** New: `services/payroll-service/src/main/java/com/andikisha/payroll/infrastructure/grpc/PayrollGrpcService.java`. Modified: `services/compliance-service/.../ComplianceAuditService.java`.

**Risk:** High — without this, compliance audit is broken.
**Flyway migration required:** No.
**Proto/event contract change:** No (the proto exists; this adds the server side).
**Estimated effort:** Medium.

---

### Finding 2: `PaySlip.helb` nullable NPE in `sumField()`

**Fix option A (preferred):** Make `helb` non-nullable in `PaySlip`. Change `@Column(precision=15, scale=2)` to `@Column(precision=15, scale=2, nullable=false)`. Change DB column to `NOT NULL DEFAULT 0`. The builder already defaults to `BigDecimal.ZERO`.

**Fix option B:** Add null-safe `sumField`: `slips.stream().map(getter).filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add)`.

Option A is correct — `helb` should be `0` not `NULL` for employees with no HELB obligation.

**Files affected:** `services/payroll-service/src/main/java/com/andikisha/payroll/domain/model/PaySlip.java`. New migration: `services/payroll-service/src/main/resources/db/migration/V3__make_helb_not_null.sql`.

**Risk:** High (NPE risk in production payroll run).
**Flyway migration required:** Yes — `ALTER TABLE pay_slips ALTER COLUMN helb SET NOT NULL;` (safe since all existing rows have `DEFAULT 0`).
**Proto/event contract change:** No.
**Estimated effort:** Small.

---

### Finding 3: `basicSalary: number` in TypeScript

**Fix:** Change `basicSalary: number` to `basicSalary: string` in `frontend/packages/shared-types/src/index.ts`. Update any UI consumers to parse the string before arithmetic, and format using `Intl.NumberFormat`.

**Files affected:** `frontend/packages/shared-types/src/index.ts`. Any frontend components consuming `Employee.basicSalary`.

**Risk:** High (silent precision loss on salary submission).
**Flyway migration required:** No.
**Proto/event contract change:** No (backend REST already serialises BigDecimal; this is a frontend type fix).
**Estimated effort:** Small (type change) to Medium (cascading consumer updates).

---

### Finding 4: `String.format("%.2f", BigDecimal)` in `ComplianceAuditService`

**Fix:**
```java
// Replace:
"SHIF_MISMATCH employeeId=%s gross=%.2f expected=%.2f actual=%.2f",
slip.getEmployeeId(), gross, expectedShif, actualShif

// With:
"SHIF_MISMATCH employeeId=%s gross=%s expected=%s actual=%s",
slip.getEmployeeId(), gross.toPlainString(), expectedShif.toPlainString(), actualShif.toPlainString()
```

**Files affected:** `services/compliance-service/src/main/java/com/andikisha/compliance/application/service/ComplianceAuditService.java`.

**Risk:** Low (audit log only, no calculation affected).
**Flyway migration required:** No.
**Proto/event contract change:** No.
**Estimated effort:** Small.

---

### Finding 5: PAYE Band 2 boundary 32,300 vs 32,333

**Fix:** Verify against the official KRA Tax Procedures Act and Finance Act 2024 gazette. If 32,333 is correct, update `KenyanTaxCalculator.BAND_2_LIMIT = bd(32333)` and the compliance seed migration `V4__seed_kenya_rates.sql` Band 2 upper bound from 32300 to 32333. Also update `CLAUDE.md`.

**Files affected:** `services/payroll-service/.../KenyanTaxCalculator.java`. `services/compliance-service/.../V4__seed_kenya_rates.sql` (new migration row, not editing old). `CLAUDE.md`.

**Risk:** Medium (affects PAYE for employees earning KES 32,301–32,333).
**Flyway migration required:** Yes — add a new migration updating the Band 2 seed row.
**Proto/event contract change:** No.
**Estimated effort:** Small once KRA gazette is confirmed.

---

### Finding 6: `PayrollSummary.create()` NPE on null totals

**Fix:** Add null checks in `create()`:
```java
s.totalGross = totalGross != null ? totalGross : BigDecimal.ZERO;
s.totalNet   = totalNet   != null ? totalNet   : BigDecimal.ZERO;
// etc.
```

**Files affected:** `services/analytics-service/.../PayrollSummary.java`.

**Risk:** Low (only triggered by null arguments from the event listener, which currently always passes non-null).
**Flyway migration required:** No.
**Proto/event contract change:** No.
**Estimated effort:** Small.

---

### Finding 7: `payroll_runs` totals nullable in DB

**Fix:** Add `NOT NULL` to total columns via a new migration. This is a schema-level enforcement of what the application already guarantees.

**Files affected:** New migration `services/payroll-service/src/main/resources/db/migration/V3__make_payroll_totals_not_null.sql`.

**Risk:** Low (safe migration — defaults already in place). Note: if combined with Finding 2's migration, use V3 and V4 or merge.
**Flyway migration required:** Yes.
**Proto/event contract change:** No.
**Estimated effort:** Small.

---

### Finding 8: `ComplianceAuditService` field injection

**Fix:** Refactor to constructor injection per the `document-service` pattern. Inject `Channel` in constructor, build stub inside.

**Files affected:** `services/compliance-service/.../ComplianceAuditService.java`.

**Risk:** Low (pure refactor, no behaviour change).
**Flyway migration required:** No.
**Proto/event contract change:** No.
**Estimated effort:** Small.

---

### Findings 9–10: Dead `Money` methods and `Money.kes(long)` without production callers

**Fix:** Remove `percentage()`, `max()`, `isZero()`, `isGreaterThan()`, `isLessThan()` from `Money`. Remove `kes(long)` if `PlanServiceTest` is updated to use `Money.of()` or `Money.kes(BigDecimal.valueOf(2500))`.

**Files affected:** `shared/andikisha-common/.../Money.java`. `services/tenant-service/src/test/.../PlanServiceTest.java`.

**Risk:** Low.
**Flyway migration required:** No.
**Proto/event contract change:** No.
**Estimated effort:** Small.

---

### Finding 11: `PaySlipResponse` over-specified fields

**Fix:** Remove unused fields from `PaySlipResponse` record that have no data source on `PaySlip` entity: `taxableIncome`, `nssf_tier1`, `nssf_tier2`, `kra_pin`, `loan_deductions`, `bank_name`, `bank_account`, `bank_transaction_id`, `payment_method`, `payment_date`, `payment_reference`, `approver_id`, `approver_name`, `remarks`. Add them back when the data source is wired.

**Warning:** This is a breaking proto change if any client is consuming these fields. Verify no clients depend on them before removing.

**Files affected:** `services/payroll-service/.../PaySlipResponse.java`. Possibly `shared/andikisha-proto/.../payroll.proto`.

**Risk:** Medium (contract breakage if any client depends on these fields).
**Flyway migration required:** No.
**Proto/event contract change:** Yes if the proto is updated.
**Estimated effort:** Small.

---

### Additional recommendation: Add `MoneyTest` unit tests

The `Money` class has zero test coverage. At minimum, add tests for: `add`, `subtract`, `multiply`, `percentage`, `equals` scale normalisation, `hashCode` consistency, currency mismatch throwing `IllegalArgumentException`, `isPositive`, factory methods. This is not in the priority list above because no bugs were found in `Money`, but absent tests are a stability risk.

**Files affected:** New `shared/andikisha-common/src/test/java/com/andikisha/common/domain/MoneyTest.java`.

**Estimated effort:** Small.

---

## Open questions for Lawrence

1. **PAYE Band 2 boundary (32,300 vs 32,333):** The KRA published schedule needs to be verified from the official KRA website or Finance Act 2024 gazette. Which figure does KRA officially use? This affects tax calculations for employees in the KES 32,301–32,333 monthly income range.

2. **`PaySlipResponse` over-specified fields in proto:** The `PaySlipResponse` proto message contains ~15 fields that do not exist on the `PaySlip` entity (e.g., `taxableIncome`, `kra_pin`, `loan_deductions`, `nssf_tier1`, `nssf_tier2`, bank fields). Is there a plan to populate these? If yes, which service owns each field? If no, they should be removed before the proto becomes a public contract. Removing them later will be a breaking change.

3. **RabbitMQ `BigDecimal` serialisation:** The event classes (`PayrollCalculatedEvent`, `PayrollApprovedEvent`, etc.) carry `BigDecimal` fields. Jackson's default JSON serialiser for `BigDecimal` outputs a plain number (`12500.50`), which some consumers may parse as a float. Confirm the RabbitMQ `MessageConverter` / `ObjectMapper` configuration uses `DeserializationFeature.USE_BIG_DECIMAL_FOR_FLOATS` and `JsonGenerator.Feature.WRITE_BIGDECIMAL_AS_PLAIN` to guarantee safe round-tripping. If not configured, `BigDecimal` amounts in events may lose precision on deserialization.

4. **`helb` nullability design intent:** Should `helb` on `PaySlip` always default to zero (no HELB obligation = 0), or does null mean "HELB status unknown"? The remediation assumes `null = 0` (no HELB), but if the intent is "not yet determined," the null semantics are different and the fix is different.

5. **`PayrollRun` aggregate totals nullable in DB:** Is it acceptable to enforce `NOT NULL` on `total_gross` etc. in `payroll_runs`? The migration is safe given existing defaults, but you should confirm no direct SQL inserts or external tools write rows without these columns.
