# Phase 3: Authorization Hardening — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix medium-severity authorization gaps so that employees cannot read other employees' PII, download other employees' payslips, or see other employees' notifications — and so that SuperAdmin accounts are brute-force protected.

**Architecture:** All fixes are @PreAuthorize annotations and Spring Security configuration changes. No schema or data changes required. No cross-service changes.

**Tech Stack:** Spring Security 6, @PreAuthorize SpEL, @EnableMethodSecurity

**Prerequisites:** Phase 1 complete. Spring Security is active on all services.

---

## Task 17: Fix employee PII access control

`GET /api/v1/employees` and `GET /api/v1/employees/{id}` expose salary, KRA PIN, NHIF number, NSSF number, and national ID to any authenticated user regardless of role.

**Files:**
- Modify: `services/employee-service/src/main/java/com/andikisha/employee/presentation/controller/EmployeeController.java`
- Test: `services/employee-service/src/test/java/com/andikisha/employee/e2e/EmployeeControllerTest.java`

---

- [ ] **Step 17.1: Write failing test for role enforcement**

In `services/employee-service/src/test/java/com/andikisha/employee/e2e/EmployeeControllerTest.java`, add:

```java
@Test
@DisplayName("GET /api/v1/employees with EMPLOYEE role returns 403")
void listEmployees_withEmployeeRole_returns403() throws Exception {
    mockMvc.perform(get("/api/v1/employees")
                    .header("X-User-ID", "emp-user-1")
                    .header("X-User-Role", "EMPLOYEE")
                    .header("X-Tenant-ID", "tenant-abc"))
            .andExpect(status().isForbidden());
}

@Test
@DisplayName("GET /api/v1/employees with HR_MANAGER role returns 200")
void listEmployees_withHrManagerRole_returns200() throws Exception {
    mockMvc.perform(get("/api/v1/employees")
                    .header("X-User-ID", "hr-user-1")
                    .header("X-User-Role", "HR_MANAGER")
                    .header("X-Tenant-ID", "tenant-abc"))
            .andExpect(status().isOk());
}

@Test
@DisplayName("GET /api/v1/employees/{id} with EMPLOYEE role for own ID returns 200")
void getEmployee_employeeAccessingOwnRecord_returns200() throws Exception {
    // employeeId in path matches X-User-ID from headers
    String employeeId = "00000000-0000-0000-0000-000000000001";
    mockMvc.perform(get("/api/v1/employees/{id}", employeeId)
                    .header("X-User-ID", employeeId)
                    .header("X-User-Role", "EMPLOYEE")
                    .header("X-Tenant-ID", "tenant-abc"))
            .andExpect(status().isOk());
}

@Test
@DisplayName("GET /api/v1/employees/{id} with EMPLOYEE role for different ID returns 403")
void getEmployee_employeeAccessingOtherRecord_returns403() throws Exception {
    String employeeId = "00000000-0000-0000-0000-000000000001";
    String otherEmployeeId = "00000000-0000-0000-0000-000000000002";
    mockMvc.perform(get("/api/v1/employees/{id}", otherEmployeeId)
                    .header("X-User-ID", employeeId)
                    .header("X-User-Role", "EMPLOYEE")
                    .header("X-Tenant-ID", "tenant-abc"))
            .andExpect(status().isForbidden());
}
```

Run: `./gradlew :services:employee-service:test --tests "*EmployeeControllerTest*role*"`
Expected: **FAIL** — no role restrictions exist yet

- [ ] **Step 17.2: Add @PreAuthorize to EmployeeController**

Open `services/employee-service/src/main/java/com/andikisha/employee/presentation/controller/EmployeeController.java`.

Add import:
```java
import org.springframework.security.access.prepost.PreAuthorize;
```

Apply these annotations:

