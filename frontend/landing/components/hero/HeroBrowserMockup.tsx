import {
  LayoutDashboard, DollarSign, Users, Calendar,
  Activity, Shield, BarChart2, Download,
} from "lucide-react";
import { LogoFull } from "@andikisha/ui";

const SIDEBAR_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: DollarSign,      label: "Payroll" },
  { icon: Users,           label: "Employees" },
  { icon: Calendar,        label: "Leave" },
  { icon: Activity,        label: "Attendance" },
  { icon: Shield,          label: "Compliance" },
  { icon: BarChart2,       label: "Reports" },
];

const EMPLOYEES = [
  { name: "Sarah M.", dept: "Finance",    amount: "67,316", ready: true },
  { name: "David O.", dept: "Operations", amount: "52,400", ready: true },
  { name: "Aisha K.", dept: "HR",         amount: "41,850", ready: false },
  { name: "Daniel N.", dept: "Sales",     amount: "38,200", ready: true },
];

const FILINGS = [
  { name: "P10A — PAYE return",  amount: "KES 568,000",  status: "Ready",     filed: true },
  { name: "NSSF contribution",   amount: "KES 204,960",  status: "Ready",     filed: true },
  { name: "SHIF remittance",     amount: "KES 132,330",  status: "Ready",     filed: true },
  { name: "P9 annual — Dec",     amount: "—",            status: "Scheduled", filed: false },
];

const METRICS = [
  { label: "Gross payroll",    value: "4.8M", delta: "↑ 3.2% from Oct", deltaClass: "text-brand-500" },
  { label: "Total deductions", value: "1.2M", delta: "PAYE · NSSF · SHIF", deltaClass: "text-ink-400" },
  { label: "Net payroll",      value: "3.6M", delta: "KES total",          deltaClass: "text-ink-400" },
  { label: "Exceptions",       value: "3",    delta: "Needs review",        deltaClass: "text-amber", valueClass: "text-amber" },
];

export function HeroBrowserMockup() {
  return (
    <div
      className="rounded-t-[14px] overflow-hidden shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_32px_80px_rgba(0,0,0,0.14)]"
      aria-hidden="true"
    >
      {/* Browser chrome.
          token-exempt: the dark window bar (#2d2d2d/#3a3a3a/#3d3d3d) and the
          macOS traffic-light dots (#ff5f57/#ffbd2e/#28c840) are illustrative OS
          chrome, not brand colours — no token applies. */}
      <div className="bg-[#2d2d2d] px-4 py-3 flex items-center gap-3 border-b border-[#3a3a3a]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 bg-[#3d3d3d] rounded-md py-1.5 px-3 text-center font-mono text-[11px] text-white/35">
          app.andikishahr.com / payroll
        </div>
      </div>

      {/* App layout */}
      <div className="bg-surface-alt grid grid-cols-1 lg:grid-cols-[210px_1fr]" style={{ minHeight: "420px" }}>

        {/* Sidebar — hidden on mobile, where it would consume over half the frame */}
        <div className="hidden lg:block bg-white border-r border-ink-200">
          <div className="px-4 py-4 border-b border-ink-100">
            <LogoFull variant="default" className="h-[18px] w-auto" />
          </div>
          <nav className="py-2">
            {SIDEBAR_ITEMS.map(({ icon: Icon, label, active }) => (
              <div
                key={label}
                className={
                  active
                    ? "flex items-center gap-2.5 px-4 py-2.5 bg-brand-50 text-brand-900 font-semibold text-[13px] border-r-[2.5px] border-amber"
                    : "flex items-center gap-2.5 px-4 py-2.5 text-ink-400 text-[13px]"
                }
              >
                <Icon size={15} style={{ opacity: active ? 1 : 0.55 }} />
                {label}
              </div>
            ))}
          </nav>
        </div>

        {/* Main content */}
        <div className="p-6">
          {/* Topbar */}
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[17px] font-bold text-ink-900 tracking-tight">November 2025 Payroll</h3>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 text-[12px] font-semibold text-ink-600 border border-ink-200 bg-white rounded-lg px-3 py-1.5">
                <Download size={12} aria-hidden /> Export
              </span>
              <span className="text-[12px] font-semibold bg-amber text-ink-900 rounded-lg px-3 py-1.5">
                Approve run →
              </span>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {METRICS.map(({ label, value, delta, deltaClass, valueClass }) => (
              <div key={label} className="bg-white border border-ink-200 rounded-xl p-3.5">
                <p className="text-[10px] font-semibold text-ink-400 uppercase tracking-[0.05em] mb-1.5">{label}</p>
                <p className={`text-[20px] font-black tracking-tight leading-none ${valueClass ?? "text-ink-900"}`}>{value}</p>
                <p className={`text-[11px] font-medium mt-1.5 ${deltaClass}`}>{delta}</p>
              </div>
            ))}
          </div>

          {/* Tables */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Employee table */}
            <div className="bg-white border border-ink-200 rounded-xl overflow-hidden">
              <div className="flex justify-between px-4 py-2.5 bg-surface-alt border-b border-ink-100">
                <span className="text-[10px] font-bold text-ink-400 uppercase tracking-[0.06em]">Employee</span>
                <span className="text-[10px] font-bold text-ink-400 uppercase tracking-[0.06em]">Net pay (KES)</span>
              </div>
              {EMPLOYEES.map(({ name, dept, amount, ready }) => (
                <div key={name} className="flex justify-between items-center px-4 py-2.5 border-b border-ink-100 last:border-0">
                  <div>
                    <p className="text-[12px] font-semibold text-ink-900">{name}</p>
                    <p className="text-[10px] text-ink-400">{dept}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-semibold text-ink-700">{amount}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${ready ? "bg-brand-100 text-brand-800" : "bg-amber-light text-amber-dark"}`}>
                      {ready ? "Ready" : "Review"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Filings table */}
            <div className="bg-white border border-ink-200 rounded-xl overflow-hidden">
              <div className="flex justify-between px-4 py-2.5 bg-surface-alt border-b border-ink-100">
                <span className="text-[10px] font-bold text-ink-400 uppercase tracking-[0.06em]">Statutory filing</span>
                <span className="text-[10px] font-bold text-ink-400 uppercase tracking-[0.06em]">Status</span>
              </div>
              {FILINGS.map(({ name, amount, status, filed }) => (
                <div key={name} className="flex justify-between items-center px-4 py-2.5 border-b border-ink-100 last:border-0">
                  <div>
                    <p className="text-[12px] font-semibold text-ink-900">{name}</p>
                    <p className="text-[10px] font-mono text-ink-400">{amount}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${filed ? "bg-brand-100 text-brand-800" : "bg-amber-light text-amber-dark"}`}>
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
