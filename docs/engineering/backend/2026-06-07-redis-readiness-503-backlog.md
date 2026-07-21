# BACKLOG (deployment path) — Redis connectivity 503s: readiness restart-loop + tenant-data outage

**Severity:** High — deployment-blocking. Reclassified from "cosmetic" (it is not).
**Date:** 2026-06-07 · **Surfaced by:** Step 2 dense-surface verification.
**Component:** tenant-service (and any service with the licence filter); Redis client config.

## Two symptoms, one root cause
The services cannot reach/authenticate Redis at runtime. Observed:

1. **`/actuator/health` → 503.** `RedisReactiveHealthIndicator` logs
   `Redis health check failed`; the aggregated health is `DOWN`
   (`groups: [liveness, readiness]`). **This is consumed by readiness probes**
   (Dokploy / Kubernetes). Deployed as-is, the orchestrator marks tenant-service
   unhealthy and **restart-loops it** — the service never goes Ready.
2. **`GET /api/v1/employees` (and other tenant-scoped routes) → 503
   `LICENCE_CHECK_UNAVAILABLE`** ("Licence status unavailable. Please retry shortly.").
   The `TenantLicenceFilter` reads `licence:status:{tenantId}` from Redis; with Redis
   unreachable, **every tenant-scoped data request fails**. (Confirmed: the
   tenant-portal employees table shows "Could not load employees" while the
   employee-service's own `/actuator/health` is 200.)

Both stem from the same broken Redis connection. The Redis container requires a
password (`redis-cli -a changeme` works), so the most likely cause is a
**password/host mismatch in the services' Redis client config** (dev profile), or
the reactive Redis client not sending AUTH.

## Why this is not cosmetic
- Readiness 503 ⇒ **restart loop in any probe-driven deploy** (Dokploy/K8s) — the
  service is effectively down in production topology.
- Licence-check 503 ⇒ **total tenant-data outage** even when the service is "up".
- Manually `SET`-ting the Redis key (as done for local verification) does **not**
  fix it, because the *services* can't read Redis regardless of the key's presence.

## Recommended fix (deployment path)
1. Align the services' Redis config with the deployed Redis: host, port, and
   **password** (`spring.data.redis.password`) across dev/prod profiles and the
   compose/Dokploy/K8s secrets. Verify the reactive client sends AUTH.
2. Decide the **readiness contract for Redis:** is Redis a hard readiness
   dependency? If licence checks are critical, yes — but then Redis must be healthy
   before the service is Ready. If licence has a fallback (e.g. cache-miss →
   re-fetch from tenant-service, fail-open with audit), make the health indicator
   non-fatal for readiness (`management.endpoint.health.group.readiness.include`
   excluding `redis`, or a custom indicator) so a transient Redis blip doesn't
   restart-loop the whole service.
3. Add a smoke check to the deploy runbook: after rollout, assert
   `/actuator/health` is 200 **and** a tenant-scoped request does not return
   `LICENCE_CHECK_UNAVAILABLE`.

## Scope note
Out of scope for the design-system migration (Step 2) — filed here as backend/ops
work. It did not block Step 2 closure: the migration's chrome renders correctly;
only populated tenant data rows were unavailable (platform tenants table provided
the populated-row evidence). See `docs/verification/VERIF-DEBT.md`.