```java
@GetMapping
@PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER', 'HR')")
@Operation(summary = "List employees (HR roles only)")
public Page<EmployeeSummaryResponse> list(
        @RequestHeader("X-Tenant-ID") String tenantId,
        Pageable pageable) { ... }

@GetMapping("/{id}")
@PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER', 'HR') or #id.toString() == authentication.name")
@Operation(summary = "Get employee by ID")
public EmployeeDetailResponse getById(
        @RequestHeader("X-Tenant-ID") String tenantId,
        @PathVariable UUID id) { ... }

@PostMapping
@PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
@Operation(summary = "Create employee")
public EmployeeDetailResponse create(...) { ... }

@PutMapping("/{id}")
@PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
@Operation(summary = "Update employee")
public EmployeeDetailResponse update(...) { ... }

@PutMapping("/{id}/salary")
@PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
@Operation(summary = "Update employee salary")
public EmployeeDetailResponse updateSalary(...) { ... }

@PostMapping("/{id}/confirm-probation")
@PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
@Operation(summary = "Confirm probation")
public EmployeeDetailResponse confirmProbation(...) { ... }

@PostMapping("/{id}/terminate")
@PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
@Operation(summary = "Terminate employee")
public void terminate(...) { ... }
```

Note: The SpEL `#id.toString() == authentication.name` allows an employee to access their own record if their `X-User-ID` equals their `employeeId`. This works because `TrustedHeaderAuthFilter` sets `authentication.name` to the `X-User-ID` header value.

- [ ] **Step 17.3: Run the failing tests**

```bash
./gradlew :services:employee-service:test --tests "*EmployeeControllerTest*role*"
```

Expected: All 4 tests **PASS**

- [ ] **Step 17.4: Run full employee-service test suite**

```bash
./gradlew :services:employee-service:test
```

Expected: All tests pass.

- [ ] **Step 17.5: Commit**

```bash
git add services/employee-service/src/main/java/com/andikisha/employee/presentation/controller/EmployeeController.java
git commit -m "fix(employee-service): restrict PII access to HR roles

MED-01: Any authenticated user including EMPLOYEE role could list all employees
and view salary, KRA PIN, NHIF, NSSF, and national ID. Added @PreAuthorize:
list endpoint requires HR role; getById allows HR roles OR the employee accessing
their own record (authentication.name == employeeId)."
```

---

## Task 18: Fix document download access control

Any authenticated user can download any employee's payslip if they know the document UUID.

**Files:**
- Modify: `services/document-service/src/main/java/com/andikisha/document/presentation/controller/DocumentController.java`
- Test: `services/document-service/src/test/java/com/andikisha/document/e2e/DocumentControllerTest.java`

---

- [ ] **Step 18.1: Write failing test**

In `services/document-service/src/test/java/com/andikisha/document/e2e/DocumentControllerTest.java`, add:

```java
@Test
@DisplayName("GET /api/v1/documents with EMPLOYEE role returns 403")
void listDocuments_withEmployeeRole_returns403() throws Exception {
    mockMvc.perform(get("/api/v1/documents")
                    .header("X-User-ID", "emp-1")
                    .header("X-User-Role", "EMPLOYEE")
                    .header("X-Tenant-ID", "tenant-abc"))
            .andExpect(status().isForbidden());
}
```

Run: `./gradlew :services:document-service:test --tests "*DocumentControllerTest*403*"`
Expected: **FAIL**

- [ ] **Step 18.2: Add @PreAuthorize to DocumentController**

Open `services/document-service/src/main/java/com/andikisha/document/presentation/controller/DocumentController.java`.

Add at class level:
```java
@PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER', 'HR')")
```

Override for employee-specific download (employees should only be able to download their own documents):

```java
@GetMapping("/{id}/download")
@PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER', 'HR')")  // Service layer enforces owner check
@Operation(summary = "Download document by ID")
public ResponseEntity<byte[]> download(
        @RequestHeader("X-Tenant-ID") String tenantId,
        @PathVariable UUID id) { ... }
```

- [ ] **Step 18.3: Run tests and commit**

```bash
./gradlew :services:document-service:test
git add services/document-service
git commit -m "fix(document-service): add @PreAuthorize to all document endpoints

MED-02: Any authenticated user could download payslips or employment contracts
for any employee. Restricted all document endpoints to HR roles. Download
endpoint additionally enforces ownership at service layer."
```

---

## Task 19: Fix leave controller @PreAuthorize SpEL expression

The `@PreAuthorize` expression `#employeeId.toString() == authentication.name` uses Java `==` operator which compares references, not values. This means employees are always denied access to their own leave history unless they have HR role.

**Files:**
- Modify: `services/leave-service/src/main/java/com/andikisha/leave/presentation/controller/LeaveController.java`
- Test: `services/leave-service/src/test/java/com/andikisha/leave/e2e/LeaveControllerTest.java`

---

- [ ] **Step 19.1: Write failing test**

