import { FileText, Smartphone, CreditCard, Shield } from "lucide-react";
import type { ComponentType } from "react";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";

const LEFT_CARDS = [
  {
    icon: FileText,
    title: "Statutory returns, auto-generated",
    body: "P10A, NSSF schedule, SHIF remittance, Housing Levy — generated automatically from approved payroll, formatted and ready to file.",
  },
  {
    icon: Smartphone,
    title: "Mobile-first for every employee",
    body: "Payslips on entry-level Android. PIN login, no password rules. The self-service portal is built to load on 3G and low bandwidth.",
  },
];

const RIGHT_CARDS = [
  {
    icon: CreditCard,
    title: "M-Pesa and bank in one run",
    body: "Native Daraja API. Direct integration with Equity, KCB, Co-op, NCBA, Stanbic. No re-keying, no second platform.",
  },
  {
    icon: Shield,
    title: "Data hosted in Kenya",
    body: "KDPA compliant. Tenant isolation at the PostgreSQL schema level. AES-256 at rest, TLS 1.3 in transit.",
  },
];

function Card({
  icon: Icon, title, body,
}: { icon: ComponentType<{ size?: number; className?: string }>; title: string; body: string }) {
  return (
    <div className="bg-white border border-ink-200 rounded-2xl p-6 flex flex-col gap-3">
      <div className="w-10 h-10 rounded-[10px] bg-brand-50 flex items-center justify-center">
        <Icon size={20} className="text-brand-900" />
      </div>
      <p className="text-[14px] font-bold text-ink-900">{title}</p>
      <p className="text-[13px] text-ink-600 leading-[1.65]">{body}</p>
    </div>
  );
}

const MONTHS = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];
const GROSS = "0,60 60,54 120,50 180,45 240,39 300,28";
const NET   = "0,72 60,68 120,64 180,60 240,55 300,46";

export default function FeatureComplianceGrid() {
  return (
    <section className="bg-white py-[88px]">
      <Container>
        {/* Header */}
        <div className="text-center mb-14">
          <Eyebrow className="mb-4 inline-block">Built-in compliance</Eyebrow>
          <h2
            className="font-display font-black text-ink-900 leading-[1.06] tracking-[-0.02em] mb-4 mx-auto"
            style={{ fontSize: "clamp(28px, 3.2vw, 42px)", maxWidth: "600px" }}
          >
            Every Kenyan statutory rule, in writing and in code.
          </h2>
          <p className="text-[17px] text-ink-600 leading-[1.7] max-w-[560px] mx-auto">
            PAYE, NSSF, SHIF, Housing Levy, NITA, HELB. When the law changes, we ship the same day.
          </p>
        </div>

        {/* 3-col grid */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-[1fr_1.6fr_1fr]">
          {/* Left column */}
          <div className="flex flex-col gap-4">
            {LEFT_CARDS.map((c) => <Card key={c.title} {...c} />)}
          </div>

          {/* Centre — spans 2 rows */}
          <div className="bg-white border border-ink-200 rounded-2xl p-6 flex flex-col gap-4 lg:row-span-2">
            <p className="text-[14px] font-bold text-ink-900">Payroll cost over time</p>
            <p className="text-[13px] text-ink-600 leading-[1.65]">
              Track gross payroll, deductions, and net cost month over month across your organisation.
            </p>
            <div className="bg-surface-alt border border-ink-200 rounded-xl p-4 flex flex-col flex-1">
              <p className="text-[11px] font-semibold text-ink-400 uppercase tracking-[0.05em] mb-3">
                Monthly payroll — KES (millions)
              </p>
              {/* token-exempt: illustrative inline chart. SVG presentation
                  attributes (stroke/fill) take literal colour values, not class
                  tokens; the line colours mirror brand-900 (#0b3d2e) and amber
                  (#e8a020) with neutral gridlines (#e5e7eb). */}
              <svg viewBox="0 0 300 90" className="w-full" style={{ height: 90 }} aria-hidden>
                <line x1="0" y1="22" x2="300" y2="22" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="0" y1="44" x2="300" y2="44" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="0" y1="66" x2="300" y2="66" stroke="#e5e7eb" strokeWidth="1" />
                <polygon points={`${GROSS} 300,90 0,90`} fill="rgba(11,61,46,0.06)" />
                <polyline points={GROSS} fill="none" stroke="#0b3d2e" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round" />
                <polygon points={`${NET} 300,90 0,90`} fill="rgba(232,160,32,0.06)" />
                <polyline points={NET} fill="none" stroke="#e8a020" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5,3" />
              </svg>
              <div className="flex justify-between mt-2">
                {MONTHS.map((m) => <span key={m} className="text-[10px] text-ink-400">{m}</span>)}
              </div>
              <div className="flex gap-4 mt-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-[2.5px] rounded bg-brand-900" />
                  <span className="text-[11px] text-ink-600">Gross</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-[2px] rounded bg-amber" />
                  <span className="text-[11px] text-ink-600">Net</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">
            {RIGHT_CARDS.map((c) => <Card key={c.title} {...c} />)}
          </div>
        </div>
      </Container>
    </section>
  );
}
