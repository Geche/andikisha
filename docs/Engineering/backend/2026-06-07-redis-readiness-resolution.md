# Resolution — Redis connectivity 503s (readiness restart-loop + tenant-data outage)

**Resolves:** the High/deployment-blocking backlog item
`docs/Engineering/backend/2026-06-07-redis-readiness-503-backlog.md`
(that file lives on the design-system branch; this fix is on `fix/redis-readiness`
off `master`).
**Date:** 2026-06-07.

## Diagnosis (confirmed)
The infra Redis runs `redis-server --requirepass ${REDIS_PASSWORD:-changeme}` →
it **requires a password** (`changeme`; `redis-cli` with no `-a` returns
`NOAUTH Authentication required`). Every service configured
`spring.data.redis.password: ${REDIS_PASSWORD:}` — an **empty default**. When a
service starts **without `REDIS_PASSWORD` in its environment** (e.g. a bare
`java -jar` that doesn't source `config/env/<svc>.env`), the client connects
**unauthenticated** →

- `RedisReactiveHealthIndicator` fails → `/actuator/health` (aggregate) = 503;
- the gateway's `TenantLicenceFilter` can't read `licence:status:{tenantId}` →
  every tenant-scoped request → 503 `LICENCE_CHECK_UNAVAILABLE`.

The dev `config/env/*.env` files and the committed `*.env.example` templates were
already correct (`REDIS_PASSWORD=changeme`); the failure mode was the **empty
in-app default** biting whenever the env wasn't sourced.

## Fix
1. **Config (6 Redis services):** `password: ${REDIS_PASSWORD:}` →
   `password: ${REDIS_PASSWORD:changeme}` in api-gateway, tenant, auth, compliance,
   analytics, integration-hub. The default now **matches the infra default**
   (`--requirepass ${REDIS_PASSWORD:-changeme}`). Prod still injects the real
   `REDIS_PASSWORD` (secret) which overrides; if prod forgets, it **fails closed**
   (tries `changeme`, auth fails) rather than the previous empty → unauthenticated
   connect. Strictly safer than the empty default.

## Readiness contract (decided + documented)
**Decision: Redis-down → DEGRADE, not service-unready.**

- Rationale: the gateway's `TenantLicenceFilter` already degrades **per request**
  when Redis is unavailable (`503 LICENCE_CHECK_UNAVAILABLE`, "retry shortly"),
  which **self-heals** the instant Redis returns. Making Redis a hard *readiness*
  dependency would instead let the orchestrator mark the whole service unready and
  **restart-loop** it on any transient Redis blip — converting a brief, recoverable
  degradation into a full outage + restart storm.
- Implementation:
  - The **readiness group is defined explicitly** (`management.endpoint.health.group.readiness.include`):
    `readinessState, db` on the data services; `readinessState` on the api-gateway
    (no DB). **Redis is deliberately excluded** from readiness; the DB **is** a
    readiness dependency (a service that can't reach its DB genuinely can't serve).
  - The k8s probes already target the **group** paths
    (`/actuator/health/readiness`, `/actuator/health/liveness`) — verified across
    the service manifests — so Redis being DOWN in the *aggregate* `/actuator/health`
    never trips the readiness probe. (If a Dokploy/other probe is pointed at the
    aggregate `/actuator/health`, repoint it to `/actuator/health/readiness`.)

## Smoke check
`scripts/smoke-redis-readiness.sh <gateway> <tenant-service> <token>` — asserts
`/actuator/health` = 200, `/actuator/health/readiness` = 200, and a tenant-scoped
request is **not** `LICENCE_CHECK_UNAVAILABLE`. Add to the deploy runbook (run
post-rollout).

## Verification (local, this branch)
Rebuilt gateway + tenant-service from this branch and started them the canonical
dev way (env sourced from `config/env/<svc>.env`):

- **`/actuator/health` on tenant-service → 200 `UP`** (0 `Redis health check failed`
  in the log); `/actuator/health/readiness` and `/liveness` → 200.
- **`GET /api/v1/employees` (tenant-scoped, via the gateway licence filter) → 200
  with rows** (`{"content":[{… "Jane Wanjiru", "EMP-0002" …}]}`), **0
  `LICENCE_CHECK_UNAVAILABLE`** — previously a hard 503.

## Notes
- Frontend branch untouched; this work is isolated in a worktree on `fix/redis-readiness`.
- Out of scope (observed, not changed): the super-admin **impersonation** endpoint
  returns `INTERNAL_ERROR` on the currently-running auth-service instance — unrelated
  to Redis; flag for a separate look.
