#!/usr/bin/env bash
#
# generate-env-files.sh
#
# Generates per-service .env and .env.example files for all 13 AndikishaHR
# microservices under config/env/.
#
# Behaviour:
#   - Creates config/env/ if missing
#   - For each service, writes <service>.env (real, with generated JWT_SECRET)
#                       and  <service>.env.example (template for git)
#   - Generates one strong JWT_SECRET shared across all services
#   - Idempotent — running it again overwrites the files cleanly
#
# Usage:
#   ./scripts/generate-env-files.sh                 # generate both .env and .env.example
#   ./scripts/generate-env-files.sh --examples-only # only the .env.example templates
#   ./scripts/generate-env-files.sh --keep-secret   # reuse JWT from existing auth.env if present
#
set -euo pipefail

# ============================================================================
# Configuration
# ============================================================================

CONFIG_DIR="config/env"
EXAMPLES_ONLY=0
KEEP_SECRET=0

for arg in "$@"; do
    case "$arg" in
        --examples-only) EXAMPLES_ONLY=1 ;;
        --keep-secret)   KEEP_SECRET=1 ;;
        --help|-h)
            sed -n '2,/^$/p' "$0" | sed 's/^# \{0,1\}//'
            exit 0
            ;;
        *) echo "Unknown flag: $arg" >&2; exit 1 ;;
    esac
done

# Shared dev defaults — match docker-compose.infra.yml
DB_USERNAME="andikisha"
DB_PASSWORD="changeme"
RABBITMQ_USER="andikisha"
RABBITMQ_PASS="changeme"
RABBITMQ_HOST="localhost"
RABBITMQ_PORT="5672"
REDIS_HOST="localhost"
REDIS_PORT="6379"
ZIPKIN_ENDPOINT="http://localhost:9411/api/v2/spans"
SPRING_PROFILE="dev"

PLACEHOLDER_SECRET="replace-with-real-256-bit-secret-before-running"

# ============================================================================
# Generate or reuse JWT secret
# ============================================================================

if [[ "$KEEP_SECRET" -eq 1 && -f "$CONFIG_DIR/auth-service.env" ]]; then
    JWT_SECRET=$(grep -E '^JWT_SECRET=' "$CONFIG_DIR/auth-service.env" | cut -d= -f2- || true)
    if [[ -z "$JWT_SECRET" ]]; then
        echo "Could not extract JWT_SECRET from existing auth-service.env. Aborting." >&2
        exit 1
    fi
    echo "Reusing existing JWT_SECRET from auth-service.env"
else
    if ! command -v openssl >/dev/null 2>&1; then
        echo "openssl not found. Install it or use --keep-secret with an existing config." >&2
        exit 1
    fi
    JWT_SECRET=$(openssl rand -base64 48 | tr -d '=' | tr '/+' '_-' | head -c 64)
fi

mkdir -p "$CONFIG_DIR"

# ============================================================================
# Helpers
# ============================================================================

# write_file <service> <content>
#   Writes <service>.env and <service>.env.example.
#   The .env.example replaces the real JWT secret with a placeholder.
write_file() {
    local service="$1"
    local content="$2"

    if [[ "$EXAMPLES_ONLY" -eq 0 ]]; then
        printf '%s\n' "$content" > "$CONFIG_DIR/${service}.env"
    fi

    # shellcheck disable=SC2001
    local example_content
    example_content=$(printf '%s' "$content" | \
        sed "s|^JWT_SECRET=.*|JWT_SECRET=$PLACEHOLDER_SECRET|")
    printf '%s\n' "$example_content" > "$CONFIG_DIR/${service}.env.example"

    if [[ "$EXAMPLES_ONLY" -eq 1 ]]; then
        echo "  generated: ${service}.env.example"
    else
        echo "  generated: ${service}.env  +  ${service}.env.example"
    fi
}

