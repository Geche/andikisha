# Gap Audit Correction — Roboto + Lucide is the standard

**Date:** 2026-06-05
**Status:** **AUTHORITATIVE.** Supersedes the typeface and icon conclusions of
`2026-06-05-design-system-gap-audit.md`. Where the two disagree, this file wins.
**Governing rule:** `frontend/CLAUDE.md`.

## What happened

The design system bundle went through two exports during the 2026-06-05 sessions:

- **The earlier export** — located at the repo root (`andikisha-design-system/`,
  since deleted). Specified **Inter + Inter Display** typefaces and **Tabler**
  icons. The gap audit (`2026-06-05-design-system-gap-audit.md`) was performed
  against it, and the "full adoption" decision taken mid-session selected
  Inter + Tabler.
- **The canonical bundle (Roboto + Lucide default, Tabler alternate,
  2026-06-05)** — now at `frontend/packages/ui/design-system/`; the earlier
  export has been deleted. It specifies **Roboto + Roboto Mono** with **Lucide**
  as the default icon set and **Tabler as the sanctioned alternate** (and is the
  first export to ship the Tabler webfont for prototypes). Verified:
  `--font-sans: 'Roboto'`, `--font-display: 'Roboto'`, `--font-mono: 'Roboto
  Mono'`; README brand line reads *"Roboto (UI + marketing), Roboto Mono"* and
  *"Lucide (default, inline SVG) · Tabler (alternate, webfont)"*.

**Consequence:** the gap audit measured the codebase against an export that no
longer exists. Its typeface and icon findings are inverted and are void.

## Corrections to `2026-06-05-design-system-gap-audit.md`

| Audit item | Status now |
|---|---|
| Headline gap #1 — "Lucide → Tabler, 71 files" | **VOID.** Lucide is the default standard. No 71-file migration. Tabler is brand-glyphs-only. |
| Headline gap #2 — "Roboto → Inter + Inter Display" | **VOID.** Roboto is the standard; Inter/Inter Display are stale. |
| Axis 2 (Typography) — Roboto→Inter, Inter Display rows | **VOID.** Only the **Roboto Mono** sub-point survives (replace DM Mono / `ui-monospace`). "No separate display typeface" — display = Roboto heavier/larger/tighter. |
| Axis 3 (Icons) — entire axis | **VOID** as written. Replace with: Lucide default (2px SVG); icon-chip pattern still missing (carry forward); Tabler `@tabler/icons-react` brand-glyphs only, never the webfont in apps. |
| Backlog `FE-BACKLOG-001` (Tabler migration) | **DELETED.** Does not happen. |

## Findings that REMAIN valid (carry forward)

These come from the design system's *visual* DNA, unchanged across both exports, and stand:

- **Token model rewrite** — green/amber `25–900` ramps, warm neutrals,
  semantic colours (`success/warning/danger/info` + `-bg`), and **role tokens**
  (`--primary`, `--fg1–4`, `--bg1–3`, `--bg-ink`, borders). None exist today.
- **Shared `@theme` consolidation** — single source in `packages/ui`; retire
  the duplicated portal `@theme` blocks; migrate `landing` Tailwind **v3 → v4**.
- **Button primary-hover bug** — `bg-brand-900` → `hover:bg-brand-800` lightens
  on hover (`#0f5040` is lighter than `#0b3d2e`); spec is darken 700→800.
- **Focus ring** — amber outline → 4px translucent **green halo**
  (`--shadow-focus`), ~11 sites.
- **Elevation / motion tokens** — green-tinted shadows, `--shadow-card`, motion
  (`--ease-out`, `--dur*`); honour `prefers-reduced-motion` in the portals.
- **Roboto Mono** — replace DM Mono (`landing`, `tenant-portal`) and
  `ui-monospace` (`platform-portal`). `MoneyAmount` already uses
  `tabular-nums font-mono` — only the font is wrong.

## Revised backlog

