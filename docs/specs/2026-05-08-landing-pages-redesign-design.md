# Landing Pages Redesign — Secondary Pages

**Date:** 2026-05-08
**Scope:** Full redesign of 8 secondary pages in `frontend/landing/` to match the home page visual language
**Approach:** Grouped parallel agents in 3 sequential waves with review checkpoints between waves

---

## Context

The home page was fully redesigned in May 2026 (see `docs/specs/2026-05-07-landing-redesign-design.md`). The secondary pages need to match the same visual quality: Bricolage Grotesque headlines, brand-900/950 hero backgrounds, amber accents, single "Schedule a demo" primary CTA, and closing every page with either `JoinCTA` or `NewsletterSection`.

`/features` remains a redirect to `/product` — not in scope.

---

## Design Language (applied to all pages)

- **Headlines:** `font-display font-bold` (Bricolage Grotesque), `clamp(2.25rem, 4vw, 3.5rem)`, `letterSpacing: -0.015em`
- **Hero backgrounds:** `bg-brand-900` or `bg-brand-950`
- **Primary CTA:** "Schedule a demo" → `/demo`
- **Secondary CTA:** "See pricing" → `/pricing` or "Start free trial" → `/early-access`
- **Amber accents:** badges, highlight text, urgency indicators
- **Icons:** Lucide only
- **Closing section:** every page ends with `<JoinCTA />` or `<NewsletterSection />`
- **Shared components reused:** `Container`, `Eyebrow`, `LogosRow`, `StatsBand`, `JoinCTA`, `NewsletterSection`, `FaqList`

---

## Wave 1 — Form Pages

Three pages run in parallel. These pages already have solid structure; changes are additive sections and visual polish.

### `/contact`

**Sections (in order):**
1. Hero — `bg-brand-900`, existing copy, add two stat chips: "2hr response time" and "Mon–Fri 8am–6pm EAT"
2. Form + contact details — keep existing two-column layout, tighten shadow (`shadow-[0_8px_40px_rgba(11,61,46,0.06)]`) and spacing
3. WhatsApp card — keep, elevate with subtle hover animation
4. `<NewsletterSection />` — new, at bottom

**CTA change:** No primary "Schedule a demo" CTA needed — page purpose is contact. Keep existing form submit.

### `/demo`

**Sections (in order):**
1. Hero — `bg-brand-900`, existing copy, add social proof chip: "100+ companies onboarded"
2. `<LogosRow />` — new trust strip immediately below hero, before the two-column section
3. Form + what to expect — keep existing two-column layout
4. `<JoinCTA />` — new, at bottom

**CTA change:** Form submit button text stays "Book your session". "Schedule a demo" is the page's purpose so no additional CTA needed above the form.

### `/early-access`

**Sections (in order):**
1. Hero — `bg-brand-950`, existing copy, add urgency counter badge: "42 of 50 spots remaining" (hardcoded, amber badge)
2. Perks list — replace dot bullets with Lucide icons per perk (e.g. `Lock` for pricing locked, `Truck` for migration, `User` for account lead, `Map` for roadmap, `Grid` for all modules)
3. Application panel — keep existing card with contact form link; add urgency text "Cohort closes when 50th company is confirmed"
4. Testimonial — new dark `bg-brand-900` block with a single quote from an early customer (placeholder content: "We ran our first payroll in 4 hours. The compliance calculations were spot-on." — Wanjiku M., HR Manager, Nairobi)

---

## Wave 2 — Content Pages

Three pages run in parallel. These pages need new sections added and existing sections upgraded.

### `/product`