# common_block — env vars present in every service
common_block() {
    cat <<EOF

# ── Messaging ──
RABBITMQ_HOST=$RABBITMQ_HOST
RABBITMQ_PORT=$RABBITMQ_PORT
RABBITMQ_USERNAME=$RABBITMQ_USER
RABBITMQ_PASSWORD=$RABBITMQ_PASS

# ── Security ──
JWT_SECRET=$JWT_SECRET

# ── Observability ──
ZIPKIN_ENDPOINT=$ZIPKIN_ENDPOINT
MANAGEMENT_TRACING_SAMPLING_PROBABILITY=1.0

# ── Spring ──
SPRING_PROFILES_ACTIVE=$SPRING_PROFILE
EOF
}

# db_block <port> <db_name> — DB connection vars
db_block() {
    cat <<EOF

# ── Database ──
DB_HOST=localhost
DB_PORT=$1
DB_NAME=$2
DB_USERNAME=$DB_USERNAME
DB_PASSWORD=$DB_PASSWORD
EOF
}

# grpc_client <UPPERCASE_NAME> <port>
grpc_client() {
    cat <<EOF
${1}_GRPC_HOST=localhost
${1}_GRPC_PORT=$2
EOF
}

# server_block <http_port> <grpc_port_or_-> <service_name>
server_block() {
    local http="$1"
    local grpc="$2"
    local name="$3"
    if [[ "$grpc" == "-" ]]; then
        cat <<EOF
# ── ${name} ──
SERVER_PORT=$http
EOF
    else
        cat <<EOF
# ── ${name} ──
SERVER_PORT=$http
GRPC_SERVER_PORT=$grpc
EOF
    fi
}

# ============================================================================
# Service definitions
# ============================================================================

echo ""
echo "Generating env files in $CONFIG_DIR/"
echo ""

# ----------------------------------------------------------------------------
# 1. API Gateway — HTTP 8080, no gRPC server, no DB
# ----------------------------------------------------------------------------
write_file "api-gateway" "$(cat <<EOF
$(server_block 8080 - "API Gateway")
$(common_block)

# ── gRPC Clients (downstream services) ──
$(grpc_client AUTH 9081)
$(grpc_client EMPLOYEE 9082)
$(grpc_client TENANT 9083)
$(grpc_client PAYROLL 9084)
$(grpc_client COMPLIANCE 9085)
$(grpc_client TIME 9086)
$(grpc_client LEAVE 9087)
$(grpc_client DOCUMENT 9088)
$(grpc_client NOTIFICATION 9089)
$(grpc_client INTEGRATION 9090)
$(grpc_client ANALYTICS 9091)
$(grpc_client AUDIT 9092)

# ── Rate limiting ──
REDIS_HOST=$REDIS_HOST
REDIS_PORT=$REDIS_PORT
EOF
)"

# ----------------------------------------------------------------------------
# 2. Auth Service — HTTP 8081, gRPC 9081, DB 5433
# ----------------------------------------------------------------------------
write_file "auth-service" "$(cat <<EOF
$(server_block 8081 9081 "Auth Service")
$(db_block 5433 andikisha_auth)
$(common_block)

# ── Token cache ──
REDIS_HOST=$REDIS_HOST
REDIS_PORT=$REDIS_PORT

# ── JWT lifetimes (overridable) ──
JWT_ACCESS_EXPIRATION_MS=3600000
JWT_REFRESH_EXPIRATION_MS=604800000
EOF
)"

# ----------------------------------------------------------------------------
# 3. Employee Service — HTTP 8082, gRPC 9082, DB 5434
# ----------------------------------------------------------------------------
write_file "employee-service" "$(cat <<EOF
$(server_block 8082 9082 "Employee Service")
$(db_block 5434 andikisha_employee)
$(common_block)

# ── gRPC Clients ──
$(grpc_client AUTH 9081)
EOF
)"

# ----------------------------------------------------------------------------
# 4. Tenant Service — HTTP 8083, gRPC 9083, DB 5435
# ----------------------------------------------------------------------------
write_file "tenant-service" "$(cat <<EOF
$(server_block 8083 9083 "Tenant Service")
$(db_block 5435 andikisha_tenant)
$(common_block)

