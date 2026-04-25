plugins {
    java
    id("org.springframework.boot") version "3.4.1" apply false
    id("io.spring.dependency-management") version "1.1.7" apply false
    id("com.google.protobuf") version "0.9.4" apply false
}

allprojects {
    group = "com.andikisha"
    version = "0.1.0-SNAPSHOT"

    repositories {
        mavenCentral()
    }
}

// Apply Java toolchain, test config, and Checkstyle to every subproject that uses the java plugin
subprojects {
    plugins.withId("java") {
        apply(plugin = "checkstyle")

        configure<JavaPluginExtension> {
            toolchain {
                languageVersion = JavaLanguageVersion.of(21)
            }
        }

        configure<CheckstyleExtension> {
            toolVersion = "10.21.0"
            configDirectory = rootProject.layout.projectDirectory.dir("config/checkstyle")
            isIgnoreFailures = false
        }

        tasks.withType<Test> {
            useJUnitPlatform()
        }
    }
}

// Expose shared versions to all subprojects via rootProject.extra
extra["springBootVersion"]    = property("springBootVersion")
extra["springCloudVersion"]   = property("springCloudVersion")
extra["grpcVersion"]          = property("grpcVersion")
extra["protobufVersion"]      = property("protobufVersion")
extra["mapstructVersion"]     = property("mapstructVersion")
extra["jjwtVersion"]          = property("jjwtVersion")
extra["grpcStarterVersion"]   = property("grpcStarterVersion")
extra["lombokVersion"]        = property("lombokVersion")
extra["springdocVersion"]     = property("springdocVersion")
extra["testcontainersVersion"]= property("testcontainersVersion")

