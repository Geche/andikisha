"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, TrendingUp } from "lucide-react";
import Link from "next/link";
import { PageHeader, Skeleton, SkeletonRegion, useCurrentUser } from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";
import { useWorkspace } from "@/hooks/useWorkspace";

interface EmployeeProfile {
  id: string;
  firstName: string;
  lastName: string;
  positionTitle?: string | null;
  departmentName?: string | null;
}

interface LeaveBalance {
  leaveType: string;
  available: number;
}

interface PayslipSummary {
  id: string;
  period: string;
  netPay: number;
  paymentStatus: string | null;
}

interface LeaveRequest {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: string;
  days: number;
}

function MetricCard({
  label,
  value,
  sub,
  change,
  positive,
}: {
  label: string;
  value: string;
  sub?: string;
  change?: string;
  positive?: boolean;
}) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-[13px] text-neutral-500">{label}</p>
        {change && (
          <span
            className={`inline-flex items-center gap-1 text-[12px] font-semibold px-2 py-0.5 rounded-full ${
              positive ? "bg-brand-100 text-brand-800" : "bg-amber-light text-amber-text"
            }`}
          >
            <TrendingUp size={11} />
            {change}
          </span>
        )}
      </div>
      <p className="text-[28px] font-bold text-neutral-900 leading-none">{value}</p>
      {sub && <p className="text-[12px] text-neutral-400 mt-1.5">{sub}</p>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    APPROVED: "bg-brand-100 text-brand-800",
    PENDING: "bg-amber-light text-amber-text",
    REJECTED: "bg-red-100 text-red-700",
    PAID: "bg-brand-100 text-brand-800",
    DRAFT: "bg-neutral-100 text-neutral-500",
  };
  const cls = map[status] ?? "bg-neutral-100 text-neutral-500";
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full ${cls}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

