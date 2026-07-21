# Local build freshness — design (DEV-BACKLOG-002)

**Date:** 2026-07-20 · **Status:** implemented

## Problem

Locally the backend runs from pre-built artifacts, and "I changed code" is separated from
"the running process reflects my code" by manual steps that fail silently:

- **Compose loop** (`docker-compose.full.yml`): services run as `andikisha/<svc>:local` images.
  `Dockerfile.service` only *copies* a pre-built fat jar — it does not compile. Two staleness layers:
  (A) `docker compose up` reuses the existing image tag and never rebuilds unless `--build` is passed;
  (B) even `--build` re-COPYs whatever jar is already in `build/libs`, so without a prior `bootJar` the
  "rebuilt" image is still stale.
- **Bare-JVM loop** (`scripts/restart-services.sh`): runs `java -jar …/build/libs/<svc>-*.jar`; header
  states it does not rebuild.

Both consume `build/libs/*.jar` as a given. Nothing warns when it is out of date. This burned Run R1: a
pre-W1 `api-gateway` image had no recruitment route, so every call 404'd until the image was rebuilt.

## Approach (chosen)

Paved-path command + freshness guard. Rejected a multi-stage in-container Gradle build (correct for CI
reproducibility, but no daemon / cold cache / full rebuild per change makes the local loop painfully slow;
CI already builds jar-then-image correctly and needs nothing).

### 1. `scripts/redeploy.sh [--jvm] <svc…>`
Atomic build→run, per service. Order matters: `bootJar` first (Gradle on host = warm daemon/incremental),
then refresh the running artifact.
- compose (default): `docker compose -f infra -f full up -d --build --no-deps --force-recreate <svc>` —
  `--no-deps` + naming only the targets keeps the other services (and the Redis licence cache) untouched.
- `--jvm`: `scripts/restart-services.sh restart <svc>` (extended to accept service-name filters).
- No args → usage + exit 2. Unknown service → exit 2.
- `make redeploy SVC="…" [JVM=1]`.

### 2. Freshness stamp + `scripts/doctor.sh`
- `com.gorylenko.gradle-git-properties` applied to every bootable module via the root
  `subprojects { plugins.withId("org.springframework.boot") { … } }` hook (`failOnNoGitDirectory=false`).
  Bakes `git.properties` onto the classpath; Spring actuator auto-exposes it at `/actuator/info` (already
  in the exposed set on all services).
- `doctor.sh` curls each running service's `/actuator/info`, extracts the commit id (handles both actuator
  `simple` string shape and `full` object shape), and classifies `ok` / `STALE` / `down` / `no-stamp` vs
  `git rev-parse HEAD`; warns on a dirty working tree; exits non-zero on any STALE. `make doctor [SVC=…]`.
  Loop-agnostic — reads the artifact's own HTTP stamp, nothing Docker-specific.

## Boundaries / impact

- Four of five artifacts are local-only (redeploy, doctor, restart-services edit, Makefile) — never touched
  by CI or Dokploy.
- The git-properties build change flows to prod images (CI builds jar → bakes into ghcr image → Dokploy
  pulls). Only runtime effect: `/actuator/info` gains a `git` block. Not publicly routed (Traefik routes API
  paths; gateway does not proxy `/actuator/**`; only internal healthchecks hit `/actuator/health`). No API,
  schema, migration, event, gRPC, port, or startup change. CI's shallow `fetch-depth: 1` still resolves the
  commit id; `failOnNoGitDirectory=false` keeps odd checkouts from failing the build.
- New services inherit the stamp automatically via the subprojects hook — add the port to `doctor.sh`'s list.

## Known trade-off

git-properties records `git.build.time`, so rebuilding the same commit yields a slightly different jar
(non-reproducible). Harmless for normal work; if reproducible per-commit image digests are ever wanted,
exclude the build-time keys (`doctor` only needs the commit id).

## Verification

- `git.properties` confirmed baked into `recruitment-service` jar with the correct abbreviated SHA (and
  `git.dirty=true`).
- `doctor.sh` extractor + classification proven against stub servers emitting Spring's `simple`, stale, and
  `full` JSON shapes (ok / STALE / ok respectively).
- Script guards (no-args usage, unknown-service rejection) exercised for `redeploy.sh`, `doctor.sh`,
  `restart-services.sh`, and the `make` targets.
- **Deferred (needs a running stack):** live boot of a service to confirm `/actuator/info` serves the git
  block in situ. The jar-contents + parser proofs cover the contract; this is the one link not exercised
  against a live Spring context.
