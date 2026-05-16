"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  PageHeader,
  KpiGroup,
  StatCard,
  DataTable,
  Badge,
  MoneyAmount,
  Button,
  InlineAlert,
  BarChart,
} from "@andikisha/ui";
import type { BadgeStatus, BarDatum } from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";

interface PagedResponse<T> {
  content: T[];
  totalElements: number;
}

interface PayrollRun {
  id: string;
  period: string;
  payFrequency: "MONTHLY" | "WEEKLY" | "BIWEEKLY";
  status:
    | "DRAFT"
    | "CALCULATING"
    | "CALCULATED"
    | "APPROVED"
    | "PROCESSING"
    | "COMPLETED"
    | "FAILED"
    | "CANCELLED";
  totalGross: number | null;
  totalNet: number | null;
  totalDeductions: number | null;
  employeeCount: number | null;
  createdAt: string;
}

function formatPeriod(period: string): string {
  const [year, month] = period.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

function runStatusBadge(status: PayrollRun["status"]): BadgeStatus {
  switch (status) {
    case "COMPLETED":
    case "APPROVED":
      return "approved";
    case "PROCESSING":
    case "CALCULATING":
    case "CALCULATED":
      return "calculating";
    case "FAILED":
      return "failed";
    case "CANCELLED":
      return "cancelled";
    default:
      return "draft";
  }
}

// ─── Payroll bar chart data ───────────────────────────────────────────────────

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function buildPayrollChartData(runs: PayrollRun[]): BarDatum[] {
  const byMonth: Record<string, number> = {};
  runs.forEach((r) => {
    const [, m] = r.period.split("-");
    const key = MONTHS[Number(m) - 1];
    if (key) byMonth[key] = (byMonth[key] ?? 0) + (r.totalNet ?? 0);
  });
  const currentMonthLabel = MONTHS[new Date().getMonth()];
  return MONTHS.slice(0, new Date().getMonth() + 1).map((m) => ({
    label: m,
    value: byMonth[m] ?? 0,
    active: m === currentMonthLabel,
  }));
}

// ─── Page ────────────────────────────────────────────────────────────────────

const CHART_PERIODS = ["12 months", "6 months", "3 months", "30 days"] as const;

export default function DashboardPage() {
  const router = useRouter();
  const [chartPeriod, setChartPeriod] = useState<(typeof CHART_PERIODS)[number]>("12 months");

  const now = new Date();
  const subtitle =
    now.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }) +
    " · " +
    now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) +
    " EAT";

  const {
    data: employeesData,
    isLoading: empLoading,
    isError: empError,
    refetch: refetchEmp,
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
        .get("/api/v1/payroll/runs", { params: { size: 12, sort: "createdAt,desc" } })
        .then((r) => r.data),
  });

  const isLoadingStats = empLoading || leaveLoading || payrollLoading;
  const latestRun = payrollData?.content?.[0] ?? null;
  const recentRuns = payrollData?.content?.slice(0, 7) ?? [];

  const allErrored = empError && leaveError && payrollError;

  const tableRows = recentRuns.map((run) => ({
    period: formatPeriod(run.period),
    frequency: (
      <span className="capitalize">{run.payFrequency.toLowerCase()}</span>
    ),
    employees: (
      <span className="tabular-nums font-mono">{run.employeeCount ?? "—"}</span>
    ),
    totalNet: <MoneyAmount amount={run.totalNet} size="sm" />,
    status: (
      <Badge status={runStatusBadge(run.status)}>
        {run.status.charAt(0) + run.status.slice(1).toLowerCase()}
      </Badge>
    ),
    date: new Date(run.createdAt).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    _id: run.id,
  }));

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Dashboard"
        subtitle={subtitle}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => {
                void refetchEmp();
                void refetchLeave();
                void refetchPayroll();
              }}
            >
              Export report
            </Button>
            <Button variant="cta" onClick={() => router.push("/admin/payroll/new")}>
              + Run Payroll
            </Button>
          </>
        }
      />

      <div className="flex-1 overflow-y-auto px-8 py-8 flex flex-col gap-6">
        {allErrored && (
          <InlineAlert variant="error">
            Could not load dashboard data. Check your connection to the backend services.
          </InlineAlert>
        )}

        {/* KPI strip */}
        <KpiGroup cols={4}>
          {isLoadingStats ? (
            Array.from({ length: 4 }).map((_, i) => (
              <StatCard key={i} label="Loading" value="—" />
            ))
          ) : (
            <>
              <StatCard
                label="Total employees"
                value={empError ? "—" : (employeesData?.totalElements ?? 0).toLocaleString()}
                sub={empError ? "Could not load" : "Active headcount"}
              />
              <StatCard
                label="Pending leave"
                value={leaveError ? "—" : (leaveData?.totalElements ?? 0).toLocaleString()}
                change={
                  !leaveError && leaveData && leaveData.totalElements > 0
                    ? `${leaveData.totalElements}`
                    : undefined
                }
                positive={false}
                sub={leaveError ? "Could not load" : "Awaiting approval"}
              />
              <StatCard
                label="Latest net payroll"
                value={
                  payrollError ? (
                    "—"
                  ) : latestRun ? (
                    <MoneyAmount amount={latestRun.totalNet} size="xl" />
                  ) : (
                    <span className="text-[18px] text-neutral-400">No runs yet</span>
                  )
                }
                sub={
                  payrollError
                    ? "Could not load"
                    : latestRun
                    ? `${latestRun.employeeCount ?? "—"} employees · ${formatPeriod(latestRun.period)}`
                    : undefined
                }
              />
              <StatCard
                label="Last run status"
                value={
                  payrollError ? (
                    "—"
                  ) : latestRun ? (
                    <Badge status={runStatusBadge(latestRun.status)}>
                      {latestRun.status.charAt(0) + latestRun.status.slice(1).toLowerCase()}
                    </Badge>
                  ) : (
                    <span className="text-[18px] text-neutral-400">—</span>
                  )
                }
                sub={
                  payrollError
                    ? "Could not load"
                    : latestRun
                    ? `${latestRun.payFrequency.toLowerCase()} payroll`
                    : undefined
                }
              />
            </>
          )}
        </KpiGroup>

        {/* Payroll trend chart */}
        <div className="bg-surface border border-neutral-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-[14px] font-bold text-near-black">Payroll trend</h2>
            <button
              onClick={() => router.push("/admin/payroll")}
              className="text-[12px] font-semibold text-neutral-500 border border-neutral-200 rounded-lg px-3 py-1.5 hover:bg-neutral-100 transition-colors"
            >
              View all runs
            </button>
          </div>

          {/* Period tabs */}
          <div className="flex items-center gap-0 mt-3 border-b border-neutral-100">
            {CHART_PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setChartPeriod(p)}
                className={`px-4 py-2 text-[13px] font-semibold border-b-2 transition-colors -mb-px ${
                  chartPeriod === p
                    ? "border-brand-900 text-brand-900"
                    : "border-transparent text-neutral-400 hover:text-neutral-500"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {payrollLoading ? (
            <div className="h-36 mt-4 flex items-center justify-center text-[13px] text-neutral-400">
              Loading…
            </div>
          ) : payrollError ? (
            <div className="h-36 mt-4 flex items-center justify-center text-[13px] text-red-400">
              Could not load payroll data
            </div>
          ) : recentRuns.length === 0 ? (
            <div className="h-36 mt-4 flex items-center justify-center text-[13px] text-neutral-400">
              No payroll runs yet
            </div>
          ) : (
            <BarChart
              data={buildPayrollChartData(payrollData?.content ?? [])}
              height={144}
              yFormatter={(v) => `${Math.round(v / 1000)}K`}
              className="mt-4"
            />
          )}
        </div>

        {/* Recent payroll runs */}
        <div className="bg-surface border border-neutral-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
            <p className="text-[14px] font-bold text-near-black">Recent Payroll Runs</p>
            <button
              onClick={() => router.push("/admin/payroll")}
              className="text-[12px] font-semibold text-brand-800 hover:underline"
            >
              View all →
            </button>
          </div>
          <DataTable
            columns={[
              { key: "period", label: "Period" },
              { key: "frequency", label: "Frequency" },
              { key: "employees", label: "Employees", align: "right" },
              { key: "totalNet", label: "Total Net", align: "right" },
              { key: "status", label: "Status" },
              { key: "date", label: "Date" },
            ]}
            rows={tableRows}
            isLoading={payrollLoading}
            emptyMessage="No payroll runs yet"
            onRowClick={(row) => {
              const id = row["_id"];
              if (typeof id === "string") router.push(`/admin/payroll/${id}`);
            }}
            className="border-0 rounded-none"
          />
        </div>
      </div>
    </div>
  );
}