# ── gRPC Clients ──
$(grpc_client AUTH 9081)
EOF
)"

# ----------------------------------------------------------------------------
# 5. Payroll Service — HTTP 8084, gRPC 9084, DB 5436
# ----------------------------------------------------------------------------
write_file "payroll-service" "$(cat <<EOF
$(server_block 8084 9084 "Payroll Service")
$(db_block 5436 andikisha_payroll)
$(common_block)

# ── gRPC Clients ──
$(grpc_client AUTH 9081)
$(grpc_client EMPLOYEE 9082)
EOF
)"

# ----------------------------------------------------------------------------
# 6. Compliance Service — HTTP 8085, gRPC 9085, DB 5437
# ----------------------------------------------------------------------------
write_file "compliance-service" "$(cat <<EOF
$(server_block 8085 9085 "Compliance Service")
$(db_block 5437 andikisha_compliance)
$(common_block)

# ── gRPC Clients ──
$(grpc_client AUTH 9081)
$(grpc_client TENANT 9083)
EOF
)"

# ----------------------------------------------------------------------------
# 7. Time and Attendance Service — HTTP 8086, gRPC 9086, DB 5438
# ----------------------------------------------------------------------------
write_file "time-attendance-service" "$(cat <<EOF
$(server_block 8086 9086 "Time and Attendance Service")
$(db_block 5438 andikisha_time)
$(common_block)

# ── gRPC Clients ──
$(grpc_client AUTH 9081)
$(grpc_client EMPLOYEE 9082)

# ── ZKTeco biometric devices (if used) ──
ZKTECO_API_BASE=http://localhost:8888
ZKTECO_API_KEY=replace-when-deploying
EOF
)"

# ----------------------------------------------------------------------------
# 8. Leave Service — HTTP 8087, gRPC 9087, DB 5439
# ----------------------------------------------------------------------------
write_file "leave-service" "$(cat <<EOF
$(server_block 8087 9087 "Leave Service")
$(db_block 5439 andikisha_leave)
$(common_block)

# ── gRPC Clients ──
$(grpc_client AUTH 9081)
$(grpc_client EMPLOYEE 9082)
EOF
)"

# ----------------------------------------------------------------------------
# 9. Document Service — HTTP 8088, gRPC 9088, DB 5440
# ----------------------------------------------------------------------------
write_file "document-service" "$(cat <<EOF
$(server_block 8088 9088 "Document Service")
$(db_block 5440 andikisha_document)
$(common_block)

# ── gRPC Clients ──
$(grpc_client AUTH 9081)
$(grpc_client EMPLOYEE 9082)

# ── Object storage (MinIO local, S3 in prod) ──
STORAGE_PROVIDER=minio
STORAGE_ENDPOINT=http://localhost:9000
STORAGE_ACCESS_KEY=minioadmin
STORAGE_SECRET_KEY=minioadmin
STORAGE_BUCKET=andikisha-documents
STORAGE_REGION=us-east-1
EOF
)"

# ----------------------------------------------------------------------------
# 10. Notification Service — HTTP 8089, gRPC 9089, DB 5441
# ----------------------------------------------------------------------------
write_file "notification-service" "$(cat <<EOF
$(server_block 8089 9089 "Notification Service")
$(db_block 5441 andikisha_notification)
$(common_block)

# ── gRPC Clients ──
$(grpc_client AUTH 9081)
$(grpc_client EMPLOYEE 9082)

# ── Africa's Talking SMS ──
AFRICASTALKING_USERNAME=sandbox
AFRICASTALKING_API_KEY=replace-when-deploying
AFRICASTALKING_SENDER_ID=ANDIKISHA

# ── SMTP for email ──
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=replace-when-deploying
SMTP_PASSWORD=replace-when-deploying
SMTP_FROM=no-reply@andikishahr.com

