import Link from "next/link";
import { Check } from "lucide-react";
import { PRICING_PLANS } from "@/lib/data";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { cn } from "@/lib/utils";

export default function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-[1320px] mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="text-center mb-14">
          <AnimatedSection>
            <p className="section-eyebrow">Pricing</p>
          </AnimatedSection>
          <AnimatedSection delay={100}>
            <h2 className="section-title mx-auto max-w-[560px]">
              Pricing that makes sense at every stage
            </h2>
          </AnimatedSection>
          <AnimatedSection delay={200}>
            <p className="section-sub mx-auto max-w-[520px]">
              No hidden fees. No per-module charges. One flat rate per
              employee, per month. All plans include full Kenya statutory
              compliance.
            </p>
          </AnimatedSection>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {PRICING_PLANS.map((plan, i) => (
            <AnimatedSection
              key={plan.name}
              delay={([0, 100, 200] as const)[i]}
            >
              <div
                className={cn(
                  "relative rounded-2xl p-8 border transition-all duration-200 hover:-translate-y-1",
                  plan.featured
                    ? "bg-brand-950 border-brand-900 text-white shadow-[0_20px_60px_rgba(11,61,46,0.25)] md:scale-[1.04]"
                    : "bg-white border-neutral-200 hover:shadow-[0_16px_48px_rgba(11,61,46,0.1)]"
                )}
              >
                {/* Featured badge */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber text-neutral-900 text-[12px] font-bold px-4 py-1 rounded-full whitespace-nowrap">
                    {plan.badge}
                  </div>
                )}

                {/* Plan name */}
                <h3
                  className={cn(
                    "font-display font-bold text-[20px] mb-2",
                    plan.featured ? "text-white" : "text-neutral-900"
                  )}
                >
                  {plan.name}
                </h3>

                {/* Plan desc */}
                <p
                  className={cn(
                    "text-[14px] mb-6",
                    plan.featured ? "text-white/60" : "text-neutral-600"
                  )}
                >
                  {plan.description}
                </p>

                {/* Price */}
                <p
                  className={cn(
                    "font-mono font-medium mb-1",
                    plan.price === "Custom" ? "text-[28px]" : "text-[38px]",
                    plan.featured ? "text-white" : "text-neutral-900"
                  )}
                >
                  {plan.price}
                </p>
                <p
                  className={cn(
                    "text-[14px] mb-8",
                    plan.featured ? "text-white/50" : "text-neutral-600"
                  )}
                >
                  {plan.unit}
                </p>

                {/* Features list */}
                <ul className="flex flex-col gap-3 mb-8">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className={cn(
                        "flex items-start gap-2.5 text-[14px]",
                        plan.featured ? "text-white/80" : "text-neutral-700"
                      )}
                    >
                      <div
                        className={cn(
                          "w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 mt-0.5",
                          plan.featured
                            ? "bg-brand-500/20 text-brand-500"
                            : "bg-brand-50 text-brand-700"
                        )}
                      >
                        <Check
                          size={10}
                          strokeWidth={3}
                          aria-hidden="true"
                        />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={plan.ctaHref}
                  className={cn(
                    "w-full justify-center text-center",
                    plan.featured ? "btn-primary" : "btn-outline-dark"
                  )}
                >
                  {plan.cta}
                </Link>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection>
          <p className="text-center text-[13px] text-neutral-400 mt-6">
            Prices shown are indicative and subject to final confirmation at
            launch. All plans include full Kenya statutory compliance.
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
}
