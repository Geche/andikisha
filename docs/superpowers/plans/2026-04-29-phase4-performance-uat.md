# Phase 4: Performance, Load Testing & UAT Preparation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate known performance bottlenecks (N+1 gRPC in payroll, Redis compliance caching), add database indexes for audit/analytics, write k6 load tests, validate the end-to-end SIT flow using the Postman collection, and conduct the UAT dry-run.

**Architecture:** Performance improvements are backwards-compatible — batch gRPC replaces N individual calls. Redis caching uses cache-aside pattern with 24-hour TTL. K6 tests run against the full-stack Docker Compose.

**Tech Stack:** gRPC batch RPCs, Spring Cache + Redis, Flyway SQL migrations, k6 (load testing), Postman (SIT)

**Prerequisites:** Phase 1, 2, and 3 must be complete. Full-stack Docker Compose from Phase 2 must be operational.

---

## Task 26: Batch gRPC calls in payroll calculation

For a payroll run with 1,000 employees, the current code makes 2,000 serial gRPC calls (one `GetEmployee` + one `GetLeaveBalance` per employee). This will time out in production.

**Files:**
- Modify: `shared/andikisha-proto/src/main/proto/employee.proto` — add `GetEmployeesBatch` RPC
- Modify: `shared/andikisha-proto/src/main/proto/leave.proto` — add `GetLeaveBalancesBatch` RPC
- Modify: `services/employee-service/src/main/java/com/andikisha/employee/infrastructure/grpc/EmployeeGrpcService.java`
- Modify: `services/leave-service/src/main/java/com/andikisha/leave/infrastructure/grpc/LeaveGrpcService.java`
- Modify: `services/payroll-service/src/main/java/com/andikisha/payroll/infrastructure/grpc/EmployeeGrpcClient.java`
- Modify: `services/payroll-service/src/main/java/com/andikisha/payroll/infrastructure/grpc/LeaveGrpcClient.java`
- Modify: `services/payroll-service/src/main/java/com/andikisha/payroll/application/service/PayrollCalculationService.java`
- Test: `services/payroll-service/src/test/java/com/andikisha/payroll/unit/PayrollCalculationServiceTest.java`

---

- [ ] **Step 26.1: Add batch RPC to employee.proto**

Open `shared/andikisha-proto/src/main/proto/employee.proto`. Add to the `EmployeeService`:

```protobuf
service EmployeeService {
  // ... existing RPCs ...
  rpc GetEmployeesBatch(GetEmployeesBatchRequest) returns (GetEmployeesBatchResponse);
}

message GetEmployeesBatchRequest {
  string tenant_id               = 1;
  repeated string employee_ids   = 2;
}

message GetEmployeesBatchResponse {
  repeated EmployeeProto employees = 1;
}
```

- [ ] **Step 26.2: Add batch RPC to leave.proto**

Open `shared/andikisha-proto/src/main/proto/leave.proto`. Add:

```protobuf
service LeaveService {
  // ... existing RPCs ...
  rpc GetLeaveBalancesBatch(GetLeaveBalancesBatchRequest) returns (GetLeaveBalancesBatchResponse);
}

message GetLeaveBalancesBatchRequest {
  string tenant_id             = 1;
  repeated string employee_ids = 2;
  string period                = 3;   // "YYYY-MM" — used to compute unpaid leave days
}

message GetLeaveBalancesBatchResponse {
  repeated LeaveBalanceSummaryProto balances = 1;
}

message LeaveBalanceSummaryProto {
  string employee_id       = 1;
  double unpaid_leave_days = 2;   // days without pay for this period
}
```

- [ ] **Step 26.3: Regenerate proto stubs**

```bash
./gradlew :shared:andikisha-proto:generateProto
```

Expected: `BUILD SUCCESSFUL`. New batch request/response classes generated.

- [ ] **Step 26.4: Implement GetEmployeesBatch in employee-service EmployeeGrpcService**

Open `services/employee-service/src/main/java/com/andikisha/employee/infrastructure/grpc/EmployeeGrpcService.java`.

Add the batch implementation:

