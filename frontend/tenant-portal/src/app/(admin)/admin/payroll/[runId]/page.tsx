"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react";
import { PageHeader } from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";

// ─── Types ───────────────────────────────────────────────────────────────────

type RunStatus =
  | "DRAFT"
  | "CALCULATING"
  | "CALCULATED"
  | "APPROVED"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

interface PayrollRun {
  id: string;
  period: string;
  payFrequency: "MONTHLY" | "WEEKLY" | "BIWEEKLY";
  status: RunStatus;
  employeeCount: number;
  totalGross: number | null;
  totalBasic: number | null;
  totalAllowances: number | null;
  totalPaye: number | null;
  totalNssf: number | null;
  totalShif: number | null;
  totalHousingLevy: number | null;
  totalNet: number | null;
  currency: string;
  initiatedBy: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

interface PaySlip {
  id: string;
  payrollRunId: string;
  period: string;
  employeeId: string;
  employeeNumber: string;
  employeeName: string;
  basicPay: number;
  totalAllowances: number;
  grossPay: number;
  paye: number;
  nssf: number;
  shif: number;
  housingLevy: number;
  totalDeductions: number;
  netPay: number;
  currency: string;
  paymentStatus: string | null;
  paymentPhone: string | null;
}

interface PaymentSummary {
  totalTransactions: number;
  completed: number;
  failed: number;
  pending: number;
  mpesaCount: number;
  bankTransferCount: number;
  totalAmount: number;
  completedAmount: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(amount: number | null | undefined): string {
  if (amount == null) return "—";
  return amount.toLocaleString("en-KE", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtKES(amount: number | null | undefined): string {
  if (amount == null) return "—";
  return "KES " + fmt(amount);
}

function formatPeriod(period: string): string {
  const [year, month] = period.split("-");
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

function statusBadge(status: RunStatus): { cls: string; label: string } {
  switch (status) {
    case "COMPLETED":  return { cls: "bg-[#D1F5E6] text-[#0F5040]", label: "Completed" };
    case "APPROVED":   return { cls: "bg-[#E8F5F0] text-[#166A50]", label: "Approved" };
    case "PROCESSING": return { cls: "bg-blue-50 text-blue-700", label: "Disbursing" };
    case "CALCULATED": return { cls: "bg-[#FEF3DC] text-[#92600A]", label: "Calculated" };
    case "CALCULATING":return { cls: "bg-amber-50 text-amber-700", label: "Calculating" };
    case "DRAFT":      return { cls: "bg-neutral-100 text-neutral-600", label: "Draft" };
    case "FAILED":     return { cls: "bg-red-100 text-red-700", label: "Failed" };
    case "CANCELLED":  return { cls: "bg-neutral-100 text-neutral-400", label: "Cancelled" };
  }
}

function paymentStatusBadge(status: string | null): { cls: string; label: string } {
  switch (status) {
    case "COMPLETED": return { cls: "bg-[#D1F5E6] text-[#0F5040]", label: "Paid" };
    case "FAILED":    return { cls: "bg-red-100 text-red-700", label: "Failed" };
    case "SUBMITTED": return { cls: "bg-blue-50 text-blue-700", label: "Submitted" };
    case "PROCESSING":return { cls: "bg-blue-50 text-blue-700", label: "Processing" };
    case "PENDING":   return { cls: "bg-amber-50 text-amber-700", label: "Pending" };
    default:          return { cls: "bg-neutral-100 text-neutral-500", label: "—" };
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SummaryCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5">
      <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide mb-2">{label}</p>
      <p className="text-[22px] font-bold text-[#02110C] leading-none">{value}</p>
    </div>
  );
}

function SummaryCardSkeleton() {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 animate-pulse">
      <div className="h-3 bg-neutral-100 rounded w-24 mb-3" />
      <div className="h-7 bg-neutral-100 rounded w-32" />
    </div>
  );
}

function TableSkeleton({ cols = 8 }: { cols?: number }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden animate-pulse">
      <div className="h-11 bg-neutral-50 border-b border-neutral-200" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-12 border-b border-neutral-100 last:border-0 flex items-center px-6 gap-5">
          {Array.from({ length: cols }).map((__, j) => (
            <div key={j} className="h-3 bg-neutral-100 rounded" style={{ width: `${50 + (j * 19) % 70}px` }} />
          ))}
        </div>
      ))}
    </div>
  );
}

