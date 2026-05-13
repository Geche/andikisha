"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { PageHeader, BaseModal, useToast } from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";
import type { AxiosError } from "axios";

// ─── Types ───────────────────────────────────────────────────────────────────

type PayFrequency = "MONTHLY" | "WEEKLY" | "BIWEEKLY";

type RunStatus =
  | "DRAFT"
  | "INITIATED"
  | "CALCULATING"
  | "CALCULATED"
  | "APPROVED"
  | "DISBURSED"
  | "FAILED"
  | "CANCELLED";

type SlipStatus = "PENDING" | "APPROVED" | "DISBURSED";

interface PayrollRun {
  id: string;
  tenantId: string;
  period: string;
  payFrequency: PayFrequency;
  status: RunStatus;
  totalGross: number | null;
  totalNet: number | null;
  totalDeductions: number | null;
  employeeCount: number | null;
  notes: string | null;
  initiatedAt: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PaySlipSummary {
  id: string;
  payrollRunId: string;
  employeeId: string;
  employeeName: string;
  employeeNumber: string;
  grossSalary: number;
  paye: number;
  nssf: number;
  shif: number;
  housingLevy: number;
  otherDeductions: number;
  netSalary: number;
  currency: string;
  period: string;
  status: SlipStatus;
}

interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatKES(amount: number | null | undefined): string {
  if (amount == null) return "—";
  return (
    "KES " +
    amount.toLocaleString("en-KE", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  );
}

function formatNumber(n: number): string {
  return n.toLocaleString("en-KE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatPeriod(period: string): string {
  const [year, month] = period.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

function runStatusBadgeClass(status: RunStatus): string {
  switch (status) {
    case "DISBURSED":
      return "bg-[#D1F5E6] text-[#0F5040]";
    case "APPROVED":
      return "bg-[#E8F5F0] text-[#166A50]";
    case "CALCULATED":
      return "bg-[#FEF3DC] text-[#92600A]";
    case "CALCULATING":
      return "bg-amber-50 text-amber-700";
    case "INITIATED":
      return "bg-blue-50 text-blue-700";
    case "DRAFT":
      return "bg-gray-100 text-gray-600";
    case "FAILED":
      return "bg-red-100 text-red-700";
    case "CANCELLED":
      return "bg-gray-100 text-gray-400";
  }
}

function runStatusLabel(status: RunStatus): string {
  switch (status) {
    default:
      return status.charAt(0) + status.slice(1).toLowerCase();
  }
}

function slipStatusBadgeClass(status: SlipStatus): string {
  switch (status) {
    case "DISBURSED":
      return "bg-[#D1F5E6] text-[#0F5040]";
    case "APPROVED":
      return "bg-[#E8F5F0] text-[#166A50]";
    case "PENDING":
      return "bg-gray-100 text-gray-600";
  }
}

function slipStatusLabel(status: SlipStatus): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

// ─── Summary card ────────────────────────────────────────────────────────────

function SummaryCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
        {label}
      </p>
      <p className="text-[22px] font-bold text-[#02110C] leading-none">{value}</p>
    </div>
  );
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function SummaryCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse">
      <div className="h-3 bg-gray-100 rounded w-24 mb-3" />
      <div className="h-7 bg-gray-100 rounded w-32" />
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse">
      <div className="h-11 bg-gray-50 border-b border-gray-200" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-[52px] border-b border-gray-100 last:border-0 flex items-center px-6 gap-6"
        >
          <div className="h-3 bg-gray-100 rounded w-36" />
          <div className="h-3 bg-gray-100 rounded w-20" />
          <div className="h-3 bg-gray-100 rounded w-24" />
          <div className="h-3 bg-gray-100 rounded w-20" />
          <div className="h-3 bg-gray-100 rounded w-20" />
          <div className="h-3 bg-gray-100 rounded w-20" />
          <div className="h-3 bg-gray-100 rounded w-20" />
          <div className="h-3 bg-gray-100 rounded w-24" />
          <div className="h-5 bg-gray-100 rounded-full w-16" />
        </div>
      ))}
    </div>
  );
}

