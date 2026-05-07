import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { HeroBrowserMockup } from "./HeroBrowserMockup";

export default function Hero() {
  return (
    <section className="relative bg-white pt-20 pb-0 overflow-hidden">
      {/* Centered text block */}
      <div className="mx-auto max-w-[760px] px-6 text-center">

        {/* Pill — links to calculator */}
        <a
          href="#calculator"
          className="inline-flex items-center gap-2 border border-ink-200 rounded-full px-3.5 py-2 mb-8 hover:border-ink-300 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2"
        >
          <span className="bg-brand-50 text-brand-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            New
          </span>
          <span className="text-[13px] text-ink-600 font-medium">
            Payroll calculator — try live KES rates
          </span>
          <ChevronRight size={13} className="text-ink-400" aria-hidden />
        </a>

        {/* H1 */}
        <h1
          className="font-display font-black text-ink-900 leading-[1.05] tracking-[-0.025em] mb-5"
          style={{ fontSize: "clamp(38px, 5.5vw, 62px)" }}
        >
          Kenyan HR and payroll,<br />calculated correctly.
        </h1>

        {/* Subheadline */}
        <p className="text-[18px] text-ink-600 leading-[1.7] max-w-[500px] mx-auto mb-10">
          Statutory deductions to the cent. Payslips on the phones your team already uses.
          M-Pesa and bank in one approved batch.
        </p>

        {/* Single CTA */}
        <Link
          href="/demo"
          className="inline-flex items-center gap-2 bg-amber hover:bg-amber-dark text-ink-900 font-bold text-[15px] px-7 py-3.5 rounded-lg transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2"
        >
          Schedule a demo
          <ChevronRight size={15} aria-hidden />
        </Link>
      </div>

      {/* Browser mockup — clips at bottom into logos row */}
      <div className="mx-auto max-w-[960px] px-6 mt-16 relative">
        <HeroBrowserMockup />
        {/* Fade gradient blends mockup into white */}
        <div
          className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, white)" }}
          aria-hidden
        />
      </div>

      {/* Sentinel — Navbar IntersectionObserver watches this */}
      <div
        id="hero-sentinel"
        className="absolute bottom-0 left-0 w-full h-px pointer-events-none"
        aria-hidden
      />
    </section>
  );
}
