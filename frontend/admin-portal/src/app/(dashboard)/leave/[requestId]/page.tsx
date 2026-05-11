"use client";

import { use, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { PageHeader } from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";
import { ApproveModal } from "../_components/ApproveModal";
import { RejectModal } from "../_components/RejectModal";
import {
  type LeaveRequest,
  leaveTypeLabel,
  statusBadgeClass,
  statusLabel,
  formatDate,
  formatDateRange,
} from "../_types";

// ─── Detail row ───────────────────────────────────────────────────────────────

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
        {label}
      </p>
      <div className="text-[13.5px] text-[#02110C]">{children}</div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
      <div className="grid grid-cols-2 gap-x-8 gap-y-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <div className="h-2.5 bg-gray-100 rounded w-20 mb-2" />
            <div className="h-4 bg-gray-100 rounded w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LeaveRequestDetailPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = use(params);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const {
    data: request,
    isLoading,
    isError,
    refetch,
  } = useQuery<LeaveRequest>({
    queryKey: ["leave-request", requestId],
    queryFn: () =>
      apiClient
        .get<LeaveRequest>(`/api/v1/leave/requests/${requestId}`)
        .then((r) => r.data),
    enabled: Boolean(requestId),
  });

  const isPending = request?.status === "PENDING";
  const isApproved = request?.status === "APPROVED";
  const isRejected = request?.status === "REJECTED";

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Leave Request"
        subtitle={
          request
            ? `${request.employeeName} — ${leaveTypeLabel(request.leaveType)}`
            : isLoading
              ? "Loading…"
              : undefined
        }
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/leave"
              className="flex items-center gap-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold text-[13px] h-9 px-3.5 rounded-lg transition-colors"
            >
              <ArrowLeft size={14} />
              Back
            </Link>
            {isPending && (
              <>
                <button
                  onClick={() => setApproveOpen(true)}
                  className="flex items-center gap-1.5 bg-[#0B3D2E] hover:bg-[#062818] text-white font-bold text-[13px] h-9 px-3.5 rounded-lg transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => setRejectOpen(true)}
                  className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-[13px] h-9 px-3.5 rounded-lg transition-colors"
                >
                  Reject
                </button>
              </>
            )}
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto px-8 py-8 flex flex-col gap-5">
        {/* Error */}
        {isError && (
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-5 py-3.5 text-[13px] text-red-700">
            <AlertTriangle size={15} className="flex-shrink-0" />
            <span className="flex-1">Could not load leave request details.</span>
            <button
              onClick={() => void refetch()}
              className="ml-auto text-[12px] font-semibold underline underline-offset-2 hover:opacity-80"
            >
              Retry
            </button>
          </div>
        )}

        {/* Info card */}
        {isLoading ? (
          <DetailSkeleton />
        ) : request ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <p className="text-[13px] font-bold text-[#101828] mb-4">Request Details</p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-5">
              <DetailRow label="Employee">
                <span className="font-semibold">{request.employeeName}</span>
              </DetailRow>
              <DetailRow label="Employee Number">
                <span className="font-mono text-[13px] text-gray-600">
                  {request.employeeNumber}
                </span>
              </DetailRow>
              <DetailRow label="Leave Type">{leaveTypeLabel(request.leaveType)}</DetailRow>
              <DetailRow label="Status">
                <span
                  className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusBadgeClass(request.status)}`}
                >
                  {statusLabel(request.status)}
                </span>
              </DetailRow>
              <DetailRow label="Start Date">{formatDate(request.startDate)}</DetailRow>
              <DetailRow label="End Date">{formatDate(request.endDate)}</DetailRow>
              <DetailRow label="Dates">
                {formatDateRange(request.startDate, request.endDate)}
              </DetailRow>
              <DetailRow label="Total Days">
                <span className="font-semibold">{request.totalDays}</span>{" "}
                <span className="text-gray-500">day{request.totalDays !== 1 ? "s" : ""}</span>
              </DetailRow>
              <DetailRow label="Reason">
                <span className="text-gray-600">{request.reason ?? "—"}</span>
              </DetailRow>
              <DetailRow label="Submitted">{formatDate(request.createdAt)}</DetailRow>
            </div>
          </div>
        ) : null}

        {/* Review card — only if reviewed */}
        {request && (isApproved || isRejected) && (
          <div
            className={`border rounded-xl p-6 ${
              isApproved
                ? "bg-[#F0FBF6] border-[#A3E6C8]"
                : "bg-red-50 border-red-200"
            }`}
          >
            <p
              className={`text-[13px] font-bold mb-4 ${
                isApproved ? "text-[#0F5040]" : "text-red-700"
              }`}
            >
              {isApproved ? "Approved" : "Rejected"}
            </p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-[13.5px]">
              <div>
                <p
                  className={`text-[11px] font-semibold uppercase tracking-wide mb-1 ${
                    isApproved ? "text-[#27A870]/70" : "text-red-400"
                  }`}
                >
                  Reviewed By
                </p>
                <p className={isApproved ? "text-[#02110C]" : "text-red-900"}>
                  {request.reviewedBy ?? "—"}
                </p>
              </div>
              <div>
                <p
                  className={`text-[11px] font-semibold uppercase tracking-wide mb-1 ${
                    isApproved ? "text-[#27A870]/70" : "text-red-400"
                  }`}
                >
                  Reviewed At
                </p>
                <p className={isApproved ? "text-[#02110C]" : "text-red-900"}>
                  {request.reviewedAt ? formatDate(request.reviewedAt) : "—"}
                </p>
              </div>
              {request.reviewNotes && (
                <div className="col-span-2">
                  <p
                    className={`text-[11px] font-semibold uppercase tracking-wide mb-1 ${
                      isApproved ? "text-[#27A870]/70" : "text-red-400"
                    }`}
                  >
                    {isApproved ? "Notes" : "Reason"}
                  </p>
                  <p className={isApproved ? "text-[#02110C]" : "text-red-900"}>
                    {request.reviewNotes}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals — only render when request is loaded */}
      {request && approveOpen && (
        <ApproveModal request={request} onClose={() => setApproveOpen(false)} />
      )}
      {request && rejectOpen && (
        <RejectModal request={request} onClose={() => setRejectOpen(false)} />
      )}
    </div>
  );
}
