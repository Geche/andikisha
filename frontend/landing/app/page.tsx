import type { Metadata } from "next";
import Hero from "@/components/hero/Hero";
import SocialProofStrip from "@/components/social-proof/SocialProofStrip";
import ComplianceProofStrip from "@/components/compliance/ComplianceProofStrip";
import PayrollCalculator from "@/components/calculator/PayrollCalculator";
import ThreePillars from "@/components/pillars/ThreePillars";
import ProductWalkthrough from "@/components/walkthrough/ProductWalkthrough";
import Testimonials from "@/components/testimonials/Testimonials";
import PricingTable from "@/components/pricing/PricingTable";
import TrustSection from "@/components/trust/TrustSection";
import FaqList from "@/components/faq/FaqList";

export const metadata: Metadata = {
  title: "AndikishaHR — HR and payroll, calculated correctly",
  description:
    "Statutory deductions to the cent. Payslips on the phones your team already uses. Salary disbursement on M-Pesa. Built for modern African businesses.",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <SocialProofStrip />
      <ComplianceProofStrip />
      <PayrollCalculator />
      <ThreePillars />
      <ProductWalkthrough />
      <Testimonials />
      <PricingTable />
      <TrustSection />
      <FaqList />
    </>
  );
}
