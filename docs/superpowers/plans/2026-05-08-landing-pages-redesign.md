# Landing Secondary Pages — Full Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign 8 secondary pages in `frontend/landing/` to match the home page visual quality — Bricolage Grotesque headlines, brand-900/950 hero backgrounds, amber accents, single "Schedule a demo" CTA, closing every page with `JoinCTA` or `NewsletterSection`.

**Architecture:** Three sequential waves of parallel tasks. Wave 1 (form pages), Wave 2 (content pages), Wave 3 (new builds). Each wave verified with typecheck before the next starts. Task groupings within each wave are independent and can run as parallel agents.

**Tech Stack:** Next.js 14, React, TypeScript, Tailwind CSS, Lucide icons, MDXRemote (blog), `lib/blog.ts` (getAllPosts/getPost)

---

## File Map

**Modified:**
- `frontend/landing/components/stats/StatsBand.tsx` — extend to accept optional `stats` prop (Task 1)
- `frontend/landing/app/contact/page.tsx` — add hero stat chips + NewsletterSection (Task 2)
- `frontend/landing/app/demo/page.tsx` — add social proof chip + LogosRow + JoinCTA (Task 3)
- `frontend/landing/app/early-access/page.tsx` — urgency counter + Lucide icons on perks + testimonial (Task 4)
- `frontend/landing/app/product/page.tsx` — StatsBand + upgraded mockups + integration tiles + JoinCTA (Task 6)
- `frontend/landing/app/about/page.tsx` — StatsBand + remove partners stub + JoinCTA (Task 7)
- `frontend/landing/app/pricing/page.tsx` — hero chips + comparison table + testimonials + JoinCTA (Task 8)
- `frontend/landing/app/partners/page.tsx` — full rewrite (Task 10)
- `frontend/landing/app/blog/BlogClient.tsx` — PostCard upgrade + amber active pill + swap newsletter (Task 11)
- `frontend/landing/app/blog/[slug]/page.tsx` — wire ReadingProgress + ShareBar + category related posts + NewsletterSection (Task 12)
- `CHANGELOG.md` — add entry (Task 13)

**Created:**
- `frontend/landing/components/blog/ReadingProgress.tsx` — client reading progress bar (Task 9)
- `frontend/landing/components/blog/ShareBar.tsx` — share buttons (LinkedIn/Twitter/WhatsApp) (Task 9)

---

## Pre-requisite: Extend StatsBand

### Task 1: Make StatsBand accept optional stats prop

The home page uses `StatsBand` with platform stats. `/product` and `/about` need different stats. Extend the component to accept an optional `stats` prop while keeping the current stats as default.

**Files:**
- Modify: `frontend/landing/components/stats/StatsBand.tsx`

- [ ] **Step 1: Rewrite StatsBand with optional stats prop**

Replace the entire file content:

```tsx
import Container from "@/components/ui/Container";

export interface Stat {
  num: string;
  suffix: string;
  label: string;
}

const DEFAULT_STATS: Stat[] = [
  { num: "240", suffix: "+", label: "Businesses on the platform" },
  { num: "1.2", suffix: "B", label: "KES processed monthly" },
  { num: "100", suffix: "%", label: "On-time statutory filings" },
  { num: "<20", suffix: "m", label: "Average payroll run" },
];

export default function StatsBand({ stats = DEFAULT_STATS }: { stats?: Stat[] }) {
  return (
    <section className="bg-white border-t border-ink-100 border-b border-ink-100 py-16">
      <Container>
        <div className="grid grid-cols-4 max-w-[900px] mx-auto">
          {stats.map(({ num, suffix, label }, i) => (
            <div
              key={label}
              className={`text-center px-6 ${i < stats.length - 1 ? "border-r border-ink-100" : ""}`}
            >
              <p
                className="font-black text-ink-900 leading-none tracking-[-0.03em] mb-2.5"
                style={{ fontSize: "clamp(40px, 4vw, 54px)" }}
              >
                {num}<span className="text-amber">{suffix}</span>
              </p>
              <p className="text-[14px] text-ink-600 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
```

- [ ] **Step 2: Verify typecheck passes**

```bash
cd frontend/landing && pnpm typecheck
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/landing/components/stats/StatsBand.tsx
git commit -m "feat(landing): extend StatsBand to accept optional stats prop"
```

---

## Wave 1 — Form Pages (Tasks 2–4 are independent, run in parallel)

### Task 2: /contact — hero stat chips + NewsletterSection

**Files:**
- Modify: `frontend/landing/app/contact/page.tsx`

- [ ] **Step 1: Add Clock + Calendar imports and stat chips to hero**

Add `Clock` and `Calendar` to the lucide import line and a chips row to the hero section. The full updated hero section (replace the existing `<section className="bg-brand-900 py-20">` block):

```tsx
import { Mail, Phone, MapPin, Clock, Calendar } from "lucide-react";
```

Replace the hero section:

