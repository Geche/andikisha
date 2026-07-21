# AndikishaHR Landing Page — Build Brief for Claude Code

---

## 1. What you are building

A production-grade landing page for **AndikishaHR**, an HR and payroll platform built for modern African businesses.

The site lives in this existing monorepo at `frontend/landing/`, runs on **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, and ships through pnpm workspace. Port `3002`.

You are not starting from zero. There is already a 44-file Next.js 15 project at `frontend/landing/`. Read it first. Replace, refactor, or extend, but do not duplicate scaffolding that already exists. Use the same pnpm workspace, the same path aliases, the same tsconfig.

### The audience

HR managers, payroll officers, finance directors, and SME owners running 20 to 500 person businesses across the African continent. The buyers are accountable for statutory deductions every month and have been burned by spreadsheet errors, late filings, or generic global HR tools that mishandled local tax law. Their employees expect payslips on their phones, in plain language, with reliable delivery on patchy networks.

### The job the landing page has to do

A visitor leaves the page convinced of three things:

1. This product handles statutory compliance correctly, by people who understand the legislative cycle.
2. Employees will use it on the phones they already own, with or without internet.
3. Switching from Excel or a generic global HR tool is a realistic two-week move, not a six-month migration.

If the visitor scrolls to the footer and only remembers "looks slick," you have failed. They should remember at least one specific thing the product does that the alternatives do not.

### Positioning posture

The page reads as a world-class enterprise SaaS product. The same visual language a buyer in Lagos, Cape Town, Cairo, or Nairobi expects from a serious B2B platform. The product is honest about what it does today (Kenyan compliance, KES, M-Pesa) without making the page feel like a regional product. Think Stripe homepage versus Stripe-when-you-log-in. Universal shop window. Local product underneath.

---

## 2. What "no AI slop" means here

The default output of most LLM-built landing pages looks the same. You are explicitly avoiding that look. Treat every component decision as a fork: would a competent human designer ship this, or does it just signal "I generated a SaaS site"?

### Avoid the following, without exception

- **Purple-to-blue gradient hero backgrounds.** No `bg-gradient-to-br from-violet-500 to-blue-500`. The brand has a locked palette. Use it.
- **Six identical feature cards in a 3x2 grid.** Each with an icon, a 4-word title, and a 2-line description. This is the single most overused pattern in SaaS landing pages. You will use varied section structures (asymmetric, side-by-side, full-bleed, table-based, interactive) so no two sections feel like the same template.
- **Floating dashboard screenshots that have nothing to do with the actual product.** If you show a UI, it shows real product content with real-looking data: KES amounts, real statutory deduction lines (PAYE, NSSF, SHIF, Housing Levy), professional-looking employee names. No Lorem ipsum, no fake email addresses like `john@acme.com`.
- **Generic "AI-powered" or "next-generation" or "supercharge your" copy.** The word "AI" should not appear unless you are describing the analytics service specifically. "Empower" is banned. "Streamline" is banned. "Unleash" is banned. "Cutting-edge" is banned. "Leverage" is banned.
- **Glassmorphism applied without reason.** Frosted blur is fine over a real photographic background. It is not fine layered onto a flat colour just to look modern.
- **3D blobs, gradient meshes, abstract shapes, or generated illustrations.** No spline-style fluid mascot drifting in the corner.
- **Cultural ornament of any kind.** No mud-cloth borders. No Adinkra patterns. No kente decorations. No map of Africa with a pin in it. No "Made in Nairobi" badge. No Swahili words used as headline accents. The brand stays rooted through what the product does, not what the page draws.
- **"Trusted by 1000+ companies" with no logos and no source.** If you show social proof, write three or four real-looking placeholder logos in `/public/logos/` as simple SVG monograms ("Sokoni Group", "Mara Holdings", "Tatu Foods", "Barabara Logistics"), and label the section honestly: "Built for businesses like these." Do not invent customer counts.
- **Centered hero, then centered intro, then centered features, then centered pricing, then centered footer.** Vary the rhythm. Some sections left-anchored, some asymmetric, one full-bleed, one densely tabular.
- **Drop shadows on every card.** Use `border` plus `bg-surface-alt` for separation more often than shadow. When you do use shadow, keep it subtle (`shadow-[0_2px_8px_rgba(7,30,19,0.04)]`).
- **Lucide-react icons used as the primary visual element in every card.** Icons are punctuation, not the message. Reach for type, layout, and real screens before reaching for an icon.
- **Generic testimonial format with circular avatar, name, title, paragraph.** If you include testimonials, design them like a magazine pull-quote, not a Trustpilot card.
- **A `cta-large` repeated five times down the page.** One primary CTA in the hero. One secondary near pricing. One in the footer. That is enough.
- **Round, full-width "Get started for free" buttons in every section.** Be intentional.
- **A floating chat or messaging blob in the bottom right corner.** No persistent floating button on the page chrome. Support links go in the footer.

