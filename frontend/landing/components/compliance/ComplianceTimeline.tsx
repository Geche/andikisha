import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";

const EVENTS = [
  {
    date: "Oct 2024",
    title: "SHIF transition from NHIF",
    desc: "2.75% rate, new remittance target. Shipped same day.",
  },
  {
    date: "Mar 2024",
    title: "Housing Levy 1.5%",
    desc: "Employer match applied automatically from March payroll.",
  },
  {
    date: "Feb 2024",
    title: "NSSF Tier II uplift",
    desc: "New employer contribution tiers, live on effective date.",
  },
  {
    date: "Sep 2024",
    title: "Finance Bill 2024",
    desc: "PAYE band amendments applied across all pay runs.",
  },
  {
    date: "Jan 2024",
    title: "eTIMS rollout",
    desc: "VAT invoicing compliance supported across the platform.",
  },
];

export default function ComplianceTimeline() {
  return (
    <section className="bg-white py-[88px]">
      <Container>
        {/* Top — 2-col heading */}
        <div
          className="grid gap-12 mb-14"
          style={{ gridTemplateColumns: "5fr 6fr" }}
        >
          <div>
            <Eyebrow className="mb-4">Compliance is our operating model</Eyebrow>
            <h2
              className="font-display font-black text-ink-900 leading-[1.06] tracking-[-0.02em]"
              style={{ fontSize: "clamp(28px, 3.2vw, 42px)" }}
            >
              When the rules change, we ship the same day.
            </h2>
          </div>
          <p className="text-[17px] text-ink-600 leading-[1.7] self-end">
            Kenyan statutory law changes several times a year — Finance Acts, NSSF transitions,
            SHIF rate changes, new KRA filing formats. We track the legislative cycle and ship
            rate updates the day they take effect, not when someone remembers to check.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative border-t-2 border-ink-200 pt-6 grid grid-cols-5 gap-4">
          {EVENTS.map(({ date, title, desc }) => (
            <div key={date} className="relative">
              {/* Dot on the border line */}
              <div
                className="absolute -top-[26px] left-0 w-[10px] h-[10px] rounded-full bg-brand-900 border-2 border-white shadow-[0_0_0_2px_#e5e7eb]"
                aria-hidden
              />
              <p className="text-[10px] font-bold text-brand-700 uppercase tracking-[0.1em] mb-2">
                {date}
              </p>
              <p className="text-[13px] font-bold text-ink-900 leading-[1.35] mb-1.5">{title}</p>
              <p className="text-[12px] text-ink-600 leading-[1.5]">{desc}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
