import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";

const BULLETS = [
  {
    title: "Pre-filled from your HR register",
    body: "Attendance, approved leave, and salary changes are already applied before you open the run. No manual data entry.",
  },
  {
    title: "Exception report surfaces every anomaly",
    body: "Missing bank accounts, unapproved salary changes, first-time employees — all flagged before you approve.",
  },
  {
    title: "One click. M-Pesa and bank together.",
    body: "Approval triggers the Daraja API and bank transfer simultaneously. Employees notified by SMS or WhatsApp.",
  },
];

const EMPLOYEES = [
  { name: "Sarah M.", dept: "Finance",    amount: "67,316", ready: true  },
  { name: "David O.", dept: "Operations", amount: "52,400", ready: true  },
  { name: "Aisha K.", dept: "HR",         amount: "41,850", ready: false },
  { name: "Daniel N.", dept: "Sales",     amount: "38,200", ready: true  },
];

export default function FeaturePayrollRun() {
  return (
    <section className="bg-white py-[88px]">
      <Container>
        <div
          className="grid items-center"
          style={{ gridTemplateColumns: "5fr 6fr", gap: "72px" }}
        >
          {/* Text */}
          <div>
            <Eyebrow className="mb-4">Payroll automation</Eyebrow>
            <h2
              className="font-display font-black text-ink-900 leading-[1.06] tracking-[-0.02em] mb-4"
              style={{ fontSize: "clamp(28px, 3.2vw, 42px)" }}
            >
              A seamless payroll run for your entire team.
            </h2>
            <p className="text-[17px] text-ink-600 leading-[1.7] max-w-[520px] mb-8">
              From employee register to approved payslips in under twenty minutes.
            </p>
            <div className="flex flex-col gap-6">
              {BULLETS.map(({ title, body }) => (
                <div key={title}>
                  <p className="flex items-center gap-2 text-[15px] font-bold text-ink-900 mb-1.5">
                    <span className="w-[7px] h-[7px] rounded-full bg-brand-900 shrink-0" aria-hidden />
                    {title}
                  </p>
                  <p className="text-[14px] text-ink-600 leading-[1.65] pl-[15px]">{body}</p>
                  <Link
                    href="/product"
                    className="flex items-center gap-1 text-[13px] font-bold text-brand-900 hover:text-brand-700 transition-colors pl-[15px] mt-1.5"
                  >
                    Learn more <ChevronRight size={12} aria-hidden />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* UI Card */}
          <div className="bg-white border border-ink-200 rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between px-5 py-4 bg-surface-alt border-b border-ink-200">
              <span className="text-[13px] font-bold text-ink-900">November 2025 · Payroll run</span>
              <span className="text-[11px] font-bold bg-brand-100 text-brand-800 px-2.5 py-1 rounded-full">
                48 employees
              </span>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: "Gross payroll", value: "KES 4.8M" },
                  { label: "Net payroll",   value: "KES 3.6M" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-surface-alt border border-ink-200 rounded-xl px-4 py-3">
                    <p className="text-[10px] font-semibold text-ink-400 uppercase tracking-[0.05em] mb-1.5">
                      {label}
                    </p>
                    <p className="text-[20px] font-black text-ink-900 tracking-tight">{value}</p>
                  </div>
                ))}
              </div>
              {EMPLOYEES.map(({ name, dept, amount, ready }) => (
                <div key={name} className="flex justify-between items-center py-2.5 border-b border-ink-100 last:border-0">
                  <div>
                    <p className="text-[13px] font-semibold text-ink-900">{name}</p>
                    <p className="text-[11px] text-ink-400">{dept}</p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-[12px] font-semibold text-ink-700">{amount}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ready ? "bg-brand-100 text-brand-800" : "bg-amber-light text-amber-dark"}`}>
                      {ready ? "Ready" : "Review"}
                    </span>
                  </div>
                </div>
              ))}
              <button className="mt-4 w-full flex items-center justify-center gap-1.5 bg-amber hover:bg-amber-dark text-ink-900 font-bold text-[13px] py-3 rounded-xl transition-colors">
                Approve payroll run <ChevronRight size={14} aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