```java
@Override
public void getEmployeesBatch(GetEmployeesBatchRequest request,
                               StreamObserver<GetEmployeesBatchResponse> observer) {
    try {
        TenantContext.setTenantId(request.getTenantId());
        List<UUID> ids = request.getEmployeeIdsList().stream()
                .map(UUID::fromString).toList();

        List<Employee> employees = employeeRepository.findAllByTenantIdAndIdIn(
                request.getTenantId(), ids);

        List<EmployeeProto> protos = employees.stream()
                .map(this::toProto)
                .toList();

        observer.onNext(GetEmployeesBatchResponse.newBuilder()
                .addAllEmployees(protos)
                .build());
        observer.onCompleted();
    } catch (Exception e) {
        log.error("GetEmployeesBatch failed for tenantId={}: {}", request.getTenantId(), e.getMessage());
        observer.onError(io.grpc.Status.INTERNAL.withDescription(e.getMessage()).asRuntimeException());
    } finally {
        TenantContext.clear();
    }
}
```

Add the repository method to `EmployeeRepository`:

```java
List<Employee> findAllByTenantIdAndIdIn(String tenantId, List<UUID> ids);
```

- [ ] **Step 26.5: Implement GetLeaveBalancesBatch in leave-service LeaveGrpcService**

Open `services/leave-service/src/main/java/com/andikisha/leave/infrastructure/grpc/LeaveGrpcService.java`.

Add:

```java
@Override
public void getLeaveBalancesBatch(GetLeaveBalancesBatchRequest request,
                                   StreamObserver<GetLeaveBalancesBatchResponse> observer) {
    try {
        TenantContext.setTenantId(request.getTenantId());
        List<UUID> employeeIds = request.getEmployeeIdsList().stream()
                .map(UUID::fromString).toList();

        List<LeaveBalanceSummaryProto> summaries = employeeIds.stream()
                .map(empId -> {
                    double unpaidDays = leaveBalanceService.getUnpaidLeaveDays(
                            request.getTenantId(), empId, request.getPeriod());
                    return LeaveBalanceSummaryProto.newBuilder()
                            .setEmployeeId(empId.toString())
                            .setUnpaidLeaveDays(unpaidDays)
                            .build();
                }).toList();

        observer.onNext(GetLeaveBalancesBatchResponse.newBuilder()
                .addAllBalances(summaries)
                .build());
        observer.onCompleted();
    } catch (Exception e) {
        observer.onError(io.grpc.Status.INTERNAL.withDescription(e.getMessage()).asRuntimeException());
    } finally {
        TenantContext.clear();
    }
}
```

- [ ] **Step 26.6: Update PayrollCalculationService to use batch calls**

Open `services/payroll-service/src/main/java/com/andikisha/payroll/application/service/PayrollCalculationService.java`.

Find the loop that iterates over employees and calls `employeeGrpcClient.getEmployee()` and `leaveGrpcClient.getLeaveBalance()` per employee. Replace with batch calls:

```java
// Collect all employee IDs first
List<String> employeeIds = employees.stream()
        .map(emp -> emp.getEmployeeId().toString())
        .toList();

// Single batch gRPC call to employee-service
Map<String, EmployeeProto> employeeMap = employeeGrpcClient
        .getEmployeesBatch(tenantId, employeeIds)
        .stream()
        .collect(Collectors.toMap(EmployeeProto::getEmployeeId, e -> e));

// Single batch gRPC call to leave-service
Map<String, Double> unpaidDaysMap = leaveGrpcClient
        .getLeaveBalancesBatch(tenantId, employeeIds, period)
        .stream()
        .collect(Collectors.toMap(LeaveBalanceSummaryProto::getEmployeeId,
                                  LeaveBalanceSummaryProto::getUnpaidLeaveDays));

// Now calculate each payslip using the pre-fetched maps (no more per-employee gRPC calls)
for (PayrollEntry entry : entries) {
    EmployeeProto emp    = employeeMap.get(entry.getEmployeeId().toString());
    double unpaidDays    = unpaidDaysMap.getOrDefault(entry.getEmployeeId().toString(), 0.0);
    // ... existing calculation logic using emp and unpaidDays
}
```