**Sections (in order):**
1. Hero — keep existing, add a floating stat card (e.g. "KES 0 penalties in 12 months" amber card overlapping hero bottom)
2. `<StatsBand />` — new, reuse existing component with product-focused stats: "9 modules", "6 statutory obligations handled", "< 1 day setup", "M-Pesa salary disbursement in minutes"
3. Feature sections (3 tabs from `FEATURES_TABS`) — keep alternating layout; upgrade the dark mockup panels (`bg-brand-950`): replace the plain `text-white/50` label + `text-white` value rows with rows that include a colored value indicator dot (`bg-brand-500` for good, `bg-amber` for pending, `bg-red-400` for action-needed) so the panels feel like live dashboards rather than static lists
4. Compliance engine grid — keep `bg-brand-950` treatment, 6-card grid
5. Integrations — upgrade from plain white cards to styled tiles: name in `font-display font-bold`, description, status badge (Live = brand-50/brand-700, Coming = amber-light/amber-dark). No logo images — use a two-letter monogram in a rounded square as the visual anchor (`bg-brand-50 text-brand-700` for Live, `bg-amber-light text-amber-dark` for Coming)
6. `<JoinCTA />` — replace existing inline CTA band

### `/about`

**Sections (in order):**
1. Hero — keep left-aligned layout and copy
2. `<StatsBand />` — new, market-focused stats reusing existing component: "1.56M licensed businesses in Kenya", "85% on spreadsheets", "KES 200K monthly error cost", "25% max KRA penalty"
3. Mission + stat grid — keep existing two-column layout (text + 4-stat grid)
4. Values — keep editorial `divide-y` layout
5. Team — keep `divide-y` list layout
6. Careers — keep `bg-brand-900` section
7. `<JoinCTA />` — new, replaces the partners stub section (partners is now its own page)

**Removed:** The "Partners" section that linked to `/contact` — replaced by the dedicated `/partners` page.

### `/pricing`

**Sections (in order):**
1. Hero — keep, add two chips below headline: "30-day free trial" and "No credit card required"
2. Comparison table — new section `bg-surface-alt`: "AndikishaHR vs Spreadsheet" table with rows: Setup time, PAYE accuracy, NSSF/SHIF handling, Audit trail, M-Pesa disbursement, KRA filing, Error cost. Two columns: Spreadsheet (red ✗ or amber ~) vs AndikishaHR (green ✓)
3. `<PricingTable />` — keep existing component
4. Testimonials — new: two quote cards in a two-column grid, focused on ROI/value ("We saved 3 days a month on payroll prep." / "No more KRA penalty letters.")
5. `<FaqList />` — keep existing component
6. `<JoinCTA />` — replace existing inline CTA

---

## Wave 3 — New Builds

Two agents run in parallel. These are the most substantial changes.

### `/partners` (full new page)

**Sections (in order):**

1. **Hero** — `bg-brand-900`, left-aligned
   - Eyebrow: "Partner Programme"
   - H1: "Build a practice around the future of HR in East Africa."
   - Subtext: "We work with accountants, HR consultants, and payroll bureaus who serve Kenyan SMEs. Partners get revenue share, co-marketing, and early compliance feature access."
   - CTA: "Enquire about partnering" → `/contact?subject=partner`

2. **Who qualifies** — `bg-white`, three-column card grid
   - Accountants & Payroll Bureaus — `Calculator` icon
   - HR Consultancies — `Users` icon
   - Implementation Partners — `Wrench` icon
   - Each card: icon, title, 2-line description of the type of firm, "You qualify if..." bullet

3. **What you get** — `bg-surface-alt`, 2×2 benefit grid
   - Revenue share — "Earn a percentage of first-year ARR for every client you refer that converts"
   - Co-marketing — "Joint case studies, co-branded materials, and listing in our partner directory"
   - Early access — "Beta access to new compliance features before general release"
   - Dedicated support — "Named account lead and priority support SLA for your clients"

4. **How it works** — `bg-white`, 3-step numbered process
   - Step 1: Apply — fill in the contact form with subject "partner"
   - Step 2: Discovery call — 30 min call to confirm fit and discuss your client base
   - Step 3: Onboard — partner agreement, portal access, and first co-marketing asset

5. **Apply CTA** — `bg-brand-900`, full-width dark section
   - Headline: "Programme is invite-only while we onboard our first 50 customers."
   - Primary button: "Enquire via contact form" → `/contact?subject=partner`
   - Secondary: "Email us at partners@andikishahr.com"