export default function DashboardPage() {
  const workspace = useWorkspace();
  const currentUser = useCurrentUser();
  const employeeId = currentUser?.employeeId;

  const { data: profile, isError: profileError } = useQuery<EmployeeProfile>({
    queryKey: ["employee-profile"],
    queryFn: () => apiClient.get("/api/v1/employees/me").then((r) => r.data),
  });

  const { data: leaveBalances = [], isLoading: balancesLoading } = useQuery<LeaveBalance[]>({
    queryKey: ["leave-balances-me"],
    queryFn: () =>
      apiClient
        .get("/api/v1/leave/me/balances")
        .then((r) => r.data ?? []),
  });

  const annualBalance = leaveBalances.find((b) => b.leaveType === "ANNUAL");
  const sickBalance = leaveBalances.find((b) => b.leaveType === "SICK");

  const { data: payslips = [], isLoading: payslipsLoading } = useQuery<PayslipSummary[]>({
    queryKey: ["payslips-recent", employeeId],
    enabled: !!employeeId,
    queryFn: () =>
      apiClient
        .get(`/api/v1/payroll/employees/${employeeId}/payslips`, {
          params: { size: 3, sort: "createdAt,desc" },
        })
        .then((r) => r.data?.content ?? r.data ?? []),
  });

  const { data: leaves = [], isLoading: leavesLoading } = useQuery<LeaveRequest[]>({
    queryKey: ["leave-recent", employeeId],
    enabled: !!employeeId,
    queryFn: () =>
      apiClient
        .get(`/api/v1/leave/employees/${employeeId}/requests`, {
          params: { size: 5, sort: "createdAt,desc" },
        })
        .then((r) => r.data?.content ?? r.data ?? []),
  });

  // Hold the whole stat grid until every stat query the cards need has resolved,
  // so cards don't pop in one-by-one or flash "—" then real values (constraints 5/6).
  const metricsLoading = balancesLoading || payslipsLoading || leavesLoading;

  const firstName = profile?.firstName ?? "";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const title = firstName ? `${greeting}, ${firstName}` : greeting;
  const subtitleParts = profile
    ? [profile.positionTitle, profile.departmentName].filter(Boolean)
    : [];
  const subtitle = subtitleParts.length > 0 ? subtitleParts.join(" · ") : undefined;
  const pendingCount = leaves.filter((l) => l.status === "PENDING").length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader title={title} subtitle={subtitle} />

      <div className="flex-1 min-h-0 overflow-y-auto px-8 py-8 space-y-6">
        {profileError && (
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-5 py-3.5 text-[13px] text-red-700">
            <AlertTriangle size={15} className="flex-shrink-0" />
            Could not load your profile. Some information may be unavailable.
          </div>
        )}

        {/* Metric cards */}
        {metricsLoading ? (
          <SkeletonRegion label="Loading your summary" className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-neutral-200 rounded-xl p-5">
                <Skeleton pill className="h-3 w-24 mb-4" />
                <Skeleton className="h-7 w-20" />
                <Skeleton pill className="h-2.5 w-28 mt-2.5" />
              </div>
            ))}
          </SkeletonRegion>
        ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <MetricCard
            label="Annual leave"
            value={annualBalance != null ? `${annualBalance.available}d` : "—"}
            sub="Days remaining"
          />
          <MetricCard
            label="Sick leave"
            value={sickBalance != null ? `${sickBalance.available}d` : "—"}
            sub="Days remaining"
          />
          <MetricCard
            label="Latest net pay"
            value={payslips[0] ? `KES ${payslips[0].netPay.toLocaleString()}` : "—"}
            sub={payslips[0]?.period ?? "No payslips yet"}
          />
          <MetricCard
            label="Pending requests"
            value={String(pendingCount)}
            sub="Awaiting approval"
            change={pendingCount > 0 ? `${pendingCount} pending` : undefined}
            positive={false}
          />
        </div>
        )}

        {/* Recent payslips + leave side-by-side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Recent payslips */}
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
              <p className="text-[13.5px] font-bold text-neutral-900">Recent Payslips</p>
              <Link href={`/${workspace}/my/payslips`} className="text-[12px] font-semibold text-brand-700 hover:underline">
                View all →
              </Link>
            </div>
            {payslipsLoading ? (
              <SkeletonRegion label="Loading recent payslips" className="divide-y divide-neutral-50">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="px-6 py-3.5 flex items-center justify-between">
                    <Skeleton pill className="h-3 w-24" />
                    <Skeleton pill className="h-3 w-20" />
                  </div>
                ))}
              </SkeletonRegion>
            ) : payslips.length === 0 ? (
              <div className="px-6 py-10 text-center text-[13px] text-neutral-400">
                No payslips available yet
              </div>
            ) : (
              <table className="w-full text-[13px]">
                <tbody>
                  {payslips.map((p) => (
                    <tr key={p.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-3.5 font-medium text-neutral-900">{p.period}</td>
                      <td className="px-6 py-3.5 text-right font-semibold text-neutral-900">
                        KES {p.netPay.toLocaleString()}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <StatusBadge status={p.paymentStatus ?? "DRAFT"} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Leave requests */}
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
              <p className="text-[13.5px] font-bold text-neutral-900">Leave Requests</p>
              <Link href={`/${workspace}/my/leave`} className="text-[12px] font-semibold text-brand-700 hover:underline">
                Apply + view all →
              </Link>
            </div>
            {leavesLoading ? (
              <SkeletonRegion label="Loading recent leave requests" className="divide-y divide-neutral-50">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="px-6 py-3.5 flex items-center justify-between">
                    <div className="space-y-1.5">
                      <Skeleton pill className="h-3 w-28" />
                      <Skeleton pill className="h-2.5 w-40" />
                    </div>
                    <Skeleton pill className="h-5 w-16" />
                  </div>
                ))}
              </SkeletonRegion>
            ) : leaves.length === 0 ? (
              <div className="px-6 py-10 text-center text-[13px] text-neutral-400">
                No leave requests yet
              </div>
            ) : (
              <table className="w-full text-[13px]">
                <tbody>
                  {leaves.map((l) => (
                    <tr key={l.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-3.5">
                        <p className="font-medium text-neutral-900 capitalize">
                          {l.leaveType.toLowerCase().replace(/_/g, " ")}
                        </p>
                        <p className="text-[12px] text-neutral-400 mt-0.5">
                          {l.startDate} → {l.endDate} · {l.days}d
                        </p>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <StatusBadge status={l.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