- ~~`FE-BACKLOG-001` — Tabler migration~~ — **deleted.**
- `FE-BACKLOG-002` — `Card` primitive + 4px green accent-bar header pattern.
- `FE-BACKLOG-003` — StatCard icon chip + directional delta arrow; Badge/Avatar
  status dots; **Badge semantic-tone adoption.** Repoint status-badge tones to the
  semantic tokens defined in Step 1 (`success/warning/danger/info` + `-bg`).
  Known site: tenant `leave/_types.ts` `statusBadgeClass` REJECTED is still
  `bg-red-100 text-red-700` (raw Tailwind reds) → should be `bg-danger-bg
  text-danger`; CANCELLED already neutral, PENDING/APPROVED moved to `amber-light`/
  `brand-100` aliases in Step 5. (Lands naturally when leave adopts the shared
  Badge primitive — see `-005` sequencing.)
- `FE-BACKLOG-004` — type-scale tokens (replace hardcoded `text-[Npx]`), table
  header/divider alignment, sidebar-width standardisation (260px), `KES`→`KSh`.
- `FE-BACKLOG-005` — **tenant-portal + both login surfaces adopt the shared
  `@andikisha/ui` primitives.** Replace tenant-portal's *local* `Button`/`Input`
  (23 `<Button>`, only 3 files currently import the shared ones) and the two portal
  **login** pages' custom inputs/buttons (they import only `LogoFull` today) with
  the shared `@andikisha/ui` Button/Input. The green focus halo + Button hover
  consistency then ride along automatically (Step 4 already shipped them in the
  shared primitives). Surfaced by the Step-4 verification: the halo/hover only
  reach surfaces built from the shared primitives.
  - **Sequencing constraint (explicit):** must land **before or together with the
    component-DNA work `FE-BACKLOG-002` (Card primitive + accent bar) and
    `FE-BACKLOG-003` (StatCard icon chip + status dots).** Those build on the
    shared primitives; if 005 lags, the component-DNA reaches **platform-portal
    only** and tenant-portal keeps diverging on its local components.
    *(N.B. the constraint binds to `-002`/`-003`; `FE-BACKLOG-001` is retired.)*

- `FE-BACKLOG-006` — **delete the dead `@andikisha/api-client` package.** Its
  `createApiClient` (bearer-token, `baseURL` from env) is imported **nowhere** —
  both tenant-portal and platform-portal use their own local
  `src/lib/api-client.ts` (BFF proxy, cookie auth, with the real response-error
  policy added in W0). The package is a trap: a future dev could wire it up
  believing it is the real client and bypass the cookie/proxy auth + the licence
  retry / 401 interceptor. Confirmed dead in both apps (UX-flow-remediation-01,
  W0). Do not delete mid-remediation-run; remove in a dedicated cleanup.

(IDs are stable so existing references don't break; `001` is intentionally retired.
Requested as "FE-BACKLOG-004" but that ID was already taken — filed as `-005`.)

## Bundle cleanup (actioned)

The canonical bundle shipped with dead artifacts carried over from the earlier
Inter + Tabler export. These were removed on branch
`chore/frontend-design-system-docs`:

- **40 Inter / Inter Display `@font-face` lines** removed from
  `design-system/colors_and_type.css` (`grep -c Inter` → 0); all Roboto Mono
  blocks kept; `--font-sans` still resolves to `'Roboto'`.
- **38 `Inter*` / `InterDisplay*` woff2 files** deleted from
  `design-system/fonts/`.
- Tabler webfont reduced to **woff2 only** (`tabler-icons.ttf` / `.woff`
  deleted, CSS `src` pruned). The Tabler webfont is retained per
  `frontend/CLAUDE.md` (prototype-only sanctioned alternate).
- `uploads/` deleted (duplicated `assets/brand/`); the README provenance
  pointer was repointed to `assets/brand/`.
- Bundle size: 11M → 2.5M.

**Known remaining defect (not actioned).** `colors_and_type.css` loads the
Roboto *proportional* family via a **Google Fonts CDN `@import`** (no Roboto
sans files are shipped). This contradicts `frontend/CLAUDE.md` ("never a runtime
CDN `@import`"), but that rule governs the **apps**; this bundle is prototype-only
and removing the `@import` would leave the HTML previews with no Roboto. Flagged
for a decision: self-host Roboto in the bundle, or accept it as prototype-scoped.

## Precedence

1. `frontend/CLAUDE.md` — governing rule.
2. This correction — authoritative reconciliation of the gap audit.
3. `2026-06-05-design-system-gap-audit.md` — historical; valid only for the
   carried-forward findings listed above. Left unedited by request.
