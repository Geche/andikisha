# Pre-SIT Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve all 6 SIT blockers so the AndikishaHR system can enter System Integration Testing.

**Architecture:** Fixes span 5 services (auth-service, api-gateway, payroll-service, compliance-service, integration-hub-service) and 1 shared library (andikisha-events). Each task is independently deployable. Execute in order — Task 1 unblocks test verification for all subsequent tasks.

**Tech Stack:** Java 21, Spring Boot 3.4, Spring Data JPA, RabbitMQ (Spring AMQP), Flyway, JUnit 5 + Mockito

---

## File Map

| Task | Files Modified / Created |
|------|--------------------------|
| 1 | `services/*/src/main/resources/application-test.yml` (all services) |
| 2 | `services/auth-service/.../AuthService.java` |
| 3 | `services/api-gateway/.../JwtAuthenticationFilter.java`, `JwtAuthenticationFilterTest.java` |
| 4 | `services/payroll-service/.../PayrollRun.java`, `PayrollService.java`, `V3__add_skipped_employee_count.sql` |
| 5 | `shared/andikisha-events/.../PayrollProcessedEvent.java`, `PayrollService.java`, `ComplianceAuditRecord.java`, `ComplianceAuditRecordRepository.java`, `V6__create_compliance_audit_records.sql`, `PayrollEventListener.java`, `PayrollEventListenerTest.java` |
| 6 | `services/integration-hub-service/.../MpesaCallbackAuthFilter.java`, `application.yml`, `MpesaCallbackAuthFilterTest.java` |

---

### Task 1: Fix Integration Test Environment

**Problem:** `application.yml` uses `${DB_HOST}`, `${DB_PORT}`, `${DB_NAME}`, `${REDIS_HOST}`, `${JWT_SECRET}` with no defaults. Every `@SpringBootTest` fails with `IllegalArgumentException: Could not resolve placeholder`. None of the integration or context-load tests pass in CI.

**Fix:** Add `${VAR:default}` fallback syntax for all env vars in every service's `application-test.yml`.

**Files:**
- Modify: `services/auth-service/src/main/resources/application-test.yml`
- Modify: `services/tenant-service/src/main/resources/application-test.yml`
- Modify: `services/payroll-service/src/main/resources/application-test.yml`
- Modify: `services/compliance-service/src/main/resources/application-test.yml`
- Modify: `services/leave-service/src/main/resources/application-test.yml`
- Modify: `services/employee-service/src/main/resources/application-test.yml`
- Modify: `services/audit-service/src/main/resources/application-test.yml`
- Modify: `services/analytics-service/src/main/resources/application-test.yml`

- [ ] **Step 1: Update auth-service application-test.yml**

Replace the full contents of `services/auth-service/src/main/resources/application-test.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:andikisha_auth_test}
    username: ${DB_USER:postgres}
    password: ${DB_PASSWORD:postgres}
  data:
    redis:
      host: ${REDIS_HOST:localhost}
      port: ${REDIS_PORT:6379}
  jpa:
    hibernate:
      ddl-auto: create-drop
  flyway:
    enabled: false
  rabbitmq:
    listener:
      simple:
        auto-startup: false

grpc:
  server:
    port: 0

app:
  jwt:
    secret: dGVzdC1zZWNyZXQtdGhhdC1pcy1hdC1sZWFzdC0zMi1jaGFycw==
    expiration-ms: 3600000
    refresh-expiration-ms: 604800000
```

The JWT secret decodes to `test-secret-that-is-at-least-32-chars` — safe for tests only.

- [ ] **Step 2: Apply the same pattern to all other services**

For each remaining service, open its `application-test.yml` and add `${VAR:defaultValue}` fallbacks for every env var used in the service's main `application.yml`. The pattern is:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:andikisha_{service}_test}
    username: ${DB_USER:postgres}
    password: ${DB_PASSWORD:postgres}
  data:
    redis:
      host: ${REDIS_HOST:localhost}
      port: ${REDIS_PORT:6379}
  jpa:
    hibernate:
      ddl-auto: create-drop
  flyway:
    enabled: false
  rabbitmq:
    listener:
      simple:
        auto-startup: false
