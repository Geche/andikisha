import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Container from "@/components/ui/Container";
import HeroPayslipCard from "./HeroPayslipCard";

export default function Hero() {
  return (
    <section className="bg-brand-900 min-h-[calc(100vh-68px)] flex items-center relative overflow-hidden">
      {/* Subtle dot texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ccircle cx='16' cy='16' r='1' fill='white'/%3E%3C/svg%3E\")",
        }}
        aria-hidden
      />

      <Container className="py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left — cols 1-7 */}
          <div className="lg:col-span-7">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-brand-300 mb-6">
              Built in Nairobi for Kenyan and East African businesses
            </p>

            <h1
              className="font-display font-bold text-white leading-[0.97] mb-6"
              style={{ fontSize: "clamp(3rem, 6vw, 5.25rem)", letterSpacing: "-0.025em" }}
            >
              Kenyan HR and payroll,{" "}
              <span className="text-amber block">built statute-first.</span>
            </h1>

            <p className="text-[17px] text-brand-100/75 leading-[1.7] mb-10 max-w-[520px]">
              One platform for HR, payroll and compliance, designed around PAYE, NSSF, SHIF,
              the Housing Levy, NITA and HELB — so your monthly close ends on time and your
              filings reach KRA before the 9th.
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-10">
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-amber text-ink-900 font-semibold text-[15px] hover:bg-amber-dark transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2"
              >
                Book a Demo
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-3.5 text-[15px] font-medium text-white/70 hover:text-white border border-white/20 rounded-lg hover:border-white/40 transition-all duration-200"
              >
                Talk to a Founder <ArrowRight size={14} aria-hidden />
              </Link>
            </div>

            {/* Statutory trust marks */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 pt-7">
              {[
                { label: "PAYE", detail: "Bands 2025" },
                { label: "NSSF", detail: "Tier I & II" },
                { label: "SHIF", detail: "2.75%" },
                { label: "Housing Levy", detail: "1.5%" },
                { label: "HELB", detail: "Supported" },
              ].map(({ label, detail }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className="w-[5px] h-[5px] rounded-full bg-amber shrink-0" aria-hidden />
                  <span className="text-[12px] text-white/50">
                    <span className="font-semibold text-white/75">{label}</span>
                    {" "}
                    <span className="font-mono">{detail}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — payslip card, cols 8-12 */}
          <div className="lg:col-span-5">
            <HeroPayslipCard />
          </div>
        </div>
      </Container>

      <div id="hero-sentinel" className="absolute bottom-0 left-0 w-full h-px pointer-events-none" aria-hidden />
    </section>
  );
}
