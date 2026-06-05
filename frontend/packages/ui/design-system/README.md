# Andikisha — Design System

Andikisha is a **people & payroll platform** for growing teams — an HRIS that
handles the full employee lifecycle: hiring and onboarding, attendance and
leave, payroll and expenses, performance, and a lightweight CRM for the people
side of the business. The brand is calm, grounded and trustworthy: **deep forest
green** carries the system, with a single **amber** accent for energy and
moments that matter (money, action, highlights).

This repository is the canonical source of truth for how Andikisha looks, reads
and behaves — foundations (color, type, spacing), brand assets, and high-fidelity
UI-kit recreations of the product surfaces.

---

## Sources this system was built from

The design system was synthesized from the following inputs (you may or may not
have access to them — they are recorded here for provenance):

- **Brand identity** — Andikisha logo suite (`assets/brand/*.svg`): full
  wordmark + logomark, in green/amber, all-black, and reversed-white variants.
  These define the two brand colors (`#0b3d2e` forest green, `#e8a020` amber,
  `#02110c` near-black ink) and the lowercase geometric wordmark.
- **Application UI** — `smarthr-html/`, a Bootstrap 5 HRM/CRM admin codebase
  ("SmartHR" by Dreams Technologies). Andikisha's **app** surfaces (dashboard,
  employees, attendance, leave, payroll) are recreated from this code and
  **rebranded** from its stock orange to Andikisha forest-green + amber.
  Iconography (Lucide), card patterns, stat tiles, table and sidebar
  structures are drawn faithfully from it.
