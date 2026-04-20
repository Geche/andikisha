import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import TrustRail from "@/components/home/TrustRail";
import ProblemSection from "@/components/home/ProblemSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import BenefitsSection from "@/components/home/BenefitsSection";
import HowItWorks from "@/components/home/HowItWorks";
import Testimonials from "@/components/home/Testimonials";
import PricingSection from "@/components/home/PricingSection";
import FAQSection from "@/components/home/FAQSection";
import FinalCTA from "@/components/home/FinalCTA";
import MobileCTABar from "@/components/ui/MobileCTABar";

export const metadata: Metadata = {
  title: "AndikishaHR — HR & Payroll for Kenyan Businesses",
  description:
    "Run payroll in 30 minutes. Automate PAYE, NSSF, SHIF, Housing Levy, and KRA filings. Trusted by 500+ Kenyan businesses.",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustRail />
      <ProblemSection />
      <FeaturesSection />
      <BenefitsSection />
      <HowItWorks />
      <Testimonials />
      <PricingSection />
      <FAQSection />
      <FinalCTA />
      <MobileCTABar />
    </>
  );
}
