plugins {
    `java-library`
}

val springBootVersion: String by rootProject.extra
val mapstructVersion: String by rootProject.extra
val lombokVersion: String by rootProject.extra

dependencies {
    // Import Spring Boot BOM so managed versions apply without the plugin
    api(platform("org.springframework.boot:spring-boot-dependencies:$springBootVersion"))

    // Persistence & Validation — exposed as API so services inherit them
    api("jakarta.persistence:jakarta.persistence-api")
    api("jakarta.validation:jakarta.validation-api")
    api("jakarta.servlet:jakarta.servlet-api")

    // Spring Data (Pageable, Page, Sort, @CreatedDate, @LastModifiedDate)
    api("org.springframework.data:spring-data-commons")

    // Spring Data JPA (AuditingEntityListener)
    api("org.springframework.data:spring-data-jpa")

    // Spring Context (ApplicationContext, @Component, etc.)
    api("org.springframework:spring-context")

    // Spring Web (HttpStatus, ResponseStatusException)
    api("org.springframework:spring-web")

    // Spring WebMVC (HandlerInterceptor)
    api("org.springframework:spring-webmvc")

    // JSON serialisation for value objects (Money, etc.)
    api("com.fasterxml.jackson.core:jackson-databind")
    api("com.fasterxml.jackson.datatype:jackson-datatype-jsr310")

    // MapStruct — exposed so services can use it directly
    api("org.mapstruct:mapstruct:$mapstructVersion")

    // Lombok — compile-only
    compileOnly("org.projectlombok:lombok:$lombokVersion")
    annotationProcessor("org.projectlombok:lombok:$lombokVersion")

    testImplementation("org.junit.jupiter:junit-jupiter:5.11.4")
}
