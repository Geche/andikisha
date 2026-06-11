"use client";

import { useState } from "react";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import PhoneMockup from "./PhoneMockup";

const STEPS = [
  {
    id: "payroll-run",
    headline: "Twenty minutes, not three days.",
    body: "The payroll officer opens the run for the month. Employees are pre-filled from the HR register. Attendance and approved leave are already applied. An exception report surfaces anomalies — a new starter missing a bank account, a salary change pending approval. One click to resolve. One click to approve the run. Payslips go out the moment approval is confirmed.",
    screen: (
      <div className="h-full bg-white flex flex-col p-4">
        <div className="bg-brand-900 -mx-4 -mt-4 px-4 pt-5 pb-4 mb-4">
          <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1">November 2025</p>
          <p className="text-[15px] font-semibold text-white">Payroll Run</p>
          <p className="text-[11px] text-brand-100/60 mt-0.5">48 employees · Ready for review</p>
        </div>
        <div className="flex flex-col gap-2 flex-1">
          {[
            { name: "Sarah M.", dept: "Finance", status: "Ready", ok: true },
            { name: "David O.", dept: "Operations", status: "Ready", ok: true },
            { name: "Aisha K.", dept: "HR", status: "⚠ Missing IBAN", ok: false },
            { name: "Daniel N.", dept: "Sales", status: "Ready", ok: true },
            { name: "Grace W.", dept: "Tech", status: "Ready", ok: true },
          ].map((e) => (
            <div key={e.name} className="flex items-center justify-between py-2 border-b border-ink-100 last:border-0">
              <div>
                <p className="text-[12px] font-medium text-ink-900">{e.name}</p>
                <p className="text-[10px] text-ink-400">{e.dept}</p>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${e.ok ? "bg-brand-50 text-brand-700" : "bg-amber-light text-amber-dark"}`}>
                {e.status}
              </span>
            </div>
          ))}
        </div>
        <button className="mt-3 w-full py-2.5 rounded-lg bg-amber text-ink-900 font-semibold text-[12px]">
          Approve payroll run
        </button>
      </div>
    ),
  },
  {
    id: "employee-payslip",
    headline: "Plain language. Tap any line for an explanation.",
    body: "The employee opens the self-service portal on their phone. No app to install. No login with a remembered password — a six-digit PIN. The payslip loads instantly, even on 3G. Every deduction line is tappable. Tap PAYE and a plain-English card explains what it is, why it was deducted, and what the rate means.",
    screen: (
      <div className="h-full bg-white flex flex-col p-4">
        <div className="bg-brand-900 -mx-4 -mt-4 px-4 pt-5 pb-4 mb-4">
          <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1">Payslip · Nov 2025</p>
          <p className="text-[15px] font-semibold text-white">Sarah M.</p>
          <p className="text-[11px] text-brand-100/60 mt-0.5">Senior Accountant · EMP-00041</p>
        </div>
        <div className="flex flex-col gap-0 flex-1 overflow-hidden">
          {[
            { label: "Gross pay", value: "85,000.00", bold: true },
            { label: "PAYE ⓘ", value: "17,883.35" },
            { label: "NSSF Tier I ⓘ", value: "420.00" },
            { label: "NSSF Tier II ⓘ", value: "2,160.00" },
            { label: "SHIF ⓘ", value: "2,337.50" },
            { label: "Housing Levy ⓘ", value: "1,275.00" },
          ].map((row) => (
            <div key={row.label} className={`flex justify-between py-2 border-b border-ink-100 ${row.bold ? "font-semibold" : ""}`}>
              <span className={`text-[11px] ${row.bold ? "text-ink-900" : "text-ink-600"}`}>{row.label}</span>
              <span className="text-[11px] font-mono tabular-nums text-ink-900">{row.value}</span>
            </div>
          ))}
          <div className="flex justify-between py-2.5 mt-1 border-t-2 border-ink-200">
            <span className="text-[12px] font-semibold text-ink-900">Net pay</span>
            <span className="text-[12px] font-semibold font-mono text-brand-700">60,924.15</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-ink-100 text-center">
          <span className="text-[10px] text-brand-500 font-medium">Paid · M-Pesa confirmed</span>
        </div>
      </div>
    ),
  },
  {
    id: "leave-approval",
    headline: "Decisions in seconds.",
    body: "A line manager receives a leave request notification. They open the link from their phone, see the team calendar for that week, the employee's current balance, and any overlapping requests from the same department. One tap to approve, one tap to decline. The employee is notified instantly. Their leave balance updates. The next payroll run will already have the correct adjustments applied.",
    screen: (
      <div className="h-full bg-white flex flex-col p-4">
        <div className="bg-brand-900 -mx-4 -mt-4 px-4 pt-5 pb-4 mb-4">
          <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1">Leave request</p>
          <p className="text-[15px] font-semibold text-white">Pending approval</p>
        </div>
        <div className="flex-1">
          <div className="bg-surface-alt rounded-xl p-3 mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-[11px] font-semibold text-ink-900">Aisha K.</span>
              <span className="text-[10px] text-ink-400">HR Dept</span>
            </div>
            <p className="text-[11px] text-ink-600 mb-2">Annual leave · 5 days</p>
            <p className="text-[11px] font-mono text-ink-900">3 Nov – 7 Nov 2025</p>
          </div>
          <div className="flex justify-between text-[11px] text-ink-600 mb-3 px-1">
            <span>Remaining balance</span>
            <span className="font-mono text-brand-700 font-medium">14 days</span>
          </div>
          <div className="text-[10px] text-ink-400 mb-4 px-1">
            No team overlap in HR for this period.
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 py-2.5 rounded-lg bg-brand-900 text-white font-semibold text-[12px]">
            Approve
          </button>
          <button className="flex-1 py-2.5 rounded-lg border border-ink-200 text-ink-700 font-semibold text-[12px]">
            Decline
          </button>
        </div>
      </div>
    ),
  },
  {
    id: "tax-filing",
    headline: "P9, P10A, NSSF return, SHIF schedule. Done.",
    body: "After payroll is approved, the Integration Hub queues statutory file generation automatically. The P9 annual summary, the P10A monthly PAYE return, the NSSF contribution schedule, and the SHIF remittance schedule are all generated from the same payroll data. Filing is submitted to the respective authorities. The HR manager gets a confirmation. The audit log records every submission with a timestamp. No separate login to iTax required.",
    screen: (
      <div className="h-full bg-white flex flex-col p-4">
        <div className="bg-brand-900 -mx-4 -mt-4 px-4 pt-5 pb-4 mb-4">
          <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1">November 2025</p>
          <p className="text-[15px] font-semibold text-white">Statutory filings</p>
        </div>
        <div className="flex flex-col gap-2 flex-1">
          {[
            { label: "P10A — PAYE return", status: "Filed", time: "14:03" },
            { label: "NSSF contribution", status: "Filed", time: "14:03" },
            { label: "SHIF schedule", status: "Filed", time: "14:04" },
            { label: "Housing Levy", status: "Filed", time: "14:04" },
            { label: "P9 (annual, Dec)", status: "Scheduled", time: "Dec 31" },
          ].map((f) => (
            <div key={f.label} className="flex items-center justify-between py-2.5 border-b border-ink-100 last:border-0">
              <div>
                <p className="text-[11px] font-medium text-ink-900">{f.label}</p>
                <p className="text-[10px] text-ink-400 font-mono">{f.time}</p>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${f.status === "Filed" ? "bg-brand-50 text-brand-700" : "bg-amber-light text-amber-dark"}`}>
                {f.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export default function ProductWalkthrough() {
  const [active, setActive] = useState(0);
  const step = STEPS[active];

  return (
    <section className="py-[88px] bg-surface-alt">
      <Container>
        <Eyebrow className="mb-4">Product walkthrough</Eyebrow>
        <h2
          className="font-display font-black text-ink-900 leading-[1.06] tracking-[-0.02em] mb-12"
          style={{ fontSize: "clamp(28px, 3.2vw, 42px)" }}
        >
          The full loop — gross pay to filed return.
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left — text steps */}
          <div className="flex flex-col gap-0">
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setActive(i)}
                className={`text-left border-l-2 pl-6 py-5 transition-all duration-200 ${
                  active === i
                    ? "border-amber bg-white rounded-r-lg"
                    : "border-ink-200 hover:border-ink-300"
                }`}
                aria-current={active === i ? "true" : undefined}
              >
                <p
                  className={`text-[11px] font-semibold uppercase tracking-[0.12em] mb-2 ${
                    active === i ? "text-amber" : "text-ink-300"
                  }`}
                >
                  0{i + 1}
                </p>
                <h3
                  className={`font-semibold text-[18px] leading-snug mb-0 transition-colors ${
                    active === i ? "text-ink-900" : "text-ink-400"
                  }`}
                >
                  {s.headline}
                </h3>
                {active === i && (
                  <p className="text-[15px] text-ink-600 leading-[1.7] mt-3">{s.body}</p>
                )}
              </button>
            ))}
          </div>

          {/* Right — phone mockup */}
          <div className="flex justify-center lg:justify-end lg:sticky lg:top-[100px]">
            <PhoneMockup>{step.screen}</PhoneMockup>
          </div>
        </div>
      </Container>
    </section>
  );
}
