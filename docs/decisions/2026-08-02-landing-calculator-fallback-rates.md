# Landing calculator: offline fallback rates

**Date:** 2026-08-02
**Status:** Accepted
**Area:** `frontend/landing` — public payroll calculator

## Context

The marketing homepage's "Live payroll engine" calculator is driven entirely
by the Compliance Service via `/api/compliance-rates`
(`GATEWAY/api/v1/public/compliance/KE/rates`). By deliberate design
(`lib/compute-payslip.ts`) **no statutory rates are hardcoded on the landing
side** — the compute logic operates on whatever the endpoint returns, so it
never drifts when a Finance Bill changes a rate.

Consequence: when the gateway is unreachable (or `API_GATEWAY_URL` is unset),
the route returned HTTP 502 and the calculator rendered a permanent error panel
("Couldn't load the latest statutory rates"). For a prospect trying the product
before buying, a dead calculator reads as a broken product — a conversion risk.

## Decision

Add graceful degradation via a **server-only fallback rate table**.

- `lib/fallback-rates.ts` holds one dated `RawSummary` of standard published
  Kenyan rates (PAYE bands, personal/insurance relief, NSSF, SHIF, Housing
  Levy), mirroring the Kenya compliance context and the payroll engine.
- `app/api/compliance-rates/route.ts` serves it (HTTP 200, `Cache-Control:
  no-store`) whenever the upstream is non-OK or the fetch throws/times out,
  instead of 502.
- The fallback carries `provisional: true`, propagated through `toRates` to
  `StatutoryRates.provisional`. The calculator keeps computing, shows a
  "Standard rates" badge, and swaps its footnote to say live rates are
  momentarily unavailable and to sign in for exact figures.

## Deviation and mitigation

This is a conscious exception to the "no hardcoded rates on the landing side"
principle. Accepted because graceful degradation inherently requires *some*
fallback values, and a functional-but-labelled calculator beats a dead one.

Mitigations against the reintroduced staleness risk:

- Fallback lives in **one** file, imported **only** by the server route (never
  in the client bundle), with a `// TODO: deviation` marker pointing here.
- Output is flagged `provisional` and visibly labelled, so users are never told
  fallback numbers are live.
- `no-store` on the fallback response means live rates resume the instant the
  Compliance Service recovers; the stale table is never cached.
- The file's header comment requires review whenever a Finance Bill changes a
  rate.

## Note (separate)

The fallback is a safety net, not a substitute for configuration:
`API_GATEWAY_URL` must still be set in the deployed environment and point at a
gateway exposing the public rates endpoint, so the live path is the norm.
