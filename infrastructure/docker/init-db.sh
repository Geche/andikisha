#!/bin/bash
# infrastructure/docker/init-db.sh
#
# Idempotent database creation for the single-Postgres Dokploy deployment.
# Runs via docker-entrypoint-initdb.d — executed once on first boot (empty
# data volume). Safe to re-run: skips any database that already exists.
#
# Mount in docker-compose.yml:
#   - ./infrastructure/docker/init-db.sh:/docker-entrypoint-initdb.d/init-db.sh:ro

set -euo pipefail

DATABASES=(
  andikisha_auth
  andikisha_tenant
  andikisha_employee
  andikisha_payroll
  andikisha_leave
  andikisha_compliance
  andikisha_time
  andikisha_document
  andikisha_notify
  andikisha_integration
  andikisha_analytics
  andikisha_audit
)

for db in "${DATABASES[@]}"; do
  if psql -U "$POSTGRES_USER" -tc "SELECT 1 FROM pg_database WHERE datname = '$db'" | grep -q 1; then
    echo "Database '$db' already exists — skipping."
  else
    psql -U "$POSTGRES_USER" -c "CREATE DATABASE $db OWNER $POSTGRES_USER;"
    echo "Created database '$db'."
  fi
done

echo "All ${#DATABASES[@]} AndikishaHR databases verified."
