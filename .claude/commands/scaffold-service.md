---
description: Scaffold a new AndikishaHR microservice with the full DDD folder structure, build.gradle.kts, application.yml, Application class, and initial Flyway migration.
---

Create a new microservice for AndikishaHR. The user will provide the service name and a brief description.

## Steps

1. Ask for: service name (e.g. "recruitment-service"), HTTP port, gRPC port, and a one-line description.

2. Create the Gradle build file at services/{service-name}/build.gradle.kts following the template from the existing services (employee-service is the reference). Include dependencies: spring-boot-starter-web, spring-boot-starter-data-jpa, spring-boot-starter-validation, spring-boot-starter-actuator, spring-boot-starter-amqp, grpc-server-spring-boot-starter, grpc-client-spring-boot-starter, postgresql, flyway-core, flyway-database-postgresql, spring-boot-starter-data-redis, mapstruct, springdoc-openapi, lombok, micrometer-registry-prometheus, micrometer-tracing-bridge-otel, and test dependencies.

3. Create the full DDD package structure under services/{service-name}/src/main/java/com/andikisha/{domain}/:
   - domain/model/
   - domain/repository/
   - domain/exception/
   - application/service/
   - application/dto/request/
   - application/dto/response/
   - application/mapper/
   - application/port/
   - infrastructure/messaging/
   - infrastructure/grpc/
   - infrastructure/config/
   - infrastructure/persistence/
   - presentation/controller/
   - presentation/advice/
   - presentation/filter/

4. Create the Spring Boot application class with @SpringBootApplication and @EnableJpaAuditing.

5. Create application.yml with: server port, spring.application.name, datasource config (with ${DB_*} placeholders), JPA config (ddl-auto: validate, open-in-view: false), Flyway config, RabbitMQ config, gRPC server port, and Actuator endpoints.

6. Create application-dev.yml with local dev database URL pointing to localhost.

7. Create application-test.yml for Testcontainers.

8. Create the initial Flyway migration V1__init.sql as an empty placeholder with a comment.

9. Create test directory structure: unit/, integration/, e2e/ under src/test/java/com/andikisha/{domain}/.

10. Create a basic ApplicationTest.java that loads the Spring context.

11. Add the module to the root settings.gradle.kts include() list.

12. Print a summary of everything created.