Update `EmployeeGrpcClient` and `LeaveGrpcClient` to add the batch methods that wrap the new gRPC stubs.

- [ ] **Step 26.7: Write performance assertion test**

In `services/payroll-service/src/test/java/com/andikisha/payroll/unit/PayrollCalculationServiceTest.java`, add:

```java
@Test
@DisplayName("Payroll calculation for 100 employees makes exactly 1 employee gRPC call and 1 leave gRPC call")
void calculatePayroll_100employees_makesBatchCalls() {
    // Setup: 100 employees
    List<PayrollEntry> entries = IntStream.range(0, 100)
            .mapToObj(i -> buildPayrollEntry(UUID.randomUUID()))
            .toList();

    when(employeeGrpcClient.getEmployeesBatch(any(), anyList()))
            .thenReturn(buildEmployeeProtos(entries));
    when(leaveGrpcClient.getLeaveBalancesBatch(any(), anyList(), any()))
            .thenReturn(buildLeaveBalances(entries));

    calculationService.calculatePayslips(payrollRun, entries);

    // Verify exactly 1 batch call to each service (not 100 individual calls)
    verify(employeeGrpcClient, times(1)).getEmployeesBatch(any(), anyList());
    verify(leaveGrpcClient, times(1)).getLeaveBalancesBatch(any(), anyList(), any());
    verify(employeeGrpcClient, never()).getEmployee(any(), any());
    verify(leaveGrpcClient, never()).getLeaveBalance(any(), any(), any());
}
```

- [ ] **Step 26.8: Run tests**

```bash
./gradlew :services:payroll-service:test \
          :services:employee-service:test \
          :services:leave-service:test
```

Expected: All tests pass.

- [ ] **Step 26.9: Commit**

```bash
git add shared/andikisha-proto services/payroll-service services/employee-service services/leave-service
git commit -m "perf(payroll): replace N gRPC calls with 2 batch calls for payroll calculation

For a 1000-employee payroll run, the old code made 2000 serial gRPC calls
(1 GetEmployee + 1 GetLeaveBalance per employee). Added GetEmployeesBatch
and GetLeaveBalancesBatch RPCs. PayrollCalculationService now makes exactly
2 gRPC calls regardless of employee count."
```

---

## Task 27: Redis caching for compliance data

Tax brackets and statutory rates are fetched from the DB on every payroll calculation. They change at most once a year. Cache them with a 24-hour TTL.

**Files:**
- Modify: `services/compliance-service/src/main/java/com/andikisha/compliance/application/service/ComplianceService.java`
- Modify: `services/compliance-service/build.gradle.kts` — add Redis
- Modify: `services/compliance-service/src/main/resources/application.yml` — add Redis config
- Modify: `services/compliance-service/src/main/java/com/andikisha/compliance/infrastructure/config/` — add CacheConfig
- Test: `services/compliance-service/src/test/java/com/andikisha/compliance/unit/ComplianceServiceTest.java`

---

- [ ] **Step 27.1: Add Redis dependency to compliance-service**

Open `services/compliance-service/build.gradle.kts`. Add:

```kotlin
implementation("org.springframework.boot:spring-boot-starter-data-redis")
implementation("org.springframework.boot:spring-boot-starter-cache")
```

- [ ] **Step 27.2: Add Redis config to compliance-service application.yml**

Open `services/compliance-service/src/main/resources/application.yml`. Add:

```yaml
spring:
  data:
    redis:
      host: ${REDIS_HOST:localhost}
      port: ${REDIS_PORT:6379}
      password: ${REDIS_PASSWORD:}
  cache:
    type: redis
    redis:
      time-to-live: 86400000   # 24 hours in milliseconds
      cache-null-values: false
```

- [ ] **Step 27.3: Create CacheConfig**

Create `services/compliance-service/src/main/java/com/andikisha/compliance/infrastructure/config/CacheConfig.java`:

```java
package com.andikisha.compliance.infrastructure.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableCaching
public class CacheConfig {
    // Spring Boot auto-configures Redis cache with properties from application.yml.
    // Cache names are declared on @Cacheable annotations in ComplianceService.
}
```

