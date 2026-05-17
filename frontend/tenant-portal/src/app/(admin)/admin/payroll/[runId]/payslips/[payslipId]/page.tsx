"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertCircle, Clock, Printer } from "lucide-react";
import { PageHeader } from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";

// ─── Types ───────────────────────────────────────────────────────────────────

interface PaySlip {
  id: string;
  payrollRunId: string;
  period: string;
  employeeId: string;
  employeeNumber: string;
  employeeName: string;
  basicPay: number;
  housingAllowance: number;
  transportAllowance: number;
  medicalAllowance: number;
  otherAllowances: number;
  totalAllowances: number;
  grossPay: number;
  paye: number;
  nssf: number;
  nssfEmployer: number;
  shif: number;
  housingLevy: number;
  housingLevyEmployer: number;
  helb: number;
  nita: number;
  personalRelief: number;
  insuranceRelief: number;
  totalDeductions: number;
  netPay: number;
  currency: string;
  paymentStatus: string | null;
  paymentPhone: string | null;
  mpesaReceipt: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(amount: number | null | undefined, currency = "KES"): string {
  if (amount == null) return "—";
  return `${currency} ${amount.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatPeriod(period: string): string {
  const [year, month] = period.split("-");
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

function PaymentStatusBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-neutral-400 text-[12px]">—</span>;
  switch (status) {
    case "COMPLETED":
      return (
        <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand-800">
          <CheckCircle2 size={13} className="text-brand-700" />
          Paid
        </span>
      );
    case "FAILED":
      return (
        <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-red-700">
          <AlertCircle size={13} />
          Failed
        </span>
      );
    case "PENDING":
      return (
        <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-amber-700">
          <Clock size={13} />
          Pending
        </span>
      );
    default:
      return <span className="text-[12px] text-neutral-500 capitalize">{status.toLowerCase()}</span>;
  }
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      <div className="px-6 py-3.5 bg-neutral-50 border-b border-neutral-100">
        <h3 className="text-[11.5px] font-semibold text-neutral-500 uppercase tracking-wide">{title}</h3>
      </div>
      <div className="divide-y divide-neutral-50">{children}</div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between px-6 py-3">
      <span className="text-[13px] text-neutral-600">{label}</span>
      <span className={`text-[13px] ${bold ? "font-semibold text-near-black" : "text-neutral-700"}`}>{value}</span>
    </div>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-6 py-3.5 bg-neutral-50">
      <span className="text-[13px] font-semibold text-near-black">{label}</span>
      <span className="text-[14px] font-bold text-near-black">{value}</span>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="h-10 bg-neutral-50 border-b border-neutral-100" />
          {Array.from({ length: 4 }).map((_, j) => (
            <div key={j} className="flex items-center justify-between px-6 py-3 border-b border-neutral-50 last:border-0">
              <div className="h-3 bg-neutral-100 rounded w-36" />
              <div className="h-3 bg-neutral-100 rounded w-24" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PayslipDetailPage() {
  const params = useParams<{ runId: string; payslipId: string }>();
  const { runId, payslipId } = params;

  const { data: slip, isLoading, isError } = useQuery<PaySlip>({
    queryKey: ["payslip", payslipId],
    queryFn: () =>
      apiClient.get<PaySlip>(`/api/v1/payroll/payslips/${payslipId}`).then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const currency = slip?.currency ?? "KES";

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title={slip ? `${slip.employeeName} — ${formatPeriod(slip.period)}` : "Payslip"}
        subtitle={slip ? `#${slip.employeeNumber}` : "Loading…"}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-semibold text-[13px] h-9 px-3.5 rounded-lg transition-colors"
            >
              <Printer size={14} />
              Print
            </button>
            <Link
              href={`/admin/payroll/${runId}`}
              className="flex items-center gap-1.5 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-semibold text-[13px] h-9 px-3.5 rounded-lg transition-colors"
            >
              <ArrowLeft size={14} />
              Back
            </Link>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto px-8 py-8">
        {isError && (
          <div className="mb-4 flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-5 py-3.5 text-[13px] text-red-700">
            <AlertCircle size={15} className="flex-shrink-0" />
            Could not load payslip. Check your connection and try again.
          </div>
        )}

        {isLoading ? (
          <Skeleton />
        ) : slip ? (
          <div className="flex flex-col gap-4 max-w-2xl">

            {/* Summary header */}
            <div className="bg-near-black rounded-xl px-6 py-5 text-white flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Net Pay</p>
                <p className="text-[28px] font-bold mt-1">{fmt(slip.netPay, currency)}</p>
                <p className="text-[12px] text-neutral-400 mt-1">{formatPeriod(slip.period)}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Payment</p>
                <div className="mt-1.5">
                  <PaymentStatusBadge status={slip.paymentStatus} />
                </div>
                {slip.paymentPhone && (
                  <p className="text-[12px] text-neutral-400 mt-1">{slip.paymentPhone}</p>
                )}
                {slip.mpesaReceipt && (
                  <p className="text-[11px] text-neutral-500 mt-0.5 font-mono">{slip.mpesaReceipt}</p>
                )}
              </div>
            </div>

            {/* Earnings */}
            <Section title="Earnings">
              <Row label="Basic Pay" value={fmt(slip.basicPay, currency)} />
              {slip.housingAllowance > 0 && (
                <Row label="House Allowance" value={fmt(slip.housingAllowance, currency)} />
              )}
              {slip.transportAllowance > 0 && (
                <Row label="Transport Allowance" value={fmt(slip.transportAllowance, currency)} />
              )}
              {slip.medicalAllowance > 0 && (
                <Row label="Medical Allowance" value={fmt(slip.medicalAllowance, currency)} />
              )}
              {slip.otherAllowances > 0 && (
                <Row label="Other Allowances" value={fmt(slip.otherAllowances, currency)} />
              )}
              <TotalRow label="Gross Pay" value={fmt(slip.grossPay, currency)} />
            </Section>

            {/* Deductions */}
            <Section title="Deductions">
              <Row label="PAYE (Income Tax)" value={fmt(slip.paye, currency)} />
              <Row label="NSSF (Employee)" value={fmt(slip.nssf, currency)} />
              <Row label="SHIF" value={fmt(slip.shif, currency)} />
              <Row label="Housing Levy (Employee)" value={fmt(slip.housingLevy, currency)} />
              {slip.helb > 0 && <Row label="HELB Loan Repayment" value={fmt(slip.helb, currency)} />}
              {slip.nita > 0 && <Row label="NITA Levy" value={fmt(slip.nita, currency)} />}
              <TotalRow label="Total Deductions" value={fmt(slip.totalDeductions, currency)} />
            </Section>

            {/* Reliefs */}
            <Section title="Tax Reliefs">
              <Row label="Personal Relief" value={fmt(slip.personalRelief, currency)} />
              {slip.insuranceRelief > 0 && (
                <Row label="Insurance Relief" value={fmt(slip.insuranceRelief, currency)} />
              )}
            </Section>

            {/* Employer contributions */}
            <Section title="Employer Contributions (not deducted from pay)">
              <Row label="NSSF (Employer)" value={fmt(slip.nssfEmployer, currency)} />
              <Row label="Housing Levy (Employer)" value={fmt(slip.housingLevyEmployer, currency)} />
            </Section>

            {/* Net pay summary */}
            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
                <span className="text-[13px] text-neutral-600">Gross Pay</span>
                <span className="text-[13px] text-neutral-700">{fmt(slip.grossPay, currency)}</span>
              </div>
              <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
                <span className="text-[13px] text-neutral-600">Less: Total Deductions</span>
                <span className="text-[13px] text-red-600">− {fmt(slip.totalDeductions, currency)}</span>
              </div>
              <div className="flex items-center justify-between px-6 py-5 bg-brand-50">
                <span className="text-[14px] font-bold text-near-black">Net Pay</span>
                <span className="text-[18px] font-bold text-brand-800">{fmt(slip.netPay, currency)}</span>
              </div>
            </div>

          </div>
        ) : null}
      </div>
    </div>
  );
}
