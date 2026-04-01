plugins {
    `java-library`
    id("com.google.protobuf")
}

val grpcVersion: String by rootProject.extra
val protobufVersion: String by rootProject.extra

dependencies {
    // gRPC stubs and protobuf runtime — exposed as API to consumers
    api("io.grpc:grpc-protobuf:$grpcVersion")
    api("io.grpc:grpc-stub:$grpcVersion")
    api("com.google.protobuf:protobuf-java:$protobufVersion")

    // Required by generated stub code
    compileOnly("jakarta.annotation:jakarta.annotation-api:3.0.0")
}

protobuf {
    protoc {
        artifact = "com.google.protobuf:protoc:$protobufVersion"
    }
    plugins {
        create("grpc") {
            artifact = "io.grpc:protoc-gen-grpc-java:$grpcVersion"
        }
    }
    generateProtoTasks {
        all().forEach { task ->
            task.plugins {
                create("grpc")
            }
        }
    }
}

// Make the generated proto sources visible to IDEs and consumers
sourceSets {
    main {
        java {
            srcDirs(
                "build/generated/source/proto/main/grpc",
                "build/generated/source/proto/main/java"
            )
        }
    }
}
