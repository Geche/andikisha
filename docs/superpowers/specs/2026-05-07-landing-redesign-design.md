# AndikishaHR Landing Page — Redesign Spec

**Date:** 2026-05-07
**Status:** Approved
**Author:** Lawrence Chege

---

## 1. Overview

A full redesign of the AndikishaHR landing page at `frontend/landing/`. The new design follows a centered-hero + full-width product mockup layout (Untitled UI reference) adapted to the AndikishaHR brand. The goal is enterprise and investor-ready: clean, authoritative, product-forward, with real KES data throughout.

### Goals

- Replace the current hero (left text / right payslip card) with a centered headline and a full browser-frame product dashboard mockup below it.
- Replace repetitive section layouts with varied rhythm: centered hero → logos strip → alternating split features → feature grid → stats → CTA → newsletter → footer.
- Single CTA throughout: **"Schedule a demo"** (amber primary). No "Book a demo", no "Start free trial".
- Use the real AndikishaHR SVG logo everywhere — never a placeholder box.
- Lucide-style stroke icons (24×24, stroke-width 2) for all UI icons.
- Keep the live payroll calculator, product walkthrough, compliance timeline, trust section, and FAQ — redesigned to match the new language.

### What is removed

| Removed | Reason |
|---|---|
| Announcement/Finance Act strip | Clutters hero; dates quickly |
| "Book a demo" button | Replaced by "Schedule a demo" |
| "Start free trial" button | Single CTA policy |
| Proof strip (PAYE badges row) | Redundant — compliance covered in feature grid |
| Numbers band on green | Replaced by white stats band |
| Pricing section | Removed per product decision |
| Personas section | Replaced by feature sections |

---

## 2. Brand System (locked)

### Colors

| Token | Hex | Usage |
|---|---|---|
| `brand-900` | `#0B3D2E` | Navbar CTA hover bg, newsletter section bg, dark feature cards |
| `brand-950` | `#071E13` | Footer background |
| `brand-800` | `#0F5040` | Hover states |
| `brand-700` | `#166A50` | Eyebrow labels |
| `brand-500` | `#27A870` | Success badges, chart lines, progress fills |
| `brand-100` | `#D1F5E6` | Badge fills, check icon backgrounds |
| `brand-50` | `#E8F5F0` | Icon backgrounds, nav item hover |
| `amber` | `#E8A020` | **All CTAs** — primary buttons, amber accent text, logo accent shape |
| `amber-dark` | `#C98510` | CTA hover state |
| `amber-light` | `#FEF3DC` | Warning badge fills |
| `surface` | `#FFFFFF` | Page background, cards |
| `surface-alt` | `#F8F7F4` | Alternating section backgrounds, app sidebar bg |
| `ink-900` | `#02110C` | Headlines, primary body text, logo wordmark |
| `ink-700` | `#374151` | Nav links |
| `ink-600` | `#4B5563` | Body copy |
| `ink-400` | `#9CA3AF` | Meta text, placeholders |
| `ink-200` | `#E5E7EB` | Borders, dividers |
| `ink-100` | `#F3F4F6` | Table row separators |

### Typography

| Role | Font | Weight | Size |
|---|---|---|---|
| Display headlines (H1, H2) | Bricolage Grotesque | 900 | clamp(38px, 5.5vw, 62px) / clamp(28px, 3.2vw, 42px) |
| Body / UI | Montserrat | 400–700 | 13–18px |
| Numbers / KES amounts | DM Mono | 400–500 | tabular-nums feature enabled |

**Note:** Bricolage Grotesque replaces Montserrat for display headlines. Add via `next/font/google`. Montserrat remains for all body, nav, and UI text. DM Mono for all KES amounts, statutory rates, and monospaced data.

### Logo

- Source: `frontend/packages/ui/src/components/LogoFull.tsx` — inline SVG, viewBox `0 0 1287.788 170.909`
- Variants: `default` (wordmark `#02110C`, mark `#0B3D2E`, accent `#E8A020`) for light backgrounds; `white-mark` (wordmark `white`, mark colors unchanged) for dark backgrounds
- Nav height: `h-7` (28px). Footer height: `h-[22px]`. App sidebar: `h-[18px]`.
- Never substitute with a placeholder box or text-only version.

