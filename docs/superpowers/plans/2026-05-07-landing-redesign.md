# AndikishaHR Landing Page Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the AndikishaHR landing page with a centered hero + full-width browser mockup, single "Schedule a demo" CTA, alternating feature sections, and the real logo and Lucide icons throughout.

**Architecture:** Each component is a standalone server component (no client state) except `Hero.tsx` (needs the sentinel div for navbar scroll), `ProductWalkthrough.tsx` (existing client component, keep it), and `NewsletterForm.tsx` (existing client leaf, kept as-is). All new components are pure presentational — no props drilling, data is co-located as typed constants. The page render order is wired in `app/page.tsx` as the final task.

**Tech Stack:** Next.js 15 App Router · Tailwind CSS · Lucide React · `@andikisha/ui` (LogoFull) · `next/font/google` (Bricolage Grotesque)

---

## File Structure

| Action | File |
|--------|------|
| Modify | `frontend/landing/app/layout.tsx` |
| Modify | `frontend/landing/tailwind.config.ts` |
| Modify | `frontend/landing/components/layout/Navbar.tsx` |
| Modify | `frontend/landing/components/hero/Hero.tsx` |
| Create | `frontend/landing/components/hero/HeroBrowserMockup.tsx` |
| Create | `frontend/landing/components/logos/LogosRow.tsx` |
| Create | `frontend/landing/components/features/FeaturePayrollRun.tsx` |
| Create | `frontend/landing/components/features/FeatureDisbursement.tsx` |
| Create | `frontend/landing/components/features/FeatureComplianceGrid.tsx` |
| Modify | `frontend/landing/components/walkthrough/ProductWalkthrough.tsx` |
| Create | `frontend/landing/components/compliance/ComplianceTimeline.tsx` |
| Create | `frontend/landing/components/stats/StatsBand.tsx` |
| Modify | `frontend/landing/components/trust/TrustSection.tsx` |
| Create | `frontend/landing/components/cta/JoinCTA.tsx` |
| Create | `frontend/landing/components/layout/NewsletterSection.tsx` |
| Modify | `frontend/landing/components/faq/FaqList.tsx` |
| Modify | `frontend/landing/components/layout/Footer.tsx` |
| Modify | `frontend/landing/app/page.tsx` |
| Delete | `frontend/landing/components/social-proof/SocialProofStrip.tsx` |
| Delete | `frontend/landing/components/founding/FoundingCustomer.tsx` |
| Delete | `frontend/landing/components/personas/Personas.tsx` |
| Delete | `frontend/landing/components/how-it-works/HowItWorks.tsx` |
| Delete | `frontend/landing/components/cta/FinalCTABanner.tsx` |

---

## Task 1: Foundation — Bricolage Grotesque font

**Files:**
- Modify: `frontend/landing/app/layout.tsx`
- Modify: `frontend/landing/tailwind.config.ts`

- [ ] **Step 1: Add Bricolage Grotesque to `app/layout.tsx`**

Replace the font import block (lines 2–13) with:

```tsx
import { Montserrat, DM_Mono, Bricolage_Grotesque } from "next/font/google";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  weight: ["600", "700", "800"],
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-dm-mono",
  weight: ["400", "500"],
  display: "swap",
});
```

Replace the `<html>` className line with:

```tsx
className={`${bricolage.variable} ${montserrat.variable} ${dmMono.variable}`}
```

- [ ] **Step 2: Update `tailwind.config.ts` fontFamily**

In `frontend/landing/tailwind.config.ts`, replace the `fontFamily` block inside `theme.extend`:

```ts
fontFamily: {
  display: ["var(--font-bricolage)", "var(--font-montserrat)", "sans-serif"],
  body: ["var(--font-montserrat)", "sans-serif"],
  mono: ["var(--font-dm-mono)", "monospace"],
},
```

- [ ] **Step 3: Verify typecheck passes**

```bash
cd /Users/lawrence-eq/Projects/andikisha/frontend/landing && pnpm tsc --noEmit 2>&1 | head -20
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/landing/app/layout.tsx frontend/landing/tailwind.config.ts
git commit -m "feat(landing): add Bricolage Grotesque display font"
```

---

## Task 2: Navbar — single CTA, no announcement strip

**Files:**
- Modify: `frontend/landing/components/layout/Navbar.tsx`

- [ ] **Step 1: Replace `Navbar.tsx` entirely**

```tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import { LogoFull } from "@andikisha/ui";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Product",    href: "/product",  chevron: true },
  { label: "Compliance", href: "/security", chevron: true },
  { label: "Pricing",    href: "/pricing",  chevron: false },
  { label: "Resources",  href: "/blog",     chevron: true },
  { label: "About",      href: "/about",    chevron: false },
];

const DARK_HERO_PAGES = ["/"];

export default function Navbar() {
  const pathname = usePathname();
  const hasDarkHero = DARK_HERO_PAGES.includes(pathname);

  const [scrolled, setScrolled]   = useState(!hasDarkHero);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setScrolled(!hasDarkHero);
    setMobileOpen(false);
  }, [pathname, hasDarkHero]);

  useEffect(() => {
    if (!hasDarkHero) return;
    const sentinel = document.getElementById("hero-sentinel");
    if (!sentinel) { setScrolled(true); return; }
    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasDarkHero, pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const transparent = !scrolled;

  return (
    <>
      <div className="sticky top-0 z-50">
        <header
          className={cn(
            "transition-all duration-300",
            transparent
              ? "bg-transparent border-b border-transparent"
              : "bg-white border-b border-ink-200 shadow-[0_1px_0_rgba(0,0,0,0.06)]"
          )}
        >
          <div className="mx-auto max-w-[1320px] px-6 md:px-12">
            <div className="flex items-center justify-between h-[68px]">

              <Link href="/" aria-label="AndikishaHR home" className="shrink-0">
                <LogoFull
                  variant={transparent ? "white-mark" : "default"}
                  className="h-7 w-auto"
                />
              </Link>

              <nav className="hidden lg:flex items-center gap-7" aria-label="Main">
                {NAV_LINKS.map(({ label, href, chevron }) => (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-1 text-[14px] font-medium transition-colors duration-200",
                      transparent
                        ? "text-white/75 hover:text-white"
                        : "text-ink-600 hover:text-ink-900"
                    )}
                  >
                    {label}
                    {chevron && <ChevronDown size={14} className="opacity-60" aria-hidden />}
                  </Link>
                ))}
              </nav>

              <div className="hidden lg:flex items-center gap-2">
                <Link
                  href={process.env.NEXT_PUBLIC_APP_URL ?? "https://app.andikishahr.com"}
                  className={cn(
                    "text-[14px] font-medium px-3 py-2 transition-colors duration-200",
                    transparent ? "text-white/75 hover:text-white" : "text-ink-600 hover:text-ink-900"
                  )}
                >
                  Log in
                </Link>
                <Link
                  href="/demo"
                  className="text-[14px] font-semibold px-5 py-2.5 rounded-lg bg-amber hover:bg-amber-dark text-ink-900 transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2"
                >
                  Schedule a demo
                </Link>
              </div>

              <button
                className={cn(
                  "lg:hidden p-2 rounded-lg transition-colors",
                  transparent ? "text-white hover:bg-white/10" : "text-ink-700 hover:bg-ink-100"
                )}
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-nav-drawer"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </header>
      </div>

      {mobileOpen && (
        <div
          id="mobile-nav-drawer"
          className="fixed inset-0 z-[60] lg:hidden"
          aria-modal="true"
          role="dialog"
          aria-label="Navigation menu"
        >
          <div className="absolute inset-0 bg-brand-950/98 backdrop-blur-sm flex flex-col">
            <div className="flex items-center justify-between px-6 h-[68px] border-b border-white/[0.08]">
              <Link href="/" aria-label="AndikishaHR home" onClick={() => setMobileOpen(false)}>
                <LogoFull variant="white-mark" className="h-7 w-auto" />
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="p-2 text-white/60 hover:text-white transition-colors"
              >
                <X size={22} />
              </button>
            </div>
            <nav className="flex-1 flex flex-col justify-center px-8" aria-label="Mobile">
              <ul className="flex flex-col gap-1">
                {NAV_LINKS.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center h-14 text-[22px] font-semibold text-white/70 hover:text-white transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="px-8 pb-10 flex flex-col gap-3">
              <Link
                href="/demo"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center h-12 rounded-lg bg-amber hover:bg-amber-dark text-ink-900 font-semibold text-[15px] transition-colors"
              >
                Schedule a demo
              </Link>
              <Link
                href={process.env.NEXT_PUBLIC_APP_URL ?? "https://app.andikishahr.com"}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center h-12 rounded-lg border border-white/20 text-white font-medium text-[15px] hover:bg-white/10 transition-colors"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd /Users/lawrence-eq/Projects/andikisha/frontend/landing && pnpm tsc --noEmit 2>&1 | head -20
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/landing/components/layout/Navbar.tsx
git commit -m "feat(landing): navbar — single Schedule a demo CTA, remove announcement strip"
```

