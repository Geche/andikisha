# Dokploy Environment Setup

**Target:** Dokploy UI → andikisha-stack → Environment tab  
**Why:** Dokploy clones the repo fresh on every deploy to `/etc/dokploy/compose/andikisha-stack-*/code`. There is no `.env` file (gitignored). All `${VAR}` substitutions in `docker-compose.yml` must come from this tab.

---

## Step 1 — Generate secrets (run once on your local machine)

```bash
# JWT_SECRET — 64-char hex
openssl rand -hex 32

# CREDENTIAL_ENCRYPTION_KEY — exactly 32 chars
openssl rand -base64 24 | tr -d '=+/' | cut -c1-32
```

## Step 2 — Paste into Dokploy Environment tab

Copy the block below, fill in every placeholder, and save.

```env
# ── Registry ──────────────────────────────────────────────────────
GHCR_OWNER=geche
RELEASE_TAG=latest

# ── Domains ───────────────────────────────────────────────────────
API_DOMAIN=api.andikisha.co.ke
TENANT_DOMAIN=app.andikisha.co.ke
PLATFORM_DOMAIN=platform.andikisha.co.ke
LANDING_DOMAIN=andikisha.co.ke

# ── PostgreSQL ────────────────────────────────────────────────────
POSTGRES_USER=andikisha
POSTGRES_PASS=<choose-a-strong-password>

# ── RabbitMQ ──────────────────────────────────────────────────────
RABBITMQ_USER=andikisha
RABBITMQ_PASS=<choose-a-strong-password>

# ── Redis ─────────────────────────────────────────────────────────
REDIS_PASS=<choose-a-strong-password>

# ── App secrets ───────────────────────────────────────────────────
JWT_SECRET=<output of: openssl rand -hex 32>
CREDENTIAL_ENCRYPTION_KEY=<output of: openssl rand -base64 24 | tr -d '=+/' | cut -c1-32>

# ── Mail (notification-service) ───────────────────────────────────
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=<your-sending-email>
MAIL_PASSWORD=<gmail-app-password>
MAIL_FROM=noreply@andikisha.co.ke

# ── M-Pesa (integration-hub-service) ─────────────────────────────
MPESA_CONSUMER_KEY=<from-daraja>
MPESA_CONSUMER_SECRET=<from-daraja>
MPESA_SECURITY_CREDENTIAL=<from-daraja>
MPESA_SHORTCODE=<shortcode>
MPESA_PASSKEY=<passkey>
```

## Step 3 — Redeploy

Click **Deploy** in Dokploy. The startup order is:

1. `postgres`, `redis`, `rabbitmq` start and run healthchecks
2. All Spring Boot services wait (`depends_on: service_healthy`) until all three pass
3. Each service runs Flyway migrations then starts its HTTP server
4. `api-gateway` waits for all backend services to be healthy before accepting traffic

---

## Rollback

To roll back to a previous release, set `RELEASE_TAG` to the short git SHA from the failed deploy, then redeploy:

```
RELEASE_TAG=abc1234
```

No SSH to the VPS required.

---

## Why postgres/rabbitmq fail without these vars

With variables unset, `${POSTGRES_USER}` resolves to an empty string. Postgres starts with a blank username, `pg_isready` fails, and every downstream service that declares `depends_on: postgres: condition: service_healthy` never starts. Same for RabbitMQ: a blank `RABBITMQ_DEFAULT_USER` causes the management plugin to reject connections, failing the `rabbitmq-diagnostics ping` healthcheck.

---

## Related files

- `.env.example` — full template at repo root (safe to commit; contains no real secrets)
- `docker-compose.yml` — all `${VAR}` references
- `infrastructure/docs/github-secrets.md` — secrets required in GitHub Actions (separate from Dokploy env)
- `docs/operations/2026-05-29-deployment-gap-analysis.md` — full audit of deployment gaps and fixes applied
