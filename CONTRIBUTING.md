# Contributing to AndikishaHR

## Prerequisites

- Java 21 (Amazon Corretto recommended)
- Node.js 20+, pnpm 9+
- Docker Desktop (for infrastructure containers)
- Gradle 8.x (wrapper included — use `./gradlew`)

---

## Starting the dev environment

### 1. Start infrastructure containers

```bash
cd infrastructure/docker
docker compose up -d
```

This starts PostgreSQL instances (one per service), Redis, and RabbitMQ. Services start on the ports defined in `docker-compose.yml`.

### 2. Start backend services

Each service is started individually via Gradle `bootRun`. The `dev` Spring profile must be active:

```bash
./gradlew :services:auth-service:bootRun --args='--spring.profiles.active=dev' --no-daemon &
./gradlew :services:api-gateway:bootRun  --args='--spring.profiles.active=dev' --no-daemon &
# ... repeat for other services
```

Service ports: api-gateway=8080, auth-service=8081, employee-service=8082, tenant-service=8083, payroll-service=8084, compliance-service=8085, time-attendance-service=8086, leave-service=8087, document-service=8088, notification-service=8089, integration-hub-service=8090, analytics-service=8091, audit-service=8092.

### 3. Seed demo data

After all services are running, seed lookup tables and the Redis licence cache:

```bash
make seed-demo-data
```

This runs `scripts/seed-demo-data.py` which creates departments and positions in the demo tenant and seeds the Redis licence cache. The seed is **idempotent** — safe to re-run at any time. Existing records are skipped (not duplicated).

### 4. Start the frontend

```bash
cd frontend/tenant-portal && pnpm dev     # http://localhost:3000
cd frontend/platform-portal && pnpm dev   # http://localhost:3003
cd frontend/landing && pnpm dev           # http://localhost:3002
```

---

## Resetting the dev environment

### When to do a full reset

- Corrupted DB state (conflicting migrations, bad seed data)
- Switching between branches with incompatible Flyway migrations
- "Starting fresh" after extended development

### How to reset

```bash
# Stop all services first (Ctrl+C on each bootRun terminal)

# Remove all database volumes (destroys all data)
docker compose -f infrastructure/docker/docker-compose.yml down -v

# Restart fresh containers
docker compose -f infrastructure/docker/docker-compose.yml up -d

# Wait ~10 seconds for containers to be ready, then start services
# Flyway runs migrations automatically on service startup

# Re-seed demo data
make seed-demo-data
```

### After any docker restart (without volume rm)

The Redis licence cache expires. Re-seed it before making any API calls:

```bash
make seed-redis
```

Without this, all API calls through the gateway return HTTP 503 (`LICENCE_CHECK_UNAVAILABLE`).

---

## Seeded demo data

After `make seed-demo-data`, the demo tenant contains:

**Tenant:** `1cc12430-7c3a-45b7-8973-469622778c9d`

**Users (auth-service):**

| Email | Password | Role |
|---|---|---|
| `admin@demo.co.ke` | `Admin@123!` | ADMIN |
| `jane.w@demo.co.ke` | `Employee@123!` | EMPLOYEE |
| `superadmin@andikisha.com` | `SuperAdmin@123!` | SUPER_ADMIN (platform-portal) |

**Departments (employee-service):**
Human Resources, Finance, Operations, Engineering, Sales

**Positions (employee-service):**
HR Officer, Sales Representative, Sales Manager, Software Engineer, Accountant, Operations Manager, Customer Service Representative, Marketing Officer, Administrative Assistant, Finance Manager

**Employees:** 26 seed employees created during development. Employee numbers EMP-0001 through EMP-0026. `jane.w@demo.co.ke` is linked to employee record `a26e4215-21d7-4d0d-8579-c315fb6635c4` (EMP-0004).

---

## Environment variables

Backend services read secrets from environment variables at runtime. In dev, most have fallbacks via `application-dev.yml`. The exception is services that require explicit secrets:

```bash
# Required for all services that start locally (already in application-dev.yml):
# - Redis password: changeme
# - RabbitMQ: andikisha / changeme
# - PostgreSQL per-service: andikisha / changeme
# - JWT_SECRET: already set in api-gateway/application-dev.yml
```

Frontend `.env.local` files are not committed. Create them manually:

**`frontend/tenant-portal/.env.local`**
```
API_GATEWAY_URL=http://localhost:8080
JWT_SECRET=LFQeKe5sNUFz_GBnTZqscfbO9ci1htVvuJpx_gX6mNJN7THtgO1eWANulE3ILAcP
NEXT_PUBLIC_PLATFORM_PORTAL_URL=http://localhost:3003
```

**`frontend/platform-portal/.env.local`**
```
API_GATEWAY_URL=http://localhost:8080
JWT_SECRET=LFQeKe5sNUFz_GBnTZqscfbO9ci1htVvuJpx_gX6mNJN7THtgO1eWANulE3ILAcP
NEXT_PUBLIC_TENANT_PORTAL_URL=http://localhost:3000
```

---

## Project conventions

See `CLAUDE.md` for the full coding standards, DDD package layout, API patterns, and git conventions. Key rules:

- Constructor injection only — no `@Autowired` on fields
- `@Transactional(readOnly = true)` at class level, override with `@Transactional` on write methods
- Repository methods must filter by `tenantId`
- No cross-service database foreign keys — UUID references only
- No business logic in controllers
- Never commit `.env` files or `application-prod.yml` secrets
