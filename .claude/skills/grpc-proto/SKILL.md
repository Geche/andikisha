---
name: grpc-proto
description: gRPC and Protocol Buffer patterns for AndikishaHR inter-service communication. Auto-applies when writing .proto files, gRPC server implementations, or gRPC client wrappers.
---

# gRPC Patterns

## Proto File Conventions

- All protos in shared/andikisha-proto/src/main/proto/
- java_package: com.andikisha.proto.{domain}
- java_multiple_files: true
- One proto file per service domain (employee.proto, payroll.proto, etc.)

## Proto Template

```protobuf
syntax = "proto3";
package {domain};

option java_package = "com.andikisha.proto.{domain}";
option java_multiple_files = true;

import "google/protobuf/timestamp.proto";

service {Domain}Service {
  rpc Get{Entity}(Get{Entity}Request) returns ({Entity}Response);
  rpc List{Entities}(List{Entities}Request) returns (List{Entities}Response);
}

message Get{Entity}Request {
  string tenant_id = 1;
  string {entity}_id = 2;
}

message {Entity}Response {
  string id = 1;
  string tenant_id = 2;
  // domain fields
}

message List{Entities}Request {
  string tenant_id = 1;
  int32 page = 2;
  int32 size = 3;
}

message List{Entities}Response {
  repeated {Entity}Response items = 1;
  int32 total_count = 2;
}
```

## gRPC Server Pattern

```java
@GrpcService
@RequiredArgsConstructor
public class {Entity}GrpcService extends {Entity}ServiceGrpc.{Entity}ServiceImplBase {

    private final {Entity}QueryService queryService;

    @Override
    public void get{Entity}(Get{Entity}Request request,
            StreamObserver<{Entity}Response> observer) {
        TenantContext.setTenantId(request.getTenantId());
        try {
            var dto = queryService.findById(UUID.fromString(request.get{Entity}Id()));
            observer.onNext(toProto(dto));
            observer.onCompleted();
        } catch (ResourceNotFoundException e) {
            observer.onError(Status.NOT_FOUND.withDescription(e.getMessage()).asException());
        } finally {
            TenantContext.clear();
        }
    }
}
```

## gRPC Client Pattern

```java
@Component
public class {Entity}GrpcClient {
    private final {Entity}ServiceGrpc.{Entity}ServiceBlockingStub stub;

    public {Entity}GrpcClient(@GrpcClient("{service-name}") Channel channel) {
        this.stub = {Entity}ServiceGrpc.newBlockingStub(channel);
    }

    public {Entity}Response get{Entity}(String tenantId, String id) {
        return stub.get{Entity}(Get{Entity}Request.newBuilder()
            .setTenantId(tenantId).set{Entity}Id(id).build());
    }
}
```

## Client Config (application.yml)

```yaml
grpc:
  client:
    employee-service:
      address: dns:///employee-service:9082
      negotiation-type: plaintext
      enable-keep-alive: true
      keep-alive-time: 30s
```

## After Modifying Proto Files

Run: `./gradlew :shared:andikisha-proto:build`
Mark build/generated/source/proto/ as Generated Sources Root in IntelliJ.
