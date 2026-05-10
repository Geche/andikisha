"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { PageHeader } from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";

// ─── Types ───────────────────────────────────────────────────────────────────

interface PagedResponse<T> {
  content: T[];
  totalElements: number;
}

interface PayrollRun {
  id: string;
  tenantId: string;
  period: string;
  payFrequency: "MONTHLY" | "WEEKLY" | "BIWEEKLY";
  status:
    | "DRAFT"
    | "INITIATED"
    | "CALCULATING"
    | "CALCULATED"
    | "APPROVED"
    | "DISBURSED"
    | "FAILED"
    | "CANCELLED";
  totalGross: number | null;
  totalNet: number | null;
  totalDeductions: number | null;
  employeeCount: number | null;
  createdAt: string;
  updatedAt: string;
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
  // "2026-05" → "May 2026"
  const [year, month] = period.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

function formatFrequency(freq: PayrollRun["payFrequency"]): string {
  return freq.charAt(0) + freq.slice(1).toLowerCase().replace("biweekly", "Bi-weekly");
}

function statusBadgeClass(status: PayrollRun["status"]): string {
  switch (status) {
    case "APPROVED":
    case "DISBURSED":
      return "bg-[#D1F5E6] text-[#0F5040]";
    case "CALCULATING":
    case "CALCULATED":
      return "bg-[#FEF3DC] text-[#92600A]";
    case "FAILED":
    case "CANCELLED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

// ─── Skeleton components ──────────────────────────────────────────────────────

function StatCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
      <div className="h-3 bg-gray-100 rounded w-24 mb-4" />
      <div className="h-8 bg-gray-100 rounded w-20 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-32" />
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse">
      <div className="h-12 bg-gray-50 border-b border-gray-200" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-14 border-b border-gray-100 flex items-center px-6 gap-4">
          <div className="h-3 bg-gray-100 rounded w-24" />
          <div className="h-3 bg-gray-100 rounded w-16" />
          <div className="h-3 bg-gray-100 rounded w-12" />
          <div className="h-3 bg-gray-100 rounded w-28" />
          <div className="h-5 bg-gray-100 rounded-full w-20" />
          <div className="h-3 bg-gray-100 rounded w-24" />
        </div>
      ))}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
        {label}
      </p>
      <p className="text-[28px] font-bold text-[#02110C] leading-none">{value}</p>
      {sub && <p className="text-[12px] text-gray-400 mt-1.5">{sub}</p>}
    </div>
  );
}

// ─── Error banner ────────────────────────────────────────────────────────────

