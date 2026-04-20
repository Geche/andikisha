import type { Metadata } from "next";
import Link from "next/link";
import { Check, X as XIcon, ArrowRight } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { PRICING_PLANS, FAQ_ITEMS } from "@/lib/data";
import FAQSection from "@/components/home/FAQSection";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for Kenyan businesses. Starter from KES 500 per employee per month. No hidden fees. Full Kenya statutory compliance on every plan.",
};

const COMPARISON_FEATURES = [
  {
    category: "Payroll & Compliance",
    rows: [
      { feature: "PAYE, NSSF, SHIF, Housing Levy calculation", starter: true, growth: true, scale: true },
      { feature: "KRA one-click filing", starter: true, growth: true, scale: true },
      { feature: "Payslip delivery (SMS + email)", starter: true, growth: true, scale: true },
      { feature: "Multi-currency support", starter: false, growth: false, scale: true },
      { feature: "Contractor / casual worker payroll", starter: false, growth: true, scale: true },
    ],
  },
  {
    category: "People Management",
    rows: [
      { feature: "Employee profiles and records", starter: true, growth: true, scale: true },
      { feature: "Document management", starter: true, growth: true, scale: true },
      { feature: "Leave management", starter: false, growth: true, scale: true },
      { feature: "Time & attendance tracking", starter: false, growth: true, scale: true },
      { feature: "Expense management", starter: false, growth: true, scale: true },
      { feature: "Multi-branch payroll", starter: false, growth: false, scale: true },
    ],
  },
  {
    category: "Employee Experience",
    rows: [
      { feature: "Employee self-service portal", starter: true, growth: true, scale: true },
      { feature: "M-Pesa salary disbursement", starter: false, growth: true, scale: true },
      { feature: "WhatsApp & SMS notifications", starter: false, growth: true, scale: true },
      { feature: "Swahili language option", starter: true, growth: true, scale: true },
      { feature: "USSD access for field workers", starter: false, growth: false, scale: true },
    ],
  },
  {
    category: "Support & SLA",
    rows: [
      { feature: "Email support", starter: true, growth: true, scale: true },
      { feature: "Chat & phone support", starter: false, growth: true, scale: true },
      { feature: "Guided onboarding call", starter: false, growth: true, scale: true },
      { feature: "Dedicated account manager", starter: false, growth: false, scale: true },
      { feature: "SLA guarantee", starter: false, growth: false, scale: true },
    ],
  },
];

