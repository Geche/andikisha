"use client";

import { use, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { PageHeader } from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";
import { ApproveModal } from "../_components/ApproveModal";
import { RejectModal } from "../_components/RejectModal";
import { useWorkspace } from "@/hooks/useWorkspace";
import {
  type LeaveRequest,
  leaveTypeLabel,
  statusBadgeClass,
  statusLabel,
  formatDate,
  formatDateRange,
} from "../_types";

// Raw leave row as the API returns it (uses `days`; UI maps to `totalDays`).
type ApiLeaveRequest = Omit<LeaveRequest, "totalDays"> & { days: number };
// /auth/users projection: `id` resolves the reviewer, `employeeId` resolves the requester.
interface TenantUserLite {
  id: string;
  employeeId: string | null;
  displayName: string | null;
  email: string;
}

// ─── Detail row ───────────────────────────────────────────────────────────────

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide mb-1">
        {label}
      </p>
      <div className="text-[13.5px] text-near-black">{children}</div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6 animate-pulse">
      <div className="grid grid-cols-2 gap-x-8 gap-y-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <div className="h-2.5 bg-neutral-100 rounded w-20 mb-2" />
            <div className="h-4 bg-neutral-100 rounded w-32" />
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
  const workspace = useWorkspace();
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const {
    data: rawRequest,
    isLoading,
    isError,
    refetch,
  } = useQuery<ApiLeaveRequest>({
    queryKey: ["leave-request", requestId],
    queryFn: () =>
      apiClient
        .get<ApiLeaveRequest>(`/api/v1/leave/requests/${requestId}`)
        .then((r) => r.data),
    enabled: Boolean(requestId),
  });

  // Resolve identities via the users list (AUTH-006): reviewer by user id, and the requester
  // by employeeId (the leave API stores a generic "Employee" name). Admin/HR can read /users;
  // other viewers get a 403 and we fall back to what's on the request. retry:false avoids a 403 loop.
  const { data: tenantUsers } = useQuery<TenantUserLite[]>({
    queryKey: ["tenant-users-lite"],
    queryFn: () =>
      apiClient.get<TenantUserLite[]>("/api/v1/auth/users").then((r) => r.data),
    enabled: Boolean(rawRequest),
    retry: false,
  });

  const nameByEmployeeId = useMemo(() => {
    const m = new Map<string, string>();
    for (const u of tenantUsers ?? []) {
      if (u.employeeId) m.set(u.employeeId, u.displayName || u.email);
    }
    return m;
  }, [tenantUsers]);

  // Resolved request: map `days` → totalDays and the requester's employeeId → display name.
  const request: LeaveRequest | undefined = rawRequest
    ? {
        ...rawRequest,
        totalDays: Number(rawRequest.days),
        employeeName: nameByEmployeeId.get(rawRequest.employeeId) || rawRequest.employeeName,
      }
    : undefined;

  const isPending = request?.status === "PENDING";
  const isApproved = request?.status === "APPROVED";
  const isRejected = request?.status === "REJECTED";

  const reviewerLabel = (() => {
    if (!request) return "—";
    if (request.reviewedBy && tenantUsers) {
      const u = tenantUsers.find((x) => x.id === request.reviewedBy);
      if (u) return u.displayName ?? u.email;
    }
    return request.reviewerName ?? "—";
  })();

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
              href={`/${workspace}/admin/leave`}
              className="flex items-center gap-1.5 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-semibold text-[13px] h-9 px-3.5 rounded-lg transition-colors"
            >
              <ArrowLeft size={14} />
              Back
            </Link>
            {isPending && (
              <>
                <button
                  onClick={() => setApproveOpen(true)}
                  className="flex items-center gap-1.5 bg-brand-900 hover:bg-brand-950 text-white font-bold text-[13px] h-9 px-3.5 rounded-lg transition-colors"
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

      <div className="flex-1 min-h-0 overflow-y-auto px-8 py-8 space-y-5">
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
          <div className="bg-white border border-neutral-200 rounded-xl p-6">
            <p className="text-[13px] font-bold text-neutral-900 mb-4">Request Details</p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-5">
              <DetailRow label="Employee">
                <span className="font-semibold">{request.employeeName}</span>
              </DetailRow>
              <DetailRow label="Employee Number">
                <span className="font-mono text-[13px] text-neutral-600">
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
                <span className="text-neutral-500">day{request.totalDays !== 1 ? "s" : ""}</span>
              </DetailRow>
              <DetailRow label="Reason">
                <span className="text-neutral-600">{request.reason ?? "—"}</span>
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
                ? "bg-surface-tint border-border-success"
                : "bg-red-50 border-red-200"
            }`}
          >
            <p
              className={`text-[13px] font-bold mb-4 ${
                isApproved ? "text-brand-800" : "text-red-700"
              }`}
            >
              {isApproved ? "Approved" : "Rejected"}
            </p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-[13.5px]">
              <div>
                <p
                  className={`text-[11px] font-semibold uppercase tracking-wide mb-1 ${
                    isApproved ? "text-brand-500/70" : "text-red-400"
                  }`}
                >
                  Reviewed By
                </p>
                <p className={isApproved ? "text-near-black" : "text-red-900"}>
                  {reviewerLabel}
                </p>
              </div>
              <div>
                <p
                  className={`text-[11px] font-semibold uppercase tracking-wide mb-1 ${
                    isApproved ? "text-brand-500/70" : "text-red-400"
                  }`}
                >
                  Reviewed At
                </p>
                <p className={isApproved ? "text-near-black" : "text-red-900"}>
                  {request.reviewedAt ? formatDate(request.reviewedAt) : "—"}
                </p>
              </div>
              {request.reviewNotes && (
                <div className="col-span-2">
                  <p
                    className={`text-[11px] font-semibold uppercase tracking-wide mb-1 ${
                      isApproved ? "text-brand-500/70" : "text-red-400"
                    }`}
                  >
                    {isApproved ? "Notes" : "Reason"}
                  </p>
                  <p className={isApproved ? "text-near-black" : "text-red-900"}>
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
