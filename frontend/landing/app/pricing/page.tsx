import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import PricingTable from "@/components/pricing/PricingTable";
import FaqList from "@/components/faq/FaqList";

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
          <p className="text-[18px] text-brand-100/70 max-w-[480px] mx-auto">
            One flat rate per employee per month. Full Kenya statutory compliance on every plan.
          </p>
        </Container>
      </section>

      <PricingTable />
      <FaqList />

      <section className="bg-brand-50 py-16 border-t border-brand-100">
        <Container className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-display font-bold text-[24px] text-ink-900 mb-2">
              Not sure which plan fits?
            </h3>
            <p className="text-[16px] text-ink-600">
              Start with the 30-day free trial on any plan. No credit card. Cancel any time.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-900 text-white font-semibold text-[14px] hover:bg-brand-800 transition-colors"
            >
              Book a demo <ArrowRight size={14} aria-hidden />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber text-ink-900 font-semibold text-[14px] hover:bg-amber-dark transition-colors"
            >
              Start free trial
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