### Reach for the following instead

- **Editorial typography.** Real type hierarchy. Display sizes that breathe (clamp(56px, 6vw, 88px)). Generous letter-spacing on small caps eyebrow labels. Body copy at 17 to 18px on desktop, never 14px.
- **Asymmetric layouts.** A 12-column grid where the section headline takes 5 columns and the body takes 6, with one column of breathing room. Not everything is `max-w-7xl mx-auto text-center`.
- **A live payroll calculator.** This is the centrepiece of the page. The visitor types a gross salary in KES, picks pay frequency (monthly), and sees PAYE, NSSF Tier I, NSSF Tier II, SHIF, Housing Levy, and net pay calculated in real time, using the actual current statutory rates. No competitor does this well on a landing page.
- **A real phone mockup.** Not a generic iPhone bezel. A simple, accurate Android frame at the proportions of a typical mid-range device, showing the actual employee portal: payslip view with KES line items in plain English. The mockup is a real CSS-drawn frame, not a stock image.
- **Specific copy.** "PAYE, NSSF Tier I and II, SHIF, Housing Levy. All filed correctly the first time" beats "compliance made easy." Name the things. The audience knows what those acronyms mean and they will trust copy that names them.
- **Real KES amounts in examples.** A worked example showing what a payslip looks like for a KES 85,000 gross monthly salary. Show every deduction line with the actual statutory rate. This is concrete proof you understand the domain.
- **A regulatory timeline section.** A small horizontal timeline of regulatory shifts the platform handled correctly, presented as proof of engineering rigour.
- **Density variation.** One section that is mostly whitespace with a single quote. The next section dense, two columns, lots of detail.
- **Considered motion.** Reduce-motion respected. Where motion is used, it is brief (200 to 350ms), eased, purposeful. No autoplay carousels. No parallax for its own sake. Hover transitions on cards should be a 1px lift and a border colour shift, nothing more.

---

## 3. Brand system (locked, do not deviate)

These tokens come from the official logo SVGs. The colours `#0B3D2E` and `#E8A020` are locked. Never substitute or shift saturation. The palette is **flat**, not gradient. The flat choice is intentional and signals precision and stability for compliance software.

### Tailwind config (paste into `tailwind.config.ts` if not already present)

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx,js,jsx,mdx}",
    "./app/**/*.{ts,tsx,js,jsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          950: "#071e13",
          900: "#0b3d2e",
          800: "#0f5040",
          700: "#166a50",
          500: "#27a870",
          100: "#d1f5e6",
          50:  "#e8f5f0",
        },
        amber: {
          DEFAULT: "#e8a020",
          dark:    "#c98510",
          light:   "#fef3dc",
        },
        surface: {
          DEFAULT: "#ffffff",
          alt:     "#f8f7f4",
        },
        ink: {
          900: "#02110c", // wordmark "near-black"
          700: "#374151",
          600: "#4b5563",
          400: "#9ca3af",
          200: "#e5e7eb",
          100: "#f3f4f6",
        },
        error: "#ef4444",
        info:  "#60a5fa",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-bricolage)", "var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "monospace"],
      },
      maxWidth: {
        prose: "68ch",
      },
    },
  },
  plugins: [],
};

