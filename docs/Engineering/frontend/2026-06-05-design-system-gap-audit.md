# Design System Gap Audit — Current Frontend vs `andikisha-design-system`

**Date:** 2026-06-05
**Target:** `andikisha-design-system/project/` (canonical) — **full adoption** decided: Inter + Inter Display + Roboto Mono typefaces, **Tabler** icons, and the complete token set.
**Mode:** Read-only. This report is the only artifact.
**Builds on:** `docs/Engineering/frontend/2026-06-05-frontend-current-state-audit.md` (cited, not repeated).

## Corrections to the brief (read first)

Three premises in the request were wrong and are corrected here; they change the audit materially:

1. **Bundle path.** The design system is at `andikisha-design-system/project/`, **not** `frontend/packages/ui/design-system/`. Used the real path.
2. **"Roboto + Lucide edition" is a mislabel.** The design system's own README is explicit: typeface is **Inter / Inter Display / Roboto Mono**, icons are **Tabler** (self-hosted webfont, `ti-*`). The repo runs Roboto + DM Mono + Lucide. Per the chosen scope (full adoption), **type and icons are the two largest gaps**, not settled-good items. Axis 3's "Lucide is confirmed" is therefore void.
3. **The referenced consolidation plan does not exist.** `2026-06-05-token-consolidation-plan.md` was never written (only offered). Its scope is stated inline in the brief, so §Scope Reconciliation reconciles against that *stated* scope and flags the file as unwritten.

Classification: **match** / **value-differs** / **missing-in-repo** / **orphan-in-repo**. Severity: must-fix / should-fix / cosmetic / accepted-divergence.

---

## 1. Headline — the five largest gaps

1. **Icons: Lucide → Tabler is a full language swap across 71 files.** No Tabler webfont is installed; every icon import and call site changes. Stroke (2px→1.5px), delivery (React components → self-hosted webfont), and the icon-chip pattern are all absent. **blocker.**
2. **Type: Roboto → Inter + Inter Display + Roboto Mono.** All three apps + `tailwind-preset.ts` load Roboto via `next/font/google`; the design system self-hosts Inter (variable), Inter Display (headlines), Roboto Mono (figures). DM Mono must go. **must-fix.**
3. **Colour token model is structurally incompatible.** Repo `brand-50…950` (7 stops, offset hexes) vs DS `green-25…900` (11 stops); a **single** `amber` vs a full `amber-25…900` ramp; cool Tailwind neutrals vs DS warm true-grays; and **zero semantic role tokens** (`--primary`, `--fg1–4`, `--bg1–3`, `--bg-ink`) exist today. This is a token rewrite, not a value tweak. **must-fix.**
4. **The component "DNA" of the system is missing.** No `Card` primitive, **no 4px green accent bar** anywhere on card headers, `StatCard` has no icon chip and no directional delta arrow, `Avatar`/`Badge` have no status dot, and focus rings are **amber outlines** instead of the **4px green halo** (`--shadow-focus`). **must-fix / should-fix.**
5. **No elevation / focus / motion token layer.** Repo uses Tailwind default shadows; the DS ships green-tinted low-spread `--shadow-xs…xl`, `--shadow-card`, `--shadow-focus`, plus motion tokens (`--ease-out`, `--dur*`). `prefers-reduced-motion` is honoured only in `landing`. **should-fix.**

Plus a structural prerequisite (from the prior audit): **`landing` is on Tailwind v3** with its own token config, and the two portals **duplicate** an identical `@theme` block — there is no single token source to migrate.

---

## 2. Axis 1 — Tokens (four-way diff)

Sources: `colors_and_type.css` (target) · tenant-portal `@theme` · platform-portal `@theme` (**verified identical token-name set to tenant-portal**) · `landing/tailwind.config.ts` + `packages/ui/tailwind-preset.ts`.

### Green / brand ramp — **incompatible** (only 2 of 11 values coincide)