- [ ] **Step 27.4: Add @Cacheable to ComplianceService methods**

Open `services/compliance-service/src/main/java/com/andikisha/compliance/application/service/ComplianceService.java`.

Add `@Cacheable` to the methods that read tax brackets and statutory rates:

```java
import org.springframework.cache.annotation.Cacheable;

@Cacheable(value = "tax-brackets", key = "#countryCode + ':' + #effectiveDate")
public List<TaxBracketResponse> getTaxBrackets(String countryCode, LocalDate effectiveDate) {
    // ... existing implementation
}

@Cacheable(value = "statutory-rates", key = "#countryCode + ':' + #effectiveDate")
public List<StatutoryRateResponse> getStatutoryRates(String countryCode, LocalDate effectiveDate) {
    // ... existing implementation
}
```

Also add `@CacheEvict` to any admin endpoint that updates compliance data:

```java
@CacheEvict(value = {"tax-brackets", "statutory-rates"}, allEntries = true)
@Transactional
public void updateTaxBracket(...) { ... }
```

- [ ] **Step 27.5: Verify caching in test (repository called only once for repeated calls)**

In `services/compliance-service/src/test/java/com/andikisha/compliance/unit/ComplianceServiceTest.java`, add:

```java
@Test
@DisplayName("getTaxBrackets is cached — repository called only once for repeated calls")
void getTaxBrackets_cached_repositoryCalledOnce() {
    LocalDate date = LocalDate.of(2026, 4, 1);
    when(taxBracketRepository.findActiveByCountryAndDate(Country.KE, date))
            .thenReturn(List.of(buildTaxBracket()));

    // Call twice with same args
    service.getTaxBrackets("KE", date);
    service.getTaxBrackets("KE", date);

    // Repository should only be called once (second call hits cache)
    verify(taxBracketRepository, times(1)).findActiveByCountryAndDate(Country.KE, date);
}
```

Note: This test requires `@EnableCaching` and a cache manager in the test context. Use `@SpringBootTest` or configure a simple `ConcurrentMapCacheManager` in the test.

- [ ] **Step 27.6: Run tests**

```bash
./gradlew :services:compliance-service:test
```

Expected: All tests pass.

- [ ] **Step 27.7: Commit**

```bash
git add services/compliance-service
git commit -m "perf(compliance-service): add Redis caching for tax brackets and statutory rates

Tax brackets and NSSF/SHIF/Housing Levy rates were fetched from the DB on every
payroll calculation. These change at most once a year. Added @Cacheable with 24h
TTL. Compliance data is now fetched from DB once per day per country code."
```

---

## Task 28: Database indexes for audit and analytics

Unbounded queries at scale will time out without composite indexes.

**Files:**
- Create: `services/audit-service/src/main/resources/db/migration/V2__add_performance_indexes.sql`
- Create: `services/analytics-service/src/main/resources/db/migration/V5__add_performance_indexes.sql`

---

- [ ] **Step 28.1: Create audit-service performance indexes**

Create `services/audit-service/src/main/resources/db/migration/V2__add_performance_indexes.sql`:

```sql
-- Primary query pattern: list audit entries by tenant, most recent first
CREATE INDEX IF NOT EXISTS idx_audit_entry_tenant_created
    ON audit_entries (tenant_id, created_at DESC);

-- Query by domain (e.g., all PAYROLL events for a tenant)
CREATE INDEX IF NOT EXISTS idx_audit_entry_tenant_domain
    ON audit_entries (tenant_id, domain, created_at DESC);

-- Query by actor (e.g., all actions by a specific user)
CREATE INDEX IF NOT EXISTS idx_audit_entry_tenant_actor
    ON audit_entries (tenant_id, actor_id, created_at DESC);

-- Query by resource (e.g., all events for a specific PayrollRun UUID)
CREATE INDEX IF NOT EXISTS idx_audit_entry_tenant_resource
    ON audit_entries (tenant_id, resource_type, resource_id, created_at DESC);

-- Query by action type
CREATE INDEX IF NOT EXISTS idx_audit_entry_tenant_action
    ON audit_entries (tenant_id, action, created_at DESC);
```