---

## Task 3: HeroBrowserMockup — new component

**Files:**
- Create: `frontend/landing/components/hero/HeroBrowserMockup.tsx`

- [ ] **Step 1: Create `HeroBrowserMockup.tsx`**

```tsx
import {
  LayoutDashboard, DollarSign, Users, Calendar,
  Activity, Shield, BarChart2, Download,
} from "lucide-react";
import { LogoFull } from "@andikisha/ui";

const SIDEBAR_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: DollarSign,      label: "Payroll" },
  { icon: Users,           label: "Employees" },
  { icon: Calendar,        label: "Leave" },
  { icon: Activity,        label: "Attendance" },
  { icon: Shield,          label: "Compliance" },
  { icon: BarChart2,       label: "Reports" },
];

const EMPLOYEES = [
  { name: "Sarah M.", dept: "Finance",    amount: "67,316", ready: true },
  { name: "David O.", dept: "Operations", amount: "52,400", ready: true },
  { name: "Aisha K.", dept: "HR",         amount: "41,850", ready: false },
  { name: "Daniel N.", dept: "Sales",     amount: "38,200", ready: true },
];

const FILINGS = [
  { name: "P10A — PAYE return",  amount: "KES 568,000",  status: "Filed",     filed: true },
  { name: "NSSF contribution",   amount: "KES 204,960",  status: "Filed",     filed: true },
  { name: "SHIF remittance",     amount: "KES 132,330",  status: "Filed",     filed: true },
  { name: "P9 annual — Dec",     amount: "—",            status: "Scheduled", filed: false },
];

const METRICS = [
  { label: "Gross payroll",     value: "4.8M", delta: "↑ 3.2% from Oct", deltaClass: "text-brand-500" },
  { label: "Total deductions",  value: "1.2M", delta: "PAYE · NSSF · SHIF", deltaClass: "text-ink-400" },
  { label: "Net payroll",       value: "3.6M", delta: "KES total",          deltaClass: "text-ink-400" },
  { label: "Exceptions",        value: "3",    delta: "Needs review",        deltaClass: "text-amber", valueClass: "text-amber" },
];

export function HeroBrowserMockup() {
  return (
    <div
      className="rounded-t-[14px] overflow-hidden shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_32px_80px_rgba(0,0,0,0.14)]"
      aria-hidden="true"
    >
      {/* Browser chrome */}
      <div className="bg-[#2d2d2d] px-4 py-3 flex items-center gap-3 border-b border-[#3a3a3a]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 bg-[#3d3d3d] rounded-md py-1.5 px-3 text-center font-mono text-[11px] text-white/35">
          app.andikishahr.com / payroll
        </div>
      </div>

      {/* App layout */}
      <div className="bg-surface-alt grid" style={{ gridTemplateColumns: "210px 1fr", minHeight: "420px" }}>

        {/* Sidebar */}
        <div className="bg-white border-r border-ink-200">
          <div className="px-4 py-4 border-b border-ink-100">
            <LogoFull variant="default" className="h-[18px] w-auto" />
          </div>
          <nav className="py-2">
            {SIDEBAR_ITEMS.map(({ icon: Icon, label, active }) => (
              <div
                key={label}
                className={
                  active
                    ? "flex items-center gap-2.5 px-4 py-2.5 bg-brand-50 text-brand-900 font-semibold text-[13px] border-r-[2.5px] border-amber"
                    : "flex items-center gap-2.5 px-4 py-2.5 text-ink-400 text-[13px]"
                }
              >
                <Icon size={15} style={{ opacity: active ? 1 : 0.55 }} />
                {label}
              </div>
            ))}
          </nav>
        </div>

        {/* Main content */}
        <div className="p-6">
          {/* Topbar */}
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[17px] font-bold text-ink-900 tracking-tight">November 2025 Payroll</h3>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 text-[12px] font-semibold text-ink-600 border border-ink-200 bg-white rounded-lg px-3 py-1.5">
                <Download size={12} aria-hidden /> Export
              </span>
              <span className="text-[12px] font-semibold bg-amber text-ink-900 rounded-lg px-3 py-1.5">
                Approve run →
              </span>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {METRICS.map(({ label, value, delta, deltaClass, valueClass }) => (
              <div key={label} className="bg-white border border-ink-200 rounded-xl p-3.5">
                <p className="text-[10px] font-semibold text-ink-400 uppercase tracking-[0.05em] mb-1.5">{label}</p>
                <p className={`text-[20px] font-black tracking-tight leading-none ${valueClass ?? "text-ink-900"}`}>{value}</p>
                <p className={`text-[11px] font-medium mt-1.5 ${deltaClass}`}>{delta}</p>
              </div>
            ))}
          </div>

          {/* Tables */}
          <div className="grid grid-cols-2 gap-3">
            {/* Employee table */}
            <div className="bg-white border border-ink-200 rounded-xl overflow-hidden">
              <div className="flex justify-between px-4 py-2.5 bg-surface-alt border-b border-ink-100">
                <span className="text-[10px] font-bold text-ink-400 uppercase tracking-[0.06em]">Employee</span>
                <span className="text-[10px] font-bold text-ink-400 uppercase tracking-[0.06em]">Net pay (KES)</span>
              </div>
              {EMPLOYEES.map(({ name, dept, amount, ready }) => (
                <div key={name} className="flex justify-between items-center px-4 py-2.5 border-b border-ink-100 last:border-0">
                  <div>
                    <p className="text-[12px] font-semibold text-ink-900">{name}</p>
                    <p className="text-[10px] text-ink-400">{dept}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-semibold text-ink-700">{amount}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${ready ? "bg-brand-100 text-brand-800" : "bg-amber-light text-amber-dark"}`}>
                      {ready ? "Ready" : "Review"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Filings table */}
            <div className="bg-white border border-ink-200 rounded-xl overflow-hidden">
              <div className="flex justify-between px-4 py-2.5 bg-surface-alt border-b border-ink-100">
                <span className="text-[10px] font-bold text-ink-400 uppercase tracking-[0.06em]">Statutory filing</span>
                <span className="text-[10px] font-bold text-ink-400 uppercase tracking-[0.06em]">Status</span>
              </div>
              {FILINGS.map(({ name, amount, status, filed }) => (
                <div key={name} className="flex justify-between items-center px-4 py-2.5 border-b border-ink-100 last:border-0">
                  <div>
                    <p className="text-[12px] font-semibold text-ink-900">{name}</p>
                    <p className="text-[10px] font-mono text-ink-400">{amount}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${filed ? "bg-brand-100 text-brand-800" : "bg-amber-light text-amber-dark"}`}>
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd /Users/lawrence-eq/Projects/andikisha/frontend/landing && pnpm tsc --noEmit 2>&1 | head -20
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/landing/components/hero/HeroBrowserMockup.tsx
git commit -m "feat(landing): add HeroBrowserMockup component"
```

---

## Task 4: Hero — centered layout, single CTA, browser mockup

**Files:**
- Modify: `frontend/landing/components/hero/Hero.tsx`

- [ ] **Step 1: Replace `Hero.tsx` entirely**

```tsx
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { HeroBrowserMockup } from "./HeroBrowserMockup";

export default function Hero() {
  return (
    <section className="bg-white pt-20 pb-0 overflow-hidden">
      {/* Centered text block */}
      <div className="mx-auto max-w-[760px] px-6 text-center">

        {/* Pill — links to calculator */}
        <a
          href="#calculator"
          className="inline-flex items-center gap-2 border border-ink-200 rounded-full px-3.5 py-2 mb-8 hover:border-ink-300 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2"
        >
          <span className="bg-brand-50 text-brand-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            New
          </span>
          <span className="text-[13px] text-ink-600 font-medium">
            Payroll calculator — try live KES rates
          </span>
          <ChevronRight size={13} className="text-ink-400" aria-hidden />
        </a>

        {/* H1 */}
        <h1
          className="font-display font-black text-ink-900 leading-[1.05] tracking-[-0.025em] mb-5"
          style={{ fontSize: "clamp(38px, 5.5vw, 62px)" }}
        >
          Kenyan HR and payroll,<br />calculated correctly.
        </h1>

        {/* Subheadline */}
        <p className="text-[18px] text-ink-600 leading-[1.7] max-w-[500px] mx-auto mb-10">
          Statutory deductions to the cent. Payslips on the phones your team already uses.
          M-Pesa and bank in one approved batch.
        </p>

        {/* Single CTA */}
        <Link
          href="/demo"
          className="inline-flex items-center gap-2 bg-amber hover:bg-amber-dark text-ink-900 font-bold text-[15px] px-7 py-3.5 rounded-lg transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2"
        >
          Schedule a demo
          <ChevronRight size={15} aria-hidden />
        </Link>
      </div>

      {/* Browser mockup — clips at bottom into logos row */}
      <div className="mx-auto max-w-[960px] px-6 mt-16 relative">
        <HeroBrowserMockup />
        {/* Fade gradient blends mockup into white */}
        <div
          className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, white)" }}
          aria-hidden
        />
      </div>

      {/* Sentinel — Navbar IntersectionObserver watches this */}
      <div
        id="hero-sentinel"
        className="absolute bottom-0 left-0 w-full h-px pointer-events-none"
        aria-hidden
      />
    </section>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd /Users/lawrence-eq/Projects/andikisha/frontend/landing && pnpm tsc --noEmit 2>&1 | head -20
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/landing/components/hero/Hero.tsx
git commit -m "feat(landing): hero — centered layout, pill, single Schedule a demo CTA, browser mockup"
```

---

## Task 5: LogosRow

**Files:**
- Create: `frontend/landing/components/logos/LogosRow.tsx`

- [ ] **Step 1: Create `LogosRow.tsx`**

```tsx
/* TODO: replace placeholder monograms with real customer SVG logos post-launch */

const COMPANIES = [
  { initial: "S", name: "Sokoni Group" },
  { initial: "M", name: "Mara Holdings" },
  { initial: "T", name: "Tatu Foods" },
  { initial: "B", name: "Barabara Logistics" },
  { initial: "R", name: "Rift Valley Farms" },
  { initial: "N", name: "Nairobi Digital" },
];

export default function LogosRow() {
  return (
    <section className="bg-white border-t border-ink-100 border-b border-ink-100 py-9">
      <p className="text-[13px] text-ink-400 text-center mb-7 font-medium">
        Trusted by businesses across Kenya and East Africa
      </p>
      <div className="flex items-center justify-center gap-14 flex-wrap px-6">
        {COMPANIES.map(({ initial, name }) => (
          <div
            key={name}
            className="flex items-center gap-2 opacity-55 hover:opacity-80 transition-opacity"
          >
            <div className="w-[22px] h-[22px] rounded-[5px] bg-ink-200 flex items-center justify-center text-[10px] font-black text-ink-600 shrink-0">
              {initial}
            </div>
            <span className="text-[14px] font-bold text-ink-400 tracking-[-0.01em]">
              {name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd /Users/lawrence-eq/Projects/andikisha/frontend/landing && pnpm tsc --noEmit 2>&1 | head -10
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/landing/components/logos/LogosRow.tsx
git commit -m "feat(landing): add LogosRow trusted-by strip"
```

---

## Task 6: FeaturePayrollRun

**Files:**
- Create: `frontend/landing/components/features/FeaturePayrollRun.tsx`

- [ ] **Step 1: Create `FeaturePayrollRun.tsx`**

```tsx
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";

const BULLETS = [
  {
    title: "Pre-filled from your HR register",
    body: "Attendance, approved leave, and salary changes are already applied before you open the run. No manual data entry.",
  },
  {
    title: "Exception report surfaces every anomaly",
    body: "Missing bank accounts, unapproved salary changes, first-time employees — all flagged before you approve.",
  },
  {
    title: "One click. M-Pesa and bank together.",
    body: "Approval triggers the Daraja API and bank transfer simultaneously. Employees notified by SMS or WhatsApp.",
  },
];

const EMPLOYEES = [
  { name: "Sarah M.", dept: "Finance",    amount: "67,316", ready: true  },
  { name: "David O.", dept: "Operations", amount: "52,400", ready: true  },
  { name: "Aisha K.", dept: "HR",         amount: "41,850", ready: false },
  { name: "Daniel N.", dept: "Sales",     amount: "38,200", ready: true  },
];

export default function FeaturePayrollRun() {
  return (
    <section className="bg-white py-[88px]">
      <Container>
        <div
          className="grid items-center"
          style={{ gridTemplateColumns: "5fr 6fr", gap: "72px" }}
        >
          {/* Text */}
          <div>
            <Eyebrow className="mb-4">Payroll automation</Eyebrow>
            <h2
              className="font-display font-black text-ink-900 leading-[1.06] tracking-[-0.02em] mb-4"
              style={{ fontSize: "clamp(28px, 3.2vw, 42px)" }}
            >
              A seamless payroll run for your entire team.
            </h2>
            <p className="text-[17px] text-ink-600 leading-[1.7] max-w-[520px] mb-8">
              From employee register to approved payslips in under twenty minutes.
            </p>
            <div className="flex flex-col gap-6">
              {BULLETS.map(({ title, body }) => (
                <div key={title}>
                  <p className="flex items-center gap-2 text-[15px] font-bold text-ink-900 mb-1.5">
                    <span className="w-[7px] h-[7px] rounded-full bg-brand-900 shrink-0" aria-hidden />
                    {title}
                  </p>
                  <p className="text-[14px] text-ink-600 leading-[1.65] pl-[15px]">{body}</p>
                  <Link
                    href="/product"
                    className="flex items-center gap-1 text-[13px] font-bold text-brand-900 hover:text-brand-700 transition-colors pl-[15px] mt-1.5"
                  >
                    Learn more <ChevronRight size={12} aria-hidden />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* UI Card */}
          <div className="bg-white border border-ink-200 rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between px-5 py-4 bg-surface-alt border-b border-ink-200">
              <span className="text-[13px] font-bold text-ink-900">November 2025 · Payroll run</span>
              <span className="text-[11px] font-bold bg-brand-100 text-brand-800 px-2.5 py-1 rounded-full">
                48 employees
              </span>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: "Gross payroll", value: "KES 4.8M" },
                  { label: "Net payroll",   value: "KES 3.6M" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-surface-alt border border-ink-200 rounded-xl px-4 py-3">
                    <p className="text-[10px] font-semibold text-ink-400 uppercase tracking-[0.05em] mb-1.5">
                      {label}
                    </p>
                    <p className="text-[20px] font-black text-ink-900 tracking-tight">{value}</p>
                  </div>
                ))}
              </div>
              {EMPLOYEES.map(({ name, dept, amount, ready }) => (
                <div key={name} className="flex justify-between items-center py-2.5 border-b border-ink-100 last:border-0">
                  <div>
                    <p className="text-[13px] font-semibold text-ink-900">{name}</p>
                    <p className="text-[11px] text-ink-400">{dept}</p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-[12px] font-semibold text-ink-700">{amount}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ready ? "bg-brand-100 text-brand-800" : "bg-amber-light text-amber-dark"}`}>
                      {ready ? "Ready" : "Review"}
                    </span>
                  </div>
                </div>
              ))}
              <button className="mt-4 w-full flex items-center justify-center gap-1.5 bg-amber hover:bg-amber-dark text-ink-900 font-bold text-[13px] py-3 rounded-xl transition-colors">
                Approve payroll run <ChevronRight size={14} aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd /Users/lawrence-eq/Projects/andikisha/frontend/landing && pnpm tsc --noEmit 2>&1 | head -10
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/landing/components/features/FeaturePayrollRun.tsx
git commit -m "feat(landing): add FeaturePayrollRun section"
```

---

## Task 7: FeatureDisbursement

**Files:**
- Create: `frontend/landing/components/features/FeatureDisbursement.tsx`

- [ ] **Step 1: Create `FeatureDisbursement.tsx`**

```tsx
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";

