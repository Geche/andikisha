# BACKLOG — `HttpRequestMethodNotSupportedException` (and other framework 4xx) masked as 500

**Severity:** Medium — incorrect HTTP semantics across all services; misleads clients and obscures root cause.
**Date:** 2026-06-09 · **Surfaced by:** UX-flow-remediation-01, W3 (terminate fix) follow-up.
**Component:** `shared/andikisha-common` — `GlobalExceptionHandler` (`@RestControllerAdvice`). Affects **every service** that imports it (all 13).

## Symptom
A wrong-method request (e.g. `PATCH` to a `@PostMapping`-only route) returns
**500 `INTERNAL_ERROR`** instead of the correct **405 Method Not Allowed**.

This is the answer to the W3 question (why the old terminate call returned 500,
not 405): the terminate route is genuinely POST-only and there is no lingering
PATCH mapping or routing fault. The 500 is produced by a shared exception advice
that **swallows the method rejection** — not a routing problem. The W3 fix
(frontend PATCH → POST) is sound; the odd status code was this masking advice.

## Root cause
`GlobalExceptionHandler` declares a catch-all:

```java
@ExceptionHandler(Exception.class)   // -> 500 INTERNAL_ERROR
```

Spring's `HttpRequestMethodNotSupportedException` extends `Exception` and is not
handled by any more specific `@ExceptionHandler`, so the catch-all intercepts it
**before** Spring's default 405 handling runs. Confirmed:

- `PATCH /api/v1/employees/{id}/terminate` → body
  `{"error":"INTERNAL_ERROR","message":"An unexpected error occurred"}` (the
  catch-all's exact output) with status 500, while the employee was **not**
  mutated (the handler/business logic never ran) — i.e. a method rejection, not a
  mid-operation throw.

The same masking applies to other framework 4xx that extend `Exception` and lack
a specific handler — notably `HttpMediaTypeNotSupportedException` (415) and
`HttpMediaTypeNotAcceptableException` (406).

## Fix (central, not per-service)
Because the catch-all lives in `andikisha-common` and every service inherits it,
fix it **once** there rather than in each service:

- Add specific handlers returning the correct status:
  - `HttpRequestMethodNotSupportedException` → **405** (with `Allow` header).
  - `HttpMediaTypeNotSupportedException` → **415**.
  - `HttpMediaTypeNotAcceptableException` → **406**.
- Prefer extending `ResponseEntityExceptionHandler` (which already maps these
  Spring MVC exceptions correctly) so the catch-all `Exception.class` handler no
  longer pre-empts them.
- Keep the catch-all for genuinely unexpected errors only.

## Test
Add a slice/MockMvc test asserting a wrong-method request to any mapped route
returns 405 (not 500). One representative service is enough since the handler is
shared.

## Scope note
Out of scope for W3 (the terminate fix); filed here because the change touches
shared code used by all 13 services and warrants its own review + regression pass.
