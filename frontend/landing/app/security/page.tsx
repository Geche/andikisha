import type { Metadata } from "next";
import { Shield, Lock, Server, Eye } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";

export const metadata: Metadata = {
  title: "Security",
  description:
    "How AndikishaHR protects your payroll and employee data. Encryption, access control, and compliance certifications.",
};

const SECURITY_FEATURES = [
  {
    icon: <Lock size={24} aria-hidden="true" />,
    title: "Encryption at rest and in transit",
    description:
      "All data is encrypted with AES-256 at rest. All communications use TLS 1.3. Encryption keys are managed separately from data and rotated quarterly.",
  },
  {
    icon: <Server size={24} aria-hidden="true" />,
    title: "Data residency in East Africa",
    description:
      "Your data never leaves East Africa. Infrastructure is hosted in the region to comply with Kenya's data localisation requirements and reduce latency.",
  },
  {
    icon: <Shield size={24} aria-hidden="true" />,
    title: "Schema-level tenant isolation",
    description:
      "Each customer's data lives in a separate database schema. There is no shared table between tenants. A query from one account cannot reach another account's data.",
  },
  {
    icon: <Eye size={24} aria-hidden="true" />,
    title: "Full audit logging",
    description:
      "Every data access, change, and API call is logged with timestamp, user identity, and IP address. Audit logs are immutable and retained for 7 years.",
  },
];

export default function SecurityPage() {
  return (
    <>
      <section className="bg-hero-gradient py-20 relative overflow-hidden">
        <div className="max-w-[1320px] mx-auto px-6 md:px-12 relative z-10 text-center">
          <AnimatedSection>
            <p className="section-eyebrow-white">Security</p>
            <h1 className="font-display text-[46px] md:text-[56px] font-extrabold text-white max-w-[620px] mx-auto mb-5">
              Your payroll data is sensitive. We treat it that way.
            </h1>
            <p className="text-[18px] text-white/70 max-w-[500px] mx-auto">
              Salary data, national ID numbers, KRA PINs — this is some of the
              most sensitive data a business holds. Here is how we protect it.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-[1320px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {SECURITY_FEATURES.map((f, i) => (
              <AnimatedSection key={f.title} delay={([0, 100, 0, 100] as const)[i]}>
                <div className="card flex gap-5 h-full">
                  <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-900 shrink-0">
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-[18px] text-neutral-900 mb-2">
                      {f.title}
                    </h3>
                    <p className="text-[15px] text-neutral-600 leading-relaxed">
                      {f.description}
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection>
            <div className="bg-surface-alt rounded-2xl p-8 border border-neutral-200 max-w-[680px] mx-auto text-center">
              <h2 className="font-display font-bold text-[24px] text-neutral-900 mb-3">
                Certifications and compliance
              </h2>
              <p className="text-[15px] text-neutral-600 leading-relaxed mb-6">
                We are currently working toward ISO 27001 certification. GDPR
                readiness is built into our data architecture. Kenya Data
                Protection Act compliance is embedded in our data handling
                procedures.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {["GDPR Ready", "KRA Compliant", "Data in East Africa", "ISO 27001 (in progress)"].map((b) => (
                  <span key={b} className="text-[12px] font-semibold px-3 py-1.5 rounded border border-neutral-200 bg-white text-neutral-600">
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
