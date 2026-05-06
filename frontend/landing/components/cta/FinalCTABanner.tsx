import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Container from "@/components/ui/Container";

export default function FinalCTABanner() {
  return (
    <section className="bg-brand-900 py-24">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-8">
            <h2
              className="font-display font-bold text-white mb-4 leading-[1.05]"
              style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", letterSpacing: "-0.02em" }}
            >
              Run your first AndikishaHR payroll
              <br />
              <span className="text-amber">within three weeks.</span>
            </h2>
            <p className="text-[17px] text-brand-100/65 leading-[1.7] max-w-[500px]">
              A 20-minute walkthrough on a sandbox loaded with realistic Kenyan payslips.
              No sales scripts. No 18 follow-up calls.
            </p>
          </div>
          <div className="lg:col-span-4 flex flex-col gap-3 lg:items-end">
            <Link
              href="/demo"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-lg bg-amber text-ink-900 font-semibold text-[15px] hover:bg-amber-dark transition-colors duration-200 w-full lg:w-auto"
            >
              Book a Demo
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-[15px] font-medium text-white/65 hover:text-white transition-colors duration-200 w-full lg:w-auto"
            >
              Talk to a Founder <ArrowRight size={14} aria-hidden />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
