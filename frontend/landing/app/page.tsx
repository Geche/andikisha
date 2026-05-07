import type { Metadata } from "next";
import Hero                  from "@/components/hero/Hero";
import LogosRow              from "@/components/logos/LogosRow";
import FeaturePayrollRun     from "@/components/features/FeaturePayrollRun";
import FeatureDisbursement   from "@/components/features/FeatureDisbursement";
import FeatureComplianceGrid from "@/components/features/FeatureComplianceGrid";
import PayrollCalculator     from "@/components/calculator/PayrollCalculator";
import ProductWalkthrough    from "@/components/walkthrough/ProductWalkthrough";
import ComplianceTimeline    from "@/components/compliance/ComplianceTimeline";
import StatsBand             from "@/components/stats/StatsBand";
import TrustSection          from "@/components/trust/TrustSection";
import JoinCTA               from "@/components/cta/JoinCTA";
import NewsletterSection     from "@/components/layout/NewsletterSection";
import FaqList               from "@/components/faq/FaqList";

export const metadata: Metadata = {
  title: "AndikishaHR — Kenyan HR and payroll, calculated correctly",
  description:
    "Statutory deductions to the cent. Payslips on the phones your team already uses. Salary disbursement on M-Pesa. Built for modern African businesses.",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <LogosRow />
      <FeaturePayrollRun />
      <FeatureDisbursement />
      <FeatureComplianceGrid />
      <div id="calculator">
        <PayrollCalculator />
      </div>
      <ProductWalkthrough />
      <ComplianceTimeline />
      <StatsBand />
      <TrustSection />
      <JoinCTA />
      <NewsletterSection />
      <FaqList />
    </>
  );
}