### Icons

- Library: Lucide React (`lucide-react`, already in workspace)
- Style: stroke, 24×24, stroke-width 2 (stroke-width 2.5 on small CTAs ≤16px)
- Color: `currentColor` — inherits from parent text color
- Icon backgrounds: `40×40` rounded-10 `bg-brand-50` for feature card icons

---

## 3. Page Structure

Sections in render order:

```
01  Navbar                (sticky, transparent → white on scroll)
02  Hero                  (centered, browser mockup below)
03  Logos row             (trusted-by strip)
04  Feature 1             (payroll run — text left, UI right)
05  Feature 2             (M-Pesa — reversed, alt bg, dark card)
06  Feature grid          (compliance — centered header, 3-col grid)
07  Product walkthrough   (sticky phone mockup, 4 steps)
08  Compliance timeline   (white, 5-point horizontal)
09  Stats band            (4 numbers, white bg)
10  Trust & Security      (brand-950 dark, checklist)
11  Join / Founding CTA   (text left, feature checklist right)
12  Newsletter            (brand-900 full-width bar)
13  FAQ                   (surface-alt, 2-column grid)
14  Footer                (brand-950, 5 columns)
```

---

## 4. Section Specifications

### 4.1 Navbar

- **Sticky** at top. Transparent over hero; switches to `bg-white border-b border-ink-200 shadow-[0_1px_0_rgba(0,0,0,0.04)]` once user scrolls past hero sentinel (IntersectionObserver, not scroll listener).
- **Logo:** `<LogoFull variant="white-mark" />` when transparent; `<LogoFull variant="default" />` when scrolled.
- **Nav links:** Product (dropdown chevron) · Compliance (dropdown chevron) · Pricing · Resources (dropdown chevron) · About. Font: 14px Montserrat medium, `ink-700`. Hover: `ink-900`.
- **Right CTAs:** "Log in" (text link, `ink-700`) + "Schedule a demo" (`bg-amber hover:bg-amber-dark`, `ink-900`, 14px semibold, rounded-lg, px-5 py-2.5).
- **No** "Book a demo" button anywhere on the page.
- **Mobile:** Hamburger → full-screen sheet (`bg-brand-950/98`). Same links + "Schedule a demo" amber button at bottom. No secondary button.
- **Announcement strip:** None.

### 4.2 Hero

- **Background:** `bg-white`. Full-page width.
- **Layout:** Centered, `max-width: 760px` for text block, `max-width: 960px` for mockup.
- **Pill:** `border border-ink-200 rounded-full`, inline-flex. Badge: `bg-brand-50 text-brand-800` "New". Text: "Payroll calculator — try live KES rates". Chevron-right icon `text-ink-400`. Links to `#calculator` anchor.
- **H1:** `font-display font-black`, `clamp(38px, 5.5vw, 62px)`, `leading-[1.05]`, `tracking-[-0.025em]`, `text-ink-900`. Text: "Kenyan HR and payroll,\ncalculated correctly."
- **Subheadline:** 18px Montserrat, `text-ink-600`, `leading-[1.7]`, `max-w-[500px]` centered. Text: "Statutory deductions to the cent. Payslips on the phones your team already uses. M-Pesa and bank in one approved batch."
- **CTA:** Single button — "Schedule a demo" with chevron-right icon. `bg-amber hover:bg-amber-dark text-ink-900 font-bold text-[15px] px-7 py-3.5 rounded-lg`. No secondary button.
- **Browser mockup:** `max-width: 960px`, centered, `border-radius: 14px 14px 0 0`. Dark chrome bar (`#2D2D2D`) with traffic-light dots + monospace URL bar showing `app.andikishahr.com/payroll`. App UI inside shows full payroll dashboard (see §4.2.1). Bottom 110px fades out via `linear-gradient(to bottom, transparent, white)`.
- **Padding:** `pt-20 pb-0` (mockup clips into logo strip below).

#### 4.2.1 Hero Browser Mockup Content

Two-column app layout: sidebar (210px) + main content.

