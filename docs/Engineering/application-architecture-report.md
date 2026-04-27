# AndikishaHR Application Architecture Report

## 1. Overview

**AndikishaHR** is a Kenyan/East African HR and Payroll SaaS platform built as a Spring Boot microservices monorepo. It targets SMEs and implements full Kenyan statutory compliance (KRA PAYE, NSSF, SHIF, Housing Levy).

**Stack:** Java 21, Spring Boot 3.4, Spring Cloud Gateway, gRPC, RabbitMQ, PostgreSQL 16, Redis, Next.js 15, Tailwind CSS, Docker.

---

## 2. Monorepo Structure

```
andikisha/
├── build.gradle.kts              # Root build (Java 21, Spring Boot 3.4.1)
├── settings.gradle.kts           # 13 services + 3 shared modules
├── gradle.properties             # Version catalog (gRPC 1.63, MapStruct 1.6.3, etc.)
├── services/                     # 13 Spring Boot microservices
├── shared/                       # 3 shared JVM libraries
├── frontend/                     # Next.js 15 pnpm workspace (3 apps + 3 packages)
├── infrastructure/
│   ├── docker/                   # docker-compose.infra.yml, Dockerfile.service
│   └── k8s/                      # Placeholder (empty, Phase 5)
└── docs/                         # Architecture, ADRs, runbooks
```

---

## 3. The 13 Microservices

| Phase | Service | REST | gRPC | Primary Responsibility |
|---|---|---|---|---|
| **Foundation** | api-gateway | 8080 | — | JWT validation, rate limiting, routing |
| | auth-service | 8081 | 9081 | JWT auth, RBAC, refresh tokens, account lockout |
| | employee-service | 8082 | 9082 | Employee registry, departments, positions |
| | tenant-service | 8083 | 9083 | Multi-tenant provisioning, plans |
| **Core HR** | payroll-service | 8084 | 9084 | Payroll runs, Kenyan tax calculation |
| | compliance-service | 8085 | 9085 | Statutory rules, tax brackets |
| | time-attendance-service | 8086 | 9086 | Clock-in/out, work schedules |
| | leave-service | 8087 | 9087 | Leave requests, approvals, balances |
| **Supporting** | document-service | 8088 | 9088 | Document storage & retrieval |
| | notification-service | 8089 | 9089 | Email, SMS, push alerts |
| | integration-hub-service | 8090 | 9090 | M-Pesa, bank transfers, KRA filing |
| **Intelligence** | analytics-service | 8091 | 9091 | Dashboards, reports, read models |
| | audit-service | 8092 | 9092 | Immutable audit log |

---

## 4. Shared Modules

### `shared/andikisha-common`
- **`BaseEntity`**: UUID id, `tenantId`, `createdAt`, `updatedAt`, `version` (optimistic locking)
- **`Money`**: `@Embeddable` value object with `BigDecimal amount` + `String currency` — prevents cross-currency operations
- **`TenantContext`**: `ThreadLocal<String>` for request-scoped tenant isolation
- **Shared exceptions**: `BusinessRuleException`, `ResourceNotFoundException`, `DuplicateResourceException`
- **Validators**: `KenyanIdValidator`, `PhoneNumberValidator`

### `shared/andikisha-proto`
- gRPC definitions for: auth, employee, tenant, payroll, leave, compliance, time-attendance
- `MoneyProto` uses `string` type to preserve BigDecimal precision across the wire
- All request messages carry explicit `tenant_id` field

### `shared/andikisha-events`
- `BaseEvent` with Jackson polymorphic deserialization (`@JsonTypeInfo` / `@JsonSubTypes`)
- Events by domain: employee, payroll, leave, attendance, tenant, auth, document, compliance, notification
- Every event carries: `eventId`, `eventType`, `tenantId`, `timestamp`

---

## 5. Inter-Service Communication

