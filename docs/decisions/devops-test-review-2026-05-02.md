# DevOps, Test Coverage, and Observability Review
**Date:** 2026-05-02  
**Reviewer:** Claude (automated scan)  
**Scope:** All 13 AndikishaHR microservices + shared modules  

---

## Executive Summary

The platform is in good structural shape: all 13 services have context load tests, logback-spring.xml, and micrometer tracing; the CI/CD pipeline uses OIDC (not long-lived AWS keys) and Checkstyle runs in CI. The two most dangerous gaps are: (1) the base `kustomization.yaml` directly references `secret-template.yaml`, which means a `kubectl apply -k .` without pre-substitution silently deploys `CHANGE_ME` secrets to the cluster — this is a production-ready blocker; and (2) the `integration-hub-service` K8s manifest is missing `REDIS_PORT` (no default in `application.yml`), which causes a startup failure the moment M-Pesa or rate-limiting Redis paths are hit. Rollout monitoring in both CD pipelines only covers 4 of 13 services, so 9 deployments can fail silently after a release. Test coverage is solid for the critical tax and auth paths but has three notable holes: `KenyanTaxCalculatorTest` does not test the exact PAYE band edges (KES 24,000 and KES 32,300), `MpesaSourceIpFilterTest` does not test the `disabled=true` bypass flag, and `audit-service`/`document-service`/`notification-service` have no `ApplicationContextTest`.

---

## Part A: Test Coverage

### A1. Test Inventory

Test counts by category (unit / integration / e2e):

| Service | Unit | Integration | E2E | Context Load |
|---------|------|-------------|-----|--------------|
| analytics-service | 9 | 4 | 2 | PASS |
| api-gateway | 5* | 0 | 0 | PASS |
| audit-service | 1 | 1 | 1 | PASS |
| auth-service | 3 | 0 | 1 | PASS |
| compliance-service | 3 | 1 | 1 | PASS |
| document-service | 2 | 1 | 1 | **MISSING** |
| employee-service | 2 | 2 | 1 | PASS |
| integration-hub-service | 4 | 11 | 4 | PASS |
| leave-service | 5 | 2 | 1 | PASS |
| notification-service | 1 | 1 | 1 | **MISSING** |
| payroll-service | 4 | 1 | 1 | PASS |
| tenant-service | 5 | 1 | 1 | PASS |
| time-attendance-service | 1 | 1 | 1 | PASS |

*api-gateway tests reside under `config/`, `controller/`, and `filter/` subdirectories rather than the canonical `unit/`, `integration/`, `e2e/` layout. No integration tests exist because the gateway is Spring WebFlux reactive — this is acceptable, but it means zero Testcontainers coverage for Redis rate-limit and RabbitMQ lock-release paths.

**Services with zero integration tests:** `api-gateway`, `auth-service`. Auth-service has no repository integration test, so Flyway migration correctness and index usage are never verified under Testcontainers.

---

### A2. Critical Path Test Coverage

| Class | Test File Exists | Method Count | Boundary Coverage |
|-------|-----------------|--------------|-------------------|
| `KenyanTaxCalculator` | PASS | 7 | **PARTIAL** — see below |
| `LeaveService` | PASS | 20 | PASS — approval, rejection, self-approval guard, optimistic lock paths covered |
| `PayrollService` | PASS | 17 | PASS — initiate, calculate, approve flows present |
| `AuthService` | PASS | 21 | PASS — login, refresh, lockout, inactive user all covered |
| `SuperAdminAuthService` | PASS | 10 | PASS |
| `TenantService` | PASS | 11 | PASS — provisioning and gRPC stubs present |
| `JwtAuthenticationFilter` | PASS | 11 | PASS — token validation, header injection, public path bypass, X-Internal-Request stripping all present |
| `MpesaSourceIpFilter` | PASS | 3 | **PARTIAL** — disabled flag bypass not tested |
| `Money` (shared-common) | PASS | 21 | PASS |

