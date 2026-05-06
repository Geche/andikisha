import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";

const PLACEHOLDERS = [
  {
    quote:
      "We replaced [previous tool] with AndikishaHR and cut our monthly close from [X days] to [Y hours]. The PAYE and NSSF Tier II calculations are right every time. Our 9th-of-the-month panic is gone.",
    name: "[Name]",
    role: "HR Manager",
    context: "[Company] · Nairobi",
    size: "large",
  },
  {
    quote:
      "Migration took two weeks. Parallel run matched to the cent. Our finance team now sees consolidated payroll cost across all three entities in one dashboard.",
    name: "[Name]",
    role: "Finance Director",
    context: "[Company] · Mombasa",
    size: "small",
  },
  {
    quote:
      "I was about to hire a full-time HR person. AndikishaHR did the job for less than two months of that salary, and my drivers get their payslip on their phone the moment payroll closes.",
    name: "[Name]",
    role: "Founder",
    context: "[Company] · Nairobi",
    size: "small",
  },
];

function QuoteMark() {
  return (
    <svg width="36" height="26" viewBox="0 0 40 28" fill="none" aria-hidden className="text-ink-100 shrink-0">
      <path
        d="M0 28V16.8C0 7.6 5.6 2 16.8 0L19.2 3.6C13.6 5.2 10.4 8.8 10 14.4H18V28H0ZM22 28V16.8C22 7.6 27.6 2 38.8 0L41.2 3.6C35.6 5.2 32.4 8.8 32 14.4H40V28H22Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function Testimonials() {
  return (
    <section className="bg-white py-24 border-b border-ink-200">
      <Container>
        <div className="flex items-start gap-3 mb-12">
          <Eyebrow>What customers say</Eyebrow>
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-amber bg-amber/10 px-2 py-1 rounded mt-0.5">
            Placeholder
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Featured */}
          <figure className="lg:col-span-7 flex flex-col justify-between border-l-2 border-amber pl-8 py-2">
            <QuoteMark />
            <blockquote className="mt-5 mb-6">
              <p
                className="font-display font-semibold text-ink-900 leading-[1.38]"
                style={{ fontSize: "clamp(1.2rem, 1.8vw, 1.45rem)", letterSpacing: "-0.01em" }}
              >
                &ldquo;{PLACEHOLDERS[0].quote}&rdquo;
              </p>
            </blockquote>
            <figcaption className="flex items-center gap-4 border-t border-ink-100 pt-5">
              <div className="w-10 h-10 rounded-full bg-ink-100 flex items-center justify-center shrink-0">
                <span className="text-[12px] font-semibold text-ink-500">?</span>
              </div>
              <div>
                <p className="text-[14px] font-semibold text-ink-900">{PLACEHOLDERS[0].name}</p>
                <p className="text-[13px] text-ink-400">{PLACEHOLDERS[0].role} · {PLACEHOLDERS[0].context}</p>
              </div>
            </figcaption>
          </figure>

          {/* Secondary */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            {PLACEHOLDERS.slice(1).map((t) => (
              <figure key={t.context} className="flex flex-col gap-4">
                <blockquote>
                  <p className="text-[15px] text-ink-600 leading-[1.7] italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </blockquote>
                <figcaption className="flex items-center gap-3 border-t border-ink-100 pt-4">
                  <div className="w-8 h-8 rounded-full bg-ink-100 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-semibold text-ink-400">?</span>
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-ink-900">{t.name}</p>
                    <p className="text-[12px] text-ink-400">{t.role} · {t.context}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        <p className="text-[12px] text-ink-400 mt-8 border-t border-ink-100 pt-6">
          Placeholder testimonials. To be replaced with real attributed quotes within 90 days of go-live.
        </p>
      </Container>
    </section>
  );
}
