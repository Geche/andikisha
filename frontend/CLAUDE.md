# Andikisha — Frontend

Governs all work in `frontend/landing`, `frontend/tenant-portal`,
`frontend/platform-portal`, and `frontend/packages/ui`.

---

## Design system

Reference material lives at `frontend/packages/ui/design-system/`.
Read its `README.md` before designing any new screen. The UI kits in
`design-system/ui_kits/` show every pattern assembled into real surfaces
(dashboard, employees, leave, payroll, login, landing page). Match the visual
output; never copy the prototype's internal structure — it is Babel-compiled
React, not the production stack.

The **production token source** is the shared `@theme` file in
`frontend/packages/ui` (single source of truth, Tailwind v4). Apps import it;
they do not define their own color tokens. Token values derive from
`design-system/colors_and_type.css`.

---

## Brand

| Token | Value | Use |
|---|---|---|
| `green-700` | `#0b3d2e` | Primary — buttons, active nav, key headings, icon chips |
| `green-900` | `#02110c` | Brand ink — primary text, dark surfaces, footers |
| `amber-500` | `#e8a020` | Accent — money highlights, one CTA per view, trend pills |
| `white` | `#ffffff` | Card surfaces |
| `neutral-50` | `#f5f5f5` | App canvas background |

Amber is rationed: one accent action per view. Full green/amber 25–900 ramps,
warm neutrals, and semantic tokens (`success`, `warning`, `danger`, `info` +
`-bg` pairs) are defined in the shared theme. No blue, no purple, no gradients.

---

## Typography

**Roboto** — all UI, marketing, headings and body. Loaded via
`next/font/google` (build-time self-hosted; never a runtime CDN `<link>` or
`@import`). Headlines are semibold/bold with `-0.02em` tracking. App base size
is 14px; marketing body is 16px and scales into the display sizes
(24–72px) for headlines.

**Roboto Mono** — code, numeric IDs, and currency figures in tables. Loaded
via `next/font/google`. Do not use DM Mono or `ui-monospace`; those are stale.

There is no separate display typeface. Display styles are Roboto at heavier
weight, larger size, tighter tracking.

---

## Icons

**Lucide is the default** (`lucide-react`), rendered as inline SVG at the
default 2px stroke. Default size 16–20px in UI, up to 24px inside stat-tile
icon chips. Icon chips are a circular green or amber container with a white
glyph.

**Tabler is the sanctioned alternate**, permitted only where Lucide has no
adequate glyph — primarily brand/social marks (`IconBrandX`,
`IconBrandLinkedin`, …) since Lucide ships no brand logos. In production use
`@tabler/icons-react` only; the Tabler webfont in the design system bundle is
for HTML prototypes and must never be loaded in an app. Never mix the two
sets within a single screen. Do not substitute generic glyphs (send, at-sign)
for brand marks in production.

No emoji as icons. No icon library beyond these two.

---

## Component patterns

Primitives live in `@andikisha/ui` (`packages/ui/src/components/`): `button`,
`Badge`, `Avatar`, `StatCard`, `PageHeader`, shells (`TenantAdminShell`,
`SuperAdminShell`, `EmployeeShell`), form primitives, charts,
`PermissionGate`. Extend these; do not create parallel primitives. Do not add
new components without a current caller.

**Cards** — white surface, 1px `border` (neutral-200), 12px radius,
soft low-spread shadow, 16–18px padding. Named card/section headers carry a
**4px forest-green accent bar** left of the title — a brand signature. Apply
it via the existing header components as screens are touched.

**Buttons** — variants: primary (green-700 fill, white text), accent
(amber-500 fill, green-900 text), secondary (white + border), ghost, danger.
Radius 8px, weight 600. Hover darkens one ramp step (700→800, amber 500→600).

**Badges** — pill shape, 12px, weight 600, tones green / amber / success /
warning / danger / neutral, optional leading status dot.

**StatCard** — icon chip + label + large value (28px, weight 700, `-0.02em`)
+ subtitle, optional delta pill with directional arrow (up = success,
  down = danger).

