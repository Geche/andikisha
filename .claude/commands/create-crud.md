---
description: Generate a complete CRUD implementation for a domain entity including entity, repository, service, DTOs, mapper, controller, exception handler, and Flyway migration.
---

Generate a full CRUD stack for a domain entity in an AndikishaHR microservice.

## Inputs Required

Ask the user for:
1. Which service (e.g. employee-service)
2. Entity name (e.g. Department)
3. Fields with types (e.g. name:String, parentId:UUID, description:String)
4. Which fields are required vs optional
5. Any unique constraints

## What To Generate

1. **Entity** (domain/model/{Entity}.java): JPA entity extending BaseEntity, with tenant_id, proper column annotations, factory method for creation, domain methods for updates. Never use public setters.

2. **Repository** (domain/repository/{Entity}Repository.java): Spring Data JPA interface with findByTenantId* methods. Include custom query methods as needed.

3. **Domain Exception** (domain/exception/{Entity}NotFoundException.java): Extends ResourceNotFoundException.

4. **Create Request DTO** (application/dto/request/Create{Entity}Request.java): Java record with Jakarta validation annotations.

5. **Update Request DTO** (application/dto/request/Update{Entity}Request.java): Java record with optional fields.

6. **Response DTO** (application/dto/response/{Entity}Response.java): Java record with all readable fields.

7. **MapStruct Mapper** (application/mapper/{Entity}Mapper.java): Interface with @Mapper annotation, toResponse method.

8. **Service** (application/service/{Entity}Service.java): @Service with @Transactional(readOnly = true) at class level. CRUD methods. Publishes domain events for create/update/delete through the port interface.

9. **Controller** (presentation/controller/{Entity}Controller.java): @RestController with @RequestMapping("/api/v1/{entities}"). Accepts X-Tenant-ID header. Uses @Valid on request bodies. Returns proper HTTP status codes (201 for create, 204 for delete).

10. **Flyway Migration** (resources/db/migration/V{next}_create_{entities}.sql): With tenant_id, all columns, indexes on tenant_id and unique constraints.

11. **Unit Test** (test/unit/{Entity}ServiceTest.java): Mock repository, test each service method.

Follow the exact coding standards from CLAUDE.md. Use constructor injection, records for DTOs, and the Money value object for monetary fields.
