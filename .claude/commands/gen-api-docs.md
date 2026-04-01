---
description: Generate REST API documentation for an AndikishaHR service by scanning its controllers, DTOs, and validation annotations. Outputs a Markdown file in docs/api-contracts/.
---

Generate API documentation for a specific AndikishaHR microservice.

## Steps

1. Ask which service to document.

2. Scan all @RestController classes in that service's presentation/controller/ package.

3. For each controller, extract:
   - Base path from @RequestMapping
   - Each endpoint: HTTP method, path, path variables, query parameters
   - Request body DTO with all fields and validation constraints
   - Response DTO with all fields
   - Required headers (X-Tenant-ID, X-User-ID)

4. Generate a Markdown document at docs/api-contracts/{service-name}-api.md with this structure:

```markdown
# {Service Name} API

Base URL: /api/v1/{resource}

## Authentication
All endpoints require:
- Header: Authorization: Bearer {token}
- Header: X-Tenant-ID: {tenant-uuid}

## Endpoints

### POST /api/v1/{resource}
Create a new {resource}.

**Request Body:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| ... | ... | ... | ... |

**Response:** 201 Created
| Field | Type | Description |
|-------|------|-------------|
| ... | ... | ... |

**Errors:**
- 400: Validation failed
- 409: Duplicate {unique field}
```

5. Include example request/response JSON for each endpoint.

6. Note any gRPC endpoints the service exposes (from infrastructure/grpc/) as an "Internal API" section.
