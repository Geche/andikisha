# Frontend Design Audit — Current State

**Date:** 2026-06-05
**Scope:** `frontend/landing`, `frontend/tenant-portal`, `frontend/platform-portal`, `frontend/packages/ui`
**Mode:** Read-only inventory of the *actual* current state.

## Why this audit differs from the original brief

The migration prompt this audit was requested under assumed a delivered design
system at `frontend/packages/ui/design-system/` (Inter Display typeface, Tabler
icons, a `colors_and_type.css` token file, apps on ports 3002/3000/3001). **None
of those artifacts exist in this repo**, and two of the targets (Inter Display,
Tabler) directly contradict the standard documented in the root `CLAUDE.md`
(Roboto, Lucide). The user elected to audit the current state only, with no
migration target assumed.

This report therefore measures the three apps against the **repo's own
documented standard** (root `CLAUDE.md` "Frontend Conventions" + `@andikisha/ui`
token rules), not against the absent external design system.

### Verified-absent premises (for the record)

| Claimed artifact | Status |
|---|---|
| `frontend/packages/ui/design-system/` | Does not exist |
| `colors_and_type.css` (anywhere in repo) | Does not exist |
| `frontend/CLAUDE.md` | Does not exist (only root `CLAUDE.md`) |
| Inter Display typeface | Not present; current font is Roboto |
| Bricolage Grotesque references | **Zero** — nothing to remove, already clean |
| Tabler icons | Not used; Lucide is the documented + actual standard |

Severity legend: **blocker** (breaks build/standard) · **must-fix** (violates a
documented rule) · **cosmetic** (polish, no rule broken).

---

## Headline findings

The frontend is in **good shape** against its own conventions. The biggest real
issue is not font/icon drift — it's a **build-system divergence**: `landing`
runs Tailwind **v3** with tokens defined in `tailwind.config.ts`, while
`tenant-portal` and `platform-portal` run Tailwind **v4** with tokens defined
inline in `globals.css @theme`. The brand tokens are consequently **duplicated
in two incompatible formats**, with no shared source of truth.

| Area | Result |
|---|---|
| Bricolage Grotesque | 0 references (all apps) ✅ |
| Google Fonts / CDN `@import` / `<link>` font tags | 0 (Roboto loaded via `next/font/google`, build-time self-hosted) ✅ |
| Non-Lucide icon libraries | 0 (no Tabler, FontAwesome, react-icons, feather, heroicons) ✅ |
| `gray-*` usage (CLAUDE.md forbids) | 0 (all apps) ✅ |
| Arbitrary spacing `p-[]`/`m-[]`, `rounded-[]`, `shadow-[]` | 0 (all apps) ✅ |
| Token definition mechanism | **Divergent** — v3 config vs v4 `@theme` ⚠️ |
| Hardcoded hex outside `globals.css` | landing 16 (className) + ~32 raw; portals minimal ⚠️ |

---

## Per-app findings

### `frontend/landing` (Tailwind v3)

| # | Finding | Severity |
|---|---|---|
| L1 | **Tailwind v3** (`@tailwind base/components/utilities`, `tailwind.config.ts`, `@apply` component layer). Diverges from the v4 setup in both portals. | must-fix |
| L2 | Brand/amber/neutral/surface tokens are **redefined** in `tailwind.config.ts theme.extend.colors`, independent of the portals' `@theme` block. No shared token source. | must-fix |
| L3 | 16 hardcoded hex values in `className` strings — concentrated in illustrative device-frame mockups (`components/hero/HeroBrowserMockup.tsx`, `HeroPayslipCard.tsx`, `walkthrough/PhoneMockup.tsx`) and `app/contact/page.tsx`. | must-fix (contact page); cosmetic (mockups, if intentional chrome) |
| L4 | `~32` raw hex literals total across `app/` + `components/`. | must-fix |
| L5 | `.btn-primary` references `text-ink-900` — **`ink-900` is not a documented token** (the standard is `near-black`). Likely stale/undefined; verify it resolves. | must-fix (verify) |
| L6 | Arbitrary `text-[15px]` and `border-[1.5px]` in `@apply` button classes — minor non-tokenized values. | cosmetic |
| L7 | Fonts: Roboto + DM Mono via `next/font/google`. No CDN, no Bricolage. | clean ✅ |
| L8 | Icons: Lucide only (21 files). | clean ✅ |
| L9 | Copy casing sampled (buttons/headings): sentence case. | clean ✅ |
| L10 | Consumes `@andikisha/ui` (`workspace:*`) but, being on Tailwind v3 with its own config, does not share the portals' v4 token pipeline. | must-fix |

### `frontend/tenant-portal` (Tailwind v4)

