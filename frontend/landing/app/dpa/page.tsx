import type { Metadata } from "next";
import AnimatedSection from "@/components/ui/AnimatedSection";

export const metadata: Metadata = {
  title: "Data Processing Agreement",
  description:
    "AndikishaHR Data Processing Agreement — how we process personal data on behalf of your organisation as a data processor.",
};

const SECTIONS = [
  {
    title: "1. Definitions",
    body: `"Controller" means the organisation (employer) that determines the purposes and means of processing employee personal data. "Processor" means AndikishaHR Limited, which processes personal data on behalf of the Controller. "Data Subject" means any identified or identifiable natural person whose personal data is processed — primarily employees of the Controller. "Personal Data" means any information relating to an identified or identifiable natural person.`,
  },
  {
    title: "2. Subject matter and duration",
    body: `AndikishaHR processes personal data on behalf of the Controller for the purpose of providing payroll, HR, and compliance services as described in the service agreement. Processing continues for the duration of the service agreement and ceases upon termination, subject to statutory retention requirements.`,
  },
  {
    title: "3. Nature and purpose of processing",
    body: `Processing activities include: calculating statutory deductions (PAYE, NSSF, SHIF, Housing Levy), generating payslips, filing statutory returns with KRA and other bodies, maintaining employment records, and providing HR management tools. All processing is performed exclusively to deliver the contracted service and comply with applicable Kenyan law.`,
  },
  {
    title: "4. Type of personal data processed",
    body: `We process the following categories of data: employee names, national ID numbers, KRA PIN numbers, NSSF numbers, SHIF numbers, bank account details for salary disbursement, salary and compensation information, employment terms, leave records, and attendance data. We do not process special category data (health, biometric, or criminal records) unless explicitly required by the service and separately agreed.`,
  },
  {
    title: "5. Processor obligations",
    body: `AndikishaHR shall: process personal data only on documented instructions from the Controller; ensure that persons authorised to process personal data have committed to confidentiality; implement appropriate technical and organisational security measures; not engage sub-processors without prior written authorisation from the Controller; assist the Controller in meeting data subject rights requests; delete or return all personal data on termination of services.`,
  },
  {
    title: "6. Controller obligations",
    body: `The Controller shall: ensure it has a lawful basis for processing employee personal data; provide accurate and complete data to AndikishaHR; notify AndikishaHR of any corrections required; handle data subject requests from employees and direct technical requests to AndikishaHR as appropriate; ensure employees are informed that their data is processed by AndikishaHR as a service provider.`,
  },
  {
    title: "7. Security measures",
    body: `AndikishaHR maintains the following security measures: AES-256 encryption at rest; TLS 1.3 in transit; tenant data isolated at the database schema level; role-based access controls with principle of least privilege; multi-factor authentication for platform access; penetration testing at least annually; 30-day encrypted backup retention; incident response procedure with 72-hour breach notification to Controllers.`,
  },
  {
    title: "8. Sub-processors",
    body: `AndikishaHR uses the following categories of sub-processors: cloud infrastructure providers (data hosted in East Africa), email delivery services for system notifications, and KRA iTax API for statutory filing. A current list of sub-processors is available on request. The Controller will be notified of any material changes to sub-processors with at least 30 days' notice.`,
  },
  {
    title: "9. Data subject rights",
    body: `When AndikishaHR receives a request directly from a data subject (employee), it will promptly notify the Controller. The Controller remains responsible for responding to data subject rights requests. AndikishaHR will provide reasonable technical assistance to help the Controller fulfil access, correction, erasure, and portability requests. Erasure requests are subject to statutory retention requirements — KRA requires payroll records for 7 years.`,
  },
  {
    title: "10. Data transfers",
    body: `All customer data is stored and processed within East Africa. AndikishaHR does not transfer personal data outside East Africa without the prior written consent of the Controller except where required by applicable law, in which case AndikishaHR will notify the Controller to the extent legally permissible.`,
  },
  {
    title: "11. Termination",
    body: `On termination of the service agreement, AndikishaHR will export all Controller data in a machine-readable format within 30 days and then securely delete all copies unless statutory retention obligations require otherwise. Deletion certificates are available on request.`,
  },
  {
    title: "12. Governing law",
    body: `This Data Processing Agreement is governed by the laws of Kenya. Any disputes arising under this agreement shall be subject to the exclusive jurisdiction of the courts of Kenya. This agreement is incorporated into and forms part of the AndikishaHR Terms of Service.`,
  },
];

export default function DpaPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-hero-gradient py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_40%,rgba(232,160,32,0.08)_0%,transparent_65%)] pointer-events-none" />
        <div className="max-w-[820px] mx-auto px-6 relative z-10">
          <AnimatedSection>
            <p className="section-eyebrow-white">Legal</p>
          </AnimatedSection>
          <AnimatedSection delay={100}>
            <h1 className="font-display text-[42px] md:text-[52px] font-extrabold text-white mb-5">
              Data Processing Agreement
            </h1>
          </AnimatedSection>
          <AnimatedSection delay={200}>
            <p className="text-[16px] text-white/65 leading-relaxed">
              This agreement governs how AndikishaHR processes personal data on
              behalf of organisations using our platform, in compliance with the
              Kenya Data Protection Act 2019.
            </p>
            <p className="text-[13px] text-white/40 mt-4">
              Last updated: January 2026
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-white">
        <div className="max-w-[720px] mx-auto px-6">
          <div className="flex flex-col gap-10">
            {SECTIONS.map((section, i) => (
              <AnimatedSection key={i} delay={([0, 0, 100, 100, 200, 200, 0, 0, 100, 100, 200, 200] as const)[i % 12]}>
                <div>
                  <h2 className="font-display font-bold text-[20px] text-neutral-900 mb-3">
                    {section.title}
                  </h2>
                  <p className="text-[16px] text-neutral-600 leading-[1.8]">
                    {section.body}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection>
            <div className="mt-12 bg-brand-50 border border-brand-100 rounded-2xl p-7">
              <h3 className="font-display font-bold text-[20px] text-neutral-900 mb-3">
                Questions about this agreement?
              </h3>
              <p className="text-[15px] text-neutral-600 mb-2">
                Contact our Data Protection Officer at{" "}
                <a
                  href="mailto:dpo@andikishahr.com"
                  className="text-brand-800 font-semibold hover:underline"
                >
                  dpo@andikishahr.com
                </a>
              </p>
              <p className="text-[14px] text-neutral-500">
                AndikishaHR Limited · Nairobi, Kenya
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