### REST / API Gateway
- Spring Cloud Gateway (WebFlux) validates JWT via OAuth2 Resource Server (`issuer-uri: http://localhost:8081`)
- Routes to all 12 backend services by path prefix (e.g., `/api/v1/payroll/**` -> `http://localhost:8084`)
- Redis-backed rate limiting
- No database — gateway explicitly disables all JPA/DataSource auto-configuration

### gRPC (Synchronous)
- **Server pattern**: Extend generated `*ImplBase`, annotate with `@GrpcService`, extract `tenant_id` from proto request, set/clear `TenantContext` in `try/finally`
- **Client pattern**: Constructor-injected `@GrpcClient("service-name") Channel`, call with explicit `tenant_id` in request
- **Key flows**:
  - Payroll -> Employee (fetch active employees + salary structures)
  - Payroll -> Leave (fetch leave balances for unpaid deduction)
  - Document -> Payroll (fetch payroll data for payslip generation)
  - Any service -> Auth (validate tokens, check permissions)

### RabbitMQ (Asynchronous Events)
- **Publisher pattern**: Implement outbound `port/` interface, defer send to `afterCommit` via `TransactionSynchronizationManager`
- **Listener pattern**: `@RabbitListener`, switch on event type with Java 21 pattern matching, set/clear `TenantContext`
- **Exchanges**: Topic exchanges per domain (`employee.events`, `payroll.events`, etc.) with dead-letter exchanges (`dlx.*`)
- **Idempotency**: Analytics listeners skip if summary already exists for the period

---

## 6. Multi-Tenancy

- **Shared schema, column isolation**: Every table has `tenant_id VARCHAR(50) NOT NULL` with indexes
- **`TenantContext`** (ThreadLocal) populated by `TenantInterceptor` reading `X-Tenant-ID` HTTP header
- **Repository queries** always include `tenantId` filter
- **gRPC**: Explicit `tenant_id` proto field, no implicit ThreadLocal propagation
- **Events**: `BaseEvent.tenantId` explicitly set in listeners
- **Tenant entity**: `companyName`, `country`, `currency`, `kraPin`, `payFrequency`, `payDay`, `trialEndsAt`
  - Status: `TRIAL` (14 days) -> `ACTIVE` / `SUSPENDED` / `CANCELLED`

---

## 7. Domain Models & Business Logic

### Employee Service
- **Employment types**: `PERMANENT`, `CONTRACT`, `CASUAL`, `DIRECTOR`, `INTERN`
- **Status lifecycle**: `ON_PROBATION` (3 months) -> `ACTIVE` -> `TERMINATED`
- Rich entity guards: cannot modify terminated employees, cannot update salary if terminated, `confirmProbation()` only from probation
- **SalaryStructure** (embedded): basicSalary, housingAllowance, transportAllowance, medicalAllowance, otherAllowances — all `Money`
- Auto-generated `employeeNumber`, unique `nationalId`/`phoneNumber` per tenant

### Payroll Service
- **PayrollRun state machine**: `DRAFT` -> `CALCULATING` -> `CALCULATED` -> `APPROVED` -> `PROCESSING` -> `COMPLETED`
- Cannot cancel completed/processing; cannot approve empty payroll
- **KenyanTaxCalculator** (FY 2024/2025):
  | Band | Monthly Range | Rate |
  |---|---|---|
  | 1 | 0 – 24,000 | 10% |
  | 2 | 24,001 – 32,333 | 25% |
  | 3 | 32,334 – 500,000 | 30% |
  | 4 | 500,001 – 800,000 | 32.5% |
  | 5 | Above 800,000 | 35% |
  - Personal relief: KES 2,400/month
  - Insurance relief: 15% of SHIF, max KES 5,000
  - NSSF: 6% of basic, Tier I (≤7K) + Tier II (7K–36K)
  - SHIF: 2.75% of gross (replaced NHIF Oct 2024)
  - Housing Levy: 1.5% employee + 1.5% employer
  - Taxable income = Gross minus NSSF only (Housing Levy not deductible for PAYE)
