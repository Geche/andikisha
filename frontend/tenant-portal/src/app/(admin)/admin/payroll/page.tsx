"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { PageHeader } from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";

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

function formatPeriod(period: string): string {
  const [year, month] = period.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatFrequency(freq: PayFrequency): string {
  switch (freq) {
    case "MONTHLY":
      return "Monthly";
    case "WEEKLY":
      return "Weekly";
    case "BIWEEKLY":
      return "Bi-weekly";
  }
}

function statusBadgeClass(status: RunStatus): string {
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

function statusLabel(status: RunStatus): string {
  switch (status) {
    case "BIWEEKLY" as never:
      return status;
    default:
      return status.charAt(0) + status.slice(1).toLowerCase();
  }
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse">
      <div className="h-11 bg-gray-50 border-b border-gray-200" />
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="h-[56px] border-b border-gray-100 last:border-0 flex items-center px-6 gap-6"
        >
          <div className="h-3 bg-gray-100 rounded w-28" />
          <div className="h-3 bg-gray-100 rounded w-16" />
          <div className="h-3 bg-gray-100 rounded w-10" />
          <div className="h-3 bg-gray-100 rounded w-28" />
          <div className="h-3 bg-gray-100 rounded w-28" />
          <div className="h-5 bg-gray-100 rounded-full w-20" />
          <div className="h-3 bg-gray-100 rounded w-24" />
          <div className="h-3 bg-gray-100 rounded w-10" />
        </div>
      ))}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PayrollPage() {
  const [page, setPage] = useState(0);

  const { data, isLoading, isError, refetch } = useQuery<PagedResponse<PayrollRun>>({
    queryKey: ["payroll-runs", page],
    queryFn: () =>
      apiClient
        .get("/api/v1/payroll/runs", {
          params: { page, size: 20, sort: "createdAt,desc" },
        })
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
        {/* Error */}
        {isError && (
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-5 py-3.5 text-[13px] text-red-700">
            <AlertTriangle size={15} className="flex-shrink-0" />
            <span className="flex-1">Could not load payroll runs. Check your connection.</span>
            <button
              onClick={() => void refetch()}
              className="ml-auto text-[12px] font-semibold underline underline-offset-2 hover:opacity-80"
            >
              Retry
            </button>
          </div>
        )}

        {/* Table */}
        {isLoading ? (
          <TableSkeleton />
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                    Period
                  </th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                    Frequency
                  </th>
                  <th className="text-right px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                    Employees
                  </th>
                  <th className="text-right px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                    Total Gross
                  </th>
                  <th className="text-right px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                    Total Net
                  </th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                    Date
                  </th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {runs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-[13px] text-gray-400">
                      No payroll runs yet. Click Run Payroll to get started.
                    </td>
                  </tr>
                ) : (
                  runs.map((run) => (
                    <tr
                      key={run.id}
                      className="border-b border-gray-50 last:border-0 hover:bg-[#F8F7F4] transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-[#02110C]">
                        {formatPeriod(run.period)}
                      </td>
                      <td className="px-6 py-4 text-gray-500">{formatFrequency(run.payFrequency)}</td>
                      <td className="px-6 py-4 text-right text-gray-700">
                        {run.employeeCount ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-700">
                        {formatKES(run.totalGross)}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-[#02110C]">
                        {formatKES(run.totalNet)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusBadgeClass(run.status)}`}
                        >
                          {statusLabel(run.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{formatDate(run.createdAt)}</td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/payroll/${run.id}`}
                          className="text-[12.5px] font-semibold text-[#166A50] hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-[13px]">
            <p className="text-gray-500">
              Page {page + 1} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="px-3.5 py-2 border border-gray-200 rounded-lg font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="px-3.5 py-2 border border-gray-200 rounded-lg font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