# ── WhatsApp Business API (Meta) ──
WHATSAPP_API_BASE=https://graph.facebook.com/v18.0
WHATSAPP_PHONE_NUMBER_ID=replace-when-deploying
WHATSAPP_ACCESS_TOKEN=replace-when-deploying

# ── Firebase Cloud Messaging (push) ──
FCM_PROJECT_ID=replace-when-deploying
FCM_SERVICE_ACCOUNT_JSON_PATH=/run/secrets/fcm-service-account.json
EOF
)"

# ----------------------------------------------------------------------------
# 11. Integration Hub Service — HTTP 8090, gRPC 9090, DB 5442
# ----------------------------------------------------------------------------
write_file "integration-hub-service" "$(cat <<EOF
$(server_block 8090 9090 "Integration Hub Service")
$(db_block 5442 andikisha_integration)
$(common_block)

# ── gRPC Clients ──
$(grpc_client AUTH 9081)

# ── M-Pesa Daraja API (Safaricom) ──
MPESA_ENVIRONMENT=sandbox
MPESA_CONSUMER_KEY=replace-when-deploying
MPESA_CONSUMER_SECRET=replace-when-deploying
MPESA_PASSKEY=replace-when-deploying
MPESA_SHORTCODE=174379
MPESA_INITIATOR_NAME=replace-when-deploying
MPESA_INITIATOR_PASSWORD=replace-when-deploying
MPESA_CALLBACK_BASE_URL=https://your-ngrok-url.ngrok.io

# ── KRA iTax ──
KRA_ITAX_BASE_URL=https://itax.kra.go.ke
KRA_ITAX_USERNAME=replace-when-deploying
KRA_ITAX_PASSWORD=replace-when-deploying

# ── NSSF eRegistration ──
NSSF_API_BASE=https://eregister.nssf.or.ke
NSSF_USERNAME=replace-when-deploying
NSSF_PASSWORD=replace-when-deploying

# ── SHIF (formerly NHIF) ──
SHIF_API_BASE=https://api.sha.go.ke
SHIF_API_KEY=replace-when-deploying
EOF
)"

# ----------------------------------------------------------------------------
# 12. Analytics Service — HTTP 8091, gRPC 9091, DB 5443
# ----------------------------------------------------------------------------
write_file "analytics-service" "$(cat <<EOF
$(server_block 8091 9091 "Analytics Service")
$(db_block 5443 andikisha_analytics)
$(common_block)

# ── gRPC Clients (writes attrition risk back to Employee) ──
$(grpc_client AUTH 9081)
$(grpc_client EMPLOYEE 9082)
EOF
)"

# ----------------------------------------------------------------------------
# 13. Audit Service — HTTP 8092, gRPC 9092, DB 5444
# ----------------------------------------------------------------------------
write_file "audit-service" "$(cat <<EOF
$(server_block 8092 9092 "Audit Service")
$(db_block 5444 andikisha_audit)
$(common_block)

# ── gRPC Clients (DSAR PDFs go to Document Service) ──
$(grpc_client AUTH 9081)
$(grpc_client DOCUMENT 9088)
EOF
)"

# ============================================================================
# Final summary
# ============================================================================

echo ""
echo "Done. ${CONFIG_DIR}/ now contains 13 service env files."
echo ""

if [[ "$EXAMPLES_ONLY" -eq 0 ]]; then
    echo "Real .env files have a generated JWT_SECRET (64 chars)."
    echo "Example .env.example files use the placeholder:"
    echo "  ${PLACEHOLDER_SECRET}"
fi

echo ""
echo "Next steps:"
echo "  1. Add this to your root .gitignore (if not already there):"
echo ""
echo "     config/env/*.env"
echo "     !config/env/*.env.example"
echo ""
echo "  2. In each IntelliJ run configuration, EnvFile tab, point to:"
echo "     config/env/<service-name>.env"
echo ""
echo "  3. Commit the *.env.example files so the team has the templates:"
echo "     git add ${CONFIG_DIR}/*.env.example"
echo ""
