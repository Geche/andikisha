plugins {
    id("org.springframework.boot")
    id("io.spring.dependency-management")
    java
}

group = "com.andikisha"
version = "0.1.0-SNAPSHOT"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

val springCloudVersion: String by rootProject.extra

dependencyManagement {
    imports {
        mavenBom("org.springframework.cloud:spring-cloud-dependencies:$springCloudVersion")
    }
}

dependencies {
    implementation("org.springframework.cloud:spring-cloud-starter-gateway")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-actuator")

    // Observability
    implementation("io.micrometer:micrometer-registry-prometheus")

    // Distributed tracing — Micrometer Brave bridge to Zipkin
    implementation("io.micrometer:micrometer-tracing-bridge-brave")
    implementation("io.zipkin.reporter2:zipkin-reporter-brave")

    // Structured JSON logging — Logstash Logback Encoder
    implementation("net.logstash.logback:logstash-logback-encoder:8.0")
    implementation("org.springframework.cloud:spring-cloud-starter-circuitbreaker-reactor-resilience4j")
    implementation("org.springframework.boot:spring-boot-starter-data-redis-reactive")

    // Apple Silicon: native DNS resolver (suppresses macOS UnsatisfiedLinkError on ARM)
    runtimeOnly("io.netty:netty-resolver-dns-native-macos") {
        artifact { classifier = "osx-aarch_64" }
    }

    // Shared common library (RedisKeys, exceptions)
    implementation(project(":shared:andikisha-common"))

    // Shared events (PayrollProcessedEvent for lock release)
    implementation(project(":shared:andikisha-events"))

    // RabbitMQ (async lock release on payroll disbursement completion)
    implementation("org.springframework.boot:spring-boot-starter-amqp")

    // JWT validation
    implementation("io.jsonwebtoken:jjwt-api:${rootProject.extra["jjwtVersion"]}")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:${rootProject.extra["jjwtVersion"]}")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:${rootProject.extra["jjwtVersion"]}")

    // Swagger for Gateway
    implementation("org.springdoc:springdoc-openapi-starter-webflux-ui:2.8.3")

    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("io.projectreactor:reactor-test")
}