// ─── Approve modal ────────────────────────────────────────────────────────────

function ApproveModal({
  runId,
  onClose,
}: {
  runId: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const mutation = useMutation<PayrollRun, AxiosError<{ message?: string }>>({
    mutationFn: () =>
      apiClient
        .post<PayrollRun>(`/api/v1/payroll/runs/${runId}/approve`)
        .then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["payroll-run", runId] });
      void queryClient.invalidateQueries({ queryKey: ["payroll-runs"] });
      toast("Payroll approved", "success");
      onClose();
    },
    onError: (err) => {
      const msg =
        err.response?.data?.message ?? "Failed to approve payroll run. Please try again.";
      toast(msg, "error");
    },
  });

  return (
    <BaseModal labelId="approve-modal-title" onClose={onClose}>
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-[480px] p-6">
        <h2
          id="approve-modal-title"
          className="text-[16px] font-bold text-neutral-900 mb-1"
        >
          Approve Payroll Run
        </h2>
        <p className="text-[13px] text-gray-500 mb-6">
          Approve this payroll run? This will mark it ready for disbursement.
        </p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={mutation.isPending}
            className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold text-[13.5px] py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
            className="flex-1 bg-[#0B3D2E] hover:bg-[#062818] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-[13.5px] py-2.5 rounded-lg transition-colors"
          >
            {mutation.isPending ? "Approving…" : "Approve"}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PayrollRunDetailPage({
  params,
}: {
  params: Promise<{ runId: string }>;
}) {
  const { runId } = use(params);
  const [showApproveModal, setShowApproveModal] = useState(false);

  const {
    data: run,
    isLoading: runLoading,
    isError: runError,
    refetch: refetchRun,
  } = useQuery<PayrollRun>({
    queryKey: ["payroll-run", runId],
    queryFn: () =>
      apiClient.get<PayrollRun>(`/api/v1/payroll/runs/${runId}`).then((r) => r.data),
    enabled: Boolean(runId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // Poll while calculating
      if (status === "INITIATED" || status === "CALCULATING") return 5000;
      return false;
    },
  });

  const {
    data: payslipsData,
    isLoading: payslipsLoading,
    isError: payslipsError,
    refetch: refetchPayslips,
  } = useQuery<PagedResponse<PaySlipSummary>>({
    queryKey: ["payroll-run-payslips", runId],
    queryFn: () =>
      apiClient
        .get<PagedResponse<PaySlipSummary>>(`/api/v1/payroll/runs/${runId}/payslips`, {
          params: { page: 0, size: 50 },
        })
        .then((r) => r.data),
    enabled: Boolean(runId),
  });

  const payslips = payslipsData?.content ?? [];

  const periodLabel = run ? formatPeriod(run.period) : "—";

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title={runLoading ? "Loading…" : `Payroll — ${periodLabel}`}
        subtitle={
          run
            ? `${run.employeeCount ?? "—"} employees`
            : undefined
        }
        actions={
          <div className="flex items-center gap-2">
            {/* Inline status badge in header area */}
            {run && (
              <span
                className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full ${runStatusBadgeClass(run.status)}`}
              >
                {runStatusLabel(run.status)}
              </span>
            )}
            <Link
              href="/admin/payroll"
              className="flex items-center gap-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold text-[13px] h-9 px-3.5 rounded-lg transition-colors"
            >
              <ArrowLeft size={14} />
              Back
            </Link>
            {run?.status === "CALCULATED" && (
              <button
                onClick={() => setShowApproveModal(true)}
                className="flex items-center gap-1.5 bg-[#0B3D2E] hover:bg-[#062818] text-white font-bold text-[13px] h-9 px-3.5 rounded-lg transition-colors"
              >
                Approve Run
              </button>
            )}
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto px-8 py-8 flex flex-col gap-5">
        {/* Run load error */}
        {runError && (
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-5 py-3.5 text-[13px] text-red-700">
            <AlertTriangle size={15} className="flex-shrink-0" />
            <span className="flex-1">Could not load payroll run details.</span>
            <button
              onClick={() => void refetchRun()}
              className="ml-auto text-[12px] font-semibold underline underline-offset-2 hover:opacity-80"
            >
              Retry
            </button>
          </div>
        )}

        {/* Summary cards */}
        {runLoading ? (
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SummaryCardSkeleton key={i} />
            ))}
          </div>
        ) : run ? (
          <div className="grid grid-cols-4 gap-4">
            <SummaryCard label="Total Gross" value={formatKES(run.totalGross)} />
            <SummaryCard label="Total Net" value={formatKES(run.totalNet)} />
            <SummaryCard label="Total Deductions" value={formatKES(run.totalDeductions)} />
            <SummaryCard
              label="Employees"
              value={run.employeeCount != null ? run.employeeCount.toLocaleString() : "—"}
            />
          </div>
        ) : null}

        {/* Notes */}
        {run?.notes && (
          <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-[13px] text-gray-600">
            <span className="font-semibold text-gray-500 flex-shrink-0">Note:</span>
            <p>{run.notes}</p>
          </div>
        )}

        {/* Calculating banner */}
        {(run?.status === "INITIATED" || run?.status === "CALCULATING") && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5 text-[13px] text-amber-700">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
            Payroll is being calculated — this page will update automatically.
          </div>
        )}

        {/* Payslips section */}
        <div className="flex flex-col gap-3">
          <p className="text-[14px] font-bold text-neutral-900">Payslips</p>

          {/* Payslips error */}
          {payslipsError && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-5 py-3.5 text-[13px] text-red-700">
              <AlertTriangle size={15} className="flex-shrink-0" />
              <span className="flex-1">Could not load payslips.</span>
              <button
                onClick={() => void refetchPayslips()}
                className="ml-auto text-[12px] font-semibold underline underline-offset-2 hover:opacity-80"
              >
                Retry
              </button>
            </div>
          )}

          {payslipsLoading ? (
            <TableSkeleton />
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                      Employee Name
                    </th>
                    <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                      Employee #
                    </th>
                    <th className="text-right px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                      Gross
                    </th>
                    <th className="text-right px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                      PAYE
                    </th>
                    <th className="text-right px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                      NSSF
                    </th>
                    <th className="text-right px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                      SHIF
                    </th>
                    <th className="text-right px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                      Housing Levy
                    </th>
                    <th className="text-right px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                      Net
                    </th>
                    <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payslips.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="py-14 text-center text-[13px] text-gray-400"
                      >
                        No payslips generated yet — payroll may still be calculating
                      </td>
                    </tr>
                  ) : (
                    payslips.map((slip) => (
                      <tr
                        key={slip.id}
                        className="border-b border-gray-50 last:border-0 hover:bg-[#F8F7F4] transition-colors"
                      >
                        <td className="px-6 py-3.5 font-medium text-[#02110C]">
                          {slip.employeeName}
                        </td>
                        <td className="px-6 py-3.5 font-mono text-[12px] text-gray-500">
                          {slip.employeeNumber}
                        </td>
                        <td className="px-6 py-3.5 text-right text-gray-700">
                          {formatNumber(slip.grossSalary)}
                        </td>
                        <td className="px-6 py-3.5 text-right text-gray-600">
                          {formatNumber(slip.paye)}
                        </td>
                        <td className="px-6 py-3.5 text-right text-gray-600">
                          {formatNumber(slip.nssf)}
                        </td>
                        <td className="px-6 py-3.5 text-right text-gray-600">
                          {formatNumber(slip.shif)}
                        </td>
                        <td className="px-6 py-3.5 text-right text-gray-600">
                          {formatNumber(slip.housingLevy)}
                        </td>
                        <td className="px-6 py-3.5 text-right font-semibold text-[#02110C]">
                          {formatNumber(slip.netSalary)}
                        </td>
                        <td className="px-6 py-3.5">
                          <span
                            className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full ${slipStatusBadgeClass(slip.status)}`}
                          >
                            {slipStatusLabel(slip.status)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Approve modal */}
      {showApproveModal && (
        <ApproveModal runId={runId} onClose={() => setShowApproveModal(false)} />
      )}
    </div>
  );
}
