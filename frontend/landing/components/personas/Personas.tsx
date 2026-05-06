import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";

const PERSONAS = [
  {
    role: "HR Managers at growing SMEs",
    icon: "👩‍💼",
    pain: "You spend three days a month on payroll and answer the same payslip query 40 times.",
    outcome: "AndikishaHR cuts the monthly close from days to hours and turns mobile self-service into your help desk.",
  },
  {
    role: "Finance Directors & CFOs",
    icon: "📊",
    pain: "You worry about KRA penalties at 5% plus 1% monthly interest, and you cannot see consolidated payroll cost in real time.",
    outcome: "A pre-9th statutory remittance view and a clean export to your ERP.",
  },
  {
    role: "SME Founders",
    icon: "🚀",
    pain: "You have been threatening to hire an HR person for a year.",
    outcome: "AndikishaHR replaces the missing HR hire for less than two months of that salary.",
  },
  {
    role: "Payroll Officers",
    icon: "🧮",
    pain: "You reconcile five Excel sheets every month and double-check every number because the cost of being wrong is too high.",
    outcome: "AndikishaHR runs the calculation, so you run the analysis.",
  },
  {
    role: "Group HR Directors",
    icon: "🌍",
    pain: "You run HR across a Kenyan parent and East African subsidiaries on three different tools.",
    outcome: "One tenancy with country-specific statutory engines and group analytics across entities.",
  },
];

export default function Personas() {
  return (
    <section className="bg-surface-alt py-24 border-b border-ink-100">
      <Container>
        <div className="mb-12">
          <Eyebrow className="mb-4">Who we built this for</Eyebrow>
          <h2
            className="font-display font-bold text-ink-900 max-w-[540px] mb-4"
            style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)", letterSpacing: "-0.02em", lineHeight: "1.08" }}
          >
            If you recognise yourself here, we built this for you.
          </h2>
        </div>

        {/* 3-column grid: first 3 fill top row, last 2 are centred in bottom row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PERSONAS.map((p, i) => (
            <div
              key={p.role}
              className={`bg-white rounded-2xl border border-ink-100 p-7 flex flex-col gap-5 ${
                i === 3 ? "lg:col-start-2" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-2xl leading-none mt-0.5" aria-hidden>{p.icon}</div>
                <h3 className="text-[16px] font-semibold text-ink-900 leading-snug">{p.role}</h3>
              </div>
              <div className="flex flex-col gap-3 flex-1">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-400 mb-1.5">The problem</p>
                  <p className="text-[14px] text-ink-700 leading-[1.65]">{p.pain}</p>
                </div>
                <div className="border-t border-ink-100 pt-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-700 mb-1.5">The outcome</p>
                  <p className="text-[14px] text-ink-700 leading-[1.65]">{p.outcome}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