- **PaySlip** snapshot: ~30 BigDecimal fields, single `currency` column, immutable after creation
- **Unpaid leave deduction**: `basicPay / 22 working days * unpaidDays`
- **3-phase calculation**: Short write TX (mark CALCULATING) -> no TX (fetch via gRPC) -> write TX (build payslips + totals)

### Leave Service
- **Types**: `ANNUAL`, `SICK`, `MATERNITY`, `PATERNITY`, `COMPASSIONATE`, `UNPAID`, `STUDY`
- **Workflow**: `PENDING` -> `APPROVED` / `REJECTED`; HR can `reverse()` approved (restores balance)
- **Default policies** (Kenya Employment Act):
  - Annual: 21 days, carry over 5, requires approval
  - Sick: 30 days, requires medical cert after certain days
  - Maternity: 90 days
  - Paternity: 14 days
- **Balance rules**: `available = accrued + carriedOver - used`
  - Balance deducted only on approval (not submission)
  - Concurrent submissions blocked by pending-day accounting
  - Pro-rated for new hires: `daysPerYear * remainingMonths / 12`
  - Frozen on employee termination

### Time & Attendance Service
- **Sources**: `MANUAL`, `BIOMETRIC`, `MOBILE_GPS`, `WEB`
- **Work schedule default**: 08:00–17:00, 8 hours/day, 5 days/week, 15-minute late threshold
- **Rules**: cannot clock in on leave, cannot double clock-in, clock-out must be after clock-in
- **Late flag**: clock-in > schedule start + 15 minutes
- **Early departure flag**: clock-out < schedule end - 15 minutes
- **Overtime**: hours worked > standard hours per day
- **Monthly summary**: present, absent, leave, holiday, late, early departure, regular/overtime/holiday hours

### Analytics Service (CQRS Read Model)
- Builds materialized views from RabbitMQ events rather than querying other services' DBs
- **EmployeeEventListener**: increments `newHires` / `exits` on `EmployeeCreatedEvent` / `EmployeeTerminatedEvent`
- **PayrollEventListener**: creates `PayrollSummary` snapshot on `PayrollApprovedEvent`
- **AttendanceEventListener**: increments clock-ins on `ClockInEvent`, adds hours on `ClockOutEvent`
- **LeaveEventListener**: increments submissions/approvals/rejections per leave type and period
- **DashboardResponse** aggregates:
  - `HeadcountSummary`: total, active, probation, new hires, exits, by employment type
  - `PayrollCostSummary`: latest period, gross, net, statutory totals, averages, currency
  - `LeaveSummary`: pending, approved, rejected, days taken
  - `AttendanceSummary`: clock-ins today, overtime, absent days

### Auth Service
- **JWT access token**: `sub` (userId), `tenantId`, `email`, `role`, `employeeId`
- **Refresh token**: `sub`, `tenantId`, `type: "refresh"`
- **Roles**: `SUPER_ADMIN`, `ADMIN`, `HR_MANAGER`, `HR_OFFICER`, `PAYROLL_MANAGER`, `PAYROLL_OFFICER`, `FINANCE_OFFICER`, `LINE_MANAGER`, `MANAGER`, `CHIEF_MANAGER`, `CHIEF_OFFICER`, `AUDITOR`, `EMPLOYEE`
- **Permissions**: `resource:action:scope` (e.g., `employee:read:own`)
- `SUPER_ADMIN` / `ADMIN` bypass all permission checks
- **Account lockout**: 5 failed attempts = 30-minute lock
- **Refresh token rotation**: used tokens revoked immediately, new pair issued
- **Password change**: revokes ALL refresh tokens (forces re-login on other devices)

---

## 8. Security Architecture

| Layer | Mechanism |
|---|---|
| **Edge (Gateway)** | JWT validation via Spring OAuth2 Resource Server |
| **Internal (HTTP)** | Trusted header auth: `X-User-ID`, `X-User-Role` set by gateway |
| **Internal (gRPC)** | No mTLS yet; relies on network isolation + explicit tenant_id |
| **Database** | `tenant_id` column on every table, all queries filtered |
| **Events** | `tenantId` explicit on every `BaseEvent` |

