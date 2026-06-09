"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import { cn } from "@/lib/utils";

interface Plan {
  name: string;
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
];

function Cell({ value }: { value: boolean | string }) {
  if (value === true) {
    return <Check size={15} className="text-brand-500" aria-label="Included" />;
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
            Talk to us for a quote tailored to your team size.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-5">
          {PLANS.map((plan) => (
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
                  "text-[13px] mb-6",
                  plan.featured ? "text-white/50" : "text-ink-600"
                )}
              >
                {plan.headcount}
              </p>
              <Link
                href={plan.href}
                className={cn(
                  "block text-center py-3 rounded-lg text-[14px] font-semibold transition-colors duration-200 focus-ring",
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
          ))}
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

        {/* Per-tier feature comparison (what each plan includes) */}
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
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr] lg:grid-cols-[3fr_140px_140px_140px] border-t border-ink-100">
                <div className="py-3.5 pl-5 pr-4 text-[14px] text-ink-700 leading-snug">
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
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-4 flex items-center gap-1.5 text-[14px] font-medium text-brand-700 hover:text-brand-900 transition-colors duration-200 focus-ring rounded-sm"
          aria-expanded={expanded}
        >
          {expanded ? "Show less" : "Compare all features"}
          <ChevronDown
            size={15}
            className={cn("transition-transform duration-200", expanded && "rotate-180")}
            aria-hidden="true"
          />
        </button>
      </Container>
    </section>
  );
}