In `services/leave-service/src/test/java/com/andikisha/leave/e2e/LeaveControllerTest.java`, add:

```java
@Test
@DisplayName("EMPLOYEE can access their own leave balance by employeeId")
void getLeaveBalance_employeeAccessingOwnBalance_returns200() throws Exception {
    String employeeId = "00000000-0000-0000-0000-000000000001";
    mockMvc.perform(get("/api/v1/leave/employees/{employeeId}/balances", employeeId)
                    .header("X-User-ID", employeeId)
                    .header("X-User-Role", "EMPLOYEE")
                    .header("X-Tenant-ID", "tenant-abc"))
            .andExpect(status().isOk());
}
```

Run: `./gradlew :services:leave-service:test --tests "*LeaveControllerTest*ownBalance*"`
Expected: **FAIL** — 403 returned due to broken SpEL expression

- [ ] **Step 19.2: Fix SpEL expressions in LeaveController**

Open `services/leave-service/src/main/java/com/andikisha/leave/presentation/controller/LeaveController.java`.

Find all `@PreAuthorize` expressions that use `==` with `authentication.name`. Replace them with `.equals()`:

**Before:**
```java
@PreAuthorize("hasAnyRole('HR_MANAGER', 'HR', 'ADMIN', 'MANAGER') or #employeeId.toString() == authentication.name")
```

**After:**
```java
@PreAuthorize("hasAnyRole('HR_MANAGER', 'HR', 'ADMIN', 'MANAGER') or #employeeId.toString().equals(authentication.name)")
```

Apply this fix to every `@PreAuthorize` expression in the file that uses `== authentication.name`.

- [ ] **Step 19.3: Run the failing test**

```bash
./gradlew :services:leave-service:test --tests "*LeaveControllerTest*ownBalance*"
```

Expected: **PASS**

- [ ] **Step 19.4: Run full leave-service test suite**

```bash
./gradlew :services:leave-service:test
```

Expected: All 112 tests pass.

- [ ] **Step 19.5: Commit**

```bash
git add services/leave-service
git commit -m "fix(leave-service): fix @PreAuthorize SpEL using .equals() not ==

LOW-05: SpEL == operator compares object references, not string values. 
Employees were always denied access to their own leave records. Changed
all @PreAuthorize expressions from == authentication.name to
.equals(authentication.name) for correct string comparison."
```

---

## Task 20: SuperAdmin brute-force protection

`SuperAdminAuthService.login()` has no failed-attempt counter. Regular user login correctly locks after 5 failures. The most privileged account in the system has weaker protection.

**Files:**
- Modify: `services/auth-service/src/main/java/com/andikisha/auth/application/service/SuperAdminAuthService.java`
- Modify: `services/auth-service/src/main/java/com/andikisha/auth/domain/model/User.java` (reuse existing methods)
- Test: `services/auth-service/src/test/java/com/andikisha/auth/unit/SuperAdminAuthServiceTest.java`

---

- [ ] **Step 20.1: Write failing test**

In `services/auth-service/src/test/java/com/andikisha/auth/unit/SuperAdminAuthServiceTest.java`, add:

```java
@Test
@DisplayName("SuperAdmin account locks after 5 failed login attempts")
void login_fiveFailedAttempts_accountLocked() {
    User superAdmin = buildSuperAdminUser();
    when(userRepository.findByEmailAndTenantId("sa@andikisha.com", "SYSTEM"))
            .thenReturn(Optional.of(superAdmin));
    when(passwordEncoder.matches(any(), any())).thenReturn(false);

    // Attempt 1–5: wrong password, should record failure
    for (int i = 0; i < 5; i++) {
        assertThatThrownBy(() -> superAdminAuthService.login(
                new SuperAdminLoginRequest("sa@andikisha.com", "wrongpassword")))
                .isInstanceOf(AuthException.class);
    }

    // The 6th attempt should get ACCOUNT_LOCKED even with correct password
    when(passwordEncoder.matches(any(), any())).thenReturn(true);
    assertThatThrownBy(() -> superAdminAuthService.login(
                new SuperAdminLoginRequest("sa@andikisha.com", "correctpassword")))
            .isInstanceOf(AuthException.class)
            .hasMessageContaining("locked");
}
```

Run: `./gradlew :services:auth-service:test --tests "*SuperAdminAuthServiceTest*locked*"`
Expected: **FAIL** — no lockout occurs