| # | Finding | Severity |
|---|---|---|
| T1 | Tailwind v4: `@import "tailwindcss"` + `@theme` token block + `@source "../../../packages/ui/src/**"`. Tokens defined inline in `globals.css`. | reference setup ✅ |
| T2 | 43 raw hex literals total — **30 are the `@theme` token definitions themselves** (correct; that's where tokens live). Remaining ~13 are in `login/page.tsx`, `[workspace]/login/page.tsx`, `[workspace]/set-password/page.tsx`, `[workspace]/(admin)/admin/leave/_types.ts`. | must-fix (the ~13) |
| T3 | 4 hardcoded hex in `className` — all in `admin/leave/_types.ts` (likely status-color map). Should map to tokens. | must-fix |
| T4 | Fonts: Roboto (+ DM Mono var) via `next/font/google`. No CDN, no Bricolage. | clean ✅ |
| T5 | Icons: Lucide only (26 files). | clean ✅ |
| T6 | No `gray-*`; no arbitrary spacing/radii/shadow. | clean ✅ |
| T7 | Copy casing: button labels sentence case ("Edit employee", "Export report", "View details"). | clean ✅ |
| T8 | Consumes `@andikisha/ui`, `@andikisha/api-client`, `@andikisha/shared-types`. | clean ✅ |

### `frontend/platform-portal` (Tailwind v4)

| # | Finding | Severity |
|---|---|---|
| P1 | Tailwind v4 setup mirroring tenant-portal (`@import` + `@theme`). | reference setup ✅ |
| P2 | 33 raw hex literals — **30 are the `@theme` token block**; remaining ~3 in `login/page.tsx`. | must-fix (the ~3) |
| P3 | 0 hardcoded hex in `className`. | clean ✅ |
| P4 | Fonts: Roboto via `next/font/google` (mono uses `ui-monospace`, no DM Mono). Minor inconsistency with the other two apps' mono token. | cosmetic |
| P5 | Icons: Lucide only (14 files). | clean ✅ |
| P6 | No `gray-*`; no arbitrary spacing/radii/shadow. | clean ✅ |
| P7 | Consumes `@andikisha/ui` only. | clean ✅ |

---

## Section-by-section (per the original audit spec)

### 1. Fonts
Every app uses **Roboto** via `next/font/google` (build-time self-hosted, not a
runtime CDN). Landing and tenant-portal also load **DM Mono**; platform-portal
uses `ui-monospace`. **Zero Bricolage Grotesque. Zero Google Fonts `@import` or
`<link>` CDN tags.** Nothing to remediate on fonts.

### 2. Colors
- Hardcoded hex in `className`: landing **16**, tenant-portal **4**, platform-portal **0**.
- Raw hex literals total: landing **~32**, tenant-portal **43**, platform-portal **33** — but in the two portals **~30 each are the legitimate `@theme` token definitions** in `globals.css`. Real violations: landing ~32, tenant ~13, platform ~3.
- Worst offenders: landing mockup components + `contact/page.tsx`; tenant `admin/leave/_types.ts` + auth pages; platform `login/page.tsx`.

### 3. Existing tokens (the real conflict)
The conflict is **internal**, not against an external file:
- `landing/tailwind.config.ts` → `theme.extend.colors` (Tailwind v3 JS config).
- `tenant-portal` + `platform-portal` → `globals.css @theme` (Tailwind v4 CSS).
- `packages/ui/tailwind-preset.ts` → a **third** definition (preset) that the v4 portals do not consume via `@theme` and landing does not reference as a preset.

Three token sources, no single source of truth. Drift risk is real (e.g. landing's possibly-stale `ink-900`).

### 4. Icons
**Lucide React only**, every workspace. No Tabler, FontAwesome, react-icons,
react-feather, or heroicons anywhere. Matches root `CLAUDE.md`.

### 5. Spacing, radii, shadows
**Zero** arbitrary `p-[]`/`m-[]`, `rounded-[]`, `shadow-[]` across all three
apps. Values use the Tailwind scale. Only stray arbitraries are landing's
`text-[15px]` / `border-[1.5px]` in `@apply` button classes (cosmetic).

### 6. Copy casing
Sampled button labels are **sentence case** ("Edit employee", "Export report",
"View details", "View payslips"). No Title Case violations found in the sample.

### 7. Shared UI package state
`@andikisha/ui` has **49 components** (`packages/ui/src/components/`), including
`button.tsx`, `Badge.tsx`, `Avatar.tsx`, `StatCard.tsx`, `PageHeader.tsx`, plus
shells (`TenantAdminShell`, `SuperAdminShell`, `EmployeeShell`, `HorizontalShell`,
`SidebarShell`), charts, form primitives, and `PermissionGate`. There is **no
`Card`/`CardHead` primitive** and **no `Stat` (only `StatCard`)** — the closest
matches to the brief's named primitives. All three apps depend on the package.

### 8. Build setup
- **landing**: Tailwind **v3** — `postcss.config.mjs` + `tailwind.config.ts` + `@tailwind` directives + `@apply` component layer in `globals.css`.
- **tenant-portal / platform-portal**: Tailwind **v4** — `@import "tailwindcss"` + inline `@theme` + `@source` glob into `packages/ui/src`. No `tailwind.config.*`.
- CSS is a single global import per app (`app/globals.css`); no CSS modules, no styled-components.

---

## Prioritised remediation backlog (if/when acted on)

1. **(must-fix) Unify the token source.** Decide one mechanism. Given two of
   three apps are already Tailwind v4 with `@theme`, the lowest-risk path is to
   migrate `landing` to v4 and have all three pull tokens from one place
   (`packages/ui`), retiring the duplicate definitions in `landing/tailwind.config.ts`.
2. **(must-fix) Verify/replace `ink-900`** in landing's `.btn-primary` — confirm
   it resolves or swap to `near-black`.
3. **(must-fix) Tokenise the ~13 + ~3 + ~32 stray hex** in auth pages, leave
   `_types.ts`, contact page, and landing mockups (mockup chrome may be exempt
   if deliberately illustrative — confirm per file).
4. **(cosmetic) Align mono font** across apps (platform uses `ui-monospace`; the
   others use DM Mono).
5. **(cosmetic) Replace** landing's `text-[15px]` / `border-[1.5px]` with scale values.

**No blockers. No Bricolage, no CDN fonts, no non-Lucide icons, no `gray-*`, no
arbitrary spacing — the codebase is already compliant on every item the original
brief framed as the migration's main work.**