- **Foundations & marketing** — a Figma library ("Untitled UI Design System
  v8.0", mounted read-only) used as reference for the type scale, neutral ramp,
  elevation model, and marketing-website section patterns (hero, features,
  pricing, footer).

> Andikisha's product is an HRIS; the SmartHR template is its application
> scaffold and the Untitled UI library is its component/marketing reference.
> Neither stock brand survives — everything is restyled to Andikisha.

---

## Brand at a glance

| | |
|---|---|
| **Primary** | Forest green `#0b3d2e` (`--green-700`) |
| **Ink** | Near-black green `#02110c` (`--green-900`) |
| **Accent** | Amber `#e8a020` (`--amber-500`) |
| **Typeface** | Roboto (UI + marketing), Roboto Mono (code/figures) |
| **Icons** | Lucide (default, inline SVG) · Tabler (alternate, webfont) |
| **Mark** | Lowercase "a" — green stroke + amber wedge |

---

## CONTENT FUNDAMENTALS

How Andikisha writes. The voice is **plain, warm and confident** — a competent
colleague, not a corporation and not a hype-machine. It respects the reader's
time and never inflates.

**Person & address.** Speak to the user as **"you"**; refer to the product as
**"Andikisha"** or **"we"** sparingly. Imperative voice for actions ("Run
payroll", "Add employee", "Approve leave"). Avoid "the user", "users", "one".

**Tone.** Reassuring and direct. We talk about *people* and *outcomes*, not
"resources" or "headcount-optimization". Money and time are treated with care
because they matter to real people. No fear-selling, no breathless adjectives.

**Casing.** **Sentence case everywhere** — buttons, menu items, headings, table
headers, card titles. Not Title Case. ("New employee", not "New Employee".)
Acronyms stay upper (HRIS, PTO, KRA, API).

**Length & rhythm.** Short. UI labels are 1–3 words. Helper text is one short
sentence. Marketing headlines are a clear claim ("People, paid on time"), not a
slogan salad. Prefer verbs over nouns; cut qualifiers ("simply", "just",
"easily").

**Numbers & data.** Real, specific, plausible. Currency with symbol and grouping
(`$2.4M`, `KSh 84,200`). Percentages with a sign and direction (`+18%`, `−16%`).
Dates as `12 Jun 2026` or relative ("2 days ago"). Never invent precision we
wouldn't have.

**Emoji.** **Not used** in product or marketing UI. The brand expresses warmth
through color, copy and photography — not emoji.

**Examples (do):**
- Button: `Run payroll` · `Add employee` · `Approve` · `Export CSV`
- Empty state: `No leave requests yet. They'll show up here when your team asks for time off.`
- Stat label: `Late arrivals today` → `12` → `Delayed logins today`
- Marketing: `People, paid on time.` / `Onboard, pay and support your whole team from one place.`

**Examples (avoid):**
- ~~`Click Here To Get Started Today! 🚀`~~ (Title Case, emoji, hype)
- ~~`Leverage our best-in-class HR solution`~~ (jargon, empty superlatives)
- ~~`Oops! Something went wrong 😬`~~ (cutesy; say what happened and what to do)

---

## VISUAL FOUNDATIONS

**Color & vibe.** Forest green is the system color — used for primary actions,
active nav, key headings and dark sections. Amber is the *single* accent, rationed
for emphasis: payroll/money, a highlighted metric, one CTA per view. Backgrounds
are clean and bright (`#ffffff` cards on a `#f5f5f5`/`#fafafa` canvas); dark
sections use the near-black green ink. Warm-leaning neutral grays carry body text
and borders. The overall feeling is **organic, premium, steady** — closer to a
modern fintech than a legacy HR tool. No purple, no blue-gradient SaaS clichés.

**Type.** Roboto throughout. Headlines are semibold/bold with tight tracking
(`-0.02em`); body is regular at comfortable line-height (1.5). The app runs on a
14px base (dense, data-rich); marketing scales up into the display sizes. Roboto
Mono is reserved for code, IDs, and tabular figures.

**Spacing & layout.** 4px base unit. App layout is a fixed left sidebar (≈260px)
+ sticky top bar + scrolling content canvas of cards. Generous gutters (16–24px)
between cards; consistent 16–20px card padding. Marketing uses a centered max-width
container (~1200px) with large vertical rhythm (80–96px section padding).

**Backgrounds.** Mostly flat color. Marketing may use soft, **subtle** radial
tints in green/amber at very low opacity behind hero sections — never loud
gradients. Photography (team/office) is used in marketing and onboarding;
imagery skews **warm, natural-light, human** (real people, real desks), not
stock-cold or duotone. No hand-drawn illustrations as a core motif; geometric
brand shapes (the wedge) can appear as a quiet decorative element.

**Corner radii.** Friendly but not bubbly. Inputs/buttons `8px`; cards `12px`;
large surfaces/marketing cards `16px`; pills/avatars fully round. The app's data
tables and small controls sit at `6–8px`.

**Cards.** White surface, `1px` `--border` (neutral-200) hairline, `12px` radius,
**soft low-spread shadow** (`--shadow-xs/sm`). Section/card headers often carry a
short **forest-green accent bar** on the left (4px) — a signature lifted from the
app. No heavy drop shadows, no colored left-border-only cards.

**Borders & dividers.** Hairline `1px` neutral-200 for structure; neutral-100 for
internal row dividers. Focus rings are a 4px translucent green halo
(`--shadow-focus`).

**Shadows.** Two systems: (1) **elevation** — soft neutral shadows for cards,
menus, popovers, modals (`xs → xl`); (2) **focus** — green halo for keyboard/active
state. Shadows are subtle and never used to fake depth dramatically.

**Hover / press.**
- *Primary button:* hover darkens green (`700→800`), press darkens further (`900`).
- *Accent button:* hover darkens amber (`500→600`).
- *Secondary/ghost:* hover fills with a faint green/neutral tint (`--green-50` / `--bg2`).
- *Rows & list items:* hover fills `--bg3`.
- *Press:* a subtle darken; no big scale-bounce. App controls don't shrink.

**Motion.** Quiet and quick. Transitions 120–200ms on an ease-out curve
(`--ease-out`). Fades and small (4–8px) translate-ups for entrances; no bouncy
springs, no infinite decorative loops. Respect `prefers-reduced-motion`.

**Transparency & blur.** Used sparingly — sticky headers may use a slight
backdrop blur over scrolled content; overlays use a `rgba(2,17,12,.4)` scrim.
Not a core decorative device.

**Fixed elements.** App: sidebar and top bar are fixed; content scrolls.
Marketing: top nav is sticky and condenses on scroll.

---

## ICONOGRAPHY

Andikisha uses **[Lucide](https://lucide.dev)** — a clean, 2px-stroke,
rounded-join, 24px outline set. The icons are geometric and neutral, which lets
the brand color do the talking.

- **Delivery:** Lucide is an **SVG** icon set. The UI kits load the Lucide UMD
  script and a small shared `LucideIcon` component (`ui_kits/lucide-icon.jsx`)
  builds an inline `<svg>` per icon — so icons render offline, scale crisply, and
  embed cleanly in screenshots/exports (no webfont required). Static cards use
  `<i data-lucide="{name}"></i>` + `lucide.createIcons()`.
- **Naming:** the kit accepts the design-system's friendly names (e.g.
  `users-group`, `report-money`, `clock-x`) and maps them to Lucide
  (`users`, `banknote`, `clock-alert`) inside `lucide-icon.jsx` — see `ICON_MAP`.
- **Sizing:** match the adjacent text; default 16–20px in UI, up to 24px in
  stat-tile icon chips. Icon chips are a colored circle (green or amber) with a
  white glyph. The global `.lucide { width:1em; height:1em }` rule sizes any
  inline icon to its font-size; color is inherited via `stroke: currentColor`.
- **No emoji. No multicolor icons.** Status is shown with a small colored dot +
  label, not an emoji. Unicode arrows (↑ ↓) appear only inside trend pills, paired
  with Lucide arrow glyphs.
- **Brand/social glyphs:** Lucide ships **no brand logos**. The footer socials
  use generic Lucide comms glyphs (`send`, `at-sign`, `rss`) as a substitute — if
  you need true brand marks (X, LinkedIn, GitHub), drop in their official SVGs.

**Tabler — alternate set.** [Tabler Icons](https://tabler.io/icons) (5,900+
glyphs, the application template's native set) is also bundled, **self-hosted**
at `assets/icons/tabler/` (CSS + woff2/woff/ttf). Use it when you need a glyph
Lucide lacks, or when matching the source app exactly: link
`assets/icons/tabler/tabler-icons.min.css` and write `<i class="ti ti-{name}"></i>`
(e.g. `ti-users-group`, `ti-report-money`). In the React kits a `<TablerIcon
name="…" />` helper (in `ui_kits/lucide-icon.jsx`) is available too. Both kit
`index.html` files already load the Tabler stylesheet. Lucide stays the default;
don't mix the two sets within a single screen. (Tabler is a webfont — it renders
live but won't appear in flat thumbnail captures.)

---

## VISUAL ASSETS

- `assets/brand/` — Andikisha logos: `andikisha-full.svg` (green/amber),
  `-full-black.svg`, `-full-white.svg`, `-type-white.svg`, `andikisha-mark.svg`,
  `andikisha-mark-white.svg`.
- `assets/avatars/` — 8 photographic team avatars (for UI mockups).
- `assets/icons/tabler/` — self-hosted Tabler Icons webfont (alternate set).
- `ui_kits/lucide-icon.jsx` — shared Lucide icon component + name map.

---

## INDEX — what's in this system

| Path | What it is |
|---|---|
| `README.md` | This file — brand, content & visual foundations |
| `SKILL.md` | Agent-Skill manifest (for use in Claude Code) |
| `colors_and_type.css` | All design tokens: color scales, semantic vars, type scale, spacing, radii, shadows, motion |
| `styles.css` | Root entry — `@import`s `colors_and_type.css` |
| `preview/` | Design-System-tab cards (swatches, specimens, components) |
| `assets/` | Brand logos, avatars, icon webfont |
| `ui_kits/app/` | **Andikisha app** UI kit — HRIS dashboard recreation |
| `ui_kits/marketing/` | **Andikisha marketing** UI kit — landing page recreation |

Start with `colors_and_type.css` for tokens, then open the `ui_kits/*/index.html`
files to see the system assembled into real product surfaces.
