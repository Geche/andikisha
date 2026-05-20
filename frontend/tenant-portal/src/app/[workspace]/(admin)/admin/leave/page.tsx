"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { PageHeader } from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";
import { ApproveModal } from "./_components/ApproveModal";
import { RejectModal } from "./_components/RejectModal";
import {
  type LeaveRequest,
  type LeaveStatus,
  type PagedResponse,
  leaveTypeLabel,
  statusBadgeClass,
  statusLabel,
  formatDate,
  formatDateRange,
} from "./_types";

// ─── Status tab config ────────────────────────────────────────────────────────

type StatusFilter = "ALL" | LeaveStatus;

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden animate-pulse">
      <div className="h-11 bg-neutral-50 border-b border-neutral-200" />
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="h-[58px] border-b border-neutral-100 last:border-0 flex items-center px-6 gap-6"
        >
          <div className="flex flex-col gap-1.5 w-36">
            <div className="h-3 bg-neutral-100 rounded w-28" />
            <div className="h-2.5 bg-neutral-100 rounded w-20" />
          </div>
          <div className="h-3 bg-neutral-100 rounded w-24" />
          <div className="h-3 bg-neutral-100 rounded w-32" />
          <div className="h-3 bg-neutral-100 rounded w-8" />
          <div className="h-5 bg-neutral-100 rounded-full w-20" />
          <div className="h-3 bg-neutral-100 rounded w-24" />
          <div className="h-3 bg-neutral-100 rounded w-24" />
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LeavePage() {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [approveTarget, setApproveTarget] = useState<LeaveRequest | null>(null);
  const [rejectTarget, setRejectTarget] = useState<LeaveRequest | null>(null);

  // Fetch all with PENDING status in parallel to compute the pending count for subtitle
  const { data: pendingData } = useQuery<PagedResponse<LeaveRequest>>({
    queryKey: ["leave-requests-pending-count"],
    queryFn: () =>
      apiClient
        .get<PagedResponse<LeaveRequest>>("/api/v1/leave/requests", {
          params: { page: 0, size: 1, sort: "createdAt,desc", status: "PENDING" },
        })
        .then((r) => r.data),
  });

  const pendingCount = pendingData?.totalElements ?? null;

  const { data, isLoading, isError, refetch } = useQuery<PagedResponse<LeaveRequest>>({
    queryKey: ["leave-requests", page, statusFilter],
    queryFn: () => {
      const params: Record<string, string | number> = {
        page,
        size: 25,
        sort: "createdAt,desc",
      };
      if (statusFilter !== "ALL") params.status = statusFilter;
      return apiClient
        .get<PagedResponse<LeaveRequest>>("/api/v1/leave/requests", { params })
        .then((r) => r.data);
    },
  });

  const requests = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  function handleTabChange(val: StatusFilter) {
    setStatusFilter(val);
    setPage(0);
  }

  const subtitleText =
    pendingCount === null
      ? "Loading…"
      : pendingCount === 0
        ? "No pending approvals"
        : `${pendingCount} pending approval${pendingCount !== 1 ? "s" : ""}`;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader title="Leave Management" subtitle={subtitleText} />

      <div className="flex-1 overflow-y-auto px-8 py-8 flex flex-col gap-4">
        {/* Status tabs */}
        <div className="border-b border-neutral-200">
          <nav className="flex items-center gap-0" aria-label="Leave status filter">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => handleTabChange(tab.value)}
                className={`px-4 py-2.5 text-[13px] font-semibold transition-colors -mb-px ${
                  statusFilter === tab.value
                    ? "border-b-2 border-brand-900 text-brand-900"
                    : "text-neutral-500 hover:text-neutral-700 border-b-2 border-transparent"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Error */}
        {isError && (
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-5 py-3.5 text-[13px] text-red-700">
            <AlertTriangle size={15} className="flex-shrink-0" />
            <span className="flex-1">Could not load leave requests. Check your connection.</span>
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
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100">
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">
                    Employee
                  </th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">
                    Leave Type
                  </th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">
                    Dates
                  </th>
                  <th className="text-center px-6 py-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">
                    Days
                  </th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">
                    Submitted
                  </th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-[13px] text-neutral-400">
                      No leave requests found
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <tr
                      key={req.id}
                      className="border-b border-neutral-50 last:border-0 hover:bg-surface-alt transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-near-black">{req.employeeName}</p>
                        <p className="text-[12px] text-neutral-400 font-mono mt-0.5">
                          {req.employeeNumber}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-neutral-600">{leaveTypeLabel(req.leaveType)}</td>
                      <td className="px-6 py-4 text-neutral-600">
                        {formatDateRange(req.startDate, req.endDate)}
                      </td>
                      <td className="px-6 py-4 text-center text-neutral-700 font-medium">
                        {req.totalDays}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusBadgeClass(req.status)}`}
                        >
                          {statusLabel(req.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-neutral-500">{formatDate(req.createdAt)}</td>
                      <td className="px-6 py-4">
                        {req.status === "PENDING" ? (
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setApproveTarget(req)}
                              className="text-[12.5px] font-semibold text-brand-700 hover:underline"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectTarget(req)}
                              className="text-[12.5px] font-semibold text-red-600 hover:underline"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <Link
                            href={`/leave/${req.id}`}
                            className="text-[12.5px] font-semibold text-brand-700 hover:underline"
                          >
                            View
                          </Link>
                        )}
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
            <p className="text-neutral-500">
              Page {page + 1} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="px-3.5 py-2 border border-neutral-200 rounded-lg font-semibold text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="px-3.5 py-2 border border-neutral-200 rounded-lg font-semibold text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {approveTarget && (
        <ApproveModal
          request={approveTarget}
          onClose={() => setApproveTarget(null)}
        />
      )}
      {rejectTarget && (
        <RejectModal
          request={rejectTarget}
          onClose={() => setRejectTarget(null)}
        />
      )}
    </div>
  );
}