| DS token | DS value | Repo equivalent | Repo value | Class |
|---|---|---|---|---|
| `--green-700` (primary) | `#0b3d2e` | `brand-900` | `#0b3d2e` | match (value) / **name offset** |
| `--green-900` (ink) | `#02110c` | `near-black` | `#02110c` | match (value) / name differs |
| `--green-800` | `#082e23` | `brand-800` | `#0f5040` | **value-differs** |
| `--green-600` | `#155742` | — | — | **missing-in-repo** |
| `--green-500` | `#2c6e57` | `brand-500` | `#27a870` | **value-differs** |
| `--green-400/300/200` | `#4a8a72/#6fa791/#9cc6b3` | — | — | **missing-in-repo** |
| `--green-100` | `#c4ddd2` | `brand-100` | `#d1f5e6` | **value-differs** |
| `--green-50` | `#e6f1ec` | `brand-50` | `#e8f5f0` | **value-differs** |
| `--green-25` | `#f3f8f5` | — | — | **missing-in-repo** |
| — | — | `brand-950` | `#071e13` | **orphan-in-repo** |

Net: the green ramp is effectively a **different ramp** with a one-step naming offset. Severity **must-fix**.

### Amber ramp — **single value vs full ramp**

| DS | DS value | Repo | Repo value | Class |
|---|---|---|---|---|
| `--amber-500` | `#e8a020` | `amber` (DEFAULT) | `#e8a020` | match |
| `--amber-600` | `#c9851a` | `amber-dark` | `#c98510` | **value-differs** |
| `--amber-50` | `#fbf1da` | `amber-light` | `#fef3dc` | **value-differs** |
| `--amber-25/100/200/300/400/700/800/900` | (ramp) | — | — | **missing-in-repo** |
| — | — | `amber-text` | `#92600a` | orphan (role) |

### Neutrals — **systematic value-differs** (warm true-gray vs cool slate)

Every stop differs: DS uses equal-channel warm grays (`neutral-900 #171717`, `-800 #262626`, `-500 #737373`, `-100 #f0f0f0`, `-50 #f5f5f5`, `-25 #fafafa`); repo uses Tailwind cool gray/slate (`neutral-900 #111111`, `-800 #1f2937`, `-500 #6b7280`, `-100 #f3f4f6`, `-50 #fafafa`). Repo also **lacks `neutral-25`** (its `neutral-50 #fafafa` ≈ DS `neutral-25`, another offset). **must-fix** (affects all body text/borders/canvas).

### Semantic colours — **missing-in-repo**

DS defines `success/warning/danger/info` each with a `-bg` pair (`#16a34a/#e8f6ee`, `#f59e0b/#fef4e2`, `#dc2626/#fbeaea`, `#1b84ff/#e8f2ff`). Repo has only `error #ef4444` + `border-success`/`surface-tint`; `Badge`/`StatCard` improvise with Tailwind `red-100/red-700` and `brand-100/brand-800`. `landing` has an **orphan** `info #60a5fa` (≠ DS `#1b84ff`). **must-fix.**

### Semantic role tokens — **entirely missing-in-repo**

`--primary/-hover/-pressed/-soft`, `--accent/-hover/-soft`, `--fg1–4`, `--fg-on-primary/-accent`, `--bg1–3`, `--bg-ink`, `--border/-strong/-ink` — **none exist**. Components hardcode `brand-900`, `neutral-700`, etc. directly. This is the single most useful layer to add and the largest behavioural gap in the token model. **must-fix.**

---

## 3. Axis 2 — Typography

| Item | DS target | Repo today | Class / severity |
|---|---|---|---|
| Body/UI font | Inter (self-hosted variable) | Roboto (`next/font/google`), all 3 apps | **value-differs / must-fix** |
| Display font | Inter Display (headlines) | none — headings use Roboto | **missing-in-repo / must-fix** |
| Mono font | Roboto Mono | DM Mono (landing, tenant-portal); `ui-monospace` (platform-portal) | **value-differs / must-fix** |
| Mono usage sites | code/IDs/figures | `MoneyAmount` (`tabular-nums font-mono`), `--font-dm-mono` | intent ✅, font wrong |
| Display scale | 24–72px (`--display-xs…2xl`) | none as tokens; `landing` has ad-hoc `h1/h2-display` clamps | **missing-in-repo / should-fix** |
| Text scale | 12–20px, **14px app base** | Tailwind defaults; portals use hardcoded `text-[12px]…[28px]` | **value-differs / should-fix** |
| Heading tracking/weight | `-0.02em`, semibold | `-0.02em` present in `globals.css` base ✅; weight ok | partial match |

