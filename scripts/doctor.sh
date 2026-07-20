#!/usr/bin/env bash
#
# Freshness check for the local backend (DEV-BACKLOG-002). For every running
# service it reads /actuator/info (stamped with the git commit id at build time
# by the git-properties plugin) and compares that SHA to the current checkout.
# Turns the silent "stack is green but serving stale code" trap into a report.
#
# Works for BOTH run loops (compose and bare-JVM) because it reads the artifact's
# own stamp over HTTP — there is nothing Docker-specific about it.
#
# Usage:
#   scripts/doctor.sh                 # check all services
#   scripts/doctor.sh recruitment-service api-gateway
#
# Exit status: non-zero if any running service is STALE (so it can gate a
# verification run). DOWN / no-stamp services are reported but do not fail.
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

HOST="${DOCTOR_HOST:-localhost}"

# service:http_port — canonical list (matches restart-services.sh / compose ports).
SERVICES=(
  "auth-service:8081"
  "tenant-service:8083"
  "employee-service:8082"
  "payroll-service:8084"
  "compliance-service:8085"
  "time-attendance-service:8086"
  "leave-service:8087"
  "document-service:8088"
  "notification-service:8089"
  "integration-hub-service:8090"
  "analytics-service:8091"
  "audit-service:8092"
  "recruitment-service:8094"
  "api-gateway:8080"
)

# Optional filter: keep only requested services (canonical order preserved).
if [ "$#" -gt 0 ]; then
  for want in "$@"; do
    ok=""
    for e in "${SERVICES[@]}"; do [ "${e%%:*}" = "$want" ] && ok=1 && break; done
    [ -z "$ok" ] && { echo "ERROR: unknown service '$want'"; exit 2; }
  done
  filtered=()
  for e in "${SERVICES[@]}"; do
    for want in "$@"; do [ "${e%%:*}" = "$want" ] && filtered+=("$e") && break; done
  done
  SERVICES=("${filtered[@]}")
fi

HEAD="$(git rev-parse HEAD 2>/dev/null || echo 'unknown')"
HEAD7="${HEAD:0:7}"
echo "Checkout HEAD: $HEAD7"
if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
  echo "  ⚠  working tree is dirty — uncommitted edits are NOT in any built artifact."
fi
echo

# Pull git.commit.id out of /actuator/info without assuming jq is installed.
sha_of() {
  local port="$1" body
  body="$(curl -fsS --max-time 3 "http://$HOST:$port/actuator/info" 2>/dev/null)" || return 1
  printf '%s' "$body" | python3 -c '
import sys, json
try:
    cid = json.load(sys.stdin).get("git", {}).get("commit", {}).get("id", "")
    # simple actuator mode: id is the abbreviated string; full mode: id is
    # {"full": "...", "abbrev": "..."}. Handle both.
    if isinstance(cid, dict):
        cid = cid.get("abbrev") or cid.get("full") or ""
    print((cid or "")[:7])
except Exception:
    print("")
'
}

stale=0
printf "%-28s %-8s %s\n" "SERVICE" "STATUS" "SHA"
printf "%-28s %-8s %s\n" "----------------------------" "--------" "-------"
for entry in "${SERVICES[@]}"; do
  name="${entry%%:*}"; port="${entry##*:}"
  if ! sha="$(sha_of "$port")"; then
    printf "%-28s %-8s %s\n" "$name" "down" "(not responding on :$port)"
    continue
  fi
  if [ -z "$sha" ]; then
    printf "%-28s %-8s %s\n" "$name" "no-stamp" "(pre-git-properties build — rebuild it)"
    continue
  fi
  if [ "$sha" = "$HEAD7" ]; then
    printf "%-28s %-8s %s\n" "$name" "ok" "$sha"
  else
    printf "%-28s %-8s %s\n" "$name" "STALE" "$sha  (HEAD is $HEAD7 — redeploy it)"
    stale=1
  fi
done

echo
if [ "$stale" -ne 0 ]; then
  echo "✗ Stale services detected. Refresh them:  scripts/redeploy.sh <service...>"
  exit 1
fi
echo "✓ All responding services are at HEAD."
