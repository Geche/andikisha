"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, TrendingUp } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";

interface EmployeeProfile {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: string;
  leaveBalance: number;
  annualLeaveBalance: number;
}

interface PayslipSummary {
  id: string;
  periodLabel: string;
  netPay: number;
  status: string;
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
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-[13px] text-gray-500">{label}</p>
        {change && (
          <span
            className={`inline-flex items-center gap-1 text-[12px] font-semibold px-2 py-0.5 rounded-full ${
              positive ? "bg-[#D1F5E6] text-[#0F5040]" : "bg-[#FEF3DC] text-[#92600A]"
            }`}
          >
            <TrendingUp size={11} />
            {change}
          </span>
        )}
      </div>
      <p className="text-[28px] font-bold text-[#101828] leading-none">{value}</p>
      {sub && <p className="text-[12px] text-gray-400 mt-1.5">{sub}</p>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    APPROVED: "bg-[#D1F5E6] text-[#0F5040]",
    PENDING: "bg-[#FEF3DC] text-[#92600A]",
    REJECTED: "bg-red-100 text-red-700",
    PAID: "bg-[#D1F5E6] text-[#0F5040]",
    DRAFT: "bg-gray-100 text-gray-500",
  };
  const cls = map[status] ?? "bg-gray-100 text-gray-500";
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full ${cls}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

export default function DashboardPage() {
  const { data: profile, isError: profileError } = useQuery<EmployeeProfile>({
    queryKey: ["employee-profile"],
    queryFn: () => apiClient.get("/api/v1/employees/me").then((r) => r.data),
  });

  const { data: payslips = [] } = useQuery<PayslipSummary[]>({
    queryKey: ["payslips-recent"],
    queryFn: () =>
      apiClient.get("/api/v1/payslips?size=3&sort=createdAt,desc").then((r) => r.data?.content ?? r.data ?? []),
  });

  const { data: leaves = [] } = useQuery<LeaveRequest[]>({
    queryKey: ["leave-recent"],
    queryFn: () =>
      apiClient.get("/api/v1/leave/requests?size=5&sort=createdAt,desc").then((r) => r.data?.content ?? r.data ?? []),
  });

  const firstName = profile?.firstName ?? "";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const title = firstName ? `${greeting}, ${firstName}` : greeting;
  const subtitle = profile ? `${profile.jobTitle} · ${profile.department}` : undefined;
  const pendingCount = leaves.filter((l) => l.status === "PENDING").length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader title={title} subtitle={subtitle} />

      <div className="flex-1 overflow-y-auto px-8 py-8 flex flex-col gap-6">
        {profileError && (
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-5 py-3.5 text-[13px] text-red-700">
            <AlertTriangle size={15} className="flex-shrink-0" />
            Could not load your profile. Some information may be unavailable.
          </div>
        )}

        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <MetricCard
            label="Annual leave"
            value={profile ? `${profile.annualLeaveBalance}d` : "—"}
            sub="Days remaining"
          />
          <MetricCard
            label="Leave balance"
            value={profile ? `${profile.leaveBalance}d` : "—"}
            sub="All types combined"
          />
          <MetricCard
            label="Latest net pay"
            value={payslips[0] ? `KES ${payslips[0].netPay.toLocaleString()}` : "—"}
            sub={payslips[0]?.periodLabel ?? "No payslips yet"}
          />
          <MetricCard
            label="Pending requests"
            value={String(pendingCount)}
            sub="Awaiting approval"
            change={pendingCount > 0 ? `${pendingCount} pending` : undefined}
            positive={false}
          />
        </div>

        {/* Recent payslips + leave side-by-side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Recent payslips */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <p className="text-[13.5px] font-bold text-[#101828]">Recent Payslips</p>
              <Link href="/payslips" className="text-[12px] font-semibold text-[#166A50] hover:underline">
                View all →
              </Link>
            </div>
            {payslips.length === 0 ? (
              <div className="px-6 py-10 text-center text-[13px] text-gray-400">
                No payslips available yet
              </div>
            ) : (
              <table className="w-full text-[13px]">
                <tbody>
                  {payslips.map((p) => (
                    <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3.5 font-medium text-[#101828]">{p.periodLabel}</td>
                      <td className="px-6 py-3.5 text-right font-semibold text-[#101828]">
                        KES {p.netPay.toLocaleString()}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <StatusBadge status={p.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Leave requests */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <p className="text-[13.5px] font-bold text-[#101828]">Leave Requests</p>
              <Link href="/leave" className="text-[12px] font-semibold text-[#166A50] hover:underline">
                Apply + view all →
              </Link>
            </div>
            {leaves.length === 0 ? (
              <div className="px-6 py-10 text-center text-[13px] text-gray-400">
                No leave requests yet
              </div>
            ) : (
              <table className="w-full text-[13px]">
                <tbody>
                  {leaves.map((l) => (
                    <tr key={l.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3.5">
                        <p className="font-medium text-[#101828] capitalize">
                          {l.leaveType.toLowerCase().replace(/_/g, " ")}
                        </p>
                        <p className="text-[12px] text-gray-400 mt-0.5">
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
