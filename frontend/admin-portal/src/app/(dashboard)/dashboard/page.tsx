"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { PageHeader } from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";

interface PagedResponse<T> {
  content: T[];
  totalElements: number;
}

interface PayrollRun {
  id: string;
  period: string;
  payFrequency: "MONTHLY" | "WEEKLY" | "BIWEEKLY";
  status: "DRAFT" | "INITIATED" | "CALCULATING" | "CALCULATED" | "APPROVED" | "DISBURSED" | "FAILED" | "CANCELLED";
  totalGross: number | null;
  totalNet: number | null;
  totalDeductions: number | null;
  employeeCount: number | null;
  createdAt: string;
}

function formatKES(amount: number | null | undefined): string {
  if (amount == null) return "—";
  return "KES " + amount.toLocaleString("en-KE", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatPeriod(period: string): string {
  const [year, month] = period.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
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

// ─── Metric card ─────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  change,
  changeLabel,
  positive,
}: {
  label: string;
  value: React.ReactNode;
  change?: string;
  changeLabel?: string;
  positive?: boolean;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-[13px] text-gray-500">{label}</p>
        {change && (
          <span
            className={`inline-flex items-center gap-1 text-[12px] font-semibold px-2 py-0.5 rounded-full ${
              positive ? "bg-[#D1F5E6] text-[#0F5040]" : "bg-red-50 text-red-600"
            }`}
          >
            {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {change}
          </span>
        )}
      </div>
      <p className="text-[28px] font-bold text-[#101828] leading-none">{value}</p>
      {changeLabel && <p className="text-[12px] text-gray-400 mt-1.5">{changeLabel}</p>}
    </div>
  );
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function MetricSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse">
      <div className="h-3 bg-gray-100 rounded w-28 mb-4" />
      <div className="h-8 bg-gray-100 rounded w-20" />
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="border-b border-gray-50 h-[60px] flex items-center px-6 gap-6">
          <div className="h-3 bg-gray-100 rounded w-24" />
          <div className="h-3 bg-gray-100 rounded w-16" />
          <div className="h-3 bg-gray-100 rounded w-10 ml-auto" />
          <div className="h-3 bg-gray-100 rounded w-28" />
          <div className="h-5 bg-gray-100 rounded-full w-20" />
        </div>
      ))}
    </div>
  );
}