**Inputs** — 1px border, 8px radius, focus ring = 4px translucent green halo.

**Tables** — header row: neutral background, 12px uppercase weight-600
secondary text. Row dividers neutral-100. Hover fill neutral-100.

---

## Layout, spacing, motion

App shells — two intentional patterns. **Never convert one to the other.**
- **tenant-portal:** vertical sidenav (fixed left sidebar, target 260px) +
  sticky top bar + scrolling card canvas on `neutral-50`.
- **platform-portal:** horizontal top nav + scrolling card canvas on
  `neutral-50`. The design system README describes only the sidebar layout;
  the horizontal nav is an **accepted divergence** for the platform portal.

Card gutters 16–24px. Marketing: centered ~1200px container, 80–96px section
padding, sticky condensing nav.

Spacing is the 4px-base Tailwind scale. **No arbitrary values** — no
`p-[18px]`, `rounded-[10px]`, `shadow-[...]`, `text-[15px]`. No `gray-*`
classes; use the neutral ramp.

Motion: 120–200ms, ease-out. Fades and small translate-ups. No springs, no
infinite loops. Respect `prefers-reduced-motion`.

---

## Copy

Sentence case everywhere — buttons, nav, headings, table headers. Acronyms
stay uppercase (HRIS, PAYE, KRA). Address the user as "you"; imperative for
actions ("Run payroll", "Approve leave"). Labels 1–3 words. No emoji
anywhere. Currency with symbol and grouping (`KSh 84,200`), rendered in
Roboto Mono in tabular contexts. Errors say what happened and what to do.

---

## What not to do

- No hardcoded hex/rgb in components — every color is a theme token.
  (Exception: deliberately illustrative mockup chrome, marked with a comment.)
- No per-app token definitions. The shared `@theme` in `packages/ui` is the
  only token source.
- No runtime font CDNs. Fonts load through `next/font` only.
- No icon library other than `lucide-react` (default) and
  `@tabler/icons-react` (alternate, coverage gaps only). No icon webfonts in
  apps. Never both sets in one screen.
- No Tailwind arbitrary values, no `gray-*`.
- No Title Case in UI copy. No emoji.
- No speculative components or props without a current caller.
- Inter, Inter Display, Bricolage Grotesque, DM Mono: stale — flag and
  remove on sight.

---

## Current state vs target (status as of 2026-06-08)

The token-consolidation migration
(`docs/Engineering/frontend/2026-06-05-token-consolidation-plan.md`, Steps 1–5)
has landed: the shared `@theme` in `packages/ui` is the single source of truth,
all three apps consume it (`landing` is now Tailwind v4), the `green/amber
25–900` ramps, warm neutrals, and semantic/role tokens are in place, Roboto Mono
is wired via `next/font` (`font-mono`), and the green focus halo + Button
primary-hover direction are implemented.

The remaining gaps are **component-DNA and token-hygiene**, tracked in
`docs/Engineering/frontend/2026-06-05-gap-audit-correction.md` (authoritative —
that doc holds the single reconciled backlog; `-001` is retired):

- **4px green accent bar** on named card/section headers, and a **`Card`
  primitive** (cards are still ad-hoc utility combinations) (FE-BACKLOG-002).
- **StatCard icon chip / delta arrow**, **Badge/Avatar status dots**, and
  **Badge semantic-tone adoption** (e.g. leave REJECTED badge `red-*` →
  `danger`/`danger-bg`) (FE-BACKLOG-003).
- **Type-scale tokens** (replace hardcoded `text-[Npx]`), table header/divider
  alignment, sidebar-width 260px, `KES`→`KSh` (FE-BACKLOG-004).
- **Shared-primitive adoption** in tenant + login surfaces — must land before/
  with FE-BACKLOG-002/-003 (FE-BACKLOG-005).

Legacy colour aliases (`brand-*`, `ink-*`, `amber-*`, `surface-alt/-tint`,
`near-black`, `error`, …) remain in the shared `@theme`, pinned to their current
values; retire each only once `grep` shows zero usage. When a bullet here
becomes true, delete it from this section.