- [ ] **Step 28.2: Create analytics-service performance indexes**

Create `services/analytics-service/src/main/resources/db/migration/V5__add_performance_indexes.sql`:

```sql
-- Payroll trend queries: GROUP BY period for a tenant
CREATE INDEX IF NOT EXISTS idx_payroll_summary_tenant_period
    ON payroll_summaries (tenant_id, period DESC);

-- Headcount trend: snapshots over time
CREATE INDEX IF NOT EXISTS idx_headcount_snapshot_tenant_date
    ON headcount_snapshots (tenant_id, snapshot_date DESC);

-- Leave analytics: breakdown by leave type and period
CREATE INDEX IF NOT EXISTS idx_leave_analytics_tenant_period_type
    ON leave_analytics (tenant_id, period DESC, leave_type);

-- Leave analytics: trend by leave type
CREATE INDEX IF NOT EXISTS idx_leave_analytics_tenant_type_period
    ON leave_analytics (tenant_id, leave_type, period DESC);
```

- [ ] **Step 28.3: Run migration tests**

```bash
./gradlew :services:audit-service:test :services:analytics-service:test
```

Expected: Testcontainers integration tests run the migrations and schema validation passes.

- [ ] **Step 28.4: Commit**

```bash
git add services/audit-service/src/main/resources/db/migration/V2__add_performance_indexes.sql
git add services/analytics-service/src/main/resources/db/migration/V5__add_performance_indexes.sql
git commit -m "perf(db): add composite indexes for audit and analytics query patterns

Unbounded queries on audit_entries and analytics tables would time out at
scale without indexes. Added composite indexes on (tenant_id, created_at DESC)
as the primary access pattern plus domain/actor/resource-specific indexes
for filtered audit queries."
```

---

## Task 29: k6 Load Test — Payroll Approval Flow

The critical performance path is: authenticate → create payroll run → calculate → approve → verify payslips.

**Files:**
- Create: `infrastructure/load-tests/k6/payroll-flow.js`
- Create: `infrastructure/load-tests/k6/config.js`
- Create: `infrastructure/load-tests/README.md`

---

- [ ] **Step 29.1: Create k6 config**

Create `infrastructure/load-tests/k6/config.js`:

```javascript
export const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
export const SUPER_ADMIN_EMAIL = __ENV.SUPER_ADMIN_EMAIL || 'superadmin@andikisha.com';
export const SUPER_ADMIN_PASSWORD = __ENV.SUPER_ADMIN_PASSWORD || 'SuperAdmin@2026!';
export const TENANT_EMAIL = __ENV.TENANT_EMAIL || 'admin@acmekenya.co.ke';
export const TENANT_PASSWORD = __ENV.TENANT_PASSWORD || 'TenantAdmin@2026!';
export const TENANT_ID = __ENV.TENANT_ID || '';  // Set after bootstrap
```

- [ ] **Step 29.2: Create payroll flow k6 test**

Create `infrastructure/load-tests/k6/payroll-flow.js`:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';
import { BASE_URL, TENANT_EMAIL, TENANT_PASSWORD, TENANT_ID } from './config.js';

// Custom metrics
const payrollCalcDuration = new Trend('payroll_calc_duration_ms');
const payrollApprovalRate = new Rate('payroll_approval_success_rate');

export const options = {
    stages: [
        { duration: '30s', target: 5  },    // Ramp up to 5 concurrent users
        { duration: '2m',  target: 20 },    // Sustained load: 20 concurrent users
        { duration: '30s', target: 50 },    // Spike to 50 users
        { duration: '1m',  target: 50 },    // Hold spike for 1 minute
        { duration: '30s', target: 0  },    // Ramp down
    ],
    thresholds: {
        'http_req_duration{scenario:default}': ['p(95)<2000'],    // 95% of requests under 2s
        'http_req_failed': ['rate<0.01'],                          // Less than 1% failures
        'payroll_calc_duration_ms': ['p(95)<10000'],               // Payroll calc under 10s
        'payroll_approval_success_rate': ['rate>0.99'],            // 99%+ approval success
    },
};

