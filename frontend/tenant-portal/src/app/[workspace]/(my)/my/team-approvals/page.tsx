"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";
import { PageHeader, PaginationBar, EmptyState, useHasRole } from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";
import { ListErrorState } from "@/components/ListErrorState";
// The Approve/Reject modals and leave types are shared with the admin leave queue.
// LINE_MANAGER reaches the same approve/reject capability from /my/* (the backend
// DEPARTMENT-scopes GET /leave/requests for line managers).
import { ApproveModal } from "@/components/leave/ApproveModal";
import { RejectModal } from "@/components/leave/RejectModal";
import {
  type LeaveRequest,
  type LeaveStatus,
  type PagedResponse,
  leaveTypeLabel,
  statusBadgeClass,
  statusLabel,
  formatDate,
  formatDateRange,
} from "@/components/leave/types";

// API returns `days`; UI maps to `totalDays`.
type ApiLeaveRequest = Omit<LeaveRequest, "totalDays"> & { days: number };

type StatusFilter = "ALL" | LeaveStatus;

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "All", value: "ALL" },
];

function TableSkeleton() {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden animate-pulse">
      <div className="h-11 bg-neutral-50 border-b border-neutral-200" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-[58px] border-b border-neutral-100 last:border-0 flex items-center px-6 gap-6"
        >
          <div className="h-3 bg-neutral-100 rounded w-32" />
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

export default function TeamApprovalsPage() {
  const isLineManager = useHasRole("LINE_MANAGER");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("PENDING");
  const [approveTarget, setApproveTarget] = useState<LeaveRequest | null>(null);
  const [rejectTarget, setRejectTarget] = useState<LeaveRequest | null>(null);

  // Query key shares the "leave-requests" prefix so the Approve/Reject modals'
  // invalidateQueries(["leave-requests"]) refreshes this list after an action.
  const { data, isLoading, isError, error, refetch } = useQuery<PagedResponse<ApiLeaveRequest>>({
    queryKey: ["leave-requests", "team", page, pageSize, statusFilter],
    queryFn: () => {
      const params: Record<string, string | number> = {
        page,
        size: pageSize,
        sort: "createdAt,desc",
      };
      if (statusFilter !== "ALL") params.status = statusFilter;
      return apiClient
        .get<PagedResponse<ApiLeaveRequest>>("/api/v1/leave/requests", { params })
        .then((r) => r.data);
    },
    enabled: isLineManager,
  });

  const requests: LeaveRequest[] = useMemo(
    () => (data?.content ?? []).map((r) => ({ ...r, totalDays: Number(r.days) })),
    [data],
  );
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  function handleTabChange(val: StatusFilter) {
    setStatusFilter(val);
    setPage(0);
  }

  if (!isLineManager) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <PageHeader title="Team approvals" subtitle="Approve and review your team's leave" />
        <div className="flex-1 min-h-0 overflow-y-auto px-8 py-8">
          <EmptyState
            icon={ShieldCheck}
            title="Not available"
            description="Team approvals are available to line managers only."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader title="Team approvals" subtitle="Approve and review your team's leave" />

      <div className="flex-1 min-h-0 overflow-y-auto px-8 py-8 space-y-4">
        {/* Status tabs */}
        <div className="inline-flex items-center gap-1 bg-neutral-100 rounded-lg p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={
                "px-3 py-1.5 text-[13px] font-semibold rounded-md transition-all whitespace-nowrap " +
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-900/50 " +
                (statusFilter === tab.value
                  ? "bg-surface text-near-black shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700")
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Error / loading / table are mutually exclusive */}
        {isError ? (
          <ListErrorState error={error} noun="leave requests" onRetry={() => void refetch()} />
        ) : isLoading ? (
          <TableSkeleton />
        ) : (
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-neutral-100">
                  <th className="bg-neutral-50 text-left px-6 py-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">
                    Employee
                  </th>
                  <th className="bg-neutral-50 text-left px-6 py-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">
                    Leave type
                  </th>
                  <th className="bg-neutral-50 text-left px-6 py-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">
                    Dates
                  </th>
                  <th className="bg-neutral-50 text-center px-6 py-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">
                    Days
                  </th>
                  <th className="bg-neutral-50 text-left px-6 py-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="bg-neutral-50 text-left px-6 py-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">
                    Submitted
                  </th>
                  <th className="bg-neutral-50 text-left px-6 py-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-[13px] text-neutral-400">
                      {statusFilter === "PENDING"
                        ? "No pending approvals for your team"
                        : "No leave requests found"}
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
                          <span className="text-[12.5px] text-neutral-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination — not shown while the list failed to load */}
        {!isError && (
          <PaginationBar
            currentPage={page}
            totalPages={totalPages}
            totalCount={totalElements}
            pageSize={pageSize}
            itemLabel="requests"
            onPageChange={setPage}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setPage(0);
            }}
          />
        )}
      </div>

      {/* Modals (shared with the admin leave queue) */}
      {approveTarget && (
        <ApproveModal request={approveTarget} onClose={() => setApproveTarget(null)} />
      )}
      {rejectTarget && (
        <RejectModal request={rejectTarget} onClose={() => setRejectTarget(null)} />
      )}
    </div>
  );
}
