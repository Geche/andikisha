# AndikishaHR development Makefile
# Usage: make <target>

TENANT_ID    := 1cc12430-7c3a-45b7-8973-469622778c9d
GATEWAY      := http://localhost:8080
ADMIN_EMAIL  := admin@demo.co.ke
ADMIN_PASS   := Admin@123!

.PHONY: seed-demo-data seed-redis redeploy doctor help

help:
	@echo "Available targets:"
	@echo "  redeploy SVC=…   — Rebuild jar + refresh container/JVM for a service (DEV-BACKLOG-002)"
	@echo "                     e.g. make redeploy SVC=\"recruitment-service api-gateway\""
	@echo "                     add JVM=1 for the bare-JVM loop instead of compose"
	@echo "  doctor [SVC=…]   — Report which running services are stale vs the current git SHA"
	@echo "  seed-demo-data   — Seed departments, positions, and Redis licence cache for the demo tenant"
	@echo "  seed-redis       — Seed only the Redis licence cache (needed after docker restart)"

# SVC is required (one or more service names); JVM=1 switches to the bare-JVM loop.
redeploy:
	@test -n "$(SVC)" || { echo "usage: make redeploy SVC=\"<service...>\" [JVM=1]"; exit 2; }
	scripts/redeploy.sh $(if $(JVM),--jvm,) $(SVC)

# SVC optional — with no SVC, checks all services.
doctor:
	scripts/doctor.sh $(SVC)

seed-redis:
	@echo "Seeding Redis licence cache..."
	docker exec andikisha-redis redis-cli -a changeme \
		SET "licence:status:$(TENANT_ID)" "TRIAL" EX 3600
	@echo "Done. Cache valid for 60 minutes."

seed-demo-data: seed-redis
	@echo "Obtaining admin token..."
	@TOKEN=$$(curl -sf -X POST $(GATEWAY)/api/v1/auth/login \
		-H "Content-Type: application/json" \
		-H "X-Tenant-ID: $(TENANT_ID)" \
		-d '{"email":"$(ADMIN_EMAIL)","password":"$(ADMIN_PASS)"}' \
		| python3 -c "import sys,json; print(json.load(sys.stdin).get('accessToken',''))" 2>/dev/null) && \
	if [ -z "$$TOKEN" ]; then echo "ERROR: Could not obtain admin token. Is the backend running?"; exit 1; fi && \
	echo "Seeding departments..." && \
	python3 scripts/seed-demo-data.py "$$TOKEN" "$(TENANT_ID)" "$(GATEWAY)" && \
	echo "Demo data seeded successfully."
