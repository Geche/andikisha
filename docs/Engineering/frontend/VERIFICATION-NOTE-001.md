# VERIFICATION-NOTE-001 — Per-step verification gate

**Applies to:** the design-system token consolidation
(`2026-06-05-token-consolidation-plan.md`) and any step that touches a built app.
**Purpose:** make each user-visible step a *real* gate, not a ritual. A vague
"grep for tokens" passes too easily; the assertions below do not.

Every app-touching step produces a **Verification Record** (section §Audit trail)
containing **all** of A–E. The step is DONE only when A–E pass and all three apps
still build.

## A. Build
Exact command + exit code. Must be 0.

## B. Five mechanical assertions (compiled output, each with quoted evidence)
1. **Canonical tokens emitted** — the new tokens used on the changed surface
   appear in compiled CSS with correct values (e.g. `--color-green-700:#0b3d2e`).
2. **Legacy aliases still resolve** — a sampled legacy class the app actually
   uses still emits its value (e.g. `bg-brand-900` → `#0b3d2e`), proving
   alias-then-migrate did not break existing UI.
3. **No source-of-truth violation** — the app's own `globals.css` no longer
   defines a competing `@theme` colour block; tokens come only from the shared
   `@import`.
4. **Intended shift present** — the warm neutral values are emitted, not the old
   cool ones (e.g. `--color-neutral-500:#737373`, **not** `#6b7280`).
5. **No Tailwind diagnostics** — build/compile emits no "cannot resolve" /
   "unknown utility" / missing-variable warnings for classes used on the surface.

## C. Screenshot attempt (REQUIRED to attempt)
Capture the changed surface(s) via headless browser. Playwright browsers are
cached on this machine (`~/Library/Caches/ms-playwright`). If capture is
genuinely impossible, state why, fall back to B+D, and record the fallback.
**Never claim "verified via screenshot" without an attached image.**

## D. Visual checklist (per changed surface)
- [ ] Headings render **Roboto** (not a serif/sans fallback).
- [ ] Primary action renders **green-700 `#0b3d2e`**; accent renders amber-500.
- [ ] No layout regression vs prior (spacing, borders, radii intact).
- [ ] **Expected delta only** (e.g. subtle neutral warmth / green-tinted shadow);
      nothing unexpected.