function QueryError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-5 py-3.5 text-[13px] text-red-700">
      <AlertTriangle size={15} className="flex-shrink-0" />
      <span className="flex-1">{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="ml-auto text-[12px] font-semibold underline underline-offset-2 hover:opacity-80"
        >
          Retry
        </button>
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();

  const now = new Date();
  const subtitle = now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Parallel queries
  const {
    data: employeesData,
    isLoading: employeesLoading,
    isError: employeesError,
    refetch: refetchEmployees,
  } = useQuery<PagedResponse<unknown>>({
    queryKey: ["dashboard-employees"],
    queryFn: () =>
      apiClient.get("/api/v1/employees", { params: { size: 1 } }).then((r) => r.data),
  });

  const {
    data: leaveData,
    isLoading: leaveLoading,
    isError: leaveError,
    refetch: refetchLeave,
  } = useQuery<PagedResponse<unknown>>({
    queryKey: ["dashboard-leave-pending"],
    queryFn: () =>
      apiClient
        .get("/api/v1/leave/requests", { params: { status: "PENDING", size: 1 } })
        .then((r) => r.data),
  });

  const {
    data: payrollData,
    isLoading: payrollLoading,
    isError: payrollError,
    refetch: refetchPayroll,
  } = useQuery<PagedResponse<PayrollRun>>({
    queryKey: ["dashboard-payroll-runs"],
    queryFn: () =>
      apiClient
        .get("/api/v1/payroll/runs", { params: { size: 5, sort: "createdAt,desc" } })
        .then((r) => r.data),
  });

  const isLoadingStats = employeesLoading || leaveLoading || payrollLoading;
  const hasStatsError = employeesError || leaveError || payrollError;

  const latestRun = payrollData?.content?.[0] ?? null;
  const recentRuns = payrollData?.content ?? [];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Dashboard"
        subtitle={subtitle}
        actions={
          <button
            onClick={() => router.push("/payroll/new")}
            className="flex items-center gap-1.5 bg-[#E8A020] hover:bg-[#C98510] text-[#02110C] font-bold text-[13.5px] h-9 px-3.5 rounded-lg transition-colors"
          >
            + Run Payroll
          </button>
        }
      />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-6">

        {/* Global error (all three failed) */}
        {employeesError && leaveError && payrollError && (
          <QueryError
            message="Could not load dashboard data. Check your connection to the backend services."
            onRetry={() => {
              void refetchEmployees();
              void refetchLeave();
              void refetchPayroll();
            }}
          />
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-5">
          {isLoadingStats ? (
            Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard
                label="Total Employees"
                value={
                  employeesError ? (
                    <span className="text-red-400 text-[18px]">—</span>
                  ) : (
                    (employeesData?.totalElements ?? 0).toLocaleString()
                  )
                }
                sub={employeesError ? "Could not load" : "Active headcount"}
              />

              <StatCard
                label="Pending Leave"
                value={
                  leaveError ? (
                    <span className="text-red-400 text-[18px]">—</span>
                  ) : (
                    (leaveData?.totalElements ?? 0).toLocaleString()
                  )
                }
                sub={leaveError ? "Could not load" : "Awaiting approval"}
              />

              <StatCard
                label="Latest Payroll Cost"
                value={
                  payrollError ? (
                    <span className="text-red-400 text-[18px]">—</span>
                  ) : latestRun ? (
                    <span className="text-[22px]">{formatKES(latestRun.totalNet)}</span>
                  ) : (
                    <span className="text-gray-300 text-[18px]">No runs yet</span>
                  )
                }
                sub={
                  payrollError
                    ? "Could not load"
                    : latestRun
                    ? `Net pay · ${formatPeriod(latestRun.period)}`
                    : undefined
                }
              />

              <StatCard
                label="Last Run Status"
                value={
                  payrollError ? (
                    <span className="text-red-400 text-[18px]">—</span>
                  ) : latestRun ? (
                    <span
                      className={`inline-flex items-center text-[13px] font-semibold px-3 py-1.5 rounded-full ${statusBadgeClass(latestRun.status)}`}
                    >
                      {latestRun.status}
                    </span>
                  ) : (
                    <span className="text-gray-300 text-[18px]">—</span>
                  )
                }
                sub={
                  payrollError
                    ? "Could not load"
                    : latestRun
                    ? `${latestRun.employeeCount ?? "—"} employees`
                    : undefined
                }
              />
            </>
          )}
        </div>

        {/* Recent payroll runs */}
        {payrollLoading ? (
          <TableSkeleton />
        ) : payrollError ? (
          <QueryError
            message="Could not load recent payroll runs."
            onRetry={() => void refetchPayroll()}
          />
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <p className="text-[14px] font-bold text-[#101828]">Recent Payroll Runs</p>
              <button
                onClick={() => router.push("/payroll")}
                className="text-[12px] font-semibold text-[#166A50] hover:underline"
              >
                View all →
              </button>
            </div>

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
                    Total Net
                  </th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentRuns.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-14 text-center text-[13px] text-gray-400"
                    >
                      No payroll runs yet
                    </td>
                  </tr>
                ) : (
                  recentRuns.map((run) => (
                    <tr
                      key={run.id}
                      onClick={() => router.push(`/payroll/${run.id}`)}
                      className="border-b border-gray-50 last:border-0 hover:bg-[#F8F7F4] cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-[#02110C]">
                        {formatPeriod(run.period)}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {formatFrequency(run.payFrequency)}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-700">
                        {run.employeeCount ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-[#02110C]">
                        {formatKES(run.totalNet)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusBadgeClass(run.status)}`}
                        >
                          {run.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(run.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Quick actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/payroll/new")}
            className="flex items-center gap-2 bg-[#E8A020] hover:bg-[#C98510] text-[#02110C] font-bold text-[13.5px] h-9 px-4 rounded-lg transition-colors"
          >
            Run Payroll
          </button>
          <button
            onClick={() => router.push("/employees/new")}
            className="flex items-center gap-2 bg-[#0B3D2E] hover:bg-[#062818] text-white font-bold text-[13.5px] h-9 px-4 rounded-lg transition-colors"
          >
            Add Employee
          </button>
          <button
            onClick={() => router.push("/leave")}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-[13.5px] h-9 px-4 rounded-lg transition-colors"
          >
            View Leave Requests
          </button>
        </div>

      </div>
    </div>
  );
}