**Sidebar:**
- `LogoFull` at 18px height
- Nav items with Lucide icons: Dashboard (active, `bg-brand-50 text-brand-900 border-r-[2.5px] border-amber`), Payroll, Employees, Leave, Attendance, Compliance, Reports
- Active item icon opacity 1; inactive 0.6

**Main content:**
- Topbar: "November 2025 Payroll" title + "Export" outline btn + "Approve run →" amber btn
- 4 metric cards: Gross Payroll `4.8M` (↑3.2%), Total Deductions `1.2M`, Net Payroll `3.6M`, Exceptions `3` (amber)
- 2 table cards side by side:
  - Employee table: Sarah M. 67,316 Ready · David O. 52,400 Ready · Aisha K. 41,850 Review · Daniel N. 38,200 Ready
  - Statutory filings: P10A KES 568,000 Filed · NSSF KES 204,960 Filed · SHIF KES 132,330 Filed · P9 annual Scheduled

### 4.3 Logos Row

- `bg-white border-t border-ink-100 border-b border-ink-100`. Padding: `py-9 px-14`.
- Label: "Trusted by businesses across Kenya and East Africa". 13px `text-ink-400`.
- 6 placeholder companies in a centered flex row, gap-52: Sokoni Group · Mara Holdings · Tatu Foods · Barabara Logistics · Rift Valley Farms · Nairobi Digital.
- Each: 22×22 rounded-6 `bg-ink-200` monogram box + 14px font-bold `text-ink-400`. Opacity 55%, hover 80%.
- **TODO:** Replace with real customer SVG logos post-launch.

### 4.4 Feature 1 — Payroll Run

- **Background:** `bg-white`. Padding: `py-[88px]`.
- **Layout:** 2-col grid (`5fr 6fr`), gap-72, items-center.
- **Left:** Eyebrow "Payroll automation" → H2 "A seamless payroll run for your entire team." → body (max-w-520) → 3 bullet items with `brand-900` dots, title, body, "Learn more →" link.
  - Bullet 1: "Pre-filled from your HR register" — attendance, leave, salary changes already applied.
  - Bullet 2: "Exception report surfaces every anomaly" — missing bank accounts, unapproved changes.
  - Bullet 3: "One click. M-Pesa and bank together." — Daraja API + bank transfer simultaneously.
- **Right:** `ui-card` (white, `border-ink-200`, `rounded-2xl`, `shadow-[0_4px_24px_rgba(0,0,0,.05)]`). Header: "November 2025 · Payroll run" + "48 employees" green badge. Body: 2-col gross/net metric tiles, then 4-row employee table, then amber "Approve payroll run →" button.

### 4.5 Feature 2 — M-Pesa Disbursement

- **Background:** `bg-surface-alt`. Padding: `py-[88px]`.
- **Layout:** 2-col grid reversed (`6fr 5fr`), gap-72, items-center.
- **Left (screen side):** Dark card `bg-brand-900 border-brand-800 rounded-2xl`. Header: "November batch disbursement" + green "Approved" badge. Body: 3 progress rows (M-Pesa 34 employees · Equity Bank 9 · KCB 5), each with label, KES amount, progress bar (`bg-amber` or `bg-brand-500`), status pill.
- **Right (text side):** Eyebrow "Disbursement" → H2 "One pay run. M-Pesa and bank, together." → body → 2 bullets: "Split disbursement in one approval" + "Real-time delivery confirmation". No "Learn more" link on this section.

### 4.6 Feature Grid — Compliance

- **Background:** `bg-white`. Padding: `py-[88px]`.
- **Top:** Centered eyebrow + H2 "Every Kenyan statutory rule, in writing and in code." + sub (max-w-560 centered).
- **Grid:** 3-column (`1fr 1.6fr 1fr`), gap-16, margin-top-52. Centre column spans 2 rows.
- **Left column (2 cards):**
  - Card 1: `FileText` icon → "Automatic statutory filings" → body + "Learn more →"
  - Card 2: `Smartphone` icon → "Mobile-first for every employee" → body + "Learn more →"
