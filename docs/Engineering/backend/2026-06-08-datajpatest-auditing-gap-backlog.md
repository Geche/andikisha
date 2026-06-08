# BACKLOG — audit `@DataJpaTest` slices for the JPA-auditing gap

**Severity:** Medium — latent broken tests, not a production defect. Risk is a
red CI that appears only when a module's Gradle test cache is invalidated, so it
lands on an unrelated change and blocks an unrelated merge.
**Date:** 2026-06-08 · **Surfaced by:** the design-system/redis merge
(`e1aa62e`) — adding `RedisPasswordStartupGuard` to analytics- and
integration-hub-service invalidated their test caches, forcing a real run that
exposed pre-existing `@DataJpaTest` failures.
**Component:** test infrastructure — `@DataJpaTest` slices vs. `BaseEntity`
auditing (`shared/andikisha-common`).

## Root cause

`BaseEntity` (shared) populates `created_at` / `updated_at` via
`@CreatedDate` / `@LastModifiedDate` + `@EntityListeners(AuditingEntityListener.class)`,
with `@Column(nullable = false)`. Those listeners only fire when
`@EnableJpaAuditing` is active.

`@DataJpaTest` is a **slice** — it does not load the production `@Configuration`
that carries `@EnableJpaAuditing` (each service's `infrastructure.config.JpaConfig`
or equivalent). So inside the slice the audit columns stay `null` and the first
`save()` fails with:

```
JdbcSQLIntegrityConstraintViolationException: NULL not allowed for column "CREATED_AT"
```

The fix already used by compliance-, tenant-, analytics-, and
integration-hub-service is a tiny test-scope config the slice `@Import`s:

```java
@TestConfiguration
@EnableJpaAuditing
class JpaTestConfig {}
```

```java
@DataJpaTest
@Import(JpaTestConfig.class)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
class XxxRepositoryTest { ... }
```

## Why this hides

Gradle (and the GH remote cache) serve `:<svc>:test` `FROM-CACHE` when the
module's inputs are unchanged, so a broken slice can sit green for a long time.
It only re-runs — and goes red — when something perturbs that module's inputs
(a new source file, a dependency bump). The failure then surfaces on a commit
that has nothing to do with the actual bug. Already fixed reactively for
analytics + integration-hub in `e1aa62e`; this item is the proactive sweep so it
never ambushes another merge.

## Candidates (heuristic scan, 2026-06-08)

Services with `@DataJpaTest` files but **no test-scope `@EnableJpaAuditing`**.
All are currently green in CI — i.e. either genuinely fine (read-only slices,
manually-set timestamps, nullable `created_at`, or entities that don't extend
`BaseEntity`) **or** cache-masked. Each must be confirmed, not assumed.

| Service | `@DataJpaTest` files |
|---|---|
| `audit-service` | 1 |
| `document-service` | 1 |
| `leave-service` | 3 |
| `notification-service` | 1 |
| `time-attendance-service` | 1 |

Already remediated (reference patterns): analytics, integration-hub, compliance,
tenant, employee, payroll.

## Task

1. For each candidate, force a real run (bypass the cache), e.g.:
   `./gradlew :services:<svc>:test --rerun-tasks` (or
   `--no-build-cache`), and confirm the repository slice actually saves a
   `BaseEntity`-derived entity.
2. Where it fails on `created_at`/`updated_at`, add the `JpaTestConfig` +
   `@Import(JpaTestConfig.class)` pattern above. Where it passes, note *why*
   (read-only / non-`BaseEntity` / nullable) so the next person doesn't re-audit.
3. **Consider a systemic fix to stop this recurring** (decide, don't default):
   - a single shared `JpaTestConfig` in a test-support source set / `andikisha-common`
     test fixtures, imported by every slice; or
   - a project convention/Checkstyle/ArchUnit rule that every `@DataJpaTest`
     `@Import`s an auditing config; or
   - accept per-service copies (current state) as the lowest-machinery option.
4. Optional hardening (separate call): make CI less cache-blind for `test`
   (e.g. periodic `--rerun-tasks` job) so latent slice failures surface on their
   own commit rather than on an unrelated merge.

## Scope

Test-only. No production behaviour changes. Independent of the design-system and
Redis-readiness work that surfaced it.
