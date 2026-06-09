import type { Metadata } from "next";
import { Check } from "lucide-react";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import PricingTable from "@/components/pricing/PricingTable";
import PricingComparisonTable from "@/components/pricing/PricingComparisonTable";
import PricingTestimonials from "@/components/pricing/PricingTestimonials";
import FaqList from "@/components/faq/FaqList";
import JoinCTA from "@/components/cta/JoinCTA";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Plans for Kenyan businesses at every stage. Full statutory compliance on every plan. No hidden fees.",
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
            Full Kenya statutory compliance on every plan. Choose the plan that fits your team.
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

      <PricingTable />
      <PricingComparisonTable />
      <PricingTestimonials />
      <FaqList columns={1} />
      <JoinCTA />
    </>
  );
}