export default config;
```

### Color usage rules (enforce these in code review)

| Rule | Allowed | Not allowed |
|---|---|---|
| Hero / nav / dark sections | `bg-brand-900` | `bg-black`, gradient backgrounds |
| CTA buttons | `bg-amber` only | Any other accent on a CTA |
| Hover on CTA | `bg-amber-dark` | Lightening the amber |
| Success or compliance confirmation | `text-brand-500` or dot of `bg-brand-500` | Other greens |
| Body text | `text-ink-900` | Pure `#000000` |
| Alternating section background | `bg-surface-alt` | `bg-ink-100` |
| Borders | `border-ink-200` | Tinted brand borders unless hovered |
| Footer | `bg-brand-950` | `bg-black` |

### Typography

- **Display headlines:** Bricolage Grotesque (variable, weight 600 to 800). Self-host via `next/font/google`. Used only for H1 and section H2.
- **UI and body:** Inter (variable, 400 to 700). Self-host via `next/font/google`.
- **Numbers (payslip, calculator, KES amounts):** JetBrains Mono or Inter with `font-feature-settings: 'tnum' 1, 'lnum' 1`. Tabular figures matter on a payroll site.

### Type scale (desktop)

```css
.h1-display { font-size: clamp(56px, 6.5vw, 88px); line-height: 0.98; letter-spacing: -0.02em; font-weight: 700; }
.h2-display { font-size: clamp(36px, 4vw, 56px); line-height: 1.05; letter-spacing: -0.015em; font-weight: 700; }
.h3       { font-size: 24px; line-height: 1.25; font-weight: 600; }
.eyebrow  { font-size: 12px; line-height: 1; letter-spacing: 0.14em; text-transform: uppercase; font-weight: 600; color: var(--color-brand-700); }
.body-lg  { font-size: 18px; line-height: 1.6; }
.body     { font-size: 16px; line-height: 1.6; }
.body-sm  { font-size: 14px; line-height: 1.5; }
.mono-tabular { font-feature-settings: "tnum" 1, "lnum" 1; }
```

### Voice (use these, not the others)

| Use | Avoid |
|---|---|
| "PAYE, NSSF, SHIF, Housing Levy. All filed on time." | "Compliance made easy" |
| "Sleep well. Statutory submissions are handled." | "Empower your team" |
| "If you can use a phone, you can use AndikishaHR." | "Intuitive user experience" |
| "Your payroll, in 20 minutes a month." | "Streamline your workflow" |

Plain English. No corporate hedging. No qualifiers. No regional flag-waving. No translated mottos.

---

## 4. Required sections (in order)

You will build the following ten sections. Read each spec carefully. Two of these sections are not the standard pattern, they are differentiating, and you must build them properly.

### 4.1 Top navigation

- Sticky, transparent over hero, switches to white background with `border-b border-ink-200` once scrolled past the hero (use `IntersectionObserver`, not scroll listener).
- Logo on the left (existing SVG at `public/logo/andikisha-logo-horizontal.svg`).
- Center links: `Product`, `Pricing`, `Compliance`, `Customers`.
- Right side: `Sign in` (text link, `text-ink-700`) and `Start free trial` (primary CTA, amber).
- Mobile: hamburger that opens a full-screen sheet, not a dropdown. Sheet has the same links plus a contact link.

### 4.2 Hero

- Background: `bg-brand-900`. Full flat colour, no gradient, no image overlay.
- Layout: 12-column grid. Headline takes columns 1 to 7. Right side (columns 8 to 12) holds a compact, real payslip mockup card showing one employee for one month. Not a full dashboard. Just a payslip. The card has a subtle 1px `border-brand-800` and `bg-brand-800/40`.
- No eyebrow text. The headline does the work.
- Headline (H1, `font-display`, white): "HR and payroll, calculated correctly."
- Subhead (`body-lg`, `text-brand-100`): "Statutory deductions to the cent. Payslips on the phones your team already uses. Salary disbursement on M-Pesa. Built for modern African businesses."
- Primary CTA: `Start 30-day free trial`, amber.
- Secondary CTA: `Try the live calculator` (text link with arrow, scrolls to section 4.4).
- Below CTAs, a thin row of small stat chips showing illustrative numbers: "240+ businesses on the platform", "1.2B KES processed monthly", "100% on-time statutory filings". Mark these with a TODO comment so they can be swapped for real metrics post-launch.

