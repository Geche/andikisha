# AndikishaHR — Codebase Review

You are reviewing AndikishaHR, a production-grade Enterprise HR and Payroll SaaS platform built for Kenyan and East African SMEs.

## Stack

- Java 21, Spring Boot 3.4, Spring Cloud 2024.0
- Gradle Kotlin DSL multi-module monorepo
- PostgreSQL 16 with database-per-service and schema-per-tenant multi-tenancy
- RabbitMQ for async domain events, gRPC for synchronous inter-service calls
- Redis for caching and rate limiting
- Flyway for schema migrations
- Spring Data JPA, Hibernate, MapStruct, Lombok
- Next.js 15 (pnpm workspace) for admin-portal and employee-portal frontends

## Project Layout

```
andikisha-microservices/
  shared/andikisha-common/       # BaseEntity, Money, TenantContext, exceptions
  shared/andikisha-proto/        # All .proto definitions
  shared/andikisha-events/       # All RabbitMQ event classes
  services/{service-name}/       # 13 microservices
  infrastructure/docker/
  infrastructure/k8s/
  frontend/admin-portal/
  frontend/employee-portal/
  frontend/landing/
```

## Services (4 phases)

Phase 1 — Foundation: api-gateway (8080), auth-service (8081/9081), employee-service (8082/9082), tenant-service (8083/9083)

Phase 2 — Core HR: payroll-service (8084/9084), compliance-service (8085/9085), time-attendance-service (8086/9086), leave-service (8087/9087)

Phase 3 — Supporting: document-service (8088/9088), notification-service (8089/9089), integration-hub-service (8090/9090)

Phase 4 — Intelligence: analytics-service (8091/9091), audit-service (8092/9092)

Each service follows a strict DDD package layout: `domain/`, `application/`, `infrastructure/`, `presentation/`.

## What to Review

Work through the monorepo and produce a structured report. Cover every area below. Where you find a problem, quote the file path and the specific code, explain what is wrong, and give a concrete fix. Do not generalise. Be direct.

### 1. Architecture

- Does each service own its bounded context? Look for business logic leaking across service boundaries.
- Are gRPC calls used for synchronous operations and RabbitMQ for async lifecycle events? Flag any misuse.
- Does the Compliance Service act as the single source for statutory calculations (PAYE, NSSF, SHIF, Housing Levy, NITA, HELB)? If any other service duplicates this logic, call it out.
- Does the API Gateway forward `X-Tenant-ID`, `X-User-ID`, and `X-User-Role` headers consistently? Do downstream services trust these headers without re-validating the JWT?
- Are domain events typed and consumed by listeners registered against those types — not string-based topic names?

### 2. Code Quality

- Are DTOs and event classes Java records? Are JPA entities free of records?
- Is MapStruct used for DTO mapping, or are there manual mapping methods that should be replaced?
- Are Lombok annotations used consistently, and do any entities misuse `@EqualsAndHashCode` in ways that break JPA identity?
- Does the DDD package structure hold for every service? Flag any deviation.
- Are there dead code paths, unused imports, or TODO comments left in production code?
- Check the 19 `*AsMoney()` accessor methods on the `PaySlip` entity. Verify that `helbAsMoney()` handles nulls consistently with the other 18 methods. Report any discrepancy.

### 3. Security

- Does `JWT_SECRET` appear with a fallback value in any `application.yml` or `application-dev.yml`? This is a critical defect if found.
- Are sensitive credentials (database passwords, API keys, RabbitMQ credentials) free of hardcoded fallbacks in any config file?
- Is the `TenantContext` correctly isolated per request thread? Look for any path where tenant data could leak across threads.
- Are RabbitMQ event publishers sending typed event objects — not raw `Map` objects?
- Review the Integration Hub service. Are Safaricom Daraja API credentials, KRA iTax credentials, and bank API keys handled exclusively via environment variables?
- Are Spring Security method-level annotations (`@PreAuthorize`) applied consistently across controllers? Check against the 7 defined RBAC roles: `SUPER_ADMIN`, `ADMIN`, `HR_MANAGER`, `PAYROLL_OFFICER`, `HR`, `LINE_MANAGER`, `EMPLOYEE`.

### 4. Multi-Tenancy

- Does every repository query filter by the current tenant schema? Look for any query that could return data from the wrong tenant.
- Is `TenantSchemaRoutingDataSource` wired correctly in every service? Check that the schema switch happens before the connection is used — not after.
- Are Flyway migrations scoped per tenant schema, or do they run at the shared schema level? Flag any risk of cross-tenant migration side effects.

### 5. Kenyan Statutory Compliance

- Review the `KenyanTaxCalculator` in the Payroll Service. Verify PAYE bands, NSSF Tier I and Tier II thresholds, SHIF rate, Housing Levy rate, NITA levy, and HELB deduction logic against current KRA and statutory body rates.
- Is the PayrollRun state machine's transition logic sound? Can a payroll run be approved and disbursed without passing through all required states?
- Check that the Compliance Service exposes the compliance rules and rates via gRPC, and that the Payroll Service calls it rather than hardcoding values locally.

### 6. Scalability and Performance

- Are Redis caching annotations (`@Cacheable`, `@CacheEvict`) applied to queries that would otherwise hit the database on every request?
- Are there N+1 query risks in JPA repositories? Look for any `@OneToMany` or `@ManyToOne` relationships loaded without `JOIN FETCH` or explicit `FetchType.LAZY` strategy.
- Does Spring Batch configure appropriate chunk sizes for payroll runs? A full payroll run for a large tenant should not load all employees into memory at once.
- Are gRPC connection pools configured, or is each inter-service call creating a new connection?
- Review RabbitMQ consumer configurations. Are prefetch counts set? Are dead-letter exchanges configured for failed message handling?

### 7. Observability

- Is the Zipkin distributed tracing propagation header (`X-B3-TraceId`, `X-B3-SpanId`) forwarded across gRPC calls and RabbitMQ messages?
- Are structured logs emitting `tenantId`, `userId`, and `traceId` on every log line?
- Are health check endpoints (`/actuator/health`) correctly configured and does each service expose liveness and readiness probes for Kubernetes?

### 8. Testing

- Does each service have unit tests covering domain logic, integration tests using Testcontainers for the database and RabbitMQ, and at least one end-to-end controller test?
- Are gRPC service implementations tested with in-process servers, not just mocks?
- Is there test coverage for the multi-tenant data source routing?

### 9. Frontend

- Do the Next.js applications call the API Gateway — not individual services directly?
- Is the employee-portal correctly configured as a PWA with a service worker? Are the right routes cached for offline use?
- Are environment variables for API base URLs injected at build time and not hardcoded?

### 10. Infrastructure

- Does `docker-compose.infra.yml` have healthcheck blocks on every container?
- Are Kubernetes liveness and readiness probe paths correct for each service?
- Is the Dockerfile using a multi-stage build that produces a minimal runtime image?

## Output Format

Write the report in Markdown. Use a section heading for each of the 10 areas above.

For each finding, write:

- File path
- What the problem is
- Why it matters
- The fix, with code where relevant

Group findings by severity: Critical, Major, Minor.

At the end, write a short summary of the overall health of the codebase — what is working well and what needs the most attention before production.

Do not pad the report. If an area is clean, say so in one sentence and move on.
