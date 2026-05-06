import Link from "next/link";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";

const REASONS = [
  {
    n: "01",
    title: "Compliance you can prove.",
    body: "Every Kenyan statutory rule, in writing and in code. PAYE bands, the KSh 2,400 personal relief, NSSF Tier I at KSh 480 and Tier II at KSh 3,840, SHIF at 2.75% of gross, the Housing Levy at 1.5% matched, NITA and HELB. P9 and P10 generated in the format KRA expects. When the law changes, we ship the same day.",
  },
  {
    n: "02",
    title: "One pay run. M-Pesa and bank.",
    body: "Disburse to a mix of M-Pesa wallets and bank accounts in a single approved batch. Native Daraja API integration. Direct file integration with Equity, KCB, Co-op, Stanbic, NCBA, ABSA and DTB. No re-keying, no second platform.",
  },
  {
    n: "03",
    title: "Mobile-first for your real workforce.",
    body: "Security guards, drivers, field officers and shop staff get payslips, leave requests and profile updates on their phone. Works on entry-level Android. Falls back to USSD where bandwidth is poor.",
  },
  {
    n: "04",
    title: "Your data stays in Kenya.",
    body: "A serving copy of your personal data sits on infrastructure inside Kenya, in line with Section 50 of the Data Protection Act 2019. Tenant isolation by architecture. Encrypted in transit and at rest with AES-256 and TLS 1.3.",
  },
  {
    n: "05",
    title: "Founders who answer the phone.",
    body: "We are pre-launch on purpose. Our first 50 customers shape the roadmap, lock in pricing for 24 months, and get a named account lead who knows their payroll inside out. When the cohort fills, this offer closes.",
  },
];

export default function FiveReasons() {
  return (
    <section className="bg-surface-alt py-24 border-b border-ink-100">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-16">
          <div className="lg:col-span-4">
            <Eyebrow className="mb-4">Why AndikishaHR</Eyebrow>
            <h2
              className="font-display font-bold text-ink-900 mb-5 leading-[1.05]"
              style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)", letterSpacing: "-0.02em" }}
            >
              Five reasons your monthly payroll stops being a crisis.
            </h2>
            <p className="text-[16px] text-ink-600 leading-[1.7]">
              Built for the Finance Act 2025 reality, the NSSF Tier II transition and the workforce you actually have.
            </p>
          </div>

          <div className="lg:col-span-8">
            <div className="flex flex-col divide-y divide-ink-100">
              {REASONS.map((r) => (
                <div key={r.n} className="grid grid-cols-12 gap-6 py-8 first:pt-0 last:pb-0 group">
                  <div className="col-span-2 sm:col-span-1">
                    <span
                      className="font-mono font-medium text-ink-200 leading-none select-none"
                      style={{ fontSize: "clamp(1.5rem, 2.5vw, 2rem)" }}
                      aria-hidden
                    >
                      {r.n}
                    </span>
                  </div>
                  <div className="col-span-10 sm:col-span-11">
                    <h3 className="text-[18px] font-semibold text-ink-900 mb-2.5 leading-snug">
                      {r.title}
                    </h3>
                    <p className="text-[15px] text-ink-600 leading-[1.75]">{r.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center pt-4">
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-brand-900 text-white font-semibold text-[15px] hover:bg-brand-800 transition-colors duration-200"
          >
            Book your discovery call
          </Link>
        </div>
      </Container>
    </section>
  );
}
