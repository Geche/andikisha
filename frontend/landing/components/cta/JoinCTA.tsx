import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";
import Container from "@/components/ui/Container";

const FEATURES = [
  "PAYE, NSSF, SHIF, Housing Levy — calculated correctly",
  "M-Pesa and bank disbursement in one run",
  "P10A, NSSF, SHIF filings — auto after approval",
  "Employee payslips via SMS or WhatsApp",
  "KRA P9 annual returns at year-end",
  "Data hosted in Kenya — KDPA compliant",
];

export default function JoinCTA() {
  return (
    <section className="bg-white py-[88px]">
      <Container>
        <div
          className="grid items-center"
          style={{ gridTemplateColumns: "1fr 1fr", gap: "56px" }}
        >
          {/* Left */}
          <div>
            <h2
              className="font-display font-black text-ink-900 leading-[1.06] tracking-[-0.02em] mb-5"
              style={{ fontSize: "clamp(28px, 3.2vw, 42px)" }}
            >
              Join 240+ businesses growing with AndikishaHR.
            </h2>
            <p className="text-[17px] text-ink-600 leading-[1.7] mb-8">
              Start your 30-day free trial. No credit card required. Founding customer pricing
              locked for 24 months for our first 50 customers.
            </p>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 bg-amber hover:bg-amber-dark text-ink-900 font-bold text-[15px] px-7 py-3.5 rounded-lg transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2"
            >
              Schedule a demo <ChevronRight size={15} aria-hidden />
            </Link>
          </div>

          {/* Right — feature checklist */}
          <div className="bg-surface-alt border border-ink-200 rounded-2xl p-7">
            <p className="text-[14px] font-bold text-ink-900 mb-1">
              Everything you need to run payroll
            </p>
            <p className="text-[13px] text-ink-400 mb-5">Included on every plan</p>
            <div className="flex flex-col">
              {FEATURES.map((feat) => (
                <div
                  key={feat}
                  className="flex items-center gap-3 py-3 border-b border-ink-200 last:border-0"
                >
                  <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                    <Check size={10} className="text-brand-700" strokeWidth={3} />
                  </div>
                  <span className="text-[13px] text-ink-700 font-medium">{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
