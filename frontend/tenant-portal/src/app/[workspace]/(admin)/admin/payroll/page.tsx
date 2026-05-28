"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { AlertTriangle, AlertCircle } from "lucide-react";
import { PageHeader, PaginationBar } from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";
import { useWorkspace } from "@/hooks/useWorkspace";

interface PaymentSummary {
  failed: number;
  completed: number;
  totalTransactions: number;
}

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
  totalNet: number | null;
  currency: string;
  approvedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

function formatKES(amount: number | null | undefined): string {
  if (amount == null) return "—";
  return "KES " + amount.toLocaleString("en-KE", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatPeriod(period: string): string {
  const [year, month] = period.split("-");
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function statusBadge(status: RunStatus): { cls: string; label: string } {
  switch (status) {
    case "COMPLETED":  return { cls: "bg-brand-100 text-brand-800", label: "Completed" };
    case "APPROVED":   return { cls: "bg-brand-50 text-brand-700", label: "Approved" };
    case "PROCESSING": return { cls: "bg-blue-50 text-blue-700", label: "Disbursing" };
    case "CALCULATED": return { cls: "bg-amber-light text-amber-text", label: "Calculated" };
    case "CALCULATING":return { cls: "bg-amber-50 text-amber-700", label: "Calculating" };
    case "DRAFT":      return { cls: "bg-neutral-100 text-neutral-600", label: "Draft" };
    case "FAILED":     return { cls: "bg-red-100 text-red-700", label: "Failed" };
    case "CANCELLED":  return { cls: "bg-neutral-100 text-neutral-400", label: "Cancelled" };
  }
}

// Fetches payment summary for COMPLETED runs to show partial-failure indicator.
// Extracted as a component because hooks cannot be called inside a map().
// Uses staleTime=5min so re-navigating to this page doesn't trigger re-fetches.
function RunRow({ run }: { run: PayrollRun }) {
  const badge = statusBadge(run.status);
  const workspace = useWorkspace();

  const { data: summary } = useQuery<PaymentSummary>({
    queryKey: ["payment-summary", run.id],
    queryFn: () =>
      apiClient.get<PaymentSummary>(`/api/v1/payments/payroll-runs/${run.id}/summary`).then((r) => r.data),
    enabled: run.status === "COMPLETED",
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const hasFailed = summary && summary.failed > 0;

  return (
    <tr className="border-b border-neutral-50 last:border-0 hover:bg-surface-alt transition-colors">
      <td className="px-6 py-4 font-medium text-near-black">{formatPeriod(run.period)}</td>
      <td className="px-6 py-4 text-neutral-500 capitalize">{run.payFrequency.toLowerCase()}</td>
      <td className="px-6 py-4 text-right text-neutral-700">{run.employeeCount || "—"}</td>
      <td className="px-6 py-4 text-right text-neutral-700">{formatKES(run.totalGross)}</td>
      <td className="px-6 py-4 text-right font-medium text-near-black">{formatKES(run.totalNet)}</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full ${badge.cls}`}>
            {badge.label}
          </span>
          {hasFailed && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              <AlertCircle size={10} />
              {summary!.failed} failed
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-neutral-500">{formatDate(run.createdAt)}</td>
      <td className="px-6 py-4">
        <Link href={`/${workspace}/admin/payroll/${run.id}`} className="text-[12.5px] font-semibold text-brand-700 hover:underline">
          View
        </Link>
      </td>
    </tr>
  );
}

function TableSkeleton() {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden animate-pulse">
      <div className="h-11 bg-neutral-50 border-b border-neutral-200" />
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-14 border-b border-neutral-100 last:border-0 flex items-center px-6 gap-6">
          <div className="h-3 bg-neutral-100 rounded w-28" />
          <div className="h-3 bg-neutral-100 rounded w-16" />
          <div className="h-3 bg-neutral-100 rounded w-10" />
          <div className="h-3 bg-neutral-100 rounded w-28" />
          <div className="h-3 bg-neutral-100 rounded w-28" />
          <div className="h-5 bg-neutral-100 rounded-full w-20" />
          <div className="h-3 bg-neutral-100 rounded w-24" />
        </div>
      ))}
    </div>
  );
}

export default function PayrollPage() {
  const workspace = useWorkspace();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  const { data, isLoading, isError, refetch } = useQuery<PagedResponse<PayrollRun>>({
    queryKey: ["payroll-runs", page, pageSize],
    queryFn: () =>
      apiClient
        .get("/api/v1/payroll/runs", { params: { page, size: pageSize, sort: "createdAt,desc" } })
        .then((r) => r.data),
  });

  const runs = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Payroll"
        subtitle={isLoading ? "Loading…" : `${totalElements.toLocaleString()} run${totalElements !== 1 ? "s" : ""}`}
        actions={
          <Link
            href={`/${workspace}/admin/payroll/new`}
            className="flex items-center gap-1.5 bg-amber hover:bg-amber-dark text-near-black font-bold text-[13.5px] h-9 px-3.5 rounded-lg transition-colors"
          >
            + Run Payroll
          </Link>
        }
      />

      <div className="flex-1 min-h-0 overflow-y-auto px-8 py-8 space-y-4">
        {isError && (
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-5 py-3.5 text-[13px] text-red-700">
            <AlertTriangle size={15} className="flex-shrink-0" />
            <span className="flex-1">Could not load payroll runs. Check your connection.</span>
            <button onClick={() => void refetch()} className="text-[12px] font-semibold underline underline-offset-2">
              Retry
            </button>
          </div>
        )}

        {isLoading ? (
          <TableSkeleton />
        ) : (
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-neutral-100">
                  <th className="bg-neutral-50 text-left px-6 py-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Period</th>
                  <th className="bg-neutral-50 text-left px-6 py-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Frequency</th>
                  <th className="bg-neutral-50 text-right px-6 py-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Employees</th>
                  <th className="bg-neutral-50 text-right px-6 py-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Total Gross</th>
                  <th className="bg-neutral-50 text-right px-6 py-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Total Net</th>
                  <th className="bg-neutral-50 text-left px-6 py-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Status</th>
                  <th className="bg-neutral-50 text-left px-6 py-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Date</th>
                  <th className="bg-neutral-50 px-6 py-3" />
                </tr>
              </thead>
              <tbody>
                {runs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-[13px] text-neutral-400">
                      No payroll runs yet. Click Run Payroll to get started.
                    </td>
                  </tr>
                ) : (
                  runs.map((run) => <RunRow key={run.id} run={run} />)
                )}
              </tbody>
            </table>
          </div>
        )}

        <PaginationBar
          currentPage={page}
          totalPages={totalPages}
          totalCount={totalElements}
          pageSize={pageSize}
          itemLabel="runs"
          onPageChange={setPage}
          onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
        />
      </div>
    </div>
  );
}
