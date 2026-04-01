# AndikishaHR - Spring Boot Microservices

You are working on AndikishaHR, an Enterprise HR and Payroll SaaS platform targeting Kenyan and East African SMEs. The backend is a Spring Boot microservices architecture with 13 services.

## Stack

- Java 21 LTS, Spring Boot 3.4, Spring Cloud 2024.0
- Gradle Kotlin DSL (multi-module build)
- PostgreSQL 16 (database-per-service, schema-per-tenant)
- RabbitMQ (async domain events with topic exchanges)
- gRPC (synchronous inter-service communication via grpc-spring-boot-starter)
- Redis (caching, rate limiting, session)
- Flyway (schema migrations)
- Spring Data JPA + Hibernate
- MapStruct (DTO mapping)
- Lombok (boilerplate reduction)
- SpringDoc OpenAPI (API documentation)
- Docker, Kubernetes
- Testcontainers for integration tests

## Architecture

13 microservices across 4 phases:

Phase 1 (Foundation): api-gateway (8080), auth-service (8081/9081), employee-service (8082/9082), tenant-service (8083/9083)
Phase 2 (Core HR): payroll-service (8084/9084), compliance-service (8085/9085), time-attendance-service (8086/9086), leave-service (8087/9087)
Phase 3 (Supporting): document-service (8088/9088), notification-service (8089/9089), integration-hub-service (8090/9090)
Phase 4 (Intelligence): analytics-service (8091/9091), audit-service (8092/9092)

Communication: REST API Gateway (external) -> gRPC (sync internal) -> RabbitMQ (async events)

## Project Structure

```
andikisha-microservices/
  shared/andikisha-common/     # BaseEntity, Money, TenantContext, exceptions
  shared/andikisha-proto/      # All .proto definitions
  shared/andikisha-events/     # All RabbitMQ event classes
  services/{service-name}/     # Each microservice
  infrastructure/docker/       # Docker Compose files
  infrastructure/k8s/          # Kubernetes manifests
```

## Per-Service DDD Package Layout

Every domain service follows this exact structure. Do not deviate.

```
com.andikisha.{service}/
  domain/model/         # Entities, value objects, enums
  domain/repository/    # Spring Data JPA repository interfaces
  domain/exception/     # Domain-specific exceptions
  application/service/  # Business logic, use cases
  application/dto/request/   # Inbound DTOs with Jakarta validation
  application/dto/response/  # Outbound DTOs (Java records)
  application/mapper/   # MapStruct mappers
  application/port/     # Interfaces for infrastructure (event publishers, external clients)
  infrastructure/messaging/  # RabbitMQ publishers and listeners
  infrastructure/grpc/       # gRPC server and client implementations
  infrastructure/config/     # Spring @Configuration classes
  infrastructure/persistence/ # Multi-tenant datasource routing
  presentation/controller/   # REST controllers
  presentation/advice/       # @RestControllerAdvice exception handlers
  presentation/filter/       # Servlet filters (tenant context, logging)
```

## Coding Standards

- Use Java records for DTOs and events. Never use records for JPA entities.
- Entities extend BaseEntity (UUID id, tenantId, createdAt, updatedAt, version).
- Use Money value object for all monetary amounts. Never use raw double or float for money.
- All entities include @Column(name = "tenant_id") and WHERE tenant_id = ? in queries.
- Repository methods must filter by tenantId. Example: findByTenantIdAndStatus(String tenantId, Status status).
- Use constructor injection. Never use field injection with @Autowired.
- Services are @Transactional at class level with readOnly = true, override with @Transactional on write methods.
- Naming: CreateEmployeeRequest, EmployeeResponse, EmployeeService, EmployeeMapper, EmployeeController.
- REST endpoints follow /api/v1/{resource} pattern.
- Use @Valid on request bodies. Validate with Jakarta Bean Validation annotations.
- Flyway migrations: V{number}__{description}.sql (double underscore).
- gRPC services extend the generated *ImplBase class and annotate with @GrpcService.
- RabbitMQ events extend BaseEvent. Publish through port interfaces, not directly in services.
- Tests: unit/ for service logic, integration/ for repositories and gRPC, e2e/ for full HTTP flow.

## Kenya Compliance Context

PAYE brackets (monthly): 0-24K at 10%, 24K-32.3K at 25%, 32.3K-500K at 30%, 500K-800K at 32.5%, 800K+ at 35%.
Personal relief: KES 2,400/month. Insurance relief: 15% of NHIF, max KES 5,000.
NSSF: 6% of gross, Tier I up to KES 7,000, Tier II up to KES 36,000.
SHIF: 2.75% of gross (replaced NHIF October 2024).
Housing Levy: 1.5% employee + 1.5% employer.
Leave: Annual 21 days, Sick 30 days, Maternity 90 days, Paternity 14 days.

## Git Conventions

Branch: feature/{service}-{description}, fix/{service}-{description}, chore/{description}
Commits: feat(employee): add department CRUD, fix(payroll): correct PAYE band 3 calculation
Never commit .env files, application-prod.yml secrets, or build/ directories.

## What Not To Do

- Do not use Spring Modulith. This is a microservices project, not a modular monolith.
- Do not use @Autowired field injection. Use constructor injection.
- Do not use open-in-view (spring.jpa.open-in-view must be false).
- Do not create cross-service database foreign keys. Use UUID references only.
- Do not call external APIs directly from domain services. Route through Integration Hub.
- Do not put business logic in controllers. Controllers delegate to application services.
- Do not use float or double for money. Use BigDecimal with Money value object.
