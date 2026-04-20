import type { Metadata } from "next";
import DemoForm from "./DemoForm";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Request a Demo",
  description:
    "See AndikishaHR in action. Request a personalised 30-minute demo with our team and get your first payroll run set up.",
};

const WHY_DEMO = [
  "See a live payroll run for a 50-person Kenyan company",
  "Walk through PAYE, NSSF, SHIF, and Housing Levy calculations",
  "Ask questions about your specific compliance situation",
  "Get a migration plan from your current spreadsheet or system",
  "Understand pricing and which plan fits your team size",
];

export default function DemoPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-hero-gradient py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_40%_50%,rgba(232,160,32,0.1)_0%,transparent_65%)] pointer-events-none" />
        <div className="max-w-[1320px] mx-auto px-6 md:px-12 relative z-10 text-center">
          <AnimatedSection>
            <p className="section-eyebrow-white">Live Demo</p>
          </AnimatedSection>
          <AnimatedSection delay={100}>
            <h1 className="font-display text-[46px] md:text-[56px] font-extrabold text-white max-w-[640px] mx-auto mb-5">
              See AndikishaHR before you commit to anything.
            </h1>
          </AnimatedSection>
          <AnimatedSection delay={200}>
            <p className="text-[18px] text-white/70 max-w-[500px] mx-auto">
              A 30-minute personalised session with our team. We walk through
              your specific payroll and compliance setup — not a generic slide
              deck.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Two-column layout */}
      <section className="py-20 bg-surface-alt">
        <div className="max-w-[1320px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left — What you get */}
            <div>
              <AnimatedSection>
                <h2 className="font-display font-bold text-[32px] text-neutral-900 mb-6">
                  What happens in the demo
                </h2>
                <p className="text-[16px] text-neutral-600 leading-relaxed mb-8">
                  We run a live payroll for a sample company similar to yours —
                  same industry, same employee count, same compliance
                  obligations. You see exactly how the platform handles your
                  situation, not a polished demo environment.
                </p>
              </AnimatedSection>

              <ul className="flex flex-col gap-4 mb-10">
                {WHY_DEMO.map((item, i) => (
                  <AnimatedSection key={i} delay={([0, 100, 100, 200, 200] as const)[i]}>
                    <li className="flex items-start gap-3">
                      <CheckCircle
                        size={18}
                        className="text-brand-700 mt-0.5 shrink-0"
                        aria-hidden="true"
                      />
                      <span className="text-[15px] text-neutral-700">{item}</span>
                    </li>
                  </AnimatedSection>
                ))}
              </ul>

              {/* Trust card */}
              <AnimatedSection>
                <div className="bg-brand-900 rounded-2xl p-6 text-white">
                  <p className="font-display font-bold text-[18px] mb-3">
                    Already running payroll?
                  </p>
                  <p className="text-[14px] text-white/70 leading-relaxed mb-4">
                    Bring your last payroll run or a sample of your current
                    spreadsheet to the session. We will show you the exact
                    migration path and calculate your projected time savings
                    on the spot.
                  </p>
                  <div className="flex items-center gap-2 text-[13px] text-brand-500 font-medium">
                    <CheckCircle size={14} aria-hidden="true" />
                    No obligation. No sales pressure.
                  </div>
                </div>
              </AnimatedSection>
            </div>

            {/* Right — Form */}
            <AnimatedSection delay={200}>
              <div className="bg-white rounded-2xl border border-neutral-200 p-8 shadow-[0_8px_40px_rgba(11,61,46,0.08)]">
                <h2 className="font-display font-bold text-[24px] text-neutral-900 mb-2">
                  Book your session
                </h2>
                <p className="text-[14px] text-neutral-600 mb-7">
                  We typically respond within 2 hours on business days.
                </p>
                <DemoForm />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </>
  );
}
