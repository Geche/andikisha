# /pricing Page Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance the /pricing page with a billing toggle, separated plan cards, extracted components, icon-based feature grid, and single-column FAQ — all matching the existing site design language exactly.

**Architecture:** Five sequential tasks. Tasks 1–3 create/modify isolated components. Task 4 rebuilds `PricingTable` (the most complex change). Task 5 cleans up `page.tsx` to use the new components and removes all inline data.

**Tech Stack:** Next.js 14, React, TypeScript, Tailwind CSS, Lucide icons, `cn` utility from `@/lib/utils`

---

## File Map

**Created:**
- `frontend/landing/components/pricing/PricingComparisonTable.tsx` — extracted comparison table (Task 1)
- `frontend/landing/components/pricing/PricingTestimonials.tsx` — extracted testimonials with heading (Task 2)

**Modified:**
- `frontend/landing/components/faq/FaqList.tsx` — add optional `columns?: 1 | 2` prop (Task 3)
- `frontend/landing/components/pricing/PricingTable.tsx` — full rebuild: billing toggle + plan cards + trust strip + feature grid (Task 4)
- `frontend/landing/app/pricing/page.tsx` — remove inline sections, import new components (Task 5)

---

## Task 1: Create PricingComparisonTable

**Files:**
- Create: `frontend/landing/components/pricing/PricingComparisonTable.tsx`

- [ ] **Step 1: Create the component**

Create `frontend/landing/components/pricing/PricingComparisonTable.tsx` with this exact content:

```tsx
import { Check, X } from "lucide-react";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";

type ComparisonValue = boolean | string;

const ROWS: Array<[string, ComparisonValue, ComparisonValue]> = [
  ["PAYE brackets auto-updated", false, true],
  ["NSSF & SHIF calculations", false, true],
  ["KRA filing (P10A/P9)", false, true],
  ["M-Pesa salary disbursement", false, true],
  ["Audit trail & version history", false, true],
  ["Employee self-service payslips", false, true],
  ["Payroll run time", "3–5 hours", "< 20 minutes"],
];

export default function PricingComparisonTable() {
  return (
    <section className="py-20 bg-surface-alt border-b border-ink-200">
      <Container>
        <div className="text-center mb-12">
          <Eyebrow className="mb-4">Why switch</Eyebrow>
          <h2
            className="font-display font-bold text-ink-900 max-w-[480px] mx-auto"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", lineHeight: "1.1", letterSpacing: "-0.02em" }}
          >
            AndikishaHR vs running payroll on a spreadsheet
          </h2>
        </div>
        <div className="max-w-[700px] mx-auto overflow-x-auto">
          <table className="w-full text-[14px]">
            <thead>
              <tr className="border-b border-ink-200">
                <th className="text-left py-3 pr-6 font-semibold text-ink-400 w-[45%]">Capability</th>
                <th className="text-center py-3 px-4 font-semibold text-ink-400 w-[27%]">Spreadsheet</th>
                <th className="text-center py-3 px-4 font-bold text-brand-900 w-[27%]">AndikishaHR</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map(([cap, spreadsheet, andikisha]) => (
                <tr key={cap} className="border-b border-ink-100 last:border-0">
                  <td className="py-3.5 pr-6 text-ink-700 font-medium">{cap}</td>
                  <td className="py-3.5 px-4 text-center">
                    {typeof spreadsheet === "boolean" ? (
                      spreadsheet ? (
                        <Check size={16} className="text-brand-500 mx-auto" aria-label="Yes" />
                      ) : (
                        <X size={16} className="text-error mx-auto" aria-label="No" />
                      )
                    ) : (
                      <span className="text-ink-400">{spreadsheet}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {typeof andikisha === "boolean" ? (
                      andikisha ? (
                        <Check size={16} className="text-brand-500 mx-auto" aria-label="Yes" />
                      ) : (
                        <X size={16} className="text-error mx-auto" aria-label="No" />
                      )
                    ) : (
                      <span className="text-brand-700 font-semibold">{andikisha}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd frontend/landing && pnpm type-check
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/landing/components/pricing/PricingComparisonTable.tsx
git commit -m "feat(landing/pricing): extract PricingComparisonTable component"
```

---

## Task 2: Create PricingTestimonials

**Files:**
- Create: `frontend/landing/components/pricing/PricingTestimonials.tsx`

- [ ] **Step 1: Create the component**