#### A2a. KenyanTaxCalculator boundary gap (HIGH)

The test covers gross salaries of 15,201 / 25,000 / 50,000 / 100,000 / 150,000 / 300,000 / 500,000 / 800,000 / 1,000,000. It **does not** test the exact band transition points: KES 24,000 (Band 1→2), KES 32,300 (Band 2→3), or KES 500,000 (Band 3→4). Off-by-one errors at these transitions would produce wrong PAYE for a significant employee population. The implementation uses `BAND_2_LIMIT = bd(32300)` — if this were ever changed to `32333` (the common alternative) without a corresponding test, no test would fail.

**Fix:** Add `@ParameterizedTest` cases for exactly `24_000`, `24_001`, `32_300`, `32_301`, `500_000`, `500_001`, `800_000`, `800_001` asserting the PAYE gross tax before relief for each.

#### A2b. MpesaSourceIpFilter disabled flag (MEDIUM)

The filter accepts a `boolean disabled` constructor parameter. When `disabled=true`, all IPs should pass. There is no test covering `new MpesaSourceIpFilter(allowedCidrs, true)` with an unknown IP. If this guard is ever broken, Safaricom IP filtering fails open but operators cannot detect it because the flag defaults to `false` in tests.

**Fix:** Add a `filter_whenDisabled_unknownIpPasses()` test method.

---

### A3. Application Context Load Tests

**Missing context load tests:**

| Service | Finding |
|---------|---------|
| `document-service` | No `DocumentServiceApplicationTest.java` found. The service has unit + integration + e2e tests but no `@SpringBootTest` smoke to catch misconfigured beans at startup. |
| `notification-service` | Same gap — no `NotificationServiceApplicationTest.java`. |

All other 11 services have a context load test: PASS.

---

### A4. Test Quality Spot-Check

#### KenyanTaxCalculatorTest — GOOD with one gap
- Covers: typical salary (150K), basic vs gross split, minimum wage (15,201), high salary (1M), accounting identity across 9 salary points, HELB deduction, NSSF cap.
- Happy and error paths: happy path only (no test for negative/zero gross, which `calculate()` does not guard against at the API level).
- **Gap:** No exact band-edge values for PAYE brackets 1→2 and 2→3. The 25,000 case is in band 2 but is not the transition point. See A2a.
- Quality verdict: **GOOD** for what it covers; band-edge gap is the one material risk.