function login() {
    const res = http.post(`${BASE_URL}/api/v1/auth/login`,
        JSON.stringify({ email: TENANT_EMAIL, password: TENANT_PASSWORD }),
        { headers: { 'Content-Type': 'application/json', 'X-Tenant-ID': TENANT_ID } }
    );
    check(res, { 'login successful': (r) => r.status === 200 });
    return JSON.parse(res.body).accessToken;
}

export default function () {
    const token = login();
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': TENANT_ID,
    };

    // Step 1: Initiate payroll run
    const runRes = http.post(`${BASE_URL}/api/v1/payroll/runs`,
        JSON.stringify({ period: '2026-04', payFrequency: 'MONTHLY' }),
        { headers }
    );
    check(runRes, { 'payroll initiated': (r) => r.status === 201 });
    if (runRes.status !== 201) return;

    const runId = JSON.parse(runRes.body).id;

    // Step 2: Calculate (most expensive operation)
    const calcStart = Date.now();
    const calcRes = http.post(`${BASE_URL}/api/v1/payroll/runs/${runId}/calculate`,
        null, { headers }
    );
    payrollCalcDuration.add(Date.now() - calcStart);
    check(calcRes, { 'payroll calculated': (r) => r.status === 200 });

    // Step 3: Approve
    const approveRes = http.post(`${BASE_URL}/api/v1/payroll/runs/${runId}/approve`,
        null, { headers }
    );
    const approved = check(approveRes, {
        'payroll approved': (r) => r.status === 200,
        'status is APPROVED': (r) => JSON.parse(r.body).status === 'APPROVED',
    });
    payrollApprovalRate.add(approved);

    // Step 4: Fetch payslips to verify
    const payslipsRes = http.get(`${BASE_URL}/api/v1/payroll/runs/${runId}/payslips`,
        { headers }
    );
    check(payslipsRes, {
        'payslips returned': (r) => r.status === 200,
        'at least 1 payslip': (r) => JSON.parse(r.body).length > 0,
    });

    sleep(1);
}
```

- [ ] **Step 29.3: Create leave flow load test**

Create `infrastructure/load-tests/k6/leave-flow.js`:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, TENANT_ID } from './config.js';

export const options = {
    vus: 50,
    duration: '2m',
    thresholds: {
        'http_req_duration': ['p(95)<1000'],
        'http_req_failed': ['rate<0.01'],
    },
};

function login(email, password) {
    const res = http.post(`${BASE_URL}/api/v1/auth/login`,
        JSON.stringify({ email, password }),
        { headers: { 'Content-Type': 'application/json', 'X-Tenant-ID': TENANT_ID } }
    );
    return JSON.parse(res.body).accessToken;
}

export default function () {
    // Simulate concurrent leave submissions from different employees
    const empEmail = `emp-${__VU}@test.com`;
    const token = login(empEmail, 'Test@2026!');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': TENANT_ID,
    };

    const employeeId = `00000000-0000-0000-0000-${String(__VU).padStart(12, '0')}`;

    // Submit leave request
    const submitRes = http.post(`${BASE_URL}/api/v1/leave/requests`,
        JSON.stringify({
            employeeId,
            leaveType: 'ANNUAL',
            startDate: '2026-06-01',
            endDate: '2026-06-05',
            days: 5,
            reason: 'Load test leave',
        }),
        { headers }
    );
    check(submitRes, { 'leave submitted': (r) => [200, 201, 409].includes(r.status) });

    sleep(0.5);
}
```

- [ ] **Step 29.4: Create load test README**

Create `infrastructure/load-tests/README.md`:

```markdown
# AndikishaHR Load Tests

## Prerequisites
- k6 installed: https://grafana.com/docs/k6/latest/set-up/install-k6/
- Full-stack Docker Compose running: `cd infrastructure/docker && docker compose -f docker-compose.infra.yml -f docker-compose.full.yml up -d`
- Tenant bootstrapped and TENANT_ID set

## Running Tests

### Payroll flow (primary SLA test):
```bash
k6 run \
  -e BASE_URL=http://localhost:8080 \
  -e TENANT_ID=<your-tenant-id> \
  -e TENANT_EMAIL=admin@acmekenya.co.ke \
  -e TENANT_PASSWORD=TenantAdmin@2026! \
  infrastructure/load-tests/k6/payroll-flow.js
