"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Clock } from "lucide-react";
import { PageHeader, PaginationBar, useCurrentUser } from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";

// Shape matches time-attendance AttendanceResponse (self-scoped via
// /api/v1/attendance/employees/{employeeId} — EMPLOYEE may read their own). Status is
// derived from the boolean flags the backend returns.
interface AttendanceRecord {
  id: string;
  attendanceDate: string;
  clockIn: string | null;
  clockOut: string | null;
  hoursWorked: number | null;
  late: boolean;
  absent: boolean;
  onLeave: boolean;
  holiday: boolean;
}

interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
}

type Status = "PRESENT" | "ABSENT" | "LATE" | "LEAVE" | "HOLIDAY";

function deriveStatus(r: AttendanceRecord): Status {
  if (r.absent) return "ABSENT";
  if (r.onLeave) return "LEAVE";
  if (r.holiday) return "HOLIDAY";
  if (r.late) return "LATE";
  return "PRESENT";
}

function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, string> = {
    PRESENT: "bg-brand-100 text-brand-800",
    ABSENT: "bg-red-100 text-red-700",
    LATE: "bg-amber-light text-amber-text",
    LEAVE: "bg-neutral-100 text-neutral-600",
    HOLIDAY: "bg-neutral-100 text-neutral-600",
  };
  const labels: Record<Status, string> = {
    PRESENT: "Present", ABSENT: "Absent", LATE: "Late", LEAVE: "On leave", HOLIDAY: "Holiday",
  };
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full ${map[status]}`}>
      {labels[status]}
    </span>
  );
}

function fmtTime(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleTimeString("en-KE", { hour: "numeric", minute: "2-digit", hour12: true });
}

export default function AttendancePage() {
  const currentUser = useCurrentUser();
  const employeeId = currentUser?.employeeId;
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  const { data, isLoading, isError } = useQuery<PagedResponse<AttendanceRecord>>({
    queryKey: ["attendance", employeeId, page, pageSize],
    queryFn: () =>
      apiClient
        .get(`/api/v1/attendance/employees/${employeeId}?page=${page}&size=${pageSize}`)
        .then((r) => r.data),
    enabled: !!employeeId,
  });

  const records = data?.content ?? [];
  const present = records.filter((r) => deriveStatus(r) === "PRESENT").length;
  const absent = records.filter((r) => deriveStatus(r) === "ABSENT").length;
  const late = records.filter((r) => deriveStatus(r) === "LATE").length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader title="Attendance" subtitle="Your clock-in and clock-out records" />

      <div className="flex-1 min-h-0 overflow-y-auto px-8 py-8 space-y-5">
        {!employeeId && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-neutral-200 rounded-xl">
            <Clock size={36} className="text-neutral-200 mb-3" strokeWidth={1.5} />
            <p className="text-[14px] font-semibold text-neutral-400">No attendance</p>
            <p className="text-[13px] text-neutral-300 mt-1">This account isn’t linked to an employee record.</p>
          </div>
        ) : (
        <>
        {isError && (
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-5 py-3.5 text-[13px] text-red-700">
            <AlertTriangle size={15} className="flex-shrink-0" />
            Could not load attendance records.
          </div>
        )}

        {/* Summary chips */}
        {!isLoading && records.length > 0 && (
          <div className="flex gap-3 flex-wrap">
            {[
              { label: "Present", count: present, color: "bg-brand-100 text-brand-800" },
              { label: "Absent", count: absent, color: "bg-red-100 text-red-700" },
              { label: "Late", count: late, color: "bg-amber-light text-amber-text" },
            ].map(({ label, count, color }) => (
              <div key={label} className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12.5px] font-semibold ${color}`}>
                {label}: <span className="font-bold">{count}</span>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="space-y-0">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="px-6 py-4 border-b border-neutral-50 flex items-center gap-3">
                  <div className="h-3 w-24 bg-neutral-100 rounded-full animate-pulse"/>
                  <div className="h-2 w-16 bg-neutral-100 rounded-full animate-pulse ml-auto"/>
                  <div className="h-2 w-16 bg-neutral-100 rounded-full animate-pulse"/>
                  <div className="h-5 w-14 bg-neutral-100 rounded-full animate-pulse"/>
                </div>
              ))}
            </div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Clock size={36} className="text-neutral-200 mb-3" strokeWidth={1.5} />
              <p className="text-[14px] font-semibold text-neutral-400">No attendance records yet</p>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-100">
                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">Date</th>
                    <th className="px-6 py-3 text-right text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">Clock In</th>
                    <th className="px-6 py-3 text-right text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">Clock Out</th>
                    <th className="px-6 py-3 text-right text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">Hours</th>
                    <th className="px-6 py-3 text-right text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50">
                      <td className="px-6 py-3.5 text-[13.5px] font-medium text-near-black">
                        {new Date(r.attendanceDate).toLocaleDateString("en-KE", { weekday: "short", month: "short", day: "numeric" })}
                      </td>
                      <td className="px-6 py-3.5 text-right text-[13px] text-neutral-500">{fmtTime(r.clockIn)}</td>
                      <td className="px-6 py-3.5 text-right text-[13px] text-neutral-500">{fmtTime(r.clockOut)}</td>
                      <td className="px-6 py-3.5 text-right text-[13px] font-semibold text-neutral-700">
                        {r.hoursWorked != null ? `${Number(r.hoursWorked).toFixed(1)}h` : "—"}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <StatusBadge status={deriveStatus(r)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-6 py-4 border-t border-neutral-100">
                <PaginationBar
                  currentPage={page}
                  totalPages={data?.totalPages ?? 0}
                  totalCount={data?.totalElements ?? 0}
                  pageSize={pageSize}
                  itemLabel="records"
                  onPageChange={setPage}
                  onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
                />
              </div>
            </>
          )}
        </div>
        </>
        )}
      </div>
    </div>
  );
}