## E. Audit trail
Append a dated entry below (and/or in the step's commit body) recording: step,
commit, build cmd+result, the five assertions (pass/fail + evidence), screenshot
method used (or fallback + reason), checklist result.

---

## Audit trail

### 2026-06-06 — Step 2a: tenant-portal adopts shared `@theme`

- **Change:** `tenant-portal/src/app/globals.css` — replaced the inline `@theme`
  block with `@import "@andikisha/ui/theme.css"`; kept `@source` + `@layer base`.
- **A. Build:** `@tailwindcss/postcss` compile of the app's CSS with real
  `@source` over `tenant-portal/src` + `packages/ui/src` → `COMPILE_OK`, 44550
  bytes. Live `next dev` compiled `/login` → **HTTP 200**.
- **B. Five assertions:**
  1. Compile OK, **0 warnings**. ✅
  2. Legacy aliases resolve (used classes): `brand-900 #0b3d2e`, `amber #e8a020`,
     `near-black #02110c`, `surface #ffffff`, `brand-50 #e8f5f0`. ✅
  3. No competing defs in `globals.css`: 0 `@theme`, 0 `--color-`, import present. ✅
  4. Warm-neutral shift: `neutral-500 #737373`, `-800 #262626`, `-100 #f0f0f0`;
     **old cool `#6b7280`/`#1f2937` count = 0**. ✅
  5. No Tailwind diagnostics. ✅
- **C. Screenshot:** Chrome `--headless=new` (Playwright JS pkg not installed;
  browser binaries cached) → `verification/2026-06-06-step2a-tenant-login.png`.
- **D. Checklist:** headings Roboto ✅; forest-green brand background ✅ (primary
  "Continue" button disabled on empty workspace → exact green confirmed via B2,
  not pixel) ✅; white card + subtle shadow ✅; no layout regression ✅; subtle
  expected delta only ✅.
- **Result: PASS.**

### 2026-06-06 — Step 2b: platform-portal adopts shared `@theme`

- **Change:** `platform-portal/src/app/globals.css` — same swap as 2a.
- **A. Build:** CSS compile `COMPILE_OK` 30366 bytes; live `next dev` (port 3003)
  compiled `/login` → **HTTP 200**.
- **B. Five assertions:** (1) compile, **0 warnings** ✅; (2) aliases resolve —
  `brand-900 #0b3d2e`, `amber #e8a020`, `near-black #02110c`, `surface #ffffff` ✅;
  (3) 0 `@theme` / 0 `--color-` in globals.css, import present ✅; (4) warm shift —
  `neutral-500 #737373`, cool `#6b7280`/`#1f2937` = 0 (neutral-800 unused→tree-shaken) ✅;
  (5) no diagnostics ✅.
- **C. Screenshot:** `verification/2026-06-06-step2b-platform-login.png`. The
  **enabled** "Sign In" button renders **green-700** — direct visual confirmation
  of the primary colour (tenant's was disabled).
- **D. Checklist:** Roboto heading ✅; primary green-700 ✅; white card + shadow ✅;
  no regression ✅.
- **Result: login surface PASS.**

### ⚠️ Step 2 NOT CLOSED — authenticated surfaces blocked by a backend issue *(SUPERSEDED — diagnosis below was wrong)*

> **CORRECTION (2026-06-07):** the 401 was **not** gateway Spring Security. The
> response carried `Set-Cookie: JSESSIONID` + `WWW-Authenticate: Basic realm="Realm"`
> — impossible for the reactive (Netty) gateway; that is a *servlet* app on Spring
> Boot's default security auto-config. `:8080` was squatted by an unrelated local
> project (`arusifiti/apps/core-api`); the real gateway wasn't running. In source,
> both hops were always open (`anyExchange().permitAll()` at the gateway;
> `/api/v1/public/**` whitelisted in tenant-service). No backend change was needed.
> Full root cause + prevention:
> `docs/Engineering/backend/2026-06-06-P1-gateway-public-resolve-401.md`.
> Resolution and closure: see the entries from "Step 2 PROVISIONAL CLOSURE" onward.

Login pages don't exercise the warm-neutral shift (mostly green + white card).
Closure requires **dashboard + one table screen per portal**, which need an
authenticated session — and that is currently **impossible in this stack**:

- The running **api-gateway returns `401` with `WWW-Authenticate: Basic realm="Realm"`**
  on the supposedly-public resolve endpoint
  `/api/v1/public/workspaces/{slug}/resolve` — identical for `demo` and a random
  slug, so it is **endpoint-level Spring Security**, not a wrong slug, licence, or
  Playwright issue. (Redis licence cache was seeded; `actuator/health` is 200.)
- This makes the BFF login return `RESOLVE_ERROR`, so **no login works** —
  automated or manual. The gateway must `permitAll` that route (or the BFF must
  attach the SYSTEM JWT) before any authenticated surface can be reached.

Tooling readiness (so capture is immediate once login is restored): **Playwright-core
1.60 with the cached chromium is installed and smoke-tested working**; the
mechanical gate already proves the shift at the token level (assertion B4:
cool `#6b7280`/`#1f2937` = 0 in both portals' compiled CSS). Closure deferred
pending the backend fix or an alternative valid session.

### 2026-06-06 — Step 2 PROVISIONAL CLOSURE

- **Code:** 2a `b34ea37` (tenant) + 2b `9b66d61` (platform) — both portals now
  consume the shared `@theme`; no per-app token block remains.
- **Verified now:** compile (0 warnings) + 5 mechanical assertions PASS per portal;
  warm-neutral shift proven at token level (cool `#6b7280`/`#1f2937` = 0 both);
  login surfaces screenshotted (Roboto; platform Sign In = green-700).
- **Deferred → VERIF-DEBT-001:** dense authenticated surfaces (dashboard + table,
  both portals), blocked by the gateway 401 (backend P1 defect).
- **Status: PROVISIONALLY CLOSED.** VERIF-DEBT-001 **blocks merge to master**
  until the dense-surface visual check is completed.

### 2026-06-06 — Step 2 dense surfaces: PLATFORM verified (P1 fixed)

- **Backend P1 fixed:** the real api-gateway was brought up on `:8080` (it wasn't
  running; an unrelated project held the port). `resolve` now returns clean JSON
  unauthenticated; super-admin login works; tenant slug = `andikisha-demo`.
- **Platform portal dense surfaces — PASS** (Playwright + cached chromium, super-admin
  session): `/dashboard` (200) and `/tenants` (200). Warm neutrals read correctly
  on the dense tables (headers/dividers/text), `Provision Tenant` primary = green-700,
  status badges + pagination intact, no regression. Evidence:
  `verification/2026-06-06-step2-platform-{dashboard,tenants}.png`.
- **Tenant portal dense surfaces — still pending:** demo admin password from memory
  is `INVALID_CREDENTIALS`; awaiting current password (tracked in VERIF-DEBT-001).
- **Step 2 remains PROVISIONALLY CLOSED** until the tenant-portal dense surface is
  captured.

### 2026-06-07 — Step 2 FULL CLOSURE ✅

- **Tenant portal dense surfaces — PASS** (Playwright + cached chromium, demo admin
  session). Credentials re-established safely via the super-admin reset path
  (forced-change completed; fresh `TENANT_ADMIN_PASSWORD` stored in gitignored
  `config/env/tenant-verify.env`, never printed/committed).
  - `/andikisha-demo/admin/dashboard` (200): vertical sidenav (intentional layout,
    not converted to horizontal), Dashboard active in green, green-700 primary
    buttons, warm-neutral chrome. Onboarding state (empty demo tenant).
  - `/andikisha-demo/admin/employees` (200): full table chrome — amber `+ Add
    Employee` accent CTA, segmented filter, **warm-neutral table headers
    (NAME/EMPLOYEE #/…/ACTIONS) + sort carets + dividers**, no regression.
  - Evidence: `verification/2026-06-07-step2-tenant-{dashboard,employees}.png`.
- **Caveat (not a regression):** tenant data rows did not populate — tenant-scoped
  requests return `503 LICENCE_CHECK_UNAVAILABLE` (Redis-connectivity infra issue,
  same root as the readiness 503; filed as a backlog item against the deployment
  path). The token migration's chrome renders correctly; populated-row evidence of
  the warm-neutral shift is the platform tenants table (2026-06-06 entry).
- **VERIF-DEBT-001: CLEARED.** Both portals' dense surfaces verified.
- **STATUS: Step 2 FULLY CLOSED.** Both portals consume the shared `@theme`;
  no longer blocks merge to master.

### 2026-06-07 — Step 3: landing Tailwind v3 → v4 + shared `@theme` ✅

- **Change:** `app/globals.css` `@tailwind` → `@import "tailwindcss"; @import
  "@andikisha/ui/theme.css"; @plugin "@tailwindcss/typography";` + four `@source`
  globs (app/components/content/MDX + packages/ui). `tailwind.config.ts` deleted
  (colours now from the shared theme; `content`→`@source`; dead `h1/h2-display`
  clamps dropped — confirmed unused). `postcss.config.mjs` → `@tailwindcss/postcss`
  (autoprefixer removed). `package.json` → Tailwind v4. `@layer components`
  rewritten: **R1 fix** (`form-textarea` no longer `@apply`s the `.form-input`
  component class), prose colours mapped to shared tokens.
- **Amendments honoured:** **zero Tailwind arbitrary values** in `globals.css`
  (`text-[15px]`→`text-ui` token, `text-[14px]`→`text-sm`, `text-[13px]`→`text-ui-sm`,
  `py-[14px]`→`py-3.5`, `-translate-y-[2px]`→`-translate-y-0.5`, the arbitrary
  card `shadow-[…rgba]`→ token `shadow-lg`; 1.5px hairline kept as plain CSS, not
  an arbitrary utility). Focus-ring restyle deferred to Step 4 (left working).
- **A. Build:** `@tailwindcss/postcss` compile `COMPILE_OK` (0 warnings; typography
  plugin loaded — 20 `.prose` rules). **`next build` → Compiled successfully, 28/28
  static pages** (incl. MDX).
- **B. Mechanical:** tokens resolve (`brand-900 #0b3d2e`, `amber #e8a020`,
  `ink-900 #02110c`); `text-ui`→`0.9375rem` via `@apply` (no unknown-utility error);
  `form-textarea` generated (R1 ok); card hover now green-tinted token shadow
  (`rgba(2,17,12…)`, old `rgba(7,30,19)` removed from globals.css); **0 arbitrary
  utilities** in `globals.css`; no `@tailwind`/`tailwind.config` leftovers.
- **C. Screenshots (Playwright + cached chromium):**
  - **home** before/after — **pixel-identical** (`…step3-home-{before,after}.png`).
  - **pricing** before/after — **identical** (`…step3-pricing-{before,after}.png`).
  - **blog/MDX** (`…step3-blog-after.png`) — prose styled (bold near-black headings,
    readable body) → typography `@plugin` + MDX `@source` verified (R2).
  - **form** (`…step3-contact-after.png`) — `.form-input`/`.form-label` render (R1 ok).
- **R1 (@apply under v4):** resolved. **R2 (content→@source + MDX/typography):** verified.
- **Out of scope (flagged):** landing *components* still contain pre-existing
  arbitrary values / hardcoded hex (e.g. one `rgba(7,30,19)` card shadow in a
  component) and `info` shifts `#60a5fa`→`#1b84ff` (shared semantic token) on the
  product page — both belong to the Step 5 stray-hex/arbitrary cleanup, not this
  plumbing step.
- **STATUS: Step 3 complete.** Landing on Tailwind v4 consuming the shared `@theme`.

### 2026-06-07 — Step 4: focus halo + Button hover + shadows + motion ✅

- **Change:**
  - **Focus ring** amber outline → **named `shadow-focus` halo** (from `--shadow-focus`;
    no arbitrary `shadow-[]`). ui primitives (button, Input, Textarea, Select,
    Checkbox, Switch, Dialog, ProfileMenu, Sheet) → `focus-visible:outline-none
    focus-visible:shadow-focus`. Landing `@apply` classes (`.btn-*`, `.form-*`,
    `.focus-ring`) → halo; the **inline component focus sites centralised through the
    `.focus-ring` class** (one mechanical pass; `partners` opacity-modifier straggler
    spot-fixed). Platform `tenants/page.tsx` 1 site.
  - **Button primary hover fix:** `hover:bg-brand-800` (lighter) → `hover:bg-green-800`
    (`#082e23`) — now darkens.
  - **Motion:** `prefers-reduced-motion` block added to both portals (landing already had it).
- **Mechanical:** 0 `outline-amber` remaining (all apps + ui); 17 `shadow-focus`
  uses, **0 arbitrary focus `shadow-[]`**; Button primary hover = `green-800`;
  reduced-motion ×3; all three globals compile **0 warnings**.
- **Rendered (Playwright computed style, authed):**
  - PLATFORM ui **Input focus** `box-shadow` = `rgba(11,61,46,0.16) 0 0 0 4px` — the green halo ✓.
  - PLATFORM ui **Button** (Provision Tenant): base `rgb(11,61,46)` → **hover `rgb(8,46,35)`**
    = green-700 → green-800 darken ✓.
- **Screenshots:** landing focus halo on a form input (clear green glow,
  `step4-landing-focus-halo.png`); platform focus halo + hover-darken
  (`step4-platform-{focus-halo,hover-darken}.png`); tenant admin surface
  (`step4-tenant-surface.png`); reduced-motion home (`step4-reduced-motion.png`).
- **Breakage note (halo vs `overflow-hidden`):** halos render un-clipped on the
  verified elements.
- **Honest caveats:** (a) `:focus-visible` on **buttons** can't be driven by
  programmatic Playwright focus (Chromium only flags focus-visible on keyboard nav);
  the button halo is proven via source + the `shadow-focus` token rendering (shown on
  the input). (b) Portal **login** pages use custom inputs/buttons (only `LogoFull`
  from ui) — the halo/hover apply to ui components on app surfaces (verified on
  platform) + landing's own classes; tenant uses the same shared ui Button/Input. (c)
  On dark-green hero backgrounds the translucent green halo is low-contrast
  (`btn-outline-white`) — flagged as a design-system follow-up.
- **STATUS: Step 4 complete.**

_(entries appended per step as the migration executes)_
