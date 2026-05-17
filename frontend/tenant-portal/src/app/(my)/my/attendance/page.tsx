"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Clock } from "lucide-react";
import { PageHeader } from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";

interface AttendanceRecord {
  id: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  hoursWorked: number | null;
  status: "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY";
}

interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
}

const MONTH_OPTIONS = Array.from({ length: 6 }, (_, i) => {
  const d = new Date();
  d.setMonth(d.getMonth() - i);
  return {
    value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
    label: d.toLocaleDateString("en-KE", { month: "long", year: "numeric" }),
  };
});

function StatusBadge({ status }: { status: AttendanceRecord["status"] }) {
  const map: Record<string, string> = {
    PRESENT: "bg-brand-100 text-brand-800",
    ABSENT: "bg-red-100 text-red-700",
    LATE: "bg-amber-light text-amber-text",
    HALF_DAY: "bg-blue-50 text-blue-700",
  };
  const labels: Record<string, string> = {
    PRESENT: "Present",
    ABSENT: "Absent",
    LATE: "Late",
    HALF_DAY: "Half Day",
  };
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full ${map[status]}`}>
      {labels[status]}
    </span>
  );
}

function fmt12(time: string | null) {
  if (!time) return "—";
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${((h % 12) || 12)}:${String(m).padStart(2, "0")} ${ampm}`;
}

export default function AttendancePage() {
  const [month, setMonth] = useState(MONTH_OPTIONS[0].value);
  const [page, setPage] = useState(0);

  const { data, isLoading, isError } = useQuery<PagedResponse<AttendanceRecord>>({
    queryKey: ["attendance", month, page],
    queryFn: () =>
      apiClient
        .get(`/api/v1/attendance/my?month=${month}&page=${page}&size=25&sort=date,desc`)
        .then((r) => r.data),
  });

  const records = data?.content ?? [];
  const present = records.filter((r) => r.status === "PRESENT").length;
  const absent = records.filter((r) => r.status === "ABSENT").length;
  const late = records.filter((r) => r.status === "LATE").length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Attendance"
        subtitle="Your clock-in and clock-out records"
        actions={
          <select
            value={month}
            onChange={(e) => { setMonth(e.target.value); setPage(0); }}
            className="border border-neutral-200 rounded-lg px-3 py-2 text-[13px] text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900"
          >
            {MONTH_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        }
      />

      <div className="flex-1 overflow-y-auto px-8 py-8 flex flex-col gap-5">
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
              <p className="text-[14px] font-semibold text-neutral-400">No records for this month</p>
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
                        {new Date(r.date).toLocaleDateString("en-KE", { weekday: "short", month: "short", day: "numeric" })}
                      </td>
                      <td className="px-6 py-3.5 text-right text-[13px] text-neutral-500">{fmt12(r.clockIn)}</td>
                      <td className="px-6 py-3.5 text-right text-[13px] text-neutral-500">{fmt12(r.clockOut)}</td>
                      <td className="px-6 py-3.5 text-right text-[13px] font-semibold text-neutral-700">
                        {r.hoursWorked != null ? `${r.hoursWorked.toFixed(1)}h` : "—"}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <StatusBadge status={r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(data?.totalPages ?? 0) > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100">
                  <p className="text-[12px] text-neutral-400">Page {page + 1} of {data?.totalPages}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="text-[12px] font-semibold text-neutral-500 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 border border-neutral-200 rounded-lg"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page + 1 >= (data?.totalPages ?? 1)}
                      className="text-[12px] font-semibold text-neutral-500 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 border border-neutral-200 rounded-lg"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