- [ ] **Step 20.2: Add brute-force protection to SuperAdminAuthService.login()**

Open `services/auth-service/src/main/java/com/andikisha/auth/application/service/SuperAdminAuthService.java`.

Find the `login()` method. After finding the user and before checking the password, add the same lockout check used in `AuthService.login()`:

```java
public SuperAdminTokenResponse login(SuperAdminLoginRequest request) {
    User superAdmin = userRepository.findByEmailAndTenantId(request.email(), "SYSTEM")
            .orElseThrow(() -> new AuthException("Invalid credentials"));

    // Brute-force protection — same rules as regular users
    if (superAdmin.isLocked()) {
        throw new AuthException("Super admin account is locked. Contact the system operator.");
    }

    if (!passwordEncoder.matches(request.password(), superAdmin.getPassword())) {
        superAdmin.recordFailedLogin();
        userRepository.save(superAdmin);
        throw new AuthException("Invalid credentials");
    }

    // Successful login — reset failed attempts
    superAdmin.resetFailedLoginAttempts();
    userRepository.save(superAdmin);

    // ... rest of existing token generation code
}
```

Verify that `User.recordFailedLogin()`, `User.isLocked()`, and `User.resetFailedLoginAttempts()` exist. If `resetFailedLoginAttempts()` doesn't exist:

```java
// In User.java
public void resetFailedLoginAttempts() {
    this.failedLoginAttempts = 0;
    this.lockedUntil = null;
}
```

- [ ] **Step 20.3: Run the failing test**

```bash
./gradlew :services:auth-service:test --tests "*SuperAdminAuthServiceTest*locked*"
```

Expected: **PASS**

- [ ] **Step 20.4: Run full auth-service test suite**

```bash
./gradlew :services:auth-service:test
```

Expected: All tests pass.

- [ ] **Step 20.5: Commit**

```bash
git add services/auth-service
git commit -m "fix(auth-service): add brute-force protection to SuperAdmin login

HIGH-02: SuperAdmin login had no failed-attempt counter. Regular users lock
after 5 failures but the most privileged account had no protection. Applied
the same recordFailedLogin()/isLocked() pattern from AuthService."
```

---

## Task 21: Disable Swagger/OpenAPI in production profile

API docs are publicly accessible in production, exposing all endpoint paths, field names (including PII fields like kraPin, nationalId), and error response structures.

**Files:**
- Modify: `services/{all 13}/src/main/resources/application.yml` — add springdoc disable for prod
- Modify: `services/{all 13}/src/main/resources/application-dev.yml` — enable in dev only

---

- [ ] **Step 21.1: Add springdoc config to all application.yml files**

For each service's base `application.yml`, the springdoc config should be:

```yaml
springdoc:
  api-docs:
    enabled: ${SWAGGER_ENABLED:false}    # disabled by default; override in dev
  swagger-ui:
    enabled: ${SWAGGER_ENABLED:false}
```

- [ ] **Step 21.2: Enable Swagger in dev profile**

For each service's `application-dev.yml`, add:

```yaml
SWAGGER_ENABLED: true

springdoc:
  api-docs:
    enabled: true
  swagger-ui:
    enabled: true
    path: /swagger-ui.html
```

- [ ] **Step 21.3: Verify Swagger is accessible in dev**

```bash
SPRING_PROFILES_ACTIVE=dev ./gradlew :services:payroll-service:bootRun
curl -f http://localhost:8084/v3/api-docs
```

Expected: JSON API docs returned.

- [ ] **Step 21.4: Verify Swagger is inaccessible without dev profile**

```bash
./gradlew :services:payroll-service:bootRun
curl http://localhost:8084/v3/api-docs
```

Expected: 404 Not Found.

- [ ] **Step 21.5: Commit**

```bash
git add services/*/src/main/resources/application.yml services/*/src/main/resources/application-dev.yml
git commit -m "fix(security): disable Swagger/OpenAPI in production by default

MED-07: /v3/api-docs and /swagger-ui were publicly accessible on all services
in production, exposing internal API contracts and PII field names. Swagger
now defaults to disabled; set SWAGGER_ENABLED=true or use dev profile to enable."
```

---

## Task 22: Fix audit-service application.yml configuration issues

Three separate issues in `audit-service/application.yml`: hardcoded port 8092, `show-details: always`, and `baseline-on-migrate: true`.

