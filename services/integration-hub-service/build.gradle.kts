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
    implementation("org.springframework.boot:spring-boot-starter-webflux") // WebClient for M-Pesa Daraja API
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-actuator")

    // Redis — idempotency keys for M-Pesa B2C callbacks
    implementation("org.springframework.boot:spring-boot-starter-data-redis")

    // Database — transaction log, M-Pesa payment records
    runtimeOnly("org.postgresql:postgresql")
    implementation("org.flywaydb:flyway-core")
    implementation("org.flywaydb:flyway-database-postgresql")

    // Messaging — listens to PayrollRunCompletedEvent to trigger B2C bulk payment
    implementation("org.springframework.boot:spring-boot-starter-amqp")

    // gRPC — server + client (calls payroll-service, employee-service for payment data)
    implementation("net.devh:grpc-spring-boot-starter:$grpcStarterVersion")

    // Resilience4j — retry and circuit breaker for M-Pesa API calls
    implementation("io.github.resilience4j:resilience4j-spring-boot3:2.2.0")
    implementation("io.github.resilience4j:resilience4j-reactor:2.2.0")

    // Mapping
    implementation("org.mapstruct:mapstruct:$mapstructVersion")
    annotationProcessor("org.projectlombok:lombok:$lombokVersion")
    annotationProcessor("org.projectlombok:lombok-mapstruct-binding:0.2.0")
    annotationProcessor("org.mapstruct:mapstruct-processor:$mapstructVersion")
    annotationProcessor("org.springframework.boot:spring-boot-configuration-processor")

    // API docs
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:$springdocVersion")

    // Observability
    implementation("io.micrometer:micrometer-registry-prometheus")

    // Lombok
    compileOnly("org.projectlombok:lombok:$lombokVersion")
    annotationProcessor("org.projectlombok:lombok:$lombokVersion")
    developmentOnly("org.springframework.boot:spring-boot-devtools")

    // Test
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.amqp:spring-rabbit-test")
    testImplementation("io.projectreactor:reactor-test")
    testImplementation("org.testcontainers:postgresql:$testcontainersVersion")
    testImplementation("org.testcontainers:rabbitmq:$testcontainersVersion")
    testImplementation("org.testcontainers:junit-jupiter:$testcontainersVersion")
    testImplementation("com.squareup.okhttp3:mockwebserver:4.12.0") // Mock M-Pesa Daraja API
    testRuntimeOnly("com.h2database:h2")
}
