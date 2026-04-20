import type { Metadata } from "next";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { FEATURES_TABS } from "@/lib/data";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Explore AndikishaHR's full feature set: automated payroll, Kenya statutory compliance, leave management, time tracking, and mobile-first employee experience.",
};

const COMPLIANCE_ITEMS = [
  { code: "PAYE", name: "Pay As You Earn", detail: "KRA income tax brackets, personal relief, insurance relief — all updated automatically when rates change." },
  { code: "NSSF", name: "National Social Security Fund", detail: "Tier I and Tier II contributions calculated per employee. Both employer and employee portions handled correctly." },
  { code: "SHIF", name: "Social Health Insurance Fund", detail: "Replaced NHIF. New contribution rates applied automatically. Employer remittance schedule managed." },
  { code: "HL", name: "Housing Levy", detail: "1.5% employee deduction + 1.5% employer contribution. Filed and reconciled every payroll cycle." },
  { code: "NITA", name: "National Industrial Training Authority", detail: "Monthly levy calculated on gross payroll. Remittance report generated automatically." },
  { code: "HELB", name: "Higher Education Loans Board", detail: "Deductions managed per employee loan status. Repayment schedules tracked and reported." },
];

const INTEGRATIONS = [
  { name: "KRA iTax", description: "Direct PAYE and WHT filing", status: "Live" },
  { name: "M-Pesa", description: "Salary disbursement to any number", status: "Live" },
  { name: "NSSF Portal", description: "Contribution remittance", status: "Live" },
  { name: "SHIF Portal", description: "Health fund deductions", status: "Live" },
  { name: "QuickBooks", description: "Accounting journal sync", status: "Coming" },
  { name: "Xero", description: "Two-way ledger sync", status: "Coming" },
  { name: "Sage", description: "ERP payroll export", status: "Coming" },
  { name: "Google Workspace", description: "SSO and directory sync", status: "Coming" },
];

