import Link from "next/link";
import Container from "@/components/ui/Container";

const PERKS = [
  "Pricing locked for 24 months",
  "Free migration from your current system",
  "Named account lead from day one",
  "Direct line to product on roadmap input",
  "Reconciliation to the cent against your last close",
];

export default function FoundingCustomer() {
  return (
    <section className="bg-brand-950 py-24">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left */}
          <div className="lg:col-span-7">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-brand-300/70 mb-5">
              Pre-launch · on the record
            </p>
            <h2
              className="font-display font-bold text-white mb-5 leading-[1.05]"
              style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)", letterSpacing: "-0.02em" }}
            >
              Be one of our first{" "}
              <span className="text-amber">50 customers.</span>
              <br />
              Lock in your future.
            </h2>
            <p className="text-[17px] text-brand-100/65 leading-[1.7] mb-8 max-w-[500px]">
              AndikishaHR launches with a founding customer cohort capped at 50 Kenyan businesses.
              When the cohort fills, this offer closes.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/early-access"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-amber text-ink-900 font-semibold text-[15px] hover:bg-amber-dark transition-colors duration-200"
              >
                Apply for founding access
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 px-5 py-3.5 text-[15px] font-medium text-white/65 hover:text-white border border-white/15 rounded-lg hover:border-white/30 transition-all duration-200"
              >
                Book a Demo
              </Link>
            </div>
          </div>

          {/* Right — perks card */}
          <div className="lg:col-span-5">
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center">
                  <span className="font-mono text-[15px] font-bold text-amber">50</span>
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-white">Founding Customer Programme</p>
                  <p className="text-[12px] text-white/40 font-mono">Cohort · 2025</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {PERKS.map((perk) => (
                  <div key={perk} className="flex items-start gap-3">
                    <div className="w-[5px] h-[5px] rounded-full bg-amber shrink-0 mt-[7px]" aria-hidden />
                    <p className="text-[14px] text-white/70 leading-[1.6]">{perk}</p>
                  </div>
                ))}
              </div>

              <div className="mt-7 pt-6 border-t border-white/[0.08]">
                <p className="text-[12px] text-white/30 leading-relaxed">
                  Cohort is capped at 50 businesses. First come, first served.
                  Founding pricing includes all nine product modules.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