---

## 9. Frontend Architecture

**pnpm workspace monorepo:**

| App/Package | Port | Framework | Key Dependencies |
|---|---|---|---|
| `frontend/landing` | 3002 | Next.js 15.5, Tailwind v3 | next-mdx-remote, resend |
| `frontend/admin-portal` | 3000 | Next.js 15.1, Tailwind v4 | Zustand, TanStack Query, Axios, Zod, Recharts, Radix UI |
| `frontend/employee-portal` | 3001 | Next.js 15.1, Tailwind v4 | Same as admin minus Recharts |
| `frontend/packages/ui` | — | Shared components | clsx, tailwind-merge |
| `frontend/packages/api-client` | — | Axios wrapper | JWT interceptor, refresh logic |
| `frontend/packages/shared-types` | — | TypeScript interfaces | DTOs from backend |

**Landing pages:** Home, About, Blog (MDX CMS), Contact, Demo request, Features, Pricing, Privacy, Security, Terms, DPA.

---

## 10. Infrastructure & Deployment

### Docker Compose (`infrastructure/docker/docker-compose.infra.yml`)
- **12 PostgreSQL 16 instances** (one per service), ports 5433–5444
- **RabbitMQ** 3.13-management (AMQP 5672, UI 15672)
- **Redis** 7 (6379)
- **Zipkin** (9411) for distributed tracing

### Dockerfile (`infrastructure/docker/Dockerfile.service`)
- Multi-stage: `eclipse-temurin:21-jdk-alpine` -> `eclipse-temurin:21-jre-alpine`
- Parameterized by `SERVICE_NAME`
- Non-root `appuser`
- Exposes 8080 (REST) + 9090 (gRPC)
- JVM flags: `-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0`

### Kubernetes
- `infrastructure/k8s/` exists with `base/` + `services/` subdirectories
- **All empty** — Phase 5 not started

---

## 11. Testing Strategy

Every service follows a three-layer test structure:

| Layer | Directory | Tools | Scope |
|---|---|---|---|
| **Unit** | `src/test/java/.../unit/` | Mockito, AssertJ | Service logic, domain rules, event listeners |
| **Integration** | `src/test/java/.../integration/` | `@DataJpaTest`, Testcontainers PostgreSQL | Repositories, Flyway migrations, DB queries |
| **E2E** | `src/test/java/.../e2e/` | `@WebMvcTest`, MockMvc | Controllers, tenant header validation, JSON |

**Key testing patterns:**
- `@MockitoBean JpaMetamodelMappingContext` required in `@WebMvcTest` when `@EnableJpaAuditing` is active
- Testcontainers detects macOS Docker Desktop (`~/Library/Containers/...`) vs Linux (`/var/run/docker.sock`)
- `@BeforeEach` sets `TenantContext`; `@AfterEach` clears it
- RabbitMQ tests use `@Testcontainers` + `RabbitMQContainer`

---

## 12. Notable Design Decisions

1. **Polyglot communication**: gRPC for sync data queries, RabbitMQ for async lifecycle events
2. **Transactional event publishing**: RabbitMQ sends deferred to `afterCommit` to prevent phantom events on rollback
3. **Denormalized snapshot entities**: `PaySlip`, `PayrollSummary`, `HeadcountSnapshot` store computed data immutably
4. **Explicit tenant propagation**: No implicit ThreadLocal over gRPC — `tenant_id` is always in the proto request or event payload
5. **Money safety**: `Money` embeddable for JPA, `BigDecimal` for snapshot fields, `string` in protobuf — no `double`/`float` anywhere for money
6. **Schema validation**: `spring.jpa.hibernate.ddl-auto: validate` in production — Flyway owns schema
7. **Constructor injection only**: No `@Autowired` field injection anywhere
8. **Java records for DTOs/events, never for JPA entities**: Entities must extend `BaseEntity` and use Lombok

---

*Report compiled from exhaustive codebase exploration on 2026-04-23.*
