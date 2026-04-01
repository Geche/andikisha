---
description: Show the current implementation status of all 13 AndikishaHR microservices. Scans for Application classes, controllers, entities, migrations, and tests to determine completion level.
---

Scan the AndikishaHR project and produce an implementation status report.

## For Each Service

Check these directories and report what exists:

1. **Application class**: Does {Service}Application.java exist?
2. **Entities**: List all Java classes in domain/model/
3. **Repositories**: List all interfaces in domain/repository/
4. **Services**: List all classes in application/service/
5. **Controllers**: List all classes in presentation/controller/
6. **DTOs**: Count files in application/dto/request/ and application/dto/response/
7. **gRPC**: Does infrastructure/grpc/ have implementations?
8. **RabbitMQ**: Does infrastructure/messaging/ have publishers or listeners?
9. **Migrations**: List all V*.sql files in resources/db/migration/
10. **Tests**: Count files in test/unit/, test/integration/, test/e2e/

## Output Format

```
## AndikishaHR Implementation Status

### Phase 1: Foundation
| Service | App | Entities | Repos | Services | Controllers | gRPC | Events | Migrations | Tests |
|---------|-----|----------|-------|----------|-------------|------|--------|------------|-------|
| auth    | Y/N | count    | count | count    | count       | Y/N  | Y/N    | count      | count |
...

### Phase 2: Core HR
...

### Next Steps
Based on what is missing, suggest the next 3 implementation tasks in priority order.
```

Scan the actual filesystem. Do not guess. Report only what files actually exist.
