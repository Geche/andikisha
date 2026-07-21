# Dokploy deploy webhook is sent over plain HTTP

**Date:** 2026-07-21
**Status:** Accepted, short-term
**Applies to:** `.github/workflows/ci.yml` — `Trigger Dokploy Deploy`

## Context

The `Trigger Dokploy Deploy` step had been failing on every merge to master
with `curl` exit 60 (certificate verification failed), so no merge had
triggered a redeploy for an extended period. Images were built and pushed to
ghcr but never reached the server.

The cause was a rewrite in the workflow that forced the webhook URL from
`http://` to `https://`, on the stated assumption that Dokploy sat behind a
reverse proxy issuing a 301 redirect. That assumption was wrong for this
deployment. Probing the host confirmed:

| Request | Result |
| --- | --- |
| `http://<host>:3000/` | 200 OK |
| `https://<host>:3000/` | fails — port 3000 does not serve TLS |
| `https://<host>:443/` | fails — TLS present, certificate not trusted |

Dokploy is served directly on port 3000 over plain HTTP. There is no TLS
listener on that port and no redirect to follow.

## Decision

Send the webhook URL exactly as Dokploy issues it, over plain HTTP.

## Consequence and accepted risk

The deploy token is the entire credential — the URL embeds a secret path
segment, and possession of it is sufficient to trigger a production redeploy.
Sending it over plain HTTP means:

- Any party able to observe traffic between the GitHub runner and the host can
  capture the token.
- A captured token allows an attacker to trigger redeploys of production.

It does **not** grant access to application data, database contents, or the
Dokploy panel itself. The blast radius is "can force a redeploy of whatever
images are currently tagged", not data disclosure.

This was accepted because deploys were fully blocked, and the alternative
considered (`curl -k`) is strictly worse: it silences the verification error
while leaving the connection equally unverified, and hides the problem from
future readers.

## Preferred fix

Give the Dokploy panel a real hostname and certificate:

1. Point a DNS record (e.g. `deploy.<domain>`) at the host.
2. Configure that domain in Dokploy's own Web Server settings so Traefik
   provisions a Let's Encrypt certificate for it.
3. Update the `DOKPLOY_WEBHOOK_URL` GitHub secret to the `https://` form.
4. Remove the `TODO: deviation` comment in `ci.yml`.

No workflow change is needed for step 3 — the step now sends whatever scheme
the secret specifies, so an `https://` secret with a valid certificate will
verify normally.

## Related

- The webhook token in use at the time of this decision was exposed in a
  screenshot and should be rotated via the ↻ control on the Dokploy
  Deployments tab, with the new URL written back to the GitHub secret.
