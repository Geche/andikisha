# Token Consolidation Plan

**Date:** 2026-06-05
**Status:** PLAN — not executed. Present for approval; do not begin migration.
**Authority:** `frontend/CLAUDE.md` + `docs/audits/2026-06-05-gap-audit-correction.md`.
**Branch (when approved):** `chore/frontend-design-system-tokens` (separate from the docs branch).

Standard being adopted: **Roboto + Roboto Mono, Lucide default**, design-system
token values from `frontend/packages/ui/design-system/colors_and_type.css`.

---

## Scope

**In scope** — the six base items plus three expansions:

| # | Item |
|---|---|
| B1 | Single shared `@theme` token source in `frontend/packages/ui`; apps import it |
| B2 | `landing` Tailwind **v3 → v4** |
| B3 | Stray hardcoded hex cleanup (mockup-chrome exempt, comment-marked) |
| B4 | `ink-*` reconciliation in `landing` (see correction below — not an "undefined" fix) |
| B5 | Roboto Mono adoption — replace DM Mono (`landing`, refs in `tenant-portal`) and `ui-monospace` (`platform-portal`) |
| B6 | Docs update |
| **E1** | **Token value + structure rewrite** — green/amber `25–900` ramps, warm neutrals, semantic colours (`success/warning/danger/info` + `-bg`), role tokens (`primary`, `accent`, `fg1–4`, `bg1–3`, `bg-ink`, borders), with component re-pointing |
| **E2** | **Focus ring** amber → 4px green halo, and **Button primary hover bug** fix (hover must darken, not lighten) |
| **E3** | **Shadow tokens** (green-tinted `xs–xl` + `card` + `focus`), **motion tokens**, `prefers-reduced-motion` in both portals |

**Out of scope (stated explicitly):**
- Icons (Lucide stays default; Tabler alternate). `FE-BACKLOG-001` was **retired**, not deferred.
- App shell / nav structure — the two intentional shells (tenant vertical sidenav, platform horizontal nav) are not converted.
- Component-DNA backlog: `FE-BACKLOG-002` (Card primitive + accent bar), `FE-BACKLOG-003` (StatCard icon chip + status dots), `FE-BACKLOG-004` (type-scale tokens, table alignment, sidebar 260px, `KES`→`KSh`).
- Copy / casing changes.

> Note on E1's "component re-pointing": this plan establishes the new tokens
> **and** the legacy aliases, then migrates call-sites **incrementally**. It does
> not require re-pointing all 456 `brand-*` sites before it is "done" — see the
> rename strategy. Full re-point can trail into the component backlog.

---

## Blast-radius measurements (taken 2026-06-05)

| Token family | Occurrences | Files | Notes |
|---|---|---|---|
| `brand-*` | **456** | 85 | tenant 200, landing 163, ui 64, platform 29 |
| `amber*` | **234** | — | landing 101, tenant 78, ui 30, platform 25 |
| `near-black` | **130** | — | tenant 84, platform 33, ui 13, landing 0 |
| `ink-*` (landing only) | many | ~10+ | defined ramp in `landing/tailwind.config.ts` |
| `font-mono` sites | ~38 | 35+ | landing ~20, tenant ~12, platform ~3, ui 3 |
| amber focus-ring (`outline-amber`/`ring-amber`) | **~119** | — | **landing 109**, ui 9, platform 1, tenant 0 |

These numbers drive the strategy below.

---

## Corrections to earlier assumptions (read before planning)

1. **`ink-900` is not undefined.** The turn-1 audit flagged `text-ink-900` as
   possibly stale. It is a **defined** family in `landing/tailwind.config.ts`
   (`ink-900 #02110c`, plus `ink-700/600/400/200/100` = neutrals). B4 is
   therefore a **reconciliation** of a landing-only token family into the shared
   tokens (`green-900`/`near-black` + neutrals), not a broken-reference fix.
2. **Focus-ring swap is ~119 sites, not ~11.** The "~11" counted only
   `packages/ui`. `landing` alone has 109 `outline-amber` usages. E2 is
   materially larger than scoped and is split accordingly (centralise in landing
   during B2 rather than touch 109 inline sites).
3. **The `neutral-*` name collides.** Design-system neutrals are warm
   (`neutral-500 #737373`); repo neutrals are cool (`#6b7280`), same names.
   Adopting warm neutrals is an unavoidable **global** value shift — handled as a
   deliberate, screenshot-verified change, not an additive alias.

---

## Rename strategy — **alias-then-migrate** (color-neutral)

With 456 `brand-*` sites across 85 files and a **non-1:1 naming offset**
(`brand-900 #0b3d2e` == `green-700`; `brand-950/800/700/500` have *no* matching
green value), a big-bang rename is rejected: it would force 456 edits in one PR
**and** silently shift mid-tone colours. Instead:

1. In the shared `@theme`, define the canonical ramps under their **new** names
   (`green-*`, `amber-25…900`, semantic, role tokens) — purely **additive** for
   green/amber (no name collision).