Prior audit's "no CDN fonts, fonts fine" stands **only for the old Roboto stack** — under full adoption it's reframed: fonts are a primary migration.

---

## 4. Axis 3 — Icons

| Convention | DS target | Repo today | Class / severity |
|---|---|---|---|
| Library | **Tabler** (self-hosted webfont, `ti-*`) | **Lucide** — 71 importing files | **value-differs / blocker** |
| Stroke width | 1.5px | Lucide default 2px | value-differs |
| UI sizing | 16–20px; 24px in stat chips | mixed (Lucide `size`) | should-fix |
| Icon-chip pattern (coloured circle + white glyph) | required (stat tiles, etc.) | **absent** in `@andikisha/ui` | **missing-in-repo / must-fix** |
| Webfont asset | `assets/icons/tabler/` ships in DS | not installed in any app | **missing-in-repo** |

Note: the DS uses a webfont; the repo is React-component icons. A like-for-like swap likely means adopting `@tabler/icons-react` (not the webfont) to keep the component model — a decision to make in planning. Either way, 71 files change.

---

## 5. Axis 4 — Elevation, radii, focus, motion

| Item | DS target | Repo today | Class / severity |
|---|---|---|---|
| Shadows | green-tinted `rgba(2,17,12,…)` `xs…xl` + `--shadow-card` | Tailwind defaults (`shadow-sm/lg/xl/2xl`) | **value-differs / should-fix** |
| Focus ring | **4px green halo** `--shadow-focus rgba(11,61,46,.16)` | **amber** `outline-2 outline-amber` (Button, Input, ~9 sites) | **value-differs / must-fix** |
| Radius — inputs/buttons | 8px | `rounded-lg` = 8px ✅ | match |
| Radius — cards | 12px | `rounded-xl` = 12px ✅ (StatCard) | match |
| Radius — large/marketing | 16px | mixed | cosmetic |
| Radius — pills | 999 | `rounded-full` ✅ | match |
| Motion tokens | `--ease-out`, `--dur-fast/dur/slow` | none (ad-hoc `duration-200`, keyframes in configs) | **missing-in-repo / should-fix** |
| `prefers-reduced-motion` | required | `landing` only | **should-fix** |

Radii are the **one axis already largely compliant**.

---

## 6. Axis 5 — Component spec diff

| Primitive | Closest repo | Gaps vs DS spec | Severity |
|---|---|---|---|
| **Button** (`button.tsx`) | Button | variants `cta` should be **`accent`**; extra `outline`. Radius 8px ✅, weight 600 ✅. **Hover bug:** primary `bg-brand-900`→`hover:bg-brand-800`, but `brand-800 #0f5040` is **lighter** than `brand-900 #0b3d2e` → button lightens on hover, opposite of DS "darken 700→800". Focus = amber, not green halo. | must-fix |
| **Badge** | Badge | pill ✅, weight 600 ✅; text **11px** (DS 12px) + hardcoded `text-[#92600A]`; tones built on `red-100`/`brand-100` not DS semantic palette; **no status-dot** option (DS optional). | should-fix |
| **Avatar** | Avatar | photo→initials ✅ on green ✅; **no status dot / ring** (DS requires). | should-fix |
| **Stat tile** | StatCard | value 28px/700 ✅ but **missing `-0.02em`**; delta pill ✅ but **no directional arrow**; **no icon chip** (DS core element). | must-fix |
| **Card + header** | *(none)* | **No `Card` primitive exists**; cards are ad-hoc `div`s. **4px green accent bar absent** (only stray `border-l-4` in Toaster / a checklist / a quote block — not the header pattern). No DS card shadow. | must-fix |
| **Inputs** | Input | border + 8px ✅; focus = **amber outline**, not green halo; `transition-shadow` present but no halo token. | must-fix |
| **Table** | DataTable | (sampled) header/divider/hover styling not aligned to DS 12px-uppercase-600 header + `neutral-100` dividers — needs detailed pass at build time. | should-fix |

---

## 7. Axis 6 — Layout & content conventions