const BULLETS = [
  {
    title: "Split disbursement in one approval",
    body: "Each employee chooses M-Pesa or bank. You approve once. Both channels execute simultaneously.",
  },
  {
    title: "Real-time delivery confirmation",
    body: "M-Pesa confirms within seconds. Bank transfers tracked to settlement. Full audit trail per employee.",
  },
];

const BATCHES = [
  { label: "M-Pesa — 34 employees",    amount: "KES 2,190,000", pct: 45,  processing: true  },
  { label: "Equity Bank — 9 employees", amount: "KES 1,204,800", pct: 100, processing: false },
  { label: "KCB Bank — 5 employees",    amount: "KES 1,417,600", pct: 100, processing: false },
];

export default function FeatureDisbursement() {
  return (
    <section className="bg-surface-alt py-[88px]">
      <Container>
        <div
          className="grid items-center"
          style={{ gridTemplateColumns: "6fr 5fr", gap: "72px" }}
        >
          {/* Dark card (left) */}
          <div className="bg-brand-900 border border-brand-800 rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
            <div className="flex items-center justify-between px-5 py-4 bg-white/[0.04] border-b border-white/[0.08]">
              <span className="text-[13px] font-bold text-white">November batch disbursement</span>
              <span className="text-[11px] font-bold bg-brand-500/20 text-brand-500 px-2.5 py-1 rounded-full">
                Approved
              </span>
            </div>
            <div className="p-5 flex flex-col gap-1">
              {BATCHES.map(({ label, amount, pct, processing }) => (
                <div key={label} className="py-3 border-b border-white/[0.07] last:border-0">
                  <div className="flex justify-between mb-2">
                    <span className="text-[12px] text-white/60 font-medium">{label}</span>
                    <span className="font-mono text-[13px] font-bold text-white">{amount}</span>
                  </div>
                  <div className="h-[5px] bg-white/10 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all ${processing ? "bg-amber" : "bg-brand-500"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-end">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${processing ? "bg-amber/20 text-amber" : "bg-brand-500/20 text-brand-500"}`}>
                      {processing ? "Processing" : "Sent"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Text (right) */}
          <div>
            <Eyebrow className="mb-4">Disbursement</Eyebrow>
            <h2
              className="font-display font-black text-ink-900 leading-[1.06] tracking-[-0.02em] mb-4"
              style={{ fontSize: "clamp(28px, 3.2vw, 42px)" }}
            >
              One pay run. M-Pesa and bank, together.
            </h2>
            <p className="text-[17px] text-ink-600 leading-[1.7] max-w-[440px] mb-8">
              Native Daraja API integration. Direct file integration with Equity, KCB, Co-op, NCBA,
              Stanbic and DTB. No re-keying, no second platform.
            </p>
            <div className="flex flex-col gap-6">
              {BULLETS.map(({ title, body }) => (
                <div key={title}>
                  <p className="flex items-center gap-2 text-[15px] font-bold text-ink-900 mb-1.5">
                    <span className="w-[7px] h-[7px] rounded-full bg-brand-900 shrink-0" aria-hidden />
                    {title}
                  </p>
                  <p className="text-[14px] text-ink-600 leading-[1.65] pl-[15px]">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd /Users/lawrence-eq/Projects/andikisha/frontend/landing && pnpm tsc --noEmit 2>&1 | head -10
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/landing/components/features/FeatureDisbursement.tsx
git commit -m "feat(landing): add FeatureDisbursement section"
```

---

## Task 8: FeatureComplianceGrid

**Files:**
- Create: `frontend/landing/components/features/FeatureComplianceGrid.tsx`

- [ ] **Step 1: Create `FeatureComplianceGrid.tsx`**

```tsx
import Link from "next/link";
import { FileText, Smartphone, CreditCard, Shield, ChevronRight } from "lucide-react";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";

const LEFT_CARDS = [
  {
    icon: FileText,
    title: "Automatic statutory filings",
    body: "P10A, NSSF schedule, SHIF remittance, Housing Levy — generated and submitted automatically after payroll approval.",
    href: "/product",
  },
  {
    icon: Smartphone,
    title: "Mobile-first for every employee",
    body: "Payslips on entry-level Android. PIN login, no password rules. Works on 3G — USSD fallback where bandwidth is poor.",
    href: "/product",
  },
];

const RIGHT_CARDS = [
  {
    icon: CreditCard,
    title: "M-Pesa and bank in one run",
    body: "Native Daraja API. Direct integration with Equity, KCB, Co-op, NCBA, Stanbic. No re-keying, no second platform.",
    href: "/product",
  },
  {
    icon: Shield,
    title: "Data hosted in Kenya",
    body: "KDPA compliant. Tenant isolation at the PostgreSQL schema level. AES-256 at rest, TLS 1.3 in transit.",
    href: "/security",
  },
];

function Card({
  icon: Icon, title, body, href,
}: { icon: React.ComponentType<{ size?: number; className?: string }>; title: string; body: string; href: string }) {
  return (
    <div className="bg-white border border-ink-200 rounded-2xl p-6 flex flex-col gap-3">
      <div className="w-10 h-10 rounded-[10px] bg-brand-50 flex items-center justify-center">
        <Icon size={20} className="text-brand-900" />
      </div>
      <p className="text-[14px] font-bold text-ink-900">{title}</p>
      <p className="text-[13px] text-ink-600 leading-[1.65] flex-1">{body}</p>
      <Link
        href={href}
        className="flex items-center gap-1 text-[13px] font-bold text-brand-900 hover:text-brand-700 transition-colors mt-auto"
      >
        Learn more <ChevronRight size={12} aria-hidden />
      </Link>
    </div>
  );
}

const MONTHS = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];
const GROSS = "0,60 60,54 120,50 180,45 240,39 300,28";
const NET   = "0,72 60,68 120,64 180,60 240,55 300,46";

export default function FeatureComplianceGrid() {
  return (
    <section className="bg-white py-[88px]">
      <Container>
        {/* Header */}
        <div className="text-center mb-14">
          <Eyebrow className="mb-4 inline-block">Built-in compliance</Eyebrow>
          <h2
            className="font-display font-black text-ink-900 leading-[1.06] tracking-[-0.02em] mb-4 mx-auto"
            style={{ fontSize: "clamp(28px, 3.2vw, 42px)", maxWidth: "600px" }}
          >
            Every Kenyan statutory rule, in writing and in code.
          </h2>
          <p className="text-[17px] text-ink-600 leading-[1.7] max-w-[560px] mx-auto">
            PAYE, NSSF, SHIF, Housing Levy, NITA, HELB. When the law changes, we ship the same day.
          </p>
        </div>

        {/* 3-col grid */}
        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1.6fr 1fr" }}>
          {/* Left column */}
          <div className="flex flex-col gap-4">
            {LEFT_CARDS.map((c) => <Card key={c.title} {...c} />)}
          </div>

          {/* Centre — spans 2 rows */}
          <div className="bg-white border border-ink-200 rounded-2xl p-6 flex flex-col gap-4 row-span-2">
            <p className="text-[14px] font-bold text-ink-900">Payroll cost over time</p>
            <p className="text-[13px] text-ink-600 leading-[1.65]">
              Track gross payroll, deductions, and net cost month over month across your organisation.
            </p>
            <div className="bg-surface-alt border border-ink-200 rounded-xl p-4 flex flex-col flex-1">
              <p className="text-[11px] font-semibold text-ink-400 uppercase tracking-[0.05em] mb-3">
                Monthly payroll — KES (millions)
              </p>
              <svg viewBox="0 0 300 90" className="w-full" style={{ height: 90 }} aria-hidden>
                <line x1="0" y1="22" x2="300" y2="22" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="0" y1="44" x2="300" y2="44" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="0" y1="66" x2="300" y2="66" stroke="#e5e7eb" strokeWidth="1" />
                <polygon points={`${GROSS} 300,90 0,90`} fill="rgba(11,61,46,0.06)" />
                <polyline points={GROSS} fill="none" stroke="#0b3d2e" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round" />
                <polygon points={`${NET} 300,90 0,90`} fill="rgba(232,160,32,0.06)" />
                <polyline points={NET} fill="none" stroke="#e8a020" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5,3" />
              </svg>
              <div className="flex justify-between mt-2">
                {MONTHS.map((m) => <span key={m} className="text-[10px] text-ink-400">{m}</span>)}
              </div>
              <div className="flex gap-4 mt-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-[2.5px] rounded bg-brand-900" />
                  <span className="text-[11px] text-ink-600">Gross</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-[2px] rounded bg-amber" />
                  <span className="text-[11px] text-ink-600">Net</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">
            {RIGHT_CARDS.map((c) => <Card key={c.title} {...c} />)}
          </div>
        </div>
      </Container>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd /Users/lawrence-eq/Projects/andikisha/frontend/landing && pnpm tsc --noEmit 2>&1 | head -10
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/landing/components/features/FeatureComplianceGrid.tsx
git commit -m "feat(landing): add FeatureComplianceGrid section"
```

---

## Task 9: ProductWalkthrough — restyle

**Files:**
- Modify: `frontend/landing/components/walkthrough/ProductWalkthrough.tsx`

The component logic (useState, step switching, phone screens) is correct — only visual classes change.

- [ ] **Step 1: Update section and step classes in `ProductWalkthrough.tsx`**

Change line 153 — the section opening tag:
```tsx
// Before:
<section className="py-24 bg-white">
// After:
<section className="py-[88px] bg-surface-alt">
```

Change the Eyebrow margin (line 155):
```tsx
// Before:
<Eyebrow className="mb-12">Product walkthrough</Eyebrow>
// After:
<Eyebrow className="mb-4">Product walkthrough</Eyebrow>
```

Add H2 below the Eyebrow (after line 155, before the grid div):
```tsx
<h2
  className="font-display font-black text-ink-900 leading-[1.06] tracking-[-0.02em] mb-12"
  style={{ fontSize: "clamp(28px, 3.2vw, 42px)" }}
>
  The full loop — gross pay to filed return.
</h2>
```

Change active step border color (line 168):
```tsx
// Before:
active === i ? "border-amber" : "border-ink-200 hover:border-ink-300"
// After (no change needed — border-amber already correct)
```

Change active step background (line 168 — add bg-white and rounded-r-lg to active):
```tsx
// Before:
active === i ? "border-amber" : "border-ink-200 hover:border-ink-300"
// After:
active === i ? "border-amber bg-white rounded-r-lg" : "border-ink-200 hover:border-ink-300"
```

Change step number color (line 177):
```tsx
// Before:
active === i ? "text-amber" : "text-ink-300"
// After: (no change — already correct)
```

Change step headline color (line 184):
```tsx
// Before:
active === i ? "text-ink-900" : "text-ink-400"
// After: (no change — already correct)
```

- [ ] **Step 2: Typecheck**

```bash
cd /Users/lawrence-eq/Projects/andikisha/frontend/landing && pnpm tsc --noEmit 2>&1 | head -10
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/landing/components/walkthrough/ProductWalkthrough.tsx
git commit -m "feat(landing): restyle ProductWalkthrough to match new design language"
```

---

## Task 10: ComplianceTimeline

**Files:**
- Create: `frontend/landing/components/compliance/ComplianceTimeline.tsx`

- [ ] **Step 1: Create `ComplianceTimeline.tsx`**

```tsx
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";

const EVENTS = [
  {
    date: "Oct 2024",
    title: "SHIF transition from NHIF",
    desc: "2.75% rate, new remittance target. Shipped same day.",
  },
  {
    date: "Mar 2024",
    title: "Housing Levy 1.5%",
    desc: "Employer match applied automatically from March payroll.",
  },
  {
    date: "Feb 2024",
    title: "NSSF Tier II uplift",
    desc: "New employer contribution tiers, live on effective date.",
  },
  {
    date: "Sep 2024",
    title: "Finance Bill 2024",
    desc: "PAYE band amendments applied across all pay runs.",
  },
  {
    date: "Jan 2024",
    title: "eTIMS rollout",
    desc: "VAT invoicing compliance supported across the platform.",
  },
];

export default function ComplianceTimeline() {
  return (
    <section className="bg-white py-[88px]">
      <Container>
        {/* Top — 2-col heading */}
        <div
          className="grid gap-12 mb-14"
          style={{ gridTemplateColumns: "5fr 6fr" }}
        >
          <div>
            <Eyebrow className="mb-4">Compliance is our operating model</Eyebrow>
            <h2
              className="font-display font-black text-ink-900 leading-[1.06] tracking-[-0.02em]"
              style={{ fontSize: "clamp(28px, 3.2vw, 42px)" }}
            >
              When the rules change, we ship the same day.
            </h2>
          </div>
          <p className="text-[17px] text-ink-600 leading-[1.7] self-end">
            Kenyan statutory law changes several times a year — Finance Acts, NSSF transitions,
            SHIF rate changes, new KRA filing formats. We track the legislative cycle and ship
            rate updates the day they take effect, not when someone remembers to check.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative border-t-2 border-ink-200 pt-6 grid grid-cols-5 gap-4">
          {EVENTS.map(({ date, title, desc }) => (
            <div key={date} className="relative">
              {/* Dot on the border line */}
              <div
                className="absolute -top-[26px] left-0 w-[10px] h-[10px] rounded-full bg-brand-900 border-2 border-white shadow-[0_0_0_2px_#e5e7eb]"
                aria-hidden
              />
              <p className="text-[10px] font-bold text-brand-700 uppercase tracking-[0.1em] mb-2">
                {date}
              </p>
              <p className="text-[13px] font-bold text-ink-900 leading-[1.35] mb-1.5">{title}</p>
              <p className="text-[12px] text-ink-600 leading-[1.5]">{desc}</p>
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
cd /Users/lawrence-eq/Projects/andikisha/frontend/landing && pnpm tsc --noEmit 2>&1 | head -10
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/landing/components/compliance/ComplianceTimeline.tsx
git commit -m "feat(landing): add ComplianceTimeline section"
```

---

## Task 11: StatsBand

**Files:**
- Create: `frontend/landing/components/stats/StatsBand.tsx`

- [ ] **Step 1: Create `StatsBand.tsx`**

```tsx
import Container from "@/components/ui/Container";

/* TODO: replace with verified metrics post-launch */
const STATS = [
  { num: "240", suffix: "+",  label: "Businesses on the platform" },
  { num: "1.2", suffix: "B",  label: "KES processed monthly" },
  { num: "100", suffix: "%",  label: "On-time statutory filings" },
  { num: "<20", suffix: "m",  label: "Average payroll run" },
] as const;

export default function StatsBand() {
  return (
    <section className="bg-white border-t border-ink-100 border-b border-ink-100 py-16">
      <Container>
        <div className="grid grid-cols-4 max-w-[900px] mx-auto">
          {STATS.map(({ num, suffix, label }, i) => (
            <div
              key={label}
              className={`text-center px-6 ${i < STATS.length - 1 ? "border-r border-ink-100" : ""}`}
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

- [ ] **Step 2: Typecheck**

```bash
cd /Users/lawrence-eq/Projects/andikisha/frontend/landing && pnpm tsc --noEmit 2>&1 | head -10
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/landing/components/stats/StatsBand.tsx
git commit -m "feat(landing): add StatsBand section"
```

---

## Task 12: TrustSection — fix background colour

**Files:**
- Modify: `frontend/landing/components/trust/TrustSection.tsx`

- [ ] **Step 1: Fix bg and padding in `TrustSection.tsx`**

Line 14 — change section opening:
```tsx
// Before:
<section className="bg-[#111111] py-24">
// After:
<section className="bg-brand-950 py-[88px]">
```

- [ ] **Step 2: Typecheck**

```bash
cd /Users/lawrence-eq/Projects/andikisha/frontend/landing && pnpm tsc --noEmit 2>&1 | head -10
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/landing/components/trust/TrustSection.tsx
git commit -m "fix(landing): TrustSection bg brand-950 (was #111111)"
```

---

## Task 13: JoinCTA

**Files:**
- Create: `frontend/landing/components/cta/JoinCTA.tsx`

- [ ] **Step 1: Create `JoinCTA.tsx`**

```tsx
import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";
import Container from "@/components/ui/Container";

const FEATURES = [
  "PAYE, NSSF, SHIF, Housing Levy — calculated correctly",
  "M-Pesa and bank disbursement in one run",
  "P10A, NSSF, SHIF filings — auto after approval",
  "Employee payslips via SMS or WhatsApp",
  "KRA P9 annual returns at year-end",
  "Data hosted in Kenya — KDPA compliant",
];

export default function JoinCTA() {
  return (
    <section className="bg-white py-[88px]">
      <Container>
        <div
          className="grid items-center"
          style={{ gridTemplateColumns: "1fr 1fr", gap: "56px" }}
        >
          {/* Left */}
          <div>
            <h2
              className="font-display font-black text-ink-900 leading-[1.06] tracking-[-0.02em] mb-5"
              style={{ fontSize: "clamp(28px, 3.2vw, 42px)" }}
            >
              Join 240+ businesses growing with AndikishaHR.
            </h2>
            <p className="text-[17px] text-ink-600 leading-[1.7] mb-8">
              Start your 30-day free trial. No credit card required. Founding customer pricing
              locked for 24 months for our first 50 customers.
            </p>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 bg-amber hover:bg-amber-dark text-ink-900 font-bold text-[15px] px-7 py-3.5 rounded-lg transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2"
            >
              Schedule a demo <ChevronRight size={15} aria-hidden />
            </Link>
          </div>

          {/* Right — feature checklist */}
          <div className="bg-surface-alt border border-ink-200 rounded-2xl p-7">
            <p className="text-[14px] font-bold text-ink-900 mb-1">
              Everything you need to run payroll
            </p>
            <p className="text-[13px] text-ink-400 mb-5">Included on every plan</p>
            <div className="flex flex-col">
              {FEATURES.map((feat) => (
                <div
                  key={feat}
                  className="flex items-center gap-3 py-3 border-b border-ink-200 last:border-0"
                >
                  <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                    <Check size={10} className="text-brand-700" strokeWidth={3} />
                  </div>
                  <span className="text-[13px] text-ink-700 font-medium">{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd /Users/lawrence-eq/Projects/andikisha/frontend/landing && pnpm tsc --noEmit 2>&1 | head -10
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/landing/components/cta/JoinCTA.tsx
git commit -m "feat(landing): add JoinCTA section"
```

---

## Task 14: NewsletterSection

**Files:**
- Create: `frontend/landing/components/layout/NewsletterSection.tsx`

- [ ] **Step 1: Create `NewsletterSection.tsx`**

```tsx
import NewsletterForm from "@/components/ui/NewsletterForm";

export default function NewsletterSection() {
  return (
    <section className="bg-brand-900 py-12 px-14">
      <div className="mx-auto max-w-[1120px] flex items-center justify-between gap-10 flex-wrap">
        <div>
          <h3 className="text-[22px] font-bold text-white tracking-[-0.01em] mb-1.5">
            Stay ahead of compliance changes.
          </h3>
          <p className="text-[14px] text-white/45">
            Statutory updates, platform news, and payroll guidance — straight to your inbox.
          </p>
        </div>
        <div className="shrink-0 min-w-[320px]">
          <NewsletterForm />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd /Users/lawrence-eq/Projects/andikisha/frontend/landing && pnpm tsc --noEmit 2>&1 | head -10
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/landing/components/layout/NewsletterSection.tsx
git commit -m "feat(landing): add NewsletterSection"
```

---

## Task 15: FaqList — 2-column grid layout

**Files:**
- Modify: `frontend/landing/components/faq/FaqList.tsx`

- [ ] **Step 1: Replace `FaqList.tsx` with 2-column grid layout**

Keep the `FAQS` array unchanged. Replace only the JSX return:

```tsx
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";

// ... keep existing FAQS const unchanged ...

export default function FaqList() {
  return (
    <section className="bg-surface-alt py-[88px]">
      <Container>
        <Eyebrow className="mb-4">FAQ</Eyebrow>
        <h2
          className="font-display font-black text-ink-900 leading-[1.06] tracking-[-0.02em] mb-12"
          style={{ fontSize: "clamp(28px, 3.2vw, 42px)" }}
        >
          Everything buyers actually ask.
        </h2>

        <div className="grid grid-cols-2">
          {FAQS.map(({ q, a }, i) => {
            const isOdd  = i % 2 === 0;
            return (
              <details
                key={i}
                className={[
                  "group border-b border-ink-200",
                  isOdd ? "border-r border-ink-200 pr-8" : "pl-8",
                ].join(" ")}
              >
                <summary className="flex items-center justify-between gap-4 py-5 cursor-pointer list-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2 rounded-sm">
                  <span className="text-[14px] font-bold text-ink-900 leading-snug">{q}</span>
                  <svg
                    width="16" height="16" viewBox="0 0 16 16" fill="none"
                    className="shrink-0 transition-transform duration-200 group-open:rotate-180 text-ink-400"
                    aria-hidden
                  >
                    <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.5"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </summary>
                <p className="pb-5 text-[14px] text-ink-600 leading-[1.7]">{a}</p>
              </details>
            );
          })}
        </div>

        <p className="text-[14px] text-ink-600 mt-10">
          Still have questions?{" "}
          <a
            href="/contact"
            className="text-brand-700 underline underline-offset-2 hover:text-brand-900 transition-colors"
          >
            Contact the team.
          </a>
        </p>
      </Container>
    </section>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd /Users/lawrence-eq/Projects/andikisha/frontend/landing && pnpm tsc --noEmit 2>&1 | head -10
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/landing/components/faq/FaqList.tsx
git commit -m "feat(landing): FaqList — 2-column grid layout"
```

---

## Task 16: Footer — add Resources column, remove embedded newsletter

**Files:**
- Modify: `frontend/landing/components/layout/Footer.tsx`

The current Footer already has `bg-brand-950` and `LogoFull variant="white-mark"`. Two changes: add Resources link column, remove the `<NewsletterForm />` and compliance badges from the brand column.

- [ ] **Step 1: Replace `Footer.tsx`**

```tsx
import Link from "next/link";
import { LogoFull } from "@andikisha/ui";

const PRODUCT_LINKS = [
  { label: "Payroll & Compliance",  href: "/product#payroll" },
  { label: "Employee Self-Service", href: "/product#self-service" },
  { label: "Leave Management",      href: "/product#leave" },
  { label: "Time & Attendance",     href: "/product#time-attendance" },
  { label: "M-Pesa Disbursements",  href: "/product#disbursements" },
  { label: "Pricing",               href: "/pricing" },
];

const COMPANY_LINKS = [
  { label: "About Us",  href: "/about" },
  { label: "Partners",  href: "/partners" },
  { label: "Blog",      href: "/blog" },
  { label: "Careers",   href: "/about#careers" },
  { label: "Contact",   href: "/contact" },
];

const RESOURCE_LINKS = [
  { label: "Blog",             href: "/blog" },
  { label: "Compliance guide", href: "/blog" },
  { label: "Calculator",       href: "/#calculator" },
  { label: "Help centre",      href: "/contact" },
  { label: "Support",          href: "/contact" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy",   href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Data Processing",  href: "/dpa" },
  { label: "Security",         href: "/security" },
  { label: "Cookie Policy",    href: "/privacy#cookies" },
];

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/35 mb-5">
        {title}
      </p>
      <ul className="flex flex-col gap-3">
        {links.map(({ label, href }) => (
          <li key={href}>
            <Link
              href={href}
              className="text-[13px] text-white/50 hover:text-white/85 transition-colors duration-200"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-brand-950 text-white/60">
      <div className="mx-auto max-w-[1320px] px-6 md:px-12 pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-10 mb-14">
          {/* Brand — 2 cols */}
          <div className="lg:col-span-2">
            <Link href="/" aria-label="AndikishaHR home" className="mb-5 inline-block">
              <LogoFull variant="white-mark" className="h-[22px] w-auto" />
            </Link>
            <p className="text-[13px] text-white/40 leading-[1.65] mt-4 max-w-[240px] mb-4">
              HR and payroll, calculated correctly. Built for modern African businesses.
            </p>
            <p className="text-[12px] text-white/25 leading-[1.65]">
              Westlands Business Park<br />
              Nairobi, Kenya<br />
              hello@andikishahr.com
            </p>
          </div>

          <FooterCol title="Product"   links={PRODUCT_LINKS} />
          <FooterCol title="Company"   links={COMPANY_LINKS} />
          <FooterCol title="Resources" links={RESOURCE_LINKS} />
          <FooterCol title="Legal"     links={LEGAL_LINKS} />
        </div>

        <div className="border-t border-white/[0.07] pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-[12px] text-white/25">
            © {new Date().getFullYear()} AndikishaHR Limited. All rights reserved.
            <span className="ml-3 text-white/15">KDPA Reg: [PENDING]</span>
          </p>
          <div className="flex items-center gap-5">
            {[
              { label: "LinkedIn",   href: "https://linkedin.com/company/andikishahr" },
              { label: "X (Twitter)", href: "https://twitter.com/andikishahr" },
              { label: "YouTube",    href: "https://youtube.com/@andikishahr" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] text-white/30 hover:text-white/65 transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd /Users/lawrence-eq/Projects/andikisha/frontend/landing && pnpm tsc --noEmit 2>&1 | head -10
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/landing/components/layout/Footer.tsx
git commit -m "feat(landing): Footer — add Resources column, remove embedded newsletter"
```

---

## Task 17: Wire page.tsx + delete removed components

**Files:**
- Modify: `frontend/landing/app/page.tsx`
- Delete: `frontend/landing/components/social-proof/SocialProofStrip.tsx`
- Delete: `frontend/landing/components/founding/FoundingCustomer.tsx`
- Delete: `frontend/landing/components/personas/Personas.tsx`
- Delete: `frontend/landing/components/how-it-works/HowItWorks.tsx`
- Delete: `frontend/landing/components/cta/FinalCTABanner.tsx`
- Delete: `frontend/landing/components/compliance/ComplianceProofStrip.tsx`

- [ ] **Step 1: Replace `app/page.tsx`**

```tsx
import type { Metadata } from "next";
import Hero                  from "@/components/hero/Hero";
import LogosRow              from "@/components/logos/LogosRow";
import FeaturePayrollRun     from "@/components/features/FeaturePayrollRun";
import FeatureDisbursement   from "@/components/features/FeatureDisbursement";
import FeatureComplianceGrid from "@/components/features/FeatureComplianceGrid";
import PayrollCalculator     from "@/components/calculator/PayrollCalculator";
import ProductWalkthrough    from "@/components/walkthrough/ProductWalkthrough";
import ComplianceTimeline    from "@/components/compliance/ComplianceTimeline";
import StatsBand             from "@/components/stats/StatsBand";
import TrustSection          from "@/components/trust/TrustSection";
import JoinCTA               from "@/components/cta/JoinCTA";
import NewsletterSection     from "@/components/layout/NewsletterSection";
import FaqList               from "@/components/faq/FaqList";

export const metadata: Metadata = {
  title: "AndikishaHR — Kenyan HR and payroll, calculated correctly",
  description:
    "Statutory deductions to the cent. Payslips on the phones your team already uses. Salary disbursement on M-Pesa. Built for modern African businesses.",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <LogosRow />
      <FeaturePayrollRun />
      <FeatureDisbursement />
      <FeatureComplianceGrid />
      <div id="calculator">
        <PayrollCalculator />
      </div>
      <ProductWalkthrough />
      <ComplianceTimeline />
      <StatsBand />
      <TrustSection />
      <JoinCTA />
      <NewsletterSection />
      <FaqList />
    </>
  );
}
```

- [ ] **Step 2: Delete removed component files**

```bash
rm frontend/landing/components/social-proof/SocialProofStrip.tsx \
   frontend/landing/components/founding/FoundingCustomer.tsx \
   frontend/landing/components/personas/Personas.tsx \
   frontend/landing/components/how-it-works/HowItWorks.tsx \
   frontend/landing/components/cta/FinalCTABanner.tsx \
   frontend/landing/components/compliance/ComplianceProofStrip.tsx
```

- [ ] **Step 3: Typecheck — full clean pass**

```bash
cd /Users/lawrence-eq/Projects/andikisha/frontend/landing && pnpm tsc --noEmit 2>&1
```

Expected: 0 errors.

- [ ] **Step 4: Start dev server and verify full page renders**

```bash
cd /Users/lawrence-eq/Projects/andikisha/frontend/landing && pnpm dev
```

Open `http://localhost:3002` and verify:
- Navbar: real logo, "Log in" + "Schedule a demo" amber button, no announcement strip
- Hero: centered headline in Bricolage Grotesque, single amber CTA, browser mockup with real logo in sidebar, gradient fade at bottom
- Logos row: 6 companies with monogram boxes
- Feature 1: text left, payroll UI card right
- Feature 2: dark M-Pesa card left, text right, `bg-surface-alt` background
- Feature 3: centered header, 3-col grid, chart in centre card
- Calculator: anchored at `#calculator`
- Walkthrough: `bg-surface-alt`, H2 visible, phone mockup sticky
- Compliance timeline: 2-col header, horizontal 5-point timeline
- Stats: 4 large numbers, amber suffixes
- Trust: `bg-brand-950` (not `#111111`), checklist
- JoinCTA: text left + checklist card right, single amber CTA
- Newsletter: `bg-brand-900` bar
- FAQ: 2-column grid of `<details>` items
- Footer: real logo, 4 link columns (Product, Company, Resources, Legal), social links

- [ ] **Step 5: Commit**

```bash
git add frontend/landing/app/page.tsx \
        frontend/landing/components/social-proof/ \
        frontend/landing/components/founding/ \
        frontend/landing/components/personas/ \
        frontend/landing/components/how-it-works/ \
        frontend/landing/components/cta/FinalCTABanner.tsx \
        frontend/landing/components/compliance/ComplianceProofStrip.tsx
git commit -m "feat(landing): wire page.tsx, delete removed components — redesign complete"
```

---

## Spec Coverage Check

| Spec requirement | Task |
|---|---|
| Bricolage Grotesque for display headlines | Task 1 |
| Single "Schedule a demo" amber CTA throughout | Tasks 2, 4, 13, 17 |
| No announcement strip | Task 2 |
| Real logo (LogoFull SVG) in nav, sidebar, footer | Tasks 2, 3, 16 |
| Lucide icons in sidebar, feature cards, CTAs | Tasks 3, 6, 8, 13 |
| Centered hero + browser mockup | Tasks 3, 4 |
| Hero pill links to #calculator | Task 4 |
| Logos row — 6 placeholder companies | Task 5 |
| Feature 1 — payroll run, text/card split | Task 6 |
| Feature 2 — M-Pesa, reversed, dark card | Task 7 |
| Feature grid — 3-col, chart centre | Task 8 |
| Product walkthrough — bg-surface-alt, H2 added | Task 9 |
| Compliance timeline — 2-col header, 5-point | Task 10 |
| Stats band — 4 numbers, amber suffix | Task 11 |
| TrustSection — bg-brand-950 | Task 12 |
| JoinCTA — text + feature checklist | Task 13 |
| NewsletterSection — bg-brand-900 bar | Task 14 |
| FAQ — 2-col grid | Task 15 |
| Footer — 4 link columns, newsletter removed | Task 16 |
| page.tsx — correct render order, #calculator anchor | Task 17 |
| Delete SocialProofStrip, Personas, HowItWorks, FinalCTABanner | Task 17 |