2. Define legacy tokens (`brand-*`, `amber`/`amber-dark`/`amber-light`/`amber-text`,
   `near-black`, `surface*`, `border-success`, `error`, landing `ink-*`) as
   **deprecated aliases pinned to their current hex** — so every existing class
   renders **identically** after adoption.
3. Migrate call-sites to the new tokens **incrementally, per screen** — this is
   where the visual change lands, one shippable screen at a time. Remove each
   alias once `grep` shows zero usage.

**Exception — `neutral-*`:** cannot be aliased (name collision). The warm-neutral
shift is applied globally at portal adoption and verified by screenshot; the
deltas are subtle (cool→warm gray). Escape hatch: pin a specific step value back
to its cool hex if any screen regresses.

Net: the token **foundation** ships without a forced visual rewrite; the 456-site
re-point is decoupled and incremental.

---

## Ordering (as required)

1. **Step 1** — shared `@theme` foundation in `packages/ui` (no consumer yet).
2. **Step 2** — portals adopt the shared theme (tenant, then platform).
3. **Step 3** — `landing` Tailwind v3 → v4 + adopt shared theme.
4. **Step 4** — focus ring + Button hover + shadow + motion + `prefers-reduced-motion`.
5. **Step 5** — Roboto Mono + stray-hex cleanup + alias retirement + docs.

Every step leaves **all three apps building and shippable**. User-visible steps
require behavioral verification (dev server + screenshots), per
VERIFICATION-NOTE-001 practice — a passing build is not sufficient.

---

## Steps

### Step 1 — Shared `@theme` foundation (no app changes)

- **Files:** new `frontend/packages/ui/src/theme.css`; `frontend/packages/ui/package.json` (add `exports` entry `"./theme.css"`).
- **Change:** author the full token set from `design-system/colors_and_type.css` —
  `green-25…900`, `amber-25…900`, warm `neutral-25…900`, semantic (`success/warning/danger/info` + `-bg`), role tokens (`--color-primary`, `--color-accent`, `--color-fg1…4`, `--color-bg1…3`, `--color-bg-ink`, `--color-border*`), radii, spacing, shadows (E3), motion (E3). Add deprecated **legacy aliases** at current hex per the rename strategy. Fonts: `--font-sans/display` → Roboto, `--font-mono` → Roboto Mono.
- **Breakage risk:** none — nothing imports it yet. Risk is purely authoring error (wrong hex). 
- **Verification:** `packages/ui` builds; `@andikisha/ui/theme.css` resolves via the new `exports`; diff token values against `colors_and_type.css` (mechanical check). No screenshots (no rendered change).

### Step 2 — Portals adopt the shared theme

- **Files:** `frontend/tenant-portal/src/app/globals.css`, then `frontend/platform-portal/src/app/globals.css`. One portal per commit.
- **Change:** replace each app's inline `@theme {…}` block with `@import "@andikisha/ui/theme.css";` (keep `@import "tailwindcss"` first and the `@source` line). Delete the duplicated per-app token block.
- **Breakage risk:** (a) `@theme` may not resolve through a package `@import` in the Next.js + `@tailwindcss/postcss` pipeline — **see Risk R3**; (b) the warm-`neutral-*` global shift; (c) any portal class using a token not yet in the shared theme.
- **Verification:** both portals build; **screenshots** of dashboard, a table screen, and login — expected delta = subtle neutral warmth only (greens/ambers unchanged via aliases). Headings render Roboto; primary actions render via aliased `brand-900` (== `green-700`).

### Step 3 — `landing` Tailwind v3 → v4 + adopt shared theme

- **Files:** `frontend/landing/app/globals.css`, `frontend/landing/tailwind.config.ts` (removed/retired), `frontend/landing/postcss.config.mjs`, `frontend/landing/package.json`.
- **Change:** `@tailwind base/components/utilities` → `@import "tailwindcss"; @import "@andikisha/ui/theme.css";` + `@source`. Move `tailwind.config.ts` colours into the shared theme as aliases (incl. `ink-*`, B4). Convert the `@layer components` `@apply` button/input classes (B4 `ink-*`, focus rings → Step 4). Migrate `@tailwindcss/typography` to the v4 `@plugin` directive. Convert `content` globs → `@source`.
- **Breakage risk:** highest step. `@apply` semantics under v4 (**R1**); `content`→`@source` (**R2**); typography plugin loading; landing's two custom `fontSize` clamps (`h1-display`/`h2-display`) need re-homing.
- **Verification:** landing builds; **screenshots** of home hero, pricing, a blog/MDX page (typography plugin), a form (focus). Roboto display headings; amber CTA intact; prose styled.

### Step 4 — Focus ring + Button hover + shadows + motion