- **Centre card (tall):** "Payroll cost over time" → body → mini SVG line chart (gross = `brand-900` solid, net = `amber` dashed) with month labels Jun–Nov → legend.
- **Right column (2 cards):**
  - Card 1: `CreditCard` icon → "M-Pesa and bank in one run" → body + "Learn more →"
  - Card 2: `Shield` icon → "Data hosted in Kenya" → body + "Learn more →"
- Card style: `bg-white border-ink-200 rounded-2xl p-6`. Icon bg: `bg-brand-50 rounded-10`.

### 4.7 Product Walkthrough

- **Background:** `bg-surface-alt`. Padding: `py-[88px]`.
- **Structure:** Eyebrow "Product walkthrough" + H2 "The full loop — gross pay to filed return." + 2-col grid (steps left, phone right sticky).
- **Steps:** 4 items, `border-l-2`. Inactive: `border-ink-200 text-ink-400`. Active: `border-amber bg-white rounded-r-lg`. Step number in eyebrow style, headline 16px semibold, body text 14px `ink-600` expands on active.
  - 01 "Twenty minutes, not three days."
  - 02 "Plain language. Tap any line for an explanation."
  - 03 "Decisions in seconds."
  - 04 "P9, P10A, NSSF return. Done."
- **Phone mockup:** CSS-drawn frame, `bg-[#111]`, `border-2 border-[#222]`, `rounded-[36px]`. Inner screen `bg-white rounded-[24px]`. Dark green header bar + content rows per step. Sticky at `top-[100px]` on desktop.
- **Behaviour:** Clicking a step updates the phone screen. `useState(0)` client component.

### 4.8 Compliance Timeline

- **Background:** `bg-white`. Padding: `py-[88px]`.
- **Top:** 2-col (`5fr 6fr`), gap-48. Left: eyebrow + H2 "When the rules change, we ship the same day." Right: body paragraph explaining legislative tracking.
- **Timeline:** 5-item horizontal row. `border-t-2 border-ink-200`, `padding-top-24`. Each item: positioned `brand-900` dot (8px) sitting on the border line, eyebrow-style date in `brand-700`, bold title `ink-900`, description `ink-600` 11px.
  - Oct 2024 · SHIF transition from NHIF · 2.75% rate, shipped same day
  - Mar 2024 · Housing Levy 1.5% · Employer match applied automatically
  - Feb 2024 · NSSF Tier II uplift · New contribution tiers, live on effective date
  - Sep 2024 · Finance Bill 2024 · PAYE band amendments
  - Jan 2024 · eTIMS rollout · Invoicing compliance

### 4.9 Stats Band

- **Background:** `bg-white border-t border-ink-100 border-b border-ink-100`. Padding: `py-16`.
- **Layout:** 4-column grid, max-width 900px centered.
- **Each stat:** `text-center`, border-right `border-ink-100` (last: none).
  - `clamp(40px, 4vw, 54px)`, `font-black`, `tracking-[-0.03em]`, `ink-900`. Suffix in `amber`.
  - Label: 14px `ink-600`.
- Values: `240+` Businesses on the platform · `1.2B` KES processed monthly · `100%` On-time statutory filings · `<20m` Average payroll run
- **Note:** Mark these with `{/* TODO: replace with real metrics post-launch */}` comments.

### 4.10 Trust & Security

- **Background:** `bg-brand-950`. Padding: `py-22`.
- **Layout:** 2-col grid equal, gap-0. Border between columns: `border-l border-white/[0.06]`.
- **Left:** Eyebrow (`brand-500`) "Security & compliance" → H2 white "Built to enterprise standard." → 2 body paragraphs: tenant isolation at PostgreSQL schema level; audit log retention 7 years (KRA requirement), AES-256 at rest, TLS 1.3 in transit.
- **Right:** 8-row checklist. Each row: `border-b border-white/[0.06]`, 6px amber dot, item name `white/75`, value `font-mono text-amber` (Yes items) or `white/30` (In audit / In roadmap items).
  - KDPA registered · Yes
  - GDPR-aligned data handling · Yes
  - SOC 2 Type 1 · In audit
  - ISO 27001 · In roadmap
  - Encryption at rest · AES-256
  - Encryption in transit · TLS 1.3
  - Audit log retention · 7 years
  - Data residency · Kenya

### 4.11 Join / Founding CTA

