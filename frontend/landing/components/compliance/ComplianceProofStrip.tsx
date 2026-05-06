import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";

const EVENTS = [
  { date: "Oct 2024", title: "SHIF transition from NHIF", detail: "New 2.75% rate, new remittance portal, live on day one." },
  { date: "Mar 2024", title: "Housing Levy at 1.5%", detail: "Employee and employer contributions enforced from March payroll." },
  { date: "Feb 2024", title: "NSSF Act 2013 Tier II uplift", detail: "Supreme Court ruling upheld Tier II contributions." },
  { date: "Sep 2024", title: "Finance Bill 2024 amendments", detail: "Revised PAYE bands applied same day assent was given." },
  { date: "Jan 2024", title: "eTIMS rollout for invoicing", detail: "VAT-registered employers supported across the platform." },
];

export default function ComplianceProofStrip() {
  return (
    <section className="bg-white py-20 border-b border-ink-200">
      <Container>
        <div className="mb-12">
          <Eyebrow className="mb-4">Compliance track record</Eyebrow>
          <h2
            className="font-display font-bold text-ink-900 max-w-[520px] mb-3"
            style={{ fontSize: "clamp(2.25rem, 4vw, 3.5rem)", lineHeight: "1.05", letterSpacing: "-0.015em" }}
          >
            Compliance is our entire operating model.
          </h2>
          <p className="text-[17px] text-ink-600 max-w-[480px]">
            When the rules change, we ship the same day. A few recent moments:
          </p>
        </div>

        {/* Timeline — horizontal on desktop, stacked on mobile */}
        <div className="relative">
          {/* Connector line — desktop only */}
          <div className="hidden lg:block absolute top-[5px] left-[5px] right-[5px] h-px bg-ink-200 z-0" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {EVENTS.map((event, i) => (
              <div key={i} className="relative">
                <div className="flex items-center gap-3 mb-3 relative z-10">
                  <div className="w-[10px] h-[10px] rounded-full bg-white border-[2px] border-brand-700 shrink-0" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-700">
                    {event.date}
                  </span>
                </div>
                <p className="text-[15px] font-semibold text-ink-900 mb-1 leading-snug">{event.title}</p>
                <p className="text-[13px] text-ink-600 leading-relaxed">{event.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
