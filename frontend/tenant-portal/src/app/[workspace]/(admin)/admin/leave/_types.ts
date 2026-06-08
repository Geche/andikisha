// ─── Shared leave types ───────────────────────────────────────────────────────

export type LeaveType =
  | "ANNUAL"
  | "SICK"
  | "MATERNITY"
  | "PATERNITY"
  | "EMERGENCY"
  | "UNPAID"
  | "STUDY";

export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface LeaveRequest {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  employeeNumber: string;
  leaveType: LeaveType;
  status: LeaveStatus;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function leaveTypeLabel(type: LeaveType): string {
  switch (type) {
    case "ANNUAL":
      return "Annual Leave";
    case "SICK":
      return "Sick Leave";
    case "MATERNITY":
      return "Maternity Leave";
    case "PATERNITY":
      return "Paternity Leave";
    case "EMERGENCY":
      return "Emergency Leave";
    case "UNPAID":
      return "Unpaid Leave";
    case "STUDY":
      return "Study Leave";
  }
}

export function statusBadgeClass(status: LeaveStatus): string {
  switch (status) {
    case "PENDING":
      return "bg-amber-light text-amber-text";
    case "APPROVED":
      return "bg-brand-100 text-brand-800";
    case "REJECTED":
      return "bg-red-100 text-red-700";
    case "CANCELLED":
      return "bg-neutral-100 text-neutral-400";
  }
}

export function statusLabel(status: LeaveStatus): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** "15 May – 20 May 2026" */
export function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const sameYear = s.getFullYear() === e.getFullYear();

  const startStr = s.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
  });
  const endStr = e.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return `${startStr} – ${endStr}`;
}
