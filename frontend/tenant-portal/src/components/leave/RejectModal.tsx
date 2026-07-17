"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BaseModal, useToast } from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";
import type { AxiosError } from "axios";
import {
  type LeaveRequest,
  leaveTypeLabel,
  formatDateRange,
} from "./types";

interface RejectModalProps {
  request: LeaveRequest;
  onClose: () => void;
}

export function RejectModal({ request, onClose }: RejectModalProps) {
  const [notes, setNotes] = useState("");
  const queryClient = useQueryClient();
  const toast = useToast();

  const mutation = useMutation<LeaveRequest, AxiosError<{ message?: string }>, void>({
    mutationFn: () =>
      apiClient
        // Backend is POST (not PATCH) and reads `rejectionReason` (@NotBlank), not `notes`.
        .post<LeaveRequest>(`/api/v1/leave/requests/${request.id}/reject`, {
          rejectionReason: notes.trim(),
        })
        .then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
      void queryClient.invalidateQueries({ queryKey: ["leave-request", request.id] });
      toast("Leave rejected", "success");
      onClose();
    },
    onError: (err) => {
      const msg =
        err.response?.data?.message ?? "Failed to reject leave request. Please try again.";
      toast(msg, "error");
    },
  });

  const canSubmit = notes.trim().length > 0 && !mutation.isPending;

  return (
    <BaseModal labelId="reject-leave-modal-title" onClose={onClose} className="max-w-none w-[480px]">
      <div>
        <h2
          id="reject-leave-modal-title"
          className="text-[16px] font-bold text-neutral-900 mb-1"
        >
          Reject Leave Request
        </h2>
        <p className="text-[13px] text-neutral-500 mb-5">
          You are rejecting a leave request from{" "}
          <span className="font-semibold text-near-black">{request.employeeName}</span>. A reason
          is required.
        </p>

        {/* Summary */}
        <div className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3.5 mb-5 grid grid-cols-2 gap-y-2.5 gap-x-4 text-[13px]">
          <div>
            <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide mb-0.5">
              Leave Type
            </p>
            <p className="text-near-black font-medium">{leaveTypeLabel(request.leaveType)}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide mb-0.5">
              Days
            </p>
            <p className="text-near-black font-medium">{request.totalDays}</p>
          </div>
          <div className="col-span-2">
            <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide mb-0.5">
              Dates
            </p>
            <p className="text-near-black font-medium">
              {formatDateRange(request.startDate, request.endDate)}
            </p>
          </div>
        </div>

        {/* Required reason */}
        <div className="mb-6">
          <label
            htmlFor="reject-notes"
            className="block text-[12.5px] font-semibold text-neutral-600 mb-1.5"
          >
            Reason for rejection{" "}
            <span className="text-red-500">*</span>
          </label>
          <textarea
            id="reject-notes"
            rows={4}
            maxLength={500}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Explain why this leave request is being rejected…"
            className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-[13px] text-near-black placeholder:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 resize-none"
          />
          <p className="text-right text-[11px] text-neutral-400 mt-1">{notes.length}/500</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={mutation.isPending}
            className="flex-1 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-semibold text-[13.5px] py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => mutation.mutate()}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-[13.5px] py-2.5 rounded-lg transition-colors"
          >
            {mutation.isPending ? "Rejecting…" : "Reject Leave"}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
