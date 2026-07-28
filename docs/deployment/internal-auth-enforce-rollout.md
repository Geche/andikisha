# Internal-auth (X-Internal-Auth) enforce rollout runbook (audit M1/M2)

Turns on the gateway→service trust boundary in production **safely**, using the built-in log→enforce
staging. The gateway signs the identity it injects (REST) and every outbound gRPC call; every service
verifies that signature before trusting `X-User-Role`/tenant (REST) or serving gRPC. Until you
enable enforce, verification is **log-only** — nothing is rejected.

Applies to PRs #117 (gateway REST signing), #119 (service REST verify), #120 (gRPC sign/verify) —
all merged.

## The knobs

Both are read by the gateway and every service (via the shared compose env anchor):

| Env var | Meaning | Default |
|---|---|---|
| `INTERNAL_SIGNING_SECRET` | Shared HMAC secret. Gateway signs with it, services verify with it. **Unset ⇒ signing + verification are OFF** (nothing signs, nothing rejects). | unset |
| `INTERNAL_AUTH_MODE` | Service-side verification mode: `off` \| `log` \| `enforce`. | `log` |

`log` = verify and WARN on failure but still serve. `enforce` = reject (`401` REST / `UNAUTHENTICATED`
gRPC) on a missing/invalid attestation. With no secret set, mode is irrelevant (verification can't run).

## Step 1 — Deploy the code in log mode (no secret yet)

Deploy #117/#119/#120 (bump `RELEASE_TAG` to the merged SHA to force a fresh image pull — `:latest`
does not re-pull; see the prod deploy notes). Leave `INTERNAL_SIGNING_SECRET` **unset** and
`INTERNAL_AUTH_MODE=log` (default). Nothing changes behaviourally — signing is off, verification is
off. This just gets the new code running.

## Step 2 — Turn on signing (still log mode)

In the Dokploy **Environment** tab, set one secret shared by the gateway and all services:

```
INTERNAL_SIGNING_SECRET=<openssl rand -hex 32>
```

Redeploy. Now:
- the gateway **signs** `X-Internal-Auth` (REST) and outbound gRPC metadata;
- every service **verifies** it — but in `log` mode, so a mismatch is only logged, never rejected.

## Step 3 — Watch the logs (the whole point of log mode)

For a representative period (a full business cycle — a payroll run, logins across roles, leave/doc
flows), watch every service's logs for verification failures:

```
# REST (TrustedHeaderAuthFilter)
docker logs andikisha-<svc> 2>&1 | grep "X-Internal-Auth verification FAILED"
# gRPC (InternalAuthServerInterceptor)
docker logs andikisha-<svc> 2>&1 | grep "gRPC X-Internal-Auth verification FAILED"
```

**Clean logs (no FAILED lines) across all services ⇒ safe to enforce.** If you see failures, do NOT
enforce — diagnose first (see Troubleshooting). Common benign-looking causes are real problems that
enforce would turn into outages, which is exactly why this phase exists.

## Step 4 — Flip to enforce

Once Step 3 is clean, set in the Dokploy Environment tab and redeploy:

```
INTERNAL_AUTH_MODE=enforce
```

Now a request/gRPC call whose attestation is missing or invalid is rejected. Because the gateway is
the only party that can produce a valid attestation (it strips any client-supplied `X-Internal-Auth`
before signing), a service will now only honour identity that provably came from the gateway.

**Optional — flip one service at a time.** `INTERNAL_AUTH_MODE` is shared via the compose anchor, so
setting it flips everyone. To enforce service-by-service, add a per-service env override
(`INTERNAL_AUTH_MODE=enforce`) on that one container in Dokploy while the anchor stays `log`; verify
it, then widen. Roll back a single service the same way.

## Rollback

Instant, no redeploy of images:
- Set `INTERNAL_AUTH_MODE=log` (or `off`) and redeploy — verification stops rejecting.
- Or unset `INTERNAL_SIGNING_SECRET` — signing + verification both go dark.

Neither loses data; both are pure config.

## Troubleshooting `verification FAILED` in log mode

| Symptom | Likely cause | Fix |
|---|---|---|
| All services fail every request | `INTERNAL_SIGNING_SECRET` differs between gateway and services, or set on only some | Set the **same** value everywhere; it's shared via the anchor, so check no per-service override diverges |
| Failures only for some identity (e.g. requests with no `employeeId`) | An identity header dropped/rewritten between gateway and service (a proxy stripping empty headers) | Confirm the hop preserves `X-User-Email`/`X-Employee-ID` (they may be empty strings); the signature binds their exact values |
| gRPC failures only | Clock skew > 30s between pods, or a caller without the client interceptor | Check pod clocks; confirm the calling service deployed #120 |
| Intermittent failures near deploys | Mixed old/new images mid-rollout (old code doesn't sign) | Expected during a rolling deploy; re-check after it settles |

The 30s skew window means a brief clock drift or an in-flight request across a deploy can log a
failure without being a real attack — another reason to require a **clean window**, not a single
clean moment, before enforcing.

## After enforce

- Keep `INTERNAL_AUTH_MODE=enforce` as the steady state.
- **NetworkPolicy** (defence in depth) is a Kubernetes concept; the current Dokploy/compose deploy
  already isolates services on an internal network with no published ports, so it's not required
  here. If/when the `infrastructure/k8s` manifests are used, add a NetworkPolicy restricting service
  REST (808x) and gRPC (908x) ports to the gateway — tracked in
  `docs/decisions/2026-07-28-internal-trust-boundary.md`.
