# Decision: licence-check read-through with asymmetric fail policy

**Date:** 2026-06-08
**Status:** Accepted
**Context:** UX & Flow Remediation Run 01, workstream W0 (audit finding A0).
**Workstream commit:** `fix/ux-flow-remediation-01` — W0.

## Problem

The gateway `TenantLicenceFilter` read `licence:status:{tenantId}` from Redis and,
on a **cache miss, failed closed → `503 LICENCE_CHECK_UNAVAILABLE`** for every
authenticated, non-SUPER_ADMIN, tenant-scoped request (reads and writes alike).

The cache was only written as a side effect of licence **state transitions**
(rare events). The design *assumed* a read-through fallback —
`LicenceStateMachineService` even documented "readers will fall back to gRPC after
the TTL expires" and `TenantGrpcService.validateTenantLicence` repopulates the
cache — but **nothing ever called that RPC in the request path** (zero callers).
Result: once the TTL lapsed or Redis was flushed/restarted, every tenant request
503'd permanently until an unrelated transition happened to rewrite the key. In
dev this was masked by a manual `redis-cli SET … EX` seed.

Blast radius: employee, payroll, compliance, attendance, leave, document,
integration, analytics routes. Confirmed live: `GET /api/v1/employees` → 503 with
Redis holding zero licence keys.

## Decision

### 1. Wire the read-through (gateway → tenant-service gRPC)
On a cache miss the gateway now calls `ValidateTenantLicence` via gRPC, which
returns the authoritative status **and repopulates the Redis key** for subsequent
requests. The blocking stub is offloaded to `Schedulers.boundedElastic()` so the
reactive event loop is never blocked. A 2s deadline bounds the call.

### 2. Asymmetric policy when tenant-service is unreachable
If the gRPC read-through itself fails (tenant-service down / deadline exceeded):

| Request kind | Behaviour | Rationale |
|---|---|---|
| **READ** (GET/HEAD/…) | **Fail OPEN** + audit log | A transient licence-infra outage must never hide data a user is entitled to see. The audit log records every unverified read. |
| **WRITE** (POST/PUT/PATCH/DELETE) | **Fail CLOSED** → `LICENCE_CHECK_UNAVAILABLE` | A mutation must not proceed against an unverified licence (a suspended/expired tenant could otherwise write). |

The audit trail for read fail-open is currently a structured `WARN` log
(`AUDIT licence-fail-open: …`); promoting it to a RabbitMQ audit event is
deferred (would add a publish to the hot gateway path).

### 3. Close the "NONE" gap
`validateTenantLicence` returns `licence_status = "NONE"` for a tenant with no
active licence. The filter's `enforceLicence` previously fell through `default`
(→ allow) for any unrecognised status, so caching "NONE" would have let a
no-licence tenant through. `enforceLicence` now blocks `NONE` explicitly
(`403 LICENCE_NONE`), keeping the cache-hit and read-through paths consistent.

### 4. Single TTL
Reconciled the two divergent TTLs (state machine 30 min, gRPC 60 s) to a single
**30 minutes** in both writers.

### 5. Disable Spring Cloud Gateway's JSON↔gRPC bridge
Adding `andikisha-proto` (grpc-stub/grpc-protobuf) to the gateway classpath
activated Spring Cloud Gateway's own **experimental** JSON-to-gRPC autoconfig
(`jsonToGRPCFilterFactory` → `GrpcSslConfigurer`), which references the
**unshaded** `io.grpc.netty.NettyChannelBuilder`. The gateway only ships the
**shaded** transport (`grpc-netty-shaded`, what net.devh uses), so the bean
failed to introspect and the application **failed to boot**
(`ClassNotFoundException: io.grpc.netty.NettyChannelBuilder`). We do **not** use
SCG's JSON↔gRPC bridge — the licence read-through uses the **net.devh gRPC
client**. Fix: `spring.cloud.gateway.filter.json-to-grpc.enabled: false`. This
avoids dragging a second (unshaded) Netty transport onto the classpath just to
satisfy a feature we don't use.

## Frontend degradation (related, same workstream)

The decision text referenced `packages/api-client`, but that package
(`createApiClient`) is **dead code — imported nowhere**. Both apps use their own
local `src/lib/api-client.ts` (BFF proxy, cookie auth), which already carried a
401→/login response interceptor. The single response-error policy therefore lives
in **`tenant-portal/src/lib/api-client.ts`** (the real call path), enhanced — not
duplicated — to add:

- `503 LICENCE_CHECK_UNAVAILABLE` → retry with backoff (600 ms, 1800 ms), then a
  non-blocking "reconnecting" banner (`<ConnectionBanner/>`) that auto-clears on
  the next success. Reads no longer reach this path (gateway fails open), so it
  only guards writes during an outage.
- `401` → redirect to `/login` (full navigation drops in-memory client state).

platform-portal is SUPER_ADMIN and bypasses the licence filter entirely, so it
needs no licence handling; its existing 401 interceptor is unchanged.

## Consequences

- A cold cache costs **one** gRPC call per tenant per TTL window, then serves
  from Redis — acceptable load.
- Reads survive a tenant-service blip; writes are correctly gated.
- No proactive cache warming this run (explicitly out of scope).

## Alternatives rejected

- **Fail open on miss for everything** — would let suspended/expired tenants write.
- **Keep fail-closed + proactive warm job** — does not self-heal a cold cache and
  adds a scheduler; read-through self-heals on first request.
