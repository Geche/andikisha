# BACKLOG — `POST /api/v1/auth/refresh` returns 409 on token rotation

**Severity:** Low–Medium — the endpoint is currently **unused by the tenant-portal BFF**
(see below), so no user-facing impact today; but it is broken and would bite the
moment refresh is wired up.
**Date:** 2026-06-09 · **Surfaced by:** UX-flow-remediation-01, W4 (auth flows) verification.
**Component:** auth-service — `AuthService.refresh` + `refresh_tokens` persistence.

## Symptom
Calling `POST /api/v1/auth/refresh` with a valid, non-revoked refresh token
returns **409 Conflict** instead of **200** with a rotated token pair. Observed
during W4 while trying to demonstrate refresh-token validity.

A 409 from `GlobalExceptionHandler` maps from either
`DataIntegrityViolationException` or `ObjectOptimisticLockingFailureException`,
so the rotation path (revoke the presented token, persist a new one) is hitting a
constraint or optimistic-lock conflict. Exact cause not yet isolated.

## Why it hasn't caused an incident
The tenant-portal BFF **discards the refresh token at login**
(`app/api/auth/login/route.ts` stores only the access JWT in `tenant_token`) and
has **no `/api/auth/refresh` route** — sessions simply end when the 1h access
token expires. So `/auth/refresh` is effectively dead from the product's
perspective. This also means users are hard-logged-out hourly with no silent
refresh — a separate UX decision to make when refresh is wired.

## To investigate
- Reproduce: login → `POST /auth/refresh` with the returned refresh token →
  capture the underlying exception (enable debug on `GlobalExceptionHandler` or
  temporarily log the cause).
- Check `refresh_tokens` for a unique constraint that rotation violates (e.g. a
  unique index that the revoke+insert sequence trips), and whether `revoke()` +
  `save(new)` happen in one transaction with the right flush ordering.
- Check `@Version` optimistic-lock usage on the token entity during
  revoke-then-replace.

## Decision to make alongside the fix
Whether the BFF should actually use refresh (silent re-auth before the 1h access
token expires) or keep the current hard-expiry model. If refresh stays unused,
consider not minting refresh tokens at login at all.