The payslip card on the right shows:

```
SARAH M.
Senior Accountant · EMP-00041
Period: October 2025

Gross                      85,000.00 KES
─────────────────────────────────────────
PAYE                       11,737.50
NSSF Tier I (6%)              420.00
NSSF Tier II (6%)           1,914.00
SHIF (2.75%)                2,337.50
Housing Levy (1.5%)         1,275.00
─────────────────────────────────────────
Net pay                    67,316.00 KES
                       Paid via M-Pesa
```

All numbers monospaced, right-aligned, tabular figures. The card is a real component, not an image. Build it as `<HeroPayslipCard />` so it is reusable in the calculator section.

### 4.3 Compliance proof strip

A horizontal full-width section, `bg-surface-alt`, presenting a timeline of regulatory shifts handled correctly.

Header (H2): "Compliance is our entire operating model."
Subhead, smaller: "When the rules change, we ship the same day. A few recent moments:"

Timeline items, presented as a horizontal row on desktop, stacked on mobile:

```
SHIF transition          Housing Levy at        NSSF Act 2013
from NHIF                1.5%                   Tier II uplift
Oct 2024                 Mar 2024               Feb 2024

Finance Bill 2024        eTIMS rollout
amendments               for invoicing
Sep 2024                 Jan 2024
```

Each item: small `bg-brand-100` dot, date in `text-brand-700` (eyebrow style), description in `text-ink-900 font-medium`.

This section reads as engineering rigour proof. The events themselves do the work.

### 4.4 The live payroll calculator (centrepiece)

This is the section a payroll officer screenshots and sends to their finance director.

- Section background: `bg-surface-alt`.
- Headline: "Try the engine. Real KES rates. Live."
- Two-column layout. Left: input form. Right: itemised payslip output that updates as inputs change.
- Inputs:
    - Gross monthly salary (KES, default 85,000, slider plus number input)
    - Pension contribution (% of gross, default 0)
    - HELB deduction (KES, default 0)
- Output, all tabular figures, all in KES:
    - Gross pay
    - PAYE (using current bands: 10% on first 24,000; 25% on next 8,333; 30% next 467,667; 32.5% next; 35% on top, applied with 2,400 personal relief)
    - NSSF Tier I (6% of pensionable pay capped at 8,000 lower earnings limit, max 480)
    - NSSF Tier II (6% of pensionable pay between 8,001 and 72,000 upper earnings limit, max 3,840)
    - SHIF at 2.75% (no cap)
    - Housing Levy at 1.5%
    - HELB (passthrough)
    - Net pay
- Below the calculator, a small note: "Rates current as of 1 March 2025. We update calculations the same day a Finance Bill takes effect."

Build the calculator as a real `useMemo`-driven React component. No mock data, no fake calculation. The actual maths must be correct. Source the rates from a single typed module at `src/lib/kenya-tax-rates-2025.ts` so they are auditable.

### 4.5 Three pillars (NOT a 6-card grid)

Three pillars, side by side on desktop, stacked on mobile. Each is roughly equal width, with a 1px `border-ink-200` divider between them rather than three boxed cards. The dividers run only on desktop.

The pillars:

1. **Compliance is a product, not a setting.** A 5-line paragraph about how the Compliance Service is its own first-class part of the platform, not a configuration page. The team monitors the legislative cycle and ships rate updates on the day they take effect, not when someone remembers to check.
2. **Built for the phones your team actually owns.** A 5-line paragraph about employees opening payslips on mid-range Android devices, on 3G, sometimes offline. Notifications via SMS and the chat platforms employees already use. PIN login, no password complexity rules.
3. **One stack from gross to net to filed.** A 5-line paragraph about the loop closing, from attendance to payroll to disbursement to tax authority filing, without spreadsheets in the middle.

No icons in the headers of these pillars. The pillar number ("01", "02", "03") in `font-display text-brand-700 text-5xl` is the visual anchor.