Create `frontend/landing/components/pricing/PricingTestimonials.tsx`:

```tsx
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";

const TESTIMONIALS = [
  {
    quote:
      "We used to spend three days on payroll every month. With AndikishaHR it takes under an hour. The PAYE calculations just work — I don't have to verify them against the KRA table anymore.",
    name: "James O.",
    role: "Finance Manager · Mombasa",
  },
  {
    quote:
      "The pricing is the most honest I've seen. One number per employee, nothing hidden. After 18 months we've had zero KRA penalty letters — that alone justifies the cost.",
    name: "Grace N.",
    role: "CEO · Nairobi Tech SME",
  },
];

export default function PricingTestimonials() {
  return (
    <section className="py-20 bg-white border-b border-ink-100">
      <Container>
        <div className="mb-12">
          <Eyebrow className="mb-4">What customers say</Eyebrow>
          <h2
            className="font-display font-bold text-ink-900"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", lineHeight: "1.1", letterSpacing: "-0.02em" }}
          >
            Businesses that switched.
            <br />
            Numbers that changed.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[900px]">
          {TESTIMONIALS.map(({ quote, name, role }) => (
            <div key={name} className="bg-surface-alt border border-ink-200 rounded-2xl p-7">
              <p className="text-amber text-[28px] leading-none mb-3 font-serif">&ldquo;</p>
              <p className="text-[15px] text-ink-700 leading-[1.8] mb-5">{quote}</p>
              <div>
                <p className="text-[14px] font-semibold text-ink-900">{name}</p>
                <p className="text-[13px] text-ink-400">{role}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd frontend/landing && pnpm type-check
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/landing/components/pricing/PricingTestimonials.tsx
git commit -m "feat(landing/pricing): extract PricingTestimonials component with heading"
```

---

## Task 3: Add `columns` prop to FaqList

**Files:**
- Modify: `frontend/landing/components/faq/FaqList.tsx`

The change is two lines: add the prop to the function signature, and conditionally apply grid/border classes.

- [ ] **Step 1: Update the function signature**

Find the current export line:
```tsx
export default function FaqList() {
```

Replace with:
```tsx
export default function FaqList({ columns = 2 }: { columns?: 1 | 2 }) {
```

- [ ] **Step 2: Update the grid wrapper className**

Find:
```tsx
<div className="grid grid-cols-2">
```

Replace with:
```tsx
<div className={columns === 1 ? "grid grid-cols-1" : "grid grid-cols-2"}>
```

- [ ] **Step 3: Update the details className to conditionally apply column borders**

Find:
```tsx
className={[
  "group border-b border-ink-200",
  isOdd ? "border-r border-ink-200 pr-8" : "pl-8",
].join(" ")}
```

Replace with:
```tsx
className={[
  "group border-b border-ink-200",
  columns === 2 ? (isOdd ? "border-r border-ink-200 pr-8" : "pl-8") : "",
].filter(Boolean).join(" ")}
```

- [ ] **Step 4: Typecheck**

```bash
cd frontend/landing && pnpm type-check
```

Expected: zero errors.

- [ ] **Step 5: Verify home page is unaffected**

The home page uses `<FaqList />` with no props. Since `columns` defaults to `2`, the home page output is identical. Confirm by reading `frontend/landing/app/page.tsx` — it should call `<FaqList />` with no props.

- [ ] **Step 6: Commit**

```bash
git add frontend/landing/components/faq/FaqList.tsx
git commit -m "feat(landing/faq): add optional columns prop (default 2) for single-column layout"
```

---

## Task 4: Rebuild PricingTable

**Files:**
- Modify: `frontend/landing/components/pricing/PricingTable.tsx` (full rewrite)

This is the most substantial change. The component becomes a `"use client"` component with two pieces of state: `annual` (billing toggle) and `expanded` (feature grid toggle).

- [ ] **Step 1: Replace the entire file**

Write the following as the complete content of `frontend/landing/components/pricing/PricingTable.tsx`:

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import { cn } from "@/lib/utils";

interface Plan {
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  unit: string;
  headcount: string;
  cta: string;
  href: string;
  featured: boolean;
  badge?: string;
  highlights: string[];
}