```

### Leave flow (concurrent submission stress test):
```bash
k6 run \
  -e BASE_URL=http://localhost:8080 \
  -e TENANT_ID=<your-tenant-id> \
  infrastructure/load-tests/k6/leave-flow.js
```

## Performance Thresholds (Pass/Fail)
| Metric | Threshold |
|--------|-----------|
| 95th percentile response time | < 2,000ms |
| Payroll calculation time (p95) | < 10,000ms |
| Error rate | < 1% |
| Payroll approval success rate | > 99% |
```

- [ ] **Step 29.5: Run load test against local stack**

```bash
# Start full stack first
cd infrastructure/docker
docker compose -f docker-compose.infra.yml -f docker-compose.full.yml up -d

# Wait for all services to be healthy (~2 minutes)
# Run the load test
k6 run -e BASE_URL=http://localhost:8080 -e TENANT_ID=<bootstrapped-tenant-id> \
  infrastructure/load-tests/k6/payroll-flow.js
```

Review results:
- If `p(95) > 10s` for payroll calculation: the batch gRPC optimization from Task 26 may not be enough. Profile the database queries.
- If error rate > 1%: check service logs for exceptions.

- [ ] **Step 29.6: Commit**

```bash
git add infrastructure/load-tests/
git commit -m "test(load): add k6 load tests for payroll and leave flows

Added k6 load tests for the two highest-risk flows:
1. Payroll: login → initiate → calculate → approve → verify payslips
   Threshold: p95 < 2s for API, p95 < 10s for payroll calculation
2. Leave: concurrent submissions from 50 virtual employees
   Threshold: p95 < 1s, error rate < 1%"
```

---

## Task 30: SIT Checklist — End-to-End Validation

Execute the complete SIT flow against the full-stack Docker Compose using the Postman collection from `docs/api-contracts/AndikishaHR-Postman-Collection.json`.

**Prerequisites:**
- Full-stack Docker Compose started: all 13 services healthy
- Postman collection imported
- All environment variables set in Postman: `baseUrl=http://localhost:8080`

---

- [ ] **Step 30.1: Start the full stack**

```bash
cd infrastructure/docker
cp .env.example .env
# Edit .env — set JWT_SECRET to a real base64-encoded 32-byte key
docker compose -f docker-compose.infra.yml -f docker-compose.full.yml up -d
```

Wait until all services are healthy:
```bash
docker compose -f docker-compose.infra.yml -f docker-compose.full.yml ps
```

Expected: All containers show `healthy` status.

- [ ] **Step 30.2: Validate gateway health**

```bash
curl http://localhost:8080/api/v1/gateway/health
```

Expected: JSON response showing all service statuses.

- [ ] **Step 30.3: Run Postman collection — Folder 00 (Bootstrap)**

In Postman, run folder `00 - Bootstrap (Run First)` in sequence.

Verify after each request:
- **Provision Super Admin** → 200/201, `superAdminToken` variable set
- **Super Admin Login** → 200, `superAdminToken` updated
- **List Plans** → 200, at least 1 plan, `planId` set
- **Super Admin - Provision Tenant** → 201, `tenantId` set
- **Tenant User Register** → 201, `tenantToken` set (this now works because CB-07 is fixed)
- **Tenant User Login** → 200, `tenantToken` refreshed

- [ ] **Step 30.4: Run all remaining Postman folders in sequence**

Run folders 01 through 14 in order. For each folder, all requests should return 2xx. Document any failures.

Critical assertions to verify manually:

**Employee creation** (folder 03):
- Employee created with correct department
- Salary amounts stored correctly
- KRA PIN stored in uppercase

**Payroll flow** (folder 04):
- Initiate → 201 with status DRAFT
- Calculate → 200 with status CALCULATED, payslips generated
- Approve → 200 with status APPROVED
- Payslips have non-zero grossPay, paye, nssfContribution, shifContribution, housingLevyEmployee
- Verify SHIF = grossPay × 2.75% (spot check)
- Verify Housing Levy = grossPay × 1.5% (spot check)

