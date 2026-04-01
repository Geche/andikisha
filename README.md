# AndikishaHR

Enterprise HR and Payroll SaaS platform targeting Kenyan and East African SMEs. AndikishaHR provides a full-stack solution for workforce management, statutory compliance, payroll processing, and employee self-service — built as a cloud-native microservices system.

---

## What It Does

AndikishaHR automates the core HR and payroll lifecycle for small and medium enterprises operating under Kenyan and East African employment law:

- **Tenant Management** — Multi-tenant SaaS architecture with full data isolation per organisation. Each tenant gets its own schema.
- **Employee Records** — Centralised employee registry covering personal details, KRA PIN, NSSF/NHIF/SHIF numbers, department, position, employment status, and salary.
- **Payroll Processing** — Automated monthly payroll computation including PAYE, NSSF, SHIF, Housing Levy, and net pay, fully compliant with Kenya Revenue Authority brackets.
- **Kenyan Statutory Compliance** — Real-time enforcement of KRA PAYE bands, NSSF Tier I/II contributions, SHIF (replacing NHIF October 2024), and the Housing Levy (1.5% employee + 1.5% employer).
- **Leave Management** — Policy-driven leave tracking covering annual (21 days), sick (30 days), maternity (90 days), and paternity (14 days) entitlements.
- **Time & Attendance** — Clock-in/out tracking, shift management, and attendance reports.
- **Document Management** — Secure employee document storage and retrieval (contracts, payslips, certificates).
- **Notifications** — Multi-channel alerts for payroll runs, leave approvals, compliance deadlines, and system events.
- **Integration Hub** — Unified gateway for all third-party integrations including M-Pesa B2C bulk salary disbursements via Safaricom Daraja API.
- **Analytics** — Workforce and payroll reporting dashboards for HR managers and executives.
- **Audit Trail** — Immutable event log of all system actions for compliance and accountability.
- **Authentication & Authorisation** — JWT-based auth with RBAC, refresh token rotation, and per-tenant access control.

---

## Architecture

AndikishaHR is a **microservices platform** built on Spring Boot 3.4 and Java 21, with a React/Next.js frontend. Services communicate synchronously via gRPC and asynchronously via RabbitMQ topic exchanges.

```
External Clients
      │
      ▼
 API Gateway (REST :8080)
      │
      ├── gRPC (synchronous inter-service)
      │
      └── RabbitMQ (async domain events)
```

### Backend — 13 Microservices

| Phase | Service | Port | Responsibility |
|-------|---------|------|---------------|
| 1 — Foundation | api-gateway | 8080 | Reverse proxy, rate limiting, request routing |
| 1 — Foundation | auth-service | 8081 / 9081 | JWT auth, refresh tokens, RBAC |
| 1 — Foundation | employee-service | 8082 / 9082 | Employee records, departments |
| 1 — Foundation | tenant-service | 8083 / 9083 | Tenant provisioning, schema-per-tenant |
| 2 — Core HR | payroll-service | 8084 / 9084 | Payroll runs, PAYE/NSSF/SHIF/Housing Levy |
| 2 — Core HR | compliance-service | 8085 / 9085 | Statutory rule enforcement, KRA returns |
| 2 — Core HR | time-attendance-service | 8086 / 9086 | Clock-in/out, shifts, timesheets |
| 2 — Core HR | leave-service | 8087 / 9087 | Leave requests, approvals, balances |
| 3 — Supporting | document-service | 8088 / 9088 | Document storage and retrieval |
| 3 — Supporting | notification-service | 8089 / 9089 | Email, SMS, push notifications |
| 3 — Supporting | integration-hub-service | 8090 / 9090 | M-Pesa Daraja, external API adapters |
| 4 — Intelligence | analytics-service | 8091 / 9091 | Reporting, workforce metrics |
| 4 — Intelligence | audit-service | 8092 / 9092 | Immutable audit log |

Each service runs its own PostgreSQL 16 database with schema-per-tenant isolation managed by Flyway migrations.

### Frontend — 2 Next.js Portals

| Portal | Port | Audience |
|--------|------|---------|
| admin-portal | 3000 | HR managers, payroll officers, system admins |
| employee-portal | 3001 | Employees (self-service: payslips, leave, profile) |

### Shared Frontend Packages

| Package | Purpose |
|---------|---------|
| `@andikisha/shared-types` | TypeScript interfaces shared across both portals (Employee, Auth, Pagination, API errors) |
| `@andikisha/api-client` | Axios instance with JWT interceptor, token refresh, and tenant header injection |
| `@andikisha/ui` | Shared component library (Button, cn utility) built on Tailwind CSS v4 |

---

## Technology Stack

### Backend
| Concern | Technology |
|---------|-----------|
| Language | Java 21 LTS |
| Framework | Spring Boot 3.4, Spring Cloud 2024.0 |
| Build | Gradle Kotlin DSL (multi-module) |
| Database | PostgreSQL 16 |
| Migrations | Flyway |
| ORM | Spring Data JPA + Hibernate |
| Sync comms | gRPC (grpc-spring-boot-starter) |
| Async comms | RabbitMQ (topic exchanges) |
| Caching | Redis |
| Mapping | MapStruct |
| Boilerplate | Lombok |
| API Docs | SpringDoc OpenAPI |
| Testing | JUnit 5, Mockito, Testcontainers |

### Frontend
| Concern | Technology |
|---------|-----------|
| Language | TypeScript 5.7 (strict mode) |
| Framework | Next.js 15.1 (App Router) |
| UI | React 19, Tailwind CSS v4 |
| State | Zustand 5 |
| Data fetching | TanStack Query 5 |
| HTTP | Axios 1.7 |
| Validation | Zod 3 |
| Components | Radix UI primitives, Lucide icons |
| Charts | Recharts 2 |
| Package manager | pnpm 9+ (workspace monorepo) |

---

## Domain Structure

Every backend service follows DDD package layout:

```
com.andikisha.{service}/
  domain/model/           Entities, value objects, enums
  domain/repository/      Spring Data JPA interfaces
  domain/exception/       Domain-specific exceptions
  application/service/    Business logic and use cases
  application/dto/        Request/response DTOs (Java records)
  application/mapper/     MapStruct mappers
  application/port/       Outbound port interfaces
  infrastructure/         RabbitMQ, gRPC, config, persistence
  presentation/           REST controllers, filters, advice
```

---

## Kenyan Compliance

Payroll calculations are implemented to KRA specifications:

| Deduction | Rule |
|-----------|------|
| PAYE | 0–24K @ 10%, 24K–32.3K @ 25%, 32.3K–500K @ 30%, 500K–800K @ 32.5%, 800K+ @ 35%. Personal relief KES 2,400/month |
| NSSF | 6% of gross — Tier I up to KES 7,000, Tier II up to KES 36,000 |
| SHIF | 2.75% of gross (replaced NHIF, effective October 2024) |
| Housing Levy | 1.5% employee + 1.5% employer |

---

## Project Layout

```
andikisha/
  services/                   13 Spring Boot microservices
  shared/
    andikisha-common/          BaseEntity, Money, TenantContext, exceptions
    andikisha-proto/           All .proto definitions
    andikisha-events/          All RabbitMQ event classes
  frontend/
    admin-portal/              Next.js HR admin dashboard
    employee-portal/           Next.js employee self-service portal
    packages/
      api-client/              Shared Axios API client
      shared-types/            Shared TypeScript type definitions
      ui/                      Shared React component library
```
