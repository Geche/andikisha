# Verification Debt Register

Deferred verifications that must be cleared **before merge to master**. Each item
records what was not verified, why, the evidence already in hand, and the exact
condition to clear it.

---

## VERIF-DEBT-001 — Dense authenticated-surface visual verification

- **Opened:** 2026-06-06 (design-system token consolidation, Step 2).
- **Scope:** the **dashboard + ≥1 table screen per portal** (`tenant-portal`,
  `platform-portal`), and any later migration step whose visual delta only shows
  on authenticated, data-dense surfaces — the warm-neutral shift, table
  header/divider styling, row-hover fills, etc. Login pages do **not** exercise
  these (mostly brand-green + a white card).
- **Why deferred:** the running api-gateway returns `401`
  (`WWW-Authenticate: Basic`) on the public route
  `/api/v1/public/workspaces/{slug}/resolve` (same for a real and a random slug),
  so the BFF login returns `RESOLVE_ERROR` and **no login works — automated or
  manual**. See `VERIFICATION-NOTE-001.md` and the gateway P1 defect report.
- **Evidence already in hand (not a substitute for the visual check):**
  - Token-level proof of the warm-neutral shift — compiled CSS shows old cool
    `#6b7280`/`#1f2937` = **0 occurrences** in both portals; warm `#737373` present.
  - Login-surface screenshots (Roboto headings; platform Sign In = green-700).
  - Tooling ready: Playwright-core 1.60 + cached chromium, smoke-tested.
- **Clear when:** backend login is restored → log in to each portal, capture the
  dashboard + a table screen, attach to `VERIFICATION-NOTE-001`, and confirm (a)
  the warm-neutral shift reads correctly and (b) no regression on dense surfaces.
- **Progress (2026-06-06):** backend **P1 fixed** (real api-gateway restored on
  `:8080`, `resolve` + super-admin login work end-to-end).
  - **Platform portal — CLEARED.** Dashboard + tenants table captured and
    verified: warm neutrals correct on dense tables, `Provision Tenant` primary =
    green-700, status badges + pagination intact, no regression.
    `verification/2026-06-06-step2-platform-{dashboard,tenants}.png`.
  - **Tenant portal — still open.** The demo admin password (`Admin@123!`, from
    21-day-old memory) returns `INVALID_CREDENTIALS` — changed since. Needs the
    current admin password (or a reset) to capture `/admin/dashboard` + an admin
    table. Slug confirmed: `andikisha-demo`.
- **Blocks:** merge of `chore/frontend-design-system-tokens` → `master`
  (tenant-portal dense surface still unverified).
