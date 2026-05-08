import type { Metadata } from "next";
import { Check, X } from "lucide-react";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import PricingTable from "@/components/pricing/PricingTable";
import FaqList from "@/components/faq/FaqList";
import JoinCTA from "@/components/cta/JoinCTA";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Transparent KES pricing for Kenyan businesses. Statutory compliance on every plan. No hidden fees.",
};

export default function PricingPage() {
  return (
    <>
      <section className="bg-brand-900 py-20 relative overflow-hidden">
        <Container className="relative z-10 text-center">
          <Eyebrow light className="mb-5">Pricing</Eyebrow>
          <h1
            className="font-display font-bold text-white max-w-[620px] mx-auto mb-5"
            style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", lineHeight: "1.05", letterSpacing: "-0.02em" }}
          >
            Pricing that makes sense at every stage.
          </h1>
          <p className="text-[18px] text-brand-100/70 max-w-[480px] mx-auto mb-7">
            One flat rate per employee per month. Full Kenya statutory compliance on every plan.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-white/80 text-[13px] font-medium">
              <Check size={13} className="text-amber" aria-hidden="true" />
              30-day free trial
            </span>
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-white/80 text-[13px] font-medium">
              <Check size={13} className="text-amber" aria-hidden="true" />
              No credit card required
            </span>
          </div>
        </Container>
      </section>

      {/* Comparison table */}
      <section className="py-20 bg-surface-alt border-b border-ink-200">
        <Container>
          <div className="text-center mb-12">
            <Eyebrow className="mb-4">Why switch</Eyebrow>
            <h2
              className="font-display font-bold text-ink-900 max-w-[480px] mx-auto"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", lineHeight: "1.1", letterSpacing: "-0.02em" }}
            >
              AndikishaHR vs running payroll on a spreadsheet
            </h2>
          </div>
          <div className="max-w-[700px] mx-auto overflow-x-auto">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="border-b border-ink-200">
                  <th className="text-left py-3 pr-6 font-semibold text-ink-500 w-[45%]">Capability</th>
                  <th className="text-center py-3 px-4 font-semibold text-ink-500 w-[27%]">Spreadsheet</th>
                  <th className="text-center py-3 px-4 font-bold text-brand-900 w-[27%]">AndikishaHR</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["PAYE brackets auto-updated", false, true],
                  ["NSSF & SHIF calculations", false, true],
                  ["KRA filing (P10A/P9)", false, true],
                  ["M-Pesa salary disbursement", false, true],
                  ["Audit trail & version history", false, true],
                  ["Employee self-service payslips", false, true],
                  ["Payroll run time", "3–5 hours", "< 20 minutes"],
                ].map(([cap, spreadsheet, andikisha]) => (
                  <tr key={String(cap)} className="border-b border-ink-100 last:border-0">
                    <td className="py-3.5 pr-6 text-ink-700 font-medium">{cap}</td>
                    <td className="py-3.5 px-4 text-center">
                      {typeof spreadsheet === "boolean" ? (
                        spreadsheet
                          ? <Check size={16} className="text-brand-500 mx-auto" aria-label="Yes" />
                          : <X size={16} className="text-error mx-auto" aria-label="No" />
                      ) : (
                        <span className="text-ink-500">{spreadsheet}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {typeof andikisha === "boolean" ? (
                        andikisha
                          ? <Check size={16} className="text-brand-500 mx-auto" aria-label="Yes" />
                          : <X size={16} className="text-error mx-auto" aria-label="No" />
                      ) : (
                        <span className="text-brand-700 font-semibold">{andikisha}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      <PricingTable />

      {/* Testimonials */}
      <section className="py-20 bg-white border-b border-ink-100">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[900px] mx-auto">
            {[
              {
                quote: "We used to spend three days on payroll every month. With AndikishaHR it takes under an hour. The PAYE calculations just work — I don't have to verify them against the KRA table anymore.",
                name: "James O.",
                role: "Finance Manager · Mombasa",
              },
              {
                quote: "The pricing is the most honest I've seen. One number per employee, nothing hidden. After 18 months we've had zero KRA penalty letters — that alone justifies the cost.",
                name: "Grace N.",
                role: "CEO · Nairobi Tech SME",
              },
            ].map(({ quote, name, role }) => (
              <div key={name} className="bg-surface-alt border border-ink-200 rounded-2xl p-7">
                <p className="text-amber text-[28px] leading-none mb-3 font-serif">&ldquo;</p>
                <p className="text-[15px] text-ink-700 leading-[1.8] mb-5">{quote}</p>
                <div>
                  <p className="text-[14px] font-semibold text-ink-900">{name}</p>
                  <p className="text-[13px] text-ink-500">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <FaqList />

      <JoinCTA />
    </>
  );
}
