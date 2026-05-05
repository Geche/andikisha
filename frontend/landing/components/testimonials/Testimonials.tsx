import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";

const FEATURED = {
  quote:
    "We used to spend the last week of every month chasing timesheets, reconciling spreadsheets, and then manually entering everything into iTax. Now the whole run takes two hours. The PAYE just comes out correctly. I did not realise how much time I was losing until it stopped.",
  name: "Wanjiru M.",
  role: "HR Manager",
  context: "47 employees · Nairobi",
};

const SECONDARY = [
  {
    quote:
      "The SHIF transition from NHIF caught a lot of payroll systems flat-footed. AndikishaHR updated before our October payroll. I did not have to do anything. That kind of reliability is what we pay for.",
    name: "David O.",
    role: "Finance Director",
    context: "22 employees · Mombasa",
  },
  {
    quote:
      "Our employees used to come to my desk asking what NSSF Tier II meant on their payslip. Now they tap it on the portal and it explains itself. That alone cut my weekly HR questions by half.",
    name: "Aisha K.",
    role: "People Operations Lead",
    context: "67 employees · Nairobi",
  },
];

function QuoteMark() {
  return (
    <svg width="40" height="28" viewBox="0 0 40 28" fill="none" aria-hidden className="text-brand-100 shrink-0">
      <path
        d="M0 28V16.8C0 7.6 5.6 2 16.8 0L19.2 3.6C13.6 5.2 10.4 8.8 10 14.4H18V28H0ZM22 28V16.8C22 7.6 27.6 2 38.8 0L41.2 3.6C35.6 5.2 32.4 8.8 32 14.4H40V28H22Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function Testimonials() {
  return (
    <section className="bg-surface-alt py-24 border-y border-ink-200">
      <Container>
        <Eyebrow className="mb-12">What customers say</Eyebrow>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Featured — large pull quote, cols 1-7 */}
          <figure className="lg:col-span-7 flex flex-col justify-between border-l-2 border-brand-700 pl-8 py-2">
            <QuoteMark />
            <blockquote className="mt-5 mb-6">
              <p
                className="font-display font-semibold text-ink-900 leading-[1.35]"
                style={{ fontSize: "clamp(1.25rem, 2vw, 1.5rem)", letterSpacing: "-0.01em" }}
              >
                &ldquo;{FEATURED.quote}&rdquo;
              </p>
            </blockquote>
            <figcaption className="flex items-center gap-4 border-t border-ink-200 pt-5">
              <div className="w-10 h-10 rounded-full bg-brand-900 flex items-center justify-center shrink-0">
                <span className="text-[13px] font-bold text-white">{FEATURED.name.charAt(0)}</span>
              </div>
              <div>
                <p className="text-[14px] font-semibold text-ink-900">{FEATURED.name}</p>
                <p className="text-[13px] text-ink-500">{FEATURED.role} · {FEATURED.context}</p>
              </div>
            </figcaption>
          </figure>

          {/* Secondary — two stacked, cols 8-12 */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            {SECONDARY.map((t) => (
              <figure key={t.name} className="flex flex-col gap-4">
                <blockquote>
                  <p className="text-[16px] text-ink-700 leading-[1.65] italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </blockquote>
                <figcaption className="flex items-center gap-3 border-t border-ink-200 pt-4">
                  <div className="w-8 h-8 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0">
                    <span className="text-[11px] font-bold text-brand-700">{t.name.charAt(0)}</span>
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
      </Container>
    </section>
  );
}
