# Resolution — Redis connectivity 503s (readiness restart-loop + tenant-data outage)

**Resolves:** the High/deployment-blocking backlog item
`docs/engineering/backend/2026-06-07-redis-readiness-503-backlog.md`
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
   bare **`password: ${REDIS_PASSWORD}`** (no fallback) in api-gateway, tenant,
   auth, compliance, analytics, integration-hub — matching the documented
   convention for required infra vars (`${RABBITMQ_PORT}`, etc.).
   > A `:changeme` default was tried and rejected: it re-masks the bug locally
   > (a bare run silently connects with `changeme`), which is exactly how the
   > incident slipped through.
2. **Startup guard (`RedisPasswordStartupGuard`, one per Redis service):** a
   `@Configuration` whose constructor injects `@Value("${spring.data.redis.password:}")`
   and **refuses to start if the resolved password is blank/unresolved.** This is
   needed because Redis is a *soft* dependency — empirically, bare
   `${REDIS_PASSWORD}` left unset does **not** crash on its own; Spring lets the
   service start and it only surfaces as a 503 (the incident recurs). The guard
   forces eager resolution at startup:
   - `REDIS_PASSWORD` **unset** → Spring `PlaceholderResolutionException: Could not
     resolve placeholder 'REDIS_PASSWORD'` → app aborts;
   - `REDIS_PASSWORD=""` (set blank) → the guard's `isBlank()` check throws
     `IllegalStateException` → app aborts;
   - `REDIS_PASSWORD=<value>` → boots normally.
   **Scope: config-presence only — it does NOT ping Redis** (that would break the
   degrade-not-unready contract below). A transient Redis *outage* still degrades
   to a per-request 503; only a **blank/missing password** hard-fails at startup.

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

## Startup discipline (the intended root-cause guard)
Every service **must** provide its environment on each run — source it
(`set -a; . config/env/<svc>.env; set +a; java -jar …`), or supply it via the
container/k8s secrets. A bare `java -jar` **without** the env is now a **hard fail
at startup by design**: a blank/unset `REDIS_PASSWORD` aborts the boot (see Fix #2),
rather than starting in a broken-but-running state that only shows up as a 503.
This is the root-cause fix — the exact mistake that caused the incident (running a
service without sourcing its env) can no longer reach a degraded-running state; it
stops at boot. The hard fail is **on a blank/missing password only**, *not* on
Redis being down — a configured-but-transiently-unreachable Redis still degrades.

## Rollout (clears only on redeploy)
The change takes effect only when a service is **rebuilt and restarted**. This
branch rebuilt/verified **api-gateway + tenant-service**; the other four Redis
services — **auth-service, compliance-service, analytics-service,
integration-hub-service** — carry the identical source change but **clear only on
their next rebuild + restart/redeploy**. Full effect requires rebuilding and
restarting **all six**.

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
  `LICENCE_CHECK_UNAVAILABLE`** — previously a hard 503. `scripts/smoke-redis-readiness.sh`
  → `SMOKE OK`.
- **Fail-loud confirmed:** started with `REDIS_PASSWORD` **unset** → the app
  **aborts at boot** (`PlaceholderResolutionException: Could not resolve placeholder
  'REDIS_PASSWORD'`), `:8083` never binds — it does **not** start-and-503.

## Notes
- Frontend branch untouched; this work is isolated in a worktree on `fix/redis-readiness`.
- Out of scope (observed, not changed): the super-admin **impersonation** endpoint
  returns `INTERNAL_ERROR` on the running auth-service instance — unrelated to Redis.
  Filed as `docs/engineering/backend/2026-06-08-superadmin-impersonation-500-backlog.md`.
