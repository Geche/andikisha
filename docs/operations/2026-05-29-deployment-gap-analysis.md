# Deployment Gap Analysis — Dokploy / VPS

**Date:** 2026-05-29  
**Scope:** `docker-compose.yml`, `infrastructure/docker/Dockerfile.service`, `infrastructure/docker/Dockerfile.frontend`, `infrastructure/docker/init-db.sql`, `.github/workflows/ci.yml`, `.github/workflows/cd-staging.yml`, `.github/workflows/cd-production.yml`  
**Context:** All 16 Docker images (13 backend + 3 frontend) build and push to ghcr.io on every master push. Deployment target is a single Dokploy VPS at `gechevps.polcacreations.com`.

---

## CRITICAL — Will break or already broken

### 1. `cd-staging.yml` and `cd-production.yml` are dead AWS EKS workflows

Both workflows trigger on `workflow_run: CI → completed` on master. They reference `AWS_ACCOUNT_ID`, `AWS_DEPLOY_ROLE_ARN`, and `EKS_CLUSTER` — none of which exist for a Dokploy deployment. Result: two failing workflow runs appear in GitHub Actions after every successful CI push to master. These are leftover from the EKS-era that were never cleaned up when switching to Dokploy.

**Fix:** Delete both files. The active deploy path is `ci.yml → notify-dokploy`.

---

### 2. `Dockerfile.frontend` standalone server path is wrong

`Dockerfile.frontend:53–55`:
```sh
echo "exec node /app/frontend/${FRONTEND_NAME}/server.js" >> /start.sh
```

Next.js standalone mode copies `server.js` to the **root** of the standalone directory. The `COPY` at line 66 copies the standalone output to `/app`, so the actual entry point lands at `/app/server.js` — not `/app/frontend/${FRONTEND_NAME}/server.js`. The container starts and immediately crashes with `Cannot find module`.

The static assets path at line 71 has the same problem. They are copied to `/app/frontend/${FRONTEND_NAME}/.next/static` but Next.js standalone expects them at `/app/.next/static` (relative to `server.js`).

**Fix:**
```dockerfile
# start.sh — correct path
echo "exec node /app/server.js" >> /start.sh

# Static assets — relative to where server.js lives
COPY --from=builder --chown=nextjs:nodejs \
    /app/frontend/${FRONTEND_NAME}/.next/static \
    ./.next/static

COPY --from=builder --chown=nextjs:nodejs \
    /app/frontend/${FRONTEND_NAME}/public \
    ./public
```

---

### 3. `init-db.sql` volume mount depends on Postgres data volume state

`docker-compose.yml:74`:
```yaml
- ./infrastructure/docker/init-db.sql:/docker-entrypoint-initdb.d/init-db.sql:ro
```

Postgres only executes `initdb` scripts on **first boot** when the data volume is empty. On every subsequent deploy (with existing `pg_data` volume), the file is mounted but never runs. This is correct behavior — but if the volume is ever lost (VPS wipe, `docker compose down -v`), all 12 databases must be recreated manually.

**Action:** Document in the runbook that losing `pg_data` requires re-seeding. Add a backup cron job on the VPS (e.g., `pg_dumpall` nightly to a mounted backup volume or object storage).

---

## HIGH — Reliability and correctness

### 4. No HTTP → HTTPS redirect in Traefik labels

All 6 public services (`api-gateway`, `tenant-portal`, `platform-portal`, `landing`) only define the `websecure` entrypoint. Users hitting `http://` get a Traefik 404 instead of a redirect.

**Fix:** Add a redirect router for each public service:
```yaml
labels:
  # existing websecure labels ...
  - "traefik.http.routers.tenant-portal-http.rule=Host(`${TENANT_DOMAIN}`)"
  - "traefik.http.routers.tenant-portal-http.entrypoints=web"
  - "traefik.http.routers.tenant-portal-http.middlewares=https-redirect@docker"
```

Verify that `https-redirect@docker` (or equivalent) is pre-configured by Dokploy's Traefik instance before deploying. Check the Traefik dashboard under Middlewares.

---

### 5. Redis `depends_on: service_healthy` missing from most backend services

`x-spring-env` injects `REDIS_HOST`/`REDIS_PORT`/`REDIS_PASSWORD` into **every** service. Services using Spring Session, rate limiting, or caching will attempt a Redis connection at startup. Only `api-gateway` declares `depends_on: redis: condition: service_healthy`. Services like `integration-hub-service` and `analytics-service` can start before Redis is ready, log connection errors, and report degraded health until Redis recovers.

