# BACKLOG — super-admin tenant impersonation returns 500 INTERNAL_ERROR

**Severity:** High / support-critical — SUPER_ADMIN cannot impersonate a tenant
(used for support, debugging tenant-scoped issues, and as a no-credential way to
reach tenant surfaces).
**Date:** 2026-06-08 · **Surfaced by:** the Redis-readiness session (was trying to
use impersonation to verify a tenant-scoped request without a tenant password).
**Component:** auth-service — `SuperAdminAuthController.impersonate` →
`SuperAdminAuthService.impersonate`.

## Repro
1. Get a SUPER_ADMIN token (works):
   `POST /api/v1/auth/super-admin/login` `{email, password}` → `accessToken`.
2. `POST /api/v1/auth/super-admin/tenants/{tenantId}/impersonate`
   `Authorization: Bearer <super-admin token>` →
   **`HTTP 500 {"error":"INTERNAL_ERROR","message":"An unexpected error occurred"}`**.

Expected: an `ImpersonationResponse` with a tenant-scoped (read-only) token.

## What's known / not known
- Super-admin **login** works on the same instance, so it's not auth/JWT itself.
- The real exception/stack is **masked** by the generic `INTERNAL_ERROR` handler —
  **needs the auth-service logs** at the time of the call to get the cause.
- **Rule out Redis first:** this was observed on the **unpatched** auth-service
  instance (the one with the Redis-NOAUTH bug this session fixes). Impersonation
  may write/read a session or token in Redis; if so the 500 is a *symptom* of the
  same Redis-auth failure. **First step:** rebuild + restart auth-service with the
  Redis fix (`fix/redis-readiness`) and retry. If it still 500s, it's a genuine,
  separate impersonation defect — pull the stack from the auth-service log and fix.

## Why it matters
Impersonation is the supported way for staff to reach a tenant's surfaces without
the tenant's credentials. While broken, support must reset/borrow tenant passwords
(as this session had to), which is slower and credential-risky.

## Scope
Unrelated to the design-system migration; independent of the Redis-readiness *fix*
(though possibly the same Redis *root cause* — see "rule out Redis" above). File/
triage on its own.
