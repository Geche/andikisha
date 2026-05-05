import type { Metadata } from "next";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import { FEATURES_TABS } from "@/lib/data";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Explore AndikishaHR's full feature set: automated payroll, Kenya statutory compliance, leave management, time tracking, and mobile-first employee experience.",
};

const COMPLIANCE_ITEMS = [
  {
    code: "PAYE",
    name: "Pay As You Earn",
    detail:
      "KRA income tax brackets, personal relief, insurance relief — all updated automatically when rates change.",
  },
  {
    code: "NSSF",
    name: "National Social Security Fund",
    detail:
      "Tier I and Tier II contributions calculated per employee. Both employer and employee portions handled correctly.",
  },
  {
    code: "SHIF",
    name: "Social Health Insurance Fund",
    detail:
      "Replaced NHIF. New contribution rates applied automatically. Employer remittance schedule managed.",
  },
  {
    code: "HL",
    name: "Housing Levy",
    detail:
      "1.5% employee deduction + 1.5% employer contribution. Filed and reconciled every payroll cycle.",
  },
  {
    code: "NITA",
    name: "National Industrial Training Authority",
    detail:
      "Monthly levy calculated on gross payroll. Remittance report generated automatically.",
  },
  {
    code: "HELB",
    name: "Higher Education Loans Board",
    detail:
      "Deductions managed per employee loan status. Repayment schedules tracked and reported.",
  },
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

const SECTION_COPY: Record<string, { headline: string; sub: string }> = {
  payroll: {
    headline: "Compliance is the foundation, not an add-on.",
    sub: "Kenya's full statutory stack is encoded into every payroll run. PAYE, NSSF, SHIF, Housing Levy — calculated correctly the first time, every time.",
  },
  people: {
    headline: "Your people data. Organised and auditable.",
    sub: "One place for every employee record from hire to exit. Full audit trail, role-based access, and workflow approvals built in.",
  },
  employee: {
    headline: "The HR system your employees will actually use.",
    sub: "Employees check payslips, request leave, and update details from their phone. No training required. No app to install.",
  },
};

export default function FeaturesPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-brand-900 py-24">
        <Container>
          <div className="text-center max-w-[720px] mx-auto">
            <Eyebrow light className="mb-5">
              Product Features
            </Eyebrow>
            <h1
              className="font-display font-extrabold text-white mb-6"
              style={{
                fontSize: "clamp(2.25rem, 4vw, 3.5rem)",
                lineHeight: "1.05",
                letterSpacing: "-0.015em",
              }}
            >
              Built for how Kenyan HR actually works.
            </h1>
            <p className="text-[18px] text-white/70 max-w-[560px] mx-auto mb-10 leading-relaxed">
              Every feature in AndikishaHR starts with one question: what does
              an HR Manager in Nairobi actually need today? The answer drives
              every product decision.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/pricing" className="btn-primary btn-lg">
                Start Free Trial
              </Link>
              <Link href="/demo" className="btn-outline-white btn-lg">
                See a Live Demo
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Feature modules — alternating layout */}
      {FEATURES_TABS.map((tab, idx) => {
        const copy = SECTION_COPY[tab.id];
        const isEven = idx % 2 === 0;
        return (
          <section
            key={tab.id}
            id={tab.id}
            className={`py-24 ${isEven ? "bg-white" : "bg-surface-alt"}`}
          >
            <Container>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                {/* Copy — alternates sides on lg */}
                <div className={!isEven ? "lg:order-2" : ""}>
                  <Eyebrow className="mb-5">{tab.label}</Eyebrow>
                  <h2
                    className="font-display font-extrabold text-ink-900 mb-5 max-w-[480px]"
                    style={{
                      fontSize: "clamp(2.25rem, 4vw, 3.5rem)",
                      lineHeight: "1.05",
                      letterSpacing: "-0.015em",
                    }}
                  >
                    {copy.headline}
                  </h2>
                  <p className="text-[17px] text-ink-600 leading-[1.8] mb-8">
                    {copy.sub}
                  </p>
                  <div className="flex flex-col gap-4">
                    {tab.items.map((item) => (
                      <div key={item.title} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0 mt-0.5">
                          <Check
                            size={11}
                            strokeWidth={3}
                            className="text-brand-700"
                            aria-hidden="true"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-[15px] text-ink-900">
                            {item.title}
                          </p>
                          <p className="text-[14px] text-ink-600 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mockup panel */}
                <div className={!isEven ? "lg:order-1" : ""}>
                  <div className="bg-brand-950 rounded-2xl p-6">
                    <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-white/40 font-display mb-4">
                      {tab.mockupTitle}
                    </p>
                    <div>
                      {tab.mockupRows.map((row, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between py-3 border-b border-white/[0.07] last:border-0"
                        >
                          <span className="text-[13px] text-white/50">
                            {row.label}
                          </span>
                          {row.badge ? (
                            <span
                              className={`text-[12px] font-semibold px-2.5 py-1 rounded ${
                                row.badgeColor === "green"
                                  ? "bg-brand-500/20 text-brand-500"
                                  : row.badgeColor === "amber"
                                  ? "bg-amber/20 text-amber"
                                  : "bg-info/20 text-info"
                              }`}
                            >
                              {row.badge}
                            </span>
                          ) : (
                            <span className="text-[13px] font-semibold text-white">
                              {row.value}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Container>
          </section>
        );
      })}

      {/* Compliance stack */}
      <section id="compliance" className="py-24 bg-brand-950">
        <Container>
          <div className="text-center mb-14">
            <Eyebrow light className="mb-5">
              Compliance Engine
            </Eyebrow>
            <h2
              className="font-display font-extrabold text-white mb-4 max-w-[560px] mx-auto"
              style={{
                fontSize: "clamp(2.25rem, 4vw, 3.5rem)",
                lineHeight: "1.05",
                letterSpacing: "-0.015em",
              }}
            >
              Kenya&apos;s full statutory stack. Handled automatically.
            </h2>
            <p className="text-[17px] text-white/65 max-w-[520px] mx-auto">
              Six statutory obligations. All calculated, filed, and reconciled
              in a single payroll run — without you tracking a single gazette
              notice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {COMPLIANCE_ITEMS.map((item) => (
              <div
                key={item.code}
                className="bg-white/[0.05] border border-white/10 rounded-xl p-5 hover:bg-white/[0.08] transition-colors duration-200"
              >
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
            ))}
          </div>
        </Container>
      </section>

      {/* Integrations */}
      <section id="integrations" className="py-24 bg-surface-alt">
        <Container>
          <div className="text-center mb-14">
            <Eyebrow className="mb-5">Integrations</Eyebrow>
            <h2
              className="font-display font-extrabold text-ink-900 max-w-[520px] mx-auto"
              style={{
                fontSize: "clamp(2.25rem, 4vw, 3.5rem)",
                lineHeight: "1.05",
                letterSpacing: "-0.015em",
              }}
            >
              Connects with the tools you already use.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {INTEGRATIONS.map((integ) => (
              <div
                key={integ.name}
                className="bg-white rounded-xl border border-ink-200 p-5 text-center"
              >
                <p className="font-display font-bold text-[17px] text-ink-900 mb-1">
                  {integ.name}
                </p>
                <p className="text-[14px] text-ink-600 mb-4">
                  {integ.description}
                </p>
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded ${
                    integ.status === "Live"
                      ? "bg-brand-50 text-brand-700"
                      : "bg-amber-light text-amber-dark"
                  }`}
                >
                  {integ.status}
                </span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA strip */}
      <section className="bg-brand-50 py-16 border-y border-brand-100">
        <Container>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display font-bold text-[26px] text-ink-900 mb-2">
                Ready to see it in action?
              </h3>
              <p className="text-[16px] text-ink-600">
                Set up takes less than a day. Your first payroll run is on us.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link href="/pricing" className="btn-primary">
                Start Free Trial
              </Link>
              <Link
                href="/demo"
                className="btn-outline-dark"
              >
                Request Demo <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
