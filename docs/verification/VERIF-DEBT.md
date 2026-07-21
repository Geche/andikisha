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
  - **Tenant portal — CLEARED (2026-06-07).** Credentials re-established via the
    super-admin reset path (`/super-admin/tenants/{id}/admin-password-reset` →
    forced-change completed via `/auth/change-password`); fresh password stored in
    the gitignored `config/env/tenant-verify.env` (`TENANT_ADMIN_PASSWORD`), never
    printed. Captured `/admin/dashboard` + the employees table: vertical sidenav
    (intentional layout — not converted), green-700 primaries, amber accent CTA,
    warm-neutral table headers/dividers/chrome, no regression.
    `verification/2026-06-07-step2-tenant-{dashboard,employees}.png`.
    **Caveat:** tenant data rows did not populate — tenant-scoped requests return
    `503 LICENCE_CHECK_UNAVAILABLE` (Redis-connectivity infra issue; see
    `docs/engineering/backend/2026-06-07-redis-readiness-503-backlog.md`). Not a
    token-migration regression (the chrome renders correctly); populated-row
    evidence of the warm-neutral shift comes from the platform tenants table.
- **Status: CLEARED 2026-06-07** — no longer blocks merge to master.