`restart: unless-stopped` will recover them, but it introduces unnecessary startup churn.

**Fix:** Add Redis health dependency to services that actively connect at startup:
```yaml
# Either extend x-java-defaults, or add individually to:
# integration-hub-service, analytics-service, compliance-service
depends_on:
  redis:
    condition: service_healthy
```

---

### 6. Docker builds run on every branch push, not just master

`ci.yml:102`: `if: github.event_name == 'push'` triggers the full `docker-build` matrix (13 jobs × `bootJar` + Docker build) and `docker-frontend` (3 jobs) on every push to `feature/**` and `fix/**`. Images are built but not pushed. This wastes 30–45 CI minutes per feature branch commit for artifacts that are discarded.

**Fix:**
```yaml
docker-build:
  if: github.ref == 'refs/heads/master' && github.event_name == 'push'
docker-frontend:
  if: github.ref == 'refs/heads/master' && github.event_name == 'push'
```

Feature branch validation is already covered by the `build-and-test` and `frontend` jobs.

---

### 7. JAR glob in `Dockerfile.service` can match both fat and plain JARs

`Dockerfile.service:19`:
```dockerfile
COPY services/${SERVICE_NAME}/build/libs/*.jar app.jar
```

Spring Boot generates both `service-name-SNAPSHOT.jar` (fat) and `service-name-SNAPSHOT-plain.jar` (thin). If any service module enables the plain jar task alongside `bootJar`, the glob matches two files and `COPY` fails with "multiple source files but destination is not a directory."

**Fix:**
```dockerfile
COPY services/${SERVICE_NAME}/build/libs/*[!plain].jar app.jar
```
Or disable the plain jar globally in root `build.gradle.kts`:
```kotlin
tasks.named("jar") { enabled = false }
```

---

## MEDIUM — Operational and maintainability gaps

### 8. `GHCR_OWNER` has no default or validation

`docker-compose.yml:142`: `image: ghcr.io/${GHCR_OWNER}/andikisha/auth-service:latest`

If `.env` on the VPS does not define `GHCR_OWNER`, Docker resolves this to `ghcr.io//andikisha/auth-service:latest`. Every image pull fails with a confusing registry 404 rather than a clear "variable not set" message.

**Fix:** Add validation in the compose file:
```yaml
# Forces a clear error at `docker compose config` time if unset
image: ghcr.io/${GHCR_OWNER:?GHCR_OWNER must be set in .env}/andikisha/auth-service:latest
```
Note: YAML anchors make this verbose to apply to every service — a wrapper validation script or a pre-deploy hook in CI is cleaner.

---

### 9. `.env.example` is in the wrong directory

`docker-compose.yml` lives at repo root. Docker Compose reads `.env` from the same directory as the compose file (repo root). The example template is at `infrastructure/docker/.env.example`. Anyone setting up from scratch looks in the wrong place.

**Fix:** Move `.env.example` to the repo root alongside `docker-compose.yml`, or add a prominent comment at the top of `docker-compose.yml`:
```yaml
# Prerequisites:
#   cp infrastructure/docker/.env.example .env
#   # then fill in .env at the repo root
```

---

### 10. `LANDING_DOMAIN` missing from compose header and secrets documentation

`docker-compose.yml:14–17` documents three domain variables (`TENANT_DOMAIN`, `PLATFORM_DOMAIN`, `API_DOMAIN`) but omits `LANDING_DOMAIN`, which is used by the `landing` service at line 526. `infrastructure/docs/github-secrets.md` documents AWS secrets only — no entry for `DOKPLOY_WEBHOOK_URL` or any domain variable.

**Fix:** Update the comment block at the top of `docker-compose.yml` to include `LANDING_DOMAIN`. Add a Dokploy section to `github-secrets.md`:

| Secret | Description |
|--------|-------------|
| `DOKPLOY_WEBHOOK_URL` | Redeploy webhook from Dokploy → Deployments tab |
| `GHCR_OWNER` | GitHub username/org (lowercase) owning the ghcr.io packages |
| `API_DOMAIN` | Public API hostname (e.g. `api.andikisha.co.ke`) |
| `TENANT_DOMAIN` | Tenant portal hostname |
| `PLATFORM_DOMAIN` | Platform portal hostname |
| `LANDING_DOMAIN` | Landing site hostname |

