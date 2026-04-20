import Link from "next/link";
import { CheckCircle } from "lucide-react";
import DashboardMockup from "./DashboardMockup";

const TRUST_ITEMS = [
  "500+ Kenyan businesses",
  "KRA-compliant",
  "M-Pesa integrated",
  "GDPR-ready",
];

export default function Hero() {
  return (
    <section className="relative min-h-[calc(100vh-75px)] bg-hero-gradient bg-hero-dots overflow-hidden flex items-center">
      {/* Ambient glow */}
      <div className="absolute top-[-100px] right-[-100px] w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(232,160,32,0.12)_0%,transparent_65%)] pointer-events-none" />

      <div className="max-w-[1320px] mx-auto px-6 md:px-12 w-full py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* Left — Copy */}
          <div>
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3.5 py-1.5 text-[13px] text-white/85 font-medium mb-6">
              <span className="w-1.5 h-1.5 bg-amber rounded-full animate-pulse-dot" />
              Built for Kenya. Ready for Africa.
            </div>

            {/* H1 */}
            <h1 className="font-display text-[54px] md:text-[62px] font-extrabold text-white leading-[1.08] mb-6">
              Run payroll in{" "}
              <span className="text-amber">30 minutes.</span> Stay compliant.
              Every month.
            </h1>

            {/* Sub */}
            <p className="text-[18px] text-white/75 leading-[1.75] mb-9 max-w-[520px]">
              AndikishaHR automates{" "}
              <strong className="text-white font-semibold">
                PAYE, NSSF, SHIF, Housing Levy,
              </strong>{" "}
              and KRA filings — so your HR team stops chasing deadlines and
              starts managing people.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mb-7">
              <Link href="/pricing" className="btn-primary btn-lg">
                Start Free — No Credit Card
              </Link>
              <Link href="/demo" className="btn-outline-white btn-lg gap-2">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Watch 2-Min Demo
              </Link>
            </div>

            {/* Trust micro-copy */}
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {TRUST_ITEMS.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-1.5 text-[13px] text-white/60 font-medium"
                >
                  <CheckCircle
                    size={13}
                    className="text-brand-500 shrink-0"
                    aria-hidden="true"
                  />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Right — Dashboard Mockup */}
          <div className="hidden lg:block animate-float">
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
