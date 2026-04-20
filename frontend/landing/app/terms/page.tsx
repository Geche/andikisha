import type { Metadata } from "next";
import AnimatedSection from "@/components/ui/AnimatedSection";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "AndikishaHR terms of service — your rights and obligations as a customer.",
};

const SECTIONS = [
  {
    title: "1. Acceptance of terms",
    body: `By creating an AndikishaHR account or using any AndikishaHR service, you agree to these terms. If you are creating an account on behalf of a company, you confirm you have authority to bind that company to these terms.`,
  },
  {
    title: "2. Service description",
    body: `AndikishaHR provides a cloud-based HR and payroll management platform for businesses in Kenya and East Africa. The platform automates payroll calculation, statutory deductions, KRA filing, and employee self-service functions. We do not provide legal or tax advice — the platform automates calculations based on published statutory rates. For advice on unusual employment situations, consult a licensed tax professional.`,
  },
  {
    title: "3. Account responsibilities",
    body: `You are responsible for maintaining accurate employee data in the system. AndikishaHR calculates deductions based on the data you provide. Errors resulting from incorrect input data — wrong salary figures, missing employment dates, incorrect tax codes — are your responsibility to correct. We provide tools to identify and correct errors before submission, but cannot validate data accuracy.`,
  },
  {
    title: "4. Statutory filing",
    body: `When you authorise AndikishaHR to file returns on your behalf, you confirm that the data being submitted is accurate and complete. You remain the legal taxpayer and employer responsible for statutory compliance. AndikishaHR acts as your agent in filing, but liability for incorrect filings resulting from inaccurate data rests with the employer.`,
  },
  {
    title: "5. Pricing and billing",
    body: `Billing is monthly, based on the number of active employees in the platform on the billing date. An active employee is any employee profile with a payroll run in the current billing period. Accounts are billed in Kenyan Shillings (KES). Price changes will be communicated 30 days in advance.`,
  },
  {
    title: "6. Data and confidentiality",
    body: `Your employee data and payroll records are confidential. We do not share this data with third parties except as required to deliver the service (e.g., filing with KRA) or as required by law. Full details are in our Privacy Policy.`,
  },
  {
    title: "7. Termination",
    body: `You may cancel your account at any time. On cancellation, you retain access until the end of the current billing period. You can export your data at any time. We retain statutory records for 7 years as required by Kenyan law; non-statutory data is deleted within 90 days of account closure.`,
  },
  {
    title: "8. Limitation of liability",
    body: `AndikishaHR's liability for any claim arising from use of the platform is limited to the amount you paid in the 3 months preceding the claim. We are not liable for penalties resulting from incorrect data submitted to KRA by the customer.`,
  },
  {
    title: "9. Governing law",
    body: `These terms are governed by the laws of Kenya. Any disputes will be resolved in the courts of Nairobi, Kenya.`,
  },
];

export default function TermsPage() {
  return (
    <>
      <section className="bg-hero-gradient py-16 relative overflow-hidden">
        <div className="max-w-[1320px] mx-auto px-6 md:px-12 relative z-10">
          <AnimatedSection>
            <p className="section-eyebrow-white">Legal</p>
            <h1 className="font-display text-[44px] font-extrabold text-white max-w-[580px] mb-4">
              Terms of Service
            </h1>
            <p className="text-[16px] text-white/60">Last updated: April 2026</p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-[720px] mx-auto px-6">
          <AnimatedSection>
            <p className="text-[17px] text-neutral-600 leading-relaxed mb-10">
              These terms of service govern your use of AndikishaHR&apos;s platform
              and services. Please read them carefully. By using the service you
              accept these terms.
            </p>
          </AnimatedSection>
          <div className="flex flex-col gap-10">
            {SECTIONS.map((s, i) => (
              <AnimatedSection key={i}>
                <h2 className="font-display font-bold text-[22px] text-neutral-900 mb-3">
                  {s.title}
                </h2>
                <p className="text-[16px] text-neutral-600 leading-[1.85]">
                  {s.body}
                </p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