```tsx
<section className="bg-brand-900 py-20">
  <Container className="text-center">
    <Eyebrow light className="mb-4">Get in Touch</Eyebrow>
    <h1 className="font-display text-[clamp(36px,5vw,56px)] font-extrabold text-white max-w-[580px] mx-auto mb-5 leading-[1.1]">
      We are based in Nairobi. We respond fast.
    </h1>
    <p className="text-[18px] text-white/70 max-w-[480px] mx-auto mb-7">
      Sales, support, partnerships, or a general question — send a message
      and we will get back to you within 2 hours on business days.
    </p>
    <div className="flex justify-center gap-3 flex-wrap">
      <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-white/80 text-[13px] font-medium">
        <Clock size={13} className="text-amber" aria-hidden="true" />
        2hr response time
      </span>
      <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-white/80 text-[13px] font-medium">
        <Calendar size={13} className="text-amber" aria-hidden="true" />
        Mon–Fri 8am–6pm EAT
      </span>
    </div>
  </Container>
</section>
```

- [ ] **Step 2: Add NewsletterSection import and place it at the bottom**

Add import at top of file:

```tsx
import NewsletterSection from "@/components/layout/NewsletterSection";
```

Add `<NewsletterSection />` as the last element inside the fragment (after the existing two-column section):

```tsx
    </section>

    <NewsletterSection />
  </>
```

- [ ] **Step 3: Typecheck**

```bash
cd frontend/landing && pnpm typecheck
```

Expected: zero errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/landing/app/contact/page.tsx
git commit -m "feat(landing/contact): add hero stat chips + NewsletterSection"
```

---

### Task 3: /demo — social proof chip + LogosRow + JoinCTA

**Files:**
- Modify: `frontend/landing/app/demo/page.tsx`

- [ ] **Step 1: Add imports**

Add to the import block:

```tsx
import { CheckCircle, Clock, FileText, HelpCircle, TrendingUp } from "lucide-react";
import LogosRow from "@/components/logos/LogosRow";
import JoinCTA from "@/components/cta/JoinCTA";
```

(Note: `CheckCircle`, `Clock`, `FileText`, `HelpCircle`, `TrendingUp` are already imported — keep them. Only add `LogosRow` and `JoinCTA`.)

- [ ] **Step 2: Update hero to add social proof chip**

Replace the hero `<section>` block:

```tsx
<section className="bg-brand-900 py-20">
  <Container className="text-center">
    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-white/75 text-[13px] font-medium mb-5">
      <CheckCircle size={13} className="text-amber" aria-hidden="true" />
      100+ companies onboarded across Kenya
    </div>
    <Eyebrow light className="mb-4">Live Demo</Eyebrow>
    <h1 className="font-display text-[clamp(36px,5vw,56px)] font-extrabold text-white max-w-[640px] mx-auto mb-5 leading-[1.1]">
      See AndikishaHR in 30 minutes.
    </h1>
    <p className="text-[18px] text-white/70 max-w-[500px] mx-auto">
      A personalised session with our team. We walk through your specific
      payroll and compliance setup — not a generic slide deck.
    </p>
  </Container>
</section>
```

- [ ] **Step 3: Add LogosRow between hero and two-column section**

Insert `<LogosRow />` immediately after the closing `</section>` of the hero and before the opening `<section className="py-20 bg-surface-alt">`:

```tsx
</section>

<LogosRow />

<section className="py-20 bg-surface-alt">
```

- [ ] **Step 4: Replace the closing CTA section with JoinCTA**

The page currently has no closing CTA. Add `<JoinCTA />` at the end of the fragment:

```tsx
    </section>

    <JoinCTA />
  </>
```

- [ ] **Step 5: Typecheck**

```bash
cd frontend/landing && pnpm typecheck
```

Expected: zero errors.

- [ ] **Step 6: Commit**

```bash
git add frontend/landing/app/demo/page.tsx
git commit -m "feat(landing/demo): social proof chip, LogosRow trust strip, JoinCTA"
```

---

### Task 4: /early-access — urgency counter + icons on perks + testimonial

**Files:**
- Modify: `frontend/landing/app/early-access/page.tsx`

- [ ] **Step 1: Add Lucide icon imports**

```tsx
import Link from "next/link";
import { Lock, Database, UserCircle, Map, LayoutGrid } from "lucide-react";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
```

- [ ] **Step 2: Update PERKS array to include icons**

Replace the existing `PERKS` constant:

```tsx
const PERKS = [
  { label: "Pricing locked", detail: "24 months from go-live", icon: <Lock size={16} aria-hidden="true" /> },
  { label: "Free migration", detail: "12 months of historical data", icon: <Database size={16} aria-hidden="true" /> },
  { label: "Named account lead", detail: "From day one", icon: <UserCircle size={16} aria-hidden="true" /> },
  { label: "Roadmap input", detail: "Direct line to product", icon: <Map size={16} aria-hidden="true" /> },
  { label: "All nine modules", detail: "Included in founding price", icon: <LayoutGrid size={16} aria-hidden="true" /> },
];
```

- [ ] **Step 3: Add urgency badge to hero section**

Replace the existing hero `<section>` block:

```tsx
<section className="bg-brand-950 py-28">
  <Container>
    <div className="max-w-[640px]">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber/15 border border-amber/30 text-amber text-[13px] font-semibold mb-6">
        42 of 50 founding spots remaining
      </div>
      <Eyebrow light className="mb-5">Pre-launch · capped at 50</Eyebrow>
      <h1
        className="font-display font-bold text-white mb-6 leading-[1.03]"
        style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", letterSpacing: "-0.025em" }}
      >
        Founding customer access is open.
        <br />
        <span className="text-amber">Apply now.</span>
      </h1>
      <p className="text-[18px] text-brand-100/65 leading-[1.7] max-w-[500px]">
        The first 50 Kenyan businesses to join shape the roadmap, lock in pricing for 24 months,
        and get white-glove onboarding. When the cohort fills, this offer closes.
      </p>
    </div>
  </Container>