- **Background:** `bg-white`. Padding: `py-[88px]`.
- **Layout:** 2-col grid (`1fr 1fr`), gap-56, items-center.
- **Left:** H2 "Join 240+ businesses growing with AndikishaHR." → sub (founding offer, 30-day trial, no CC required) → single CTA: "Schedule a demo →" amber primary button.
- **Right:** `bg-surface-alt border-ink-200 rounded-2xl p-7`. Title "Everything you need to run payroll" + sub "Included on every plan". Then 6 feature rows, each: 20px `bg-brand-100` circle check icon (`brand-700`) + 13px `ink-700` text.
  - PAYE, NSSF, SHIF, Housing Levy — calculated correctly
  - M-Pesa and bank disbursement in one run
  - P10A, NSSF, SHIF filings — auto after approval
  - Employee payslips via SMS or WhatsApp
  - KRA P9 annual returns at year-end
  - Data hosted in Kenya — KDPA compliant

### 4.12 Newsletter

- **Background:** `bg-brand-900`. Padding: `py-12 px-14`.
- **Layout:** flex, `justify-between`, `items-center`.
- **Left:** H3 22px white "Stay ahead of compliance changes." + sub 14px `white/45`.
- **Right:** Email input (`bg-white/[0.08] border border-white/15 text-white placeholder:white/30 rounded-lg`) + "Subscribe" amber button. Input min-width 280px.

### 4.13 FAQ

- **Background:** `bg-surface-alt`. Padding: `py-[88px]`.
- **Top:** Eyebrow + H2 "Everything buyers actually ask."
- **Grid:** 2-column, gap-0. Odd items: `border-r border-ink-200 pr-8`. Even items: `pl-8`. All: `border-b border-ink-200 py-4`.
- **Item:** `<details>` element. `<summary>`: question text 14px `font-bold ink-900` + chevron-right icon `text-ink-400` (rotates on open). Body: 13px `ink-600`, `leading-[1.6]`, `mt-2`.
- 8 questions (see §3 of original brief for full list).

### 4.14 Footer

- **Background:** `bg-brand-950`. Padding: `pt-16 pb-8`.
- **Grid:** `2.2fr 1fr 1fr 1fr 1fr`, gap-40, max-width 1120px.
- **Brand column:** `LogoFull variant="white-mark"` at 22px height + tagline `white/40` + address `white/25`.
- **Link columns:** Product · Company · Resources · Legal. Column headers: 11px uppercase `white/35`. Links: 13px `white/50` hover `white/85`.
- **Bottom bar:** border-top `white/[0.07]`, copyright `white/25`, social links text-only (LinkedIn · X (Twitter) · YouTube) `white/30`.

---

## 5. Components — File Map

All files live in `frontend/landing/`.

### New components (create)

```
components/
  hero/
    HeroBrowserMockup.tsx       # Full browser frame with app UI inside
  logos/
    LogosRow.tsx                # Trusted-by strip
  features/
    FeaturePayrollRun.tsx       # Feature 1: text + UI card
    FeatureDisbursement.tsx     # Feature 2: reversed, dark card
    FeatureComplianceGrid.tsx   # Feature 3: 3-col grid + chart
  compliance/
    ComplianceTimeline.tsx      # Renamed from ComplianceProofStrip — horizontal 5-point timeline
  stats/
    StatsBand.tsx               # 4-number band
  cta/
    JoinCTA.tsx                 # Left text + right feature checklist (replaces FinalCTABanner)
  layout/
    NewsletterSection.tsx       # brand-900 email subscribe bar (wraps existing NewsletterForm)
```

### Modified components (update in-place)

```
components/
  layout/
    Navbar.tsx                  # Single "Schedule a demo" CTA, logo variant logic kept
    Footer.tsx                  # Real logo, brand-950 bg confirmed
  hero/
    Hero.tsx                    # Centered layout, pill, H1, sub, single CTA, <HeroBrowserMockup />
  walkthrough/
    ProductWalkthrough.tsx      # Keep logic, update visual styles to match new design language
  compliance/
    ComplianceProofStrip.tsx    # Renamed → ComplianceTimeline.tsx, full rewrite (horizontal 5-point)
  trust/
    TrustSection.tsx            # Fix bg to brand-950 (was #111111), keep content
  cta/
    FinalCTABanner.tsx          # Replaced by JoinCTA — delete this file, update page.tsx import
  faq/
    FaqList.tsx                 # Update to 2-column grid layout
```