### 4.6 Product walkthrough

A side-by-side scroll-driven section. As the visitor scrolls, the left column (text) advances through four product moments while the right column (a single mobile phone mockup) updates the screen showing inside the phone.

The four moments:

1. **The HR manager runs payroll.** Headline: "Twenty minutes, not three days." Body copy describing the payroll officer initiating a run, system pre-filling employees, attendance and leave already integrated, exception report flagging anomalies, approval, payslips out.
2. **The employee opens their payslip.** Headline: "Plain language. Tap any line for an explanation." Body copy describing the employee receiving a notification, opening the PWA, seeing this month's payslip with each deduction line tappable for an explanation.
3. **The line manager approves leave on the move.** Headline: "Decisions in seconds." Body copy describing one-tap approval from a manager phone, leave balance updating live for the requesting employee.
4. **The system files with the tax authority.** Headline: "P9, P10A, NSSF return, SHIF schedule. Done." Body copy describing automated statutory file generation and submission via Integration Hub.

Build the phone mockup as a real component with a switchable inner screen state (the four screens). The mockup itself is a simple CSS phone frame, around 320 x 660px, dark grey bezel, no fake notch, no fake status bar carrier name. Just a clean device frame.

Names inside the screens: first name plus last initial only. Use a rotating set across the four screens: "Sarah M.", "David O.", "Aisha K.", "Daniel N.", "Grace W.", "Joseph P." Real product UIs use this pattern because of column width, and it reads as universally professional.

### 4.7 Pricing

Three plans, table layout (not three cards), table-style with rows of features and tick marks. This is not a SaaS pricing carousel. It is a finance-officer-friendly comparison table, because the finance officer is the buyer.

Plans:

- **Starter.** KES 350 per active employee per month. Up to 25 employees. Core payroll, statutory filings, employee self-service, M-Pesa disbursement.
- **Growth.** KES 280 per active employee per month. 26 to 200 employees. Everything in Starter plus leave, attendance, expense, multi-approver workflows, basic analytics.
- **Scale.** KES 220 per active employee per month, billed annually. 200+ employees. Everything in Growth plus advanced analytics, dedicated success manager, custom integrations.

A "Compare features" toggle that expands the full comparison table inline. Twenty to thirty rows, three columns. Use real Yes/No marks (`Yes` in `text-brand-500`, dash for No, never an X icon). Tabular figures throughout.

Below the table: "All prices in KES. Annual billing saves 15%. VAT applied where applicable."

### 4.8 Trust and security

A single dark section, `bg-brand-950`, with white type. Two-column inside.

Left column: a heading "Built to enterprise standard" and two paragraphs about data residency, multi-tenant isolation at the PostgreSQL schema level, audit log retention for seven years, and the security posture you ship to the market.

Right column: a tight checklist of certifications and standards the platform meets or is working towards. Each item with a tiny `bg-brand-500` dot, item name in white, status in `text-brand-100`:

```
KDPA registered                Yes
GDPR-aligned data handling     Yes
SOC 2 Type 1                   In audit
ISO 27001                      In roadmap
Encryption at rest             AES-256
Encryption in transit          TLS 1.3
Audit log retention            7 years
Data residency                 Configurable
```

Position this section as proof that the platform meets the trust bar that any serious enterprise buyer or auditor expects.

### 4.9 FAQ

A flat list of 8 to 10 real questions a serious buyer would actually ask. Use real questions, not invented ones. Examples:

- "Will payroll run if my internet drops in the middle of it?"
- "Do I have to switch from my current accountant?"
- "Can I run payroll for casuals on a daily rate?"
- "How do you handle a Finance Bill change mid-month?"
- "What happens to my data if I cancel?"
- "Can I export to QuickBooks, Xero, or Sage?"
- "Is mobile money disbursement extra, or included?"
- "How do I import my current employee list from Excel?"
- "Does the employee app support local languages?"
- "Do you support contractor payments and gig workers?"

Each item: a `<details>` with the question as the summary, an `aria-expanded`-driven chevron, body text inside. No accordion library. Native HTML, accessibility-first.