| Item | DS target | Repo today | Class / severity |
|---|---|---|---|
| Sidebar width | ~260px | `TenantAdminShell` **240px**, `SidebarShell` **280px** (inconsistent) | value-differs / should-fix |
| Top bar | sticky/fixed, condenses | shells fixed (ok, verify behaviour) | cosmetic |
| App canvas bg | `neutral-50` (`#f5f5f5`) | `surface-alt #f8f7f4` (close, different value) | cosmetic |
| Marketing container | ~1200px | dominant `max-w-[1320px]` | value-differs / cosmetic |
| Currency format | `KSh 84,200` (symbol) | `formatMoney` → `KES 250,000.00` (code, grouped ✅) | value-differs (symbol) / should-fix |
| Tabular figures in mono | required | `MoneyAmount` uses `tabular-nums font-mono` ✅ (font = DM Mono, wrong) | intent ✅ |
| Casing | sentence case | sentence case ✅ (prior audit) | match |

---

## 8. Scope Reconciliation (the decisive section)

**Stated** consolidation scope (from the brief; the plan file itself is **unwritten**): *single `@theme`, landing v3→v4, stray hex, `ink-900`, Roboto Mono, docs.*

### (a) Covered by the consolidation scope as stated
- Token **plumbing** unification: one `@theme` source, retire duplicated portal blocks + `landing` v3 config. *(Prerequisite for everything below — but covers mechanism, not values.)*
- `landing` Tailwind **v3 → v4**.
- **Stray hex** cleanup (auth pages, `leave/_types.ts`, contact, mockups).
- **`ink-900`** stale-token fix.
- **Roboto Mono** adoption (partial — see gap below: covers mono only, not Inter/Inter Display).
- **Docs** refresh.

### (b) Not covered — recommend ADDING to the consolidation (cost = rough eng-days)
- **Inter + Inter Display** self-hosting and wiring — the scope only mentions Roboto *Mono*. Without this, "full adoption" doesn't happen. *(~1–1.5d)*
- **Token value + structure rewrite**: green `25–900` 11-stop ramp, amber ramp, warm neutrals, semantic colours, **role tokens** (`--primary/fg/bg/border`). This is the heart of the system. *(~2–3d incl. component re-pointing)*
- **Focus-ring swap** amber → green halo `--shadow-focus` (≈11 sites) and **Button primary hover bug** fix. Small, high-visibility, low-risk — do it inside consolidation. *(~0.5d)*
- **Shadow + motion tokens** + `prefers-reduced-motion` in portals. *(~0.5–1d)*

### (c) Not covered — recommend DEFERRING to backlog
- **`FE-BACKLOG-001` — Lucide → Tabler icon migration** (71 files, webfont-vs-react-component decision). Largest single effort; isolate it. *(~3–5d)*
- **`FE-BACKLOG-002` — Card primitive + 4px green accent-bar header pattern** in `@andikisha/ui`, then adopt across surfaces. *(~2d)*
- **`FE-BACKLOG-003` — StatCard icon chip + directional delta arrow; Badge/Avatar status dots.** *(~1.5d)*
- **`FE-BACKLOG-004` — Type-scale + display-scale tokens** (replace hardcoded `text-[Npx]`), table header/divider alignment, sidebar-width standardisation (260px), currency symbol `KES`→`KSh`. *(~2d)*

---

## Recommendation

**Expand the consolidation before running it.** As scoped it only achieves token *plumbing* + Roboto *Mono* — under the full-adoption decision that leaves the system's defining traits (Inter typeface, the colour/role-token rewrite, green focus halo, the Button hover bug) unaddressed, and would ship a "migration" that still looks like the old app. Fold the four **(b)** items into the consolidation (they share the same files and a single rebuild), and split the four **(c)** items — led by `FE-BACKLOG-001` (Tabler) — into their own gated efforts so the icon swap doesn't block the token foundation.

Sequence: **(1)** plumbing + Inter + token/role rewrite + focus/hover fixes [expanded consolidation] → **(2)** `FE-BACKLOG-002/003/004` component DNA → **(3)** `FE-BACKLOG-001` Tabler.

Stopping here — no remediation begun.
