"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { PageHeader } from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";

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
  const [page, setPage] = useState(0);

  const { data, isLoading, isError, refetch } = useQuery<PagedResponse<PayrollRun>>({
    queryKey: ["payroll-runs", page],
    queryFn: () =>
      apiClient
        .get("/api/v1/payroll/runs", { params: { page, size: 20, sort: "createdAt,desc" } })
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
            href="/admin/payroll/new"
            className="flex items-center gap-1.5 bg-[#E8A020] hover:bg-[#C98510] text-[#02110C] font-bold text-[13.5px] h-9 px-3.5 rounded-lg transition-colors"
          >
            + Run Payroll
          </Link>
        }
      />

      <div className="flex-1 overflow-y-auto px-8 py-8 flex flex-col gap-4">
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
                <tr className="bg-neutral-50 border-b border-neutral-100">
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Period</th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Frequency</th>
                  <th className="text-right px-6 py-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Employees</th>
                  <th className="text-right px-6 py-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Total Gross</th>
                  <th className="text-right px-6 py-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Total Net</th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Date</th>
                  <th className="px-6 py-3" />
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
                  runs.map((run) => {
                    const badge = statusBadge(run.status);
                    return (
                      <tr key={run.id} className="border-b border-neutral-50 last:border-0 hover:bg-[#F8F7F4] transition-colors">
                        <td className="px-6 py-4 font-medium text-[#02110C]">{formatPeriod(run.period)}</td>
                        <td className="px-6 py-4 text-neutral-500 capitalize">{run.payFrequency.toLowerCase()}</td>
                        <td className="px-6 py-4 text-right text-neutral-700">{run.employeeCount || "—"}</td>
                        <td className="px-6 py-4 text-right text-neutral-700">{formatKES(run.totalGross)}</td>
                        <td className="px-6 py-4 text-right font-medium text-[#02110C]">{formatKES(run.totalNet)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full ${badge.cls}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-neutral-500">{formatDate(run.createdAt)}</td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/admin/payroll/${run.id}`}
                            className="text-[12.5px] font-semibold text-[#166A50] hover:underline"
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

        {totalPages > 1 && (
          <div className="flex items-center justify-between text-[13px]">
            <p className="text-neutral-500">Page {page + 1} of {totalPages}</p>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="px-3.5 py-2 border border-neutral-200 rounded-lg font-semibold text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="px-3.5 py-2 border border-neutral-200 rounded-lg font-semibold text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
