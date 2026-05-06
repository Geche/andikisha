import Link from "next/link";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";

const STEPS = [
  {
    n: "01",
    title: "Tell us about your team.",
    body: "A 20-minute call. Headcount, pay cycles, current tools, statutory pain points. We map your gross-to-net rules onto AndikishaHR.",
    detail: "Discovery call · 20 min",
  },
  {
    n: "02",
    title: "We migrate your data.",
    body: "Twelve months of historical payroll, employee records and statutory filings. Free for founding customers. We reconcile to the cent against your last close.",
    detail: "Free for founding customers",
  },
  {
    n: "03",
    title: "We run a parallel pay cycle.",
    body: "Your next payroll runs in your old system and in AndikishaHR. We compare every line. You sign off only when the numbers match exactly.",
    detail: "Zero-risk sign-off",
  },
  {
    n: "04",
    title: "Go live.",
    body: "Your first official pay run on AndikishaHR. PAYE, NSSF, SHIF, AHL, NITA and HELB filed. M-Pesa and bank disbursements out. P9 and P10 ready.",
    detail: "~3 weeks from call to live",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-white py-24 border-b border-ink-200">
      <Container>
        <div className="text-center mb-16">
          <Eyebrow className="mb-4">From spreadsheet to first pay run</Eyebrow>
          <h2
            className="font-display font-bold text-ink-900 mb-4"
            style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)", letterSpacing: "-0.02em", lineHeight: "1.08" }}
          >
            Live in three weeks.
            <br />
            <span className="text-brand-700">Without the implementation drama.</span>
          </h2>
          <p className="text-[17px] text-ink-600 max-w-[480px] mx-auto">
            A four-step path from your current setup to your first AndikishaHR pay run,
            with a named onboarding lead from day one.
          </p>
        </div>

        <div className="relative">
          {/* Connecting line — desktop */}
          <div className="hidden lg:block absolute top-[2.25rem] left-[calc(12.5%-1px)] right-[calc(12.5%-1px)] h-px bg-ink-100 z-0" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {STEPS.map((step, i) => (
              <div key={step.n} className="flex flex-col">
                {/* Step bubble */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-[2.75rem] h-[2.75rem] rounded-full border-2 border-brand-700 bg-white flex items-center justify-center shrink-0">
                    <span className="font-mono text-[12px] font-bold text-brand-700">{step.n}</span>
                  </div>
                  {/* Mobile connector */}
                  {i < STEPS.length - 1 && (
                    <div className="lg:hidden flex-1 h-px bg-ink-100" />
                  )}
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-amber mb-2">
                    {step.detail}
                  </div>
                  <h3 className="text-[17px] font-semibold text-ink-900 mb-3 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-[14px] text-ink-600 leading-[1.7]">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-14">
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-amber text-ink-900 font-semibold text-[15px] hover:bg-amber-dark transition-colors duration-200"
          >
            Book your discovery call
          </Link>
        </div>
      </Container>
    </section>
  );
}
