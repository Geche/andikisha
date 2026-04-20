import { HOW_IT_WORKS } from "@/lib/data";
import AnimatedSection from "@/components/ui/AnimatedSection";

const STEP_COLORS = [
  "bg-brand-900 text-white",
  "bg-brand-700 text-white",
  "bg-amber text-neutral-900",
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-[1320px] mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="text-center mb-16">
          <AnimatedSection>
            <p className="section-eyebrow">Getting Started</p>
          </AnimatedSection>
          <AnimatedSection delay={100}>
            <h2 className="section-title mx-auto max-w-[560px]">
              Set up in a day. Run payroll on Friday.
            </h2>
          </AnimatedSection>
          <AnimatedSection delay={200}>
            <p className="section-sub mx-auto max-w-[480px]">
              Three steps from sign-up to your first compliant payroll run.
            </p>
          </AnimatedSection>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line — desktop only */}
          <div
            className="hidden md:block absolute top-[28px] left-[calc(16.5%)] right-[calc(16.5%)] h-[2px] bg-gradient-to-r from-brand-900 via-brand-700 to-amber"
            aria-hidden="true"
          />

          {HOW_IT_WORKS.map((step, i) => (
            <AnimatedSection
              key={step.step}
              delay={([0, 100, 200] as const)[i]}
              className="relative z-10 text-center px-4"
            >
              {/* Step number bubble */}
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center font-display font-extrabold text-[22px] mx-auto mb-6 ${STEP_COLORS[i]}`}
              >
                {step.step}
              </div>

              <h3 className="font-display font-bold text-[20px] text-neutral-900 mb-3">
                {step.title}
              </h3>

              <p className="text-[15px] text-neutral-600 leading-[1.75]">
                {step.description}
              </p>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