</section>
```

- [ ] **Step 4: Update PERKS render to use icons instead of dot bullets**

Replace the perks row render inside the `lg:col-span-5` div:

```tsx
<div className="flex flex-col divide-y divide-ink-100">
  {PERKS.map(({ label, detail, icon }) => (
    <div key={label} className="flex items-center justify-between py-4">
      <div className="flex items-center gap-3">
        <span className="text-amber shrink-0">{icon}</span>
        <span className="text-[15px] font-semibold text-ink-900">{label}</span>
      </div>
      <span className="text-[14px] font-mono text-ink-500">{detail}</span>
    </div>
  ))}
</div>
```

- [ ] **Step 5: Add urgency text to application panel and testimonial section**

After the existing `bg-white py-24` section, add a testimonial section:

```tsx
<section className="bg-brand-900 py-16">
  <Container>
    <div className="max-w-[600px] mx-auto text-center">
      <p className="text-amber text-[40px] leading-none mb-4 font-serif">&ldquo;</p>
      <p className="text-[18px] text-white/80 leading-[1.7] mb-6 italic">
        We ran our first payroll in 4 hours. The PAYE calculations were spot-on.
        No more cross-referencing the KRA website before every run.
      </p>
      <div>
        <p className="text-[14px] font-semibold text-white">Wanjiku M.</p>
        <p className="text-[13px] text-white/50">HR Manager · Nairobi</p>
      </div>
    </div>
  </Container>
</section>
```

Also update the application panel copy to add urgency — inside the existing `lg:col-span-7` div, add below the paragraph:

```tsx
<p className="text-[13px] text-ink-400 mb-6">
  Cohort closes when the 50th company is confirmed. No waitlist — when it&apos;s full, it&apos;s full.
</p>
```

- [ ] **Step 6: Typecheck**

```bash
cd frontend/landing && pnpm typecheck
```

Expected: zero errors.

- [ ] **Step 7: Commit**

```bash
git add frontend/landing/app/early-access/page.tsx
git commit -m "feat(landing/early-access): urgency counter, Lucide icons on perks, testimonial"
```

---

### Wave 1 Checkpoint — verify all three pages visually

- [ ] **Step 1: Start dev server**

```bash
cd frontend/landing && pnpm dev
```

Server starts at http://localhost:3002 (or next available port).

- [ ] **Step 2: Check /contact**

Open http://localhost:3002/contact. Verify:
- Hero shows two amber chips ("2hr response time", "Mon–Fri 8am–6pm EAT")
- Form and contact details section unchanged
- WhatsApp card unchanged
- NewsletterSection visible at the bottom (dark brand-900 background with email input)

- [ ] **Step 3: Check /demo**

Open http://localhost:3002/demo. Verify:
- Social proof chip visible above the Eyebrow in the hero
- LogosRow (trusted companies strip) appears between hero and the two-column section
- JoinCTA section visible at the very bottom

- [ ] **Step 4: Check /early-access**

Open http://localhost:3002/early-access. Verify:
- Amber "42 of 50 founding spots remaining" badge in hero
- Perk rows show Lucide icons (Lock, Database, UserCircle, Map, LayoutGrid) instead of dot bullets
- Testimonial section visible at the bottom (dark brand-900 background with quote)

---

## Wave 2 — Content Pages (Tasks 6–8 are independent, run in parallel)

### Task 6: /product — StatsBand + upgraded mockups + integration tiles + JoinCTA

**Files:**
- Modify: `frontend/landing/app/product/page.tsx`

- [ ] **Step 1: Add imports**

```tsx
import StatsBand from "@/components/stats/StatsBand";
import JoinCTA from "@/components/cta/JoinCTA";
import type { Stat } from "@/components/stats/StatsBand";
```

- [ ] **Step 2: Define product-specific stats constant**

Add before `export default function ProductPage()`:

```tsx
const PRODUCT_STATS: Stat[] = [
  { num: "9", suffix: "", label: "HR modules in one platform" },
  { num: "6", suffix: "", label: "Statutory obligations handled" },
  { num: "<1", suffix: "d", label: "Average setup time" },
  { num: "100", suffix: "%", label: "Compliance accuracy" },
];
```

- [ ] **Step 3: Insert StatsBand after the hero section**

After the closing `</section>` of the hero (the `bg-brand-900 py-24` section) and before the `FEATURES_TABS.map(...)`:

```tsx
</section>

<StatsBand stats={PRODUCT_STATS} />

