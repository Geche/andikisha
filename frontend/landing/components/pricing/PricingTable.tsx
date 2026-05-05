"use client";

import { useState } from "react";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Starter",
    price: "KES 350",
    unit: "per employee / month",
    headcount: "Up to 25 employees",
    cta: "Start free trial",
    href: "/pricing",
    featured: false,
  },
  {
    name: "Growth",
    price: "KES 280",
    unit: "per employee / month",
    headcount: "26 – 200 employees",
    cta: "Start free trial",
    href: "/pricing",
    featured: true,
    badge: "Most popular",
  },
  {
    name: "Scale",
    price: "KES 220",
    unit: "per employee / month (annual)",
    headcount: "200+ employees",
    cta: "Talk to sales",
    href: "/contact",
    featured: false,
  },
];

type CellValue = boolean | string;

interface Row {
  feature: string;
  starter: CellValue;
  growth: CellValue;
  scale: CellValue;
}

const CORE_ROWS: Row[] = [
  { feature: "Full payroll & statutory filings (PAYE, NSSF, SHIF, Housing Levy)", starter: true, growth: true, scale: true },
  { feature: "Employee self-service portal (PWA)", starter: true, growth: true, scale: true },
  { feature: "M-Pesa salary disbursement", starter: true, growth: true, scale: true },
  { feature: "KRA one-click filing", starter: true, growth: true, scale: true },
  { feature: "SMS payslip delivery", starter: true, growth: true, scale: true },
];

const EXTENDED_ROWS: Row[] = [
  { feature: "WhatsApp payslip delivery", starter: false, growth: true, scale: true },
  { feature: "Leave & absence management", starter: false, growth: true, scale: true },
  { feature: "Time & attendance tracking", starter: false, growth: true, scale: true },
  { feature: "Expense management", starter: false, growth: true, scale: true },
  { feature: "Multi-approver workflows", starter: false, growth: true, scale: true },
  { feature: "Basic analytics & reporting", starter: false, growth: true, scale: true },
  { feature: "Advanced analytics dashboard", starter: false, growth: false, scale: true },
  { feature: "Custom API integrations", starter: false, growth: false, scale: true },
  { feature: "Dedicated success manager", starter: false, growth: false, scale: true },
  { feature: "Multi-branch / multi-county payroll", starter: false, growth: false, scale: true },
  { feature: "SLA guarantee (99.9% uptime)", starter: false, growth: false, scale: true },
  { feature: "Audit log retention", starter: "1 year", growth: "3 years", scale: "7 years" },
  { feature: "Support channel", starter: "Email", growth: "Chat + phone", scale: "Dedicated manager" },
];

function Cell({ value }: { value: CellValue }) {
  if (typeof value === "string") {
    return <span className="font-mono text-[13px] text-ink-700">{value}</span>;
  }
  if (value) {
    return <span className="text-[13px] font-semibold text-brand-500">Yes</span>;
  }
  return <span className="text-[13px] text-ink-300 select-none">—</span>;
}

function FeatureRow({ row, index }: { row: Row; index: number }) {
  return (
    <div
      className={cn(
        "grid items-center border-b border-ink-100 last:border-0",
        "grid-cols-[1fr_100px_100px_100px] lg:grid-cols-[1fr_140px_140px_140px]"
      )}
      style={{ background: index % 2 === 0 ? "transparent" : "rgba(248,247,244,0.5)" }}
    >
      <div className="py-3 pr-4 text-[14px] text-ink-700 leading-snug">{row.feature}</div>
      <div className="py-3 text-center"><Cell value={row.starter} /></div>
      <div className="py-3 text-center"><Cell value={row.growth} /></div>
      <div className="py-3 text-center"><Cell value={row.scale} /></div>
    </div>
  );
}

export default function PricingTable() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="py-24 bg-surface-alt" id="pricing">
      <Container>
        <div className="mb-12">
          <Eyebrow className="mb-4">Pricing</Eyebrow>
          <h2
            className="font-display font-bold text-ink-900 mb-3"
            style={{ fontSize: "clamp(2.25rem, 4vw, 3.5rem)", lineHeight: "1.05", letterSpacing: "-0.015em" }}
          >
            Simple pricing.
            <br />No surprises.
          </h2>
          <p className="text-[17px] text-ink-600">
            All prices in KES. Annual billing saves 15%. VAT applied where applicable.
          </p>
        </div>

        {/* Plan headers — CSS grid, column widths match the rows below */}
        <div className={cn(
          "grid mb-1",
          "grid-cols-[1fr_100px_100px_100px] lg:grid-cols-[1fr_140px_140px_140px]"
        )}>
          <div /> {/* feature label column spacer */}
          {PLANS.map((plan) => (
            <div key={plan.name} className="px-2 pb-4">
              <div className={cn(
                "rounded-xl p-4 border",
                plan.featured
                  ? "bg-brand-900 border-brand-900"
                  : "bg-white border-ink-200"
              )}>
                {plan.badge && (
                  <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-amber mb-1">{plan.badge}</p>
                )}
                <p className={cn("font-display font-bold text-[15px] mb-1", plan.featured ? "text-white" : "text-ink-900")}>
                  {plan.name}
                </p>
                <p className={cn("font-bold text-[18px] font-mono tabular-nums leading-tight", plan.featured ? "text-amber" : "text-ink-900")}
                  style={{ fontFeatureSettings: '"tnum" 1' }}>
                  {plan.price}
                </p>
                <p className={cn("text-[10px] mb-3 leading-tight", plan.featured ? "text-white/50" : "text-ink-400")}>
                  {plan.unit}
                </p>
                <p className={cn("text-[10px] mb-3", plan.featured ? "text-white/60" : "text-ink-500")}>
                  {plan.headcount}
                </p>
                <Link
                  href={plan.href}
                  className={cn(
                    "block text-center py-1.5 rounded-lg text-[11px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2",
                    plan.featured
                      ? "bg-amber text-ink-900 hover:bg-amber-dark"
                      : "bg-ink-900 text-white hover:bg-ink-700"
                  )}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Core feature rows */}
        <div className="bg-white rounded-xl border border-ink-200 overflow-hidden">
          <div className={cn(
            "grid border-b border-ink-200 bg-ink-100/50",
            "grid-cols-[1fr_100px_100px_100px] lg:grid-cols-[1fr_140px_140px_140px]"
          )}>
            <div className="py-2.5 px-0 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-400">Features</div>
            {PLANS.map((p) => (
              <div key={p.name} className="py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-400">
                {p.name}
              </div>
            ))}
          </div>

          {CORE_ROWS.map((row, i) => <FeatureRow key={row.feature} row={row} index={i} />)}

          {/* Expanded rows */}
          {expanded && EXTENDED_ROWS.map((row, i) => (
            <FeatureRow key={row.feature} row={row} index={CORE_ROWS.length + i} />
          ))}
        </div>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-5 flex items-center gap-2 text-[14px] font-medium text-brand-700 hover:text-brand-900 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2 rounded-sm"
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
