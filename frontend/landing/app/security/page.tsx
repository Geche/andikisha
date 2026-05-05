import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";

export const metadata: Metadata = {
  title: "Security",
  description: "How AndikishaHR protects your payroll and employee data. Encryption, access control, and compliance certifications.",
};

const FEATURES = [
  {
    title: "Encryption at rest and in transit",
    body: "All data is encrypted with AES-256 at rest. All communications use TLS 1.3. Encryption keys are managed separately from data and rotated quarterly.",
  },
  {
    title: "Data residency in East Africa",
    body: "Your data never leaves East Africa. Infrastructure is hosted in the region to comply with Kenya's data localisation requirements and reduce latency.",
  },
  {
    title: "Schema-level tenant isolation",
    body: "Each customer's data lives in a separate database schema. There is no shared table between tenants. A query from one account cannot reach another account's data.",
  },
  {
    title: "Full audit logging",
    body: "Every data access, change, and API call is logged with timestamp, user identity, and IP address. Audit logs are immutable and retained for 7 years.",
  },
  {
    title: "Role-based access control",
    body: "Platform access is governed by roles with the principle of least privilege. HR Managers, Payroll Officers, Line Managers, and Employees each see only what their role permits.",
  },
  {
    title: "Penetration testing",
    body: "We conduct third-party penetration tests at least annually. Critical findings are resolved before the next payroll cycle. Reports are available to enterprise customers under NDA.",
  },
];

const CERTIFICATIONS = [
  { label: "KDPA registered", status: "Yes" },
  { label: "GDPR-aligned data handling", status: "Yes" },
  { label: "Encryption at rest", status: "AES-256" },
  { label: "Encryption in transit", status: "TLS 1.3" },
  { label: "SOC 2 Type 1", status: "In audit" },
  { label: "ISO 27001", status: "In roadmap" },
  { label: "Audit log retention", status: "7 years" },
  { label: "Breach notification SLA", status: "72 hours" },
];

export default function SecurityPage() {
  return (
    <>
      <section className="bg-brand-900 py-20">
        <Container>
          <Eyebrow light className="mb-5">Security</Eyebrow>
          <h1
            className="font-display font-bold text-white max-w-[620px] mb-5"
            style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", lineHeight: "1.05", letterSpacing: "-0.02em" }}
          >
            Your payroll data is sensitive.
            <br />We treat it that way.
          </h1>
          <p className="text-[18px] text-brand-100/70 max-w-[500px] leading-relaxed">
            Salary data, national ID numbers, KRA PINs — this is some of the most sensitive data a business holds. Here is how we protect it.
          </p>
        </Container>
      </section>

      <section className="py-20 bg-white">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10 mb-20">
            {FEATURES.map((f) => (
              <div key={f.title}>
                <div className="w-[3px] h-8 bg-brand-700 mb-4 rounded-full" aria-hidden />
                <h3 className="font-display font-semibold text-[18px] text-ink-900 mb-2 leading-snug">
                  {f.title}
                </h3>
                <p className="text-[15px] text-ink-600 leading-[1.7]">{f.body}</p>
              </div>
            ))}
          </div>

          <div className="border border-ink-200 rounded-2xl overflow-hidden max-w-[600px]">
            <div className="bg-brand-950 px-6 py-4">
              <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-amber">Certifications & compliance</p>
            </div>
            <div className="divide-y divide-ink-100">
              {CERTIFICATIONS.map(({ label, status }) => (
                <div key={label} className="flex items-center justify-between px-6 py-3.5">
                  <span className="text-[14px] text-ink-700">{label}</span>
                  <span className={`font-mono text-[13px] ${status === "Yes" ? "text-brand-500 font-semibold" : "text-ink-500"}`}>
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
