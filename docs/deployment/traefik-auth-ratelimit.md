# Traefik edge rate limiting for auth endpoints (security audit M5)

**Goal:** cap brute-force / password-spray on the login and forgot-password endpoints at the edge,
keyed on the **real client IP**, without touching application code.

**Why the edge:** login flows `browser → Traefik → BFF (Next) → api-gateway → auth-service`. Only
Traefik sees the true client IP — the BFF forwards neither the client IP nor `X-Forwarded-For` to the
gateway, so every downstream hop sees an infrastructure IP (this is why the in-app gateway limiter in
the withdrawn PR #111 would have self-DoS'd; see `docs/decisions/2026-07-28-login-rate-limit-redesign.md`).
Traefik terminates TLS on the VPS, so its remote address **is** the client IP and cannot be spoofed
by a client header. This control is the M5 volumetric backstop; the per-account throttle + lockout
model (M6) is the finer control tracked in the redesign doc.

**Endpoints to limit** (BFF routes on the portals — NOT the whole portal):
- tenant-portal (`${TENANT_DOMAIN}`): `/api/auth/login`, `/api/auth/forgot-password`
- platform-portal (`${PLATFORM_DOMAIN}`): `/api/auth/login`

> Scope to these paths only. A middleware attached to the whole portal router throttles every page
> and asset load and will break normal use.

## The middleware

`infrastructure/traefik/dynamic/auth-ratelimit.yml` defines it (file-provider form): ~10 req/min per
client IP, burst 20, keyed on the remote address. Equivalent Docker-label form is below.

## Applying it (Dokploy)

Dokploy manages the portal routers via the Domains tab, so add a **higher-priority, path-scoped
router** carrying the middleware. Two supported ways — pick one.

### Option A — custom Docker labels (recommended)

In Dokploy → each portal app → **Advanced → Labels** (or the app's compose `labels:`), add. Set
`${TENANT_DOMAIN}` / `${PLATFORM_DOMAIN}` to the live hosts. The middleware definition only needs to
exist once, but repeating it per app is harmless.

**tenant-portal:**
```
traefik.http.middlewares.auth-ratelimit.ratelimit.average=10
traefik.http.middlewares.auth-ratelimit.ratelimit.period=1m
traefik.http.middlewares.auth-ratelimit.ratelimit.burst=20
traefik.http.routers.tenant-auth.rule=Host(`${TENANT_DOMAIN}`) && (PathPrefix(`/api/auth/login`) || PathPrefix(`/api/auth/forgot-password`))
traefik.http.routers.tenant-auth.entrypoints=websecure
traefik.http.routers.tenant-auth.tls.certresolver=letsencrypt
traefik.http.routers.tenant-auth.priority=1000
traefik.http.routers.tenant-auth.middlewares=auth-ratelimit@docker
traefik.http.routers.tenant-auth.service=<dokploy tenant-portal service name>
```

**platform-portal:**
```
traefik.http.routers.platform-auth.rule=Host(`${PLATFORM_DOMAIN}`) && PathPrefix(`/api/auth/login`)
traefik.http.routers.platform-auth.entrypoints=websecure
traefik.http.routers.platform-auth.tls.certresolver=letsencrypt
traefik.http.routers.platform-auth.priority=1000
traefik.http.routers.platform-auth.middlewares=auth-ratelimit@docker
traefik.http.routers.platform-auth.service=<dokploy platform-portal service name>
```

- `priority=1000` makes this router win over Dokploy's Host-only router for the auth paths; all other
  paths keep falling through to the existing router unchanged.
- The `service` must be the loadbalancer service Dokploy created for that app (check the Traefik
  dashboard / Dokploy-generated labels for the exact name).

### Option B — file provider

Mount `infrastructure/traefik/dynamic/auth-ratelimit.yml` into Traefik's dynamic config directory
(Dokploy → Traefik file provider / `providers.file.directory`), then attach `auth-ratelimit@file`
to the path-scoped routers from Option A (swap `@docker` for `@file`).

## Verify

From an external host, hammer the login path and confirm 429 kicks in after the burst; confirm a
normal portal page is unaffected:
```
for i in $(seq 1 30); do
  printf '%s ' "$(curl -s -o /dev/null -w '%{http_code}' -X POST \
    https://${TENANT_DOMAIN}/api/auth/login \
    -H 'Content-Type: application/json' --data '{"email":"x@x.com","password":"x"}')"
done; echo
# expect 200/401s up to the burst, then 429s
curl -s -o /dev/null -w '%{http_code}\n' https://${TENANT_DOMAIN}/   # expect 200 — not rate-limited
```

## Tuning & caveats

- Start at 10/min burst 20; tighten if logs show it's comfortably above real usage.
- **CDN / L7 load balancer in front of Traefik:** the remote address becomes the proxy's, not the
  client's. Set `sourceCriterion.ipstrategy.depth` (label: `...ratelimit.sourcecriterion.ipstrategy.depth=1`)
  to the number of trusted hops so the client IP is read from the correct `X-Forwarded-For` position.
- This does **not** fix M6 (a known email can still be locked by ~5 failures) — that needs the
  lockout-model change in the redesign doc. It does make reaching that threshold, and spraying,
  materially harder and slower per source IP.