{FEATURES_TABS.map((tab, idx) => {
```

- [ ] **Step 4: Upgrade dark mockup panels with colored status dots**

Inside the `FEATURES_TABS.map` render, find the mockup row render and replace it:

```tsx
{tab.mockupRows.map((row, i) => (
  <div key={i} className="flex items-center justify-between py-3 border-b border-white/[0.07] last:border-0">
    <span className="text-[13px] text-white/50">{row.label}</span>
    {row.badge ? (
      <span className={`text-[12px] font-semibold px-2.5 py-1 rounded ${
        row.badgeColor === "green" ? "bg-brand-500/20 text-brand-500"
        : row.badgeColor === "amber" ? "bg-amber/20 text-amber"
        : "bg-info/20 text-info"
      }`}>{row.badge}</span>
    ) : (
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full shrink-0 ${
          i === 0 ? "bg-brand-500" : i === 1 ? "bg-amber" : "bg-brand-400"
        }`} aria-hidden="true" />
        <span className="text-[13px] font-semibold text-white">{row.value}</span>
      </div>
    )}
  </div>
))}
```

- [ ] **Step 5: Upgrade integration tiles with monogram + status badge**

Replace the integrations grid render:

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {INTEGRATIONS.map((integ) => (
    <div key={integ.name} className="bg-white rounded-xl border border-ink-200 p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-[13px] shrink-0 ${
          integ.status === "Live" ? "bg-brand-50 text-brand-700" : "bg-amber-light text-amber-dark"
        }`} aria-hidden="true">
          {integ.name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="font-display font-bold text-[14px] text-ink-900 leading-tight">{integ.name}</p>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
            integ.status === "Live" ? "bg-brand-50 text-brand-700" : "bg-amber-light text-amber-dark"
          }`}>{integ.status}</span>
        </div>
      </div>
      <p className="text-[13px] text-ink-600 leading-relaxed">{integ.description}</p>
    </div>
  ))}
</div>
```

- [ ] **Step 6: Replace bottom CTA band with JoinCTA**

Remove the existing `<section className="bg-brand-50 py-16 border-y border-brand-100">` closing CTA section entirely and replace with:

```tsx
<JoinCTA />
```

- [ ] **Step 7: Typecheck**

```bash
cd frontend/landing && pnpm typecheck
```

Expected: zero errors.

- [ ] **Step 8: Commit**

```bash
git add frontend/landing/app/product/page.tsx
git commit -m "feat(landing/product): StatsBand, upgraded mockup panels, integration tiles, JoinCTA"
```

---

### Task 7: /about — StatsBand + remove partners stub + JoinCTA

**Files:**
- Modify: `frontend/landing/app/about/page.tsx`

- [ ] **Step 1: Add imports**

```tsx
import StatsBand from "@/components/stats/StatsBand";
import JoinCTA from "@/components/cta/JoinCTA";
```

- [ ] **Step 2: Add StatsBand after the hero section**

After the closing `</section>` of the hero (`bg-brand-900 py-24`) and before the Mission section (`py-24 bg-white`):

```tsx
</section>

<StatsBand />

{/* Mission */}
<section className="py-24 bg-white">
```

StatsBand uses the default platform stats (240+ businesses, 1.2B KES, etc.) here — these show traction alongside the mission's market context.

- [ ] **Step 3: Remove the partners stub section**

Delete the entire `{/* Partners */}` section at the bottom of the page (the `py-24 bg-surface-alt` section with "Build on AndikishaHR with our partner program" copy). It ends before the closing `</>`.

- [ ] **Step 4: Add JoinCTA at the bottom**

After the closing `</section>` of the Careers section (`py-24 bg-brand-900`), add:

```tsx
</section>

<JoinCTA />
```

- [ ] **Step 5: Typecheck**

```bash
cd frontend/landing && pnpm typecheck
```

Expected: zero errors.

- [ ] **Step 6: Commit**

```bash
git add frontend/landing/app/about/page.tsx
git commit -m "feat(landing/about): StatsBand, remove partners stub, JoinCTA"
```

---

### Task 8: /pricing — hero chips + comparison table + testimonials + JoinCTA

**Files:**
- Modify: `frontend/landing/app/pricing/page.tsx`

- [ ] **Step 1: Add imports**

```tsx
import { ArrowRight, Check, X } from "lucide-react";
import JoinCTA from "@/components/cta/JoinCTA";
```

- [ ] **Step 2: Add trial and no-credit-card chips to the hero**

Replace the hero section:

```tsx
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
```

- [ ] **Step 3: Add comparison table between hero and PricingTable**

After the hero section closing `</section>` and before `<PricingTable />`:

```tsx
{/* Comparison table */}
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
            <th className="text-left py-3 pr-6 font-semibold text-ink-500 w-[45%]">Capability</th>
            <th className="text-center py-3 px-4 font-semibold text-ink-500 w-[27%]">Spreadsheet</th>
            <th className="text-center py-3 px-4 font-bold text-brand-900 w-[27%]">AndikishaHR</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["PAYE brackets auto-updated", false, true],
            ["NSSF & SHIF calculations", false, true],
            ["KRA filing (P10A/P9)", false, true],
            ["M-Pesa salary disbursement", false, true],
            ["Audit trail & version history", false, true],
            ["Employee self-service payslips", false, true],
            ["Payroll run time", "3–5 hours", "< 20 minutes"],
          ].map(([cap, spreadsheet, andikisha]) => (
            <tr key={String(cap)} className="border-b border-ink-100 last:border-0">
              <td className="py-3.5 pr-6 text-ink-700 font-medium">{cap}</td>
              <td className="py-3.5 px-4 text-center">
                {typeof spreadsheet === "boolean" ? (
                  spreadsheet
                    ? <Check size={16} className="text-brand-500 mx-auto" aria-label="Yes" />
                    : <X size={16} className="text-error mx-auto" aria-label="No" />
                ) : (
                  <span className="text-ink-500">{spreadsheet}</span>
                )}
              </td>
              <td className="py-3.5 px-4 text-center">
                {typeof andikisha === "boolean" ? (
                  andikisha
                    ? <Check size={16} className="text-brand-500 mx-auto" aria-label="Yes" />
                    : <X size={16} className="text-error mx-auto" aria-label="No" />
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
```

- [ ] **Step 4: Add testimonial quotes after PricingTable and before FaqList**

```tsx
{/* Testimonials */}
<section className="py-20 bg-white border-b border-ink-100">
  <Container>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[900px] mx-auto">
      {[
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
      ].map(({ quote, name, role }) => (
        <div key={name} className="bg-surface-alt border border-ink-200 rounded-2xl p-7">
          <p className="text-amber text-[28px] leading-none mb-3 font-serif">&ldquo;</p>
          <p className="text-[15px] text-ink-700 leading-[1.8] mb-5">{quote}</p>
          <div>
            <p className="text-[14px] font-semibold text-ink-900">{name}</p>
            <p className="text-[13px] text-ink-500">{role}</p>
          </div>
        </div>
      ))}
    </div>
  </Container>
</section>
```

- [ ] **Step 5: Replace the existing bottom CTA section with JoinCTA**

Remove the existing `<section className="bg-brand-50 py-16 border-t border-brand-100">` section at the end and replace with:

```tsx
<JoinCTA />
```

- [ ] **Step 6: Typecheck**

```bash
cd frontend/landing && pnpm typecheck
```

Expected: zero errors.

- [ ] **Step 7: Commit**

```bash
git add frontend/landing/app/pricing/page.tsx
git commit -m "feat(landing/pricing): hero chips, comparison table, testimonials, JoinCTA"
```

---

### Wave 2 Checkpoint — verify all three pages visually

- [ ] **Step 1: Start dev server (if not running)**

```bash
cd frontend/landing && pnpm dev
```

- [ ] **Step 2: Check /product**

Open http://localhost:3002/product. Verify:
- StatsBand visible below hero (9 modules / 6 obligations / <1d setup / 100% accuracy)
- Feature section mockup panels have colored dots (green/amber) next to values
- Integration grid shows monogram tiles (e.g. "KR" for KRA iTax) with Live/Coming badge
- JoinCTA section at bottom (replaces old green CTA band)

- [ ] **Step 3: Check /about**

Open http://localhost:3002/about. Verify:
- StatsBand appears below hero with platform stats (240+, 1.2B, etc.)
- Mission section stat grid still present (1.56M, 85%, etc.)
- No partners stub section at bottom
- JoinCTA at bottom

- [ ] **Step 4: Check /pricing**

Open http://localhost:3002/pricing. Verify:
- Two chips in hero ("30-day free trial", "No credit card required")
- Comparison table appears between hero and PricingTable
- Two testimonial quote cards below PricingTable
- JoinCTA at bottom (no old green CTA band)

---

## Wave 3 — New Builds

### Task 9: Create ReadingProgress and ShareBar components

These must exist before Task 11 (blog article page) is modified.

**Files:**
- Create: `frontend/landing/components/blog/ReadingProgress.tsx`
- Create: `frontend/landing/components/blog/ShareBar.tsx`

- [ ] **Step 1: Create ReadingProgress client component**

```tsx
// frontend/landing/components/blog/ReadingProgress.tsx
"use client";

import { useEffect, useState } from "react";

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div
      role="progressbar"
      aria-label="Reading progress"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      className="fixed top-0 left-0 z-50 h-[3px] bg-amber transition-[width] duration-100 ease-linear"
      style={{ width: `${progress}%` }}
    />
  );
}
```

- [ ] **Step 2: Create ShareBar client component**

```tsx
// frontend/landing/components/blog/ShareBar.tsx
"use client";

import { useEffect, useState } from "react";
import { Linkedin, Twitter } from "lucide-react";

interface Props {
  title: string;
}

export default function ShareBar({ title }: Props) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const encode = (s: string) => encodeURIComponent(s);

  const links = [
    {
      label: "Share on LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encode(url)}`,
      icon: <Linkedin size={15} aria-hidden="true" />,
    },
    {
      label: "Share on Twitter / X",
      href: `https://twitter.com/intent/tweet?url=${encode(url)}&text=${encode(title)}`,
      icon: <Twitter size={15} aria-hidden="true" />,
    },
    {
      label: "Share on WhatsApp",
      href: `https://wa.me/?text=${encode(title + " " + url)}`,
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex items-center gap-3 py-5 border-t border-b border-ink-200 my-8">
      <span className="text-[13px] font-semibold text-ink-400 mr-1">Share</span>
      {links.map(({ label, href, icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="w-9 h-9 rounded-lg bg-surface-alt border border-ink-200 flex items-center justify-center text-ink-600 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2"
        >
          {icon}
        </a>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Typecheck both new components**

```bash
cd frontend/landing && pnpm typecheck
```

Expected: zero errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/landing/components/blog/ReadingProgress.tsx frontend/landing/components/blog/ShareBar.tsx
git commit -m "feat(landing/blog): ReadingProgress and ShareBar components"
```

---

### Task 10: /partners — full new page

**Files:**
- Modify: `frontend/landing/app/partners/page.tsx` (full rewrite)

- [ ] **Step 1: Rewrite partners/page.tsx**

Replace the entire file:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Calculator, Users, Wrench, Percent, Megaphone, Zap, HeadphonesIcon, ArrowRight } from "lucide-react";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";

export const metadata: Metadata = {
  title: "Partners — AndikishaHR",
  description:
    "Join the AndikishaHR partner programme. Revenue share, co-marketing, and early compliance feature access for accountants, HR consultants, and payroll bureaus.",
};

const PARTNER_TYPES = [
  {
    icon: <Calculator size={24} aria-hidden="true" />,
    title: "Accountants & Payroll Bureaus",
    description: "CPA firms and payroll bureaus managing statutory compliance for multiple Kenyan clients.",
    qualifies: ["Handle payroll for 3+ client companies", "File PAYE, NSSF, or SHIF on behalf of clients", "Based in Kenya or East Africa"],
  },
  {
    icon: <Users size={24} aria-hidden="true" />,
    title: "HR Consultancies",
    description: "HR advisory firms helping Kenyan SMEs build people operations from the ground up.",
    qualifies: ["Advise on HR policy and systems", "Implement or recommend HR software to clients", "Work with growing SMEs (10–500 employees)"],
  },
  {
    icon: <Wrench size={24} aria-hidden="true" />,
    title: "Implementation Partners",
    description: "Technology consultants and ERP integrators who set up business software for East African companies.",
    qualifies: ["Implement ERP or business software", "Serve clients who need payroll integration", "Technical capability to configure or integrate APIs"],
  },
];

const BENEFITS = [
  {
    icon: <Percent size={20} aria-hidden="true" />,
    title: "Revenue share",
    description: "Earn a percentage of first-year ARR for every client you refer that converts to a paid plan.",
  },
  {
    icon: <Megaphone size={20} aria-hidden="true" />,
    title: "Co-marketing",
    description: "Joint case studies, co-branded materials, and a listing in our partner directory on andikishahr.com.",
  },
  {
    icon: <Zap size={20} aria-hidden="true" />,
    title: "Early access",
    description: "Beta access to new compliance features before general release — test before your clients see it.",
  },
  {
    icon: <HeadphonesIcon size={20} aria-hidden="true" />,
    title: "Dedicated support",
    description: "A named account lead and priority SLA for support tickets raised on behalf of your clients.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Apply",
    description: "Fill in the contact form with subject line "Partner enquiry". Tell us about your firm and the clients you serve.",
  },
  {
    num: "02",
    title: "Discovery call",
    description: "30-minute call with our partnerships team to confirm fit, discuss your client base, and walk through the programme terms.",
  },
  {
    num: "03",
    title: "Onboard",
    description: "Partner agreement signed, portal access granted, first co-marketing asset briefed. You're live within a week.",
  },
];

export default function PartnersPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-brand-900 py-28">
        <Container>
          <div className="max-w-[680px]">
            <Eyebrow light className="mb-5">Partner Programme</Eyebrow>
            <h1
              className="font-display font-bold text-white mb-6 leading-[1.03]"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", letterSpacing: "-0.025em" }}
            >
              Build a practice around the future of HR in East Africa.
            </h1>
            <p className="text-[18px] text-brand-100/70 leading-[1.7] max-w-[520px] mb-10">
              We work with accountants, HR consultants, and payroll bureaus who serve Kenyan SMEs.
              Partners get revenue share, co-marketing, and early compliance feature access.
            </p>
            <Link
              href="/contact?subject=partner"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-amber hover:bg-amber-dark text-ink-900 font-bold text-[15px] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2"
            >
              Enquire about partnering <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </Container>
      </section>

      {/* Who qualifies */}
      <section className="py-24 bg-white">
        <Container>
          <div className="text-center mb-14">
            <Eyebrow className="mb-4">Who qualifies</Eyebrow>
            <h2
              className="font-display font-bold text-ink-900 max-w-[520px] mx-auto"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", lineHeight: "1.1", letterSpacing: "-0.02em" }}
            >
              Three types of partners we work with.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PARTNER_TYPES.map(({ icon, title, description, qualifies }) => (
              <div key={title} className="bg-surface-alt border border-ink-200 rounded-2xl p-7">
                <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center text-brand-700 mb-5">
                  {icon}
                </div>
                <h3 className="font-display font-bold text-[18px] text-ink-900 mb-3">{title}</h3>
                <p className="text-[14px] text-ink-600 leading-relaxed mb-5">{description}</p>
                <p className="text-[12px] font-bold uppercase tracking-wider text-ink-400 mb-3">You qualify if you…</p>
                <ul className="flex flex-col gap-2">
                  {qualifies.map((q) => (
                    <li key={q} className="flex items-start gap-2 text-[13px] text-ink-700">
                      <div className="w-[5px] h-[5px] rounded-full bg-amber mt-1.5 shrink-0" aria-hidden="true" />
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* What you get */}
      <section className="py-24 bg-surface-alt border-y border-ink-200">
        <Container>
          <div className="text-center mb-14">
            <Eyebrow className="mb-4">Benefits</Eyebrow>
            <h2
              className="font-display font-bold text-ink-900 max-w-[480px] mx-auto"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", lineHeight: "1.1", letterSpacing: "-0.02em" }}
            >
              What partners get.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-[800px] mx-auto">
            {BENEFITS.map(({ icon, title, description }) => (
              <div key={title} className="bg-white border border-ink-200 rounded-2xl p-7">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center text-brand-700 shrink-0">
                    {icon}
                  </div>
                  <h3 className="font-display font-bold text-[17px] text-ink-900">{title}</h3>
                </div>
                <p className="text-[14px] text-ink-600 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section className="py-24 bg-white">
        <Container>
          <div className="text-center mb-14">
            <Eyebrow className="mb-4">Process</Eyebrow>
            <h2
              className="font-display font-bold text-ink-900 max-w-[400px] mx-auto"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", lineHeight: "1.1", letterSpacing: "-0.02em" }}
            >
              How to join.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[900px] mx-auto">
            {STEPS.map(({ num, title, description }) => (
              <div key={num}>
                <p className="font-mono text-[36px] font-bold text-brand-100 mb-3">{num}</p>
                <h3 className="font-display font-bold text-[20px] text-ink-900 mb-3">{title}</h3>
                <p className="text-[15px] text-ink-600 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Apply CTA */}
      <section className="bg-brand-900 py-20">
        <Container>
          <div className="max-w-[600px]">
            <Eyebrow light className="mb-5">Apply now</Eyebrow>
            <h2
              className="font-display font-bold text-white mb-5"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", lineHeight: "1.1", letterSpacing: "-0.02em" }}
            >
              Programme is invite-only while we onboard our first 50 customers.
            </h2>
            <p className="text-[16px] text-brand-100/65 leading-[1.7] mb-8">
              We are designing the programme with our early partners. If you serve Kenyan SMEs and
              want to add AndikishaHR to your offering, get in touch now.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/contact?subject=partner"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-amber hover:bg-amber-dark text-ink-900 font-bold text-[14px] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2"
              >
                Enquire via contact form <ArrowRight size={14} aria-hidden="true" />
              </Link>
              <a
                href="mailto:partners@andikishahr.com"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/20 text-white/80 hover:bg-white/10 font-medium text-[14px] transition-colors duration-200"
              >
                partners@andikishahr.com
              </a>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd frontend/landing && pnpm typecheck
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/landing/app/partners/page.tsx
git commit -m "feat(landing/partners): full partner programme page — hero, who qualifies, benefits, how it works, apply CTA"
```

---

### Task 11: /blog listing — PostCard upgrade + amber active pill + swap newsletter

**Files:**
- Modify: `frontend/landing/app/blog/BlogClient.tsx`

- [ ] **Step 1: Add NewsletterSection import**

Add at the top of the file:

```tsx
import NewsletterSection from "@/components/layout/NewsletterSection";
```

- [ ] **Step 2: Upgrade the PostCard image area**

Inside the `PostCard` function, replace the existing image placeholder div:

```tsx
// Replace this:
<div className={`bg-brand-50 rounded-xl flex items-center justify-center shrink-0 ${featured ? "lg:w-64 h-44" : "h-44"}`}>
  <div className="text-center px-6">
    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 block mb-1">
      {post.category}
    </span>
    <span className="text-[13px] font-mono text-brand-900 font-medium">{post.date}</span>
  </div>
</div>

// With this:
<div className={`bg-gradient-to-br from-brand-900 to-brand-800 rounded-xl flex flex-col items-start justify-between p-5 shrink-0 ${featured ? "lg:w-64 h-44" : "h-36"}`}>
  <span className="inline-block px-2.5 py-1 rounded-full bg-amber/20 text-amber text-[11px] font-bold uppercase tracking-wider">
    {post.category}
  </span>
  <div>
    <p className="font-display font-bold text-white text-[13px] leading-snug line-clamp-2">
      {post.title.slice(0, 55)}
    </p>
    <p className="text-[11px] text-white/40 font-mono mt-1">{post.date}</p>
  </div>
</div>
```

- [ ] **Step 3: Update active category pill to amber**

In the `BlogClient` function, find the category filter button className and change the active state from `bg-brand-900 text-white` to amber:

```tsx
className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2 ${
  activeCategory === cat
    ? "bg-amber text-ink-900"
    : "bg-white border border-ink-200 text-ink-600 hover:border-brand-700 hover:text-brand-900"
}`}
```

- [ ] **Step 4: Replace inline newsletter section with NewsletterSection**

Remove the entire `{/* Newsletter strip */}` section (from `<section className="py-16 bg-brand-50 border-t border-brand-100">` to its closing `</section>`) and replace with:

```tsx
<NewsletterSection />
```

- [ ] **Step 5: Typecheck**

```bash
cd frontend/landing && pnpm typecheck
```

Expected: zero errors.

- [ ] **Step 6: Commit**

```bash
git add frontend/landing/app/blog/BlogClient.tsx
git commit -m "feat(landing/blog): upgrade PostCard, amber active pill, swap to shared NewsletterSection"
```

---

### Task 12: /blog/[slug] — ReadingProgress + ShareBar + category related posts + NewsletterSection

**Files:**
- Modify: `frontend/landing/app/blog/[slug]/page.tsx`

- [ ] **Step 1: Add imports**

```tsx
import ReadingProgress from "@/components/blog/ReadingProgress";
import ShareBar from "@/components/blog/ShareBar";
import NewsletterSection from "@/components/layout/NewsletterSection";
```

- [ ] **Step 2: Fix related posts to filter by category first**

Replace the `related` constant definition after `const post = getPost(slug)`:

```tsx
const allPosts = getAllPosts();
const sameCategory = allPosts.filter((p) => p.slug !== slug && p.category === post.category).slice(0, 3);
const fillCount = 3 - sameCategory.length;
const otherPosts = fillCount > 0
  ? allPosts.filter((p) => p.slug !== slug && p.category !== post.category).slice(0, fillCount)
  : [];
const related = [...sameCategory, ...otherPosts];
```

- [ ] **Step 3: Add ReadingProgress as first element in the fragment**

```tsx
return (
  <>
    <ReadingProgress />

    {/* Hero */}
    <section className="bg-brand-900 py-16 ...">
```

- [ ] **Step 4: Add ShareBar inside the article body after the prose block**

Inside the `<article>` element, after the closing `</div>` of the prose block and before the inline CTA div:

```tsx
<div className="prose prose-lg prose-neutral max-w-none">
  <MDXRemote source={post.content} />
</div>

<ShareBar title={post.title} />

{/* Inline CTA */}
<div className="mt-4 bg-brand-50 border border-brand-100 rounded-2xl p-7">
```

- [ ] **Step 5: Add NewsletterSection between article and related posts**

After the closing `</article>` tag and before the `{related.length > 0 && (` block:

```tsx
</article>

<NewsletterSection />

{related.length > 0 && (
```

- [ ] **Step 6: Update related posts heading to show category**

```tsx
<h2 className="font-display font-bold text-[22px] text-ink-900 mb-8">
  More from {post.category}
</h2>
```

- [ ] **Step 7: Typecheck**

```bash
cd frontend/landing && pnpm typecheck
```

Expected: zero errors.

- [ ] **Step 8: Commit**

```bash
git add frontend/landing/app/blog/[slug]/page.tsx
git commit -m "feat(landing/blog): ReadingProgress, ShareBar, category related posts, NewsletterSection"
```

---

### Wave 3 Checkpoint — verify all pages visually

- [ ] **Step 1: Start dev server (if not running)**

```bash
cd frontend/landing && pnpm dev
```

- [ ] **Step 2: Check /partners**

Open http://localhost:3002/partners. Verify:
- Hero: dark brand-900, amber "Enquire about partnering" CTA button
- Who qualifies: 3 cards (Accountants, HR Consultancies, Implementation Partners) with icons and "You qualify if…" bullets
- Benefits: 2×2 grid (Revenue share, Co-marketing, Early access, Dedicated support)
- How it works: 3 numbered steps (01/02/03)
- Apply CTA: dark brand-900 section with two buttons (form link + email)

- [ ] **Step 3: Check /blog**

Open http://localhost:3002/blog. Verify:
- Featured post card has dark gradient background (brand-900 to brand-800) with amber category badge
- Active category pill is amber (not brand-900)
- Newsletter at bottom is the shared NewsletterSection (dark brand-900 strip)

- [ ] **Step 4: Check a blog article**

Open http://localhost:3002/blog/paye-2026-bracket-changes. Verify:
- Amber reading progress bar appears at the very top as you scroll
- Share bar (LinkedIn / Twitter / WhatsApp icons) appears below the article content
- NewsletterSection appears between the inline CTA and related posts
- Related posts heading says "More from Compliance" (or the article's category)

---

## Task 13: Update CHANGELOG.md

**Files:**
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Add new entry at the top of CHANGELOG.md**

Insert the following block immediately after the first `---` separator line (after `# Changelog` and `All notable changes...`):

```markdown
## [Unreleased] — 2026-05-08

### frontend/landing — Secondary pages full redesign

All 8 secondary pages updated to match home page visual language (Bricolage Grotesque headlines, brand-900/950 hero backgrounds, amber accents, single primary CTA, JoinCTA or NewsletterSection closing every page).

#### Wave 1 — Form pages
- `/contact`: two hero stat chips (2hr response time, Mon–Fri 8am–6pm EAT); `NewsletterSection` at bottom
- `/demo`: social proof chip in hero ("100+ companies onboarded"); `LogosRow` trust strip; `JoinCTA` at bottom
- `/early-access`: amber urgency counter ("42 of 50 spots remaining"); Lucide icons on perks (Lock/Database/UserCircle/Map/LayoutGrid); testimonial quote section

#### Wave 2 — Content pages
- `/product`: `StatsBand` with product stats (9 modules, 6 obligations, <1d setup, 100% accuracy); colored status dots on dark mockup panels; monogram integration tiles with status badge; `JoinCTA` replaces old CTA band
- `/about`: `StatsBand` (platform stats) below hero; partners stub section removed; `JoinCTA` at bottom
- `/pricing`: "30-day free trial" and "No credit card required" chips in hero; spreadsheet vs AndikishaHR comparison table; two ROI testimonial quotes; `JoinCTA` replaces old CTA band

#### Wave 3 — New builds
- `/partners`: full new page — hero, who-qualifies (3 partner types with icons), benefits grid (4 cards), 3-step how-it-works, dark apply CTA section
- `/blog`: PostCard upgraded to dark gradient header with amber category badge; active category pill changed to amber; inline newsletter replaced with shared `NewsletterSection`
- `/blog/[slug]`: `ReadingProgress` bar (amber, fixed top); `ShareBar` (LinkedIn/Twitter/WhatsApp); related posts now filtered by category with recency fallback; `NewsletterSection` between article CTA and related posts; related posts heading shows category name

#### Shared component update
- `StatsBand`: extended to accept optional `stats` prop; existing home page stats become the default — no breaking change
- New components: `components/blog/ReadingProgress.tsx`, `components/blog/ShareBar.tsx`
```

- [ ] **Step 2: Commit**

```bash
git add CHANGELOG.md
git commit -m "docs(changelog): landing secondary pages full redesign — 2026-05-08"
```
