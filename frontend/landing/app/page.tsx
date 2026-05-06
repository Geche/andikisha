import type { Metadata } from "next";
import Hero from "@/components/hero/Hero";
import SocialProofStrip from "@/components/social-proof/SocialProofStrip";
import FiveReasons from "@/components/pillars/ThreePillars";
import HowItWorks from "@/components/how-it-works/HowItWorks";
import Personas from "@/components/personas/Personas";
import PayrollCalculator from "@/components/calculator/PayrollCalculator";
import ProductWalkthrough from "@/components/walkthrough/ProductWalkthrough";
import FoundingCustomer from "@/components/founding/FoundingCustomer";
import Testimonials from "@/components/testimonials/Testimonials";
import ComplianceAuthority from "@/components/compliance/ComplianceAuthority";
import TrustSection from "@/components/trust/TrustSection";
import FinalCTABanner from "@/components/cta/FinalCTABanner";
import FaqList from "@/components/faq/FaqList";

export const metadata: Metadata = {
  title: "AndikishaHR — Kenyan HR and payroll, built statute-first",
  description:
    "One platform for HR, payroll and compliance, designed around PAYE, NSSF, SHIF, the Housing Levy, NITA and HELB. Monthly close on time. KRA filings before the 9th.",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <SocialProofStrip />
      <FiveReasons />
      <HowItWorks />
      <Personas />
      <PayrollCalculator />
      <ProductWalkthrough />
      <FoundingCustomer />
      <Testimonials />
      <ComplianceAuthority />
      <TrustSection />
      <FinalCTABanner />
      <FaqList />
    </>
  );
}
