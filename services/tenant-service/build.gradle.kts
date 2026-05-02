plugins {
    java
    id("org.springframework.boot")
    id("io.spring.dependency-management")
}

val mapstructVersion: String by rootProject.extra
val grpcStarterVersion: String by rootProject.extra
val lombokVersion: String by rootProject.extra
val springdocVersion: String by rootProject.extra
val testcontainersVersion: String by rootProject.extra

dependencies {
    // Shared modules
    implementation(project(":shared:andikisha-common"))
    implementation(project(":shared:andikisha-proto"))
    implementation(project(":shared:andikisha-events"))

    // Spring Boot starters
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-actuator")

    // Database — tenant-service also provisions schemas for other services
    runtimeOnly("org.postgresql:postgresql")
    implementation("org.flywaydb:flyway-core")
    implementation("org.flywaydb:flyway-database-postgresql")

    // Messaging — publishes TenantProvisionedEvent, TenantSuspendedEvent
    implementation("org.springframework.boot:spring-boot-starter-amqp")

    // Redis — licence status cache (60s TTL, read by gateway and other services)
    implementation("org.springframework.boot:spring-boot-starter-data-redis")

    // gRPC server — other services call tenant-service to resolve tenantId → schema
    implementation("net.devh:grpc-server-spring-boot-starter:$grpcStarterVersion")

    // gRPC client — calls auth-service to provision the initial admin user
    implementation("net.devh:grpc-client-spring-boot-starter:$grpcStarterVersion")

    // Mapping
    implementation("org.mapstruct:mapstruct:$mapstructVersion")
    annotationProcessor("org.projectlombok:lombok-mapstruct-binding:0.2.0")
    annotationProcessor("org.mapstruct:mapstruct-processor:$mapstructVersion")
    annotationProcessor("org.springframework.boot:spring-boot-configuration-processor")

    // API docs
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:$springdocVersion")

    // Observability
    implementation("io.micrometer:micrometer-registry-prometheus")

    // Distributed tracing — Micrometer Brave bridge to Zipkin
    implementation("io.micrometer:micrometer-tracing-bridge-brave")
    implementation("io.zipkin.reporter2:zipkin-reporter-brave")

    // Structured JSON logging — Logstash Logback Encoder
    implementation("net.logstash.logback:logstash-logback-encoder:8.0")

    // Lombok
    compileOnly("org.projectlombok:lombok:$lombokVersion")
    annotationProcessor("org.projectlombok:lombok:$lombokVersion")
    developmentOnly("org.springframework.boot:spring-boot-devtools")

    // Test
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.security:spring-security-test")
    testImplementation("org.springframework.amqp:spring-rabbit-test")
    testImplementation("org.testcontainers:postgresql:$testcontainersVersion")
    testImplementation("org.testcontainers:rabbitmq:$testcontainersVersion")
    testImplementation("org.testcontainers:junit-jupiter:$testcontainersVersion")
    testRuntimeOnly("com.h2database:h2")
}
