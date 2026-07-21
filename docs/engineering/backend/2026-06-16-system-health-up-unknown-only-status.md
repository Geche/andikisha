# Backend finding — `super-admin/system/health` reports only UP/UNKNOWN; a failing service is indistinguishable from an unreachable one

**Raised:** 2026-06-16 (Loading-state remediation, W0 health-grid investigation).
**Service:** api-gateway — `SuperAdminSystemController`
**Priority:** Medium — operator-facing honesty defect on the platform health surface. Out of scope for the loading-state run (frontend); filed for the backend backlog.

## Problem

`GET /api/v1/super-admin/system/health`
(`services/api-gateway/src/main/java/com/andikisha/gateway/controller/SuperAdminSystemController.java`)
aggregates health by calling each service's `/actuator/health` with a 2s timeout:

```java
private Mono<Map<String, String>> checkService(String name, String baseUrl) {
    return webClient.get()
            .uri(baseUrl + "/actuator/health")
            .retrieve()
            .bodyToMono(String.class)
            .map(body -> Map.of("name", name, "status", "UP"))
            .timeout(HEALTH_TIMEOUT)
            .onErrorReturn(Map.of("name", name, "status", "UNKNOWN"));
}
```

Two failure modes collapse into a single `UNKNOWN`:

1. **Unreachable** — connection refused / DNS / timeout (service down, network partition). `.retrieve()`
   errors → `onErrorReturn(UNKNOWN)`.
2. **Reachable but unhealthy** — Spring Actuator returns **HTTP 503 with a `DOWN` body** when a
   component (DB, broker, Redis) is failing. `.retrieve()` treats 4xx/5xx as an error too → the body is
   never inspected → also `onErrorReturn(UNKNOWN)`.

So the status vocabulary is effectively `{UP, UNKNOWN}`. A service that is **actively failing** (reachable,
reporting DOWN) reads identically to one that is **unreachable**. An operator triages those two differently
— "the service is up but its database is gone" vs "the service/process is not answering at all" — and the
grid erases that distinction.

## Impact

Platform (SUPER_ADMIN) health dashboard. During an incident the grid cannot tell the operator whether a
service is down or merely degraded, slowing triage. Pairs with the frontend fallback defect
`PLATFORM-BACKLOG-003` (which fabricates the whole list on error); this item is specifically the
**backend status fidelity**.

## Fix

Map the three real conditions to three statuses:

- Read the actuator response **body** even on 503 (use `.exchangeToMono` / `onStatus` rather than
  `.retrieve()` which throws on non-2xx), parse `status: "DOWN"` → emit **`DOWN`**.
- Connection error / timeout → keep **`UNKNOWN`** (genuinely unknown — couldn't reach it).
- 2xx `UP` → **`UP`**.

A `DOWN` service should read `DOWN`. The frontend grid already has a status-dot vocabulary that can carry a
third state once the backend emits it.

## Notes

- The hardcoded service map in the controller (12 services + self) mirrors the deployed topology; that is a
  config concern, not part of this finding.
- No backwards-incompatible contract change: the response shape (`{services:[{name,status}]}`) is unchanged;
  only the set of `status` values gains `DOWN`.