### `/blog` (listing page) + `/blog/[slug]` (article pages)

These share the same agent since `[slug]/page.tsx` depends on patterns established in the listing.

**Blog listing (`/blog`):**

1. **Hero** — `bg-brand-900`, editorial feel
   - Eyebrow: "The AndikishaHR Blog"
   - H1: "Kenya HR and payroll, explained."
   - Subtext: "Compliance updates, payroll guides, and HR best practices for East African businesses."

2. **Featured post** — `bg-white`, full-width hero card (first/most recent post)
   - Large card: category badge (amber), title, excerpt (2 lines), date + read time, "Read article →" link

3. **Category filter** — keep existing client-side filter pills, style as `bg-surface-alt` pill buttons with amber active state

4. **Post grid** — 3-column card grid (was 1-column list)
   - Each card: category badge, title, excerpt (2 lines), date + read time
   - Hover: subtle lift shadow

5. **`<NewsletterSection />`** — at bottom

**Blog article (`/blog/[slug]`):**

1. **Reading progress bar** — fixed top bar (amber, `position:fixed`, `top:0`, fills left-to-right on scroll), rendered client-side

2. **Article header** — `bg-brand-900`
   - Category badge (amber)
   - H1: post title
   - Date + read time chips
   - Brief author line: "By the AndikishaHR team"

3. **Article body** — `bg-white`, centered max-w-[720px]
   - `prose` classes with existing typography plugin
   - Improved font size: `prose-lg`

4. **Share bar** — sticky left sidebar on desktop, inline below header on mobile
   - Three icon buttons: LinkedIn, Twitter/X, WhatsApp (opens `wa.me` share link)
   - Label: "Share this article"

5. **Newsletter CTA** — `bg-brand-50 border border-brand-100` card, full-width, above related posts
   - Headline: "Get compliance updates in your inbox"
   - Inline `<NewsletterForm />` component (already exists at `components/ui/NewsletterForm.tsx`)

6. **Related posts** — `bg-surface-alt`, 3-column grid of posts with same category (filtered from `getAllPosts()`)
   - Heading: "More from [category]"
   - Falls back to 3 most recent posts if fewer than 3 in same category

---

## Changelog Entry

Add the following to `CHANGELOG.md` under a new `[Unreleased] — 2026-05-08` heading:

```
### frontend/landing — Secondary pages full redesign

- /contact: hero stat chips (2hr response, business hours); NewsletterSection added
- /demo: social proof chip in hero; LogosRow trust strip; JoinCTA at bottom
- /early-access: urgency counter badge; Lucide icons on perks; testimonial quote
- /product: StatsBand; upgraded dark mockup panels; logo-tile integrations grid; JoinCTA
- /about: StatsBand with market stats; partners stub replaced with JoinCTA
- /pricing: comparison table (AndikishaHR vs spreadsheet); ROI testimonial quotes; JoinCTA
- /partners: full new page — hero, who-qualifies (3 types), benefits grid, how-it-works, apply CTA
- /blog: featured post hero card; 3-column card grid; NewsletterSection
- /blog/[slug]: reading progress bar; article hero section; share buttons (LinkedIn/Twitter/WhatsApp); newsletter CTA; related posts
```

---

## Implementation Notes

- All pages work on master branch directly (no worktree per project convention)
- `StatsBand` and `LogosRow` are existing components — import and reuse, do not duplicate
- `JoinCTA` is at `components/cta/JoinCTA.tsx`, `NewsletterSection` at `components/layout/NewsletterSection.tsx`
- Reading progress bar in `[slug]/page.tsx` must be a client component (`"use client"`) — extract to `components/blog/ReadingProgress.tsx`
- Share buttons use native `window.open` with encoded share URLs — no external library needed
- Related posts filter runs server-side in `[slug]/page.tsx` using `getAllPosts()` — no additional data fetching
- Typecheck must pass (`pnpm typecheck` in `frontend/landing/`) before marking any wave complete
