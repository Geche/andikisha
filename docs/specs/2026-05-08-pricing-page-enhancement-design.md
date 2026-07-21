# /pricing Page Enhancement — Design Spec

**Date:** 2026-05-08
**Scope:** Enhance `/pricing` for SaaS conversion quality — structural cleanup, billing toggle, separated plan cards, feature grid with icons, extracted components, single-column FAQ.

---

## Design Tokens (match existing pages exactly)

All styles must match the existing landing design system:
- **Backgrounds:** `bg-white` (cards), `bg-surface-alt` (#f7f6f3, sections), `bg-brand-900` (featured card, dark sections), `bg-brand-950` (deepest dark)
- **Text:** `text-ink-900` (headings), `text-ink-700` (body), `text-ink-600` (secondary), `text-ink-400` (muted)
- **Accent:** `text-amber`, `bg-amber`, `hover:bg-amber-dark` — CTAs and highlights
- **Borders:** `border-ink-200`, `border-ink-100`
- **Cards:** `rounded-2xl`, `border border-ink-200`, `shadow-[0_8px_40px_rgba(11,61,46,0.06)]`
- **Headings:** `font-display font-bold`, `clamp(...)` font sizes, `letterSpacing: "-0.02em"`
- **Icons:** Lucide only — `Check` (brand-500/700), `X` (text-error), `ChevronDown`

---

## Page Structure (new)

```
app/pricing/page.tsx
  Hero (unchanged — chips, dark brand-900)
  <PricingTable />              ← rebuilt: billing toggle + separated cards + feature grid
  <PricingComparisonTable />    ← new extracted component
  <PricingTestimonials />       ← new extracted component
  <FaqList columns={1} />       ← existing, new optional prop
  <JoinCTA />                   ← unchanged
```

---

## Component 1: `PricingTable` (rebuilt)

**File:** `frontend/landing/components/pricing/PricingTable.tsx`

Full rebuild. This component handles everything from billing toggle to feature grid.

### Billing toggle

- Two-state toggle: `"monthly"` (default) | `"annual"`
- Rendered as a row: `Monthly · [toggle track] · Annual · "Save 15%" badge`
- Toggle track: `w-11 h-6 rounded-full bg-brand-900 relative cursor-pointer` with `transition-all`
- Toggle thumb: `w-5 h-5 bg-white rounded-full absolute top-0.5` — left `translate-x-0.5` when monthly, right `translate-x-[22px]` when annual
- "Save 15%" badge: `bg-amber-light text-amber-dark text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber`
- When `annual`, prices update: Starter KES 350 → **KES 298**, Growth KES 280 → **KES 238**, Scale KES 220 → **KES 187** (×0.85, rounded to nearest whole number)

### Plan data

```tsx
const PLANS = [
  {
    name: "Starter",
    monthlyPrice: 350,
    annualPrice: 298,
    unit: "per employee / month",
    headcount: "Up to 25 employees",
    cta: "Start free trial",
    href: "/early-access",        // ← fixed (was /pricing — self-referential)
    featured: false,
    highlights: [
      "Full payroll & statutory filings",
      "M-Pesa salary disbursement",
      "Employee self-service portal",
      "KRA one-click filing · SMS payslips",
    ],
  },
  {
    name: "Growth",
    monthlyPrice: 280,
    annualPrice: 238,
    unit: "per employee / month",
    headcount: "26 – 200 employees",
    cta: "Start free trial",
    href: "/early-access",        // ← was /pricing
    featured: true,
    badge: "Most popular",
    highlights: [
      "Everything in Starter, plus:",
      "WhatsApp payslip delivery",
      "Leave & absence management",
      "Basic analytics & reporting",
    ],
  },
  {
    name: "Scale",
    monthlyPrice: 220,
    annualPrice: 187,
    unit: "per employee / month",
    annualNote: "(annual billing)",
    headcount: "200+ employees",
    cta: "Talk to sales",
    href: "/contact",             // ← was /pricing
    featured: false,
    highlights: [
      "Everything in Growth, plus:",
      "Advanced analytics dashboard",
      "Dedicated success manager",
      "Custom API integrations · SLA",
    ],
  },
];
```

### Plan card layout

3-column grid (`grid-cols-1 md:grid-cols-3 gap-6`), full-width cards — NOT embedded in the feature grid columns.

Each card:
- Non-featured: `bg-white border border-ink-200 rounded-2xl p-7 shadow-[0_4px_20px_rgba(11,61,46,0.04)]`
- Featured (Growth): `bg-brand-900 border-brand-900 rounded-2xl p-7` — text colors inverted
- Badge (featured only): amber `text-[10px] font-bold uppercase tracking-[0.1em]` above name
- Plan name: `font-display font-bold text-[17px] text-ink-900` (white on featured)
- Price: `font-display font-black text-[42px] text-ink-900 leading-none tracking-[-0.03em]` (amber on featured)
  - Prefix: `text-[20px] font-semibold` — "KES " in same color as price
  - When annual: animate price change (no JS animation required — just React state swap)
- Unit: `text-[13px] text-ink-400` (white/40 on featured)
- Headcount: `text-[13px] text-ink-500 mt-1 mb-5` (white/50 on featured)
- CTA button:
  - Featured: `bg-amber hover:bg-amber-dark text-ink-900`
  - Starter: `bg-ink-900 hover:bg-ink-700 text-white`
  - Scale: `border border-ink-200 text-ink-700 hover:bg-surface-alt`
  - All: `block text-center py-3 rounded-lg text-[14px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2`
- Divider: `border-t border-ink-100 mt-5 pt-5` (white/10 on featured)
- Highlights: list with `Check size={14} text-brand-500` icons (white/70 + `text-brand-400` on featured). First item on Growth card: italic `text-[13px] text-ink-400` (white/50) with no check — acts as "inherits from" label.

### Trust strip

Between plan cards and feature grid. Single row of 4 items:
```
bg-surface-alt border border-ink-200 rounded-xl py-3 px-6
flex items-center justify-center gap-8 flex-wrap
```
Each item: `Check size={13} text-brand-700` + `text-[13px] text-ink-600 font-medium`
- "30-day free trial"
- "No credit card required"
- "Cancel any time"
- "Annual billing saves 15%"

### Feature grid

Placed below trust strip, inside `PricingTable`.

**Structure:**
```
bg-white border border-ink-200 rounded-xl overflow-hidden
```

Header row (`bg-surface-alt border-b border-ink-200 grid grid-cols-[2fr_1fr_1fr_1fr] lg:grid-cols-[3fr_140px_140px_140px]`):
- Feature label column: `text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-400 py-3 pl-5`
- Plan name columns: `text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-400 py-3 text-center`

Section subheadings (e.g. "Core — all plans"):
- `bg-ink-50 border-t border-ink-100 py-2 pl-5 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400 col-span-4`

Feature rows (`grid grid-cols-[2fr_1fr_1fr_1fr] lg:grid-cols-[3fr_140px_140px_140px] border-t border-ink-100 hover:bg-surface-alt/50 transition-colors`):
- Feature label: `text-[14px] text-ink-700 py-3.5 pl-5 leading-snug`
- Value cell: `text-center py-3.5`
  - `true` → `<Check size={15} className="text-brand-500 mx-auto" aria-label="Included" />`
  - `false` → `<span className="text-ink-200 text-[16px] select-none" aria-label="Not included">—</span>`
  - string → `<span className="font-mono text-[13px] text-ink-600 bg-surface-alt px-2 py-0.5 rounded">{value}</span>`

Section groups:
1. **Core — all plans**: 5 rows (payroll/filings, self-service portal, M-Pesa, KRA filing, SMS payslips)
2. **Growth & Scale only**: 6 rows (WhatsApp, leave, time & attendance, expense, multi-approver, basic analytics)
3. **Scale only**: 5 rows (advanced analytics, custom API, dedicated manager, multi-branch, SLA) + 2 tiered rows (audit log, support channel)

**Expand/collapse toggle:**
- Default: show Core section only (5 rows)
- Expanded: show all 3 sections
- Button: `mt-4 flex items-center gap-1.5 text-[14px] font-medium text-brand-700 hover:text-brand-900 transition-colors`
  - Label: "Compare all features" / "Show less"
  - `<ChevronDown size={15} className={cn("transition-transform duration-200", expanded && "rotate-180")} />`

---

## Component 2: `PricingComparisonTable` (new)

**File:** `frontend/landing/components/pricing/PricingComparisonTable.tsx`

Extracted from inline JSX in `page.tsx`. Identical visual output to current, just properly structured.

```tsx
const COMPARISON_ROWS: Array<[string, boolean | string, boolean | string]> = [
  ["PAYE brackets auto-updated", false, true],
  ["NSSF & SHIF calculations", false, true],
  ["KRA filing (P10A/P9)", false, true],
  ["M-Pesa salary disbursement", false, true],
  ["Audit trail & version history", false, true],
  ["Employee self-service payslips", false, true],
  ["Payroll run time", "3–5 hours", "< 20 minutes"],
];
```

Section styling unchanged (`py-20 bg-surface-alt border-b border-ink-200`). The table renders the same Check/X icons. No functional changes — extraction only.

---

## Component 3: `PricingTestimonials` (new)

**File:** `frontend/landing/components/pricing/PricingTestimonials.tsx`

Extracted from inline JSX. Adds a heading section above the existing two cards.

```tsx
const TESTIMONIALS = [
  {
    quote: "We used to spend three days on payroll every month. With AndikishaHR it takes under an hour. The PAYE calculations just work — I don't have to verify them against the KRA table anymore.",
    name: "James O.",
    role: "Finance Manager · Mombasa",
  },
  {
    quote: "The pricing is the most honest I've seen. One number per employee, nothing hidden. After 18 months we've had zero KRA penalty letters — that alone justifies the cost.",
    name: "Grace N.",
    role: "CEO · Nairobi Tech SME",
  },
];
```

Section heading added above cards:
```
<Eyebrow className="mb-4">What customers say</Eyebrow>
<h2 font-display font-bold text-[clamp(1.75rem,3vw,2.5rem)] text-ink-900 mb-10>
  Businesses that switched. Numbers that changed.
</h2>
```

Cards: identical to current (`bg-surface-alt border border-ink-200 rounded-2xl p-7`, amber quote mark, quote text, name/role).

Section wrapper: `py-20 bg-white border-b border-ink-100` (unchanged).

---

## Component 4: `FaqList` (modified)

**File:** `frontend/landing/components/faq/FaqList.tsx`

Add optional `columns?: 1 | 2` prop, defaulting to `2` (home page unaffected).

When `columns={1}`: render as a single-column stack (`grid-cols-1`) with no `border-r` or `pl-8`/`pr-8` column offsets.
When `columns={2}` (default): current 2-column behaviour unchanged.

```tsx
export default function FaqList({ columns = 2 }: { columns?: 1 | 2 }) { ... }
```

Pricing page passes `<FaqList columns={1} />`.

---

## `page.tsx` (cleaned up)

After extraction, `app/pricing/page.tsx` becomes:

```tsx
import PricingTable from "@/components/pricing/PricingTable";
import PricingComparisonTable from "@/components/pricing/PricingComparisonTable";
import PricingTestimonials from "@/components/pricing/PricingTestimonials";
import FaqList from "@/components/faq/FaqList";
import JoinCTA from "@/components/cta/JoinCTA";
// + Hero inline (unchanged)

export default function PricingPage() {
  return (
    <>
      {/* Hero — unchanged */}
      <PricingTable />
      <PricingComparisonTable />
      <PricingTestimonials />
      <FaqList columns={1} />
      <JoinCTA />
    </>
  );
}
```

---

## Implementation Notes

- `PricingTable` is a `"use client"` component (needs `useState` for billing toggle and expand/collapse)
- All other new components are server components (no interactivity)
- Annual prices: `Math.round(monthlyPrice * 0.85)` — Starter 298, Growth 238, Scale 187
- Billing toggle state lives in `PricingTable` only — no context/prop drilling needed
- `FaqList` default `columns={2}` means zero changes needed on the home page
- typecheck must pass: `cd frontend/landing && pnpm type-check`
