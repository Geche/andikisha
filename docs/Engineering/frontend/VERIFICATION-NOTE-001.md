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

### ⚠️ Step 2 NOT CLOSED — authenticated surfaces pending

Login pages alone don't exercise the warm-neutral shift (they're mostly green +
white card). Per directive, Step 2 closure requires **dashboard + one table screen
per portal** verified. Automated headless capture is blocked in this environment:
gateway 401s direct `resolve` calls, the tenant `workspace` slug lookup (DB query)
was denied as out-of-scope, and Playwright's JS package isn't installed. **Handoff:**
human eyeball on the dev servers (creds + URLs in the step report), or provide the
workspace slug + approval to install Playwright for automated capture. Closure
entry to be appended once those surfaces are confirmed.

_(entries appended per step as the migration executes)_
