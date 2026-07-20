#!/usr/bin/env bash
#
# Atomic build -> run for one or more backend services. Closes DEV-BACKLOG-002:
# "I changed code" and "the running container reflects my code" are otherwise
# separated by two manual steps (gradle bootJar, then an image/container refresh),
# either of which fails silently. This ties them together in the correct order.
#
# Two run loops:
#   (default) Docker Compose  — rebuild jar, then rebuild THIS service's image and
#                               force-recreate only its container (no full-stack churn).
#   --jvm                     — rebuild jar, then restart only this service's bare
#                               JVM process via scripts/restart-services.sh.
#
# Usage:
#   scripts/redeploy.sh recruitment-service               # compose loop, one service
#   scripts/redeploy.sh api-gateway recruitment-service   # compose loop, several
#   scripts/redeploy.sh --jvm recruitment-service         # bare-JVM loop
#
# After it finishes, run  scripts/doctor.sh  (or `make doctor`) to confirm every
# running service reports the current git SHA.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

COMPOSE_DIR="infrastructure/docker"
COMPOSE_FILES=(-f docker-compose.infra.yml -f docker-compose.full.yml)

MODE="compose"
if [ "${1:-}" = "--jvm" ]; then MODE="jvm"; shift; fi

if [ "$#" -eq 0 ]; then
  sed -n '8,20p' "$0" | sed 's/^# \{0,1\}//'
  exit 2
fi

SERVICES=("$@")

# All services are gradle modules under :services:. Validate up front so a typo
# fails before we build anything.
for svc in "${SERVICES[@]}"; do
  if [ ! -d "services/$svc" ]; then
    echo "ERROR: unknown service 'services/$svc'"; exit 2
  fi
done

# 1. Rebuild the jar(s). Gradle runs on the host so the daemon + incremental
#    build cache stay warm — this is the fast part and must come first, because
#    every downstream step just packages whatever jar is in build/libs.
GRADLE_TASKS=()
for svc in "${SERVICES[@]}"; do GRADLE_TASKS+=(":services:$svc:bootJar"); done
echo "==> Building: ${SERVICES[*]}"
./gradlew "${GRADLE_TASKS[@]}" --console=plain

# 2. Refresh the running artifact from the jar we just built.
if [ "$MODE" = "compose" ]; then
  echo "==> Recreating compose containers: ${SERVICES[*]}"
  ( cd "$COMPOSE_DIR"
    # --build forces the image to re-COPY the fresh jar; --no-deps + naming only
    # the target services means the other 12 stay untouched (and the Redis
    # licence cache survives).
    docker compose "${COMPOSE_FILES[@]}" up -d --build --no-deps --force-recreate "${SERVICES[@]}" )
else
  echo "==> Restarting JVM processes: ${SERVICES[*]}"
  scripts/restart-services.sh restart "${SERVICES[@]}"
fi

echo
echo "Done. Verify freshness:  scripts/doctor.sh"
