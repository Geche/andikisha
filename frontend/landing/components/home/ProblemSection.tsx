import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";

export default function ProblemSection() {
  return (
    <section className="bg-brand-950 py-24 relative overflow-hidden">
      {/* Ambient radial */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(232,160,32,0.08)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-[1320px] mx-auto px-6 md:px-12 relative z-10">
        <div className="max-w-[760px] mx-auto text-center">
          <AnimatedSection>
            <p className="section-eyebrow-white">The Problem</p>
          </AnimatedSection>

          <AnimatedSection delay={100}>
            <h2 className="font-display text-[40px] md:text-[48px] font-extrabold text-white mb-7">
              Most Kenyan businesses are one KRA audit away from a serious
              problem.
            </h2>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <p className="text-[18px] text-white/70 leading-[1.8] mb-4">
              <strong className="text-white">
                85% of Kenyan SMEs still run payroll on spreadsheets.
              </strong>{" "}
              For a company of 30 employees, monthly payroll errors average KES
              50,000–200,000. Statutory penalties for late or incorrect PAYE
              filings can reach 25% of the outstanding tax. These are not
              worst-case scenarios — they are what happens without automated
              systems.
            </p>
            <p className="text-[18px] text-white/70 leading-[1.8] mb-8">
              AndikishaHR encodes Kenya&apos;s full compliance stack directly
              into the product. When PAYE brackets change, when NSSF tiers
              update, when SHIF rates are revised — the platform updates
              automatically. Your payroll stays correct without you having to
              track every gazette notice.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={300}>
            <Link
              href="/features"
              className="inline-flex items-center gap-2 text-amber font-semibold text-[15px] hover:gap-3 transition-all duration-200"
            >
              See how the compliance engine works
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
