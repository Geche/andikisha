plugins {
    `java-library`
}

val springBootVersion: String by rootProject.extra
val lombokVersion: String by rootProject.extra

dependencies {
    // Spring Boot BOM for managed versions
    api(platform("org.springframework.boot:spring-boot-dependencies:$springBootVersion"))

    // Common base types (BaseEvent, TenantContext, etc.)
    api(project(":shared:andikisha-common"))

    // Jackson — events must be serialisable to JSON for RabbitMQ
    api("com.fasterxml.jackson.core:jackson-annotations")
    api("com.fasterxml.jackson.datatype:jackson-datatype-jsr310")

    // Spring AMQP types (MessageConverter, etc.) — compile-time only for event classes
    compileOnly("org.springframework.amqp:spring-amqp")

    // Lombok
    compileOnly("org.projectlombok:lombok:$lombokVersion")
    annotationProcessor("org.projectlombok:lombok:$lombokVersion")
}