function PaymentSummaryPanel({ summary }: { summary: PaymentSummary }) {
  const pct = summary.totalTransactions > 0
    ? Math.round((summary.completed / summary.totalTransactions) * 100)
    : 0;

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6 flex flex-col gap-4">
      <p className="text-[14px] font-bold text-neutral-900">Payment Summary</p>

      <div>
        <div className="flex items-center justify-between text-[12px] text-neutral-500 mb-1.5">
          <span>{summary.completed} of {summary.totalTransactions} disbursed</span>
          <span>{pct}%</span>
        </div>
        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0B3D2E] rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="flex items-center gap-2.5 bg-[#F2FAF6] border border-[#C8ECDA] rounded-lg px-4 py-3">
          <CheckCircle size={16} className="text-[#166A50] flex-shrink-0" />
          <div>
            <p className="text-[20px] font-bold text-[#02110C] leading-none">{summary.completed}</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">Completed</p>
          </div>
        </div>

        <div className={`flex items-center gap-2.5 rounded-lg px-4 py-3 border ${
          summary.failed > 0
            ? "bg-red-50 border-red-200"
            : "bg-neutral-50 border-neutral-200"
        }`}>
          <XCircle size={16} className={summary.failed > 0 ? "text-red-600 flex-shrink-0" : "text-neutral-300 flex-shrink-0"} />
          <div>
            <p className={`text-[20px] font-bold leading-none ${summary.failed > 0 ? "text-red-700" : "text-neutral-400"}`}>
              {summary.failed}
            </p>
            <p className="text-[11px] text-neutral-500 mt-0.5">Failed</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3">
          <Clock size={16} className="text-neutral-400 flex-shrink-0" />
          <div>
            <p className="text-[20px] font-bold text-neutral-700 leading-none">{summary.pending}</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">Pending</p>
          </div>
        </div>

        <div className="border border-neutral-200 rounded-lg px-4 py-3">
          <p className="text-[11px] text-neutral-500 mb-1">Disbursed</p>
          <p className="text-[15px] font-bold text-[#02110C]">KES {fmt(summary.completedAmount)}</p>
          <p className="text-[11px] text-neutral-400">of KES {fmt(summary.totalAmount)}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PayrollRunDetailPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = use(params);

  const { data: run, isLoading: runLoading, isError: runError, refetch: refetchRun } = useQuery<PayrollRun>({
    queryKey: ["payroll-run", runId],
    queryFn: () => apiClient.get<PayrollRun>(`/api/v1/payroll/runs/${runId}`).then((r) => r.data),
    enabled: Boolean(runId),
    refetchInterval: (q) => (q.state.data?.status === "CALCULATING" ? 5_000 : false),
  });

  const {
    data: payslipsData,
    isLoading: payslipsLoading,
    isError: payslipsError,
    refetch: refetchPayslips,
  } = useQuery<PaySlip[]>({
    queryKey: ["payroll-run-payslips", runId],
    queryFn: () =>
      apiClient
        .get<PaySlip[]>(`/api/v1/payroll/runs/${runId}/payslips`)
        .then((r) => r.data),
    enabled: Boolean(runId),
  });

  const showPaymentPanel = run ? ["APPROVED", "PROCESSING", "COMPLETED"].includes(run.status) : false;

  const { data: paymentSummary, isLoading: summaryLoading } = useQuery<PaymentSummary>({
    queryKey: ["payment-summary", runId],
    queryFn: () =>
      apiClient.get<PaymentSummary>(`/api/v1/payments/payroll-runs/${runId}/summary`).then((r) => r.data),
    enabled: Boolean(runId) && showPaymentPanel,
    refetchInterval: (q) => ((q.state.data?.pending ?? 0) > 0 ? 4_000 : false),
  });

  const payslips = payslipsData ?? [];
  const badge = run ? statusBadge(run.status) : null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title={runLoading ? "Loading…" : run ? `Payroll — ${formatPeriod(run.period)}` : "Payroll Run"}
        subtitle={run ? `${run.employeeCount} employees · ${run.currency}` : undefined}
        actions={
          <div className="flex items-center gap-2">
            {badge && (
              <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full ${badge.cls}`}>
                {badge.label}
              </span>
            )}
            <Link
              href="/admin/payroll"
              className="flex items-center gap-1.5 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-semibold text-[13px] h-9 px-3.5 rounded-lg transition-colors"
            >
              <ArrowLeft size={14} />
              Back
            </Link>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto px-8 py-8 flex flex-col gap-5">
        {runError && (
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-5 py-3.5 text-[13px] text-red-700">
            <AlertTriangle size={15} className="flex-shrink-0" />
            <span className="flex-1">Could not load payroll run.</span>
            <button onClick={() => void refetchRun()} className="text-[12px] font-semibold underline underline-offset-2">Retry</button>
          </div>
        )}

        {/* Summary cards */}
        {runLoading ? (
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <SummaryCardSkeleton key={i} />)}
          </div>
        ) : run ? (
          <div className="grid grid-cols-4 gap-4">
            <SummaryCard label="Total Gross" value={fmtKES(run.totalGross)} />
            <SummaryCard label="Total Net" value={fmtKES(run.totalNet)} />
            <SummaryCard label="Total PAYE" value={fmtKES(run.totalPaye)} />
            <SummaryCard label="Employees" value={run.employeeCount.toLocaleString()} />
          </div>
        ) : null}

        {/* Calculating banner */}
        {run?.status === "CALCULATING" && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5 text-[13px] text-amber-700">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
            Payroll is calculating — this page updates automatically.
          </div>
        )}

        {/* Payment summary panel */}
        {showPaymentPanel && (
          summaryLoading ? (
            <div className="bg-white border border-neutral-200 rounded-xl p-6 animate-pulse flex flex-col gap-4">
              <div className="h-4 bg-neutral-100 rounded w-40" />
              <div className="h-2 bg-neutral-100 rounded-full" />
              <div className="grid grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-neutral-100 rounded-lg" />)}
              </div>
            </div>
          ) : paymentSummary ? (
            <PaymentSummaryPanel summary={paymentSummary} />
          ) : null
        )}

        {/* Statutory deduction breakdown */}
        {run && run.status !== "DRAFT" && (
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl px-6 py-4 flex items-center gap-8 text-[12.5px] text-neutral-600 flex-wrap">
            <span className="font-semibold text-neutral-700">Statutory deductions:</span>
            <span>PAYE <strong className="text-neutral-900">{fmtKES(run.totalPaye)}</strong></span>
            <span>NSSF <strong className="text-neutral-900">{fmtKES(run.totalNssf)}</strong></span>
            <span>SHIF <strong className="text-neutral-900">{fmtKES(run.totalShif)}</strong></span>
            <span>Housing Levy <strong className="text-neutral-900">{fmtKES(run.totalHousingLevy)}</strong></span>
          </div>
        )}

        {/* Payslips table */}
        <div className="flex flex-col gap-3">
          <p className="text-[14px] font-bold text-neutral-900">Payslips</p>

          {payslipsError && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-5 py-3.5 text-[13px] text-red-700">
              <AlertTriangle size={15} className="flex-shrink-0" />
              <span className="flex-1">Could not load payslips.</span>
              <button onClick={() => void refetchPayslips()} className="text-[12px] font-semibold underline underline-offset-2">Retry</button>
            </div>
          )}

          {payslipsLoading ? (
            <TableSkeleton />
          ) : (
            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-100">
                    <th className="text-left px-6 py-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Employee</th>
                    <th className="text-left px-6 py-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">#</th>
                    <th className="text-right px-6 py-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Gross</th>
                    <th className="text-right px-6 py-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">PAYE</th>
                    <th className="text-right px-6 py-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">NSSF</th>
                    <th className="text-right px-6 py-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">SHIF</th>
                    <th className="text-right px-6 py-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Net</th>
                    <th className="text-left px-6 py-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Payment</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {payslips.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-14 text-center text-[13px] text-neutral-400">
                        {run?.status === "DRAFT" || run?.status === "CALCULATING"
                          ? "Payslips will appear after calculation completes."
                          : "No payslips found."}
                      </td>
                    </tr>
                  ) : (
                    payslips.map((slip) => {
                      const pmtBadge = paymentStatusBadge(slip.paymentStatus);
                      return (
                        <tr key={slip.id} className="border-b border-neutral-50 last:border-0 hover:bg-[#F8F7F4] transition-colors">
                          <td className="px-6 py-3.5 font-medium text-[#02110C]">{slip.employeeName}</td>
                          <td className="px-6 py-3.5 font-mono text-[12px] text-neutral-500">{slip.employeeNumber}</td>
                          <td className="px-6 py-3.5 text-right text-neutral-700">{fmt(slip.grossPay)}</td>
                          <td className="px-6 py-3.5 text-right text-neutral-600">{fmt(slip.paye)}</td>
                          <td className="px-6 py-3.5 text-right text-neutral-600">{fmt(slip.nssf)}</td>
                          <td className="px-6 py-3.5 text-right text-neutral-600">{fmt(slip.shif)}</td>
                          <td className="px-6 py-3.5 text-right font-semibold text-[#02110C]">{fmt(slip.netPay)}</td>
                          <td className="px-6 py-3.5">
                            {slip.paymentStatus ? (
                              <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full ${pmtBadge.cls}`}>
                                {pmtBadge.label}
                              </span>
                            ) : (
                              <span className="text-neutral-400 text-[12px]">—</span>
                            )}
                          </td>
                          <td className="px-6 py-3.5">
                            <Link
                              href={`/admin/payroll/${runId}/payslips/${slip.id}`}
                              className="text-[12px] font-semibold text-[#166A50] hover:underline whitespace-nowrap"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
