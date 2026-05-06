import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";

export const metadata: Metadata = {
  title: "Founding Customer Access — AndikishaHR",
  description:
    "Apply for founding customer access. Pricing locked for 24 months. Free migration. Named account lead. Capped at 50 Kenyan businesses.",
};

const PERKS = [
  { label: "Pricing locked", detail: "24 months from go-live" },
  { label: "Free migration", detail: "12 months of historical data" },
  { label: "Named account lead", detail: "From day one" },
  { label: "Roadmap input", detail: "Direct line to product" },
  { label: "All nine modules", detail: "Included in founding price" },
];

export default function EarlyAccessPage() {
  return (
    <>
      <section className="bg-brand-950 py-28">
        <Container>
          <div className="max-w-[640px]">
            <Eyebrow light className="mb-5">Pre-launch · capped at 50</Eyebrow>
            <h1
              className="font-display font-bold text-white mb-6 leading-[1.03]"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", letterSpacing: "-0.025em" }}
            >
              Founding customer access is open.
              <br />
              <span className="text-amber">Apply now.</span>
            </h1>
            <p className="text-[18px] text-brand-100/65 leading-[1.7] max-w-[500px]">
              The first 50 Kenyan businesses to join shape the roadmap, lock in pricing for 24 months,
              and get white-glove onboarding. When the cohort fills, this offer closes.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-white py-24">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-14">
            <div className="lg:col-span-5">
              <h2
                className="font-display font-bold text-ink-900 mb-6"
                style={{ fontSize: "clamp(1.5rem, 2.5vw, 2rem)", letterSpacing: "-0.02em", lineHeight: "1.1" }}
              >
                What founding customers get
              </h2>
              <div className="flex flex-col divide-y divide-ink-100">
                {PERKS.map(({ label, detail }) => (
                  <div key={label} className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-[5px] h-[5px] rounded-full bg-amber shrink-0" aria-hidden />
                      <span className="text-[15px] font-semibold text-ink-900">{label}</span>
                    </div>
                    <span className="text-[14px] font-mono text-ink-500">{detail}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="bg-surface-alt rounded-2xl border border-ink-200 p-8">
                <h3 className="text-[18px] font-semibold text-ink-900 mb-6">
                  Tell us about your business
                </h3>
                <p className="text-[15px] text-ink-600 leading-relaxed mb-8">
                  Applications are reviewed within 48 hours. We do a short discovery call first
                  to confirm fit, then progress to onboarding. No sales pressure — if it is not right,
                  we will tell you.
                </p>
                <Link
                  href="/contact?subject=founding-customer"
                  className="inline-flex items-center justify-center gap-2 w-full h-12 rounded-lg bg-amber text-ink-900 font-semibold text-[15px] hover:bg-amber-dark transition-colors duration-200"
                >
                  Apply via contact form
                </Link>
                <p className="text-[12px] text-ink-400 text-center mt-4">
                  Or email us at{" "}
                  <a href="mailto:founding@andikishahr.com" className="text-brand-700 hover:underline">
                    founding@andikishahr.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