- **Files:** `frontend/packages/ui/src/components/{button,Input}.tsx` (+ ~7 other `outline-amber` sites in ui); `frontend/landing/app/globals.css` `@layer components` (centralise the 109 inline landing focus rings into the shared button/input classes); `platform-portal` (1 site); shared `theme.css` (shadow/motion tokens already added in Step 1).
- **Change:** `focus-visible:outline-* outline-amber` → 4px green halo via `--shadow-focus` (`focus-visible:shadow-[var(--shadow-focus)]` or a `ring`-based util bound to the token). **Button primary hover fix:** `hover:bg-brand-800` (lighter) → darken correctly (`green-700`→`green-800`, i.e. `#0b3d2e`→`#082e23`). Add `@media (prefers-reduced-motion: reduce)` blocks to both portals' `globals.css`.
- **Breakage risk:** focus halo via box-shadow vs outline interacts with `overflow-hidden` containers; the 109 landing inline sites — **do not edit individually**, centralise in the `@apply` classes and spot-fix stragglers.
- **Verification:** **screenshots** — keyboard-focus a button and an input in each app (green halo visible); hover primary button (darkens); a motion-reduced capture.

### Step 5 — Roboto Mono + stray hex + alias retirement + docs

- **Files:** each app `layout.tsx` (load `Roboto_Mono` via `next/font/google`, set `--font-dm-mono`/`--font-mono` var); remove `DM_Mono` from `landing/app/layout.tsx`; fix `platform-portal` `ui-monospace`; stray-hex files (landing `contact/page.tsx` + mockups, tenant `leave/_types.ts` + auth pages, platform `login/page.tsx`); `frontend/CLAUDE.md` (delete "current vs target" bullets that are now true).
- **Change:** wire Roboto Mono so `font-mono` (MoneyAmount, DataTable, tables) renders Roboto Mono. Replace stray hex with tokens; mark genuine mockup chrome with an exemption comment. Retire any alias whose `grep` count has reached 0.
- **Breakage risk:** low. Mockup-chrome hex must be **exempted, not tokenised** (would distort intentional illustrations). Alias retirement only when usage is provably 0.
- **Verification:** all three build; **screenshot** a money table (Roboto Mono figures); `grep` confirms no stray hex outside exemptions; `grep` confirms retired aliases unused.

---

## Known risks (assessed)

- **R1 — landing `@apply` under v4.** v4 still supports `@layer components` + `@apply` of **utility** classes; landing's `@apply` uses utilities (`bg-amber`, `rounded-lg`, `px-6`, `text-ink-900`), so it should port, but `@apply` of any *component* class breaks. Mitigation: audit each `@apply` for non-utility tokens during Step 3; convert offenders to direct utilities. Verify by building landing, not by inspection alone.
- **R2 — `content` → `@source`.** v4 drops `content` globs for `@source`. landing's globs (`./app`, `./components`, `./content/**/*.mdx`) map directly. Risk: MDX content classes missed → purged styles. Mitigation: include the MDX `@source` and screenshot a blog page.
- **R3 — shared `@theme` import resolution. ✅ RESOLVED (2026-06-06).** Proven that
  Tailwind v4 processes a `@theme` delivered via `@import "@andikisha/ui/theme.css"`
  (package subpath via the `exports` map + workspace symlink): the postcss spike
  registered the imported token identically to an inline one, and the **real
  `next dev` build** of tenant-portal compiled `/login` → HTTP 200 with the
  shared theme live (Step 2a, commit `b34ea37`; assertions in VERIFICATION-NOTE-001).
  The relative-path / re-export fallbacks were not needed.
- **R4 — `brand-*` rename blast radius (456 sites / 85 files).** Resolved by alias-then-migrate (above); no big-bang. The offset (`brand-900`==`green-700`, `brand-950/800/700/500` orphaned) means aliases must map to *current* hex, not to the nearest green, or mid-tones shift unintentionally.
- **R5 — `neutral-*` global shift.** Unavoidable (name collision). Deliberate, screenshot-verified at Step 2; per-step escape hatch to pin a cool value.
- **R6 — Roboto via CDN in the bundle (carried flag).** `design-system/colors_and_type.css` still `@import`s Google Fonts for Roboto. Prototype-only; out of this plan's app scope, but decide separately (self-host vs accept). Does not affect the apps (they use `next/font`).

---

## Definition of done

- One shared `@theme` in `packages/ui`; no per-app token block; `landing` on v4.
- New ramps/semantic/role tokens live; legacy aliases present (retired where unused).
- Focus rings = green halo; Button primary darkens on hover; shadow + motion tokens in use; `prefers-reduced-motion` honoured in both portals.
- Roboto Mono renders in tabular contexts; no stray hex outside marked exemptions.
- All three apps build and render correctly (screenshots attached per user-visible step).
- `frontend/CLAUDE.md` "current vs target" bullets removed as they become true.

**Not done by this plan (by design):** the full 456-site `brand-*`→`green-*`
re-point (incremental / backlog), icons, shells, component-DNA backlog, copy.

---

**STOP.** Awaiting approval. Do not execute.