// ─── Bar chart mockup ─────────────────────────────────────────────────────────

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function PayrollBarChart({ runs }: { runs: PayrollRun[] }) {
  const byMonth: Record<string, number> = {};
  runs.forEach((r) => {
    const [, m] = r.period.split("-");
    const key = MONTHS[Number(m) - 1];
    if (key) byMonth[key] = (byMonth[key] ?? 0) + (r.totalNet ?? 0);
  });
  const months = MONTHS.slice(0, new Date().getMonth() + 1);
  const max = Math.max(...months.map((m) => byMonth[m] ?? 0), 1);

  return (
    <div className="flex items-end gap-2 h-36 mt-4">
      {months.map((m) => {
        const val = byMonth[m] ?? 0;
        const pct = Math.max((val / max) * 100, val > 0 ? 8 : 0);
        const isCurrentMonth = m === MONTHS[new Date().getMonth()];
        return (
          <div key={m} className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
            <div className="w-full relative flex flex-col justify-end" style={{ height: "112px" }}>
              {val > 0 && (
                <div
                  className="w-full rounded-t-md"
                  style={{
                    height: `${pct}%`,
                    background: isCurrentMonth ? "#0B3D2E" : "#D1F5E6",
                  }}
                />
              )}
              {val === 0 && (
                <div className="w-full rounded-t-md bg-gray-100" style={{ height: "8px" }} />
              )}
            </div>
            <span className="text-[10px] text-gray-400">{m}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

const CHART_PERIODS = ["12 months", "6 months", "3 months", "30 days"];

export default function DashboardPage() {
  const router = useRouter();
  const [chartPeriod, setChartPeriod] = useState("12 months");

  const now = new Date();
  const subtitle =
    now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) +
    " · " +
    now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) +
    " EAT";

  const { data: employeesData, isLoading: empLoading, isError: empError, refetch: refetchEmp } =
    useQuery<PagedResponse<unknown>>({
      queryKey: ["dashboard-employees"],
      queryFn: () => apiClient.get("/api/v1/employees", { params: { size: 1 } }).then((r) => r.data),
    });

  const { data: leaveData, isLoading: leaveLoading, isError: leaveError, refetch: refetchLeave } =
    useQuery<PagedResponse<unknown>>({
      queryKey: ["dashboard-leave-pending"],
      queryFn: () =>
        apiClient.get("/api/v1/leave/requests", { params: { status: "PENDING", size: 1 } }).then((r) => r.data),
    });

  const { data: payrollData, isLoading: payrollLoading, isError: payrollError, refetch: refetchPayroll } =
    useQuery<PagedResponse<PayrollRun>>({
      queryKey: ["dashboard-payroll-runs"],
      queryFn: () =>
        apiClient.get("/api/v1/payroll/runs", { params: { size: 12, sort: "createdAt,desc" } }).then((r) => r.data),
    });

  const isLoadingStats = empLoading || leaveLoading || payrollLoading;
  const latestRun = payrollData?.content?.[0] ?? null;
  const recentRuns = payrollData?.content?.slice(0, 7) ?? [];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Dashboard"
        subtitle={subtitle}
        actions={
          <>
            <button
              onClick={() => { void refetchEmp(); void refetchLeave(); void refetchPayroll(); }}
              className="flex items-center gap-1.5 border border-gray-200 text-gray-600 font-semibold text-[13.5px] h-9 px-3.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Export report
            </button>
            <button
              onClick={() => router.push("/payroll/new")}
              className="flex items-center gap-1.5 bg-[#0B3D2E] hover:bg-[#0a3328] text-white font-semibold text-[13.5px] h-9 px-3.5 rounded-lg transition-colors"
            >
              + Run Payroll
            </button>
          </>
        }
      />

      <div className="flex-1 overflow-y-auto px-8 py-8 flex flex-col gap-6">
        {/* All three failed */}
        {empError && leaveError && payrollError && (
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-5 py-3.5 text-[13px] text-red-700">
            <AlertTriangle size={15} className="flex-shrink-0" />
            Could not load dashboard data. Check your connection to the backend services.
          </div>
        )}

        {/* Metric cards */}
        <div className="grid grid-cols-4 gap-5">
          {isLoadingStats ? (
            Array.from({ length: 4 }).map((_, i) => <MetricSkeleton key={i} />)
          ) : (
            <>
              <MetricCard
                label="Total employees"
                value={empError ? "—" : (employeesData?.totalElements ?? 0).toLocaleString()}
                changeLabel={empError ? "Could not load" : "Active headcount"}
              />
              <MetricCard
                label="Pending leave"
                value={leaveError ? "—" : (leaveData?.totalElements ?? 0).toLocaleString()}
                change={leaveData && leaveData.totalElements > 0 ? `${leaveData.totalElements}` : undefined}
                positive={false}
                changeLabel={leaveError ? "Could not load" : "Awaiting approval"}
              />
              <MetricCard
                label="Latest net payroll"
                value={
                  payrollError ? "—" :
                  latestRun ? <span className="text-[22px]">{formatKES(latestRun.totalNet)}</span> :
                  <span className="text-gray-300 text-[18px]">No runs yet</span>
                }
                changeLabel={
                  payrollError ? "Could not load" :
                  latestRun ? `${latestRun.employeeCount ?? "—"} employees · ${formatPeriod(latestRun.period)}` : undefined
                }
              />
              <MetricCard
                label="Last run status"
                value={
                  payrollError ? "—" :
                  latestRun ? (
                    <span className={`inline-flex items-center text-[13px] font-semibold px-3 py-1.5 rounded-full ${statusBadgeClass(latestRun.status)}`}>
                      {latestRun.status}
                    </span>
                  ) : <span className="text-gray-300 text-[18px]">—</span>
                }
                changeLabel={payrollError ? "Could not load" : latestRun ? `${latestRun.payFrequency.toLowerCase()} payroll` : undefined}
              />
            </>
          )}
        </div>

        {/* Payroll trend chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-[14px] font-bold text-[#101828]">Payroll trend</h2>
            <button
              onClick={() => router.push("/payroll")}
              className="text-[12px] font-semibold text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
            >
              View all runs
            </button>
          </div>

          {/* Period tabs */}
          <div className="flex items-center gap-0 mt-3 border-b border-gray-100">
            {CHART_PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setChartPeriod(p)}
                className={`px-4 py-2 text-[13px] font-semibold border-b-2 transition-colors -mb-px ${
                  chartPeriod === p
                    ? "border-[#0B3D2E] text-[#0B3D2E]"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {payrollLoading ? (
            <div className="h-36 mt-4 flex items-center justify-center">
              <div className="text-[13px] text-gray-400">Loading…</div>
            </div>
          ) : payrollError ? (
            <div className="h-36 mt-4 flex items-center justify-center text-[13px] text-red-400">
              Could not load payroll data
            </div>
          ) : recentRuns.length === 0 ? (
            <div className="h-36 mt-4 flex items-center justify-center text-[13px] text-gray-400">
              No payroll runs yet
            </div>
          ) : (
            <PayrollBarChart runs={payrollData?.content ?? []} />
          )}
        </div>

        {/* Recent payroll runs table */}
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

          {payrollLoading ? (
            <TableSkeleton />
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Period</th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Frequency</th>
                  <th className="text-right px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Employees</th>
                  <th className="text-right px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Total Net</th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentRuns.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-14 text-center text-[13px] text-gray-400">
                      No payroll runs yet
                    </td>
                  </tr>
                ) : (
                  recentRuns.map((run) => (
                    <tr
                      key={run.id}
                      onClick={() => router.push(`/payroll/${run.id}`)}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-[#101828]">{formatPeriod(run.period)}</td>
                      <td className="px-6 py-4 text-gray-500 capitalize">{run.payFrequency.toLowerCase()}</td>
                      <td className="px-6 py-4 text-right text-gray-600">{run.employeeCount ?? "—"}</td>
                      <td className="px-6 py-4 text-right font-semibold text-[#101828]">{formatKES(run.totalNet)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusBadgeClass(run.status)}`}>
                          {run.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(run.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