const PLANS: Plan[] = [
  {
    name: "Starter",
    monthlyPrice: 350,
    annualPrice: 298,
    unit: "per employee / month",
    headcount: "Up to 25 employees",
    cta: "Start free trial",
    href: "/early-access",
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
    href: "/early-access",
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
    headcount: "200+ employees",
    cta: "Talk to sales",
    href: "/contact",
    featured: false,
    highlights: [
      "Everything in Growth, plus:",
      "Advanced analytics dashboard",
      "Dedicated success manager",
      "Custom API integrations · SLA",
    ],
  },
];

interface FeatureRow {
  feature: string;
  starter: boolean | string;
  growth: boolean | string;
  scale: boolean | string;
  section?: string;
}

// section?: marks the first row of each group — renders a subheading above it
const FEATURE_ROWS: FeatureRow[] = [
  { feature: "Full payroll & statutory filings (PAYE, NSSF, SHIF, Housing Levy)", starter: true, growth: true, scale: true, section: "Core — included on all plans" },
  { feature: "Employee self-service portal (PWA)", starter: true, growth: true, scale: true },
  { feature: "M-Pesa salary disbursement", starter: true, growth: true, scale: true },
  { feature: "KRA one-click filing", starter: true, growth: true, scale: true },
  { feature: "SMS payslip delivery", starter: true, growth: true, scale: true },
  { feature: "WhatsApp payslip delivery", starter: false, growth: true, scale: true, section: "Growth & Scale only" },
  { feature: "Leave & absence management", starter: false, growth: true, scale: true },
  { feature: "Time & attendance tracking", starter: false, growth: true, scale: true },
  { feature: "Expense management", starter: false, growth: true, scale: true },
  { feature: "Multi-approver workflows", starter: false, growth: true, scale: true },
  { feature: "Basic analytics & reporting", starter: false, growth: true, scale: true },
  { feature: "Advanced analytics dashboard", starter: false, growth: false, scale: true, section: "Scale only" },
  { feature: "Custom API integrations", starter: false, growth: false, scale: true },
  { feature: "Dedicated success manager", starter: false, growth: false, scale: true },
  { feature: "Multi-branch / multi-county payroll", starter: false, growth: false, scale: true },
  { feature: "SLA guarantee (99.9% uptime)", starter: false, growth: false, scale: true },
  { feature: "Audit log retention", starter: "1 year", growth: "3 years", scale: "7 years" },
  { feature: "Support channel", starter: "Email", growth: "Chat + phone", scale: "Dedicated manager" },
];

const CORE_ROW_COUNT = 5;

const TRUST_ITEMS = [
  "30-day free trial",
  "No credit card required",
  "Cancel any time",
  "Annual billing saves 15%",
];

function Cell({ value }: { value: boolean | string }) {
  if (value === true) {
    return <Check size={15} className="text-brand-500 mx-auto" aria-label="Included" />;
  }
  if (value === false) {
    return (
      <span className="text-ink-200 text-[18px] select-none leading-none" aria-label="Not included">
        —
      </span>
    );
  }
  return (
    <span className="font-mono text-[12px] text-ink-600 bg-surface-alt px-2 py-0.5 rounded border border-ink-100">
      {value}
    </span>
  );
}