### 4.10 Footer

`bg-brand-950`. Four columns on desktop:

1. Logo plus a one-line tagline plus office address (Nairobi, Kenya, displayed plainly as contact info).
2. Product links.
3. Company links.
4. Legal links.

Bottom bar: copyright, KDPA registration number (placeholder for now), social links as text only (no icons). A small "Contact support" link sits in the footer. No floating chat or messaging blob anywhere on the page chrome.

---

## 5. Components to build

Build these as real, reusable components in `src/components/`. Each one in its own file with a co-located `.test.tsx` if a quick smoke test makes sense.

```
src/components/
  layout/
    SiteHeader.tsx
    SiteFooter.tsx
  hero/
    Hero.tsx
    HeroPayslipCard.tsx
  compliance/
    ComplianceProofStrip.tsx
  calculator/
    PayrollCalculator.tsx
    PayrollCalculatorInputs.tsx
    PayrollCalculatorOutput.tsx
  pillars/
    ThreePillars.tsx
  walkthrough/
    ProductWalkthrough.tsx
    PhoneMockup.tsx
    PhoneScreens/
      PayrollRunScreen.tsx
      EmployeePayslipScreen.tsx
      LeaveApprovalScreen.tsx
      TaxFilingScreen.tsx
  pricing/
    PricingTable.tsx
    PricingComparisonExpanded.tsx
  trust/
    TrustSection.tsx
  faq/
    FaqList.tsx
    FaqItem.tsx
  ui/
    Button.tsx
    Eyebrow.tsx
    Section.tsx
    Container.tsx
```

Calculator logic and tax rates live in `src/lib/`:

```
src/lib/
  kenya-tax-rates-2025.ts   // typed constants, single source of truth
  payroll-calculations.ts   // pure functions, fully unit-testable
```

Write `payroll-calculations.test.ts` with at least 6 cases: minimum wage, KES 50k, KES 85k, KES 200k, KES 500k, edge case at PAYE band boundaries. The maths must be correct. If you are unsure of the rates, stop and ask before guessing.

---

## 6. Accessibility and performance budget

These are not optional.

- All interactive elements reachable by keyboard, with a visible `:focus-visible` ring in `outline outline-2 outline-amber outline-offset-2`.
- Colour contrast: every text-on-background pairing must meet WCAG AA at minimum. Body text on `bg-brand-900` must use `text-white` or `text-brand-100`, never `text-brand-500`.
- All images have meaningful `alt` text or `alt=""` if decorative.
- The phone mockup screens use real semantic HTML inside, not nested divs.
- The `<details>`-based FAQ is keyboard accessible by default. Do not break that.
- Lighthouse on mobile (3G simulated, mid-tier device): Performance 90+, Accessibility 100, Best Practices 100, SEO 100.
- LCP target: under 2.0s on 4G.
- Total JS shipped: under 150KB gzipped on the landing route.
- Use `next/font` for self-hosting Inter and Bricolage. No Google Fonts CDN call.
- Use `next/image` everywhere there is a raster image.
- Respect `prefers-reduced-motion`. If a user has it set, all motion shorter than 0ms.

---

## 7. SEO and metadata

- Set per-route metadata in `app/layout.tsx` and `app/page.tsx`.
- `<title>`: "AndikishaHR — HR and payroll, calculated correctly"
- `<meta name="description">`: One sentence under 160 characters that names the core value (statutory compliance, mobile delivery, mobile money disbursement).
- OpenGraph image: a 1200x630 PNG generated from a real React component using `next/og`. The image shows the wordmark, a short tagline, and the brand-900 background with the amber accent dot. Do not use a stock image.
- Schema.org `Organization` JSON-LD in the head: name, logo URL, address, contact phone (placeholder).
- `robots.txt` and a `sitemap.xml` at the static export step.

---

## 8. How to start

Work in this order. Do not skip steps.

