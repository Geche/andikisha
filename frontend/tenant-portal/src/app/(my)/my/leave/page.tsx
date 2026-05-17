"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, AlertTriangle, Calendar } from "lucide-react";
import { PageHeader } from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";
import { ApiError } from "@/lib/auth";

interface LeaveRequest {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  days: number;
  createdAt: string;
}

interface LeaveBalance {
  leaveType: string;
  balance: number;
  used: number;
  total: number;
}

const LEAVE_TYPES = [
  { value: "ANNUAL", label: "Annual Leave" },
  { value: "SICK", label: "Sick Leave" },
  { value: "MATERNITY", label: "Maternity Leave" },
  { value: "PATERNITY", label: "Paternity Leave" },
  { value: "UNPAID", label: "Unpaid Leave" },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    APPROVED: "bg-brand-100 text-brand-800",
    PENDING: "bg-amber-light text-amber-text",
    REJECTED: "bg-red-100 text-red-700",
    CANCELLED: "bg-neutral-100 text-neutral-500",
  };
  const cls = map[status] ?? "bg-neutral-100 text-neutral-500";
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full ${cls}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

const INPUT = "w-full border border-neutral-300 rounded-lg px-3.5 py-2.5 text-[13.5px] text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 placeholder:text-neutral-400";

function ApplyModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    leaveType: "ANNUAL",
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: (data: typeof form) =>
      apiClient.post("/api/v1/leave/requests", data).then((r) => r.data),
    onSuccess: () => { onSuccess(); onClose(); },
    onError: (err: unknown) => {
      setError(err instanceof ApiError ? err.message : "Failed to submit leave request");
    },
  });

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-[18px] font-bold text-near-black mb-6">Apply for Leave</h2>

        <form
          onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }}
          className="space-y-4"
        >
          <div>
            <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">Leave Type</label>
            <select
              value={form.leaveType}
              onChange={(e) => setForm((f) => ({ ...f, leaveType: e.target.value }))}
              className={INPUT}
            >
              {LEAVE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                required
                min={new Date().toISOString().slice(0, 10)}
                className={INPUT}
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">End Date</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                required
                min={form.startDate || new Date().toISOString().slice(0, 10)}
                className={INPUT}
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">Reason</label>
            <textarea
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              placeholder="Brief reason for leave…"
              rows={3}
              className={`${INPUT} resize-none`}
            />
          </div>

          {error && (
            <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-neutral-200 text-neutral-600 font-semibold text-[13.5px] h-10 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 bg-brand-900 hover:bg-brand-950 disabled:opacity-50 text-white font-semibold text-[13.5px] h-10 rounded-lg transition-colors"
            >
              {mutation.isPending ? "Submitting…" : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LeavePage() {
  const [applying, setApplying] = useState(false);
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading, isError } = useQuery<LeaveRequest[]>({
    queryKey: ["leave-requests"],
    queryFn: () =>
      apiClient.get("/api/v1/leave/requests?size=50&sort=createdAt,desc")
        .then((r) => r.data?.content ?? r.data ?? []),
  });

  const { data: balances = [] } = useQuery<LeaveBalance[]>({
    queryKey: ["leave-balances"],
    queryFn: () => apiClient.get("/api/v1/leave/balances").then((r) => r.data),
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Leave"
        subtitle="Manage your leave requests"
        actions={
          <button
            onClick={() => setApplying(true)}
            className="flex items-center gap-1.5 bg-brand-900 hover:bg-brand-950 text-white font-semibold text-[13.5px] h-9 px-3.5 rounded-lg transition-colors"
          >
            <Plus size={15} strokeWidth={2.5} /> Apply for Leave
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto px-8 py-8 flex flex-col gap-5">
        {isError && (
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-5 py-3.5 text-[13px] text-red-700">
            <AlertTriangle size={15} className="flex-shrink-0" />
            Could not load leave data.
          </div>
        )}

        {/* Balances */}
        {balances.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {balances.map((b) => (
              <div key={b.leaveType} className="bg-white border border-neutral-200 rounded-xl px-5 py-4">
                <p className="text-[12px] font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                  {b.leaveType.charAt(0) + b.leaveType.slice(1).toLowerCase()}
                </p>
                <p className="text-[26px] font-bold text-neutral-900 leading-none">{b.balance}</p>
                <p className="text-[12px] text-neutral-400 mt-1.5">{b.used} used · {b.total} total</p>
              </div>
            ))}
          </div>
        )}

        {/* Requests table */}
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="space-y-0">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-6 py-4 border-b border-neutral-50 flex items-center gap-3">
                  <div className="w-9 h-9 bg-neutral-100 rounded-xl animate-pulse"/>
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-28 bg-neutral-100 rounded-full animate-pulse"/>
                    <div className="h-2 w-40 bg-neutral-100 rounded-full animate-pulse"/>
                  </div>
                  <div className="h-5 w-16 bg-neutral-100 rounded-full animate-pulse"/>
                </div>
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Calendar size={36} className="text-neutral-200 mb-3" strokeWidth={1.5} />
              <p className="text-[14px] font-semibold text-neutral-400">No leave requests yet</p>
              <p className="text-[13px] text-neutral-300 mt-1">Click &ldquo;Apply for Leave&rdquo; to submit your first request</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-100">
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">Type</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">Dates</th>
                  <th className="px-6 py-3 text-right text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">Days</th>
                  <th className="px-6 py-3 text-right text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 text-[13.5px] font-medium text-near-black capitalize">
                      {r.leaveType.toLowerCase().replace(/_/g, " ")}
                    </td>
                    <td className="px-6 py-4 text-[13px] text-neutral-500">
                      {r.startDate} → {r.endDate}
                    </td>
                    <td className="px-6 py-4 text-right text-[13px] font-semibold text-neutral-700">
                      {r.days}d
                    </td>
                    <td className="px-6 py-4 text-right">
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {applying && (
        <ApplyModal
          onClose={() => setApplying(false)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ["leave-requests"] })}
        />
      )}
    </div>
  );
}