---

### 11. Full stack restarts on every push — no per-service deployment

The Dokploy webhook triggers a redeploy of the **entire** compose stack. Every master push restarts all 16 containers including Postgres, RabbitMQ, and Redis. Stateful infrastructure does not need to restart for application code changes.

**Options:**
- **Option A (easy — accept for staging):** Add `stop_grace_period: 30s` to Postgres, RabbitMQ, and Redis so connections drain before containers stop.
- **Option B (better for production):** Split infrastructure services into a separate Dokploy compose service (`andikisha-infra`) without a webhook trigger. Deploy application services and frontends independently.

---

### 12. `:latest` tag in compose — no rollback path

All images are pinned to `:latest` in `docker-compose.yml`. CI pushes both `:latest` and `:<sha>`, but the compose never references the SHA tag. A bad deploy requires manually editing the compose file on the VPS to roll back.

**Fix:** Add a `RELEASE_TAG` variable with a fallback:
```yaml
image: ghcr.io/${GHCR_OWNER}/andikisha/auth-service:${RELEASE_TAG:-latest}
```
Rollback becomes: set `RELEASE_TAG=<previous-sha>` in Dokploy env vars → redeploy. No VPS SSH required.

---

### 13. No post-deploy health verification in CI

`notify-dokploy` fires the webhook and exits. If a new image crashes on startup, CI reports green because the webhook returned 200.

**Fix:** After the webhook call, poll the public health endpoint:
```yaml
- name: Wait for deploy health
  run: |
    sleep 60
    for i in {1..10}; do
      STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://${API_DOMAIN}/actuator/health)
      [ "$STATUS" = "200" ] && echo "Deploy healthy" && exit 0
      echo "Attempt $i: status $STATUS — retrying in 15s..."
      sleep 15
    done
    echo "Deploy did not become healthy after 10 attempts" && exit 1
  env:
    API_DOMAIN: ${{ secrets.API_DOMAIN }}
```

---

## LOW — Housekeeping

| # | File | Issue | Recommended Fix |
|---|------|-------|-----------------|
| 14 | `Dockerfile.service:23` | `EXPOSE 8080 9090` is wrong — services run on 8081–8092 / 9081–9092 | Change to `EXPOSE 8080-8092 9080-9092` or remove; documentation-only in compose context |
| 15 | `docker-compose.yml:410` | `audit-service` has no `GRPC_PORT` — appears intentional (event-driven only) but undocumented | Add a comment confirming audit-service is REST + events only, no gRPC server |
| 16 | `ci.yml:163` | `docker/build-push-action@v5` — v6 is current | Update to `@v6` |
| 17 | `docker-compose.yml` | No `healthcheck` on frontend services (`tenant-portal`, `platform-portal`, `landing`) | Add `wget -qO- http://localhost:3000/` healthchecks so Dokploy can report container health |
| 18 | `docker-compose.yml` | `zipkin` is only on `internal` network with no Traefik label — trace UI unreachable without SSH tunnel | Add Traefik label with basic-auth middleware, or document the `docker exec` / SSH tunnel access pattern |
| 19 | `ci.yml:82` | `gitleaks/gitleaks-action@v2` requires `GITLEAKS_LICENSE` for private repos on some plans | Verify it works; fallback: `trufflesecurity/trufflehog-actions-scan` |
| 20 | `docker-compose.yml` | `deploy.resources.limits` without `reservations` — limits on a single-host compose are soft hints only | Add `reservations.memory` at ~40% of the limit for each service |

---

## Priority Order for Remediation

| Priority | Fix | Effort |
|----------|-----|--------|
| 1 | Delete `cd-staging.yml` and `cd-production.yml` | 2 min |
| 2 | Fix `Dockerfile.frontend` standalone server paths | 15 min |
| 3 | Gate Docker builds to master only in `ci.yml` | 5 min |
| 4 | Add HTTP → HTTPS redirect Traefik labels | 20 min |
| 5 | Move `.env.example` to repo root | 2 min |
| 6 | Add `GHCR_OWNER` validation / document all required vars | 10 min |
| 7 | Fix JAR glob in `Dockerfile.service` | 5 min |
| 8 | Add `RELEASE_TAG` rollback mechanism to compose | 15 min |
| 9 | Add post-deploy health check to `notify-dokploy` job | 20 min |
| 10 | Add Redis `depends_on: service_healthy` to relevant services | 10 min |