1. Read `frontend/landing/` end to end. List what already exists. Identify what to keep, what to refactor, what to discard. Print the inventory before writing any code.
2. Read `andikishahr-brand-colours.md` if it exists in the repo root or under `docs/`. Confirm the tokens in the Tailwind config match. Reconcile any drift.
3. Check the existing `tailwind.config.ts`. If brand tokens are not present, add them as specified in section 3 of this brief. Do not duplicate existing tokens with new names.
4. Build `src/lib/kenya-tax-rates-2025.ts` and `src/lib/payroll-calculations.ts` first, with tests passing. The calculator is the centrepiece, and everything else depends on the maths being right.
5. Build the layout primitives (`SiteHeader`, `SiteFooter`, `Container`, `Section`, `Button`, `Eyebrow`) before any section component.
6. Build sections in order from 4.1 to 4.10. Ship each section to `app/page.tsx` as you complete it. Do not build all components in isolation and integrate at the end.
7. After all sections are wired, run an accessibility audit (axe DevTools) and a Lighthouse audit. Fix any WCAG violations and any performance regression.
8. Print a final summary: list of files created, list of files modified, list of files removed, Lighthouse scores, any TODOs that the human reviewer needs to address (real customer logos, real KDPA number, real phone number, real metric numbers).

---

## 9. What I will check before merging

Treat this section as your acceptance test. If any of these fail, the work is not done.

- The hero is `bg-brand-900` (flat). The only amber on the page is on CTAs. Success states use `brand-500`. No purple, no blue gradients, no glassmorphism.
- The payroll calculator returns numerically correct results for at least 6 worked examples I will hand-check. The rates come from one file (`kenya-tax-rates-2025.ts`).
- The hero payslip card and the calculator output card share the same component, not two parallel implementations.
- No two consecutive sections use the same layout pattern. Section variety is visible at a glance when scrolling.
- The phone mockup is a real CSS device frame, not a stock PNG.
- Names in product mockups are first-name-plus-last-initial only, not full names.
- No copy on the page contains: "empower", "streamline", "supercharge", "next-generation", "AI-powered" (unless naming the analytics service), "leverage", "robust", "seamless", "cutting-edge".
- No floating chat, messaging, or support blob anywhere on the page.
- No cultural ornament. No decorative patterns. No "Made in [city]" badges. No Swahili words used as headline or section accents.
- Lighthouse mobile scores meet the targets in section 6.
- Tab through the page top to bottom. Every interactive element shows a visible focus ring. The mobile menu opens with the keyboard.
- The page renders correctly at 360px wide (typical entry-level Android), 768px (tablet), and 1440px (desktop).
- No `console.error` or `console.warn` on first load.

---

## 10. What you should ask me, not assume

If you hit any of the following, stop and ask. Do not guess.

- The exact 2025 Kenyan PAYE bands or relief amounts if your knowledge is uncertain. Paste the current rates from KRA only after I confirm.
- Whether annual billing discount is 15% or different.
- Whether to include a "Book a demo" CTA in addition to "Start free trial".
- Whether the FAQ should mention specific competitors by name (it should not, unless I confirm).
- Real customer logos to include. Until I provide real ones, use the placeholder monogram approach in section 2.
- Photography. The brief assumes UI mockups only for v1. If you find images in `public/` that look like real workplace photography, ask before using them. Do not use stock photography under any circumstances.

---

## 11. Reference files in this repo to read

- `andikishahr-brand-colours.md` — the locked colour system.
- `AndikishaHR_Brand_Guide.pdf` — typography and logo usage rules.
- `AndikishaHR_Product_Planning_Document_v1.1.md` — feature scope, audience, language, UX principles.
- `andikishaHR-feature-strategy.md` — differentiating features and competitive framing.
- `CLAUDE.md` — repo-wide conventions.

Read these before starting, not in the middle of building. The brief above is consistent with all of them, but if you find a conflict, surface it and ask which document wins.

---

## 12. One last thing

The bar for this page is not "looks like a SaaS landing page." The bar is: a finance director at a 200-person business, who has been burned by a generic global HR tool that miscalculated statutory deductions, lands on this page, scrolls for 90 seconds, and books a demo. The same page should look credible to an investor, an auditor, a peer founder, or a buyer in any African capital. Every component decision serves that outcome. If you are about to build something that does not, stop and tell me what you would build instead.