### Removed components (delete)

```
components/
  social-proof/SocialProofStrip.tsx   # Replaced by LogosRow
  founding/FoundingCustomer.tsx        # Replaced by JoinCTA
  personas/Personas.tsx               # Removed entirely
  how-it-works/HowItWorks.tsx         # Removed entirely
```

### Kept as-is (no changes needed)

```
components/
  calculator/PayrollCalculator.tsx    # Keep — hero pill links to it
  ui/Container.tsx
  ui/Eyebrow.tsx
  ui/AnimatedSection.tsx
  ui/NewsletterForm.tsx               # Used in Newsletter section
```

### Page (`app/page.tsx`) — new render order

```tsx
<Hero />                    {/* §4.2 — centered, browser mockup */}
<LogosRow />                {/* §4.3 — trusted-by strip */}
<FeaturePayrollRun />       {/* §4.4 — text left, UI card right */}
<FeatureDisbursement />     {/* §4.5 — reversed, dark card, alt bg */}
<FeatureComplianceGrid />   {/* §4.6 — 3-col grid, centered header */}
<PayrollCalculator />       {/* existing — anchored at id="calculator" */}
<ProductWalkthrough />      {/* §4.7 — phone mockup, 4 steps */}
<ComplianceTimeline />      {/* §4.8 — horizontal 5-point */}
<StatsBand />               {/* §4.9 — 4 numbers */}
<TrustSection />            {/* §4.10 — brand-950 dark */}
<JoinCTA />                 {/* §4.11 — text + feature checklist */}
<NewsletterSection />       {/* §4.12 — brand-900 bar */}
<FaqList />                 {/* §4.13 — 2-column grid */}
```

---

## 6. Tailwind Config Changes

Add Bricolage Grotesque to `fontFamily.display`:

```ts
fontFamily: {
  display: ["var(--font-bricolage)", "var(--font-montserrat)", "sans-serif"],
  body: ["var(--font-montserrat)", "sans-serif"],
  mono: ["var(--font-dm-mono)", "monospace"],
},
```

Add to `app/layout.tsx`:

```ts
import { BricolageGrotesque } from "next/font/google";
const bricolage = BricolageGrotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  weight: ["600", "700", "800"],
  display: "swap",
});
```

No other Tailwind changes — all brand tokens already present and correct.

---

## 7. Content Rules

- **KES amounts:** Always `font-mono tabular-nums`. No raw `$` symbol — always `KES` prefix.
- **Employee names:** First name + last initial only (Sarah M., David O., Aisha K., Daniel N., Grace W.).
- **Stat numbers:** Marked `{/* TODO: replace with verified metrics */}` — do not invent precision.
- **Company logos:** Placeholder monograms until real logos provided — labelled "TODO: replace with real customer SVG logos post-launch."
- **Testimonials:** Not included in this redesign — placeholder section omitted until real quotes available.
- **No banned words:** "empower", "streamline", "supercharge", "leverage", "seamless", "cutting-edge", "AI-powered" (unless naming analytics service), "robust".

---

## 8. Accessibility & Performance

- All CTAs reachable by keyboard; visible `:focus-visible` ring: `outline-2 outline-amber outline-offset-2`.
- FAQ uses native `<details>`/`<summary>` — keyboard accessible by default. Do not replace with custom accordion.
- `LogoFull` SVG has `aria-label="AndikishaHR" role="img"`.
- All `next/image` for any raster images; `next/font` for all typefaces — no CDN font calls.
- `prefers-reduced-motion`: all animations wrapped in `@media (prefers-reduced-motion: no-preference)`.
- Target: Lighthouse mobile ≥90 performance, 100 accessibility, 100 SEO.

---

## 9. Out of Scope

- Pricing page (separate project)
- Product sub-pages
- Blog redesign
- Dark mode
- Animations beyond existing `AnimatedSection` fade-up utility
