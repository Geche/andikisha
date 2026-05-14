# Neutral Scale Proposal — @andikisha/ui

**Status:** CHECKPOINT — awaiting approval before migration  
**Date:** 2026-05-13  
**Scope:** `frontend/packages/ui/src/` and `frontend/tenant-portal/src/`

---

## The Problem

The codebase has two competing grey palettes in production code. Older components (SidebarShell, NavRail, PageHeader) use **Tailwind Gray**, while the newly written HorizontalShell uses **Tailwind Neutral**. These are similar but not identical, causing visual inconsistency at 1:1 comparison:

| Purpose | Gray palette value | Neutral palette value | Delta |
|---|---|---|---|
| Muted text | `#6b7280` (gray-500) | `#737373` (neutral-500) | +10 brightness |
| Secondary text | `#4b5563` (gray-600) | `#525252` (neutral-600) | +7 brightness |
| Light divider | `#d1d5db` (gray-300) | `#d4d4d4` (neutral-300) | small |
| Near-white bg | `#f3f4f6` (gray-100) | `#f5f5f5` (neutral-100) | small |

Additionally, `#101828` (17 uses in older components) is a dark-slate value that has no clear token home and sits between `#111111` and `#0f172a`.

---

## Proposed Neutral Token Set

Add to `tailwind-preset.ts` under `colors.neutral`:

| Token | Hex | Replaces | Uses |
|---|---|---|---|
| `neutral-900` | `#111111` | `#111111`, `#101828` | 12 + 17 = **29** |
| `neutral-800` | `#1f2937` | `#1f2937` | 2 |
| `neutral-700` | `#374151` | `#374151` | **24** |
| `neutral-600` | `#4b5563` | `#4b5563`, `#525252` | 2 + 3 = **5** |
| `neutral-500` | `#6b7280` | `#6b7280`, `#737373` | 26 + 3 = **29** |
| `neutral-400` | `#9ca3af` | `#9ca3af`, `#98a2b3` | 31 + 1 = **32** |
| `neutral-300` | `#d1d5db` | `#d1d5db`, `#d0d5dd`, `#d4d4d4` | 5 + 5 + 2 = **12** |
| `neutral-200` | `#e5e7eb` | `#e5e7eb` | **37** |
| `neutral-100` | `#f3f4f6` | `#f3f4f6`, `#f5f5f5` | 26 + 3 = **29** |
| `neutral-50`  | `#fafafa`  | `#fafafa`, `#f9fafb` | 3 + 1 = **4** |

**Total raw hex values replaced: ~211 occurrences across 10 token slots.**

---

## Decisions Needed Before Migration

### 1. `#101828` → `neutral-900` or `near-black`?

`#101828` (17 uses, all in older Figma-exported components — PayslipRow, ProfileCard) is a very dark blue-grey used for headings. Two options:
- **A. Map to `neutral-900` (#111111)** — simpler, slight warmth shift, visually imperceptible.
- **B. Add `neutral-950: #101828`** — preserves exact value, adds one extra token.

Recommendation: **A**. The difference at 1:1 is <1% perceptible luminance change and not worth a dedicated token.

### 2. `neutral-600`: #4b5563 vs #525252

These two grey-600 variants differ by 7 brightness points. Currently `#525252` only appears in HorizontalShell (3 uses, just written). Two options:
- **A. Standardise on #4b5563 (gray-600)** — matches the more prevalent existing components.
- **B. Standardise on #525252 (neutral-600)** — matches what HorizontalShell was designed with.

Recommendation: **A**. #4b5563 has larger component coverage and is the Tailwind Gray-600 value which aligns with the gray-400 (`#9ca3af`) already dominant in the codebase. HorizontalShell would be updated in the migration.

### 3. Amber/impersonation colours (#92600a, #f5c842, #fef9ec)

These appear together only in impersonation banners. Not proposed as neutral tokens — should stay inline or become dedicated `amber-*` variants.

---

## What Changes at Migration (Step 2.7c)

1. Add `neutral` scale to `tailwind-preset.ts`
2. Add `neutral-*` CSS custom properties to both `tenant-portal/src/app/globals.css` and `landing/app/globals.css`
3. Find-and-replace raw hex → `neutral-*` Tailwind class in all components
4. Run type-check + tests + visual spot-check on `/admin/dashboard` and `/my/dashboard`

---

## What Does NOT Change

- Brand colors (`brand-*`, `amber-*`, `surface-*`, `near-black`, `whatsapp`, `error`) — unchanged
- Info blue (`#60a5fa`) — 1 use, not worth a token yet
- One-off palette colors in DataTable row highlights (tagged by role in RoleBadge) — these are intentional distinct hues, not neutrals

---

## CHECKPOINT

Awaiting approval on:
1. `#101828` → Option A or B?
2. `neutral-600` base → #4b5563 or #525252?

After approval, proceed to Step 2.7c (migration).
