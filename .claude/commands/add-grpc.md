---
description: Add a gRPC endpoint for synchronous inter-service communication. Creates the proto definition, server implementation, client wrapper, and configuration.
---

Set up synchronous gRPC communication between two AndikishaHR microservices.

## Inputs Required

1. Server service (e.g. employee-service)
2. Client service (e.g. payroll-service)
3. RPC method name (e.g. GetSalaryStructure)
4. Request fields
5. Response fields

## What To Generate

1. **Proto definition** in shared/andikisha-proto/src/main/proto/{service}.proto. Add the new rpc method to the existing service definition, or create a new one. Follow the existing proto conventions.

2. **gRPC server implementation** in server service's infrastructure/grpc/. Extends *ImplBase, annotated with @GrpcService. Sets TenantContext from request, delegates to query service, maps to proto response, clears TenantContext in finally block.

3. **gRPC client wrapper** in client service's infrastructure/grpc/. @Component with @GrpcClient channel injection. Provides a clean Java method that hides the proto types.

4. **Client configuration** in consuming service's application.yml: grpc.client.{service-name}.address and negotiation-type.

5. Run `./gradlew :shared:andikisha-proto:build` to regenerate Java classes from proto.

6. Remind the user to mark build/generated/source/proto/ as Generated Sources Root in IntelliJ.
