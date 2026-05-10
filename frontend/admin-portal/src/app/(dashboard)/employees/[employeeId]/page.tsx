"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, ChevronDown } from "lucide-react";
import { PageHeader, BaseModal, useToast } from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";
import type { AxiosError } from "axios";

// ─── Types ───────────────────────────────────────────────────────────────────

type EmploymentType = "PERMANENT" | "CONTRACT" | "CASUAL" | "INTERN";
type EmployeeStatus = "ACTIVE" | "TERMINATED" | "ON_LEAVE" | "PROBATION";

interface EmployeeDetail {
  id: string;
  tenantId: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationalId: string;
  kraPin: string;
  department: string | null;
  jobTitle: string | null;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  hireDate: string;
  createdAt: string;
  basicSalary: number;
  currency: string;
  bankName: string | null;
  bankAccount: string | null;
  mpesaNumber: string | null;
  nssfNumber: string | null;
  shifNumber: string | null;
  terminatedAt: string | null;
  terminationReason: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatKES(amount: number): string {
  return (
    "KES " +
    amount.toLocaleString("en-KE", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  );
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function statusBadgeClass(status: EmployeeStatus): string {
  switch (status) {
    case "ACTIVE":
      return "bg-[#D1F5E6] text-[#0F5040]";
    case "TERMINATED":
      return "bg-gray-100 text-gray-500";
    case "ON_LEAVE":
      return "bg-[#FEF3DC] text-[#92600A]";
    case "PROBATION":
      return "bg-blue-50 text-blue-700";
  }
}

function statusLabel(status: EmployeeStatus): string {
  switch (status) {
    case "ON_LEAVE":
      return "On Leave";
    default:
      return status.charAt(0) + status.slice(1).toLowerCase();
  }
}

// ─── Card + Row ──────────────────────────────────────────────────────────────

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <p className="text-[11px] font-bold uppercase tracking-widest text-[#166A50] mb-4">
        {title}
      </p>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <p className="text-[12.5px] text-gray-500 flex-shrink-0 w-40">{label}</p>
      <p className="text-[13px] font-medium text-[#02110C] text-right">{value ?? "—"}</p>
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-5 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="h-3 bg-gray-100 rounded w-32 mb-4" />
          {Array.from({ length: 3 }).map((_, j) => (
            <div key={j} className="flex justify-between mb-3">
              <div className="h-3 bg-gray-100 rounded w-24" />
              <div className="h-3 bg-gray-100 rounded w-28" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Terminate Modal ─────────────────────────────────────────────────────────

function TerminateModal({
  employeeId,
  employeeName,
  onClose,
}: {
  employeeId: string;
  employeeName: string;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const queryClient = useQueryClient();
  const toast = useToast();

  const mutation = useMutation<void, AxiosError<{ message?: string }>, { reason: string }>({
    mutationFn: (body) =>
      apiClient.patch(`/api/v1/employees/${employeeId}/terminate`, body).then(() => undefined),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["employees"] });
      void queryClient.invalidateQueries({ queryKey: ["employee", employeeId] });
      toast("Employee terminated", "success");
      onClose();
    },
    onError: (err) => {
      const msg =
        err.response?.data?.message ?? "Failed to terminate employee. Please try again.";
      toast(msg, "error");
    },
  });

  return (
    <BaseModal labelId="terminate-modal-title" onClose={onClose}>
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-[480px] p-6">
        <h2
          id="terminate-modal-title"
          className="text-[16px] font-bold text-[#101828] mb-1"
        >
          Terminate Employee
        </h2>
        <p className="text-[13px] text-gray-500 mb-5">
          You are terminating{" "}
          <span className="font-semibold text-[#02110C]">{employeeName}</span>. This action
          cannot be undone.
        </p>

        <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
          Reason <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={4}
          maxLength={500}
          placeholder="Provide a reason for termination…"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={mutation.isPending}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13.5px] text-[#02110C] resize-none focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E] placeholder:text-gray-300"
        />
        <p className="text-[11px] text-gray-400 text-right mt-1">{reason.length}/500</p>

        <div className="flex items-center gap-3 mt-5">
          <button
            type="button"
            onClick={onClose}
            disabled={mutation.isPending}
            className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold text-[13.5px] py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!reason.trim() || mutation.isPending}
            onClick={() => mutation.mutate({ reason: reason.trim() })}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-[13.5px] py-2.5 rounded-lg transition-colors"
          >
            {mutation.isPending ? "Terminating…" : "Confirm Termination"}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}

// ─── Actions dropdown ─────────────────────────────────────────────────────────

function ActionsMenu({
  status,
  employeeId,
  employeeName,
}: {
  status: EmployeeStatus;
  employeeId: string;
  employeeName: string;
}) {
  const [open, setOpen] = useState(false);
  const [showTerminate, setShowTerminate] = useState(false);

  if (status === "TERMINATED") return null;

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold text-[13px] h-9 px-3.5 rounded-lg transition-colors"
        >
          Actions
          <ChevronDown size={13} />
        </button>
        {open && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute right-0 top-10 z-20 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[180px] py-1">
              <button
                onClick={() => {
                  setOpen(false);
                  setShowTerminate(true);
                }}
                className="w-full text-left px-4 py-2.5 text-[13px] text-red-600 hover:bg-red-50 font-medium transition-colors"
              >
                Terminate Employee
              </button>
            </div>
          </>
        )}
      </div>

      {showTerminate && (
        <TerminateModal
          employeeId={employeeId}
          employeeName={employeeName}
          onClose={() => setShowTerminate(false)}
        />
      )}
    </>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const { employeeId } = use(params);

  const { data: employee, isLoading, isError, refetch } = useQuery<EmployeeDetail>({
    queryKey: ["employee", employeeId],
    queryFn: () =>
      apiClient.get<EmployeeDetail>(`/api/v1/employees/${employeeId}`).then((r) => r.data),
    enabled: Boolean(employeeId),
  });

  const fullName = employee ? `${employee.firstName} ${employee.lastName}` : "Employee";
  const subtitle =
    employee
      ? `Employee #${employee.employeeNumber}${employee.jobTitle ? ` · ${employee.jobTitle}` : ""}`
      : undefined;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title={isLoading ? "Loading…" : fullName}
        subtitle={subtitle}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/employees"
              className="flex items-center gap-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold text-[13px] h-9 px-3.5 rounded-lg transition-colors"
            >
              <ArrowLeft size={14} />
              Back
            </Link>
            {employee && (
              <ActionsMenu
                status={employee.status}
                employeeId={employee.id}
                employeeName={fullName}
              />
            )}
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-5">
        {/* Termination banner */}
        {employee?.status === "TERMINATED" && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-[13px] text-red-700">
            <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">This employee has been terminated.</p>
              {employee.terminatedAt && (
                <p className="mt-0.5 text-red-600">
                  Date: {formatDate(employee.terminatedAt)}
                </p>
              )}
              {employee.terminationReason && (
                <p className="mt-0.5 text-red-600">
                  Reason: {employee.terminationReason}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-5 py-3.5 text-[13px] text-red-700">
            <AlertTriangle size={15} className="flex-shrink-0" />
            <span className="flex-1">Could not load employee details.</span>
            <button
              onClick={() => void refetch()}
              className="ml-auto text-[12px] font-semibold underline underline-offset-2 hover:opacity-80"
            >
              Retry
            </button>
          </div>
        )}

        {/* Skeleton / content */}
        {isLoading ? (
          <DetailSkeleton />
        ) : employee ? (
          <div className="grid grid-cols-2 gap-5">
            {/* Personal Info */}
            <InfoCard title="Personal Information">
              <InfoRow label="Email" value={employee.email} />
              <InfoRow label="Phone" value={employee.phoneNumber} />
              <InfoRow label="National ID" value={employee.nationalId} />
              <InfoRow label="KRA PIN" value={employee.kraPin} />
            </InfoCard>

            {/* Employment */}
            <InfoCard title="Employment">
              <InfoRow label="Department" value={employee.department ?? "—"} />
              <InfoRow label="Job Title" value={employee.jobTitle ?? "—"} />
              <InfoRow
                label="Type"
                value={
                  <span className="font-mono text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                    {employee.employmentType}
                  </span>
                }
              />
              <InfoRow label="Hire Date" value={formatDate(employee.hireDate)} />
              <InfoRow
                label="Status"
                value={
                  <span
                    className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusBadgeClass(employee.status)}`}
                  >
                    {statusLabel(employee.status)}
                  </span>
                }
              />
            </InfoCard>

            {/* Compensation */}
            <InfoCard title="Compensation">
              <InfoRow
                label="Basic Salary"
                value={
                  <span className="font-semibold">{formatKES(employee.basicSalary)}</span>
                }
              />
              <InfoRow label="Currency" value={employee.currency} />
            </InfoCard>

            {/* Payment Method */}
            <InfoCard title="Payment Method">
              <InfoRow label="Bank Name" value={employee.bankName ?? "—"} />
              <InfoRow label="Bank Account" value={employee.bankAccount ?? "—"} />
              <InfoRow label="M-Pesa Number" value={employee.mpesaNumber ?? "—"} />
            </InfoCard>

            {/* Statutory Numbers */}
            <InfoCard title="Statutory Numbers">
              <InfoRow label="NSSF Number" value={employee.nssfNumber ?? "—"} />
              <InfoRow label="SHIF Number" value={employee.shifNumber ?? "—"} />
            </InfoCard>
          </div>
        ) : null}
      </div>
    </div>
  );
}
