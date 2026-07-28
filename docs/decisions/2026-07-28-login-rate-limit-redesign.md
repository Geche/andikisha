# Design: login brute-force / lockout-DoS protection (security audit M5 + M6) — redesign

**Status:** Proposed — supersedes the withdrawn PR #111 (marked draft, do not merge)
**Date:** 2026-07-28
**Findings:** M5 (brute-force/spray unthrottled), M6 (account-lockout DoS) — see
`docs/security/security-audit-2026-07-28.md`

## Why the first attempt (#111) was withdrawn

The final adversarial verification of the merged fixes found the #111 approach both **unsafe** and
**ineffective** once the real request topology is accounted for:

Login path: `browser → Traefik (edge) → BFF (Next server-side fetch) → api-gateway → auth-service`.
The BFF's fetch to the gateway (`tenant-portal/src/app/api/auth/login/route.ts:108`) forwards only
`Content-Type` + `X-Tenant-ID` — **not** the client IP and **not** `X-Forwarded-For`.

Consequences:
1. **Gateway self-DoS (HIGH).** `authKeyResolver` keyed the strict AUTH bucket (1 req/s, burst 5) on
   `exchange.getRequest().getRemoteAddress()` — the TCP peer, which behind the BFF is the **BFF
   container's single IP for every login across all tenants**. Shipping it would throttle *all*
   logins globally.
2. **Ineffective per-account guard.** `LoginAttemptGuard` blocked at 10 while `User.recordFailedLogin`
   hard-locks at 5 (threshold inversion — the lock always fires first), and `ClientIp` trusted
   `X-Forwarded-For[0]`, which Spring Cloud Gateway *appends* to (so it's the attacker-controlled
   token). Rotating XFF keeps every bucket at count 1. The M6 lockout DoS stayed fully open (~5 reqs).

**Root cause:** the real client IP exists only at the **edge** (Traefik). No downstream hop is
configured to carry it, and M6's account-lock is **globally triggerable** — an IP-throttle placed in
front of a global lock cannot fix it when the lock threshold (5) is trivially reachable.

## Correct design

Two independent, layered pieces.

### A. Recover the real client IP (prerequisite for any IP-based control)
- **Edge is authoritative.** Traefik/Dokploy already sets `X-Forwarded-For` with the browser IP.
- **Thread it explicitly, do not infer.** The BFF login/forgot-password routes read the client IP
  they already compute (`route.ts:43`) and forward it to the gateway as a dedicated header, e.g.
  `X-Client-IP`. The gateway **strips any inbound `X-Client-IP`** (like it already strips
  `X-Internal-Request`) and re-stamps it from the value the BFF sent (or, for direct calls, from a
  `XForwardedRemoteAddressResolver` with a trusted-hop count matching the deployment). auth-service
  reads `X-Client-IP`, never raw `X-Forwarded-For[0]`.
- Alternatively/additionally, rate-limit at **Traefik** (edge middleware) where the client IP is
  native — the simplest correct volumetric control for M5, no app changes.

### B. Fix the lockout model (the actual M6 vector)
An IP-throttle cannot fix a globally-triggerable lock. Change `User` lockout to one of:
- **IP-aware lock:** only count failures toward the 30-min lock per `(account, client-IP)`, so an
  attacker from limited IPs cannot lock the victim globally; a legitimate user on a clean IP is never
  locked by someone else's failures. (Requires the trusted client IP from A.)
- **or Soft backoff instead of hard lock:** replace the hard 30-min lock with an increasing
  per-`(account, IP)` response delay / throttle, so brute-force slows without a global lockout an
  attacker can weaponise.

### C. Then the per-account throttle becomes correct
With a trusted client IP (A) and threshold **below** the lock threshold, `LoginAttemptGuard` (keyed
`account + trusted-IP`, TTL set unconditionally — see residuals) trips before the lock can be driven
up, and the gateway/edge limit caps volume. Keep the uniform-401 + dummy-hash response (M3/M4) intact.

## Rollout
Ship in order: (1) BFF forwards `X-Client-IP`; (2) gateway strips-and-restamps it + resolves it for
its own auth bucket; (3) auth-service reads it in `ClientIp`; (4) lockout-model change; (5) re-enable
the per-account guard with threshold < lock and unconditional TTL. Each step is independently
testable. Edge (Traefik) rate limiting can land first as an immediate M5 backstop.

## Verification residuals to fold in
From the same final-verification pass (`docs/security/security-audit-2026-07-28.md` covers the
originals; these are new/residual):
- **MEDIUM — idempotency key before commit (integration-hub, shipped in #107 H2).**
  `handleMpesaCallback` sets the Redis idempotency key inside the `@Transactional` method but before
  the DB commit; a commit/publish failure leaves the key set while the state change rolls back, so a
  retried callback is deduped and the payment strands. Fix: set the key in a
  `TransactionSynchronization.afterCommit()`, or use a `processed_callbacks` table committed with the
  state change.
- **MEDIUM — sandbox auto-complete gated on `config == null` not the sandbox flag (integration-hub,
  pre-existing).** `PaymentProcessor.processMpesaPayment` auto-completes only when `config == null`;
  a tenant with an active `MPESA_B2C` config while `app.mpesa.enabled=false` hangs payments in
  SUBMITTED. Gate the shortcut on `mpesaSandbox`. (Not introduced by the security work.)
- **LOW — `LoginAttemptGuard` TTL set only on first increment.** Call `expire` unconditionally (or a
  Lua INCR+EXPIRE) so a TTL-less key can't block permanently. Folds into (C).

## Decision
Awaiting direction: (1) approve this redesign (BFF→gateway `X-Client-IP` threading + lockout-model
change), or (2) start with Traefik edge rate limiting only as the M5 backstop and defer the
lockout-model change, or (3) accept M6 as a documented residual tradeoff. PR #111 stays a draft and
is closed/replaced once a direction is chosen.