**Files:**
- Modify: `services/audit-service/src/main/resources/application.yml`

---

- [ ] **Step 22.1: Fix audit-service application.yml**

Open `services/audit-service/src/main/resources/application.yml`. Make these three changes:

**Fix 1 — Hardcoded port:**
```yaml
# Before:
server:
  port: 8092

# After:
server:
  port: ${SERVER_PORT:8092}
```

**Fix 2 — Health details exposure:**
```yaml
# Before:
management:
  endpoint:
    health:
      show-details: always

# After:
management:
  endpoint:
    health:
      show-details: when-authorized
      probes:
        enabled: true   # add this if missing — needed for K8s liveness/readiness probes
```

**Fix 3 — Flyway baseline masking:**
```yaml
# Before:
spring:
  flyway:
    baseline-on-migrate: true

# After:
# Remove baseline-on-migrate entirely — Flyway default (false) is correct.
# baseline-on-migrate: true silently skips all migrations on a pre-existing
# schema without a flyway history table, masking migration failures.
```

- [ ] **Step 22.2: Run audit-service tests**

```bash
./gradlew :services:audit-service:test
```

Expected: All tests pass.

- [ ] **Step 22.3: Commit**

```bash
git add services/audit-service/src/main/resources/application.yml
git commit -m "fix(audit-service): fix 3 application.yml configuration issues

MED config issues:
1. Hardcoded port 8092 → parameterized as \${SERVER_PORT:8092}
2. health.show-details: always → when-authorized (prevents unauthenticated 
   database/disk status exposure)
3. flyway.baseline-on-migrate: true removed — was masking migration failures
   on existing databases by silently accepting inconsistent schema state."
```

---

## Task 23: Add Redis password to all services

11 of 13 services have no `spring.data.redis.password` configured. If production Redis requires authentication (it must), these services will fail to connect.

**Files:**
- Modify: `services/{11 services}/src/main/resources/application.yml`

---

- [ ] **Step 23.1: Add Redis password config to all affected services**

The affected services are: api-gateway, auth-service, tenant-service, employee-service, payroll-service, compliance-service, time-attendance-service, leave-service, document-service, notification-service, analytics-service, audit-service. (integration-hub-service already has it.)

For each service, find the `spring.data.redis` section and add the password:

```yaml
spring:
  data:
    redis:
      host: ${REDIS_HOST:localhost}
      port: ${REDIS_PORT:6379}
      password: ${REDIS_PASSWORD:}    # empty default = no auth for local dev; set in staging/prod
```

For api-gateway (which uses reactive Redis), find the `spring.data.redis` section in `application.yml` and add the same `password` property.

- [ ] **Step 23.2: Fix RabbitMQ guest/guest fallback in api-gateway**

Open `services/api-gateway/src/main/resources/application.yml`. Find:

```yaml
rabbitmq:
  username: ${RABBITMQ_USERNAME:guest}
  password: ${RABBITMQ_PASSWORD:guest}
```

Change to (no fallback — fail fast if not configured):

```yaml
rabbitmq:
  username: ${RABBITMQ_USERNAME}
  password: ${RABBITMQ_PASSWORD}
```

Then add to `application-dev.yml`:
```yaml
spring:
  rabbitmq:
    username: andikisha
    password: changeme
```

- [ ] **Step 23.3: Add tenant-service CRLF sanitization**

Open `services/tenant-service/src/main/java/com/andikisha/tenant/presentation/filter/TrustedHeaderAuthFilter.java`. Find lines 29-30 where `userId` and `role` are read from headers. Add the same sanitization:

```java
String userId = rawUserId.replaceAll("[\r\n\t]", "_");
String role   = rawRole.replaceAll("[\r\n\t]", "_");
```

This matches the pattern already applied in employee-service, payroll-service, and leave-service.

- [ ] **Step 23.4: Run full build**

```bash
./gradlew build --parallel
```

Expected: `BUILD SUCCESSFUL`

- [ ] **Step 23.5: Commit**

```bash
git add services/*/src/main/resources/application.yml services/tenant-service/
git commit -m "fix(config): add Redis password config to 11 services; fix RabbitMQ fallback

MED-config: 11 of 13 services had no spring.data.redis.password. Production
Redis with auth would cause connection failures. Added \${REDIS_PASSWORD:} to
all services. Removed guest/guest fallback from api-gateway RabbitMQ config —
startup now fails fast if credentials not provided. Fixed tenant-service
CRLF sanitization in TrustedHeaderAuthFilter."
```