#### AuthServiceTest — STRONG
- Covers: register (happy + duplicate email + duplicate phone), login (happy + wrong password + nonexistent + locked + inactive), refresh (happy + token not found + revoked), changePassword (happy + wrong current), logout, getUser (happy + not found), checkPermission (SUPER_ADMIN + regular role + inactive user), getUserByEmployeeId (happy + not found).
- Uses `@Nested` classes for readability. TenantContext is set and cleared in `@BeforeEach`/`@AfterEach` — correct.
- Error paths: well covered.
- **Minor:** No test for the concurrent login race condition (two simultaneous logins revoking each other's tokens). This is unlikely to be caught in unit tests anyway.
- Quality verdict: **STRONG**.

#### LeaveControllerTest — STRONG
- 31 test methods covering all 7 endpoints with happy and error paths, missing header validation, role-based 403, business rule 422, not-found 404, validation failures.
- Uses `@WebMvcTest` with the real `SecurityConfig` and `TrustedHeaderAuthFilter` imported — this is the correct pattern.
- Self-approval guard is tested at the service layer (`LeaveServiceTest`) not here, which is appropriate for a controller-layer test.
- Quality verdict: **STRONG**.

---

### A5. Test Infrastructure

`application-test.yml` placement:

| Service | Location | Accessible in Tests? |
|---------|----------|---------------------|
| analytics-service | `src/main/resources/` only | YES — Gradle includes main resources on test classpath |
| api-gateway | `src/main/resources/` only | YES |
| audit-service | `src/main/resources/` only | YES |
| auth-service | Both `main/` and `test/resources/` | YES (`test/` overrides `main/`) |
| compliance-service | Both | YES |
| document-service | `src/main/resources/` only | YES |
| employee-service | Both | YES |
| integration-hub-service | `src/main/resources/` only | YES |
| leave-service | Both | YES |
| notification-service | `src/main/resources/` only | YES |
| payroll-service | Both | YES |
| tenant-service | Both | YES |
| time-attendance-service | `src/main/resources/` only | YES |

All 13 services have `application-test.yml`. Services that only have it in `main/resources/` are still fine — Gradle's default test classpath includes `src/main/resources`, and since there is no `src/test/resources/application-test.yml` to shadow it, the file is picked up. **However**, the lack of a `src/test/resources/` counterpart for 8 services means test-only overrides (e.g., in-process gRPC channels, Testcontainer URLs) cannot be cleanly separated from main-profile config without touching a file that ships in the JAR. This is a maintainability concern, not a correctness bug.

**MEDIUM:** For services with only `src/main/resources/application-test.yml`, move it to `src/test/resources/application-test.yml`. Test configuration has no business being on the production classpath.

---

## Part B: DevOps and Infrastructure

### B1. Kubernetes Manifests Completeness

All 13 service deployment manifests were checked. Summary:

| Check | Result |
|-------|--------|
| `livenessProbe` configured | PASS — all 13 services |
| `readinessProbe` configured | PASS — all 13 services |
| `resources.requests` and `resources.limits` | PASS — all 13 services |
| `terminationGracePeriodSeconds` | PASS — all 13 services (30–60s) |
| `SPRING_PROFILES_ACTIVE: prod` | PASS — all 13 services |
| gRPC port in Deployment container spec | PASS — all services with gRPC |
| gRPC port exposed in Service manifest | **PARTIAL — see below** |

#### B1a. audit-service Service manifest missing gRPC port (HIGH)

`infrastructure/k8s/services/audit-service/service.yaml` exposes only port 8092 (HTTP). The audit-service has a gRPC server implementation (`infrastructure/grpc/` exists in source) and its deployment exposes container port 9092. The `Service` manifest does not expose 9092, so no other pod in the cluster can reach the audit-service over gRPC. Any future caller relying on gRPC to audit-service will fail with connection refused.

**Fix:** Add to `audit-service/service.yaml`:
```yaml
    - name: grpc
      port: 9092
      targetPort: 9092
      protocol: TCP
```

#### B1b. Image tags are `:latest` in all manifests (MEDIUM)

All 13 deployment manifests contain `image: andikisha/{service}:latest`. The CD pipelines correctly use `kustomize edit set image` with `github.sha` tags at deploy time, so the in-repo `:latest` tags are overwritten before deployment. This is an acceptable CI pattern **only if** `kustomize edit set image` is always run before `kubectl apply`. The current staging CD does run it, but if anyone applies the manifest directly without going through the pipeline (e.g., a manual emergency `kubectl apply -k .`), all 13 services will pull `:latest`, which is an unversioned, potentially stale image.

**Recommendation:** Change the base manifests to use a recognisable placeholder tag such as `DOCKER_TAG_PLACEHOLDER` to make the direct-apply risk obvious rather than silently pulling floating `:latest`.

---

### B2. Secret Management

#### B2a. CRITICAL: `secret-template.yaml` included directly in base `kustomization.yaml`

`infrastructure/k8s/base/kustomization.yaml` lists `secret-template.yaml` as a resource:
```yaml
resources:
  - secret-template.yaml   # <-- THIS IS THE PROBLEM
```

Every `kubectl apply -k infrastructure/k8s` — including the staging and production CD steps — will apply the secret template, which sets every credential to the literal string `"CHANGE_ME"`. If the `andikisha-secrets` Secret already exists in the cluster from a prior apply (containing real values), `kubectl apply` will overwrite it with `CHANGE_ME` strings. This is a **silent credential wipe on every deployment**.

**Fix:** Remove `secret-template.yaml` from `kustomization.yaml`. The template is documentation only — it should never be applied by kustomize. Use External Secrets Operator (already referenced in `github-secrets.md`) or Sealed Secrets to provide the actual Secret object. The template comment already says "DO NOT COMMIT REAL VALUES" but including it in kustomize resources defeats that intent.

#### B2b. `github-secrets.md` uses a lazy placeholder (LOW)

The secrets table lists `*(one pair per remaining service)*` instead of enumerating all 11 remaining service DB credential pairs. This incomplete documentation means a new team member cannot know exactly which secrets must exist in AWS Secrets Manager before deploying. This is a documentation gap, not a runtime failure.

**Fix:** Expand the table to list all 13 service credential pairs explicitly (compliance, time, leave, document, notification, integration, analytics, audit).

---

### B3. CI/CD Pipeline Review

| Check | CI | Staging CD | Production CD |
|-------|----|-----------|---------------|
| Checkstyle runs | PASS | n/a | n/a |
| Tests run | PASS | n/a (tests run in CI before CD) | n/a |
| OIDC (not long-lived keys) | n/a | PASS | PASS |
| Human confirmation gate | n/a | n/a | PASS (`confirm == 'DEPLOY'` + `environment: production`) |
| `concurrency` group to cancel stale runs | PASS (CI) | **MISSING** | **MISSING** |
| Docker image tagged with git SHA | PASS (CI builds with `${{ github.sha }}`) | PASS | PASS (promotes SHA tag) |
| Rollout wait before declaring success | n/a | **PARTIAL** — 4 of 13 services | **PARTIAL** — 4 of 13 services |
| Secrets exposed in logs | PASS — no `echo $SECRET` patterns found | PASS | PASS |

#### B3a. No `concurrency` group in staging/production CD (MEDIUM)

CI has `concurrency: group: ${{ github.workflow }}-${{ github.ref }}, cancel-in-progress: true`. The staging and production CD workflows do not. If two commits land on `master` in quick succession, two staging deployments can run in parallel, racing to `kustomize edit set image` and `kubectl apply`. The second run's kustomize edit may overwrite the first's tag before the first finishes applying, leaving the cluster with an inconsistent image mix across deployments.

**Fix:** Add to both CD workflows:
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: false   # don't cancel — queue them, older one wins its slot
```
Use `cancel-in-progress: false` so a in-flight production deploy is never killed mid-rollout.

#### B3b. Rollout monitoring covers only 4 of 13 services (MEDIUM)

Staging CD waits for: `api-gateway`, `auth-service`, `payroll-service`, `employee-service`.  
Production CD waits for: `api-gateway`, `auth-service`, `payroll-service`, `leave-service`.  

Nine services (`compliance-service`, `time-attendance-service`, `document-service`, `notification-service`, `integration-hub-service`, `analytics-service`, `audit-service`, `tenant-service` in staging, `employee-service` in production) can fail their rollout and the pipeline still declares success with exit 0. A broken `tenant-service` deployment would prevent new tenant onboarding silently.

**Fix:** Add all 13 services to the rollout wait loop in both CD pipelines. Use a `timeout=10m` to match production.

#### B3c. Staging CD rebuilds JARs and Docker images from scratch (LOW)

The staging CD re-runs `./gradlew bootJar` and `docker build` rather than promoting the images already verified by the CI `docker-build` job. This means staging deploys images that were never scanned or verified by CI's build matrix. The CI images are pushed with `push: false` (not pushed to any registry), so promotion is not currently possible.

**Recommendation:** Either (a) have CI push images to ECR with `github.sha` tags and have staging CD pull-and-push rather than rebuild, or (b) accept the current approach but add `docker scout` or `trivy` image scanning to the staging build step.

---

### B4. Docker Compose Full-Stack

`docker-compose.full.yml` does not exist — only `docker-compose.infra.yml` is present in `infrastructure/docker/`. See Part C1 for impact.

Review of `docker-compose.infra.yml`:

| Check | Result |
|-------|--------|
| All PostgreSQL services have healthchecks | PASS — all 12 instances have `pg_isready` healthchecks |
| RabbitMQ has healthcheck | PASS — `rabbitmq-diagnostics ping` |
| Redis has healthcheck | PASS — `redis-cli ping` |
| Zipkin image pinned to digest | PASS — `openzipkin/zipkin@sha256:d17e856...` |
| Passwords externalized to env-var substitution | PASS — all passwords use `${VAR:-changeme}` pattern |
| No hardcoded passwords | PASS |

Docker Compose infra is clean. The `changeme` fallback defaults are acceptable for local development given they are clearly labelled and the services have no external network exposure in this file.

---

### B5. Observability

| Check | Result |
|-------|--------|
| `logback-spring.xml` in all 13 services | PASS — confirmed 13 files |
| `micrometer-tracing-bridge-brave` in all 13 `build.gradle.kts` | PASS — confirmed 13 |
| Actuator Prometheus endpoint exposed | PASS — verified in payroll, integration-hub, tenant (all three checked) |

#### B5a. `logback-spring.xml` JSON field review (payroll-service) — PASS

The payroll-service logback config (representative of all 13, which share the same template) includes:
- `service` — via `customFields` from `spring.application.name` ✓
- `env` — via `customFields` from `spring.profiles.active` ✓
- `tenantId` — via `includeMdcKeyName` ✓
- `requestId` — via `includeMdcKeyName` ✓
- `traceId` — via `includeMdcKeyName` ✓
- `spanId` — via `includeMdcKeyName` ✓

JSON output is only active for `prod` and `staging` profiles. Dev/test uses human-readable output. This is the correct pattern.

**MEDIUM — one gap:** The dev/test pattern log format includes `%X{tenantId:-no-tenant}` but not `traceId` or `requestId`. This makes local debugging of distributed trace correlation harder. Non-blocking.

---

### B6. Dockerfile Review — PASS (all checks)

`infrastructure/docker/Dockerfile.service`:

| Check | Result |
|-------|--------|
| Non-root user | PASS — `addgroup appgroup && adduser appuser`, `USER appuser` before ENTRYPOINT |
| JRE (not JDK) in runtime stage | PASS — `FROM eclipse-temurin:21-jre-alpine` |
| `-XX:+UseContainerSupport` | PASS |
| `-XX:MaxRAMPercentage=75.0` | PASS (better than fixed `-Xmx`) |
| Fat JAR from build stage (multi-stage) | PASS — `COPY --from=builder` |
| Pinned base image | **PARTIAL** — `eclipse-temurin:21-jdk-alpine` and `eclipse-temurin:21-jre-alpine` use floating Alpine tags. A patch to the Alpine base could change the image silently. For full reproducibility, pin to digest (`eclipse-temurin:21-jre-alpine@sha256:...`). Acceptable for now given the JRE tag is version-pinned. |

No critical findings in the Dockerfile.

---

## Part C: Integration Gaps

### C1. docker-compose.full.yml Missing (HIGH)

`infrastructure/docker/docker-compose.full.yml` does not exist. The file is referenced in architectural discussions and would be the standard way to run all 13 services locally for integration testing or demos. Developers have no single-command way to spin up the complete application stack.

**Impact:** No local full-stack testing, no Testcontainers baseline for cross-service smoke tests. All 13 services are left to be tested only against their individual databases/brokers.

**Fix:** Create `docker-compose.full.yml` that extends `docker-compose.infra.yml` and adds all 13 service containers with the per-service env vars mapped to their application.yml variables.

---

### C2. Environment Variable Completeness

#### payroll-service — PASS

All env vars required by `application.yml` without defaults are present in the K8s deployment: `DB_HOST`, `DB_NAME`, `DB_PASSWORD`, `DB_PORT`, `DB_USERNAME`, `EMPLOYEE_SERVICE_HOST`, `LEAVE_SERVICE_HOST`, `RABBITMQ_HOST`, `RABBITMQ_PASSWORD`, `RABBITMQ_PORT`, `RABBITMQ_USERNAME`.

The `${VAR_NAME}` reference on line 7 of `application.yml` is a documentation comment, not a live variable reference. No gap.

#### integration-hub-service — CRITICAL GAP

`application.yml` requires `${REDIS_PORT}` (no default). The K8s deployment provides `REDIS_HOST` but **does not provide `REDIS_PORT`**. On startup in Kubernetes, Spring Boot will fail to bind the Redis connection because `${REDIS_PORT}` resolves to the literal string `${REDIS_PORT}`.

Additionally, the following vars are in `application.yml` with defaults but absent from K8s (operators cannot override them):
- `MPESA_ENABLED` (default `false`) — cannot be turned on in prod without adding to manifest
- `MPESA_ENV` (default `sandbox`) — prod must be `production` but there is no mechanism to set it
- `MPESA_CALLBACK_IP_VALIDATION_DISABLED` (default `false`) — not overridable from K8s
- `MPESA_CALLBACK_ALLOWED_CIDRS` — not overridable from K8s
- `REDIS_PASSWORD` — has an empty default but should be set in prod via secret

The `REDIS_PORT` absence is a startup-breaking omission. All others are operational gaps that prevent M-Pesa from being enabled in production without editing the manifest.

**Fix:** Add to `integration-hub-service/deployment.yaml`:
```yaml
- name: REDIS_PORT
  value: "6379"
- name: REDIS_PASSWORD
  valueFrom:
    secretKeyRef:
      name: andikisha-secrets
      key: redis-password
- name: MPESA_ENABLED
  value: "false"      # override to "true" in a separate prod overlay
- name: MPESA_ENV
  value: "sandbox"    # override to "production" in prod overlay
```

#### tenant-service — MEDIUM GAP

`application.yml` references `${REDIS_PORT:6379}`, `${REDIS_PASSWORD:}`, and `${REDIS_HOST:localhost}` — all have defaults. The K8s deployment provides `REDIS_HOST` but not `REDIS_PORT` or `REDIS_PASSWORD`. In production, Redis requires authentication. The empty default for `REDIS_PASSWORD` means the service will attempt an unauthenticated Redis connection, which will be rejected by the Redis instance that requires `requirepass`.

**Fix:** Add to `tenant-service/deployment.yaml`:
```yaml
- name: REDIS_PORT
  value: "6379"
- name: REDIS_PASSWORD
  valueFrom:
    secretKeyRef:
      name: andikisha-secrets
      key: redis-password
```

---

## Finding Summary Table

| # | Severity | Area | Location | Finding |
|---|----------|------|----------|---------|
| 1 | CRITICAL | Secret Management | `infrastructure/k8s/base/kustomization.yaml` | `secret-template.yaml` is a kustomize resource — every `kubectl apply -k` overwrites all secrets with `CHANGE_ME` strings |
| 2 | CRITICAL | Env Var | `infrastructure/k8s/services/integration-hub-service/deployment.yaml` | `REDIS_PORT` missing — startup failure when Redis is configured |
| 3 | HIGH | Test Coverage | `payroll-service/unit/KenyanTaxCalculatorTest.java` | No test for PAYE band edges at KES 24,000 and KES 32,300 — off-by-one errors go undetected |
| 4 | HIGH | K8s Manifest | `infrastructure/k8s/services/audit-service/service.yaml` | gRPC port 9092 not exposed — intra-cluster gRPC calls to audit-service will fail |
| 5 | HIGH | docker-compose | `infrastructure/docker/` | `docker-compose.full.yml` does not exist — no single-command local full-stack environment |
| 6 | MEDIUM | Env Var | `infrastructure/k8s/services/integration-hub-service/deployment.yaml` | `MPESA_ENABLED`, `MPESA_ENV`, `MPESA_CALLBACK_*`, `REDIS_PASSWORD` absent — M-Pesa cannot be enabled in prod without manifest changes |
| 7 | MEDIUM | Env Var | `infrastructure/k8s/services/tenant-service/deployment.yaml` | `REDIS_PORT` and `REDIS_PASSWORD` absent — Redis auth will fail in prod |
| 8 | MEDIUM | CI/CD | `.github/workflows/cd-staging.yml`, `cd-production.yml` | No `concurrency` group — concurrent pushes can race on `kustomize edit set image` |
| 9 | MEDIUM | CI/CD | Both CD pipelines | Rollout monitoring covers only 4 of 13 services — 9 services can fail silently |
| 10 | MEDIUM | Test Coverage | `integration-hub-service` | `MpesaSourceIpFilterTest` does not test `disabled=true` bypass — filter regression goes undetected |
| 11 | MEDIUM | Test Infrastructure | `analytics-service`, `api-gateway`, `audit-service` (and 5 others) | `application-test.yml` in `src/main/resources/` rather than `src/test/resources/` — test config ships in production JAR |
| 12 | MEDIUM | Test Coverage | `document-service`, `notification-service` | No `ApplicationContextTest` — misconfigured beans not caught at startup |
| 13 | MEDIUM | Test Coverage | `api-gateway`, `auth-service` | Zero Testcontainers integration tests — Flyway migrations and Redis/RabbitMQ behaviour untested |
| 14 | MEDIUM | K8s Manifest | All 13 deployment manifests | Image tag `:latest` in manifests — direct `kubectl apply` without pipeline will pull unversioned image |
| 15 | LOW | Documentation | `infrastructure/docs/github-secrets.md` | Secrets table uses lazy placeholder `*(one pair per remaining service)*` — incomplete for onboarding |
| 16 | LOW | CI/CD | `.github/workflows/cd-staging.yml` | Staging rebuilds JARs/images rather than promoting CI-verified images — no continuity of artefact |
| 17 | LOW | Observability | `logback-spring.xml` (dev profile) | Dev/test log pattern omits `traceId` and `requestId` — local debugging of distributed traces is harder |
| 18 | PASS | Dockerfile | `infrastructure/docker/Dockerfile.service` | Non-root user, JRE runtime, container-aware JVM flags, multi-stage build — all correct |
| 19 | PASS | Observability | All 13 services | `logback-spring.xml` present; all JSON fields (`service`, `env`, `tenantId`, `requestId`, `traceId`, `spanId`) present |
| 20 | PASS | Observability | All 13 services | `micrometer-tracing-bridge-brave` dependency present in all 13 build files |
| 21 | PASS | Observability | payroll, integration-hub, tenant (spot-check) | Actuator Prometheus endpoint exposed |
| 22 | PASS | K8s Probes | All 13 services | `livenessProbe`, `readinessProbe`, resource requests/limits, `terminationGracePeriodSeconds` all set |
| 23 | PASS | Docker Compose | `docker-compose.infra.yml` | All PostgreSQL, RabbitMQ, Redis healthchecks present; Zipkin pinned to digest; passwords externalized |
| 24 | PASS | CI/CD | `.github/workflows/ci.yml` | Checkstyle runs, tests run, `concurrency` cancel-in-progress configured, images tagged with git SHA |
| 25 | PASS | CI/CD | CD pipelines | OIDC used for AWS credentials — no long-lived keys |
| 26 | PASS | CI/CD | Production CD | Human gate (`confirm == 'DEPLOY'`) + `environment: production` approval required |
| 27 | PASS | Context Tests | 11 of 13 services | `ApplicationTest` present — missing only `document-service` and `notification-service` |
| 28 | PASS | Test Quality | `AuthServiceTest` | 21 methods; strong coverage of all auth flows and edge cases |
| 29 | PASS | Test Quality | `LeaveControllerTest` | 31 methods; full endpoint coverage including RBAC and validation paths |
