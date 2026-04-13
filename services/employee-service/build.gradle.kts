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

    // Database
    runtimeOnly("org.postgresql:postgresql")
    implementation("org.flywaydb:flyway-core")
    implementation("org.flywaydb:flyway-database-postgresql")

    // Messaging
    implementation("org.springframework.boot:spring-boot-starter-amqp")

    // gRPC — server (exposes employee data) + client (calls tenant-service)
    implementation("net.devh:grpc-spring-boot-starter:$grpcStarterVersion")

    // Mapping
    implementation("org.mapstruct:mapstruct:$mapstructVersion")
    annotationProcessor("org.projectlombok:lombok:$lombokVersion")
    annotationProcessor("org.projectlombok:lombok-mapstruct-binding:0.2.0")
    annotationProcessor("org.mapstruct:mapstruct-processor:$mapstructVersion")

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
    testImplementation("org.springframework.security:spring-security-test")
    testImplementation("org.springframework.amqp:spring-rabbit-test")
    testImplementation("org.testcontainers:postgresql:$testcontainersVersion")
    testImplementation("org.testcontainers:rabbitmq:$testcontainersVersion")
    testImplementation("org.testcontainers:junit-jupiter:$testcontainersVersion")
}

tasks.withType<Test> {
    val rawSock = "${System.getProperty("user.home")}/Library/Containers/com.docker.docker/Data/docker.raw.sock"
    val fallback = "/var/run/docker.sock"
    val dockerSocket = if (file(rawSock).exists()) rawSock else fallback
    val dockerHost = "unix://$dockerSocket"
    environment("DOCKER_HOST", dockerHost)
    environment("TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE", dockerSocket)
    environment("DOCKER_API_VERSION", "1.41")
    systemProperty("DOCKER_HOST", dockerHost)
    systemProperty("docker.host", dockerHost)
}