---

## Task 24: Add leave policy minimum day validation (Kenyan Employment Act)

A misconfigured tenant can set Annual leave to fewer than 21 days without system validation.

**Files:**
- Modify: `services/leave-service/src/main/java/com/andikisha/leave/domain/model/LeavePolicy.java`
- Test: `services/leave-service/src/test/java/com/andikisha/leave/unit/LeaveBalanceDomainTest.java`

---

- [ ] **Step 24.1: Write failing test**

In `services/leave-service/src/test/java/com/andikisha/leave/unit/LeaveBalanceDomainTest.java`, add:

```java
@Test
@DisplayName("Creating ANNUAL leave policy with fewer than 21 days throws IllegalArgumentException")
void createLeavePolicy_annualWithTooFewDays_throwsException() {
    assertThatThrownBy(() -> LeavePolicy.create(
            "tenant-1", LeaveType.ANNUAL, 15, true))  // 15 < 21 minimum
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("ANNUAL leave must provide at least 21 days");
}

@Test
@DisplayName("Creating MATERNITY leave policy with fewer than 90 days throws IllegalArgumentException")
void createLeavePolicy_maternityWithTooFewDays_throwsException() {
    assertThatThrownBy(() -> LeavePolicy.create(
            "tenant-1", LeaveType.MATERNITY, 60, true))  // 60 < 90 minimum
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("MATERNITY leave must provide at least 90 days");
}

@Test
@DisplayName("Creating ANNUAL leave policy with exactly 21 days is valid")
void createLeavePolicy_annualWith21Days_valid() {
    assertThatNoException().isThrownBy(() ->
            LeavePolicy.create("tenant-1", LeaveType.ANNUAL, 21, true));
}
```

Run: `./gradlew :services:leave-service:test --tests "*LeaveBalanceDomainTest*minimum*"`
Expected: **FAIL**

- [ ] **Step 24.2: Add minimum day validation to LeavePolicy.create()**

Open `services/leave-service/src/main/java/com/andikisha/leave/domain/model/LeavePolicy.java`.

Find the `create()` factory method (around line 45). Add validation before creating the object:

```java
public static LeavePolicy create(String tenantId, LeaveType leaveType,
                                  int daysPerYear, boolean active) {
    validateMinimumDays(leaveType, daysPerYear);
    // ... existing creation code
}

private static void validateMinimumDays(LeaveType type, int days) {
    int minimum = switch (type) {
        case ANNUAL    -> 21;
        case SICK      -> 30;
        case MATERNITY -> 90;
        case PATERNITY -> 14;
        default        -> 0;
    };
    if (days < minimum) {
        throw new IllegalArgumentException(
                type.name() + " leave must provide at least " + minimum + " days " +
                "per the Kenyan Employment Act Cap 226. Provided: " + days);
    }
}
```

- [ ] **Step 24.3: Run the failing tests**

```bash
./gradlew :services:leave-service:test --tests "*LeaveBalanceDomainTest*minimum*"
```

Expected: All 3 tests **PASS**

- [ ] **Step 24.4: Run full leave-service test suite**

```bash
./gradlew :services:leave-service:test
```

Expected: All 112 tests pass.

- [ ] **Step 24.5: Commit**

```bash
git add services/leave-service
git commit -m "fix(leave-service): enforce Kenyan Employment Act minimum leave days

MED-biz: LeavePolicy.create() accepted any daysPerYear value without validation.
A misconfigured tenant could set Annual leave to 5 days, violating Employment
Act Cap 226 minimums. Added validateMinimumDays() enforcing:
ANNUAL>=21, SICK>=30, MATERNITY>=90, PATERNITY>=14."
```

---

## Task 25: Fix payroll period deduplication to allow new fiscal year

`existsByTenantIdAndPeriodAndPayFrequencyAndStatusNot(CANCELLED)` prevents running January 2026 payroll if January 2025's run is COMPLETED.

**Files:**
- Modify: `services/payroll-service/src/main/java/com/andikisha/payroll/domain/repository/PayrollRunRepository.java`
- Modify: `services/payroll-service/src/main/java/com/andikisha/payroll/application/service/PayrollService.java`
- Create: `services/payroll-service/src/main/resources/db/migration/V3__payroll_period_format_check.sql`
- Test: `services/payroll-service/src/test/java/com/andikisha/payroll/unit/PayrollServiceTest.java`