export default function PricingTable() {
  const [annual, setAnnual] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const visibleRows = expanded ? FEATURE_ROWS : FEATURE_ROWS.slice(0, CORE_ROW_COUNT);

  return (
    <section className="py-24 bg-surface-alt" id="pricing">
      <Container>
        {/* Heading */}
        <div className="mb-10">
          <Eyebrow className="mb-4">Pricing</Eyebrow>
          <h2
            className="font-display font-bold text-ink-900 mb-3"
            style={{ fontSize: "clamp(2.25rem, 4vw, 3.5rem)", lineHeight: "1.05", letterSpacing: "-0.015em" }}
          >
            Simple pricing.
            <br />
            No surprises.
          </h2>
          <p className="text-[17px] text-ink-600">
            All prices in KES. VAT applied where applicable.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center gap-3 mb-10">
          <span
            className={cn(
              "text-[14px] font-medium transition-colors duration-200",
              !annual ? "text-ink-900" : "text-ink-400"
            )}
          >
            Monthly
          </span>
          <button
            role="switch"
            aria-checked={annual}
            aria-label="Toggle annual billing"
            onClick={() => setAnnual((v) => !v)}
            className="relative w-11 h-6 rounded-full bg-brand-900 transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2 shrink-0"
          >
            <span
              className={cn(
                "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200",
                annual ? "translate-x-[22px]" : "translate-x-0.5"
              )}
            />
          </button>
          <span
            className={cn(
              "text-[14px] font-medium transition-colors duration-200",
              annual ? "text-ink-900" : "text-ink-400"
            )}
          >
            Annual
          </span>
          <span className="bg-amber-light text-amber-dark text-[11px] font-bold px-2.5 py-1 rounded-full border border-amber">
            Save 15%
          </span>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-5">
          {PLANS.map((plan) => {
            const price = annual ? plan.annualPrice : plan.monthlyPrice;
            return (
              <div
                key={plan.name}
                className={cn(
                  "rounded-2xl p-7",
                  plan.featured
                    ? "bg-brand-900 border border-brand-900"
                    : "bg-white border border-ink-200 shadow-[0_4px_20px_rgba(11,61,46,0.04)]"
                )}
              >
                {plan.badge && (
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-amber mb-2">
                    {plan.badge}
                  </p>
                )}
                <p
                  className={cn(
                    "font-display font-bold text-[17px] mb-2",
                    plan.featured ? "text-white" : "text-ink-900"
                  )}
                >
                  {plan.name}
                </p>
                <p
                  className={cn(
                    "font-display font-black leading-none tracking-[-0.03em] mb-1",
                    plan.featured ? "text-amber" : "text-ink-900"
                  )}
                  style={{ fontSize: "clamp(2rem, 3.5vw, 2.75rem)" }}
                >
                  <span className="text-[18px] font-semibold">KES </span>
                  {price}
                </p>
                <p
                  className={cn(
                    "text-[12px] mb-1",
                    plan.featured ? "text-white/40" : "text-ink-400"
                  )}
                >
                  {plan.unit}
                </p>
                <p
                  className={cn(
                    "text-[13px] mb-6",
                    plan.featured ? "text-white/50" : "text-ink-600"
                  )}
                >
                  {plan.headcount}
                </p>
                <Link
                  href={plan.href}
                  className={cn(
                    "block text-center py-3 rounded-lg text-[14px] font-semibold transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2",
                    plan.featured
                      ? "bg-amber hover:bg-amber-dark text-ink-900"
                      : plan.cta === "Talk to sales"
                        ? "border border-ink-200 text-ink-700 hover:bg-surface-alt"
                        : "bg-ink-900 hover:bg-ink-700 text-white"
                  )}
                >
                  {plan.cta}
                </Link>

                {/* Highlights */}
                <div
                  className={cn(
                    "mt-6 pt-5 border-t flex flex-col gap-2.5",
                    plan.featured ? "border-white/10" : "border-ink-100"
                  )}
                >
                  {plan.highlights.map((item) =>
                    item.startsWith("Everything in") ? (
                      <span
                        key={item}
                        className={cn(
                          "text-[13px] italic leading-relaxed",
                          plan.featured ? "text-white/50" : "text-ink-400"
                        )}
                      >
                        {item}
                      </span>
                    ) : (
                      <div key={item} className="flex items-start gap-2">
                        <Check
                          size={13}
                          className={cn(
                            "shrink-0 mt-0.5",
                            plan.featured ? "text-brand-500" : "text-brand-700"
                          )}
                          aria-hidden="true"
                        />
                        <span
                          className={cn(
                            "text-[13px] leading-relaxed",
                            plan.featured ? "text-white/75" : "text-ink-600"
                          )}
                        >
                          {item}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust strip */}
        <div className="flex items-center justify-center gap-6 flex-wrap bg-white border border-ink-200 rounded-xl py-3.5 px-6 mb-10">
          {TRUST_ITEMS.map((item) => (
            <div key={item} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
                <Check size={9} strokeWidth={3} className="text-brand-700" aria-hidden="true" />
              </div>
              <span className="text-[13px] text-ink-600 font-medium">{item}</span>
            </div>
          ))}
        </div>

        {/* Feature grid */}
        <div className="bg-white border border-ink-200 rounded-xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] lg:grid-cols-[3fr_140px_140px_140px] bg-surface-alt border-b border-ink-200">
            <div className="py-3 pl-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-400">
              Features
            </div>
            {PLANS.map((p) => (
              <div
                key={p.name}
                className="py-3 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-400"
              >
                {p.name}
              </div>
            ))}
          </div>

          {/* Rows */}
          {visibleRows.map((row) => (
            <div key={row.feature}>
              {row.section && (
                <div className="bg-ink-100 border-t border-ink-200 py-2 px-5 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400">
                  {row.section}
                </div>
              )}
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr] lg:grid-cols-[3fr_140px_140px_140px] border-t border-ink-100 hover:bg-surface-alt transition-colors duration-100">
                <div className="py-3.5 pl-5 text-[14px] text-ink-700 leading-snug pr-4">
                  {row.feature}
                </div>
                <div className="py-3.5 flex items-center justify-center">
                  <Cell value={row.starter} />
                </div>
                <div className="py-3.5 flex items-center justify-center">
                  <Cell value={row.growth} />
                </div>
                <div className="py-3.5 flex items-center justify-center">
                  <Cell value={row.scale} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-4 flex items-center gap-1.5 text-[14px] font-medium text-brand-700 hover:text-brand-900 transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2 rounded-sm"
          aria-expanded={expanded}
        >
          {expanded ? "Show less" : "Compare all features"}
          <ChevronDown
            size={15}
            className={cn("transition-transform duration-200", expanded && "rotate-180")}
            aria-hidden
          />
        </button>
      </Container>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd frontend/landing && pnpm type-check
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/landing/components/pricing/PricingTable.tsx
git commit -m "feat(landing/pricing): rebuild PricingTable — billing toggle, plan cards, trust strip, icon grid"
```

---

## Task 5: Clean up pricing page.tsx

**Files:**
- Modify: `frontend/landing/app/pricing/page.tsx`

Remove the inline comparison table section and inline testimonials section. Import and use the new components.

- [ ] **Step 1: Replace the entire file**

Write the following as the complete content of `frontend/landing/app/pricing/page.tsx`:

```tsx
import type { Metadata } from "next";
import { Check } from "lucide-react";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import PricingTable from "@/components/pricing/PricingTable";
import PricingComparisonTable from "@/components/pricing/PricingComparisonTable";
import PricingTestimonials from "@/components/pricing/PricingTestimonials";
import FaqList from "@/components/faq/FaqList";
import JoinCTA from "@/components/cta/JoinCTA";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Transparent KES pricing for Kenyan businesses. Statutory compliance on every plan. No hidden fees.",
};

export default function PricingPage() {
  return (
    <>
      <section className="bg-brand-900 py-20 relative overflow-hidden">
        <Container className="relative z-10 text-center">
          <Eyebrow light className="mb-5">Pricing</Eyebrow>
          <h1
            className="font-display font-bold text-white max-w-[620px] mx-auto mb-5"
            style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", lineHeight: "1.05", letterSpacing: "-0.02em" }}
          >
            Pricing that makes sense at every stage.
          </h1>
          <p className="text-[18px] text-brand-100/70 max-w-[480px] mx-auto mb-7">
            One flat rate per employee per month. Full Kenya statutory compliance on every plan.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-white/80 text-[13px] font-medium">
              <Check size={13} className="text-amber" aria-hidden="true" />
              30-day free trial
            </span>
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-white/80 text-[13px] font-medium">
              <Check size={13} className="text-amber" aria-hidden="true" />
              No credit card required
            </span>
          </div>
        </Container>
      </section>

      <PricingTable />
      <PricingComparisonTable />
      <PricingTestimonials />
      <FaqList columns={1} />
      <JoinCTA />
    </>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd frontend/landing && pnpm type-check
```

Expected: zero errors.

- [ ] **Step 3: Verify the dev server renders correctly**

```bash
cd frontend/landing && pnpm dev
```

Open http://localhost:3002/pricing. Verify:
- Hero: dark brand-900 with two amber chips
- PricingTable: "Monthly / Annual" toggle, 3 plan cards, trust strip, feature grid
- Toggle annual: plan prices update to 298 / 238 / 187
- "Compare all features" expands grid to show Growth & Scale and Scale-only rows
- PricingComparisonTable: same table as before (AndikishaHR vs spreadsheet)
- PricingTestimonials: "What customers say" heading + two quote cards
- FaqList: single-column stack (not 2-column)
- JoinCTA at bottom

- [ ] **Step 4: Commit**

```bash
git add frontend/landing/app/pricing/page.tsx
git commit -m "refactor(landing/pricing): clean up page.tsx — use extracted components, single-column FAQ"
```

---

## Final: Push

```bash
git push origin master
```
