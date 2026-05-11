"use client";

import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, FileText, TrendingUp, AlertTriangle } from "lucide-react";
import Link from "next/link";
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

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={18} className="text-white" strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="text-[12px] font-medium text-gray-500 mb-0.5">{label}</p>
        <p className="text-[22px] font-bold text-[#02110C] leading-none">{value}</p>
        {sub && <p className="text-[11.5px] text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    APPROVED: "bg-green-50 text-green-700 border-green-200",
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    REJECTED: "bg-red-50 text-red-700 border-red-200",
    PAID: "bg-green-50 text-green-700 border-green-200",
    DRAFT: "bg-gray-50 text-gray-600 border-gray-200",
  };
  const cls = map[status] ?? "bg-gray-50 text-gray-500 border-gray-200";
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cls}`}>
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

  const firstName = profile?.firstName ?? "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 flex-shrink-0">
        <div className="flex items-center justify-between h-[73px] gap-4">
          <div>
            <h1 className="text-[20px] font-bold text-[#101828] tracking-tight">
              {greeting}, {firstName}
            </h1>
            {profile && (
              <p className="text-[13px] text-gray-500 mt-0.5">
                {profile.jobTitle} · {profile.department}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-8 flex flex-col gap-6">
        {profileError && (
          <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5 text-[13px] text-amber-700">
            <AlertTriangle size={15} className="flex-shrink-0" />
            Could not load your profile. Some information may be unavailable.
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Calendar}
            label="Annual leave remaining"
            value={profile ? `${profile.annualLeaveBalance} days` : "—"}
            sub="Resets Jan 2027"
            color="bg-[#0B3D2E]"
          />
          <StatCard
            icon={Clock}
            label="Leave balance"
            value={profile ? `${profile.leaveBalance} days` : "—"}
            sub="All leave types"
            color="bg-[#166A50]"
          />
          <StatCard
            icon={FileText}
            label="Latest payslip"
            value={payslips[0] ? `KES ${payslips[0].netPay.toLocaleString()}` : "—"}
            sub={payslips[0]?.periodLabel ?? "No payslips yet"}
            color="bg-[#E8A020]"
          />
          <StatCard
            icon={TrendingUp}
            label="Pending requests"
            value={String(leaves.filter((l) => l.status === "PENDING").length)}
            sub="Leave requests"
            color="bg-[#27A870]"
          />
        </div>

        {/* Recent payslips + leave side-by-side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Recent payslips */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-[14px] font-semibold text-[#02110C]">Recent Payslips</h2>
              <Link
                href="/payslips"
                className="text-[12px] font-semibold text-[#0B3D2E] hover:underline"
              >
                View all
              </Link>
            </div>
            {payslips.length === 0 ? (
              <div className="px-6 py-8 text-center text-[13px] text-gray-400">
                No payslips available yet
              </div>
            ) : (
              <table className="w-full">
                <tbody>
                  {payslips.map((p) => (
                    <tr key={p.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-6 py-4 text-[13.5px] font-medium text-[#02110C]">
                        {p.periodLabel}
                      </td>
                      <td className="px-6 py-4 text-right text-[13.5px] font-bold text-[#02110C]">
                        KES {p.netPay.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <StatusBadge status={p.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Leave requests */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-[14px] font-semibold text-[#02110C]">Leave Requests</h2>
              <Link
                href="/leave"
                className="text-[12px] font-semibold text-[#0B3D2E] hover:underline"
              >
                Apply + view all
              </Link>
            </div>
            {leaves.length === 0 ? (
              <div className="px-6 py-8 text-center text-[13px] text-gray-400">
                No leave requests yet
              </div>
            ) : (
              <table className="w-full">
                <tbody>
                  {leaves.map((l) => (
                    <tr key={l.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-6 py-4">
                        <p className="text-[13.5px] font-medium text-[#02110C] capitalize">
                          {l.leaveType.toLowerCase().replace(/_/g, " ")}
                        </p>
                        <p className="text-[12px] text-gray-400">
                          {l.startDate} → {l.endDate} · {l.days}d
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
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
