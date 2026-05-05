import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Container from "@/components/ui/Container";
import HeroPayslipCard from "./HeroPayslipCard";

export default function Hero() {
  return (
    <section className="bg-brand-900 min-h-[calc(100vh-72px)] flex items-center relative overflow-hidden">
      {/* Subtle dot texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Ccircle cx='20' cy='20' r='1' fill='white'/%3E%3C/svg%3E\")",
        }}
        aria-hidden
      />

      <Container className="py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left — cols 1-7 */}
          <div className="lg:col-span-7">
            <h1
              className="font-display font-bold text-white leading-[0.98] mb-6"
              style={{ fontSize: "clamp(3.5rem, 6.5vw, 5.5rem)", letterSpacing: "-0.02em" }}
            >
              HR and payroll,
              <br />
              <span className="text-amber">calculated correctly.</span>
            </h1>

            <p className="text-[18px] text-brand-100 leading-[1.6] mb-10 max-w-[540px]">
              Statutory deductions to the cent. Payslips on the phones your team
              already uses. Salary disbursement on M-Pesa. Built for modern
              African businesses.
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-8">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-amber text-ink-900 font-semibold text-[15px] hover:bg-amber-dark transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2"
              >
                Start 30-day free trial
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 px-4 py-3 text-[15px] font-medium text-white/70 hover:text-white transition-colors duration-200"
              >
                Book a demo <ArrowRight size={15} aria-hidden />
              </Link>
            </div>

            <a
              href="#calculator"
              className="inline-flex items-center gap-1.5 text-[14px] text-brand-100/50 hover:text-brand-100 transition-colors duration-200"
            >
              Try the live payroll calculator <ArrowRight size={13} aria-hidden />
            </a>
          </div>

          {/* Right — payslip card, cols 8-12 */}
          <div className="lg:col-span-5">
            <HeroPayslipCard />
          </div>
        </div>
      </Container>

      {/* Sentinel — observed by Navbar to trigger white background */}
      <div id="hero-sentinel" className="absolute bottom-0 left-0 w-full h-px pointer-events-none" aria-hidden />
    </section>
  );
}
