import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";

const FAQS = [
  {
    q: "Will payroll run if my internet drops in the middle of it?",
    a: "Yes. Once you initiate a payroll run and the calculations are confirmed, the job is queued server-side. Your internet connection dropping does not affect processing. You will receive an email and SMS confirmation when the run completes, and you can review the results when you are back online.",
  },
  {
    q: "Do I have to switch from my current accountant?",
    a: "No. AndikishaHR generates all the reports your accountant needs — reconciliation summaries, P9 annual returns, PAYE worksheets, NSSF schedules — and exports them in standard formats. Most customers keep their existing accountant and simply redirect the data-gathering work to the platform.",
  },
  {
    q: "Can I run payroll for casuals on a daily rate?",
    a: "Yes. Casual and contract workers are supported alongside permanent staff. You assign a daily or hourly rate, input actual days worked for the period, and the system applies the correct PAYE withholding for casual workers under the KRA guidelines — which differs from the permanent employee treatment.",
  },
  {
    q: "How do you handle a Finance Bill change mid-month?",
    a: "We monitor gazette notices and will push a rate update before the effective date. If a change takes effect partway through a payroll month, the platform splits the payroll period automatically and applies the old rate to earnings before the effective date and the new rate to earnings after. The transition is documented in the payroll audit log.",
  },
  {
    q: "What happens to my data if I cancel?",
    a: "Your data remains accessible for 90 days after cancellation. During that window you can export everything — employee records, payslip history, statutory filing records — in standard formats. After 90 days, data is deleted from production systems. We retain encrypted backups for 7 years to meet KRA audit requirements, then they are purged.",
  },
  {
    q: "Can I export to QuickBooks, Xero, or Sage?",
    a: "Xero and Sage integrations are on the roadmap for Q3 2026. QuickBooks integration is in planning. Until those are live, the platform exports a standard journal entry CSV that your accounting team can import manually into any general ledger system. Custom integrations are available on the Scale plan.",
  },
  {
    q: "Is mobile money disbursement extra, or included?",
    a: "M-Pesa salary disbursement is included in all plans. There is no per-transaction fee charged by AndikishaHR. Safaricom's standard M-Pesa business pay-out fees apply on the network side — these are your standard Daraja API transaction fees and are passed through at cost.",
  },
  {
    q: "How do I import my current employee list from Excel?",
    a: "There is a CSV import template in the onboarding flow. Fill in the required columns — name, ID number, KRA PIN, bank or M-Pesa details, salary, and employment type — and upload it. The system validates each row and flags errors before importing. For Growth and Scale customers, the onboarding team will do the import with you on a call.",
  },
  {
    q: "Does the employee app support local languages?",
    a: "The employee portal supports English and Kiswahili. An employee can switch language with one tap from the payslip view. All deduction labels, explanations, and notifications are translated. Additional language support is planned but not yet confirmed for the current roadmap.",
  },
  {
    q: "Do you support contractor payments and gig workers?",
    a: "Contractor and gig worker payments are supported. You can flag a worker as a contractor and the system applies the 5% withholding tax on professional fees under the KRA guidelines rather than the PAYE schedule. Contractors do not accumulate leave balances or NSSF contributions unless you configure it explicitly.",
  },
];

export default function FaqList({ columns = 2 }: { columns?: 1 | 2 }) {
  return (
    <section className="bg-surface-alt py-[88px]">
      <Container>
        <Eyebrow className="mb-4">FAQ</Eyebrow>
        <h2
          className="font-display font-black text-ink-900 leading-[1.06] tracking-[-0.02em] mb-12"
          style={{ fontSize: "clamp(28px, 3.2vw, 42px)" }}
        >
          Everything buyers actually ask.
        </h2>

        <div className={columns === 1 ? "grid grid-cols-1" : "grid grid-cols-2"}>
          {FAQS.map(({ q, a }, i) => {
            const isOdd  = i % 2 === 0;
            return (
              <details
                key={q}
                className={[
                  "group border-b border-ink-200",
                  columns === 2 ? (isOdd ? "border-r border-ink-200 pr-8" : "pl-8") : "",
                ].filter(Boolean).join(" ")}
              >
                <summary className="flex items-center justify-between gap-4 py-5 cursor-pointer list-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2 rounded-sm">
                  <span className="text-[14px] font-bold text-ink-900 leading-snug">{q}</span>
                  <svg
                    width="16" height="16" viewBox="0 0 16 16" fill="none"
                    className="shrink-0 transition-transform duration-200 group-open:rotate-180 text-ink-400"
                    aria-hidden
                  >
                    <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.5"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </summary>
                <p className="pb-5 text-[14px] text-ink-600 leading-[1.7]">{a}</p>
              </details>
            );
          })}
        </div>

        <p className="text-[14px] text-ink-600 mt-10">
          Still have questions?{" "}
          <a
            href="/contact"
            className="text-brand-700 underline underline-offset-2 hover:text-brand-900 transition-colors"
          >
            Contact the team.
          </a>
        </p>
      </Container>
    </section>
  );
}
