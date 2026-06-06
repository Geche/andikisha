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
- **Actual root cause — the AndikishaHR api-gateway is NOT running, and a different
  project squats on its port:**
  - `:8080` is held by **`arusifiti/apps/core-api`** (a separate Kotlin/Spring
    project — confirmed by the process classpath `/Users/.../Projects/arusifiti/...`).
    Its default Spring Security is the source of the `401 Basic realm` + `JSESSIONID`.
  - **No AndikishaHR `api-gateway` process exists** (`ps` finds none). The BFF posts
    login/resolve to `localhost:8080` → hits arusifiti → 401.
  - AndikishaHR services on `:8081–:8090` (auth, tenant, employee, payroll,
    compliance, leave, integration) **are** up and healthy.
  - The tenant jar **does contain** `PublicTenantController.class` (resolve code is
    built); the running tenant process 404'ing the route just means that process was
    started from an **older jar than the one now on disk** — a secondary staleness,
    moot until the gateway is actually running.
- **Not a code regression, and not (primarily) a stale build:** it is a **runtime /
  port-ownership** problem — the gateway was never started here (or died), and an
  unrelated app took `:8080`.

## Resolution (ops, not code)
0. **Free `:8080` / start the gateway.** Either stop the squatting `arusifiti`
   core-api so the AndikishaHR api-gateway can bind `:8080`, **or** start the
   gateway on an alternate port and point each portal's `API_GATEWAY_URL` at it.
   (Decision required — stopping arusifiti affects an unrelated project.)
1. **Rebuild + restart** the AndikishaHR backend from current `master` (at minimum
   api-gateway + tenant-service — the running tenant process also predates its own
   jar) — e.g. `./gradlew :services:api-gateway:bootRun` /
   `:services:tenant-service:bootJar` then run the fresh jar. Re-seed the Redis
   licence cache afterward (see dev creds).
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

## Prevention (build-info / actuator)
This incident was hard to spot because `:8080` returned `health: 200` while being
the **wrong application**. Liveness ≠ identity ≠ version. Make "what is actually
running on this port, from which commit" a one-curl check:

- **Build + git info via actuator `/info`:**
  - Gradle: `springBoot { buildInfo() }` → `META-INF/build-info.properties` →
    `/actuator/info` reports app version + build time.
  - Git: `com.gorylenko.gradle-git-properties` (or Spring `git.properties`) →
    `/actuator/info` shows `git.commit.id` + `git.commit.time`.
  - Config: `management.endpoints.web.exposure.include=health,info`,
    `management.info.git.mode=full`, `management.info.build.enabled=true`, and set
    `spring.application.name` so `/info` carries the service identity.
- **Pre-flight runbook check before any E2E:** for each expected port, assert
  `/actuator/info` reports the expected `app.name` **and** a `git.commit.id` that
  matches `git rev-parse HEAD`. A 200 health alone is insufficient — here it masked
  both a wrong app (arusifiti on `:8080`) and a process older than its own jar.
- **Fail-fast on identity:** log bound port + `spring.application.name` + commit id
  at startup so a wrong/stale process is obvious in logs.

## Links
- Blocks `docs/Engineering/frontend/VERIF-DEBT.md` → VERIF-DEBT-001.
- Evidence + tooling readiness: `docs/Engineering/frontend/VERIFICATION-NOTE-001.md`.
