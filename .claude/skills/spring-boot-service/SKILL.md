---
name: spring-boot-service
description: Patterns and templates for implementing Spring Boot microservices in AndikishaHR. Auto-applies when creating services, controllers, repositories, or configuration classes.
---

# Spring Boot Service Patterns

## Application Class Template

```java
package com.andikisha.{service};

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class {Service}Application {
    public static void main(String[] args) {
        SpringApplication.run({Service}Application.class, args);
    }
}
```

## Service Layer Pattern

```java
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class {Entity}Service {

    private final {Entity}Repository repository;
    private final {Entity}Mapper mapper;
    private final {Entity}EventPublisher eventPublisher;

    public {Entity}Response findById(UUID id) {
        String tenantId = TenantContext.getTenantId();
        return repository.findByIdAndTenantId(id, tenantId)
            .map(mapper::toResponse)
            .orElseThrow(() -> new {Entity}NotFoundException(id));
    }

    public Page<{Entity}Response> findAll(Pageable pageable) {
        String tenantId = TenantContext.getTenantId();
        return repository.findByTenantId(tenantId, pageable)
            .map(mapper::toResponse);
    }

    @Transactional
    public {Entity}Response create(Create{Entity}Request request) {
        String tenantId = TenantContext.getTenantId();
        var entity = {Entity}.create(tenantId, /* fields from request */);
        entity = repository.save(entity);
        eventPublisher.publish{Entity}Created(/* event */);
        return mapper.toResponse(entity);
    }

    @Transactional
    public {Entity}Response update(UUID id, Update{Entity}Request request) {
        String tenantId = TenantContext.getTenantId();
        var entity = repository.findByIdAndTenantId(id, tenantId)
            .orElseThrow(() -> new {Entity}NotFoundException(id));
        entity.update(/* fields from request */);
        entity = repository.save(entity);
        return mapper.toResponse(entity);
    }
}
```

## Controller Pattern

```java
@RestController
@RequestMapping("/api/v1/{entities}")
@RequiredArgsConstructor
@Tag(name = "{Entities}")
public class {Entity}Controller {

    private final {Entity}Service service;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public {Entity}Response create(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @Valid @RequestBody Create{Entity}Request request) {
        TenantContext.setTenantId(tenantId);
        return service.create(request);
    }

    @GetMapping
    public Page<{Entity}Response> list(
            @RequestHeader("X-Tenant-ID") String tenantId,
            Pageable pageable) {
        TenantContext.setTenantId(tenantId);
        return service.findAll(pageable);
    }

    @GetMapping("/{id}")
    public {Entity}Response getById(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @PathVariable UUID id) {
        TenantContext.setTenantId(tenantId);
        return service.findById(id);
    }
}
```

## Exception Handler Pattern

```java
@RestControllerAdvice
@Slf4j
public class {Service}ExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(404)
            .body(new ErrorResponse("NOT_FOUND", ex.getMessage()));
    }

    @ExceptionHandler(BusinessRuleException.class)
    public ResponseEntity<ErrorResponse> handleBusinessRule(BusinessRuleException ex) {
        return ResponseEntity.status(422)
            .body(new ErrorResponse("BUSINESS_RULE_VIOLATION", ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        var errors = ex.getBindingResult().getFieldErrors().stream()
            .map(f -> new ErrorResponse.FieldError(f.getField(), f.getDefaultMessage()))
            .toList();
        return ResponseEntity.badRequest()
            .body(new ErrorResponse("VALIDATION_FAILED", errors));
    }
}
```

## application.yml Template

```yaml
server:
  port: ${SERVER_PORT:80XX}

spring:
  application:
    name: {service-name}
  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:andikisha_{service}}
    username: ${DB_USERNAME:andikisha}
    password: ${DB_PASSWORD:changeme}
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
  jpa:
    hibernate:
      ddl-auto: validate
    open-in-view: false
    properties:
      hibernate:
        format_sql: true
        jdbc.batch_size: 25
        order_inserts: true
        order_updates: true
  flyway:
    enabled: true
    locations: classpath:db/migration
  rabbitmq:
    host: ${RABBITMQ_HOST:localhost}
    port: ${RABBITMQ_PORT:5672}
    username: ${RABBITMQ_USERNAME:andikisha}
    password: ${RABBITMQ_PASSWORD:changeme}
  jackson:
    default-property-inclusion: non_null
    serialization:
      write-dates-as-timestamps: false

grpc:
  server:
    port: ${GRPC_PORT:90XX}

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: when-authorized
      probes:
        enabled: true
```