function Cell({ value }: { value: boolean | string }) {
  if (typeof value === "boolean") {
    return value ? (
      <div className="flex justify-center">
        <div className="w-5 h-5 rounded-full bg-brand-50 flex items-center justify-center">
          <Check size={11} strokeWidth={3} className="text-brand-700" aria-hidden="true" />
        </div>
      </div>
    ) : (
      <div className="flex justify-center">
        <XIcon size={14} className="text-neutral-300" aria-hidden="true" />
      </div>
    );
  }
  return <span className="text-[13px] text-neutral-700">{value}</span>;
}

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-hero-gradient py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(232,160,32,0.08)_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-[1320px] mx-auto px-6 md:px-12 relative z-10 text-center">
          <AnimatedSection>
            <p className="section-eyebrow-white">Pricing</p>
          </AnimatedSection>
          <AnimatedSection delay={100}>
            <h1 className="font-display text-[48px] md:text-[58px] font-extrabold text-white max-w-[680px] mx-auto mb-5">
              Pricing that makes sense at every stage.
            </h1>
          </AnimatedSection>
          <AnimatedSection delay={200}>
            <p className="text-[18px] text-white/70 max-w-[520px] mx-auto">
              No hidden fees. No per-module charges. One flat rate per employee,
              per month. Full Kenya statutory compliance on every plan.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="py-20 bg-surface-alt">
        <div className="max-w-[1320px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {PRICING_PLANS.map((plan, i) => (
              <AnimatedSection key={plan.name} delay={([0, 100, 200] as const)[i]}>
                <div
                  className={cn(
                    "relative rounded-2xl p-8 border transition-all duration-200",
                    plan.featured
                      ? "bg-brand-950 border-brand-900 text-white shadow-[0_20px_60px_rgba(11,61,46,0.25)] md:scale-[1.04]"
                      : "bg-white border-neutral-200"
                  )}
                >
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber text-neutral-900 text-[12px] font-bold px-4 py-1 rounded-full whitespace-nowrap">
                      {plan.badge}
                    </div>
                  )}
                  <h2 className={cn("font-display font-bold text-[20px] mb-2", plan.featured ? "text-white" : "text-neutral-900")}>
                    {plan.name}
                  </h2>
                  <p className={cn("text-[14px] mb-6", plan.featured ? "text-white/60" : "text-neutral-600")}>
                    {plan.description}
                  </p>
                  <p className={cn("font-mono font-medium mb-1", plan.price === "Custom" ? "text-[28px]" : "text-[38px]", plan.featured ? "text-white" : "text-neutral-900")}>
                    {plan.price}
                  </p>
                  <p className={cn("text-[14px] mb-8", plan.featured ? "text-white/50" : "text-neutral-600")}>
                    {plan.unit}
                  </p>
                  <ul className="flex flex-col gap-3 mb-8">
                    {plan.features.map((f) => (
                      <li key={f} className={cn("flex items-start gap-2.5 text-[14px]", plan.featured ? "text-white/80" : "text-neutral-700")}>
                        <div className={cn("w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 mt-0.5", plan.featured ? "bg-brand-500/20 text-brand-500" : "bg-brand-50 text-brand-700")}>
                          <Check size={10} strokeWidth={3} aria-hidden="true" />
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.ctaHref} className={cn("w-full justify-center text-center", plan.featured ? "btn-primary" : "btn-outline-dark")}>
                    {plan.cta}
                  </Link>
                </div>
              </AnimatedSection>
            ))}
          </div>
          <AnimatedSection>
            <p className="text-center text-[13px] text-neutral-400 mt-6">
              Prices shown are indicative and subject to final confirmation at launch.
              All plans include full Kenya statutory compliance.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-20 bg-white overflow-x-auto">
        <div className="max-w-[1320px] mx-auto px-6 md:px-12">
          <div className="text-center mb-12">
            <AnimatedSection>
              <p className="section-eyebrow">Full Comparison</p>
            </AnimatedSection>
            <AnimatedSection delay={100}>
              <h2 className="section-title mx-auto max-w-[480px]">
                What&apos;s included in each plan
              </h2>
            </AnimatedSection>
          </div>

          <div className="min-w-[640px]">
            {/* Header row */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 mb-6 text-center">
              <div />
              {PRICING_PLANS.map((p) => (
                <div key={p.name} className={cn("font-display font-bold text-[17px] py-3 rounded-xl", p.featured ? "bg-brand-900 text-white" : "bg-surface-alt text-neutral-900")}>
                  {p.name}
                </div>
              ))}
            </div>

            {COMPARISON_FEATURES.map((section) => (
              <div key={section.category} className="mb-6">
                <div className="text-[12px] font-bold uppercase tracking-[0.08em] text-neutral-400 mb-3 font-body">
                  {section.category}
                </div>
                {section.rows.map((row, i) => (
                  <div
                    key={row.feature}
                    className={cn(
                      "grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 py-3 items-center",
                      i % 2 === 0 ? "bg-surface-alt rounded-lg px-3" : "px-3"
                    )}
                  >
                    <span className="text-[14px] text-neutral-700">{row.feature}</span>
                    <Cell value={row.starter} />
                    <Cell value={row.growth} />
                    <Cell value={row.scale} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQSection />

      {/* Final nudge */}
      <section className="bg-brand-50 py-16 border-t border-brand-100">
        <div className="max-w-[1320px] mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-display font-bold text-[26px] text-neutral-900 mb-2">
              Not sure which plan fits?
            </h3>
            <p className="text-[16px] text-neutral-600">
              Start with the 14-day free trial on any plan. No credit card.
              Downgrade or cancel any time.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link href="/demo" className="btn-primary inline-flex items-center gap-2">
              Talk to Sales <ArrowRight size={15} aria-hidden="true" />
            </Link>
            <Link href="/pricing" className="btn-outline-dark">
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
