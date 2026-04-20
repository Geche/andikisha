import type { Metadata } from "next";
import AnimatedSection from "@/components/ui/AnimatedSection";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "AndikishaHR privacy policy — how we collect, use, and protect your data.",
};

const SECTIONS = [
  {
    title: "1. Data we collect",
    body: `We collect information you provide directly: company details, employee names, national ID numbers, KRA PIN numbers, salary information, and contact details. We also collect usage data to improve the platform — page views, feature interactions, and error logs. We do not sell any of this data to third parties.`,
  },
  {
    title: "2. How we use your data",
    body: `Employee data is used exclusively to calculate payroll, statutory deductions, and generate reports for your organisation. We do not use payroll or HR data for advertising, profiling, or any purpose beyond delivering the AndikishaHR service to your organisation.`,
  },
  {
    title: "3. Data storage and residency",
    body: `All customer data is stored in East Africa on encrypted infrastructure. We use AES-256 encryption at rest and TLS 1.3 in transit. Tenant data is isolated at the schema level — no customer can access another customer's data. Backups are retained for 30 days and stored in the same geographic region.`,
  },
  {
    title: "4. Third-party services",
    body: `AndikishaHR integrates with KRA iTax and the NSSF portal to file statutory returns on your behalf. These integrations use secure API calls with credentials you provide. We also use infrastructure providers (cloud hosting, email delivery) who are contractually bound to data processing standards consistent with this policy.`,
  },
  {
    title: "5. Employee data rights",
    body: `Employees of organisations using AndikishaHR can request access to their personal data, request corrections, and request deletion (subject to statutory retention requirements — KRA requires payroll records to be retained for 7 years). Requests should be directed to your employer's HR team, who manage data access through the platform.`,
  },
  {
    title: "6. Data retention",
    body: `Active account data is retained for the duration of your subscription. On account closure, we retain statutory payroll records for 7 years as required by Kenyan law. Non-statutory data (HR notes, custom fields) is deleted within 90 days of account closure. You can request a full data export at any time.`,
  },
  {
    title: "7. Security incidents",
    body: `In the event of a data breach that affects your organisation, we will notify you within 72 hours of discovery, consistent with GDPR obligations. We maintain an incident response plan reviewed annually. Our security posture is moving toward ISO 27001 certification, details of which will be published in our security documentation.`,
  },
  {
    title: "8. Contact",
    body: `For privacy-related questions, contact our Data Protection Officer at privacy@andikishahr.com. For general enquiries, use the contact form on our website.`,
  },
];

export default function PrivacyPage() {
  return (
    <>
      <section className="bg-hero-gradient py-16 relative overflow-hidden">
        <div className="max-w-[1320px] mx-auto px-6 md:px-12 relative z-10">
          <AnimatedSection>
            <p className="section-eyebrow-white">Legal</p>
            <h1 className="font-display text-[44px] font-extrabold text-white max-w-[580px] mb-4">
              Privacy Policy
            </h1>
            <p className="text-[16px] text-white/60">Last updated: April 2026</p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-[720px] mx-auto px-6">
          <AnimatedSection>
            <p className="text-[17px] text-neutral-600 leading-relaxed mb-10">
              AndikishaHR Limited (&ldquo;AndikishaHR&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is committed to
              protecting the personal data of our customers, their employees,
              and anyone who interacts with our platform. This policy explains
              what data we collect, why we collect it, and how we protect it.
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
