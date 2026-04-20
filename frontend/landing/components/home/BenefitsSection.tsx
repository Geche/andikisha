import { Clock, Shield, TrendingUp } from "lucide-react";
import { BENEFITS } from "@/lib/data";
import AnimatedSection from "@/components/ui/AnimatedSection";

const ICONS: Record<string, React.ReactNode> = {
  clock: <Clock size={26} aria-hidden="true" />,
  shield: <Shield size={26} aria-hidden="true" />,
  "trending-up": <TrendingUp size={26} aria-hidden="true" />,
};

export default function BenefitsSection() {
  return (
    <section className="py-24 bg-surface-alt">
      <div className="max-w-[1320px] mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="text-center mb-14">
          <AnimatedSection>
            <p className="section-eyebrow">Business Value</p>
          </AnimatedSection>
          <AnimatedSection delay={100}>
            <h2 className="section-title mx-auto max-w-[560px]">
              What it actually means for your business
            </h2>
          </AnimatedSection>
          <AnimatedSection delay={200}>
            <p className="section-sub mx-auto max-w-[440px]">
              Features are what the product does. Here is what you gain.
            </p>
          </AnimatedSection>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {BENEFITS.map((benefit, i) => (
            <AnimatedSection
              key={benefit.title}
              delay={([0, 100, 200] as const)[i]}
            >
              <div className="card h-full flex flex-col">
                <div className="w-[52px] h-[52px] rounded-xl bg-brand-50 flex items-center justify-center text-brand-900 mb-5">
                  {ICONS[benefit.icon]}
                </div>

                <h3 className="font-display font-bold text-[22px] text-neutral-900 mb-3">
                  {benefit.title}
                </h3>

                <p className="text-[15px] text-neutral-600 leading-[1.75] mb-5 flex-1">
                  {benefit.body}
                </p>

                <div className="text-[13px] text-brand-700 font-mono font-medium px-3.5 py-2.5 bg-brand-50 rounded-lg border-l-[3px] border-brand-500">
                  {benefit.stat}
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
