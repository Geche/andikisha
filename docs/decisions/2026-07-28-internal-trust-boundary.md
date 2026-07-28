# Design: Internal service trust boundary (security audit M1 + M2)

**Status:** Proposed — awaiting approval before implementation
**Date:** 2026-07-28
**Findings:** M1 (trusted-header spoofing), M2 (gRPC zero-auth) — see `docs/security/security-audit-2026-07-28.md`

## Problem

Every domain service establishes tenant + role from **unauthenticated request headers** and
**unauthenticated gRPC request fields**, with no proof the caller is the gateway:

- **M1 (REST):** `TrustedHeaderAuthFilter` in each service reads `X-Tenant-ID` / `X-User-ID` /
  `X-User-Role` / `X-Employee-ID` and installs the Spring Security authentication from them. Any
  request that reaches a service port directly (misconfigured ingress, an SSRF primitive in any pod,
  a compromised low-privilege in-cluster workload) with `X-User-Role: ADMIN` + `X-Tenant-ID: <victim>`
  is granted that role and tenant. The completeness critic further showed the *service-layer*
  ownership checks (payroll `enforcePayslipOwnership`, document `PRIVILEGED_ROLES.contains(callerRole)`,
  attendance — which *skips* ownership entirely when `authentication == null`) all derive "privileged"
  from that same spoofable `X-User-Role`, so bypassing the gateway collapses authorization everywhere.
- **M2 (gRPC):** no `ServerInterceptor` exists in any service, `negotiation-type: plaintext`, and every
  `@GrpcService` does `TenantContext.setTenantId(request.getTenantId())`. Anyone who can open a gRPC
  channel to ports 9082–9092 reads/writes **any** tenant's data with **no credential**.

**Current exposure:** LOW in the present prod deployment — the root compose publishes **no** service
ports (only gateway + frontends via Traefik); services talk over the internal Docker network. Both
findings become HIGH the moment any service port is exposed, an SSRF primitive appears, or a single
pod is compromised. This is a defense-in-depth gap: the app trusts the network perimeter completely.

## Goals

1. A service honors identity headers / gRPC tenant only when it can prove they came from the gateway.
2. No change to the external contract or the gateway→service header protocol shape.
3. Backward-compatible rollout — no big-bang flag day across 13 services.
4. Cheap to verify and hard to misconfigure into fail-open.

## Options considered

| Option | Pros | Cons |
|---|---|---|
| **A. Gateway-signed internal header (HMAC)** | No infra; works for REST; shared secret already a pattern (JWT_SECRET, PROVISION_SECRET); testable | Secret distribution; clock-skew if time-bound; must also cover gRPC separately |
| **B. mTLS between gateway and services** | Strong identity, covers REST+gRPC uniformly; no app secret | Cert issuance/rotation infra (cert-manager); heavier ops; bigger change |
| **C. NetworkPolicy / firewall only** | Smallest effort | Relies entirely on network config being correct; no app-layer defense; does nothing if an in-namespace pod is compromised |

**Recommendation: A now, C alongside, B later.** Ship the HMAC internal header (A) as the app-layer
control, add NetworkPolicy (C) as the perimeter, and treat mTLS (B) as a future hardening once
cert-manager is in the cluster. Defense in depth, incremental, testable.

## Proposed design (Option A + C)

### 1. Gateway signs an internal attestation header

The gateway, after it has authenticated the JWT and derived the identity headers it injects, adds:

```
X-Internal-Auth: <base64url(HMAC-SHA256(secret, canonical(identity) + "." + issuedAtEpochSec))>.<issuedAtEpochSec>
```

- `secret` = a new `INTERNAL_SIGNING_SECRET` (32-byte, `openssl rand -base64 32`), gateway-only +
  each service. Distinct from `JWT_SECRET` (blast-radius isolation).
- `canonical(identity)` = a fixed-order join of the exact header values the gateway injects
  (`X-Tenant-ID|X-User-ID|X-User-Role|X-Employee-ID`), so the signature binds to the identity it
  attests — an attacker cannot reuse a captured header with different identity values.
- `issuedAtEpochSec` bounds replay to a short window (e.g. 30 s skew), checked by the service.

The existing global stripping of client-supplied `X-Internal-*` in `JwtAuthenticationFilter` already
prevents a client from injecting `X-Internal-Auth` — the gateway is the only party that can add it.

### 2. Each service verifies before trusting headers

`TrustedHeaderAuthFilter` (shared pattern across services) gains a first step: if
`app.internal-auth.enforce=true`, require a valid, unexpired `X-Internal-Auth` whose HMAC matches the
identity headers; reject (401) otherwise. When the header is valid, proceed exactly as today.

### 3. gRPC ServerInterceptor

A shared `InternalAuthServerInterceptor` (in `andikisha-common` or per service) validates an
`x-internal-auth` gRPC metadata entry with the same HMAC scheme before any `@GrpcService` handler
runs; reject with `UNAUTHENTICATED` otherwise. gRPC clients (the gateway's licence client and each
service's cross-service clients) attach the metadata via a `ClientInterceptor`. This closes M2's
zero-auth plane. (mTLS later replaces or augments this.)

### 4. NetworkPolicy (perimeter, defense in depth)

k8s `NetworkPolicy` (or compose network segmentation) restricting service REST (808x) and gRPC (908x)
ports to traffic from the gateway pod only. Documented as required, not a substitute for 1–3.

## Rollout (backward-compatible, no flag day)

Per service, a two-phase `app.internal-auth` mode:

1. **`log`** (default on first deploy): the gateway *sends* `X-Internal-Auth`; services *verify and
   log* mismatches but still serve. Confirms every real path carries a valid header (dashboards clean).
2. **`enforce`**: flip services to reject when the header is missing/invalid. Gateway already sends it,
   so no coordinated flag day — flip services one at a time; roll back a single service if needed.

Same two-phase approach for the gRPC interceptor.

## Testing

- Gateway: unit test that `X-Internal-Auth` is added with a correct HMAC over the injected identity;
  that a client-supplied `X-Internal-Auth` is stripped before signing.
- Service filter: valid header → authenticated; missing/expired/tampered (identity changed after
  signing) → 401 in `enforce`, logged in `log`.
- gRPC: interceptor accepts valid metadata, rejects missing/tampered with `UNAUTHENTICATED`.
- No cross-tenant regression in existing repository/gRPC tests.

## Effort & risk

- Touches: api-gateway (sign + gRPC client interceptor), `andikisha-common` (shared verify + HMAC
  util + gRPC interceptors), all 12 domain services (wire the filter step + config; most inherit the
  shared filter). ~4–6 focused PRs (common util first, then gateway, then services in waves, then
  NetworkPolicy).
- Risk: a misconfigured secret fails **closed** in `enforce` (login/data 401) — the `log` phase
  de-risks this by proving header coverage before enforcing. Keep infra (postgres/rabbit/redis)
  untouched.

## Decision

Awaiting approval. On approval, implement in this order: (1) shared HMAC util + tests in
`andikisha-common`; (2) gateway signing + `log`-phase; (3) service verify filter in `log`-phase across
services; (4) gRPC interceptors in `log`-phase; (5) flip to `enforce` service-by-service; (6)
NetworkPolicy. If the answer is "network isolation is enough for now" (Option C only), we ship the
NetworkPolicy + a documented deviation in this file and stop.