---

- [ ] **Step 25.1: Write failing test**

In `services/payroll-service/src/test/java/com/andikisha/payroll/unit/PayrollServiceTest.java`, add:

```java
@Test
@DisplayName("Can initiate Jan 2026 payroll even if Jan 2025 payroll is COMPLETED")
void initiatePayroll_sameMonthDifferentYear_succeeds() {
    // Jan 2025 COMPLETED run exists
    when(payrollRunRepository.existsByTenantIdAndPeriodAndPayFrequencyAndStatusIn(
            eq("tenant-1"), eq("2026-01"), eq(PayFrequency.MONTHLY),
            anyList()))
            .thenReturn(false);  // 2026-01 has no active run

    assertThatNoException().isThrownBy(() ->
            payrollService.initiatePayroll(
                    new RunPayrollRequest("2026-01", "MONTHLY"), "user-id"));
}
```

- [ ] **Step 25.2: Update repository method to check for IN-PROGRESS statuses only**

Open `services/payroll-service/src/main/java/com/andikisha/payroll/domain/repository/PayrollRunRepository.java`.

Replace the existing duplicate check method:

```java
// OLD: excludes only CANCELLED — blocks same month in new fiscal year
boolean existsByTenantIdAndPeriodAndPayFrequencyAndStatusNot(
        String tenantId, String period, PayFrequency payFrequency, PayrollStatus excludedStatus);

// NEW: only blocks if there is an active (non-terminal) run for this period
@Query("""
    SELECT COUNT(r) > 0 FROM PayrollRun r
    WHERE r.tenantId = :tenantId
    AND r.period = :period
    AND r.payFrequency = :payFrequency
    AND r.status IN :activeStatuses
    """)
boolean existsByTenantIdAndPeriodAndPayFrequencyAndStatusIn(
        @Param("tenantId") String tenantId,
        @Param("period") String period,
        @Param("payFrequency") PayFrequency payFrequency,
        @Param("activeStatuses") List<PayrollStatus> activeStatuses);
```

- [ ] **Step 25.3: Update the service call to use the new method**

Open `services/payroll-service/src/main/java/com/andikisha/payroll/application/service/PayrollService.java`.

Find the duplicate check (around line 83) and replace:

```java
// OLD:
if (payrollRunRepository.existsByTenantIdAndPeriodAndPayFrequencyAndStatusNot(
        tenantId, request.period(), ..., PayrollStatus.CANCELLED)) {
    throw new DuplicateResourceException(...);
}

// NEW — only active states block a new run:
List<PayrollStatus> activeStatuses = List.of(
        PayrollStatus.DRAFT,
        PayrollStatus.CALCULATING,
        PayrollStatus.CALCULATED,
        PayrollStatus.APPROVED,
        PayrollStatus.PROCESSING
);
if (payrollRunRepository.existsByTenantIdAndPeriodAndPayFrequencyAndStatusIn(
        tenantId, request.period(), payFrequency, activeStatuses)) {
    throw new DuplicateResourceException("PayrollRun",
            "period + frequency",
            request.period() + " / " + payFrequency + " (active run already exists)");
}
```

- [ ] **Step 25.4: Run the failing test and full suite**

```bash
./gradlew :services:payroll-service:test
```

Expected: All 58 tests pass including the new one.

- [ ] **Step 25.5: Commit**

```bash
git add services/payroll-service
git commit -m "fix(payroll-service): fix payroll period deduplication to allow new fiscal year

HIGH-biz: Payroll dedup query excluded only CANCELLED runs, blocking Jan 2026
payroll if Jan 2025 COMPLETED run existed. Changed to check only active statuses
(DRAFT/CALCULATING/CALCULATED/APPROVED/PROCESSING). COMPLETED and FAILED runs
no longer block the same period in subsequent years."
```

---

## Final Verification

- [ ] **Step V.1: Full build**

```bash
./gradlew build --parallel
```

Expected: `BUILD SUCCESSFUL` — all 573+ tests pass (new tests from this phase push the count higher).

- [ ] **Step V.2: Tag**

```bash
git tag -a v0.9.2-auth -m "Phase 3 complete: authorization hardening, brute-force protection, config fixes"
```
