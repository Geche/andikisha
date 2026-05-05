import { calculatePayroll } from "@/lib/payroll-calculations";

interface PayslipLine {
  label: string;
  value: number;
  indent?: boolean;
  bold?: boolean;
  separator?: boolean;
}

interface HeroPayslipCardProps {
  gross?: number;
  employeeName?: string;
  employeeTitle?: string;
  employeeId?: string;
  period?: string;
  compact?: boolean;
}

function fmt(n: number) {
  return n.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function HeroPayslipCard({
  gross = 85_000,
  employeeName = "Sarah M.",
  employeeTitle = "Senior Accountant",
  employeeId = "EMP-00041",
  period = "October 2025",
  compact = false,
}: HeroPayslipCardProps) {
  const result = calculatePayroll({ grossMonthly: gross });

  const lines: PayslipLine[] = [
    { label: "Gross", value: result.gross, bold: true },
    { label: "PAYE", value: result.paye, indent: true },
    { label: "NSSF Tier I (6%)", value: result.nssfTier1, indent: true },
    { label: "NSSF Tier II (6%)", value: result.nssfTier2, indent: true },
    { label: "SHIF (2.75%)", value: result.shif, indent: true },
    { label: "Housing Levy (1.5%)", value: result.housingLevy, indent: true },
    { label: "Net pay", value: result.netPay, bold: true },
  ];

  return (
    <div className="bg-[#0d4a38] border border-brand-700 rounded-2xl p-5 w-full shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
      {/* Header */}
      <div className="mb-4 pb-3 border-b border-white/10">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-mono text-[13px] font-medium text-white leading-none">{employeeName}</p>
            {!compact && (
              <>
                <p className="text-[11px] text-white/50 mt-1">{employeeTitle} · {employeeId}</p>
                <p className="text-[11px] text-white/40 mt-0.5">Period: {period}</p>
              </>
            )}
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded bg-brand-500/20 text-brand-500 shrink-0">
            Paid
          </span>
        </div>
      </div>

      {/* Line items */}
      <div className="flex flex-col gap-0">
        {lines.map((line, i) => (
          <div key={i}>
            {(i === 1 || i === lines.length - 1) && (
              <div className="border-t border-white/[0.12] my-1" />
            )}
            <div className={`flex items-baseline justify-between py-1 ${line.indent ? "pl-2" : ""}`}>
              <span className={`font-mono text-[12px] ${line.bold ? "text-white font-medium" : "text-white/55"}`}>
                {line.label}
              </span>
              <span
                className={`font-mono text-[12px] tabular-nums text-right ${
                  line.bold ? "text-white font-medium" : "text-white/70"
                }`}
                style={{ fontFeatureSettings: '"tnum" 1, "lnum" 1' }}
              >
                {fmt(line.value)}
                {line.bold && <span className="text-white/40 ml-1 text-[10px]">KES</span>}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-white/10 text-center">
        <span className="text-[11px] text-brand-500 font-medium">Paid via M-Pesa</span>
      </div>
    </div>
  );
}
