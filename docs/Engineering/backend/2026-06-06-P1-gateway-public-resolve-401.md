# P1 — Public workspace-resolve returns 401; all login broken (stale backend runtime)

**Severity:** P1 — breaks all tenant/platform login (resolve → `RESOLVE_ERROR`),
which blocks `VERIF-DEBT-001` and any authenticated E2E.
**Date:** 2026-06-06 · **Surfaced by:** frontend design-system migration (Step 2
auth-surface verification, blocked by this).

## Symptom
- `GET http://localhost:8080/api/v1/public/workspaces/{slug}/resolve` → **401**
  (`WWW-Authenticate: Basic realm="Realm"`, sets `JSESSIONID`) — identical for a
  real slug and a random one (so endpoint-level auth, not a wrong slug or licence).
- BFF `/api/auth/login` → `RESOLVE_ERROR`; **no login works**, automated or manual,
  in either portal.

## Diagnosis (diagnose-first — it is NOT a code regression)
- **Gateway `SecurityConfig`** (`services/api-gateway/.../config/SecurityConfig.java`,
  single commit, unchanged): `httpBasic` **disabled**, `anyExchange().permitAll()`.
  Cannot be the source of a Basic challenge.
- **tenant-service `SecurityConfig`**: `permitAll` for `/api/v1/public/**`;
  `PublicTenantController` maps `/api/v1/public/workspaces/{workspace}/resolve`.
  **Correct in source.** Endpoint added in `8d0bb91` (2026-05-20), present in master/HEAD.
- **Running runtime is stale:** the running tenant-service (`:8083`) returns **404**
  for `/api/v1/public/workspaces/demo/resolve` — the handler that exists in source
  is **absent from the running build**, i.e. the process predates `8d0bb91`.
  `docker ps` shows **only infrastructure** (redis, postgres-*, rabbitmq, zipkin);
  **no app-service containers** — the Spring services run from stale jars/bootRun.
  The gateway's `401 Basic` is a stale-gateway artifact (old/missing public route →
  request reaches an auth-required path on a stale servlet downstream).

## Resolution (ops, not code)
1. **Rebuild + restart** the backend from current `master` (at minimum api-gateway
   + tenant-service; ideally the full stack) — `docker compose build && up`, or
   re-run on current source. Re-seed the Redis licence cache afterward (see dev creds).
2. **Re-test unauthenticated:** `GET …/api/v1/public/workspaces/{realSlug}/resolve`
   → expect **200** `{ tenantId }`.
3. **Add a regression test** asserting the resolve route returns 200 unauthenticated
   (valuable regardless) — on the backend's own branch off master, as its own
   reviewed work.
4. **Escalate to a code fix only if** resolve still 401s after a clean rebuild from
   master — that would indicate a genuine config gap; fix then on its own branch.

## Do NOT
- Do not "whitelist" routes in either `SecurityConfig` as a reflex — both are
  already correct; editing them would mask a deployment problem and risk widening
  the public surface.

## Links
- Blocks `docs/Engineering/frontend/VERIF-DEBT.md` → VERIF-DEBT-001.
- Evidence + tooling readiness: `docs/Engineering/frontend/VERIFICATION-NOTE-001.md`.
