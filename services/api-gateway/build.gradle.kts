plugins {
    java
    id("org.springframework.boot")
    id("io.spring.dependency-management")
}

val springCloudVersion: String by rootProject.extra
val lombokVersion: String by rootProject.extra

dependencies {
    // Spring Cloud Gateway (reactive — WebFlux based)
    implementation("org.springframework.cloud:spring-cloud-starter-gateway")

    // Security — JWT validation at gateway level
    implementation("org.springframework.boot:spring-boot-starter-oauth2-resource-server")

    // Redis — rate limiting and session caching
    implementation("org.springframework.boot:spring-boot-starter-data-redis-reactive")

    // Circuit breaker for downstream service resilience
    implementation("org.springframework.cloud:spring-cloud-starter-circuitbreaker-reactor-resilience4j")

    // Observability
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("io.micrometer:micrometer-registry-prometheus")

    // Lombok
    compileOnly("org.projectlombok:lombok:$lombokVersion")
    annotationProcessor("org.projectlombok:lombok:$lombokVersion")
    annotationProcessor("org.springframework.boot:spring-boot-configuration-processor")

    // Dev
    developmentOnly("org.springframework.boot:spring-boot-devtools")

    // Test
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("io.projectreactor:reactor-test")
}

dependencyManagement {
    imports {
        mavenBom("org.springframework.cloud:spring-cloud-dependencies:$springCloudVersion")
    }
}
