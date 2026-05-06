import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";

export const metadata: Metadata = {
  title: "Partners — AndikishaHR",
  description:
    "Partner with AndikishaHR. Join our ecosystem of accountants, implementation partners, and investors building the future of HR in East Africa.",
};

export default function PartnersPage() {
  return (
    <>
      <section className="bg-brand-900 py-28">
        <Container>
          <div className="max-w-[680px]">
            <Eyebrow light className="mb-5">Partner ecosystem</Eyebrow>
            <h1
              className="font-display font-bold text-white mb-6 leading-[1.03]"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", letterSpacing: "-0.025em" }}
            >
              Build with us.
              <br />
              <span className="text-amber">Grow with your clients.</span>
            </h1>
            <p className="text-[18px] text-brand-100/70 leading-[1.7] max-w-[500px]">
              Accountants, implementation partners, and investors shaping the future of people operations in East Africa.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-white py-24 border-b border-ink-200">
        <Container>
          <div className="max-w-[580px] mx-auto text-center">
            <Eyebrow className="mb-5">Coming soon</Eyebrow>
            <h2
              className="font-display font-bold text-ink-900 mb-5"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", letterSpacing: "-0.02em", lineHeight: "1.1" }}
            >
              Partner programme launching with our first 50 customers.
            </h2>
            <p className="text-[16px] text-ink-600 leading-[1.7] mb-8">
              If you are an accountant, HR consultant, or implementation partner interested in adding AndikishaHR to your offering, get in touch. We are designing the programme with our early partners.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-brand-900 text-white font-semibold text-[15px] hover:bg-brand-800 transition-colors duration-200"
            >
              Enquire about partnering
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
