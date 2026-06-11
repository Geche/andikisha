#!/usr/bin/env bash
#
# Restart all AndikishaHR backend microservices (dev profile) from their
# already-built jars. Does NOT rebuild and does NOT touch the Docker infra
# (Postgres/Redis/RabbitMQ) — restarting infra would wipe the Redis licence
# cache. Re-seeds the Redis licence cache at the end as cheap insurance.
#
# Usage:
#   scripts/restart-services.sh           # restart all 13 services
#   scripts/restart-services.sh stop      # stop only
#   scripts/restart-services.sh start     # start only
#
# Logs:  logs/<service>.log     PIDs: logs/<service>.pid
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
mkdir -p logs

PROFILE="dev"

# service:http_port  — start order is foundation -> phase2/3/4 -> gateway last
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
  "api-gateway:8080"
)

stop_one() {
  local name="$1" port="$2"
  local pids
  pids="$(lsof -nP -iTCP:"$port" -sTCP:LISTEN -t 2>/dev/null || true)"
  if [ -n "$pids" ]; then
    echo "  stop  $name (:$port) -> PID $pids"
    kill $pids 2>/dev/null || true
    for _ in $(seq 1 20); do
      lsof -nP -iTCP:"$port" -sTCP:LISTEN -t >/dev/null 2>&1 || break
      sleep 0.5
    done
    pids="$(lsof -nP -iTCP:"$port" -sTCP:LISTEN -t 2>/dev/null || true)"
    [ -n "$pids" ] && { echo "  force $name (:$port) -> KILL $pids"; kill -9 $pids 2>/dev/null || true; }
  else
    echo "  stop  $name (:$port) -> not running"
  fi
  rm -f "logs/$name.pid"
}

start_one() {
  local name="$1" port="$2"
  local jar envfile
  jar="$(ls services/"$name"/build/libs/"$name"-*-SNAPSHOT.jar 2>/dev/null | grep -v plain | head -1)"
  if [ -z "$jar" ]; then echo "  SKIP  $name -> no jar (build first)"; return 1; fi
  envfile="config/env/$name.env"
  if [ ! -f "$envfile" ]; then
    echo "  SKIP  $name -> missing $envfile (run scripts/generate-env-files.sh)"; return 1
  fi
  # Launch in a subshell so each service's env (ports, creds) is isolated.
  ( set -a; . "$ROOT/$envfile"; set +a
    exec nohup java -jar "$jar" --spring.profiles.active="$PROFILE" \
      >"$ROOT/logs/$name.log" 2>&1 ) &
  echo $! >"logs/$name.pid"
  echo "  start $name (:$port) -> PID $(cat "logs/$name.pid")  [logs/$name.log]"
}

do_stop() {
  echo "Stopping services..."
  # stop in reverse: gateway first, foundation last
  for ((i=${#SERVICES[@]}-1; i>=0; i--)); do
    IFS=: read -r name port <<<"${SERVICES[$i]}"
    stop_one "$name" "$port"
  done
}

do_start() {
  echo "Starting services ($PROFILE profile)..."
  for entry in "${SERVICES[@]}"; do
    IFS=: read -r name port <<<"$entry"
    start_one "$name" "$port" || true
  done
}

seed_redis() {
  local tid="1cc12430-7c3a-45b7-8973-469622778c9d"
  if docker exec andikisha-redis redis-cli -a changeme \
       SET "licence:status:$tid" "TRIAL" EX 3600 >/dev/null 2>&1; then
    echo "Redis licence cache re-seeded (demo tenant, 60m)."
  else
    echo "WARN: could not seed Redis licence cache (is andikisha-redis up?)."
  fi
}

case "${1:-restart}" in
  stop)    do_stop ;;
  start)   do_start; seed_redis ;;
  restart) do_stop; echo; do_start; seed_redis ;;
  *) echo "usage: $0 [restart|stop|start]"; exit 2 ;;
esac

echo
echo "Done. Tail a service:  tail -f logs/<service>.log"
