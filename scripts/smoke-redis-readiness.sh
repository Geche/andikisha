#!/usr/bin/env bash
#
# Post-deploy smoke check for the Redis-readiness fix
# (docs/Engineering/backend/2026-06-07-redis-readiness-resolution.md).
#
# Asserts, after a rollout:
#   1. tenant-service /actuator/health is 200 (Redis reachable + authenticated)
#   2. the readiness probe path /actuator/health/readiness is 200
#   3. a tenant-scoped request does NOT return 503 LICENCE_CHECK_UNAVAILABLE
#      (the gateway's TenantLicenceFilter can read Redis)
#
# Usage:
#   scripts/smoke-redis-readiness.sh <gateway-url> <tenant-service-url> <bearer-token> [tenant-path]
# Example:
#   scripts/smoke-redis-readiness.sh http://localhost:8080 http://localhost:8083 "$TOKEN" /api/v1/employees?size=1
set -euo pipefail

GW="${1:?gateway base url required}"
TS="${2:?tenant-service base url required}"
TOK="${3:?bearer token required}"
TPATH="${4:-/api/v1/employees?page=0&size=1}"

fail() { echo "SMOKE FAIL: $1" >&2; exit 1; }

code=$(curl -s -o /dev/null -w '%{http_code}' "$TS/actuator/health")
[ "$code" = "200" ] || fail "tenant-service /actuator/health = $code (want 200; Redis likely unauthenticated)"

rcode=$(curl -s -o /dev/null -w '%{http_code}' "$TS/actuator/health/readiness")
[ "$rcode" = "200" ] || fail "tenant-service /actuator/health/readiness = $rcode (want 200)"

body=$(curl -s -H "Authorization: Bearer $TOK" "$GW$TPATH")
if printf '%s' "$body" | grep -q "LICENCE_CHECK_UNAVAILABLE"; then
  fail "tenant-scoped request returned LICENCE_CHECK_UNAVAILABLE — gateway cannot read Redis"
fi

echo "SMOKE OK: health 200, readiness 200, tenant licence-check passing"