export default function FeaturesPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-hero-gradient py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(232,160,32,0.1)_0%,transparent_60%)] pointer-events-none" />
        <div className="max-w-[1320px] mx-auto px-6 md:px-12 relative z-10 text-center">
          <AnimatedSection>
            <p className="section-eyebrow-white">Product Features</p>
          </AnimatedSection>
          <AnimatedSection delay={100}>
            <h1 className="font-display text-[48px] md:text-[60px] font-extrabold text-white max-w-[720px] mx-auto mb-6">
              Built for how Kenyan HR actually works.
            </h1>
          </AnimatedSection>
          <AnimatedSection delay={200}>
            <p className="text-[18px] text-white/70 max-w-[580px] mx-auto mb-10 leading-relaxed">
              Every feature in AndikishaHR starts with one question: what does
              an HR Manager in Nairobi actually need today? The answer drives
              every product decision.
            </p>
          </AnimatedSection>
          <AnimatedSection delay={300}>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/pricing" className="btn-primary btn-lg">
                Start Free Trial
              </Link>
              <Link href="/demo" className="btn-outline-white btn-lg">
                See a Live Demo
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Module tabs — detailed */}
      {FEATURES_TABS.map((tab, idx) => (
        <section
          key={tab.id}
          id={tab.id}
          className={`py-24 ${idx % 2 === 0 ? "bg-white" : "bg-surface-alt"}`}
        >
          <div className="max-w-[1320px] mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Copy — alternates sides */}
              <div className={idx % 2 === 1 ? "lg:order-2" : ""}>
                <AnimatedSection>
                  <p className="section-eyebrow">{tab.label}</p>
                  <h2 className="section-title max-w-[480px]">
                    {idx === 0 && "Compliance is the foundation, not an add-on."}
                    {idx === 1 && "Your people data. Organised and auditable."}
                    {idx === 2 && "The HR system your employees will actually use."}
                  </h2>
                  <p className="section-sub mb-8">
                    {idx === 0 && "Kenya's full statutory stack is encoded into every payroll run. PAYE, NSSF, SHIF, Housing Levy — calculated correctly the first time, every time."}
                    {idx === 1 && "One place for every employee record from hire to exit. Full audit trail, role-based access, and workflow approvals built in."}
                    {idx === 2 && "Employees check payslips, request leave, and update details from their phone. No training required. No app to install."}
                  </p>
                </AnimatedSection>
                <div className="flex flex-col gap-3">
                  {tab.items.map((item) => (
                    <AnimatedSection key={item.title}>
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-brand-50 flex items-center justify-center shrink-0 mt-0.5">
                          <Check size={11} strokeWidth={3} className="text-brand-700" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="font-semibold text-[15px] text-neutral-900">{item.title}</p>
                          <p className="text-[14px] text-neutral-600 leading-relaxed">{item.description}</p>
                        </div>
                      </div>
                    </AnimatedSection>
                  ))}
                </div>
              </div>

              {/* Mockup */}
              <div className={idx % 2 === 1 ? "lg:order-1" : ""}>
                <AnimatedSection delay={100}>
                  <div className="bg-brand-950 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-[-40px] right-[-40px] w-[200px] h-[200px] bg-[radial-gradient(circle,rgba(232,160,32,0.15)_0%,transparent_70%)] pointer-events-none" />
                    <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-white/40 font-display mb-4">
                      {tab.mockupTitle}
                    </p>
                    <div className="relative z-10">
                      {tab.mockupRows.map((row, i) => (
                        <div key={i} className="mockup-row">
                          <span className="mockup-label">{row.label}</span>
                          {row.badge ? (
                            <span className={`badge-${row.badgeColor}`}>{row.badge}</span>
                          ) : (
                            <span className="mockup-value">{row.value}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </AnimatedSection>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Compliance stack explainer */}
      <section id="compliance" className="py-24 bg-brand-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(232,160,32,0.06)_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-[1320px] mx-auto px-6 md:px-12 relative z-10">
          <div className="text-center mb-14">
            <AnimatedSection>
              <p className="section-eyebrow-white">Compliance Engine</p>
            </AnimatedSection>
            <AnimatedSection delay={100}>
              <h2 className="font-display text-[40px] font-extrabold text-white mb-4 max-w-[560px] mx-auto">
                Kenya&apos;s full statutory stack. Handled automatically.
              </h2>
            </AnimatedSection>
            <AnimatedSection delay={200}>
              <p className="text-[17px] text-white/65 max-w-[520px] mx-auto">
                Six statutory obligations. All calculated, filed, and reconciled
                in a single payroll run — without you tracking a single gazette
                notice.
              </p>
            </AnimatedSection>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {COMPLIANCE_ITEMS.map((item, i) => (
              <AnimatedSection key={item.code} delay={([0, 100, 200, 0, 100, 200] as const)[i]}>
                <div className="bg-white/[0.05] border border-white/10 rounded-xl p-5 hover:bg-white/[0.08] transition-colors duration-200">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-mono font-medium text-[13px] bg-amber/20 text-amber px-2.5 py-1 rounded">
                      {item.code}
                    </span>
                    <span className="font-semibold text-[15px] text-white">
                      {item.name}
                    </span>
                  </div>
                  <p className="text-[14px] text-white/55 leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section id="integrations" className="py-24 bg-white">
        <div className="max-w-[1320px] mx-auto px-6 md:px-12">
          <div className="text-center mb-14">
            <AnimatedSection>
              <p className="section-eyebrow">Integrations</p>
            </AnimatedSection>
            <AnimatedSection delay={100}>
              <h2 className="section-title mx-auto max-w-[520px]">
                Connects with the tools you already use.
              </h2>
            </AnimatedSection>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {INTEGRATIONS.map((integ, i) => (
              <AnimatedSection key={integ.name} delay={([0, 100, 200, 300, 0, 100, 200, 300] as const)[i % 4]}>
                <div className="card text-center">
                  <div className="font-display font-bold text-[17px] text-neutral-900 mb-1">
                    {integ.name}
                  </div>
                  <p className="text-[14px] text-neutral-600 mb-3">
                    {integ.description}
                  </p>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded ${
                    integ.status === "Live"
                      ? "bg-brand-50 text-brand-700"
                      : "bg-amber-light text-amber-dark"
                  }`}>
                    {integ.status}
                  </span>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="bg-brand-50 py-16 border-y border-brand-100">
        <div className="max-w-[1320px] mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-display font-bold text-[26px] text-neutral-900 mb-2">
              Ready to see it in action?
            </h3>
            <p className="text-[16px] text-neutral-600">
              Set up takes less than a day. Your first payroll run is on us.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/pricing" className="btn-primary">
              Start Free Trial
            </Link>
            <Link href="/demo" className="btn-outline-dark inline-flex items-center gap-2">
              Request Demo <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