**Leave flow** (folder 05):
- Submit leave → 201 with status PENDING
- Approve → 200 with status APPROVED
- Balance deducted (verify via `GET /api/v1/leave/employees/{id}/balances`)
- Reject attempt → verify rejection reason stored
- Manager self-approval attempt → verify 422 returned (CB-10 fix)

**Compliance** (folder 07):
- Kenya tax brackets returned with 5 PAYE bands
- Verify bands: 0-24K@10%, 24K-32.3K@25%, 32.3K-500K@30%

**Audit trail** (folder 12):
- Audit entries created for employee creation, payroll approval, leave approval
- Verify `domain` field is populated (EMPLOYEE, PAYROLL, LEAVE)
- Verify auth required (unauthenticated request → 401)

- [ ] **Step 30.5: Run Newman (CLI) for automated SIT regression**

Install Newman:
```bash
npm install -g newman
```

Run collection programmatically:
```bash
newman run docs/api-contracts/AndikishaHR-Postman-Collection.json \
  --env-var baseUrl=http://localhost:8080 \
  --reporters cli,json \
  --reporter-json-export sit-results.json
```

Expected: Zero test failures. All 2xx assertions pass.

- [ ] **Step 30.6: Document SIT results**

Create `docs/Engineering/sit-results-2026-04-29.md` with:
- Date of SIT execution
- Docker Compose version used
- Total requests executed
- Pass/fail counts
- Any failures with root cause and ticket reference
- Sign-off for UAT

- [ ] **Step 30.7: Final build and tag**

```bash
./gradlew build --parallel
git tag -a v1.0.0-rc1 -m "Release candidate 1: all critical blockers resolved, SIT passed"
```

---

## UAT Preparation Checklist

Before scheduling UAT with stakeholders, verify:

- [ ] **UAT-1:** Super Admin can provision a new tenant and the tenant admin can log in on first attempt
- [ ] **UAT-2:** HR Manager can create employees, run payroll, and see correct KES payslips
- [ ] **UAT-3:** Employee can submit a leave request and check their own leave balance
- [ ] **UAT-4:** HR Manager can approve leave and the balance updates correctly
- [ ] **UAT-5:** Payroll run for April 2026 produces correct PAYE: verify John Kamau (gross KES 120,000) against manual calculation
- [ ] **UAT-6:** M-Pesa disbursement initiates (sandbox) and callback is handled correctly
- [ ] **UAT-7:** PAYE, NSSF, SHIF statutory filings are created after payroll approval
- [ ] **UAT-8:** Audit trail shows all HR actions with timestamps and actor IDs
- [ ] **UAT-9:** Analytics dashboard shows headcount and payroll trend after 2 payroll runs
- [ ] **UAT-10:** An employee cannot view another employee's salary or download another employee's payslip

---

## Kenyan Payroll Manual Verification

For UAT-5, use this calculation to cross-check John Kamau (gross KES 120,000):

```
Gross Pay:           120,000.00

NSSF:
  Tier I (0-7,000):  7,000 × 6%   =   420.00
  Tier II (7K-36K):  29,000 × 6%  = 1,740.00
  Total NSSF:                        2,160.00

SHIF:                120,000 × 2.75% = 3,300.00

Housing Levy (Employee): 120,000 × 1.5% = 1,800.00

Taxable Income = Gross - NSSF - AHL employee portion
               = 120,000 - 2,160 - 1,800 = 116,040.00

PAYE on 116,040:
  0     - 24,000: 24,000 × 10%   =  2,400.00
  24,001 - 32,333: 8,333 × 25%   =  2,083.25
  32,334 - 116,040: 83,706 × 30% = 25,111.80
  Gross PAYE:                       29,595.05
  Less personal relief:             -2,400.00
  PAYE:                             27,195.05

Net Pay = 120,000 - 2,160 - 3,300 - 1,800 - 27,195.05
        = 85,544.95
```

The system payslip must match within KES 1.00 (rounding tolerance).