```

Replace `{service}` with the service name (e.g. `tenant`, `payroll`, `compliance`, etc.). Keep any existing test-profile overrides that are already present.

- [ ] **Step 3: Run all context-load tests**

```bash
./gradlew test --tests "*ApplicationTest" --no-daemon -q 2>&1 | tail -20
```
Expected output: `BUILD SUCCESSFUL` with all `contextLoads()` tests passing. Any remaining failures indicate a service has additional unresolved env vars — add the missing defaults.

- [ ] **Step 4: Commit**

```bash
git add services/*/src/main/resources/application-test.yml
git commit -m "fix(tests): add default env var fallbacks to all application-test.yml so context loads in CI"
```

---

### Task 2: Fix Auth Register Event Not Published in Unit Tests

**Problem:** `AuthService.register()` wraps `eventPublisher.publishUserRegistered()` in `if (isSynchronizationActive())` with no `else` branch. In unit tests (no Spring TX manager), synchronization is never active, so the event is never published. `AuthServiceTest.withValidRequest_createsEmployeeAndReturnsTokens` fails with `Wanted but not invoked: eventPublisher.publishUserRegistered(any())`.

**File:**
- Modify: `services/auth-service/src/main/java/com/andikisha/auth/application/service/AuthService.java:85-92`

- [ ] **Step 1: Verify the test currently fails**

```bash
./gradlew :services:auth-service:test \
  --tests "com.andikisha.auth.unit.AuthServiceTest\$Register.withValidRequest_createsEmployeeAndReturnsTokens" \
  --no-daemon -q 2>&1 | tail -15
```
Expected: `FAILED` — `Wanted but not invoked: eventPublisher.publishUserRegistered(any())`

- [ ] **Step 2: Add the else branch in AuthService.java**

In `services/auth-service/src/main/java/com/andikisha/auth/application/service/AuthService.java`, find the block at lines 85–92 and replace:

```java
        final User savedUser = user;
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    eventPublisher.publishUserRegistered(savedUser);
                }
            });
        }
```

With:

```java
        final User savedUser = user;
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    eventPublisher.publishUserRegistered(savedUser);
                }
            });
        } else {
            eventPublisher.publishUserRegistered(savedUser);
        }
```

- [ ] **Step 3: Run the failing test — verify it now passes**

```bash
./gradlew :services:auth-service:test \
  --tests "com.andikisha.auth.unit.AuthServiceTest\$Register.withValidRequest_createsEmployeeAndReturnsTokens" \
  --no-daemon -q 2>&1 | tail -10
```
Expected: `PASSED`

- [ ] **Step 4: Run all auth-service unit tests for regressions**

```bash
./gradlew :services:auth-service:test --tests "com.andikisha.auth.unit.*" --no-daemon -q
```
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add services/auth-service/src/main/java/com/andikisha/auth/application/service/AuthService.java
git commit -m "fix(auth): publish UserRegistered event directly when no active transaction (unit test path)"
```

---

### Task 3: Restrict Gateway — Only POST /api/v1/tenants Is Public

**Problem:** The gateway's `PUBLIC_EXACT_PATHS` set includes `/api/v1/tenants`, which matches ALL HTTP methods. A request to `GET /api/v1/tenants` (list all tenants — super-admin only) bypasses JWT extraction entirely, reaching the service with no identity headers. The service's Spring Security blocks it, but the gateway silently permits the pass-through, hiding the missing JWT.

**Fix:** Remove `/api/v1/tenants` from `PUBLIC_EXACT_PATHS`. Add a method-specific public rule: only `POST /api/v1/tenants` (self-service company registration) is unauthenticated.

**Files:**
- Modify: `services/api-gateway/src/main/java/com/andikisha/gateway/filter/JwtAuthenticationFilter.java`
- Test: `services/api-gateway/src/test/java/com/andikisha/gateway/filter/JwtAuthenticationFilterTest.java`

- [ ] **Step 1: Write a failing test — GET /api/v1/tenants without JWT must return 401**

Open `services/api-gateway/src/test/java/com/andikisha/gateway/filter/JwtAuthenticationFilterTest.java`. Add:

```java
@Test
void getTenantsWithoutToken_returns401() {
    MockServerHttpRequest request = MockServerHttpRequest
            .get("/api/v1/tenants")
            .build();
    MockServerWebExchange exchange = MockServerWebExchange.from(request);
    GatewayFilterChain chain = ex -> { throw new AssertionError("chain must not be reached"); };

    StepVerifier.create(filter.filter(exchange, chain)).verifyComplete();

    assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
}

@Test
void postTenantsWithoutToken_passesThrough() {
    MockServerHttpRequest request = MockServerHttpRequest
            .post("/api/v1/tenants")
            .build();
    MockServerWebExchange exchange = MockServerWebExchange.from(request);
    GatewayFilterChain chain = ex -> Mono.empty();

    StepVerifier.create(filter.filter(exchange, chain)).verifyComplete();

    // No 401 — POST /api/v1/tenants is public
    assertThat(exchange.getResponse().getStatusCode()).isNotEqualTo(HttpStatus.UNAUTHORIZED);
}
```

- [ ] **Step 2: Run the tests — verify getTenantsWithoutToken_returns401 fails**

```bash
./gradlew :services:api-gateway:test \
  --tests "com.andikisha.gateway.filter.JwtAuthenticationFilterTest.getTenantsWithoutToken_returns401" \
  --no-daemon -q 2>&1 | tail -10
```
Expected: `FAILED` (currently passes through as public path).

- [ ] **Step 3: Update JwtAuthenticationFilter**

In `services/api-gateway/src/main/java/com/andikisha/gateway/filter/JwtAuthenticationFilter.java`:

**a.** Add import at the top:
```java
import org.springframework.http.HttpMethod;
import java.util.Map;
```

**b.** Remove `/api/v1/tenants` from `PUBLIC_EXACT_PATHS` and add a method-specific map:

```java
    private static final Set<String> PUBLIC_EXACT_PATHS = Set.of(
            "/api/v1/auth/login",
            "/api/v1/auth/register",
            "/api/v1/auth/refresh",
            "/api/v1/auth/super-admin/provision",
            "/api/v1/auth/super-admin/login",
            "/api/v1/auth/ussd/validate",
            "/api/v1/plans"
    );

    // Paths that are public only for the listed HTTP methods
    private static final Map<String, Set<HttpMethod>> PUBLIC_METHOD_PATHS = Map.of(
            "/api/v1/tenants", Set.of(HttpMethod.POST)
    );
```

**c.** Change the `filter()` method call from `isPublicPath(path)` to `isPublicPath(exchange)`:

```java
        if (isPublicPath(exchange)) {
            return chain.filter(exchange);
        }
```

**d.** Replace the `isPublicPath(String path)` method with:

```java
    private boolean isPublicPath(ServerWebExchange exchange) {
        String path = exchange.getRequest().getURI().getPath();
        if (PUBLIC_EXACT_PATHS.contains(path)) return true;
        if (PUBLIC_PREFIX_PATHS.stream().anyMatch(path::startsWith)) return true;
        Set<HttpMethod> allowedMethods = PUBLIC_METHOD_PATHS.get(path);
        return allowedMethods != null && allowedMethods.contains(exchange.getRequest().getMethod());
    }
```

- [ ] **Step 4: Run both new tests — both must pass**

```bash
./gradlew :services:api-gateway:test \
  --tests "com.andikisha.gateway.filter.JwtAuthenticationFilterTest" \
  --no-daemon -q 2>&1 | tail -15
```
Expected: all gateway filter tests pass.

- [ ] **Step 5: Commit**

```bash
git add services/api-gateway/src/main/java/com/andikisha/gateway/filter/JwtAuthenticationFilter.java \
        services/api-gateway/src/test/java/com/andikisha/gateway/filter/JwtAuthenticationFilterTest.java
git commit -m "fix(gateway): restrict /api/v1/tenants — only POST is public; GET/PATCH require valid JWT"
```

---

### Task 4: Persist Skipped Employee Count and Block Payroll Approval

**Problem:** When a gRPC call fails for an individual employee during payroll calculation, `PayrollService` logs a warning and silently continues. `PayrollRun.approve()` has no knowledge of skipped employees. An HR admin can approve a partial payroll run, disbursing salary to only some employees with no automated blocker.

**Fix:** Add `skipped_employee_count` to `PayrollRun`. Set it during calculation. Block `approve()` when it is > 0.

**Files:**
- Modify: `services/payroll-service/src/main/java/com/andikisha/payroll/domain/model/PayrollRun.java`
- Modify: `services/payroll-service/src/main/java/com/andikisha/payroll/application/service/PayrollService.java`
- Create: `services/payroll-service/src/main/resources/db/migration/V3__add_skipped_employee_count.sql`

- [ ] **Step 1: Create Flyway migration**

Create `services/payroll-service/src/main/resources/db/migration/V3__add_skipped_employee_count.sql`:

```sql
ALTER TABLE payroll_runs
    ADD COLUMN IF NOT EXISTS skipped_employee_count INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN payroll_runs.skipped_employee_count IS
    'Employees excluded from this run due to gRPC/data fetch failures. Non-zero blocks approval.';
```

- [ ] **Step 2: Add the field and methods to PayrollRun**

In `services/payroll-service/src/main/java/com/andikisha/payroll/domain/model/PayrollRun.java`:

**a.** Add the field after the `notes` field:
```java
    @Column(name = "skipped_employee_count", nullable = false)
    private int skippedEmployeeCount = 0;
```

**b.** Add getter and setter:
```java
    public int getSkippedEmployeeCount() { return skippedEmployeeCount; }

    public void setSkippedEmployeeCount(int count) { this.skippedEmployeeCount = count; }
```

**c.** Update the `approve()` method — add the skip guard BEFORE the empty-run guard:
```java
    public void approve(String approvedBy, LocalDateTime at) {
        if (this.status != PayrollStatus.CALCULATED) {
            throw new BusinessRuleException("Can only approve a CALCULATED payroll");
        }
        if (this.skippedEmployeeCount > 0) {
            throw new BusinessRuleException(
                "SKIPPED_EMPLOYEES",
                this.skippedEmployeeCount + " employee(s) were excluded from this payroll run due to " +
                "data fetch failures. Investigate and recalculate before approving.");
        }
        if (this.employeeCount == 0) {
            throw new BusinessRuleException("Cannot approve an empty payroll run");
        }
        this.approvedBy = approvedBy;
        this.approvedAt = at;
        this.status = PayrollStatus.APPROVED;
    }
```

- [ ] **Step 3: Set skippedEmployeeCount in PayrollService**

In `services/payroll-service/src/main/java/com/andikisha/payroll/application/service/PayrollService.java`, inside the `transactionTemplate.execute()` lambda, before the call to `run.finishCalculation()`, add:

```java
                run.setSkippedEmployeeCount(skipped);
```

The variable `skipped` is computed before the lambda as:
```java
int skipped = employees.size() - salaryData.size();
```
It is effectively final and accessible inside the lambda.

- [ ] **Step 4: Run payroll-service tests**

```bash
./gradlew :services:payroll-service:test --no-daemon -q 2>&1 | tail -15
```
Expected: all pass. The existing `PayrollService` tests that mock the full flow will now exercise the new path.

- [ ] **Step 5: Commit**

```bash
git add services/payroll-service/src/main/java/com/andikisha/payroll/domain/model/PayrollRun.java \
        services/payroll-service/src/main/java/com/andikisha/payroll/application/service/PayrollService.java \
        services/payroll-service/src/main/resources/db/migration/V3__add_skipped_employee_count.sql
git commit -m "fix(payroll): record skipped employee count and block approval when employees were excluded"
```

---

### Task 5: Implement Compliance Audit in PayrollEventListener

**Problem:** `PayrollEventListener.onPayrollProcessed()` in compliance-service is a complete TODO stub. Every payroll run in production completes with zero compliance validation. An incorrect SHIF or Housing Levy rate could go undetected indefinitely.

**Fix:** Enrich `PayrollProcessedEvent` with financial totals from the `PayrollRun`. Implement the listener to verify SHIF (2.75% of gross) and Housing Levy (1.5% of gross) against a 0.5% tolerance, persisting results in a new `compliance_audit_records` table. PAYE and NSSF require per-employee bracket data and are deferred as a separate task.

**Files:**
- Modify: `shared/andikisha-events/src/main/java/com/andikisha/events/payroll/PayrollProcessedEvent.java`
- Modify: `services/payroll-service/src/main/java/com/andikisha/payroll/application/service/PayrollService.java`
- Create: `services/compliance-service/src/main/java/com/andikisha/compliance/domain/model/ComplianceAuditRecord.java`
- Create: `services/compliance-service/src/main/java/com/andikisha/compliance/domain/repository/ComplianceAuditRecordRepository.java`
- Create: `services/compliance-service/src/main/resources/db/migration/V6__create_compliance_audit_records.sql`
- Modify: `services/compliance-service/src/main/java/com/andikisha/compliance/infrastructure/messaging/PayrollEventListener.java`
- Create: `services/compliance-service/src/test/java/com/andikisha/compliance/unit/PayrollEventListenerTest.java`

- [ ] **Step 1: Enrich PayrollProcessedEvent**

Replace `shared/andikisha-events/src/main/java/com/andikisha/events/payroll/PayrollProcessedEvent.java` in full:

```java
package com.andikisha.events.payroll;

import com.andikisha.events.BaseEvent;
import java.math.BigDecimal;

public class PayrollProcessedEvent extends BaseEvent {

    private String payrollRunId;
    private String period;
    private int employeeCount;
    private BigDecimal totalGross;
    private BigDecimal totalPaye;
    private BigDecimal totalNssf;
    private BigDecimal totalShif;
    private BigDecimal totalHousingLevy;
    private BigDecimal totalNet;

    public PayrollProcessedEvent(String tenantId, String payrollRunId, String period,
                                  int employeeCount, BigDecimal totalGross,
                                  BigDecimal totalPaye, BigDecimal totalNssf,
                                  BigDecimal totalShif, BigDecimal totalHousingLevy,
                                  BigDecimal totalNet) {
        super("payroll.processed", tenantId);
        this.payrollRunId    = payrollRunId;
        this.period          = period;
        this.employeeCount   = employeeCount;
        this.totalGross      = totalGross;
        this.totalPaye       = totalPaye;
        this.totalNssf       = totalNssf;
        this.totalShif       = totalShif;
        this.totalHousingLevy = totalHousingLevy;
        this.totalNet        = totalNet;
    }

    protected PayrollProcessedEvent() { super(); }

    public String getPayrollRunId()       { return payrollRunId; }
    public String getPeriod()             { return period; }
    public int getEmployeeCount()         { return employeeCount; }
    public BigDecimal getTotalGross()     { return totalGross; }
    public BigDecimal getTotalPaye()      { return totalPaye; }
    public BigDecimal getTotalNssf()      { return totalNssf; }
    public BigDecimal getTotalShif()      { return totalShif; }
    public BigDecimal getTotalHousingLevy() { return totalHousingLevy; }
    public BigDecimal getTotalNet()       { return totalNet; }
}
```

- [ ] **Step 2: Update PayrollService to publish enriched event**

In `services/payroll-service/src/main/java/com/andikisha/payroll/application/service/PayrollService.java`, find the line that constructs and publishes `PayrollProcessedEvent` (search for `new PayrollProcessedEvent`). Replace it with:

```java
eventPublisher.publishPayrollProcessed(new PayrollProcessedEvent(
        tenantId,
        payrollRunId.toString(),
        period,
        run.getEmployeeCount(),
        run.getTotalGross(),
        run.getTotalPaye(),
        run.getTotalNssf(),
        run.getTotalShif(),
        run.getTotalHousingLevy(),
        run.getTotalNet()
));
```

- [ ] **Step 3: Create Flyway migration**

Create `services/compliance-service/src/main/resources/db/migration/V6__create_compliance_audit_records.sql`:

```sql
CREATE TABLE IF NOT EXISTS compliance_audit_records (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       VARCHAR(255) NOT NULL,
    payroll_run_id  VARCHAR(255) NOT NULL,
    period          VARCHAR(7)   NOT NULL,
    employee_count  INTEGER      NOT NULL DEFAULT 0,
    audit_status    VARCHAR(30)  NOT NULL,
    shif_expected   NUMERIC(15,2),
    shif_actual     NUMERIC(15,2),
    shif_variance   NUMERIC(15,2),
    hl_expected     NUMERIC(15,2),
    hl_actual       NUMERIC(15,2),
    hl_variance     NUMERIC(15,2),
    anomaly_notes   TEXT,
    audited_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    version         BIGINT       NOT NULL DEFAULT 0
);

CREATE INDEX idx_compliance_audit_tenant_period
    ON compliance_audit_records (tenant_id, period);

COMMENT ON TABLE compliance_audit_records IS
    'Automated SHIF and Housing Levy rate audit results per payroll run.';
```

- [ ] **Step 4: Create ComplianceAuditRecord entity**

Create `services/compliance-service/src/main/java/com/andikisha/compliance/domain/model/ComplianceAuditRecord.java`:

```java
package com.andikisha.compliance.domain.model;

import com.andikisha.common.domain.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "compliance_audit_records")
public class ComplianceAuditRecord extends BaseEntity {

    @Column(name = "payroll_run_id", nullable = false)
    private String payrollRunId;

    @Column(name = "period", nullable = false, length = 7)
    private String period;

    @Column(name = "employee_count", nullable = false)
    private int employeeCount;

    @Column(name = "audit_status", nullable = false, length = 30)
    private String auditStatus;

    @Column(name = "shif_expected", precision = 15, scale = 2)
    private BigDecimal shifExpected;

    @Column(name = "shif_actual", precision = 15, scale = 2)
    private BigDecimal shifActual;

    @Column(name = "shif_variance", precision = 15, scale = 2)
    private BigDecimal shifVariance;

    @Column(name = "hl_expected", precision = 15, scale = 2)
    private BigDecimal hlExpected;

    @Column(name = "hl_actual", precision = 15, scale = 2)
    private BigDecimal hlActual;

    @Column(name = "hl_variance", precision = 15, scale = 2)
    private BigDecimal hlVariance;

    @Column(name = "anomaly_notes", columnDefinition = "TEXT")
    private String anomalyNotes;

    @Column(name = "audited_at", nullable = false, updatable = false)
    private Instant auditedAt;

    protected ComplianceAuditRecord() {}

    public static ComplianceAuditRecord create(String tenantId, String payrollRunId, String period,
                                               int employeeCount, String auditStatus,
                                               BigDecimal shifExpected, BigDecimal shifActual,
                                               BigDecimal hlExpected, BigDecimal hlActual,
                                               String anomalyNotes) {
        ComplianceAuditRecord r = new ComplianceAuditRecord();
        r.setTenantId(tenantId);
        r.payrollRunId  = payrollRunId;
        r.period        = period;
        r.employeeCount = employeeCount;
        r.auditStatus   = auditStatus;
        r.shifExpected  = shifExpected;
        r.shifActual    = shifActual;
        r.shifVariance  = (shifActual != null && shifExpected != null)
                ? shifActual.subtract(shifExpected) : null;
        r.hlExpected    = hlExpected;
        r.hlActual      = hlActual;
        r.hlVariance    = (hlActual != null && hlExpected != null)
                ? hlActual.subtract(hlExpected) : null;
        r.anomalyNotes  = anomalyNotes;
        r.auditedAt     = Instant.now();
        return r;
    }

    public String getPayrollRunId()         { return payrollRunId; }
    public String getPeriod()               { return period; }
    public int getEmployeeCount()           { return employeeCount; }
    public String getAuditStatus()          { return auditStatus; }
    public BigDecimal getShifExpected()     { return shifExpected; }
    public BigDecimal getShifActual()       { return shifActual; }
    public BigDecimal getShifVariance()     { return shifVariance; }
    public BigDecimal getHlExpected()       { return hlExpected; }
    public BigDecimal getHlActual()         { return hlActual; }
    public BigDecimal getHlVariance()       { return hlVariance; }
    public String getAnomalyNotes()         { return anomalyNotes; }
    public Instant getAuditedAt()           { return auditedAt; }
}
```

- [ ] **Step 5: Create ComplianceAuditRecordRepository**

Create `services/compliance-service/src/main/java/com/andikisha/compliance/domain/repository/ComplianceAuditRecordRepository.java`:

```java
package com.andikisha.compliance.domain.repository;

import com.andikisha.compliance.domain.model.ComplianceAuditRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ComplianceAuditRecordRepository extends JpaRepository<ComplianceAuditRecord, UUID> {

    List<ComplianceAuditRecord> findByTenantIdAndPeriod(String tenantId, String period);

    boolean existsByTenantIdAndPayrollRunId(String tenantId, String payrollRunId);
}
```

- [ ] **Step 6: Write the unit test first (TDD)**

Create `services/compliance-service/src/test/java/com/andikisha/compliance/unit/PayrollEventListenerTest.java`:

```java
package com.andikisha.compliance.unit;

import com.andikisha.common.tenant.TenantContext;
import com.andikisha.compliance.domain.model.ComplianceAuditRecord;
import com.andikisha.compliance.domain.repository.ComplianceAuditRecordRepository;
import com.andikisha.compliance.infrastructure.messaging.PayrollEventListener;
import com.andikisha.events.payroll.PayrollProcessedEvent;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PayrollEventListenerTest {

    @Mock  ComplianceAuditRecordRepository auditRepository;
    @InjectMocks  PayrollEventListener listener;

    @AfterEach
    void clearTenant() { TenantContext.clear(); }

    private PayrollProcessedEvent event(BigDecimal gross, BigDecimal shif, BigDecimal hl) {
        return new PayrollProcessedEvent(
                "tenant-1", "run-001", "2026-04",
                10, gross,
                new BigDecimal("120000.00"),   // totalPaye
                new BigDecimal("50000.00"),    // totalNssf
                shif, hl,
                new BigDecimal("800000.00")    // totalNet
        );
    }

    @Test
    void whenRatesAreCorrect_auditStatusIsPassed() {
        // SHIF = 2.75% of 1,000,000 = 27,500; HL = 1.5% of 1,000,000 = 15,000
        BigDecimal gross = new BigDecimal("1000000.00");
        when(auditRepository.existsByTenantIdAndPayrollRunId(anyString(), anyString())).thenReturn(false);

        listener.onPayrollProcessed(event(gross, new BigDecimal("27500.00"), new BigDecimal("15000.00")));

        ArgumentCaptor<ComplianceAuditRecord> captor = ArgumentCaptor.forClass(ComplianceAuditRecord.class);
        verify(auditRepository).save(captor.capture());
        assertThat(captor.getValue().getAuditStatus()).isEqualTo("PASSED");
        assertThat(captor.getValue().getAnomalyNotes()).isBlank();
    }

    @Test
    void whenShifRateIsWrong_auditStatusIsFailed() {
        // Wrong SHIF: 20,000 instead of 27,500 (variance = 7,500 > 0.5% tolerance of 5,000)
        BigDecimal gross = new BigDecimal("1000000.00");
        when(auditRepository.existsByTenantIdAndPayrollRunId(anyString(), anyString())).thenReturn(false);

        listener.onPayrollProcessed(event(gross, new BigDecimal("20000.00"), new BigDecimal("15000.00")));

        ArgumentCaptor<ComplianceAuditRecord> captor = ArgumentCaptor.forClass(ComplianceAuditRecord.class);
        verify(auditRepository).save(captor.capture());
        assertThat(captor.getValue().getAuditStatus()).isEqualTo("FAILED");
        assertThat(captor.getValue().getAnomalyNotes()).contains("SHIF anomaly");
    }

    @Test
    void whenHousingLevyRateIsWrong_auditStatusIsFailed() {
        // Wrong HL: 5,000 instead of 15,000 (variance = 10,000 >> 0.5% tolerance of 5,000)
        BigDecimal gross = new BigDecimal("1000000.00");
        when(auditRepository.existsByTenantIdAndPayrollRunId(anyString(), anyString())).thenReturn(false);

        listener.onPayrollProcessed(event(gross, new BigDecimal("27500.00"), new BigDecimal("5000.00")));

        ArgumentCaptor<ComplianceAuditRecord> captor = ArgumentCaptor.forClass(ComplianceAuditRecord.class);
        verify(auditRepository).save(captor.capture());
        assertThat(captor.getValue().getAuditStatus()).isEqualTo("FAILED");
        assertThat(captor.getValue().getAnomalyNotes()).contains("HousingLevy anomaly");
    }

    @Test
    void whenRunAlreadyAudited_skipsDuplicate() {
        when(auditRepository.existsByTenantIdAndPayrollRunId("tenant-1", "run-001")).thenReturn(true);

        listener.onPayrollProcessed(
                event(new BigDecimal("1000000"), new BigDecimal("27500"), new BigDecimal("15000")));

        verify(auditRepository, never()).save(any());
    }

    @Test
    void whenTenantIdMissing_discards() {
        PayrollProcessedEvent bad = new PayrollProcessedEvent(
                null, "run-1", "2026-04", 0,
                BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO,
                BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO
        );
        listener.onPayrollProcessed(bad);
        verify(auditRepository, never()).save(any());
    }

    @Test
    void whenGrossIsZero_skipsAudit() {
        when(auditRepository.existsByTenantIdAndPayrollRunId(anyString(), anyString())).thenReturn(false);

        listener.onPayrollProcessed(event(BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO));

        verify(auditRepository, never()).save(any());
    }
}
```

- [ ] **Step 7: Run the tests — verify they fail (implementation not yet written)**

```bash
./gradlew :services:compliance-service:test \
  --tests "com.andikisha.compliance.unit.PayrollEventListenerTest" \
  --no-daemon -q 2>&1 | tail -15
```
Expected: compilation error or test failures — `PayrollEventListener` constructor doesn't accept `ComplianceAuditRecordRepository` yet.

- [ ] **Step 8: Implement the compliance audit listener**

Replace `services/compliance-service/src/main/java/com/andikisha/compliance/infrastructure/messaging/PayrollEventListener.java` in full:

```java
package com.andikisha.compliance.infrastructure.messaging;

import com.andikisha.common.tenant.TenantContext;
import com.andikisha.compliance.domain.model.ComplianceAuditRecord;
import com.andikisha.compliance.domain.repository.ComplianceAuditRecordRepository;
import com.andikisha.compliance.infrastructure.config.RabbitMqConfig;
import com.andikisha.events.payroll.PayrollProcessedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Component
public class PayrollEventListener {

    private static final Logger log = LoggerFactory.getLogger(PayrollEventListener.class);

    // Statutory rates (Finance Act 2024)
    private static final BigDecimal SHIF_RATE         = new BigDecimal("0.0275");
    private static final BigDecimal HOUSING_LEVY_RATE = new BigDecimal("0.015");

    // Per-employee rounding can produce up to 0.5% aggregate variance — allow it
    private static final BigDecimal TOLERANCE_RATE = new BigDecimal("0.005");

    private final ComplianceAuditRecordRepository auditRepository;

    public PayrollEventListener(ComplianceAuditRecordRepository auditRepository) {
        this.auditRepository = auditRepository;
    }

    @RabbitListener(queues = RabbitMqConfig.COMPLIANCE_PAYROLL_QUEUE)
    @Transactional
    public void onPayrollProcessed(PayrollProcessedEvent event) {
        String tenantId = event.getTenantId();
        if (tenantId == null || tenantId.isBlank()) {
            log.error("Received PayrollProcessedEvent with missing tenantId — discarding. eventId={}",
                    event.getEventId());
            return;
        }
        try {
            TenantContext.setTenantId(tenantId);

            if (auditRepository.existsByTenantIdAndPayrollRunId(tenantId, event.getPayrollRunId())) {
                log.info("Audit already recorded for payrollRunId={} tenant={} — skipping duplicate",
                        event.getPayrollRunId(), tenantId);
                return;
            }

            BigDecimal totalGross = event.getTotalGross();
            if (totalGross == null || totalGross.compareTo(BigDecimal.ZERO) == 0) {
                log.warn("PayrollProcessedEvent has zero totalGross — cannot audit payrollRunId={}",
                        event.getPayrollRunId());
                return;
            }

            BigDecimal shifExpected = totalGross.multiply(SHIF_RATE).setScale(2, RoundingMode.HALF_UP);
            BigDecimal shifActual   = coerce(event.getTotalShif());

            BigDecimal hlExpected = totalGross.multiply(HOUSING_LEVY_RATE).setScale(2, RoundingMode.HALF_UP);
            BigDecimal hlActual   = coerce(event.getTotalHousingLevy());

            boolean shifOk = withinTolerance(shifExpected, shifActual, totalGross);
            boolean hlOk   = withinTolerance(hlExpected,   hlActual,   totalGross);

            String status = (shifOk && hlOk) ? "PASSED" : "FAILED";
            StringBuilder notes = new StringBuilder();
            if (!shifOk) notes.append(String.format(
                    "SHIF anomaly: expected=%.2f actual=%.2f variance=%.2f; ",
                    shifExpected, shifActual, shifActual.subtract(shifExpected)));
            if (!hlOk)  notes.append(String.format(
                    "HousingLevy anomaly: expected=%.2f actual=%.2f variance=%.2f; ",
                    hlExpected, hlActual, hlActual.subtract(hlExpected)));
            if (!notes.isEmpty()) {
                notes.append("Note: PAYE/NSSF validation requires per-employee data (deferred).");
            }

            auditRepository.save(ComplianceAuditRecord.create(
                    tenantId,
                    event.getPayrollRunId(),
                    event.getPeriod(),
                    event.getEmployeeCount(),
                    status,
                    shifExpected, shifActual,
                    hlExpected,   hlActual,
                    notes.toString().trim()
            ));

            if ("FAILED".equals(status)) {
                log.error("COMPLIANCE AUDIT FAILED [tenant={}, run={}, period={}]: {}",
                        tenantId, event.getPayrollRunId(), event.getPeriod(), notes);
            } else {
                log.info("Compliance audit PASSED [tenant={}, run={}, period={}]",
                        tenantId, event.getPayrollRunId(), event.getPeriod());
            }
        } catch (Exception e) {
            log.error("Compliance audit error for payrollRunId={} tenant={}",
                    event.getPayrollRunId(), tenantId, e);
            throw e;
        } finally {
            TenantContext.clear();
        }
    }

    private BigDecimal coerce(BigDecimal value) {
        return (value != null) ? value.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
    }

    private boolean withinTolerance(BigDecimal expected, BigDecimal actual, BigDecimal base) {
        if (expected.compareTo(BigDecimal.ZERO) == 0) return true;
        BigDecimal variance       = actual.subtract(expected).abs();
        BigDecimal toleranceAmount = base.multiply(TOLERANCE_RATE).abs();
        return variance.compareTo(toleranceAmount) <= 0;
    }
}
```

- [ ] **Step 9: Run the compliance-service tests — all must pass**

```bash
./gradlew :services:compliance-service:test --no-daemon -q 2>&1 | tail -15
```
Expected: all pass, including 6 new listener tests.

- [ ] **Step 10: Compile payroll-service to verify enriched event builds**

```bash
./gradlew :shared:andikisha-events:build :services:payroll-service:compileJava --no-daemon -q
```
Expected: compiles with no errors.

- [ ] **Step 11: Commit**

```bash
git add shared/andikisha-events/src/main/java/com/andikisha/events/payroll/PayrollProcessedEvent.java \
        services/payroll-service/src/main/java/com/andikisha/payroll/application/service/PayrollService.java \
        services/compliance-service/src/main/java/com/andikisha/compliance/domain/model/ComplianceAuditRecord.java \
        services/compliance-service/src/main/java/com/andikisha/compliance/domain/repository/ComplianceAuditRecordRepository.java \
        services/compliance-service/src/main/resources/db/migration/V6__create_compliance_audit_records.sql \
        services/compliance-service/src/main/java/com/andikisha/compliance/infrastructure/messaging/PayrollEventListener.java \
        services/compliance-service/src/test/java/com/andikisha/compliance/unit/PayrollEventListenerTest.java
git commit -m "feat(compliance): implement SHIF and Housing Levy rate audit on PayrollProcessedEvent"
```

---

### Task 6: Reject M-Pesa Callbacks from Unauthorized IPs

**Problem:** `/api/v1/callbacks/mpesa/b2c/result` accepts POST from any IP. Anyone who can reach the service and knows a valid `conversationId` can forge a success callback, marking a payment as completed without real Safaricom confirmation. There is no origin validation.

**Fix:** Add a filter that validates the callback source IP against Safaricom's published IP ranges. Requests from unknown IPs are rejected with 403 before they reach the controller.

**Files:**
- Create: `services/integration-hub-service/src/main/java/com/andikisha/integration/presentation/filter/MpesaCallbackAuthFilter.java`
- Modify: `services/integration-hub-service/src/main/resources/application.yml`
- Create: `services/integration-hub-service/src/test/java/com/andikisha/integration/unit/MpesaCallbackAuthFilterTest.java`

- [ ] **Step 1: Add Safaricom IP config to application.yml**

In `services/integration-hub-service/src/main/resources/application.yml`, add under the `app:` key:

```yaml
app:
  mpesa:
    allowed-callback-ips:
      - "196.201.214.200"
      - "196.201.214.206"
      - "196.201.213.114"
      - "196.201.214.207"
      - "196.201.214.208"
      - "175.45.176.0/29"
      - "127.0.0.1"
```

- [ ] **Step 2: Write failing tests first**

Create `services/integration-hub-service/src/test/java/com/andikisha/integration/unit/MpesaCallbackAuthFilterTest.java`:

```java
package com.andikisha.integration.unit;

import com.andikisha.integration.presentation.filter.MpesaCallbackAuthFilter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;

class MpesaCallbackAuthFilterTest {

    private MpesaCallbackAuthFilter filter;

    @BeforeEach
    void setUp() {
        filter = new MpesaCallbackAuthFilter(
                List.of("196.201.214.200", "175.45.176.0/29", "127.0.0.1")
        );
    }

    @Test
    void whenIpIsExactlyAllowed_passesThrough() throws Exception {
        MockHttpServletRequest req = new MockHttpServletRequest("POST", "/api/v1/callbacks/mpesa/b2c/result");
        req.setRemoteAddr("196.201.214.200");
        MockHttpServletResponse res = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(req, res, chain);

        assertThat(chain.getRequest()).isNotNull();
        assertThat(res.getStatus()).isEqualTo(200);
    }

    @Test
    void whenIpIsInCidrRange_passesThrough() throws Exception {
        // 175.45.176.3 is in 175.45.176.0/29 (hosts .1–.6)
        MockHttpServletRequest req = new MockHttpServletRequest("POST", "/api/v1/callbacks/mpesa/b2c/result");
        req.setRemoteAddr("175.45.176.3");
        MockHttpServletResponse res = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(req, res, chain);

        assertThat(res.getStatus()).isEqualTo(200);
    }

    @Test
    void whenIpIsOutsideCidrRange_returns403() throws Exception {
        // 175.45.176.9 is outside 175.45.176.0/29
        MockHttpServletRequest req = new MockHttpServletRequest("POST", "/api/v1/callbacks/mpesa/b2c/result");
        req.setRemoteAddr("175.45.176.9");
        MockHttpServletResponse res = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(req, res, chain);

        assertThat(res.getStatus()).isEqualTo(403);
        assertThat(chain.getRequest()).isNull();
    }

    @Test
    void whenIpIsUnknown_returns403() throws Exception {
        MockHttpServletRequest req = new MockHttpServletRequest("POST", "/api/v1/callbacks/mpesa/b2c/result");
        req.setRemoteAddr("1.2.3.4");
        MockHttpServletResponse res = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(req, res, chain);

        assertThat(res.getStatus()).isEqualTo(403);
        assertThat(chain.getRequest()).isNull();
    }

    @Test
    void nonCallbackPath_isNotFiltered() throws Exception {
        // Filter's shouldNotFilter() returns true for non-callback paths
        MockHttpServletRequest req = new MockHttpServletRequest("GET", "/api/v1/payments");
        req.setRemoteAddr("1.2.3.4");
        MockHttpServletResponse res = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(req, res, chain);

        // shouldNotFilter() makes the filter a no-op — chain is invoked
        assertThat(res.getStatus()).isEqualTo(200);
    }

    @Test
    void xForwardedForHeader_isUsedOverRemoteAddr() throws Exception {
        MockHttpServletRequest req = new MockHttpServletRequest("POST", "/api/v1/callbacks/mpesa/b2c/result");
        req.setRemoteAddr("10.0.0.1");  // private IP (not in allowlist)
        req.addHeader("X-Forwarded-For", "196.201.214.200, 10.0.0.1");  // first entry is Safaricom IP
        MockHttpServletResponse res = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(req, res, chain);

        assertThat(res.getStatus()).isEqualTo(200);
    }
}
```

- [ ] **Step 3: Run the tests — verify they fail (class doesn't exist yet)**

```bash
./gradlew :services:integration-hub-service:test \
  --tests "com.andikisha.integration.unit.MpesaCallbackAuthFilterTest" \
  --no-daemon -q 2>&1 | tail -10
```
Expected: compilation error — `MpesaCallbackAuthFilter` does not exist.

- [ ] **Step 4: Create MpesaCallbackAuthFilter**

Create `services/integration-hub-service/src/main/java/com/andikisha/integration/presentation/filter/MpesaCallbackAuthFilter.java`:

```java
package com.andikisha.integration.presentation.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class MpesaCallbackAuthFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(MpesaCallbackAuthFilter.class);
    private static final String CALLBACK_PREFIX = "/api/v1/callbacks/mpesa/";

    private final List<String> allowedIps;

    public MpesaCallbackAuthFilter(
            @Value("${app.mpesa.allowed-callback-ips}") List<String> allowedIps) {
        this.allowedIps = allowedIps;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith(CALLBACK_PREFIX);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {
        String clientIp = resolveClientIp(request);
        if (!isAllowed(clientIp)) {
            log.warn("M-Pesa callback rejected from unauthorized IP: {}", clientIp);
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Unauthorized callback source");
            return;
        }
        chain.doFilter(request, response);
    }

    private boolean isAllowed(String ip) {
        return allowedIps.stream().anyMatch(entry -> matches(ip, entry));
    }

    private boolean matches(String clientIp, String entry) {
        if (entry.contains("/")) return isInCidr(clientIp, entry);
        return entry.equals(clientIp);
    }

    private boolean isInCidr(String clientIp, String cidr) {
        try {
            String[] parts   = cidr.split("/");
            int prefixLen    = Integer.parseInt(parts[1]);
            int networkBits  = ipToInt(parts[0]);
            int clientBits   = ipToInt(clientIp);
            int mask         = prefixLen == 0 ? 0 : (0xFFFFFFFF << (32 - prefixLen));
            return (networkBits & mask) == (clientBits & mask);
        } catch (Exception e) {
            log.warn("CIDR evaluation failed for clientIp={} cidr={}: {}", clientIp, cidr, e.getMessage());
            return false;
        }
    }

    private int ipToInt(String ip) {
        String[] octets = ip.split("\\.");
        int value = 0;
        for (String octet : octets) value = (value << 8) | Integer.parseInt(octet.trim());
        return value;
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
```

- [ ] **Step 5: Run tests — all must pass**

```bash
./gradlew :services:integration-hub-service:test \
  --tests "com.andikisha.integration.unit.MpesaCallbackAuthFilterTest" \
  --no-daemon -q 2>&1 | tail -15
```
Expected: all 6 tests pass.

- [ ] **Step 6: Run full integration-hub tests for regressions**

```bash
./gradlew :services:integration-hub-service:test --no-daemon -q
```
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add services/integration-hub-service/src/main/java/com/andikisha/integration/presentation/filter/MpesaCallbackAuthFilter.java \
        services/integration-hub-service/src/main/resources/application.yml \
        services/integration-hub-service/src/test/java/com/andikisha/integration/unit/MpesaCallbackAuthFilterTest.java
git commit -m "fix(integration-hub): reject M-Pesa B2C callbacks from IPs not in Safaricom allowlist"
```

---

## Final Verification

After all 6 tasks are complete, run the full build across every affected module.

- [ ] **Full build**

```bash
./gradlew :shared:andikisha-events:build \
  :services:auth-service:build \
  :services:api-gateway:build \
  :services:payroll-service:build \
  :services:compliance-service:build \
  :services:integration-hub-service:build \
  --no-daemon -q 2>&1 | tail -20
```
Expected: `BUILD SUCCESSFUL` across all modules, 0 test failures.

- [ ] **Full test suite**

```bash
./gradlew test --no-daemon -q 2>&1 | grep -E "tests|failures|errors|BUILD"
```
Expected: all tests pass, 0 failures.

---

## SIT Entry Criteria (Post-Plan)

Once this plan is complete, the remaining gate before SIT starts is:

1. Docker Compose spun up with live PostgreSQL + Redis + RabbitMQ and all 13 services start healthy (`/actuator/health` returns UP).
2. A manual smoke test of the primary happy path: register tenant → login → create employee → run payroll → verify compliance audit record created.
3. Super Admin flow verified: login as SUPER_ADMIN → list tenants → suspend → reactivate.
